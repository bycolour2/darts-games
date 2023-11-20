import { Link } from 'atomic-router-react';

import { routes } from '~/shared/config';

import { RegisterForm } from '~/features/auth';

export const Page = () => {
  return (
    <>
      <div className="container mx-auto flex w-96 flex-col justify-start gap-4 pt-24">
        <h3 className="text-center text-3xl font-bold">Register form</h3>
        <p className="text-center font-semibold">
          Already have an account?{' '}
          <Link
            to={routes.auth.login}
            className="text-blue-400 underline hover:italic hover:text-blue-700"
          >
            Sign in!
          </Link>
        </p>
        <RegisterForm />
      </div>
    </>
  );
};
