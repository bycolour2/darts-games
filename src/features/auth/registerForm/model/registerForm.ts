import { PostgrestError } from '@supabase/supabase-js';
import { attach, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { and, every, not, or, reset } from 'patronum';

import { signUpSBRequestFx } from '~/shared/api/supabaseApi';
import { generateRandomAvatar } from '~/shared/lib';
import { sessionModel } from '~/shared/session';

import { isEmailValid, isEmpty, isPasswordValid, isUsernameValid } from '../lib';

const supabaseSignUpFx = attach({ effect: signUpSBRequestFx });

export const Gate = createGate('registerFormGate');

export const emailChanged = createEvent<string>();
export const usernameChanged = createEvent<string>();
export const passwordChanged = createEvent<string>();
export const avatarChanged = createEvent<string>();
export const registrationFormSubmitted = createEvent();

export const $email = createStore('');
export const $emailError = createStore<null | 'empty' | 'invalid'>(null);

export const $username = createStore('');
export const $usernameError = createStore<null | 'empty' | 'invalid'>(null);

export const $password = createStore('');
export const $passwordError = createStore<null | 'empty' | 'invalid'>(null);

export const $avatar = createStore(generateRandomAvatar());

export const $error = createStore<PostgrestError | null>(null);

export const $registrationPending = or(
  supabaseSignUpFx.pending,
  sessionModel.getSessionFx.pending,
);
export const $registrationFormDisabled = or($registrationPending);
export const $formValid = every({
  stores: [$emailError, $usernameError, $passwordError],
  predicate: null,
});

reset({
  clock: Gate.open,
  target: [
    $email,
    $emailError,
    $username,
    $usernameError,
    $password,
    $passwordError,
    $avatar,
    $error,
  ],
});

$email.on(emailChanged, (_, email) => email);
$username.on(usernameChanged, (_, username) => username);
$password.on(passwordChanged, (_, password) => password);
$avatar.on(avatarChanged, () => generateRandomAvatar());

$error.reset(registrationFormSubmitted);

sample({
  clock: registrationFormSubmitted,
  source: $email,
  fn: (email) => {
    if (isEmpty(email)) return 'empty';
    if (!isEmailValid(email)) return 'invalid';
    return null;
  },
  target: $emailError,
});

sample({
  clock: registrationFormSubmitted,
  source: $username,
  fn: (username) => {
    if (isEmpty(username)) return 'empty';
    if (!isUsernameValid(username)) return 'invalid';
    return null;
  },
  target: $usernameError,
});

sample({
  clock: registrationFormSubmitted,
  source: $password,
  fn: (password) => {
    if (isEmpty(password)) return 'empty';
    if (!isPasswordValid(password)) return 'invalid';
    return null;
  },
  target: $passwordError,
});

sample({
  clock: registrationFormSubmitted,
  source: { email: $email, username: $username, password: $password, avatar: $avatar },
  filter: and(not($registrationFormDisabled), $formValid),
  fn: (cred) => ({
    password: cred.password.trim(),
    email: cred.email.trim(),
    username: cred.username.trim(),
    avatar: cred.avatar.trim(),
  }),
  target: supabaseSignUpFx,
});

sample({
  clock: supabaseSignUpFx.doneData,
  target: sessionModel.getSessionFx,
});

$error.on(supabaseSignUpFx.failData, (_, error) => error);
