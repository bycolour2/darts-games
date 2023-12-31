import { Spinner } from '~/shared/ui';
import { allDataLoadedRoute, currentRoute } from './model/model';
import { GamesPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';
import { AuthenticatedLayout } from '~/shared/ui';

export const GamesRoute = {
  route: currentRoute,
  layout: AuthenticatedLayout,
  view: createRouteView({
    route: allDataLoadedRoute,
    view: GamesPage,
    otherwise: Spinner,
  }),
};

export * as gamesModel from './model/model';
