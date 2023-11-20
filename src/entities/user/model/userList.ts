import { attach, createEvent, restore, createStore, sample } from 'effector';
import { debounce, or, throttle } from 'patronum';

import {
  NotSBUser,
  getUsersPaginatedRequestFx,
  getUsersRequestFx,
} from '~/shared/api/supabaseApi';

export const getUsersFx = attach({ effect: getUsersRequestFx });
export const getUsersPaginatedFx = attach({ effect: getUsersPaginatedRequestFx });

export const $users = restore(getUsersFx, []);

export const $usersPaginated = createStore<NotSBUser[]>([]);

sample({
  clock: getUsersPaginatedFx.done,
  target: getUsersFx,
});

sample({
  clock: getUsersPaginatedFx.doneData,
  fn: (users) => (users.length > 10 ? users.slice(0, -1) : users),
  target: $usersPaginated,
});

export const $pageLoading = or(getUsersPaginatedFx.pending, getUsersFx.pending);
export const $countLoadint = getUsersFx.pending;
export const $currentPage = createStore(1);
export const $maxPages = createStore<number | null>(null);
export const $hasNext = createStore(false);
export const $hasPrev = createStore(false);

$maxPages.on(getUsersFx.doneData, (_, users) => Math.ceil(users.length / 10));

sample({
  clock: getUsersPaginatedFx.doneData,
  fn: (users) => users.length === 11,
  target: $hasNext,
});
sample({
  clock: $currentPage,
  fn: (currentPage) => currentPage > 1,
  target: $hasPrev,
});

export const nextPage = createEvent();
export const prevPage = createEvent();
export const pageSetted = createEvent<number>();

$currentPage.on(nextPage, (state) => state + 1);
$currentPage.on(prevPage, (state) => state - 1);
$currentPage.on(pageSetted, (_, page) => page);

export const $filter = createStore({
  field: 'username',
  value: '',
});
export const filterChanged = createEvent<string>();

$filter.on(filterChanged, (state, filterValue) => ({
  ...state,
  value: filterValue,
}));

const debouncedFilterChanged = debounce({ source: filterChanged, timeout: 500 });

sample({
  clock: $currentPage,
  source: { filter: $filter },
  fn: ({ filter }, page) => ({ page, filter }),
  target: getUsersPaginatedFx,
});

sample({
  clock: debouncedFilterChanged,
  source: { currentPage: $currentPage, filter: $filter },
  fn: ({ currentPage, filter }) => ({ page: currentPage, filter }),
  target: getUsersPaginatedFx,
});
