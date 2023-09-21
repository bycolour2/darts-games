import { chainRoute } from 'atomic-router';
import { attach, createEvent, createStore, restore, sample } from 'effector';
import { debounce, debug, reset } from 'patronum';
import {
  createKDTurnRequestFx,
  createKDPlayerDetailsRequestFx,
  getKDTurnsRequestFx,
  getKDPlayerDetailsRequestFx,
  getLobbyRequestFx,
  UserDetails,
  Lobby,
  getKDLobbySettingsRequestFx,
  KDLobbySettings,
  getStagesByGameIdRequestFx,
  GameStage,
  updateLobbyStageRequestFx,
  upsertKDPlayerDetailsRequestFx,
} from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';

const lobbyGetFx = attach({ effect: getLobbyRequestFx });
const stagesGetFx = attach({ effect: getStagesByGameIdRequestFx });
const playersKDDetailsGetFx = attach({ effect: getKDPlayerDetailsRequestFx });
const lobbyKDSettingsGetFx = attach({ effect: getKDLobbySettingsRequestFx });
const turnsGetFx = attach({ effect: getKDTurnsRequestFx });
const turnPostFx = attach({ effect: createKDTurnRequestFx });
const playerKDDetailsPostFx = attach({ effect: createKDPlayerDetailsRequestFx });
const lobbyStageUpdateFx = attach({ effect: updateLobbyStageRequestFx });
const playerKDDetailsUpsertFx = attach({ effect: upsertKDPlayerDetailsRequestFx });

export const currentRoute = routes.games.game;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.auth.login.open,
});
export const lobbyLoadedRoute = chainRoute({
  route: authorizedRoute,
  beforeOpen: {
    effect: lobbyGetFx,
    mapParams: ({ params }) => ({ lobbyId: params.lobbyId }),
  },
});
export const stagesLoadedRoute = chainRoute({
  route: lobbyLoadedRoute,
  beforeOpen: {
    effect: stagesGetFx,
    mapParams: ({ params }) => ({ gameId: params.gameId }),
  },
});
export const lobbySettingsLoadedRoute = chainRoute({
  route: stagesLoadedRoute,
  beforeOpen: {
    effect: lobbyKDSettingsGetFx,
    mapParams: ({ params }) => ({ lobbyId: params.lobbyId }),
  },
});
export const lobbyDetailsLoadedRoute = chainRoute({
  route: lobbySettingsLoadedRoute,
  beforeOpen: {
    effect: playersKDDetailsGetFx,
    mapParams: ({ params }) => ({ lobbyId: params.lobbyId }),
  },
});
export const turnsLoadedRoute = chainRoute({
  route: lobbyDetailsLoadedRoute,
  beforeOpen: {
    effect: turnsGetFx,
    mapParams: ({ params }) => ({ lobbyId: params.lobbyId }),
  },
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

export const firstScoreChanged = createEvent<{ key: string; value: string }>();
export const sectorChanged = createEvent<{ key: string; value: string }>();
export const isKillerChanged = createEvent<{ key: string; value: boolean }>();
export const lifeCheckboxToggled = createEvent<{
  key: string;
  value: boolean;
  position: number;
  user: UserDetails | null;
  sector: number | null;
}>();
export const turnChanged = createEvent();
const gameStageChanged = createEvent();
const gameFinished = createEvent<string>();

export const $lobby = restore(lobbyGetFx, {} as Lobby);
export const $lobbySettings = restore(lobbyKDSettingsGetFx, {} as KDLobbySettings);
export const $playerDetails = restore(playersKDDetailsGetFx, []);
export const $turns = restore(turnsGetFx, []);
export const $playersLifes = createStore<Record<string, KillerDartsLifesCounter>>({});
export const $currentTurn = createStore<CurrentTurn | null>(null);
export const $stages = restore(stagesGetFx, []);
// export const $currentStage = createStore<GameStage>({} as GameStage);
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
    if (playerDetails.userId === payload.key) playerDetails.firstScore = +payload.value;
    return playerDetails;
  });
});
$playerDetails.on(sectorChanged, (state, payload) => {
  if (+payload.value < 0 || +payload.value > 20) return;
  return state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.sector = +payload.value;
    return playerDetails;
  });
});
$playerDetails.on(isKillerChanged, (state, payload) =>
  state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.isKiller = payload.value;
    return playerDetails;
  }),
);
$playerDetails.on(lifeCheckboxToggled, (state, payload) =>
  state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.lifeCount--;
    return playerDetails;
  }),
);
$playersLifes.on(lifeCheckboxToggled, (state, payload) => {
  const newKV = { ...state };
  newKV[payload.key].lifes[payload.position] = payload.value;
  newKV[payload.key].takenBy[payload.position] = payload.value ? payload.user : null;
  newKV[payload.key].lifeCount = newKV[payload.key].lifeCount - (payload.value ? 1 : -1);
  return newKV;
});

sample({
  clock: turnsGetFx.doneData,
  source: { currentTurn: $currentTurn, lobby: $lobby, players: $playerDetails },
  filter: ({ currentTurn }, turns) => currentTurn === null && turns.length > 0,
  fn: ({ players }, turns) => {
    if (turns.length > 0) {
      const alivePlayers = players.filter((player) => !player.isDead);
      // console.log('turns.length', turns.length);
      // console.log('players.length', players.length);

      const currentRound = Math.trunc(turns.length / players.length) + 1;
      const lastSavedTurn = turns.at(-1)!;
      const lastTurnPlayerIndex = alivePlayers.findIndex(
        (player) => player.userId === lastSavedTurn.user?.id,
      );
      const currentUserIndex =
        lastTurnPlayerIndex === alivePlayers.length - 1 ? 0 : lastTurnPlayerIndex + 1;
      // console.log('currentRound', currentRound);
      // console.log('lastSavedTurn', lastSavedTurn);
      // console.log('currentUserIndex', currentUserIndex);
      // console.log(' players[currentUserIndex]', players[currentUserIndex]);
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
  clock: turnsGetFx.doneData,
  source: { players: $playerDetails, lobbySettings: $lobbySettings },
  fn: ({ players, lobbySettings }, turns) => {
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
      console.log(`player ${player.username} counter ${countHits}`);
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
  target: playerKDDetailsUpsertFx,
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
  target: lobbyStageUpdateFx,
});

$lobby.on(lobbyStageUpdateFx.doneData, (_, lobby) => lobby);

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
  target: playerKDDetailsUpsertFx,
});

sample({
  clock: lobbyStageUpdateFx.doneData,
  source: { players: $playerDetails, currentTurn: $currentTurn },
  filter: (_, lobby) => lobby.stage.title === 'Game',
  fn: ({ players }) => {
    console.log('fired');
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
  target: turnPostFx,
});

sample({
  clock: turnChanged,
  source: { players: $playerDetails, currentTurn: $currentTurn },
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ players, currentTurn }) => {
    if (!currentTurn) return null;
    const alivePlayers = players.filter((player) => !player.isDead);
    console.log('alivePlayers', alivePlayers);
    // console.log('',)
    const nextPlayerIndex =
      (alivePlayers.findIndex((player) => player.userId === currentTurn.userId) + 1) %
      alivePlayers.length;
    console.log('nextPlayerIndex', nextPlayerIndex);
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

    if (playersLifes[payload.key].lifes.every((v) => v === true))
      // newPlayers[payload.key].isDead = true;
      newPlayers.find((player) => player.userId === payload.key)!.isDead = true;
    else {
      newPlayers.find((player) => player.userId === payload.key)!.isDead = false;
      // newPlayers[payload.key].isDead = false;
    }
    return newPlayers;
  },
  target: $playerDetails,
});

sample({
  clock: lifeCheckboxToggled,
  source: { playersLifes: $playersLifes, players: $playerDetails },
  filter: ({ playersLifes }, { user }) =>
    Object.values(playersLifes).filter((lifes) => lifes.lifeCount !== 0).length === 1 &&
    user !== null,
  fn: ({ playersLifes }, { user }) => {
    // const winnerId = Object.values(playersLifes).find((lifes) => lifes.lifeCount !== 0)!.userId;
    // if(user)
    return playersLifes[user!.id].userId;
  },
  target: gameFinished,
});

sample({
  clock: gameFinished,
  target: gameStageChanged,
});

// $winner.on(gameFinished, (_, winner) => winner);

function hasDuplicates(arr: any[]) {
  return new Set(arr).size !== arr.length;
}
