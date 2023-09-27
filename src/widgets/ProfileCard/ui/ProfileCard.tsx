import { useUnit } from 'effector-react';
import { sessionModel } from '~/shared/session';

export const ProfileCard = () => {
  const [session] = useUnit([sessionModel.$session]);

  return (
    <>
      {session ? (
        <div className="mr-2 inline-flex items-center gap-2">
          <img
            src={session.userDetails.avatar}
            className="aspect-square w-8 rounded-full border border-black"
          />
          <span className="text-lg font-semibold text-gray-800">
            {session.userDetails.username}
          </span>
        </div>
      ) : null}
    </>
  );
};
