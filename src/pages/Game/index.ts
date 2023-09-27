import { AuthenticatedLayout, Spinner } from '~/shared/ui';
import { allDataLoadedRoute, currentRoute } from './model/model';
import { GamePage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const GameRoute = {
  route: currentRoute,
  layout: AuthenticatedLayout,
  view: createRouteView<unknown, { gameId: string; lobbyId: string }, any>({
    route: allDataLoadedRoute,
    view: GamePage,
    otherwise: Spinner,
  }),
};

export * as gameModel from './model/model';
