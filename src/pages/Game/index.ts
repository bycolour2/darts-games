import { MainLayout, Spinner } from '~/shared/ui';
import { currentRoute, turnsLoadedRoute } from './model/modelNew';
import { GamePage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';
import { GamePageNew } from './ui/PageNew';

export const GameRoute = {
  route: currentRoute,
  layout: MainLayout,
  view: createRouteView<unknown, { gameId: string; lobbyId: string }, any>({
    route: turnsLoadedRoute,
    view: GamePageNew,
    otherwise: Spinner,
  }),
};

// export * as gameModel from './model/model';
export * as gameModelNew from './model/modelNew';
