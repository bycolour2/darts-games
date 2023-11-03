import { useUnit } from 'effector-react';
import { Button, Input, Label, Spinner } from '~/shared/ui';
import { FormEventHandler, useEffect } from 'react';
import { loginPageModel } from '..';
import { routes } from '~/shared/config';
import { Link } from 'atomic-router-react';
import { LoginForm } from '~/features/auth/loginForm';

export const Page = () => {
  const [loginPageMounted] = useUnit([loginPageModel.loginPageMounted]);

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
        <LoginForm />
      </div>
    </>
  );
};
