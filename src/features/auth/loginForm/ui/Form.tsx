import { useGate, useUnit } from 'effector-react';
import { FormEventHandler } from 'react';

import { Button, Input, Label, Spinner } from '~/shared/ui';

import { loginFormModel } from '..';

export const Form = () => {
  const [formSubmitted] = useUnit([loginFormModel.formSubmitted]);
  useGate(loginFormModel.Gate);

  const onFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    formSubmitted();
  };

  return (
    <form onSubmit={onFormSubmit}>
      <Email />
      <Password />
      <SubmitError />
      <Submit />
    </form>
  );
};

const Email = () => {
  const [email, emailError, formDisabled] = useUnit([
    loginFormModel.$email,
    loginFormModel.$emailError,
    loginFormModel.$loginFormDisabled,
  ]);
  const [emailChanged] = useUnit([loginFormModel.emailChanged]);
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
const Password = () => {
  const [password, passwordError, formDisabled] = useUnit([
    loginFormModel.$password,
    loginFormModel.$passwordError,
    loginFormModel.$loginFormDisabled,
  ]);
  const [passwordChanged] = useUnit([loginFormModel.passwordChanged]);
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

const SubmitError = () => {
  const [error] = useUnit([loginFormModel.$error]);
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
    loginFormModel.$loginPending,
    loginFormModel.$loginFormDisabled,
  ]);
  return (
    <Button className="self-center" type="submit" disabled={formDisabled}>
      Submit
      {pending && (
        <div className="h-7 w-7 pl-2">
          <Spinner />
        </div>
      )}
    </Button>
  );
};
