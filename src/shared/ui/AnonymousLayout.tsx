import { ReactNode } from 'react';

type AnonymousLayoutProps = {
  children: ReactNode;
};

export const AnonymousLayout = ({ children }: AnonymousLayoutProps) => {
  return (
    <>
      <main className="h-[100vh]">{children}</main>
    </>
  );
};
