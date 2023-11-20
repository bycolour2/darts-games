import { createRouteView } from 'atomic-router-react';

import { AnonymousLayout, Spinner } from '~/shared/ui';

import { registerPageModel } from './model';
import { RegisterPage } from './ui';

export const RegisterRoute = {
  route: registerPageModel.currentRoute,
  layout: AnonymousLayout,
  view: createRouteView({
    route: registerPageModel.anonymousRoute,
    view: RegisterPage,
    otherwise: Spinner,
  }),
};
