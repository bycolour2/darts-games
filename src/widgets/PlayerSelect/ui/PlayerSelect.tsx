import { useList, useUnit } from 'effector-react';

import { cn } from '~/shared/lib';
import { Button, Input, Skeleton, Spinner } from '~/shared/ui';

import { userListModel } from '~/entities/user';

import { playerSelectModel } from '..';

export const PlayerSelect = () => {
  const [
    selectedUsers,
    filter,
    currentPage,
    hasNext,
    hasPrev,
    pageLoading,
    maxPages,
    countLoading,
  ] = useUnit([
    playerSelectModel.$selectedUsers,
    userListModel.$filter,
    userListModel.$currentPage,
    userListModel.$hasNext,
    userListModel.$hasPrev,
    userListModel.$pageLoading,
    userListModel.$maxPages,
    userListModel.$countLoadint,
  ]);
  const [userSelectionToggled, filterChanged, nextPage, prevPage] = useUnit([
    playerSelectModel.userSelectionToggled,
    userListModel.filterChanged,
    userListModel.nextPage,
    userListModel.prevPage,
  ]);

  const selectedUsersList = useList(playerSelectModel.$selectedUsers, (selectedUser) => (
    <div className="flex w-28 flex-col">
      <img
        src={selectedUser.avatar}
        alt={`${selectedUser.username}'s avatar`}
        className="mx-auto mb-2 aspect-square w-24 rounded-full bg-orange-500"
      />
      <h4 className="truncate text-center font-semibold uppercase">
        {selectedUser.username}
      </h4>
    </div>
  ));

  const usersList = useList(userListModel.$usersPaginated, {
    keys: [selectedUsers],
    fn: (user) => {
      const isUserSelected = selectedUsers.includes(user) ? true : false;

      return (
        <li
          className={cn(
            'flex w-full flex-row items-center justify-start gap-2 rounded-md px-2 py-1',
            {
              'bg-orange-300': isUserSelected,
            },
          )}
          onClick={() => userSelectionToggled(user)}
        >
          <img
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            draggable={false}
            className="aspect-square w-8 rounded-full bg-orange-500"
          />
          <h4 className="truncate text-center font-semibold uppercase">
            {user.username}
          </h4>
        </li>
      );
    },
  });

  return (
    <div className="flex h-[34.5rem] flex-row gap-4">
      <div className="mx-auto w-2/3 rounded-lg border bg-slate-200 p-4">
        <div className="flex h-full flex-row flex-wrap items-center justify-center gap-3">
          {selectedUsers.length ? (
            selectedUsersList
          ) : (
            <p className="text-center text-4xl font-bold uppercase">
              No players selected
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto flex w-1/3 flex-col gap-1 overflow-x-auto rounded-lg border bg-slate-200 px-2 py-3">
        <Input
          className="mb-1"
          value={filter.value}
          onChange={(e) => filterChanged(e.target.value)}
        />
        <ul className="flex grow flex-col gap-1">
          {pageLoading ? <Spinner /> : usersList}
        </ul>
        <div className="relative mt-1 inline-flex items-center justify-center gap-2">
          <div className="absolute left-0 text-xs">
            {maxPages === null ? (
              <Skeleton className="h-4 w-[70px]" />
            ) : (
              <span>
                Page {currentPage} of {maxPages}
              </span>
            )}
          </div>
          <Button size={'sm'} onClick={prevPage} disabled={!hasPrev}>
            {'<'}
          </Button>

          <Button size={'sm'}>{currentPage}</Button>
          <Button size={'sm'} onClick={nextPage} disabled={!hasNext}>
            {'>'}
          </Button>
        </div>
      </div>
    </div>
  );
};
