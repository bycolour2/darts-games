import { useUnit } from 'effector-react';
import { Button, Input, Label, Spinner } from '~/shared/ui';
import { FormEventHandler, useEffect } from 'react';
import { registerModel } from '..';

export const RegisterPage = () => {
  const [
    email,
    emailError,
    username,
    usernameError,
    password,
    passwordError,
    avatar,
    error,
    pending,
    formDisabled,
  ] = useUnit([
    registerModel.$email,
    registerModel.$emailError,
    registerModel.$username,
    registerModel.$usernameError,
    registerModel.$password,
    registerModel.$passwordError,
    registerModel.$avatar,
    registerModel.$error,
    registerModel.$registrationPending,
    registerModel.$registrationFormDisabled,
  ]);
  const [
    registrationFormSubmitted,
    passwordChanged,
    emailChanged,
    registrationPpageMounted,
    usernameChanged,
    avatarChanged,
  ] = useUnit([
    registerModel.registrationFormSubmitted,
    registerModel.passwordChanged,
    registerModel.emailChanged,
    registerModel.registrationPpageMounted,
    registerModel.usernameChanged,
    registerModel.avatarChanged,
  ]);

  const onFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    registrationFormSubmitted();
  };

  useEffect(() => {
    registrationPpageMounted();
  }, []);

  return (
    <>
      <div className="container mx-auto flex w-96 flex-col justify-start gap-4">
        <h3 className="text-center text-3xl font-bold">Login form</h3>
        <form onSubmit={onFormSubmit} className="">
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
            {emailError && (
              <p className="text-xs capitalize text-red-600">{emailError}</p>
            )}
          </div>
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
          <div className="mb-2 flex flex-col items-center gap-4">
            <Label className="self-start">Choose your avatar</Label>
            <img
              src={avatar}
              onClick={() => avatarChanged(username)}
              className="aspect-square w-48 rounded-full border-8 border-gray-500"
            />
          </div>
          {!error && <div className="mb-2 h-6" />}
          {error && (
            <p className="text mb-2 font-medium capitalize text-red-600">
              {error.message}
            </p>
          )}
          <Button className="w-24 self-center" type="submit" disabled={formDisabled}>
            Submit
            {pending && (
              <div className="h-8 w-8 px-2">
                <Spinner />
              </div>
            )}
          </Button>
        </form>
      </div>
    </>
  );
};
