import { useGate, useList, useUnit } from 'effector-react';
import { Link } from 'atomic-router-react';
import { routes } from '~/shared/config';
import dayjs from 'dayjs';
import { gamesPageModel } from '..';
import { Button } from '~/shared/ui';
import { Delete, FolderOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/shared/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '~/shared/ui/avatar';
import { GamesList } from '~/widgets/GamesList';

export const Page = () => {
  return (
    <div className="flex h-full w-full flex-row gap-4">
      <GamesList />
    </div>
  );
};

//  <LobbyList />
// const GameList = () => {
//   const gamesList = useList(gamesPageModel.$games, (item) => (
//     <Link
//       to={routes.games.start}
//       params={{ gameId: item.id }}
//       className="flex aspect-square items-center justify-center rounded-full bg-red-500 p-3 text-center text-2xl font-semibold text-white"
//     >
//       {item.name}
//     </Link>
//   ));
//   return (
//     <div className="w-3/5 rounded-lg border bg-slate-50 p-4">
//       <h2 className="mb-6 w-full text-center text-3xl font-semibold">Choose the game</h2>
//       <div className="grid grid-cols-4 gap-5">{gamesList}</div>
//     </div>
//   );
// };

// const LobbyList = () => {
//   const [games] = useUnit([gamesPageModel.$games]);
//   const [deleteLobbyButtonClicked] = useUnit([gamesPageModel.deleteLobbyButtonClicked]);

//   const lobbiesList = useList(gamesPageModel.$lobbies, (lobby) => (
//     <Accordion type="multiple">
//       <AccordionItem value={`item-${lobby.id}`}>
//         <AccordionTrigger>{lobby.id}</AccordionTrigger>
//         <AccordionContent>
//           <div className="flex flex-row justify-between gap-6">
//             <div className="w-2/5">
//               <div>
//                 <span className="text-lg font-bold">Lobby ID:</span> {lobby.id}
//               </div>
//               <div>
//                 <span className="text-lg font-bold">Game name:</span> {lobby.game.name}
//               </div>
//               <div>
//                 <span className="text-lg font-bold">Started:</span>{' '}
//                 {dayjs(lobby.createdAt).format('DD.MM.YYYY HH:mm')}
//               </div>
//               <div>
//                 <span className="text-lg font-bold">Game finished:</span>{' '}
//                 {lobby.finished ? 'Finished' : 'Not yet'}
//               </div>
//               <div>
//                 <span className="text-lg font-bold">Winner:</span>{' '}
//                 {lobby.winner?.username}
//               </div>
//               <div>
//                 <span className="text-lg font-bold">Lobby closed:</span>{' '}
//                 {lobby.closed ? 'Closed' : 'Open'}
//               </div>
//             </div>
//             <div className="flex w-1/5 grow flex-col flex-wrap gap-1">
//               {lobby.users.map((user) => (
//                 <div className="inline-flex items-center gap-1">
//                   <Avatar className="h-10 w-10 border border-black">
//                     <AvatarImage src={user.avatar} />
//                     <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
//                   </Avatar>
//                   <p key={user.id} className="text-ellipsis">
//                     {user.username}
//                   </p>
//                 </div>
//               ))}
//             </div>
//             <div className="inline-flex gap-2">
//               <Link
//                 to={routes.games.game}
//                 params={{
//                   gameId: games.find((game) => game.name === lobby.game.name)!.id,
//                   lobbyId: lobby.id,
//                 }}
//               >
//                 <Button type="button" size="icon">
//                   <FolderOpen className="h-4 w-4" />
//                 </Button>
//               </Link>
//               <Button
//                 type="button"
//                 onClick={() => deleteLobbyButtonClicked({ lobbyId: lobby.id })}
//                 className="bg-red-500 hover:bg-red-700"
//                 size="icon"
//               >
//                 <Delete className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   ));

//   return (
//     <div className="no-scrollbar w-2/5 overflow-scroll rounded-lg border bg-slate-50 p-4">
//       <h4 className="mb-4 w-full text-center text-2xl font-semibold">Lobby list:</h4>
//       <div className="flex flex-col">{lobbiesList}</div>
//     </div>
//   );
// };
