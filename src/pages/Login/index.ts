import { AnonymousLayout, Spinner } from '~/shared/ui';
import { anonymousRoute, currentRoute } from './model/model';
import { LoginPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const LoginRoute = {
  route: currentRoute,
  layout: AnonymousLayout,
  view: createRouteView({ route: anonymousRoute, view: LoginPage, otherwise: Spinner }),
};

export * as loginModel from './model/model';
