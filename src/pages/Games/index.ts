import { createRouteView } from 'atomic-router-react';

import { Spinner } from '~/shared/ui';
import { AuthenticatedLayout } from '~/shared/ui';

import { GamesPageModel } from './model';
import { GamesPage } from './ui';

export const GamesRoute = {
  route: GamesPageModel.authorizedRoute,
  layout: AuthenticatedLayout,
  view: createRouteView({
    route: GamesPageModel.allDataLoadedRoute,
    view: GamesPage,
    otherwise: Spinner,
  }),
};
