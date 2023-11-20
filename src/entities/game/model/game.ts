import { attach, restore } from 'effector';

import { Game, getGameRequestFx } from '~/shared/api/supabaseApi';

export const getGameFx = attach({ effect: getGameRequestFx });

export const $game = restore(getGameFx, {} as Game);
