import { createRouteView } from 'atomic-router-react';
import { Spinner } from '~/shared/ui';
import { AuthenticatedLayout } from '~/shared/ui';
import { allDataLoadedRoute, authorizedRoute, currentRoute } from './model/gamesPage';
import { Page as GamesPage } from './ui/Page';

export const GamesRoute = {
  route: authorizedRoute,
  layout: AuthenticatedLayout,
  view: createRouteView({
    route: allDataLoadedRoute,
    view: GamesPage,
    otherwise: Spinner,
  }),
};

export * as gamesPageModel from './model/gamesPage';
