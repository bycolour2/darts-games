import { RouteParamsAndQuery, chainRoute } from 'atomic-router';
import { createEvent, sample } from 'effector';
import { combineEvents } from 'patronum';

import { routes } from '~/shared/config';
import { sessionModel } from '~/shared/session';

import { gamesListModel } from '~/entities/game';
import { lobbyListModel } from '~/entities/lobby';

export const currentRoute = routes.games.base;
export const authorizedRoute = sessionModel.chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});

export const pageLoaded = createEvent<RouteParamsAndQuery<object>>();

sample({ clock: pageLoaded, target: gamesListModel.getGamesFx });
sample({ clock: pageLoaded, target: lobbyListModel.getLobbiesFx });

const dataLoaded = combineEvents({
  events: [gamesListModel.getGamesFx.doneData, lobbyListModel.getLobbiesFx.doneData],
});

export const allDataLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: pageLoaded,
  openOn: dataLoaded,
});
