import { AuthenticatedLayout, Spinner } from '~/shared/ui';
import { allDataLoadedRoute, currentRoute } from './model/model';
import { GameStartPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const GameStartRoute = {
  route: currentRoute,
  layout: AuthenticatedLayout,
  view: createRouteView<unknown, { gameId: string }, any>({
    route: allDataLoadedRoute,
    view: GameStartPage,
    otherwise: Spinner,
  }),
};

export * as gameStartModel from './model/model';
