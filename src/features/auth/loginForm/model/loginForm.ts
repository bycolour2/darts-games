import { PostgrestError } from '@supabase/supabase-js';
import { attach, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { and, every, not, or, reset } from 'patronum';

import { signInSBRequestFx } from '~/shared/api/supabaseApi';
import { sessionModel } from '~/shared/session';

import { isEmailValid, isEmpty, isPasswordValid } from '../lib';

const supabaseSignInFx = attach({ effect: signInSBRequestFx });

export const Gate = createGate('loginFormGate');

export const emailChanged = createEvent<string>();
export const passwordChanged = createEvent<string>();
export const formSubmitted = createEvent();

export const $email = createStore('');
export const $emailError = createStore<null | 'empty' | 'invalid'>(null);

export const $password = createStore('');
export const $passwordError = createStore<null | 'empty' | 'invalid'>(null);

export const $error = createStore<PostgrestError | null>(null);

export const $loginPending = or(
  supabaseSignInFx.pending,
  sessionModel.getSessionFx.pending,
);
export const $loginFormDisabled = or($loginPending);
export const $loginFormValid = every({
  stores: [$emailError, $passwordError],
  predicate: null,
});

reset({
  clock: Gate.open,
  target: [$email, $emailError, $password, $passwordError, $error],
});

$email.on(emailChanged, (_, email) => email);
$password.on(passwordChanged, (_, password) => password);

$error.reset(formSubmitted);

sample({
  clock: formSubmitted,
  source: $email,
  fn: (email) => {
    if (isEmpty(email)) return 'empty';
    if (!isEmailValid(email)) return 'invalid';
    return null;
  },
  target: $emailError,
});

sample({
  clock: formSubmitted,
  source: $password,
  fn: (password) => {
    if (isEmpty(password)) return 'empty';
    if (!isPasswordValid(password)) return 'invalid';
    return null;
  },
  target: $passwordError,
});

sample({
  clock: formSubmitted,
  source: { email: $email, password: $password },
  filter: and(not($loginFormDisabled), $loginFormValid),
  fn: (cred) => ({ ...cred, email: cred.email.trim() }),
  target: supabaseSignInFx,
});

sample({
  clock: supabaseSignInFx.done,
  target: sessionModel.getSessionFx,
});

$error.on(supabaseSignInFx.failData, (_, error) => error);
