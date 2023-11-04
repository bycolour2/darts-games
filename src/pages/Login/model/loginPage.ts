import { createEvent } from 'effector';

import { routes } from '~/shared/config/routing';
import { sessionModel } from '~/shared/session';

export const currentRoute = routes.auth.login;
export const anonymousRoute = sessionModel.chainAnonymous(currentRoute, {
  otherwise: routes.games.base.open,
});

export const loginPageMounted = createEvent();
