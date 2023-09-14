import { ReactNode } from 'react';
import { Button } from '.';
import { Link } from 'atomic-router-react';
import { routes } from '../config';

type MainLayoutProps = {
  children: ReactNode;
};
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <header>
        <nav className="mb-4 flex w-full justify-between bg-slate-200 px-6 py-2.5">
          <div className="flex items-center gap-3">
            <p className="h-16 w-16 rounded-full border border-black p-2 text-center text-4xl font-bold">
              D
            </p>
            <p className="text-2xl font-semibold">Logo</p>
          </div>
          <div className="order-2 flex items-center gap-4">
            <Button variant={'ghost'}>Sign in</Button>
            <Button>Log in</Button>
          </div>
          <div className="order-1 flex w-auto items-center justify-between">
            <ul className="flex flex-row space-x-8">
              <Link to={routes.games.base}>
                <li>Games</li>
              </Link>
              <li>nav link2</li>
            </ul>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
};
