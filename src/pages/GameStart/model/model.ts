import { attach, createEvent, restore, createStore, sample } from 'effector';
import { chainRoute, redirect } from 'atomic-router';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';
import {
  Game,
  NotSBUser,
  createLobbyKDDetailsRequestFx,
  createLobbyRequestFx,
  getGameRequestFx,
  getUsersRequestFx,
} from '~/shared/api/supabaseApi';

const gameGetFx = attach({ effect: getGameRequestFx });
const usersGetFx = attach({ effect: getUsersRequestFx });
const lobbyCreateFx = attach({ effect: createLobbyRequestFx });
const lobbyKDDetailsCreateFx = attach({ effect: createLobbyKDDetailsRequestFx });

export const currentRoute = routes.games.start;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});
export const gameLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: {
    effect: gameGetFx,
    mapParams: ({ params }) => params.gameId,
  },
});

export const usersLoadedRoute = chainRoute({
  route: gameLoadedRoute,
  beforeOpen: {
    effect: usersGetFx,
    mapParams: () => {},
  },
  // openOn: usersGetFx.done,
});

export const userToggled = createEvent<NotSBUser>();
export const gameStarted = createEvent<NotSBUser[]>();
export const createLobbyButtonPressed = createEvent();

export const $game = restore(gameGetFx, {} as Game);
export const $users = restore(usersGetFx, []);
export const $selectedUsers = createStore<NotSBUser[]>([]);
export const $gameStartPending = lobbyCreateFx.pending;

$selectedUsers.on(userToggled, (selectedUsers, user) => {
  if (selectedUsers.includes(user)) {
    console.log('Has user');
    return selectedUsers.filter((selectedUser) => selectedUser.id !== user.id);
  }
  if (selectedUsers.length !== $game.getState().maxPlayers) {
    console.log("Doesn't have user");
    return [...selectedUsers, user];
  }
  alert('Max players reached!');
});

export const $gameName = $game.map((game) => game.name);
export const $redirectParams = createStore({ gameId: '', lobbyId: '' });

sample({
  source: { game: $game },
  clock: lobbyCreateFx.doneData,
  fn: ({ game }, { id }) => ({ gameId: game.id, lobbyId: id }),
  target: $redirectParams,
});

sample({
  source: { gameName: $gameName, users: $selectedUsers },
  clock: createLobbyButtonPressed,
  target: lobbyCreateFx,
});

redirect({
  clock: lobbyCreateFx.doneData,
  params: $redirectParams,
  route: routes.games.game,
});
