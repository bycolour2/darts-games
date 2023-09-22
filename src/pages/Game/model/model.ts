import { RouteParamsAndQuery, chainRoute } from 'atomic-router';
import { attach, createEvent, createStore, restore, sample } from 'effector';
import { combineEvents, debounce, debug, reset } from 'patronum';
import {
  createKDTurnRequestFx,
  getKDTurnsRequestFx,
  getKDPlayerDetailsRequestFx,
  getLobbyRequestFx,
  UserDetails,
  Lobby,
  getKDLobbySettingsRequestFx,
  KDLobbySettings,
  getStagesByGameIdRequestFx,
  updateLobbyStageRequestFx,
  upsertKDPlayerDetailsRequestFx,
  updateLobbyRequestFx,
} from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';

const getLobbyFx = attach({ effect: getLobbyRequestFx });
const getStagesFx = attach({ effect: getStagesByGameIdRequestFx });
const getPlayersKDDetailsFx = attach({ effect: getKDPlayerDetailsRequestFx });
const getLobbyKDSettingsFx = attach({ effect: getKDLobbySettingsRequestFx });
const getTurnsFx = attach({ effect: getKDTurnsRequestFx });
const postTurnFx = attach({ effect: createKDTurnRequestFx });
const updateLobbyStageFx = attach({ effect: updateLobbyStageRequestFx });
const updateLobbyFx = attach({ effect: updateLobbyRequestFx });
const upsertPlayerKDDetailsFx = attach({ effect: upsertKDPlayerDetailsRequestFx });

export const currentRoute = routes.games.game;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});

const pageLoaded =
  createEvent<RouteParamsAndQuery<{ gameId: string; lobbyId: string }>>();

const dataLoaded = combineEvents({
  events: [
    getLobbyFx.doneData,
    getStagesFx.doneData,
    getLobbyKDSettingsFx.doneData,
    getPlayersKDDetailsFx.doneData,
    getTurnsFx.doneData,
  ],
});

sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ lobbyId: params.lobbyId }),
  target: getLobbyFx,
});
sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ gameId: params.gameId }),
  target: getStagesFx,
});
sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ lobbyId: params.lobbyId }),
  target: getLobbyKDSettingsFx,
});
sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ lobbyId: params.lobbyId }),
  target: getPlayersKDDetailsFx,
});
sample({
  clock: pageLoaded,
  source: { params: authorizedRoute.$params },
  fn: ({ params }) => ({ lobbyId: params.lobbyId }),
  target: getTurnsFx,
});

export const allDataLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: pageLoaded,
  openOn: dataLoaded,
});

type KillerDartsLifesCounter = {
  userId: string;
  lifeCount: number;
  lifes: boolean[];
  takenBy: Array<UserDetails | null>;
};

type CurrentTurn = {
  userId: string;
  username: string;
  hits: (number | null)[];
  round: number;
};

export const firstScoreChanged = createEvent<{ userId: string; value: string }>();
export const sectorChanged = createEvent<{ userId: string; value: string }>();
export const isKillerChanged = createEvent<{ userId: string; value: boolean }>();
export const lifeCheckboxToggled = createEvent<{
  userId: string;
  value: boolean;
  position: number;
  user: UserDetails | null;
  sector: number | null;
}>();
export const turnChanged = createEvent();
const gameStageChanged = createEvent();
const gameFinished = createEvent<UserDetails>();

export const $lobby = restore(getLobbyFx, {} as Lobby);
export const $lobbySettings = restore(getLobbyKDSettingsFx, {} as KDLobbySettings);
export const $playerDetails = restore(getPlayersKDDetailsFx, []);
export const $turns = restore(getTurnsFx, []);
export const $playersLifes = createStore<Record<string, KillerDartsLifesCounter>>({});
export const $currentTurn = createStore<CurrentTurn | null>(null);
export const $stages = restore(getStagesFx, []);
export const $currentStage = $lobby.map((state) => state.stage);
export const $allFisrstScoresFilled = createStore<boolean>(false);
export const $sectorRepeatError = createStore(false);
export const $allSectorsFilled = createStore<boolean>(false);

reset({
  clock: currentRoute.opened,
  target: [$playersLifes, $currentTurn, $sectorRepeatError],
});

// debug({ trace: true }, { $lobby });
// debug({ trace: true }, { $lobbySettings });
// debug({ trace: true }, { $playerDetails });
// debug({ trace: true }, { $turns });
// debug({ trace: true }, { $playersLifes });
// debug({ trace: true }, { $currentTurn });
// debug({ trace: true }, { $currentStage });

$playerDetails.on(firstScoreChanged, (state, payload) => {
  if (+payload.value < 0 || +payload.value > 180) return;
  return state.map((playerDetails) => {
    if (playerDetails.userId === payload.userId)
      playerDetails.firstScore = +payload.value;
    return playerDetails;
  });
});
$playerDetails.on(sectorChanged, (state, payload) => {
  if (+payload.value < 0 || +payload.value > 20) return;
  return state.map((playerDetails) => {
    if (playerDetails.userId === payload.userId) playerDetails.sector = +payload.value;
    return playerDetails;
  });
});
$playerDetails.on(isKillerChanged, (state, payload) =>
  state.map((playerDetails) => {
    if (playerDetails.userId === payload.userId) playerDetails.isKiller = payload.value;
    return playerDetails;
  }),
);
$playerDetails.on(lifeCheckboxToggled, (state, payload) =>
  state.map((playerDetails) => {
    if (playerDetails.userId === payload.userId) playerDetails.lifeCount--;
    return playerDetails;
  }),
);
$playersLifes.on(lifeCheckboxToggled, (state, payload) => {
  const newKV = { ...state };
  newKV[payload.userId].lifes[payload.position] = payload.value;
  newKV[payload.userId].takenBy[payload.position] = payload.value ? payload.user : null;
  newKV[payload.userId].lifeCount =
    newKV[payload.userId].lifeCount - (payload.value ? 1 : -1);
  return newKV;
});

sample({
  clock: allDataLoadedRoute.opened,
  source: {
    currentTurn: $currentTurn,
    players: $playerDetails,
    turns: $turns,
  },
  filter: ({ currentTurn }) => currentTurn === null,
  fn: ({ players, turns }) => {
    if (turns.length > 0) {
      const alivePlayers = players.filter((player) => !player.isDead);
      console.log(alivePlayers);

      const currentRound = Math.trunc(turns.length / players.length) + 1;
      const lastSavedTurn = turns.at(-1)!;
      const lastTurnPlayerIndex = alivePlayers.findIndex(
        (player) => player.userId === lastSavedTurn.user?.id,
      );
      const currentUserIndex =
        lastTurnPlayerIndex === alivePlayers.length - 1 ? 0 : lastTurnPlayerIndex + 1;

      return {
        hits: [],
        round: currentRound,
        userId: alivePlayers[currentUserIndex].userId,
        username: alivePlayers[currentUserIndex].username,
      };
    }
    if (turns.length === 0) {
      const firstPlayer = players.find((item) => item.order === 1);
      return {
        userId: firstPlayer?.userId,
        username: firstPlayer?.username,
        round: 1,
        hits: [],
      } as CurrentTurn;
    }
    return null;
  },
  target: $currentTurn,
});

sample({
  clock: allDataLoadedRoute.opened,
  source: { players: $playerDetails, lobbySettings: $lobbySettings, turns: $turns },
  // filter: () => true,
  fn: ({ players, lobbySettings, turns }) => {
    const lifeCounter: Record<string, KillerDartsLifesCounter> = {};
    players.forEach((player) => {
      lifeCounter[player.userId] = {
        userId: player.userId,
        lifeCount: player.lifeCount,
        lifes: Array(lobbySettings.lifeCount).fill(false) as boolean[],
        takenBy: Array(lobbySettings.lifeCount).fill(null) as null[],
      };
    });
    players.forEach((player) => {
      let countHits = 0;
      const hittersList: UserDetails[] = [];

      turns.forEach((turn) => {
        if (turn.firstHit === player.sector) {
          countHits++;
          if (turn.user) hittersList.push(turn.user);
        }
        if (turn.secondHit === player.sector) {
          countHits++;
          if (turn.user) hittersList.push(turn.user);
        }
        if (turn.thirdHit === player.sector) {
          countHits++;
          if (turn.user) hittersList.push(turn.user);
        }
      });

      lifeCounter[player.userId].lifes.fill(true, 0, countHits);
      lifeCounter[player.userId].takenBy = hittersList.concat(
        Array(lobbySettings.lifeCount - countHits).fill(null),
      );
    });
    return lifeCounter;
  },
  target: $playersLifes,
});

const debouncedFirstScoreChanged = debounce({
  source: firstScoreChanged,
  timeout: 1500,
});

sample({
  clock: debouncedFirstScoreChanged,
  source: { players: $playerDetails },
  fn: ({ players }) => {
    const newPlayers = [...players];
    return newPlayers
      .sort((a, b) => +b.firstScore! - +a.firstScore!)
      .map((item, i) => {
        item.order = i + 1;
        return item;
      });
  },
  target: $playerDetails,
});

sample({
  clock: debouncedFirstScoreChanged,
  source: { players: $playerDetails },
  filter: ({ players }) => players.filter((item) => !item.firstScore).length === 0,
  fn: () => true,
  target: $allFisrstScoresFilled,
});

const debouncedSectorChanged = debounce({
  source: sectorChanged,
  timeout: 1500,
});

sample({
  clock: debouncedSectorChanged,
  source: { players: $playerDetails },
  fn: ({ players }) => {
    return hasDuplicates(
      players.filter((player) => player.sector).map((player) => player.sector),
    );
  },
  target: $sectorRepeatError,
});

sample({
  clock: debouncedSectorChanged,
  source: { players: $playerDetails, sectorRepeatError: $sectorRepeatError },
  filter: ({ players, sectorRepeatError }) =>
    players.filter((item) => !item.sector).length === 0 && !sectorRepeatError,
  fn: () => true,
  target: $allSectorsFilled,
});

sample({
  clock: [$allFisrstScoresFilled, $allSectorsFilled],
  target: gameStageChanged,
});

sample({
  clock: gameStageChanged,
  source: { players: $playerDetails },
  fn: ({ players }) => players,
  target: upsertPlayerKDDetailsFx,
});

sample({
  clock: gameStageChanged,
  source: { stages: $stages, lobby: $lobby, currentStage: $currentStage },
  fn: ({ stages, lobby, currentStage }) => {
    const nextStage = stages.find((stage) => stage.order === currentStage.order + 1);
    return {
      stageId: nextStage!.id,
      lobbyId: lobby.id,
    };
  },
  target: updateLobbyStageFx,
});

$lobby.on(updateLobbyStageFx.doneData, (_, lobby) => lobby);

$currentTurn.on(lifeCheckboxToggled, (state, payload) => {
  if (!state) return;
  const newState = { ...state };
  if (newState.hits.at(-1) === +payload.sector! && payload.value === false)
    newState.hits.pop();
  else newState.hits?.push(payload.sector);
  return newState;
});

sample({
  clock: turnChanged,
  source: { players: $playerDetails },
  fn: ({ players }) => players,
  target: upsertPlayerKDDetailsFx,
});

sample({
  clock: updateLobbyStageFx.doneData,
  source: { players: $playerDetails, currentTurn: $currentTurn },
  filter: (_, lobby) => lobby.stage.title === 'Game',
  fn: ({ players }) => {
    const firstPlayer = players.find((item) => item.order === 1);
    return {
      userId: firstPlayer?.userId,
      username: firstPlayer?.username,
      round: 1,
      hits: [],
    } as CurrentTurn;
  },
  target: $currentTurn,
});

sample({
  clock: turnChanged,
  source: { currentTurn: $currentTurn, lobby: $lobby },
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ currentTurn, lobby }) => {
    const { userId, hits, round } = currentTurn!;
    return {
      userId,
      round,
      firstHit: hits[0] ? hits[0] : null,
      secondHit: hits[1] ? hits[1] : null,
      thirdHit: hits[2] ? hits[2] : null,
      lobbyId: lobby.id,
    };
  },
  target: postTurnFx,
});

sample({
  clock: turnChanged,
  source: { players: $playerDetails, currentTurn: $currentTurn },
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ players, currentTurn }) => {
    if (!currentTurn) return null;
    const alivePlayers = players.filter((player) => !player.isDead);
    const nextPlayerIndex =
      (alivePlayers.findIndex((player) => player.userId === currentTurn.userId) + 1) %
      alivePlayers.length;
    return {
      userId: alivePlayers[nextPlayerIndex].userId,
      username: alivePlayers[nextPlayerIndex].username,
      round: nextPlayerIndex === 0 ? currentTurn.round + 1 : currentTurn.round,
      hits: [],
    } as CurrentTurn;
  },
  target: $currentTurn,
});

sample({
  clock: lifeCheckboxToggled,
  source: { playersLifes: $playersLifes, players: $playerDetails },
  fn: ({ playersLifes, players }, payload) => {
    const newPlayers = [...players];

    if (playersLifes[payload.userId].lifes.every((v) => v === true))
      newPlayers.find((player) => player.userId === payload.userId)!.isDead = true;
    else {
      newPlayers.find((player) => player.userId === payload.userId)!.isDead = false;
    }
    return newPlayers;
  },
  target: $playerDetails,
});

sample({
  clock: lifeCheckboxToggled,
  source: { playersLifes: $playersLifes, lobby: $lobby },
  filter: ({ playersLifes }, { user }) =>
    Object.values(playersLifes).filter((lifes) => lifes.lifeCount !== 0).length === 1 &&
    user !== null,
  fn: ({ lobby }, { user }) => {
    return lobby.users.find((player) => player.id === user!.id)!;
  },
  target: gameFinished,
});

sample({
  clock: gameFinished,
  source: { currentTurn: $currentTurn, lobby: $lobby },
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ currentTurn, lobby }) => {
    const { userId, hits, round } = currentTurn!;
    return {
      userId,
      round,
      firstHit: hits[0] ? hits[0] : null,
      secondHit: hits[1] ? hits[1] : null,
      thirdHit: hits[2] ? hits[2] : null,
      lobbyId: lobby.id,
    };
  },
  target: postTurnFx,
});

sample({
  clock: gameFinished,
  source: { lobby: $lobby },
  fn: ({ lobby }, user) => ({ ...lobby, winner: user }),
  target: updateLobbyFx,
});

sample({
  clock: gameFinished,
  target: gameStageChanged,
});

const gameEnds = sample({
  clock: gameFinished,
  fn: ({ username }) => {
    console.log(`winner is ${username}`);
  },
});

// $winner.on(gameFinished, (_, winner) => winner);

function hasDuplicates(arr: any[]) {
  return new Set(arr).size !== arr.length;
}
