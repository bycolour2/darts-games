import { useList, useUnit } from 'effector-react';
import { Link } from 'atomic-router-react';
import { routes } from '~/shared/config';
import dayjs from 'dayjs';
import { gamesModel } from '..';
import { Button } from '~/shared/ui';

export const GamesPage = () => {
  const [games] = useUnit([gamesModel.$games]);
  const [deleteLobbyButtonClicked] = useUnit([gamesModel.deleteLobbyButtonClicked]);
  const gamesList = useList(gamesModel.$games, (item) => (
    <Link
      to={routes.games.start}
      params={{ gameId: item.id }}
      className="flex aspect-square items-center justify-center rounded-full bg-red-500 p-3 text-center text-4xl font-semibold text-white"
    >
      {item.name}
    </Link>
  ));

  const lobbiesList = useList(gamesModel.$lobbies, (lobby) => (
    <li className="flex flex-row items-center justify-between border-2 border-black">
      <div>{lobby.id}</div>
      <div>{lobby.game.name}</div>
      <div>{dayjs(lobby.createdAt).format('DD.MM.YYYY HH:mm')}</div>
      <div>{lobby.finished}</div>
      <div>{lobby.winner?.username}</div>
      <div>{lobby.closed}</div>
      <div>
        {lobby.users.map((user, i) => (
          <p key={i}>{user.username}</p>
        ))}
      </div>
      <Link
        to={routes.games.game}
        params={{
          gameId: games.find((game) => game.name === lobby.game.name)!.id,
          lobbyId: lobby.id,
        }}
      >
        <Button type="button">Open</Button>
      </Link>
      <Button
        type="button"
        onClick={() => deleteLobbyButtonClicked({ lobbyId: lobby.id })}
        className="bg-red-500 hover:bg-red-700"
      >
        Delete
      </Button>
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
