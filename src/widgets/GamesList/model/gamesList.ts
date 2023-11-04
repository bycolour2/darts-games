import { attach, restore } from 'effector';
import { createGate } from 'effector-react';
import { debug } from 'patronum';

import { getGamesRequestFx } from '~/shared/api/supabaseApi';
export const getGamesFx = attach({ effect: getGamesRequestFx });

export const GamesPageGate = createGate('gamesPage gate');

// debug(gamesPageModel.Gate.status);

export const $games = restore(getGamesFx, []);
export const $gamesPending = getGamesFx.pending;
