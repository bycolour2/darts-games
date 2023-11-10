import { attach, restore } from 'effector';
import { debug } from 'patronum';

import { getGamesRequestFx } from '~/shared/api/supabaseApi';
export const getGamesFx = attach({ effect: getGamesRequestFx });

// debug({ trace: true }, GamesListGate.status);

export const $games = restore(getGamesFx, []);
export const $gamesPending = getGamesFx.pending;
