import { ReactNode } from 'react';
import { HeaderLayout } from '~/widgets/HeaderLayout';
import { ProfileCard } from '~/widgets/ProfileCard';

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <>
      <HeaderLayout profileCardSlot={<ProfileCard />} />
      <main>{children}</main>
    </>
  );
};
