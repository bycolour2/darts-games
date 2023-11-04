import { Link } from 'atomic-router-react';
import { useUnit } from 'effector-react';
import { routes } from '~/shared/config';
import { Button } from '~/shared/ui';
import { headerLayoutModel } from '..';
import { sessionModel } from '~/shared/session';
import { ReactNode } from 'react';

type HeaderLayoutProps = {
  profileCardSlot?: ReactNode;
};

export const HeaderLayout = ({ profileCardSlot }: HeaderLayoutProps) => {
  const [session] = useUnit([sessionModel.$session]);
  const [logoutButtonPressed] = useUnit([headerLayoutModel.logoutButtonPressed]);

  return (
    <header>
      <div className="flex h-[68px] w-full justify-between bg-slate-200 px-6 py-2.5">
        <div className="flex items-center gap-3">
          <p className="h-12 w-12 rounded-full border border-black p-2 text-center text-2xl font-bold">
            D
          </p>
          <p className="text-2xl font-semibold">Logo</p>
        </div>
        <div className="order-2 flex items-center gap-4">
          {session ? (
            <>
              {profileCardSlot}
              <Button type="button" onClick={logoutButtonPressed}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to={routes.auth.register}>
                <Button variant={'ghost'} type="button">
                  Sign in
                </Button>
              </Link>
              <Link to={routes.auth.login}>
                <Button type="button">Log in</Button>
              </Link>
            </>
          )}
        </div>
        {session ? (
          <nav className="order-1 flex w-auto items-center justify-between">
            <ul className="flex flex-row space-x-8">
              <li>
                <Link to={routes.games.base}>Games</Link>
              </li>
              {/* <li>nav link2</li> */}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
};
