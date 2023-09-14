import { chainRoute } from 'atomic-router';
import { attach, createEvent, createStore, restore, sample } from 'effector';
import { debounce, debug } from 'patronum';
import {
  Lobby,
  createKDTurnRequestFx,
  createLobbyKDDetailsRequestFx,
  getKDTurnsRequestFx,
  getLobbyKDDetailsRequestFx,
  getLobbyRequestFx,
} from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';

const stages = ['Turn qualification', 'Sector allocation', 'Game', 'Game finished'];

const lobbyGetFx = attach({ effect: getLobbyRequestFx });
const turnPostFx = attach({ effect: createKDTurnRequestFx });
const turnsGetFx = attach({ effect: getKDTurnsRequestFx });
const lobbyDetailsGetFx = attach({ effect: getLobbyKDDetailsRequestFx });
const lobbyDetailsPostFx = attach({ effect: createLobbyKDDetailsRequestFx });

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
export const lobbyDetailsLoadedRoute = chainRoute({
  route: lobbyLoadedRoute,
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

type KillerDartsScoreBoardItem = {
  userId: string;
  username: string;
  firstScore: string | number | null;
  sector: string | number | null;
  isKiller: boolean;
  lifeCount: number;
  isDead: boolean;
  order: number;
};

type KillerDartsRound = {
  round: number;
  turn: {
    id: string;
    username: string;
  };
};

type KillerDartsLifesCounter = {
  userId: string;
  lifeCount: number;
  lifes: boolean[];
  takenBy: string[];
};

type CurrentTurn = {
  userId: string;
  username: string;
  hits: number[];
  round: number;
};

export const firstScoreChanged = createEvent<{ key: string; value: string }>();
export const sectorChanged = createEvent<{ key: string; value: string }>();
export const isKillerChanged = createEvent<{ key: string; value: boolean }>();
const gameStageChanged = createEvent();
export const turnChanged = createEvent();
export const lifeCheckboxToggled = createEvent<{
  key: string;
  value: boolean;
  position: number;
  username: string;
  sector: string;
}>();
const gameFinished = createEvent<string>();

export const $lobby = restore(lobbyGetFx, {} as Lobby);
export const $turns = restore(turnsGetFx, []);
export const $lobbyDetails = restore(lobbyDetailsGetFx, []);
export const $players = createStore<Record<string, KillerDartsScoreBoardItem>>({});
export const $scoreBoard = $players.map((state) => Object.values(state));
export const $sortedScoreBoard = $players.map((state) =>
  Object.values(state).sort((a, b) => a.order - b.order),
);
export const $sectorRepeatError = createStore(false);
export const $playersLifes = createStore<Record<string, KillerDartsLifesCounter>>({});
export const $playersLifesList = $playersLifes.map((state) => Object.values(state));
//.sort((a, b) => +b.firstScore! - +a.firstScore!)
export const $allFisrstScoresFilled = createStore<boolean>(false);
// ({ scoreBoard }) => scoreBoard.filter((item) => !item.firstScore).length === 0,
export const $allSectorsFilled = createStore<boolean>(false);
export const $gameStage = createStore<string>(stages[0]);
export const $gameRound = createStore(0);
export const $round = createStore<KillerDartsRound | null>(null);
export const $winner = createStore<string>('');
export const $currentTurn = createStore<CurrentTurn | null>(null);

debug({ trace: true }, $sectorRepeatError);
debug({ trace: true }, $lobbyDetails);
-sample({
  clock: lobbyGetFx.doneData,
  fn: (params) => {
    let result: { [x: string]: KillerDartsScoreBoardItem } = {};

    params.users.map((user) => {
      result[user.id] = {
        userId: user.id,
        username: user.username,
        firstScore: '',
        sector: '',
        isKiller: false,
        lifeCount: 3,
        isDead: false,
        order: 0,
      };
    });
    return result;
  },
  target: $players,
});

sample({
  clock: lobbyGetFx.doneData,
  fn: (params) => {
    let result: Record<string, KillerDartsLifesCounter> = {};

    params.users.map((user) => {
      result[user.id] = {
        userId: user.id,
        lifeCount: 3,
        lifes: Array(3).fill(false),
        takenBy: Array(3).fill(''),
      } as KillerDartsLifesCounter;
    });
    return result;
  },
  target: $playersLifes,
});

sample({
  clock: $lobbyDetails,
  filter: (lobbyDetails) => lobbyDetails.length !== 0,
  // target: $
});

sample({
  source: { currentTurn: $currentTurn, lobby: $lobby },
  clock: $turns,
  filter: ({ currentTurn }, turns) => currentTurn === null && turns.length !== 0,
  fn: ({ lobby }, payload) => {
    const { round, userId, hits } = payload.at(-1)!;
    return {
      hits,
      round,
      userId,
      username: lobby.users.find((user) => user.id === userId)!.username,
    };
  },
  target: $currentTurn,
});

$players.on(firstScoreChanged, (state, payload) => {
  let newKV = { ...state };
  if (+payload.value < 0 || +payload.value > 180) return;
  newKV[payload.key].firstScore = payload.value;
  return newKV;
});

$players.on(sectorChanged, (state, payload) => {
  let newKV = { ...state };
  if (+payload.value < 0 || +payload.value > 20) return;
  newKV[payload.key].sector = payload.value;
  return newKV;
});

$players.on(isKillerChanged, (state, payload) => {
  let newKV = { ...state };
  newKV[payload.key].isKiller = payload.value;
  return newKV;
});

$playersLifes.on(lifeCheckboxToggled, (state, payload) => {
  const newKV = { ...state };
  newKV[payload.key].lifes[payload.position] = payload.value;
  newKV[payload.key].takenBy[payload.position] = payload.value ? payload.username : '';
  newKV[payload.key].lifeCount = newKV[payload.key].lifeCount - (payload.value ? 1 : -1);
  return newKV;
});

// debug({ trace: true }, $scoreBoard);
debug({ trace: true }, $playersLifes);

const debouncedFirstScoreChanged = debounce({
  source: firstScoreChanged,
  timeout: 1500,
});

const debouncedSectorChanged = debounce({
  source: sectorChanged,
  timeout: 1500,
});

sample({
  source: { scoreBoard: $scoreBoard },
  clock: debouncedSectorChanged,
  fn: ({ scoreBoard }) => {
    return hasDuplicates(
      scoreBoard.filter((player) => player.sector).map((player) => player.sector),
    );
  },
  target: $sectorRepeatError,
});

sample({
  source: { scoreBoard: $scoreBoard, players: $players },
  clock: debouncedFirstScoreChanged,
  fn: ({ scoreBoard, players }) => {
    const newPlayers = { ...players };
    const newScoreBoard = [...scoreBoard];
    newScoreBoard
      .sort((a, b) => +b.firstScore! - +a.firstScore!)
      .forEach((item, i) => {
        newPlayers[item.userId].order = i + 1;
      });
    return newPlayers;
  },
  target: $players,
});

sample({
  source: { scoreBoard: $scoreBoard },
  clock: debouncedFirstScoreChanged,
  filter: ({ scoreBoard }) => scoreBoard.filter((item) => !item.firstScore).length === 0,
  fn: () => true,
  target: $allFisrstScoresFilled,
});

sample({
  source: { scoreBoard: $scoreBoard, sectorRepeatError: $sectorRepeatError },
  clock: debouncedSectorChanged,
  filter: ({ scoreBoard, sectorRepeatError }) =>
    scoreBoard.filter((item) => !item.sector).length === 0 && !sectorRepeatError,
  fn: () => true,
  target: $allSectorsFilled,
});

sample({
  clock: [$allFisrstScoresFilled, $allSectorsFilled],
  target: gameStageChanged,
});

sample({
  source: { scoreBoard: $scoreBoard, round: $round, stage: $gameStage },
  clock: $gameStage,
  filter: ({ round, stage }) => stage === 'Game' && round === null,
  fn: ({ scoreBoard }) => {
    const firstPlayer = scoreBoard.find((item) => item.order === 1);
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
  source: { scoreBoard: $scoreBoard, round: $round, stage: $gameStage },
  clock: $gameStage,
  filter: ({ round, stage }) => stage === 'Game' && round === null,
  fn: ({ scoreBoard }) => {
    const firstPlayer = scoreBoard.find((item) => item.order === 1);
    return {
      round: 1,
      turn: {
        id: firstPlayer!.userId,
        username: firstPlayer!.username,
      },
    };
  },
  target: $round,
});

sample({
  source: { scoreBoard: $scoreBoard, currentTurn: $currentTurn, stage: $gameStage },
  clock: $gameStage,
  filter: ({ currentTurn, stage }) => stage === 'Game' && currentTurn === null,
  fn: ({ scoreBoard }) => {
    const firstPlayer = scoreBoard.find((item) => item.order === 1);
    return {
      userId: firstPlayer?.userId,
      username: firstPlayer?.username,
      round: 1,
      hits: [],
    } as CurrentTurn;
  },
  target: $currentTurn,
});

$currentTurn.on(lifeCheckboxToggled, (state, payload) => {
  if (!state) return;
  const newState = { ...state };
  if (newState.hits.at(-1) === +payload.sector && payload.value === false)
    newState.hits.pop();
  else newState.hits?.push(+payload.sector);
  return newState;
});

// debug({ trace: true }, $currentTurn);

sample({
  source: { scoreBoard: $scoreBoard, round: $round },
  clock: turnChanged,
  filter: ({ round }) => round !== null,
  fn: ({ scoreBoard, round }) => {
    if (!round) return null;
    const nextPlayerIndex =
      (scoreBoard
        .filter((player) => !player.isDead)
        // .sort((a, b) => a.order - b.order)
        .findIndex((player) => player.userId === round.turn.id) +
        1) %
      scoreBoard.length;
    return {
      round: nextPlayerIndex !== 0 ? round.round + 1 : round.round,
      turn: {
        id: scoreBoard[nextPlayerIndex].userId,
        username: scoreBoard[nextPlayerIndex].username,
      },
    };
  },
  target: $round,
});

sample({
  source: { scoreBoard: $sortedScoreBoard, currentTurn: $currentTurn },
  clock: turnChanged,
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ scoreBoard, currentTurn }) => {
    if (!currentTurn) return null;
    const nextPlayerIndex =
      (scoreBoard
        .filter((player) => !player.isDead)
        .findIndex((player) => player.userId === currentTurn.userId) +
        1) %
      scoreBoard.length;
    return {
      userId: scoreBoard[nextPlayerIndex].userId,
      username: scoreBoard[nextPlayerIndex].username,
      round: nextPlayerIndex === 0 ? currentTurn.round + 1 : currentTurn.round,
      hits: [],
    } as CurrentTurn;
  },
  target: $currentTurn,
});

sample({
  source: { currentTurn: $currentTurn, lobby: $lobby },
  clock: turnChanged,
  filter: ({ currentTurn }) => currentTurn !== null,
  fn: ({ currentTurn, lobby }) => {
    const { username, ...rest } = currentTurn!;
    return { ...rest, lobbyId: lobby.id };
  },
  target: turnPostFx,
});

sample({
  clock: turnPostFx.doneData,
  fn: (params) => console.log(params),
});

sample({
  source: { currentStage: $gameStage },
  clock: gameStageChanged,
  fn: ({ currentStage }) => {
    const currentStageIndex = stages.indexOf(currentStage);
    return stages[currentStageIndex + 1];
  },
  target: $gameStage,
});

sample({
  source: { playersLifes: $playersLifes, players: $players },
  clock: lifeCheckboxToggled,
  // filter: (_, payload) => payload.value === 0,
  fn: ({ playersLifes, players }, payload) => {
    let newPlayers = { ...players };
    if (playersLifes[payload.key].lifes.every((v) => v === true))
      newPlayers[payload.key].isDead = true;
    else {
      newPlayers[payload.key].isDead = false;
    }
    return newPlayers;
  },
  target: $players,
});

sample({
  source: { playersLifesList: $playersLifesList, players: $players },
  clock: lifeCheckboxToggled,
  filter: ({ playersLifesList }) =>
    playersLifesList.filter((lifes) => lifes.lifeCount === 0).length === 1,
  fn: ({ playersLifesList, players }) => {
    const winnerId = playersLifesList.find((lifes) => lifes.lifeCount !== 0)!.userId;
    return players[winnerId].username;
  },
  target: gameFinished,
});

sample({
  clock: gameFinished,
  target: gameStageChanged,
});

$winner.on(gameFinished, (_, winner) => winner);
// debug({ trace: true }, $scoreBoard);

function hasDuplicates(arr: any[]) {
  return new Set(arr).size !== arr.length;
}
