import { PostgrestError } from '@supabase/supabase-js';
import { attach, createEvent, createStore, sample } from 'effector';
import { and, every, not, or, reset } from 'patronum';
import { signUpSBRequestFx } from '~/shared/api/supabaseApi';
import { routes } from '~/shared/config/routing';
import { generateRandomAvatar } from '~/shared/lib';
import { sessionModel } from '~/shared/session';

export const currentRoute = routes.auth.register;
export const anonymousRoute = sessionModel.chainAnonymous(currentRoute, {
  otherwise: routes.games.base.open,
});

// const signInFx = attach({ effect: api.signInFx });
const supabaseSignUpFx = attach({ effect: signUpSBRequestFx });
// const supabaseSignInFx = attach({ effect: signUpSBRequestFx });

export const registrationPpageMounted = createEvent();

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
// export const $avatarError = createStore<null | "empty" | "invalid">(null);

export const $error = createStore<PostgrestError | null>(null);

export const $registrationPending = supabaseSignUpFx.pending;
export const $registrationFormDisabled = or($registrationPending);
export const $formValid = every({
  stores: [$emailError, $usernameError, $passwordError /*, $avatarError*/],
  predicate: null,
});

reset({
  clock: registrationPpageMounted,
  target: [
    $email,
    $emailError,
    $username,
    $usernameError,
    $password,
    $passwordError,
    $avatar,
    // $avatarError,
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

// sample({
//   clock: formSubmitted,
//   source: $avatar,
//   fn: (avatar) => {
//     if (isEmpty(avatar)) return "empty";
//     return null;
//   },
//   target: $avatarError,
// });

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

function isEmailValid(email: string) {
  return email.length > 5 && email.includes('@');
}
function isUsernameValid(email: string) {
  return email.length > 2;
}
function isPasswordValid(password: string) {
  return password.length > 3;
}
function isEmpty(input: string) {
  return input.trim().length === 0;
}
