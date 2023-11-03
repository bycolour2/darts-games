import { AnonymousLayout, Spinner } from '~/shared/ui';
import { anonymousRoute, currentRoute } from './model/registerPage';
import { Page as RegisterPage } from './ui/Page';
import { createRouteView } from 'atomic-router-react';

export const RegisterRoute = {
  route: currentRoute,
  layout: AnonymousLayout,
  view: createRouteView({
    route: anonymousRoute,
    view: RegisterPage,
    otherwise: Spinner,
  }),
};

export * as registerPageModel from './model/registerPage';
