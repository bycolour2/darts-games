import { attach, createEvent, restore, createStore, sample } from 'effector';
import { chainRoute, redirect } from 'atomic-router';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';
import {
  Game,
  NotSBUser,
  createKDLobbySettingRequestFx,
  createKDPlayerDetailsRequestFx,
  createLobbyRequestFx,
  getGameRequestFx,
  getUsersRequestFx,
} from '~/shared/api/supabaseApi';
import { reset } from 'patronum';
import { createForm } from 'effector-forms';

const gameGetFx = attach({ effect: getGameRequestFx });
const usersGetFx = attach({ effect: getUsersRequestFx });
const lobbyPostFx = attach({ effect: createLobbyRequestFx });
const playerKDDetailsPostFx = attach({ effect: createKDPlayerDetailsRequestFx });
const lobbyKDSettingsPostFx = attach({ effect: createKDLobbySettingRequestFx });

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
export const createLobbyButtonPressed = createEvent();

export const $game = restore(gameGetFx, {} as Game);
export const $users = restore(usersGetFx, []);
export const $selectedUsers = createStore<NotSBUser[]>([]);

export const lobbySettingsForm = createForm({
  fields: {
    lifeCount: {
      init: '3',
      rules: [
        {
          name: 'number',
          validator: (value: string) => Number.isInteger(value),
        },
      ],
      filter: (value: string) => /^[+]?\d+([.]\d+)?$/.test(value),
    },
    hasAdditionalLife: {
      init: false,
    },
    additionalLifeRule: {
      init: 'frags',
      rules: [
        {
          name: 'empty',
          validator: (value: string) => value.trim() !== '',
        },
      ],
    },
  },
  validateOn: ['change'],
});

// sample({
//   clock: lobbySettingsForm.formValidated,
//   fn: (value) => console.log(value),
//   // TODO add effect of creating DB record
// });

export const $gameStartPending = lobbyPostFx.pending;
const $redirectParams = createStore({ gameId: '', lobbyId: '' });

reset({
  clock: currentRoute.closed,
  target: [$game, $users, $selectedUsers, $redirectParams],
});

sample({
  source: { game: $game, selectedUsers: $selectedUsers },
  clock: userToggled,
  fn: ({ game, selectedUsers }, user) => {
    if (selectedUsers.includes(user)) {
      console.log('Has user');
      return selectedUsers.filter((selectedUser) => selectedUser.id !== user.id);
    }
    if (selectedUsers.length !== game.maxPlayers) {
      console.log("Doesn't have user");
      return [...selectedUsers, user];
    }
    alert('Max players reached!');
    return selectedUsers;
  },
  target: $selectedUsers,
});

sample({
  source: { game: $game, users: $selectedUsers },
  clock: createLobbyButtonPressed,
  fn: ({ game, users }) => ({ gameId: game.id, gameName: game.name, users }),
  target: lobbyPostFx,
});

sample({
  clock: lobbyPostFx.doneData,
  fn: (lobby) =>
    lobby.users.map((user) => ({
      lobbyId: lobby.id,
      userId: user.id,
      username: user.username,
      firstScore: null,
      sector: null,
      isKiller: false,
      lifeCount: 3,
      isDead: false,
      order: 0,
    })),
  target: playerKDDetailsPostFx,
});

sample({
  source: { lobbySettingsForm: lobbySettingsForm.$values },
  clock: playerKDDetailsPostFx.done,
  fn: ({ lobbySettingsForm }, { params }) => {
    return {
      lobbyId: params[0].lobbyId,
      lifeCount: +lobbySettingsForm.lifeCount,
      hasAdditionalLife: lobbySettingsForm.hasAdditionalLife,
      additionalLifeRule: lobbySettingsForm.additionalLifeRule,
    };
  },
  target: lobbyKDSettingsPostFx,
});

sample({
  source: { game: $game },
  clock: lobbyPostFx.doneData,
  fn: ({ game }, { id }) => ({ gameId: game.id, lobbyId: id }),
  target: $redirectParams,
});

redirect({
  clock: lobbyPostFx.doneData,
  params: $redirectParams,
  route: routes.games.game,
});
