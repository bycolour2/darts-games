import { attach, createEffect, createEvent, restore, sample } from 'effector';
import { RouteParamsAndQuery, chainRoute } from 'atomic-router';
import { routes } from '~/shared/config';
import { getGamesRequestFx, getLobbiesRequestFx } from '~/shared/api/supabaseApi';
import { chainAuthorized } from '~/shared/session';
import { combineEvents } from 'patronum';

const gamesGetFx = attach({ effect: getGamesRequestFx });
const lobbiesGetFx = attach({ effect: getLobbiesRequestFx });

export const currentRoute = routes.games.base;
const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});

const pageLoaded = createEvent<RouteParamsAndQuery<{}>>();

const dataLoaded = combineEvents({
  events: [gamesGetFx.doneData, lobbiesGetFx.doneData],
});

sample({ clock: pageLoaded, target: gamesGetFx });
sample({ clock: pageLoaded, target: lobbiesGetFx });

export const allDataLoaded = chainRoute({
  route: authorizedRoute,
  beforeOpen: pageLoaded,
  openOn: dataLoaded,
});

// const gamesLoadedRoute = chainRoute({
//   route: authorizedRoute,
//   beforeOpen: {
//     effect: gamesGetFx,
//     mapParams: () => {},
//   },
//   openOn: gamesGetFx.done,
// });

// export const lobbiesLoadedRoute = chainRoute({
//   route: gamesLoadedRoute,
//   beforeOpen: {
//     effect: lobbiesGetFx,
//     mapParams: () => {},
//   },
//   openOn: lobbiesGetFx.done,
// });

export const $games = restore(gamesGetFx, []);
export const $lobbies = restore(lobbiesGetFx, []);
