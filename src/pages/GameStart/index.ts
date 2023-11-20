import { createRouteView } from 'atomic-router-react';

import { AuthenticatedLayout, Spinner } from '~/shared/ui';

import { gameStartModel } from './model';
import { GameStartPage } from './ui';

export const GameStartRoute = {
  route: gameStartModel.currentRoute,
  layout: AuthenticatedLayout,
  view: createRouteView<unknown, { gameId: string }, any>({
    route: gameStartModel.allDataLoadedRoute,
    view: GameStartPage,
    otherwise: Spinner,
  }),
};
