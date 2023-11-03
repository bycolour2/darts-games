import { KDLobbySettings } from '~/shared/api/supabaseApi';

type LobbySettingsInfoProps = {
  lobbySettings: KDLobbySettings;
};

export const LobbySettingsInfo = ({ lobbySettings }: LobbySettingsInfoProps) => {
  return (
    <>
      <div>
        <h4 className="mb-3 text-2xl font-semibold">Game settings:</h4>
        <div>Lifes: {lobbySettings.lifeCount}</div>
        <div>Additional life: {lobbySettings.hasAdditionalLife ? '✔️' : '❌'}</div>
        <div>
          Additional life type:{' '}
          <span className="ml-1 font-bold uppercase">
            {lobbySettings.additionalLifeRule}
          </span>
        </div>
      </div>
    </>
  );
};
