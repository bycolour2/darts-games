import {
  createHistoryRouter,
  createRoute,
  createRouterControls,
  redirect,
} from 'atomic-router';
import { sample } from 'effector';
import { createBrowserHistory } from 'history';
import { appStarted } from './init';

export const routes = {
  home: createRoute(),
  games: {
    base: createRoute(),
    start: createRoute<{ gameId: string }>(),
    game: createRoute<{ gameId: string; lobbyId: string }>(),
    result: createRoute<{ gameId: string }>(),
  },
  users: {
    base: createRoute(),
    add: createRoute(),
    edit: createRoute<{ userId: string }>(),
  },
  auth: {
    login: createRoute(),
    register: createRoute(),
  },
  test: createRoute(),
  notFound: createRoute(),
};

export const controls = createRouterControls();

export const router = createHistoryRouter({
  routes: [
    { path: '/', route: routes.home },
    {
      path: '/login',
      route: routes.auth.login,
    },
    {
      path: '/register',
      route: routes.auth.register,
    },
    {
      path: '/games',
      route: routes.games.base,
    },
    {
      path: '/games/:gameId/start',
      route: routes.games.start,
    },
    {
      path: '/games/:gameId/lobby/:lobbyId',
      route: routes.games.game,
    },
    {
      path: '/games/:gameId/result',
      route: routes.games.result,
    },
    {
      path: '/users',
      route: routes.users.base,
    },
    {
      path: '/users/add',
      route: routes.users.add,
    },
    {
      path: '/users/:userId/delete',
      route: routes.users.edit,
    },
    {
      path: '/test',
      route: routes.test,
    },
  ],
  // notFoundRoute: routes.notFound,
  controls,
});

sample({
  clock: appStarted,
  fn: () => createBrowserHistory(),
  target: router.setHistory,
});

redirect({
  clock: routes.home.opened,
  route: routes.auth.login,
});
