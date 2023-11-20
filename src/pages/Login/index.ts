import { createRouteView } from 'atomic-router-react';

import { AnonymousLayout, Spinner } from '~/shared/ui';

import { loginPageModel } from './model';
import { LoginPage } from './ui';

export const LoginRoute = {
  route: loginPageModel.currentRoute,
  layout: AnonymousLayout,
  view: createRouteView({
    route: loginPageModel.anonymousRoute,
    view: LoginPage,
    otherwise: Spinner,
  }),
};
