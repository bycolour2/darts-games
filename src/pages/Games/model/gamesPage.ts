import { attach, createEvent, restore, sample } from 'effector';
import { RouteParamsAndQuery, chainRoute } from 'atomic-router';
import { routes } from '~/shared/config';
import {
  deleteLobbyRequestFx,
  getGamesRequestFx,
  getLobbiesRequestFx,
} from '~/shared/api/supabaseApi';
import { sessionModel } from '~/shared/session';
import { combineEvents } from 'patronum';
import { createGate } from 'effector-react';
import { gamesListModel } from '~/widgets/GamesList';

// const getGamesFx = attach({ effect: getGamesRequestFx });
const getLobbyFx = attach({ effect: getLobbiesRequestFx });
const deleteLobbyFx = attach({ effect: deleteLobbyRequestFx });

export const currentRoute = routes.games.base;
export const authorizedRoute = sessionModel.chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});

export const pageLoaded = createEvent<RouteParamsAndQuery<object>>();

sample({ clock: pageLoaded, target: gamesListModel.getGamesFx });

const dataLoaded = combineEvents({
  events: [gamesListModel.getGamesFx.doneData /*, getLobbyFx.doneData*/],
});

// sample({ clock: pageLoaded, target: getLobbyFx });

export const allDataLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: pageLoaded,
  openOn: dataLoaded,
});

// export const deleteLobbyButtonClicked = createEvent<{ lobbyId: string }>();

// export const $lobbies = restore(getLobbyFx, []);

// sample({
//   clock: deleteLobbyButtonClicked,
//   target: deleteLobbyFx,
// });

// sample({
//   clock: deleteLobbyFx.done,
//   source: { lobbies: $lobbies },
//   fn: ({ lobbies }, { params }) => lobbies.filter((lobby) => lobby.id !== params.lobbyId),
//   target: $lobbies,
// });
