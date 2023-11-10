import { attach, createEvent, restore, sample } from 'effector';

import { deleteLobbyRequestFx, getLobbiesRequestFx } from '~/shared/api/supabaseApi';

export const getLobbiesFx = attach({ effect: getLobbiesRequestFx });
const deleteLobbyFx = attach({ effect: deleteLobbyRequestFx });

export const deleteLobbyButtonClicked = createEvent<{ lobbyId: string }>();

export const $lobbies = restore(getLobbiesFx, []);

sample({
  clock: deleteLobbyButtonClicked,
  target: deleteLobbyFx,
});

sample({
  clock: deleteLobbyFx.done,
  source: { lobbies: $lobbies },
  fn: ({ lobbies }, { params }) => lobbies.filter((lobby) => lobby.id !== params.lobbyId),
  target: $lobbies,
});
