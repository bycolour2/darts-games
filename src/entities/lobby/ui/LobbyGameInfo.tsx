import { UserDetails } from '~/shared/api/supabaseApi';

type LobbyGameInfoProps = {
  stage: string;
  round: number;
  currentPlayerUsername: string;
  winner: UserDetails | null;
};

export const LobbyGameInfo = ({
  stage,
  round,
  currentPlayerUsername,
  winner,
}: LobbyGameInfoProps) => {
  return (
    <>
      <div className="">
        <h4 className="mb-3 text-2xl font-semibold">Game info:</h4>
        <div>Game stage: {stage}</div>
        <div>Game round: {round}</div>
        <div>Game turn: {currentPlayerUsername}</div>
        {winner ? (
          <div className="inline-flex items-center">
            Winner: <img src={winner.avatar} className="ml-3 aspect-square w-12" />
            {winner.username}
          </div>
        ) : null}
      </div>
    </>
  );
};
