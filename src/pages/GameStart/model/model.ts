import { attach, createEvent, restore, createStore, sample } from 'effector';
import { RouteParamsAndQuery, chainRoute, redirect } from 'atomic-router';
import { routes } from '~/shared/config';
import { sessionModel } from '~/shared/session';
import {
  Game,
  NotSBUser,
  createKDLobbySettingRequestFx,
  createKDPlayerDetailsRequestFx,
  createLobbyRequestFx,
  getGameRequestFx,
  getStagesByGameIdRequestFx,
  getUsersRequestFx,
} from '~/shared/api/supabaseApi';
import { combineEvents, reset } from 'patronum';
import { createForm } from 'effector-forms';

const getGameFx = attach({ effect: getGameRequestFx });
const getUsersFx = attach({ effect: getUsersRequestFx });
const getStagesFx = attach({ effect: getStagesByGameIdRequestFx });
const postLobbyFx = attach({ effect: createLobbyRequestFx });
const postPlayerKDDetailsFx = attach({ effect: createKDPlayerDetailsRequestFx });
const postLobbyKDSettingsFx = attach({ effect: createKDLobbySettingRequestFx });

export const currentRoute = routes.games.start;
export const authorizedRoute = sessionModel.chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});

const pageLoaded = createEvent<RouteParamsAndQuery<{ gameId: string }>>();

const dataLoaded = combineEvents({
  events: [getGameFx.doneData, getStagesFx.doneData, getUsersFx.doneData],
});

sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ gameId: params.gameId }),
  target: getGameFx,
});
sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ gameId: params.gameId }),
  target: getStagesFx,
});
sample({ clock: pageLoaded, target: getUsersFx });

export const allDataLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: pageLoaded,
  openOn: dataLoaded,
});

export const userSelectionToggled = createEvent<NotSBUser>();
export const startGameButtonPressed = createEvent();

export const $game = restore(getGameFx, {} as Game);
export const $users = restore(getUsersFx, []);
export const $selectedUsers = createStore<NotSBUser[]>([]);
export const $stages = restore(getStagesFx, []);

export const lobbySettingsForm = createForm({
  fields: {
    lifeCount: {
      init: '3',
      rules: [
        {
          name: 'number',
          validator: (value: string) => !Number.isInteger(value),
        },
        {
          name: 'min',
          validator: (value: string) => +value >= 3,
        },
        {
          name: 'max',
          validator: (value: string) => +value <= 6,
        },
      ],
      // filter: (value: string) => /^[+]?\d+([.]\d+)?$/.test(value),
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

export const $gameStartPending = postLobbyFx.pending;
const $redirectParams = createStore({ gameId: '', lobbyId: '' });

reset({
  clock: currentRoute.opened,
  target: [$selectedUsers, $redirectParams],
});

sample({
  clock: currentRoute.opened,
  target: lobbySettingsForm.resetValues,
});

sample({
  clock: userSelectionToggled,
  source: { game: $game, selectedUsers: $selectedUsers },
  fn: ({ game, selectedUsers }, user) => {
    if (selectedUsers.includes(user)) {
      return selectedUsers.filter((selectedUser) => selectedUser.id !== user.id);
    }
    if (selectedUsers.length !== game.maxPlayers) {
      return [...selectedUsers, user];
    }
    alert('Max players reached!');
    return selectedUsers;
  },
  target: $selectedUsers,
});

sample({
  clock: startGameButtonPressed,
  source: { game: $game, users: $selectedUsers, stages: $stages },
  fn: ({ game, users, stages }) => ({
    gameId: game.id,
    users,
    stageId: stages.find((stage) => stage.order === 1)!.id,
  }),
  target: postLobbyFx,
});

sample({
  clock: postLobbyFx.doneData,
  source: { lobbySettingsForm: lobbySettingsForm.$values },
  fn: ({ lobbySettingsForm }, lobby) => {
    return {
      lobbyId: lobby.id,
      lifeCount: +lobbySettingsForm.lifeCount,
      hasAdditionalLife: lobbySettingsForm.hasAdditionalLife,
      additionalLifeRule: lobbySettingsForm.additionalLifeRule,
    };
  },
  target: postLobbyKDSettingsFx,
});

sample({
  clock: postLobbyFx.doneData,
  source: { lobbySettingsForm: lobbySettingsForm.$values },
  fn: ({ lobbySettingsForm }, lobby) =>
    lobby.users.map((user) => ({
      lobbyId: lobby.id,
      userId: user.id,
      username: user.username,
      firstScore: null,
      sector: null,
      isKiller: false,
      lifeCount: +lobbySettingsForm.lifeCount,
      isDead: false,
      order: 0,
    })),
  target: postPlayerKDDetailsFx,
});

const allLobbyRequestsDone = combineEvents({
  events: [
    postLobbyFx.doneData,
    postLobbyKDSettingsFx.doneData,
    postPlayerKDDetailsFx.doneData,
  ],
});

sample({
  clock: postLobbyFx.doneData,
  source: { game: $game },
  fn: ({ game }, { id }) => ({ gameId: game.id, lobbyId: id }),
  target: $redirectParams,
});

redirect({
  clock: allLobbyRequestsDone,
  params: $redirectParams,
  route: routes.games.game,
});
