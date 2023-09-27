import { useUnit } from 'effector-react';
import { Button, Input, Label, Spinner } from '~/shared/ui';
import { FormEventHandler, useEffect } from 'react';
import { loginModel } from '..';
import { routes } from '~/shared/config';
import { Link } from 'atomic-router-react';

export const LoginPage = () => {
  const [email, emailError, password, passwordError, error, pending, formDisabled] =
    useUnit([
      loginModel.$email,
      loginModel.$emailError,
      loginModel.$password,
      loginModel.$passwordError,
      loginModel.$error,
      loginModel.$loginPending,
      loginModel.$loginFormDisabled,
    ]);
  const [loginPageMounted, formSubmitted, passwordChanged, emailChanged] = useUnit([
    loginModel.loginPageMounted,
    loginModel.formSubmitted,
    loginModel.passwordChanged,
    loginModel.emailChanged,
  ]);

  const onFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    formSubmitted();
  };

  useEffect(() => {
    loginPageMounted();
  }, []);

  return (
    <>
      <div className="container mx-auto flex w-[400px] flex-col justify-start gap-4 pt-24">
        <h3 className="text-center text-3xl font-bold">Login form</h3>
        <p className="text-center font-semibold">
          Don't have an account?{' '}
          <Link
            to={routes.auth.register}
            className="text-blue-400 underline hover:italic hover:text-blue-700"
          >
            Sign up!
          </Link>
        </p>
        <form onSubmit={onFormSubmit}>
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
          {!error && <div className="mb-2 h-6" />}
          {error && (
            <p className="text mb-2 font-medium capitalize text-red-600">
              {error.message}
            </p>
          )}
          <Button className="self-center" type="submit" disabled={formDisabled}>
            Submit
            {pending && (
              <div className="h-7 w-7 pl-2">
                <Spinner />
              </div>
            )}
          </Button>
        </form>
      </div>
    </>
  );
};
