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
  gameName: string;
  users: NotSBUser[];
};

type CreateLobbyReturn = {
  id: string;
  gameName: string;
  createdAt: string;
  users: string[];
  winner: string | null;
  finished: boolean;
  closed: boolean;
  turns: string[];
};

export const createLobbyRequestFx = createEffect<
  CreateLobbyParams,
  CreateLobbyReturn,
  PostgrestError
>(async (params) => {
  let usersIdArray: string[] = [];
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .insert({ gameName: params.gameName })
    .select()
    .single();
  if (lobbyError) throw lobbyError;
  console.log('createLobbyRequestFx -> insert lobby', lobby, lobbyError);
  if (lobby) {
    const bulk = params.users.map((user) => ({ lobbyId: lobby.id, userId: user.id }));
    const { data: lobbyUsers, error: lobbyUsersError } = await supabase
      .from('lobby_users')
      .insert(bulk)
      .select();
    if (lobbyUsersError) throw lobbyUsersError;
    console.log(
      'createLobbyRequestFx -> add users to lobby',
      lobbyUsers,
      lobbyUsersError,
    );
    usersIdArray = lobbyUsers.map((user) => user.userId);
  }
  return { ...lobby, users: usersIdArray, turns: [] as string[] };
});

type GetLobbyParams = {
  lobbyId: string;
};

export type Lobby = {
  id: string;
  gameName: string;
  createdAt: string;
  users: UserDetails[];
  winner: UserDetails | null;
  finished: boolean;
  closed: boolean;
  turns: Turn[];
};

export const getLobbyRequestFx = createEffect<GetLobbyParams, Lobby, PostgrestError>(
  async (params) => {
    // let returnLobby = {};
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select(
        `id, createdAt, gameName, finished, winner, closed, users!lobby_users(*), turns!lobby_turns(*)`,
      )
      .eq('id', params.lobbyId)
      .single();
    if (lobbyError) throw lobbyError;
    console.log(`getLobbyRequestFx -> get lobby #${params.lobbyId}`, lobby, lobbyError);
    return lobby as Lobby;
  },
);

export const getLobbiesRequestFx = createEffect<void, Lobby[], PostgrestError>(
  async () => {
    const { data: lobbies, error: lobbiesError } = await supabase
      .from('lobbies')
      .select(
        `id, createdAt, gameName, finished, winner, closed, users!lobby_users(*), turns!lobby_turns(*)`,
      );
    if (lobbiesError) throw lobbiesError;
    console.log(`getLobbiesRequestFx -> get lobbies`, lobbies, lobbiesError);
    return lobbies as Lobby[];
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
    `createKDPlayerDetailRequestFx -> insert player KD Detail`,
    KDPlayerDetail,
    KDPlayerDetailError,
  );
  return KDPlayerDetail;
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
