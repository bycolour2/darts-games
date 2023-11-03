import { useUnit } from 'effector-react';
import { LobbyGameInfo, LobbySettingsInfo } from '~/entities/lobby';
import { gameModel } from '~/pages/Game';

export const LobbyFullInfo = () => {
  const [lobby, lobbySettings, currentStage, currentTurn] = useUnit([
    gameModel.$lobby,
    gameModel.$lobbySettings,
    gameModel.$currentStage,
    gameModel.$currentTurn,
  ]);
  return (
    <div className="flex w-full gap-12 rounded-lg border border-black px-3 py-1.5">
      <LobbyGameInfo
        stage={currentStage.title}
        round={currentTurn?.round ?? 1}
        currentPlayerUsername={currentTurn?.username ?? ''}
        winner={lobby.winner}
      />
      <LobbySettingsInfo lobbySettings={lobbySettings} />
    </div>
  );
};
