import { useUnit } from "effector-react";
import {
  $registrationPending,
  $error,
  $password,
  $email,
  registrationFormSubmitted,
  passwordChanged,
  emailChanged,
  $registrationFormDisabled,
  $emailError,
  $passwordError,
  registrationPpageMounted,
  $username,
  $usernameError,
  usernameChanged,
  $avatar,
  avatarChanged,
} from "../model/model";
import { Button, Input, Label, Spinner } from "~/shared/ui";
import { FormEventHandler, useEffect } from "react";

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
    $email,
    $emailError,
    $username,
    $usernameError,
    $password,
    $passwordError,
    $avatar,
    $error,
    $registrationPending,
    $registrationFormDisabled,
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
      <div className="container mx-auto flex flex-col justify-start w-96 gap-4">
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
            {emailError && <p className="text-red-600 text-xs capitalize">{emailError}</p>}
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
            {usernameError && <p className="text-red-600 text-xs capitalize">{usernameError}</p>}
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
            {passwordError && <p className="text-red-600 text-xs capitalize">{passwordError}</p>}
          </div>
          <div className="mb-2 flex flex-col items-center gap-4">
            <Label className="self-start">Choose your avatar</Label>
            <img
              src={avatar}
              onClick={() => avatarChanged(username)}
              className="w-48 border-8 border-gray-500 rounded-full aspect-square"
            />
          </div>
          {!error && <div className="h-6 mb-2" />}
          {error && (
            <p className="mb-2 text text-red-600 font-medium capitalize">{error.message}</p>
          )}
          <Button className="w-24 self-center" type="submit" disabled={formDisabled}>
            Submit
            {pending && (
              <div className="px-2 h-8 w-8">
                <Spinner />
              </div>
            )}
          </Button>
        </form>
      </div>
    </>
  );
};
