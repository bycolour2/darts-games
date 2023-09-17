import { chainRoute } from 'atomic-router';
import { attach } from 'effector';
import {
  createKDTurnRequestFx,
  createKDPlayerDetailsRequestFx,
  getKDTurnsRequestFx,
  getKDPlayerDetailsRequestFx,
  getLobbyRequestFx,
} from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config';
import { chainAuthorized } from '~/shared/session';

const lobbyGetFx = attach({ effect: getLobbyRequestFx });
const lobbyDetailsGetFx = attach({ effect: getKDPlayerDetailsRequestFx });
const turnsGetFx = attach({ effect: getKDTurnsRequestFx });
const turnPostFx = attach({ effect: createKDTurnRequestFx });
const playerKDDetailsPostFx = attach({ effect: createKDPlayerDetailsRequestFx });

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
