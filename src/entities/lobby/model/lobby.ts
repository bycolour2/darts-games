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

const getLobbyFx = attach({ effect: getLobbyRequestFx });
const getLobbyKDSettingsFx = attach({ effect: getKDLobbySettingsRequestFx });
const updateLobbyStageFx = attach({ effect: updateLobbyStageRequestFx });
const updateLobbyFx = attach({ effect: updateLobbyRequestFx });
const getStagesFx = attach({ effect: getStagesByGameIdRequestFx });

export const $lobby = restore(getLobbyFx, {} as Lobby);
export const $lobbySettings = restore(getLobbyKDSettingsFx, {} as KDLobbySettings);
export const $stages = restore(getStagesFx, []);
export const $currentStage = $lobby.map((state) => state.stage);

$lobby.on(updateLobbyStageFx.doneData, (_, lobby) => lobby);
