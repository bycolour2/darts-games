import { Button, Spinner } from '~/shared/ui';
import { useList, useUnit } from 'effector-react';
import { cn } from '~/shared/lib';
import { gameStartModel } from '..';

export const GameStartPage = () => {
  const [userToggled, createLobbyButtonPressed, selectedUsers, startGamePending] =
    useUnit([
      gameStartModel.userToggled,
      gameStartModel.createLobbyButtonPressed,
      gameStartModel.$selectedUsers,
      gameStartModel.$gameStartPending,
    ]);
  const usersList = useList(gameStartModel.$users, {
    keys: [selectedUsers],
    fn: (user) => {
      const isUserSelected = selectedUsers.includes(user) ? true : false;

      return (
        <div
          className={cn('flex w-32 flex-col rounded-md px-2 py-3', {
            'bg-orange-300': isUserSelected,
          })}
          onClick={() => userToggled(user)}
        >
          <img
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            className="mx-auto mb-2 aspect-square w-24 rounded-full bg-orange-500"
          />
          <h4 className="truncate text-center font-semibold uppercase">
            {user.username}
          </h4>
        </div>
      );
    },
  });

  const selectedUsersList = useList(gameStartModel.$selectedUsers, (selectedUser) => (
    <div className="flex w-32 flex-col">
      <img
        src={selectedUser.avatar}
        alt={`${selectedUser.username}'s avatar`}
        className="mx-auto mb-2 aspect-square w-28 rounded-full bg-orange-500"
      />
      <h4 className="truncate text-center font-semibold uppercase">
        {selectedUser.username}
      </h4>
    </div>
  ));

  return (
    <>
      <div className="container mx-auto space-y-6 rounded-lg border bg-slate-50 p-4">
        <h2 className="w-full text-center text-2xl font-semibold">{/* {game.name} */}</h2>
        <div className="mx-auto h-[400px] w-full rounded-lg border bg-slate-200 p-4">
          <div className="flex h-full flex-row items-center justify-center gap-3">
            {selectedUsers.length ? (
              selectedUsersList
            ) : (
              <p className="text-center text-4xl font-bold uppercase">
                No players selected
              </p>
            )}
          </div>
        </div>
        <div className="mx-auto flex w-full gap-6 overflow-x-auto rounded-lg border bg-slate-200 px-7 py-5">
          {usersList}
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => createLobbyButtonPressed()}
          className="w-full text-lg uppercase tracking-widest"
          disabled={!selectedUsers.length || startGamePending}
        >
          Start Game
          {startGamePending && (
            <div className="h-7 w-7 pl-2">
              <Spinner />
            </div>
          )}
        </Button>
      </div>
    </>
  );
};
