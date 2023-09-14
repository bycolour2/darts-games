import { MainLayout, Spinner } from '~/shared/ui';
import { currentRoute, turnsLoadedRoute } from './model/model';
import { GamePage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const GameRoute = {
  route: currentRoute,
  layout: MainLayout,
  view: createRouteView<unknown, { gameId: string; lobbyId: string }, any>({
    route: turnsLoadedRoute,
    view: GamePage,
    otherwise: Spinner,
  }),
};

export * as gameModel from './model/model';
