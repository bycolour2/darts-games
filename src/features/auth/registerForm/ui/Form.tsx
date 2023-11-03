import { useUnit } from 'effector-react';
import { Button, Input, Label, Spinner } from '~/shared/ui';
import { FormEventHandler } from 'react';
import { registerFormModel } from '..';

export const Form = () => {
  const [registrationFormSubmitted] = useUnit([
    registerFormModel.registrationFormSubmitted,
  ]);

  const onFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    registrationFormSubmitted();
  };

  return (
    <form onSubmit={onFormSubmit} className="">
      <Email />
      <Username />
      <Password />
      <Avatar />
      <SubmitError />
      <Submit />
    </form>
  );
};

const Email = () => {
  const [email, emailError, formDisabled] = useUnit([
    registerFormModel.$email,
    registerFormModel.$emailError,
    registerFormModel.$registrationFormDisabled,
  ]);
  const [emailChanged] = useUnit([registerFormModel.emailChanged]);
  return (
    <div className="mb-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        value={email}
        onChange={(e) => emailChanged(e.target.value)}
        placeholder="Email.."
        disabled={formDisabled}
      />
      {!emailError && <div className="h-4" />}
      {emailError && <p className="text-xs capitalize text-red-600">{emailError}</p>}
    </div>
  );
};
const Username = () => {
  const [username, usernameError, formDisabled] = useUnit([
    registerFormModel.$username,
    registerFormModel.$usernameError,
    registerFormModel.$registrationFormDisabled,
  ]);
  const [usernameChanged] = useUnit([registerFormModel.usernameChanged]);
  return (
    <div className="mb-2">
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        value={username}
        onChange={(e) => usernameChanged(e.target.value)}
        placeholder="Username.."
        disabled={formDisabled}
      />
      {!usernameError && <div className="h-4" />}
      {usernameError && (
        <p className="text-xs capitalize text-red-600">{usernameError}</p>
      )}
    </div>
  );
};
const Password = () => {
  const [password, passwordError, formDisabled] = useUnit([
    registerFormModel.$password,
    registerFormModel.$passwordError,
    registerFormModel.$registrationFormDisabled,
  ]);
  const [passwordChanged] = useUnit([registerFormModel.passwordChanged]);

  return (
    <div className="mb-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => passwordChanged(e.target.value)}
        placeholder="Password.."
        disabled={formDisabled}
      />
      {!passwordError && <div className="h-4" />}
      {passwordError && (
        <p className="text-xs capitalize text-red-600">{passwordError}</p>
      )}
    </div>
  );
};
const Avatar = () => {
  const [username, avatar] = useUnit([
    registerFormModel.$username,
    registerFormModel.$avatar,
  ]);
  const [avatarChanged] = useUnit([registerFormModel.avatarChanged]);

  return (
    <div className="mb-2 flex flex-col items-center gap-4">
      <Label className="self-start">Choose your avatar</Label>
      <img
        src={avatar}
        onClick={() => avatarChanged(username)}
        className="aspect-square w-48 rounded-full border-8 border-gray-500"
      />
    </div>
  );
};
const SubmitError = () => {
  const [error] = useUnit([registerFormModel.$error]);
  return (
    <>
      {!error && <div className="mb-2 h-6" />}
      {error && (
        <p className="text mb-2 font-medium capitalize text-red-600">{error.message}</p>
      )}
    </>
  );
};
const Submit = () => {
  const [pending, formDisabled] = useUnit([
    registerFormModel.$registrationPending,
    registerFormModel.$registrationFormDisabled,
  ]);
  return (
    <Button className="w-24 self-center" type="submit" disabled={formDisabled}>
      Submit
      {pending && (
        <div className="h-8 w-8 px-2">
          <Spinner />
        </div>
      )}
    </Button>
  );
};
