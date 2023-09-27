import { createEvent, sample } from 'effector';
import { sessionModel } from '~/shared/session';

export const logoutButtonPressed = createEvent();

sample({
  clock: logoutButtonPressed,
  target: sessionModel.sessionEnded,
});
