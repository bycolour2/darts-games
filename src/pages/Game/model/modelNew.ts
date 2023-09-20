import { chainRoute } from 'atomic-router';
import { attach, createEvent, createStore, restore, sample } from 'effector';
import { debounce, debug } from 'patronum';
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
  updateLobbyStageFx,
} from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';

const lobbyGetFx = attach({ effect: getLobbyRequestFx });
const stagesGetFx = attach({ effect: getStagesByGameIdRequestFx });
const lobbyDetailsGetFx = attach({ effect: getKDPlayerDetailsRequestFx });
const lobbyKDSettingsGetFx = attach({ effect: getKDLobbySettingsRequestFx });
const turnsGetFx = attach({ effect: getKDTurnsRequestFx });
const turnPostFx = attach({ effect: createKDTurnRequestFx });
const playerKDDetailsPostFx = attach({ effect: createKDPlayerDetailsRequestFx });
const lobbyStageUpdateFx = attach({ effect: updateLobbyStageFx });

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
    effect: lobbyDetailsGetFx,
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
export const $lobbyDetails = restore(lobbyDetailsGetFx, []);
export const $turns = restore(turnsGetFx, []);
export const $playersLifes = createStore<Record<string, KillerDartsLifesCounter>>({});
export const $currentTurn = createStore<CurrentTurn | null>(null);
export const $stages = restore(stagesGetFx, []);
// export const $currentStage = createStore<GameStage>({} as GameStage);
export const $currentStage = $lobby.map((state) => state.stage);
export const $allFisrstScoresFilled = createStore<boolean>(false);
export const $sectorRepeatError = createStore(false);
export const $allSectorsFilled = createStore<boolean>(false);

// debug({ trace: true }, { $lobby });
// debug({ trace: true }, { $lobbySettings });
// debug({ trace: true }, { $lobbyDetails });
// debug({ trace: true }, { $turns });
// debug({ trace: true }, { $playersLifes });
debug({ trace: true }, { $currentTurn });
// debug({ trace: true }, { $currentStage });

$lobbyDetails.on(firstScoreChanged, (state, payload) => {
  if (+payload.value < 0 || +payload.value > 180) return;
  return state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.firstScore = +payload.value;
    return playerDetails;
  });
});
$lobbyDetails.on(sectorChanged, (state, payload) => {
  if (+payload.value < 0 || +payload.value > 20) return;
  return state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.sector = +payload.value;
    return playerDetails;
  });
});
$lobbyDetails.on(isKillerChanged, (state, payload) =>
  state.map((playerDetails) => {
    if (playerDetails.userId === payload.key) playerDetails.isKiller = payload.value;
    return playerDetails;
  }),
);
$lobbyDetails.on(lifeCheckboxToggled, (state, payload) =>
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
  source: { currentTurn: $currentTurn, lobby: $lobby, players: $lobbyDetails },
  clock: turnsGetFx.doneData,
  // filter: ({ currentTurn }, turns) => currentTurn === null,
  fn: ({ players }, turns) => {
    if (turns.length > 0) {
      const { round, user, firstHit, secondHit, thirdHit } = turns.at(-1)!;
      return {
        hits: [firstHit, secondHit, thirdHit],
        round,
        userId: user!.id,
        username: user!.username,
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

// sample({
//   source: { players: $lobbyDetails, currentTurn: $currentTurn, stage: $currentStage },
//   clock: $currentStage,
//   filter: ({ currentTurn, stage }) => stage.title === 'Game' && currentTurn === null,
//   fn: ({ players }) => {
//     const firstPlayer = players.find((item) => item.order === 1);
//     return {
//       userId: firstPlayer?.userId,
//       username: firstPlayer?.username,
//       round: 1,
//       hits: [],
//     } as CurrentTurn;
//   },
//   target: $currentTurn,
// });

sample({
  source: { players: $lobbyDetails },
  clock: turnsGetFx.doneData,
  fn: ({ players }, turns) => {
    const lifeCounter: Record<string, KillerDartsLifesCounter> = {};
    players.forEach((player) => {
      lifeCounter[player.userId] = {
        userId: player.userId,
        lifeCount: player.lifeCount,
        lifes: Array(player.lifeCount).fill(false),
        takenBy: Array(player.lifeCount).fill(null),
      };
    });
    players.forEach((player) => {
      const a = turns.filter(
        (turn) =>
          turn.firstHit === player.sector ||
          turn.secondHit === player.sector ||
          turn.thirdHit === player.sector,
      );
      console.log('players hitted turns', a);
    });
    // turns.forEach((turn) => {
    //   players.filter( player => player.sector === turn.firstHit)
    // });
    // turns
    return lifeCounter;
  },
  target: $playersLifes,
});

const debouncedFirstScoreChanged = debounce({
  source: firstScoreChanged,
  timeout: 1500,
});

sample({
  source: { players: $lobbyDetails },
  clock: debouncedFirstScoreChanged,
  fn: ({ players }) => {
    const newPlayers = [...players];
    return newPlayers
      .sort((a, b) => +b.firstScore! - +a.firstScore!)
      .map((item, i) => {
        item.order = i + 1;
        return item;
      });
  },
  target: $lobbyDetails,
});

sample({
  source: { players: $lobbyDetails },
  clock: debouncedFirstScoreChanged,
  filter: ({ players }) => players.filter((item) => !item.firstScore).length === 0,
  fn: () => true,
  target: $allFisrstScoresFilled,
});

const debouncedSectorChanged = debounce({
  source: sectorChanged,
  timeout: 1500,
});

sample({
  source: { players: $lobbyDetails },
  clock: debouncedSectorChanged,
  fn: ({ players }) => {
    return hasDuplicates(
      players.filter((player) => player.sector).map((player) => player.sector),
    );
  },
  target: $sectorRepeatError,
});

sample({
  source: { players: $lobbyDetails, sectorRepeatError: $sectorRepeatError },
  clock: debouncedSectorChanged,
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
  source: { stages: $stages, lobby: $lobby, currentStage: $currentStage },
  clock: gameStageChanged,
  fn: ({ stages, lobby, currentStage }) => {
    const nextStage = stages.find((stage) => stage.order === currentStage.order + 1);
    // console.log(
    //   'next stage',
    //   stages.find((stage) => stage.order === currentStage.order + 1),
    // );

    return {
      stageId: nextStage!.id,
      lobbyId: lobby.id,
    };
  },
  target: lobbyStageUpdateFx,
});

sample({
  clock: lobbyStageUpdateFx.doneData,
  fn: console.log,
});

$lobby.on(lobbyStageUpdateFx.doneData, (_, lobby) => lobby);

$currentTurn.on(lifeCheckboxToggled, (state, payload) => {
  if (!state) return;
  const newState = { ...state };
  if (newState.hits.at(-1) === +payload.sector! && payload.value === false)
    newState.hits.pop();
  else newState.hits?.push(payload.sector!);
  return newState;
});

sample({
  source: { currentTurn: $currentTurn, lobby: $lobby },
  clock: turnChanged,
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ currentTurn, lobby }) => {
    const { username, hits, ...rest } = currentTurn!;
    return {
      ...rest,
      firstHit: hits[0],
      secondHit: hits[1],
      thirdHit: hits[2],
      lobbyId: lobby.id,
    };
  },
  target: turnPostFx,
});

sample({
  source: { players: $lobbyDetails, currentTurn: $currentTurn, stage: $currentStage },
  clock: turnChanged,
  filter: ({ currentTurn, stage }) => stage.title === 'Game' && currentTurn === null,
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

function hasDuplicates(arr: any[]) {
  return new Set(arr).size !== arr.length;
}
