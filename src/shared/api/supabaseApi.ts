import { PostgrestError, Session, User, createClient } from '@supabase/supabase-js';
import { createEffect } from 'effector';
import { Database } from './supabase.types';

const supabase = createClient<Database>(
  'https://yaypxbtfjigfnlrpzhip.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheXB4YnRmamlnZm5scnB6aGlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ5NjExMywiZXhwIjoyMDA3MDcyMTEzfQ.rfvNoU7UGVfxXh7JnP4aflVqcD-pK815H__X3SNKD2A',
);

type SignInParams = {
  email: string;
  password: string;
};

export type UserDetails = {
  id: string;
  username: string;
  avatar: string;
};

export type SBLoginResult = {
  user: User;
  session: Session;
  userDetails: UserDetails;
};

// export type SignInError = { message: "invalid_credentials" } | { message: "invalid_request" };

export const signInSBRequestFx = createEffect<
  SignInParams,
  SBLoginResult,
  PostgrestError
>(async (params) => {
  const { data: userSBAuthDetails, error: userSBAuthError } =
    await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
  if (userSBAuthError) throw new Error(userSBAuthError.message);
  console.log('signInSBRequestFx -> SBAuth data', { userSBAuthDetails, userSBAuthError });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', userSBAuthDetails.user.id);
  if (userError) throw userError;
  console.log('signInSBRequestFx -> userDetails data', { userDetails, userError });

  return { ...userSBAuthDetails, userDetails: userDetails[0] } as SBLoginResult;
});

type SignUpParams = {
  email: string;
  username: string;
  password: string;
  avatar: string;
};

export const signUpSBRequestFx = createEffect<
  SignUpParams,
  SBLoginResult,
  PostgrestError
>(async (params) => {
  const { data: userSBAuthDetails, error: userSBAuthError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  // signInWithPassword({
  //   email: params.email,
  //   password: params.password,
  // });
  if (userSBAuthError) throw new Error(userSBAuthError.message);
  console.log('signUpSBRequestFx -> SBAuth data', { userSBAuthDetails, userSBAuthError });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .insert({
      id: userSBAuthDetails.user!.id,
      username: params.username,
      avatar: params.avatar,
    })
    .select();
  if (userError) throw userError;
  console.log('signUpSBRequestFx -> userDetails data', { userDetails, userError });

  return { ...userSBAuthDetails, userDetails: userDetails[0] } as SBLoginResult;
});

export type ExtendedSBSession = Session & { userDetails: UserDetails };

export const getSessionSBRequestFx = createEffect<
  void,
  ExtendedSBSession,
  PostgrestError
>(async () => {
  const {
    data: { session: userSBSession },
    error: userSBGetSessionError,
  } = await supabase.auth.getSession();
  if (userSBGetSessionError) throw new Error(userSBGetSessionError.message);
  console.log('getSessionSBRequestFx -> SBAuth data', {
    userSBAuthDetails: userSBSession,
    userSBAuthError: userSBGetSessionError,
  });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', userSBSession?.user.id);
  if (userError) throw userError;
  console.log('getSessionSBRequestFx -> userDetails data', { userDetails, userError });

  return { ...userSBSession, userDetails: userDetails[0] } as ExtendedSBSession;
});

export type Game = {
  id: string;
  createdAt: string;
  name: string;
  maxPlayers: number;
};

export const getGamesRequestFx = createEffect<void, Game[], PostgrestError>(async () => {
  const { data: games, error } = await supabase.from('games').select();

  console.log('getGamesRequestFx -> select all games', { games, error });
  if (error) throw error;
  return games as Game[];
});

export const getGameRequestFx = createEffect<string, Game, PostgrestError>(
  async (params) => {
    const { data: game, error } = await supabase
      .from('games')
      .select()
      .eq('id', params)
      .single();

    console.log('getGameRequestFx -> select single game', { game, error });
    if (error) throw error;
    return game;
  },
);

export type NotSBUser = {
  id: string;
  email: string;
  username: string;
  avatar: string;
};

export const getUsersRequestFx = createEffect<void, NotSBUser[], PostgrestError>(
  async () => {
    const { data: users, error: usersError } = await supabase.from('users').select();
    console.log('getUsersRequestFx -> select users', { users, usersError });
    if (usersError) throw usersError;
    return await Promise.all(
      users.map(async (user) => {
        const {
          data: { user: SBUser },
          error: SBUserError,
        } = await supabase.auth.admin.getUserById(user.id);
        console.log(`getUsersRequestFx -> select SB user #${user.id}`, {
          SBUser,
          SBUserError,
        });
        if (SBUserError) throw SBUserError;
        return {
          email: SBUser?.email,
          username: user.username,
          avatar: user.avatar,
          id: user.id,
        } as NotSBUser;
      }),
    );
  },
);

type CreateLobbyParams = {
  gameId: string;
  gameName: string;
  users: NotSBUser[];
};

export type Lobby = {
  id: string;
  gameId: string;
  gameName: string;
  createdAt: string;
  users: UserDetails[];
  winner: UserDetails | null;
  finished: boolean;
  closed: boolean;
};

export const createLobbyRequestFx = createEffect<
  CreateLobbyParams,
  Lobby,
  PostgrestError
>(async (params) => {
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .insert({ gameName: params.gameName, gameId: params.gameId })
    .select(
      `id, createdAt, gameId, gameName, finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*)`,
    )
    .single();
  if (lobbyError) throw lobbyError;
  console.log('createLobbyRequestFx -> insert lobby', lobby, lobbyError);

  if (lobby && lobby.users.length === 0) {
    const bulk = params.users.map((user) => ({ lobbyId: lobby.id, userId: user.id }));
    const { error: lobbyUsersError } = await supabase.from('lobby_users').insert(bulk);
    if (lobbyUsersError) throw lobbyUsersError;
    console.log('createLobbyRequestFx -> link users to lobby', lobbyUsersError);
  }

  const { data: lobbyWithUsers, error: lobbyWithUsersError } = await supabase
    .from('lobbies')
    .select(
      `id, createdAt, gameId, gameName, finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*)`,
    )
    .eq('id', lobby.id)
    .single();
  if (lobbyWithUsersError) throw lobbyWithUsersError;
  console.log(
    'createLobbyRequestFx -> get lobby with users',
    lobbyWithUsers,
    lobbyWithUsersError,
  );
  return lobbyWithUsers;
});

type GetLobbyParams = {
  lobbyId: string;
};

export const getLobbyRequestFx = createEffect<GetLobbyParams, Lobby, PostgrestError>(
  async (params) => {
    // let returnLobby = {};
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select(
        `id, createdAt, gameId, gameName, finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*)`,
      )
      .eq('id', params.lobbyId)
      .single();
    if (lobbyError) throw lobbyError;
    console.log(`getLobbyRequestFx -> get lobby #${params.lobbyId}`, lobby, lobbyError);
    return lobby;
  },
);

export const getLobbiesRequestFx = createEffect<void, Lobby[], PostgrestError>(
  async () => {
    const { data: lobbies, error: lobbiesError } = await supabase
      .from('lobbies')
      .select(
        `id, createdAt, gameId, gameName, finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*)`,
      );
    if (lobbiesError) throw lobbiesError;
    console.log(`getLobbiesRequestFx -> get lobbies`, lobbies, lobbiesError);
    return lobbies;
  },
);

export type KDPlayerDetail = {
  id: string;
  lobbyId: string;
  userId: string;
  username: string;
  firstScore: number | null;
  sector: number | null;
  isKiller: boolean;
  lifeCount: number;
  isDead: boolean;
  order: number;
};

export type GetKDPlayerDetailsParams = {
  lobbyId: string;
};

export const getKDPlayerDetailsRequestFx = createEffect<
  GetKDPlayerDetailsParams,
  KDPlayerDetail[],
  PostgrestError
>(async (params) => {
  const { data: KDPlayerDetails, error: KDPlayerDetailsError } = await supabase
    .from('KDPlayerDetails')
    .select()
    .eq('lobbyId', params.lobbyId);
  if (KDPlayerDetailsError) throw KDPlayerDetailsError;
  console.log(
    `getKDPlayerDetailsRequestFx -> get player KD Details`,
    KDPlayerDetails,
    KDPlayerDetailsError,
  );
  return KDPlayerDetails;
});

export type CreateKDPlayerDetailsParams = {
  lobbyId: string;
  userId: string;
  username: string;
  firstScore: number | null;
  sector: number | null;
  isKiller: boolean;
  lifeCount: number;
  isDead: boolean;
  order: number;
};

export const createKDPlayerDetailsRequestFx = createEffect<
  CreateKDPlayerDetailsParams[],
  KDPlayerDetail[],
  PostgrestError
>(async (params) => {
  const { data: KDPlayerDetail, error: KDPlayerDetailError } = await supabase
    .from('KDPlayerDetails')
    .insert(params)
    .select();
  if (KDPlayerDetailError) throw KDPlayerDetailError;
  console.log(
    `createKDPlayerDetailsRequestFx -> insert player KD Detail`,
    KDPlayerDetail,
    KDPlayerDetailError,
  );
  return KDPlayerDetail;
});

export type KDLobbySettings = {
  id: string;
  lobbyId: string;
  lifeCount: number;
  hasAdditionalLife: boolean;
  additionalLifeRule: string;
};

type GetKDLobbySettingsParams = {
  lobbyId: string;
};

export const getKDLobbySettingsRequestFx = createEffect<
  GetKDLobbySettingsParams,
  KDLobbySettings,
  PostgrestError
>(async (params) => {
  const { data: KDLobbySettings, error: KDLobbySettingsError } = await supabase
    .from('KDLobbySettings')
    .select()
    .eq('lobbyId', params.lobbyId)
    .single();
  if (KDLobbySettingsError) throw KDLobbySettingsError;
  console.log(
    `getKDLobbySettingsRequestFx -> get player KD Details`,
    KDLobbySettings,
    KDLobbySettingsError,
  );
  return KDLobbySettings;
});

type CreateKDLobbySettingsParams = {
  lobbyId: string;
  lifeCount?: number;
  hasAdditionalLife?: boolean;
  additionalLifeRule?: string;
};

export const createKDLobbySettingRequestFx = createEffect<
  CreateKDLobbySettingsParams,
  KDLobbySettings,
  PostgrestError
>(async (params) => {
  const { data: KDLobbySetting, error: KDLobbySettingError } = await supabase
    .from('KDLobbySettings')
    .insert([params])
    .select()
    .single();
  if (KDLobbySettingError) throw KDLobbySettingError;
  console.log(
    `createKDLobbySettingRequestFx -> insert KDLobbySetting`,
    KDLobbySetting,
    KDLobbySettingError,
  );
  return KDLobbySetting;
});

export type KDTurn = {
  id: string;
  created_at: string;
  userId: string;
  round: number;
  hits: number[];
};

export type CreateKDTurnParams = {
  lobbyId: string;
  userId: string;
  round: number;
  hits: number[];
};

export const createKDTurnRequestFx = createEffect<
  CreateKDTurnParams,
  KDTurn,
  PostgrestError
>(async (params) => {
  const { data: KDTurn, error: KDTurnError } = await supabase
    .from('turnsKD')
    .insert([
      {
        userId: params.userId,
        round: params.round,
        hits: params.hits,
        lobbyId: params.lobbyId,
      },
    ])
    .select()
    .single();
  if (KDTurnError) throw KDTurnError;
  console.log(`createKDTurnRequestFx -> insert KDTurn`, KDTurn, KDTurnError);
  return KDTurn as KDTurn;
});

export type GetKDTurnParams = {
  lobbyId: string;
};

export const getKDTurnsRequestFx = createEffect<
  GetKDTurnParams,
  KDTurn[],
  PostgrestError
>(async (params) => {
  const { data: KDTurns, error: KDTurnsError } = await supabase
    .from('turnsKD')
    .select('*')
    .eq('lobbyId', params.lobbyId);
  if (KDTurnsError) throw KDTurnsError;
  console.log(`getKDTurnRequestFx -> get KDTurns`, KDTurns, KDTurnsError);
  return KDTurns as KDTurn[];
});

export type Turn = {
  id: string;
  userId: string;
  round: number;
};

export type Hit = {
  id: string;
  sector: number;
  multiplicator: number;
};
