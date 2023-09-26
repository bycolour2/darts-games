import { createAvatar } from '@dicebear/core';
import { openPeeps } from '@dicebear/collection';

export const generateAvatarByName = (seed: string) => {
  return createAvatar(openPeeps, {
    seed,
    size: 128,
    // ... other options
  }).toDataUriSync();
};
