import { GamesList } from '~/widgets/GamesList';
import { LobbyList } from '~/widgets/LobbyList';

export const Page = () => {
  return (
    <div className="flex h-full w-full flex-row gap-4">
      <GamesList />
      <LobbyList />
    </div>
  );
};
