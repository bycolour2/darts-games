import { cn } from '~/shared/lib';
import { AnimatePresence, motion } from 'framer-motion';
import { gameModel } from '~/pages/Game';

const transition = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
};

export const PlayerRow = () => {
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
    playersFragsCounters,
    winner,
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
    gameModel.$playersFragsCounters,
    gameModel.$winner,
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
    <motion.div
      layout
      transition={transition}
      className={cn('flex max-h-[100px] min-h-[92px] flex-1 text-5xl font-semibold', {
        // 'bg-red-500 bg-opacity-60': player.isKiller,
        // 'bg-orange-200': player.userId === currentTurn?.userId,
      })}
    >
      <div
        className={cn(
          'flex w-36 items-center justify-center border-r border-black px-2.5 text-center text-2xl font-semibold',
          {
            // 'line-through opacity-50': player.isDead,
          },
        )}
      >
        {/* <span className="grow">{player.username}</span> */}
      </div>
      <div className="flex w-28 items-center justify-center border-r border-black px-3.5">
        {/* <Input
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
              /> */}
      </div>
      <div className="flex w-28 items-center justify-center border-r border-black p-3.5">
        {/* <Input
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
              /> */}
      </div>
      <div className="flex w-20 items-center justify-center border-r border-black px-3.5">
        {/* <Checkbox
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
              /> */}
      </div>
      <div className="flex max-w-[24rem] flex-col items-center justify-center border-r border-black px-3.5 pt-[28px]">
        <div className="flex w-full flex-row items-center justify-center gap-4">
          {/* {Array(lobbySettings.lifeCount)
                  .fill('')
                  .map((_, i) => (
                    <Checkbox
                      key={i}
                      checked={playersLifes[player.userId].lifes[i]}
                      onCheckedChange={(e) => {
                        lifeCheckboxToggled({
                          checkboxUserId: player.userId,
                          value: Boolean(e),
                          position: i,
                          user:
                            lobby.users.find((user) => user.id === currentTurn?.userId) ??
                            null,
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
                  ))} */}
        </div>
        <div className="flex min-h-[28px] w-full flex-row items-center justify-center gap-4">
          {/* {playersLifes[player.userId].takenBy.map((killer, i) => (
                  <p key={i} className="w-10 py-1 text-center text-sm">
                    {killer ? killer.username.slice(0, 2) : null}
                  </p>
                ))} */}
        </div>
      </div>
      <div className="flex h-[44x] flex-[1_1_40px] grow flex-wrap items-center gap-3 p-1">
        {/* <AnimatePresence>
            {playersFragsCounters[player.userId].map(
              (fragType, fragIndex) => (
                <motion.img
                  key={`${fragIndex}_${player.id}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.6 }}
                  src={fragType === 'frag' ? FragMedal : ThisMedal}
                  className="w-9"
                ></motion.img>
              ),
            )}
          </AnimatePresence> */}
      </div>
    </motion.div>
  );
};
