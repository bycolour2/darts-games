import { PostgrestError } from '@supabase/supabase-js';
import { attach, createEvent, createStore, sample } from 'effector';
import { and, every, not, or, reset } from 'patronum';
import { signInSBRequestFx } from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config/routing';
import { sessionModel } from '~/shared/session';

const supabaseSignInFx = attach({ effect: signInSBRequestFx });

export const currentRoute = routes.auth.login;
export const anonymousRoute = sessionModel.chainAnonymous(currentRoute, {
  otherwise: routes.games.base.open,
});

export const loginPageMounted = createEvent();

export const emailChanged = createEvent<string>();
export const passwordChanged = createEvent<string>();
export const formSubmitted = createEvent();

export const $email = createStore('');
export const $emailError = createStore<null | 'empty' | 'invalid'>(null);

export const $password = createStore('');
export const $passwordError = createStore<null | 'empty' | 'invalid'>(null);

export const $error = createStore<PostgrestError | null>(null);

export const $loginPending = supabaseSignInFx.pending;
export const $loginFormDisabled = or($loginPending);
export const $loginFormValid = every({
  stores: [$emailError, $passwordError],
  predicate: null,
});

reset({
  clock: loginPageMounted,
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

function isEmailValid(email: string) {
  return email.length > 5 && email.includes('@');
}
function isPasswordValid(password: string) {
  return password.length > 3;
}
function isEmpty(input: string) {
  return input.trim().length === 0;
}
