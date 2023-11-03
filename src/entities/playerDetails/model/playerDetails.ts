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
