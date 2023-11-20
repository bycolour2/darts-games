import { createEvent, createStore, sample } from 'effector';

import { NotSBUser } from '~/shared/api/supabaseApi';

import { gameModel } from '~/entities/game';

export const userSelectionToggled = createEvent<NotSBUser>();

export const $selectedUsers = createStore<NotSBUser[]>([]);

sample({
  clock: userSelectionToggled,
  source: { game: gameModel.$game, selectedUsers: $selectedUsers },
  fn: ({ game, selectedUsers }, user) => {
    if (selectedUsers.length === game.maxPlayers) {
      alert('Max players reached!');
      return selectedUsers;
    }
    if (selectedUsers.includes(user)) {
      return selectedUsers.filter((selectedUser) => selectedUser.id !== user.id);
    }
    return [...selectedUsers, user];
  },
  target: $selectedUsers,
});
