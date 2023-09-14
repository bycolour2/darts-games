import { MainLayout, Spinner } from '~/shared/ui';
import { usersLoadedRoute } from './model/model';
import { GameStartPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const GameStartRoute = {
  route: usersLoadedRoute,
  layout: MainLayout,
  view: createRouteView<unknown, { gameId: string }, any>({
    route: usersLoadedRoute,
    view: GameStartPage,
    otherwise: Spinner,
  }),
};

export * as gameStartModel from './model/model';
