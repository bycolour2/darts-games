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
    scoreBoard,
    sortedScoreBoard,
    firstScoreChanged,
    sectorChanged,
    isKillerChanged,
    firstScoresFilled,
    sectorsFilled,
    gameStage,
    turnChanged,
    currentTurn,
    playersLifes,
    lifeCheckboxToggled,
    winner,
    sectorRepeatError,
  ] = useUnit([
    gameModel.$lobby,
    gameModel.$scoreBoard,
    gameModel.$sortedScoreBoard,
    gameModel.firstScoreChanged,
    gameModel.sectorChanged,
    gameModel.isKillerChanged,
    gameModel.$allFisrstScoresFilled,
    gameModel.$allSectorsFilled,
    gameModel.$gameStage,
    gameModel.turnChanged,
    gameModel.$currentTurn,
    gameModel.$playersLifes,
    gameModel.lifeCheckboxToggled,
    gameModel.$winner,
    gameModel.$sectorRepeatError,
  ]);

  return (
    <>
      <div className="container mx-auto space-y-6 rounded-lg border bg-slate-50 p-4">
        <h2 className="w-full text-center text-2xl font-semibold">Lobby: {lobby.id}</h2>
        <div className="rounded-lg border border-black px-3 py-1.5">
          <h4 className="mb-3 text-2xl font-semibold">Game info:</h4>
          <div>game stage: {gameStage}</div>
          <div>game round: {currentTurn?.round}</div>
          <div>game turn: {currentTurn?.username}</div>
          <Button onClick={() => turnChanged()} disabled={gameStage !== 'Game'}>
            Next player
          </Button>
          <div>winner: {winner}</div>
        </div>
        <div className="mx-auto grid w-full grid-cols-5 gap-6 rounded-lg border bg-slate-200 p-4">
          <div className="col-span-5 grid grid-cols-5 gap-1">
            <div className="flex items-center justify-center text-xl font-semibold">
              Username
            </div>
            <div className="flex items-center justify-center text-xl font-semibold">
              First score
            </div>
            <div className="flex items-center justify-center text-xl font-semibold">
              Sector
              <span className="pl-2 text-red-700">
                {sectorRepeatError ? 'Error' : ''}
              </span>
            </div>
            <div className="flex items-center justify-center text-xl font-semibold">
              Killer
            </div>
            <div className="flex items-center justify-center text-xl font-semibold">
              Lifes
            </div>
          </div>
          <div className="col-span-5 flex flex-col gap-1">
            {sortedScoreBoard.map((player) => {
              return (
                <motion.div
                  key={player.userId}
                  layout
                  transition={transition}
                  className={cn(
                    'grid min-h-[92px] flex-1 grid-cols-5 gap-4 rounded-xl border border-black bg-cyan-200 px-2 py-2.5 text-5xl font-semibold',
                    {
                      'bg-red-500 bg-opacity-60': player.isKiller,
                      'border-2 border-orange-500': player.userId === currentTurn?.userId,
                    },
                  )}
                >
                  <div
                    className={cn(
                      'flex grow items-center justify-center text-center text-3xl font-semibold ',
                      {
                        'line-through opacity-50': player.isDead,
                      },
                    )}
                  >
                    {player.username}
                  </div>
                  <div className="flex grow items-center justify-center rounded-sm">
                    <Input
                      type="number"
                      value={player.firstScore?.toString() ?? ''}
                      onChange={(e) =>
                        firstScoreChanged({ key: player.userId, value: e.target.value })
                      }
                      disabled={
                        player.isDead ||
                        firstScoresFilled ||
                        gameStage !== 'Turn qualification'
                      }
                      className="text-lg"
                    />
                  </div>
                  <div className="flex grow items-center justify-center rounded-sm">
                    <Input
                      type="number"
                      value={player.sector?.toString() ?? ''}
                      onChange={(e) =>
                        sectorChanged({ key: player.userId, value: e.target.value })
                      }
                      disabled={
                        player.isDead ||
                        sectorsFilled ||
                        gameStage !== 'Sector allocation'
                      }
                      className="text-lg"
                    />
                  </div>
                  <div className="flex grow items-center justify-center rounded-sm">
                    <Checkbox
                      checked={player.isKiller}
                      onCheckedChange={(e) =>
                        isKillerChanged({ key: player.userId, value: Boolean(e) })
                      }
                      disabled={
                        player.isDead ||
                        gameStage !== 'Game' ||
                        player.isKiller ||
                        currentTurn?.userId !== player.userId
                      }
                      className="h-10 w-10 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex grow flex-col items-center justify-center rounded-sm pt-[28px]">
                    <div className="flex w-full flex-row items-center justify-around">
                      {playersLifes[player.userId].lifes.map((life, i) => (
                        <Checkbox
                          key={i}
                          checked={life}
                          onCheckedChange={(e) => {
                            lifeCheckboxToggled({
                              key: player.userId,
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
                            gameStage !== 'Game' ||
                            !scoreBoard.find((p) => p.userId === currentTurn?.userId)
                              ?.isKiller
                          }
                          className="h-10 w-10 rounded-lg bg-white"
                        />
                      ))}
                    </div>
                    <div className="flex min-h-[28px] w-full flex-row items-center justify-around">
                      {/* {playersLifes[player.userId].takenBy.map((killer, i) => (
                        <p key={i} className="w-10 py-1 text-center text-sm">
                          {killer.slice(0, 2)}
                        </p>
                      ))} */}
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
