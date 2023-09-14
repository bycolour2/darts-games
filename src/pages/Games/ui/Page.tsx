import { $games, $lobbies } from '../model/model';
import { useList, useUnit } from 'effector-react';
import { Link } from 'atomic-router-react';
import { routes } from '~/shared/config';

export const GamesPage = () => {
  const [games] = useUnit([$games]);
  const gamesList = useList($games, (item) => (
    <Link
      to={routes.games.start}
      params={{ gameId: item.id }}
      className="flex aspect-square items-center justify-center rounded-full bg-red-500 p-3 text-center text-4xl font-semibold text-white"
    >
      {item.name}
    </Link>
  ));

  const lobbiesList = useList($lobbies, (lobby) => (
    <li className="flex flex-row items-center justify-between border-2 border-black">
      <div>{lobby.id}</div>
      <div>{lobby.gameName}</div>
      <div>{lobby.createdAt}</div>
      <div>{lobby.finished}</div>
      <div>{lobby.winner?.username}</div>
      <div>{lobby.closed}</div>
      <div>
        {lobby.users.map((user, i) => (
          <p key={i}>{user.username}</p>
        ))}
      </div>
      <div>
        <Link
          to={routes.games.game}
          params={{
            gameId: games.find((game) => game.name === lobby.gameName)!.id,
            lobbyId: lobby.id,
          }}
        >
          Open
        </Link>
      </div>
    </li>
  ));

  return (
    <>
      <div className="container mx-auto space-y-4 rounded-lg border bg-slate-50 p-4">
        <h2 className="mb-6 w-full text-center text-3xl font-semibold">
          Choose the game
        </h2>
        <div className="grid grid-cols-6 gap-5">{gamesList}</div>
      </div>
      <div className="container mx-auto space-y-4 rounded-lg border bg-slate-50 p-4">
        <h4 className="mb-6 w-full text-center text-2xl font-semibold">Lobby list:</h4>
        <ul className="flex w-full flex-col">{lobbiesList}</ul>
      </div>
    </>
  );
};
