import { createAvatar } from "@dicebear/core";
import { openPeeps, pixelArt } from "@dicebear/collection";

export const generateAvatarByName = (seed: string) => {
  return createAvatar(openPeeps, {
    seed,
    size: 128,
    // ... other options
  }).toDataUriSync();
};
