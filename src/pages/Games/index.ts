import { Spinner } from '~/shared/ui';
import { currentRoute, lobbiesLoadedRoute } from './model/model';
import { GamesPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';
import { MainLayout } from '~/shared/ui';

export const GamesRoute = {
  route: currentRoute,
  layout: MainLayout,
  view: createRouteView({
    route: lobbiesLoadedRoute,
    view: GamesPage,
    otherwise: Spinner,
  }),
};
