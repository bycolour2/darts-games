import { LobbyFullInfo } from '~/widgets/LobbyFullInfo';
import { Scoreboard } from '~/widgets/ScoreBoard/ui/ScoreBoard';

export const GamePage = () => {
  return (
    <>
      <div className="container mx-auto space-y-6 rounded-lg border bg-slate-50 p-4">
        <div className="mx-auto w-full space-y-4 rounded-lg border border-black p-4">
          <LobbyFullInfo />
        </div>
        <Scoreboard />
      </div>
    </>
  );
};
