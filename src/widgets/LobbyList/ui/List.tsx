import { Link } from 'atomic-router-react';
import dayjs from 'dayjs';
import { useList, useUnit } from 'effector-react';
import { Delete, FolderOpen } from 'lucide-react';

import { routes } from '~/shared/config';
import { Button, Separator } from '~/shared/ui';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/shared/ui';
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar';

import { gamesListModel } from '~/entities/game';
import { lobbyListModel } from '~/entities/lobby';

export const List = () => {
  const [games] = useUnit([gamesListModel.$games]);
  const [deleteLobbyButtonClicked] = useUnit([lobbyListModel.deleteLobbyButtonClicked]);

  const lobbiesList = useList(lobbyListModel.$lobbies, (lobby) => (
    <Accordion type="multiple">
      <AccordionItem value={`item-${lobby.id}`}>
        <AccordionTrigger>{lobby.id}</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between gap-6">
              <div className="w-2/3">
                <div>
                  <span className="text-lg font-bold">Lobby ID:</span> {lobby.id}
                </div>
                <div>
                  <span className="text-lg font-bold">Game name:</span> {lobby.game.name}
                </div>
                <div>
                  <span className="text-lg font-bold">Started:</span>{' '}
                  {dayjs(lobby.createdAt).format('DD.MM.YYYY HH:mm')}
                </div>
                <div>
                  <span className="text-lg font-bold">Game finished:</span>{' '}
                  {lobby.finished ? 'Finished' : 'Not yet'}
                </div>
                <div>
                  <span className="text-lg font-bold">Winner:</span>{' '}
                  {lobby.winner?.username}
                </div>
                <div>
                  <span className="text-lg font-bold">Lobby closed:</span>{' '}
                  {lobby.closed ? 'Closed' : 'Open'}
                </div>
              </div>
              <div className="flex w-1/3 grow flex-col flex-wrap gap-1">
                {lobby.users.map((user) => (
                  <div key={user.id} className="inline-flex items-center gap-1">
                    <Avatar className="h-10 w-10 border border-black">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p key={user.id} className="text-ellipsis">
                      {user.username}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Separator className="bg-gray-400" />
            <div className="inline-flex gap-2">
              <Link
                to={routes.games.game}
                params={{
                  gameId: games.find((game) => game.name === lobby.game.name)!.id,
                  lobbyId: lobby.id,
                }}
              >
                <Button type="button" size="icon">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                onClick={() => deleteLobbyButtonClicked({ lobbyId: lobby.id })}
                className="bg-red-500 hover:bg-red-700"
                size="icon"
              >
                <Delete className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ));

  return (
    <div className="no-scrollbar w-2/5 overflow-scroll rounded-lg border bg-slate-50 p-4">
      <h4 className="mb-4 w-full text-center text-2xl font-semibold">Lobby list:</h4>
      <div className="flex flex-col">{lobbiesList}</div>
    </div>
  );
};
