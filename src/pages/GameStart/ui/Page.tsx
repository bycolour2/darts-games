import { useForm } from 'effector-forms';
import { useList, useUnit } from 'effector-react';

import { cn } from '~/shared/lib';
import { Button, Checkbox, Input, Label, Spinner } from '~/shared/ui';

import { gameModel } from '~/entities/game';

import { PlayerSelect, playerSelectModel } from '~/widgets/PlayerSelect';

import { gameStartModel } from '../model';

export const Page = () => {
  const [selectedUsers, startGamePending, game] = useUnit([
    playerSelectModel.$selectedUsers,
    gameStartModel.$gameStartPending,
    gameModel.$game,
  ]);
  const [userSelectionToggled, startGameButtonPressed] = useUnit([
    playerSelectModel.userSelectionToggled,
    gameStartModel.startGameButtonPressed,
  ]);

  const { fields, eachValid } = useForm(gameStartModel.lobbySettingsForm);

  return (
    <>
      <div className="container mx-auto space-y-4 rounded-lg border bg-slate-50 p-4">
        <h2 className="w-full text-center text-2xl font-semibold">{game.name}</h2>
        <PlayerSelect />
        {/* <div className="mx-auto grid w-full grid-cols-2 items-start gap-8 rounded-lg border bg-slate-200 px-7 py-5">
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
        </div> */}
        <Button
          type="button"
          size="lg"
          onClick={() => startGameButtonPressed()}
          className="w-full text-lg uppercase tracking-widest"
          disabled={selectedUsers.length < 2 || startGamePending || !eachValid}
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
