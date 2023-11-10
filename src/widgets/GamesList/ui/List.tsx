import { Link } from 'atomic-router-react';
import { useList, useUnit } from 'effector-react';

import { routes } from '~/shared/config';
import { Spinner } from '~/shared/ui';

import { gamesListModel } from '~/entities/game';

export const List = () => {
  const [gamesPending] = useUnit([gamesListModel.$gamesPending]);
  const gamesList = useList(gamesListModel.$games, (item) => (
    <Link
      to={routes.games.start}
      params={{ gameId: item.id }}
      className="flex aspect-square items-center justify-center rounded-full bg-red-500 p-3 text-center text-2xl font-semibold text-white"
    >
      {item.name}
    </Link>
  ));

  return (
    <div className="w-3/5 rounded-lg border bg-slate-50 p-4">
      <h2 className="mb-6 w-full text-center text-3xl font-semibold">Choose the game</h2>
      {gamesPending ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-4 gap-5">{gamesList}</div>
      )}
    </div>
  );
};
