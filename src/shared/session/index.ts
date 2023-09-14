import {
  RouteParams,
  RouteInstance,
  RouteParamsAndQuery,
  chainRoute,
  redirect,
} from 'atomic-router';
import { Effect, Event, attach, createEvent, createStore, sample } from 'effector';
import { debug, reset } from 'patronum';
import { routes } from '../config';
import { ExtendedSBSession, getSessionSBRequestFx } from '../api/supabaseApi';

enum AuthStatus {
  Initial = 0,
  Pending,
  Anonymous,
  Authenticated,
}

// export const sessionRequestFx = attach({ effect: api.sessionGetFx });
export const sessionRequestFx = attach({ effect: getSessionSBRequestFx });

// export const tokenReceived = createEvent<string>();
// export const tokenEraised = createEvent<void>();
// export const sessionEnded = createEvent<void>();

export const $session = createStore<ExtendedSBSession | null>(null);
// export const $token = createStore("");
export const $authenticationStatus = createStore(AuthStatus.Initial);

$authenticationStatus.on(sessionRequestFx, (status) => {
  if (status === AuthStatus.Initial) return AuthStatus.Pending;
  return status;
});

$session.on(sessionRequestFx.doneData, (_, session) => session);

// $token.on(tokenReceived, (token) => token);
// $token.reset(tokenEraised);

$authenticationStatus.on(sessionRequestFx.doneData, () => AuthStatus.Authenticated);
$authenticationStatus.on(sessionRequestFx.fail, () => AuthStatus.Anonymous);
// $authenticationStatus.on(sessionEnded, () => AuthStatus.Anonymous);

// debug(sessionEnded, $session, $token, $authenticationStatus);
// debug($session, $authenticationStatus);

// sample({
//   clock: sessionEnded,
//   fn: () => {
//     localStorage.removeItem("token");
//   },
//   target: redirect({ route: routes.auth.login }),
// });

// reset({
//   clock: sessionEnded,
//   target: $session,
// });

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
    target: sessionRequestFx,
  });

  sample({
    clock: [alreadyAnonymous, sessionRequestFx.fail],
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
    openOn: [alreadyAuthenticated, sessionRequestFx.done],
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
    target: sessionRequestFx,
  });

  sample({
    clock: [alreadyAuthenticated, sessionRequestFx.done],
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
    openOn: [alreadyAnonymous, sessionRequestFx.fail],
    cancelOn: [sessionRecivedAuthenticated],
  });
}
