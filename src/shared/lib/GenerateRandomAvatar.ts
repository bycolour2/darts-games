import { createAvatar } from "@dicebear/core";
import { openPeeps, pixelArt } from "@dicebear/collection";

const generateRandomString = (length: number) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateRandomAvatar = (seed?: string) => {
  const randNum = generateRandomString(Math.random() * 65);
  return createAvatar(openPeeps, {
    seed: randNum,
    size: 128,
    // ... other options
  }).toDataUriSync();
};
