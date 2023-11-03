import { attach } from 'effector';
import {
  getKDLobbySettingsRequestFx,
  getKDTurnsRequestFx,
  getLobbyRequestFx,
  getStagesByGameIdRequestFx,
} from '~/shared/api/supabaseApi';

const getLobbyFx = attach({ effect: getLobbyRequestFx });
const getStagesFx = attach({ effect: getStagesByGameIdRequestFx });
const getLobbyKDSettingsFx = attach({ effect: getKDLobbySettingsRequestFx });
const getTurnsFx = attach({ effect: getKDTurnsRequestFx });
