import { Button, Checkbox, Input, Label, Spinner } from '~/shared/ui';
import { useList, useUnit } from 'effector-react';
import { cn } from '~/shared/lib';
import { gameStartModel } from '..';
import { useForm } from 'effector-forms';
import { lobbySettingsForm } from '../model/model';
import { ChangeEvent } from 'react';

export const GameStartPage = () => {
  const [userToggled, createLobbyButtonPressed, selectedUsers, startGamePending, game] =
    useUnit([
      gameStartModel.userToggled,
      gameStartModel.createLobbyButtonPressed,
      gameStartModel.$selectedUsers,
      gameStartModel.$gameStartPending,
      gameStartModel.$game,
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
            draggable={false}
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

  const { fields, submit, eachValid } = useForm(lobbySettingsForm);

  return (
    <>
      <div className="container mx-auto space-y-4 rounded-lg border bg-slate-50 p-4">
        <h2 className="w-full text-center text-2xl font-semibold">{game.name}</h2>
        <div className="mx-auto h-[250px] w-full rounded-lg border bg-slate-200 p-4">
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
        <div className="mx-auto flex gap-6 overflow-x-auto rounded-lg border bg-slate-200 px-7 py-5">
          {usersList}
        </div>
        <div className="mx-auto grid w-full grid-cols-2 items-start gap-8 rounded-lg border bg-slate-200 px-7 py-5">
          <div>
            <Label htmlFor={fields.lifeCount.name}>Life count</Label>
            <Input
              id={fields.lifeCount.name}
              type="number"
              value={fields.lifeCount.value}
              onChange={(e) => fields.lifeCount.onChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="">
              <Checkbox
                id={fields.hasAdditionalLife.name}
                checked={fields.hasAdditionalLife.value}
                onCheckedChange={(checkedState) =>
                  fields.hasAdditionalLife.onChange(checkedState as boolean)
                }
                className="mr-1"
              />
              <Label htmlFor={fields.hasAdditionalLife.name}>Additioanal life</Label>
            </div>
            <div>
              <Label htmlFor={fields.additionalLifeRule.name}>Additioan life rule</Label>
              <Input
                id={fields.additionalLifeRule.name}
                type="text"
                value={fields.additionalLifeRule.value}
                disabled={!fields.hasAdditionalLife.value}
                onChange={(e) => fields.additionalLifeRule.onChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={() => createLobbyButtonPressed()}
          className="w-full text-lg uppercase tracking-widest"
          disabled={!selectedUsers.length || startGamePending || !eachValid}
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
