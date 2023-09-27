import {
  RouteParams,
  RouteInstance,
  RouteParamsAndQuery,
  chainRoute,
  redirect,
} from 'atomic-router';
import { Effect, Event, attach, createEvent, createStore, sample } from 'effector';
import {
  ExtendedSBSession,
  getSessionSBRequestFx,
  signOutSBRequestFx,
} from '../api/supabaseApi';
import { reset } from 'patronum';
import { routes } from '../config';

enum AuthStatus {
  Initial = 0,
  Pending,
  Anonymous,
  Authenticated,
}

export const getSessionFx = attach({ effect: getSessionSBRequestFx });
export const signOutFx = attach({ effect: signOutSBRequestFx });

export const sessionEnded = createEvent<void>();

export const $session = createStore<ExtendedSBSession | null>(null);
export const $authenticationStatus = createStore(AuthStatus.Initial);

$authenticationStatus.on(getSessionFx, (status) => {
  if (status === AuthStatus.Initial) return AuthStatus.Pending;
  return status;
});

$session.on(getSessionFx.doneData, (_, session) => session);

$authenticationStatus.on(getSessionFx.doneData, () => AuthStatus.Authenticated);
$authenticationStatus.on(getSessionFx.fail, () => AuthStatus.Anonymous);
$authenticationStatus.on(signOutFx.done, () => AuthStatus.Anonymous);

// debug(sessionEnded, $session, $token, $authenticationStatus);
// debug($session, $authenticationStatus);

sample({
  clock: sessionEnded,
  target: signOutFx,
});

redirect({
  clock: signOutFx.done,
  route: routes.auth.login,
});

reset({
  clock: signOutFx.done,
  target: $session,
});

interface ChainParams {
  otherwise?: Event<void> | Effect<void, any, any>;
}

export function chainAuthorized<Params extends RouteParams>(
  route: RouteInstance<Params>,
  { otherwise }: ChainParams = {},
) {
  const sessionCheckStarted = createEvent<RouteParamsAndQuery<Params>>();
  const sessionRecivedAnonymous = createEvent<RouteParamsAndQuery<Params>>();

  const alreadyAuthenticated = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Authenticated,
  });

  const alreadyAnonymous = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Anonymous,
  });

  sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Initial,
    target: getSessionFx,
  });

  sample({
    clock: [alreadyAnonymous, getSessionFx.fail],
    source: { params: route.$params, query: route.$query },
    filter: route.$isOpened,
    target: sessionRecivedAnonymous,
  });

  if (otherwise) {
    sample({
      clock: sessionRecivedAnonymous,
      target: otherwise as Event<void>,
    });
  }

  return chainRoute({
    route,
    beforeOpen: sessionCheckStarted,
    openOn: [alreadyAuthenticated, getSessionFx.done],
    cancelOn: [sessionRecivedAnonymous],
  });
}

export function chainAnonymous<Params extends RouteParams>(
  route: RouteInstance<Params>,
  { otherwise }: ChainParams = {},
) {
  const sessionCheckStarted = createEvent<RouteParamsAndQuery<Params>>();
  const sessionRecivedAuthenticated = createEvent<RouteParamsAndQuery<Params>>();

  const alreadyAuthenticated = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Authenticated,
  });

  const alreadyAnonymous = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Anonymous,
  });

  sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Initial,
    target: getSessionFx,
  });

  sample({
    clock: [alreadyAuthenticated, getSessionFx.done],
    source: { params: route.$params, query: route.$query },
    filter: route.$isOpened,
    target: sessionRecivedAuthenticated,
  });

  if (otherwise) {
    sample({
      clock: sessionRecivedAuthenticated,
      target: otherwise as Event<void>,
    });
  }

  return chainRoute({
    route,
    beforeOpen: sessionCheckStarted,
    openOn: [alreadyAnonymous, getSessionFx.fail],
    cancelOn: [sessionRecivedAuthenticated],
  });
}
