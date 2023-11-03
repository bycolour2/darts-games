import { RouteParamsAndQuery, chainRoute } from 'atomic-router';
import { attach, createEvent, createStore, restore, sample } from 'effector';
import { combineEvents, debounce, reset } from 'patronum';
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
import { sessionModel } from '~/shared/session';

const getPlayersKDDetailsFx = attach({ effect: getKDPlayerDetailsRequestFx });

export const firstScoreChanged = createEvent<{ userId: string; value: string }>();
export const sectorChanged = createEvent<{ userId: string; value: string }>();
export const isKillerChanged = createEvent<{ userId: string; value: boolean }>();
export const lifeCheckboxToggled = createEvent<{
  checkboxUserId: string;
  value: boolean;
  position: number;
  user: UserDetails | null;
  sector: number | null;
}>();

export const $playerDetails = restore(getPlayersKDDetailsFx, []);
export const $allFisrstScoresFilled = createStore<boolean>(false);
export const $sectorRepeatError = createStore(false);
export const $allSectorsFilled = createStore<boolean>(false);

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
    if (playerDetails.userId === payload.checkboxUserId) playerDetails.lifeCount--;
    return playerDetails;
  }),
);

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

function hasDuplicates(arr: any[]) {
  return new Set(arr).size !== arr.length;
}
