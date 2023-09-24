import { useUnit } from 'effector-react';
import { gameModel } from '..';
import { cn } from '~/shared/lib';
import { Checkbox } from '~/shared/ui/checkbox';
import { Button, Input } from '~/shared/ui';
import { motion } from 'framer-motion';

const transition = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
};

export const GamePage = () => {
  const [
    lobby,
    lobbySettings,
    playerDetails,
    playersLifes,
    currentTurn,
    currentStage,
    allFisrstScoresFilled,
    sectorRepeatError,
    allSectorsFilled,
    dartsCounter,
  ] = useUnit([
    gameModel.$lobby,
    gameModel.$lobbySettings,
    gameModel.$playerDetails,
    gameModel.$playersLifes,
    gameModel.$currentTurn,
    gameModel.$currentStage,
    gameModel.$allFisrstScoresFilled,
    gameModel.$sectorRepeatError,
    gameModel.$allSectorsFilled,
    gameModel.$dartsCounter,
  ]);
  const [
    firstScoreChanged,
    sectorChanged,
    isKillerChanged,
    lifeCheckboxToggled,
    turnChanged,
  ] = useUnit([
    gameModel.firstScoreChanged,
    gameModel.sectorChanged,
    gameModel.isKillerChanged,
    gameModel.lifeCheckboxToggled,
    gameModel.turnChanged,
  ]);

  return (
    <>
      <div className="container mx-auto space-y-6 rounded-lg border bg-slate-50 p-4">
        <h2 className="w-full text-center text-2xl font-semibold">Lobby: {lobby.id}</h2>
        <div className="space-y-2 rounded-lg border border-black px-3 py-1.5">
          <h4 className="mb-3 text-2xl font-semibold">Game info:</h4>
          <div>game stage: {currentStage.title}</div>
          <div>game round: {currentTurn?.round ? currentTurn.round : ''}</div>
          <div>game turn: {currentTurn?.username ? currentTurn.username : ''}</div>
          <div className="group relative w-fit">
            <div
              className={cn(
                'absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 opacity-25 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200',
                {
                  hidden:
                    dartsCounter.length !== 3 || currentStage.title === 'Game finished',
                },
              )}
            ></div>
            <Button
              onClick={() => turnChanged()}
              disabled={currentStage.title !== 'Game'}
              className="relative"
            >
              Next turn
            </Button>
          </div>
          <div>winner: {lobby.winner?.username}</div>
        </div>
        <div></div>
        <div className="mx-auto grid w-full grid-cols-5 gap-6 rounded-lg border bg-slate-200 p-4">
          <div className="col-span-5 flex items-center">
            <div className="flex w-36 items-center justify-center text-xl font-semibold">
              Username
            </div>
            <div className="flex w-28 items-center justify-center text-xl font-semibold">
              First score
            </div>
            <div className="flex w-28 items-center justify-center text-xl font-semibold">
              Sector
              <span className="pl-2 text-red-700">
                {sectorRepeatError ? 'Error' : ''}
              </span>
            </div>
            <div className="flex w-20 items-center justify-center text-xl font-semibold">
              Killer
            </div>
            <div className="flex items-center justify-center pl-5 text-xl font-semibold">
              Lifes
            </div>
          </div>
          <div className="col-span-5 flex border-collapse flex-col">
            {playerDetails.map((player) => {
              return (
                <motion.div
                  key={player.userId}
                  layout
                  transition={transition}
                  className={cn(
                    'flex min-h-[92px] flex-1 border-2 border-black bg-cyan-200 text-5xl font-semibold',
                    {
                      'bg-red-500 bg-opacity-60': player.isKiller,
                      'border-orange-500': player.userId === currentTurn?.userId,
                    },
                  )}
                >
                  <div
                    className={cn(
                      'flex w-36 items-center justify-center border-r border-black px-2.5 text-center text-2xl font-semibold',
                      {
                        'line-through opacity-50': player.isDead,
                      },
                    )}
                  >
                    {player.username}
                  </div>
                  <div className="flex w-28 items-center justify-center border-r border-black px-3.5">
                    <Input
                      type="number"
                      value={player.firstScore?.toString() ?? '0'}
                      onChange={(e) =>
                        firstScoreChanged({
                          userId: player.userId,
                          value: e.target.value,
                        })
                      }
                      disabled={
                        player.isDead ||
                        allFisrstScoresFilled ||
                        currentStage.title !== 'Turn qualification'
                      }
                      className="text-lg"
                    />
                  </div>
                  <div className="flex w-28 items-center justify-center border-r border-black p-3.5">
                    <Input
                      type="number"
                      value={player.sector?.toString() ?? '0'}
                      onChange={(e) =>
                        sectorChanged({ userId: player.userId, value: e.target.value })
                      }
                      disabled={
                        player.isDead ||
                        allSectorsFilled ||
                        currentStage.title !== 'Sector allocation'
                      }
                      className="text-lg"
                    />
                  </div>
                  <div className="flex w-20 items-center justify-center border-r border-black px-3.5">
                    <Checkbox
                      checked={player.isKiller}
                      onCheckedChange={(e) =>
                        isKillerChanged({ userId: player.userId, value: Boolean(e) })
                      }
                      disabled={
                        player.isDead ||
                        currentStage.title !== 'Game' ||
                        (dartsCounter.length === 3 && !player.isKiller) ||
                        currentTurn?.userId !== player.userId
                      }
                      className="h-10 w-10 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex max-w-[24rem] flex-col items-center justify-center border-r border-black px-3.5 pt-[28px]">
                    <div className="flex w-full flex-row items-center justify-center gap-4">
                      {Array(lobbySettings.lifeCount)
                        .fill('')
                        .map((_, i) => (
                          <Checkbox
                            key={i}
                            checked={playersLifes[player.userId].lifes[i]}
                            onCheckedChange={(e) => {
                              lifeCheckboxToggled({
                                userId: player.userId,
                                value: Boolean(e),
                                position: i,
                                user:
                                  lobby.users.find(
                                    (user) => user.id === currentTurn?.userId,
                                  ) ?? null,
                                sector: player.sector ? player.sector : null,
                              });
                            }}
                            disabled={
                              currentStage.title !== 'Game' ||
                              (dartsCounter.length === 3 &&
                                !playersLifes[player.userId].lifes[i]) ||
                              !playerDetails.find((p) => p.userId === currentTurn?.userId)
                                ?.isKiller
                            }
                            className={cn('h-10 w-10 rounded-lg bg-white', {
                              'opacity-50': player.isDead,
                            })}
                          />
                        ))}
                    </div>
                    <div className="flex min-h-[28px] w-full flex-row items-center justify-center gap-4">
                      {playersLifes[player.userId].takenBy.map((killer, i) => (
                        <p key={i} className="w-10 py-1 text-center text-sm">
                          {killer ? killer.username.slice(0, 2) : null}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
