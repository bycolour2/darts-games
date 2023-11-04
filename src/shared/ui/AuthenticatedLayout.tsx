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
      <main className="no-scrollbar h-[calc(100vh-68px)] overflow-y-scroll p-4">
        {children}
      </main>
    </>
  );
};
