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
  // console.log('signInSBRequestFx -> SBAuth data', { userSBAuthDetails, userSBAuthError });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', userSBAuthDetails.user.id);
  if (userError) throw userError;
  // console.log('signInSBRequestFx -> userDetails data', { userDetails, userError });

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
  // console.log('signUpSBRequestFx -> SBAuth data', { userSBAuthDetails, userSBAuthError });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .insert({
      id: userSBAuthDetails.user!.id,
      username: params.username,
      avatar: params.avatar,
    })
    .select();
  if (userError) throw userError;
  // console.log('signUpSBRequestFx -> userDetails data', { userDetails, userError });

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
  // console.log('getSessionSBRequestFx -> SBAuth data', {
  //   userSBAuthDetails: userSBSession,
  //   userSBAuthError: userSBGetSessionError,
  // });

  const { data: userDetails, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', userSBSession!.user.id);
  if (userError) throw userError;
  // console.log('getSessionSBRequestFx -> userDetails data', { userDetails, userError });

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

  // console.log('getGamesRequestFx -> select all games', { games, error });
  if (error) throw error;
  return games as Game[];
});

type GetGameParams = {
  gameId: string;
};

export const getGameRequestFx = createEffect<GetGameParams, Game, PostgrestError>(
  async (params) => {
    const { data: game, error } = await supabase
      .from('games')
      .select()
      .eq('id', params.gameId)
      .single();

    // console.log('getGameRequestFx -> select single game', { game, error });
    if (error) throw error;
    return game;
  },
);

export type GameStage = {
  id: string;
  gameId: string;
  title: string;
  description: string | null;
  order: number;
};

type GetStagesParams = {
  gameId: string;
};

export const getStagesByGameIdRequestFx = createEffect<
  GetStagesParams,
  GameStage[],
  PostgrestError
>(async (params) => {
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*')
    .eq('gameId', params.gameId);
  if (stagesError) throw stagesError;
  // console.log('getStagesRequestFx -> select stages', { stages, stagesError });
  return stages;
});

export type NotSBUser = {
  id: string;
  email: string;
  username: string;
  avatar: string;
};

export const getUsersRequestFx = createEffect<void, NotSBUser[], PostgrestError>(
  async () => {
    const { data: users, error: usersError } = await supabase.from('users').select();
    if (usersError) throw usersError;
    // console.log('getUsersRequestFx -> select users', { users, usersError });
    return await Promise.all(
      users.map(async (user) => {
        const {
          data: { user: SBUser },
          error: SBUserError,
        } = await supabase.auth.admin.getUserById(user.id);
        // console.log(`getUsersRequestFx -> select SB user #${user.id}`, {
        //   SBUser,
        //   SBUserError,
        // });
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

export type Lobby = {
  id: string;
  // gameId: string;
  // gameName: string;
  game: Game;
  createdAt: string;
  users: UserDetails[];
  winner: UserDetails | null;
  finished: boolean;
  closed: boolean;
  stage: GameStage;
};

type CreateLobbyParams = {
  gameId: string;
  stageId: string;
  users: NotSBUser[];
};

export const createLobbyRequestFx = createEffect<
  CreateLobbyParams,
  Lobby,
  PostgrestError
>(async (params) => {
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .insert({ gameId: params.gameId, stageId: params.stageId })
    .select(
      `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
    )
    .single();
  if (lobbyError) throw lobbyError;
  // console.log('createLobbyRequestFx -> insert lobby', lobby, lobbyError);

  if (lobby && lobby.users.length === 0) {
    const bulk = params.users.map((user) => ({ lobbyId: lobby.id, userId: user.id }));
    const { error: lobbyUsersError } = await supabase.from('lobby_users').insert(bulk);
    if (lobbyUsersError) throw lobbyUsersError;
    // console.log('createLobbyRequestFx -> link users to lobby', lobbyUsersError);
  }

  const { data: lobbyWithUsers, error: lobbyWithUsersError } = await supabase
    .from('lobbies')
    .select(
      `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*)`,
    )
    .eq('id', lobby.id)
    .single();
  if (lobbyWithUsersError) throw lobbyWithUsersError;
  // console.log(
  //   'createLobbyRequestFx -> get lobby with users',
  //   lobbyWithUsers,
  //   lobbyWithUsersError,
  // );
  return lobbyWithUsers as Lobby;
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
        `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
      )
      .eq('id', params.lobbyId)
      .single();
    if (lobbyError) throw lobbyError;
    // console.log(`getLobbyRequestFx -> get lobby #${params.lobbyId}`, lobby, lobbyError);
    return lobby as Lobby;
  },
);

export const getLobbiesRequestFx = createEffect<void, Lobby[], PostgrestError>(
  async () => {
    const { data: lobbies, error: lobbiesError } = await supabase
      .from('lobbies')
      .select(
        `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
      );
    if (lobbiesError) throw lobbiesError;
    // console.log(`getLobbiesRequestFx -> get lobbies`, lobbies, lobbiesError);
    return lobbies as Lobby[];
  },
);

type UpdateLobbyStageParams = {
  stageId: string;
  lobbyId: string;
};

export const updateLobbyStageRequestFx = createEffect<
  UpdateLobbyStageParams,
  Lobby,
  PostgrestError
>(async (params) => {
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .update({ stageId: params.stageId })
    .eq('id', params.lobbyId)
    .select(
      `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
    )
    .single();
  if (lobbyError) throw lobbyError;
  // console.log(`updateLobbyStageFx -> update lobby stage and return lobby`, lobby, lobbyError);
  return lobby as Lobby;
});

type UpdateLobbyParams = Lobby;

export const updateLobbyRequestFx = createEffect<
  UpdateLobbyParams,
  Lobby,
  PostgrestError
>(async (params) => {
  const { createdAt, closed, finished } = params;
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .update({
      createdAt,
      closed,
      finished,
      gameId: params.game.id,
      stageId: params.stage.id,
      winner: params.winner?.id ?? null,
    })
    .eq('id', params.id)
    .select(
      `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
    )
    .single();
  if (lobbyError) throw lobbyError;
  // console.log(`updateLobbyRequestFx -> update lobby and return lobby`, lobbyError, lobbyError);
  return lobby as Lobby;
});

type DeleteLobbyStageParams = {
  lobbyId: string;
};

export const deleteLobbyRequestFx = createEffect<
  DeleteLobbyStageParams,
  null,
  PostgrestError
>(async (params) => {
  const { data: deleteResp, error: deleteRespError } = await supabase
    .from('lobbies')
    .delete()
    .eq('id', params.lobbyId);
  // .select(
  //   `id, createdAt, game:games(*), finished, winner:users!lobbies_winner_fkey(*), closed, users!lobby_users(*), stage:stages(*)`,
  // )
  // .single();
  if (deleteRespError) throw deleteRespError;
  // console.log(`deleteLobbyStageFx -> delete lobby`, deleteResp, deleteRespError);
  return deleteResp;
});

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
  // console.log(
  //   `getKDPlayerDetailsRequestFx -> get player KD Details`,
  //   KDPlayerDetails,
  //   KDPlayerDetailsError,
  // );
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
  // console.log(
  //   `createKDPlayerDetailsRequestFx -> insert player KD Detail`,
  //   KDPlayerDetail,
  //   KDPlayerDetailError,
  // );
  return KDPlayerDetail;
});

type UpsertKDPlayerDetailsParams = KDPlayerDetail[];

export const upsertKDPlayerDetailsRequestFx = createEffect<
  UpsertKDPlayerDetailsParams,
  KDPlayerDetail[],
  PostgrestError
>(async (params) => {
  const { data: KDPlayerDetail, error: KDPlayerDetailError } = await supabase
    .from('KDPlayerDetails')
    .upsert(params)
    .select();
  if (KDPlayerDetailError) throw KDPlayerDetailError;
  // console.log(
  //   `upsertKDPlayerDetailsRequestFx -> upser player KD Detail`,
  //   KDPlayerDetail,
  //   KDPlayerDetailError,
  // );
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
  // console.log(
  //   `getKDLobbySettingsRequestFx -> get player KD Details`,
  //   KDLobbySettings,
  //   KDLobbySettingsError,
  // );
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
  // console.log(
  //   `createKDLobbySettingRequestFx -> insert KDLobbySetting`,
  //   KDLobbySetting,
  //   KDLobbySettingError,
  // );
  return KDLobbySetting;
});

export type KDTurn = {
  id: string;
  created_at: string;
  // userId: string;
  user: UserDetails | null;
  round: number;
  firstHit: number | null;
  secondHit: number | null;
  thirdHit: number | null;
};

export type CreateKDTurnParams = {
  lobbyId: string;
  userId: string;
  round: number;
  firstHit: number | null;
  secondHit: number | null;
  thirdHit: number | null;
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
        lobbyId: params.lobbyId,
        userId: params.userId,
        round: params.round,
        firstHit: params.firstHit,
        secondHit: params.secondHit,
        thirdHit: params.thirdHit,
      },
    ])
    .select(
      `id, created_at, lobbyId, round, firstHit, secondHit, thirdHit, user:users(*)`,
    )
    .single();
  if (KDTurnError) throw KDTurnError;
  // console.log(`createKDTurnRequestFx -> insert KDTurn`, KDTurn, KDTurnError);
  return KDTurn;
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
    .select(
      'id, created_at, lobbyId, round, firstHit, secondHit, thirdHit, user:users(*)',
    )
    .eq('lobbyId', params.lobbyId);
  if (KDTurnsError) throw KDTurnsError;
  console.log(`getKDTurnRequestFx -> get KDTurns`, KDTurns, KDTurnsError);
  return KDTurns;
});
