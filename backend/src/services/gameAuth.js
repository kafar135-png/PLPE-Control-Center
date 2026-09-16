const crypto = require("crypto");

const { supabase, createSupabaseAuthClient } = require("./supabase");

const SESSION_DAYS = Math.max(
  1,
  Number(process.env.GAME_SESSION_DAYS || 7)
);

function normalizeWalletAddress(value) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function normalizeEmail(value) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (
    normalized.length < 5 ||
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

function normalizeNickname(value) {
  if (typeof value !== "string") return null;

  const nickname = value.trim();

  if (nickname.length < 3 || nickname.length > 20) {
    return null;
  }

  if (!/^[\p{L}\p{N}_-]+$/u.test(nickname)) {
    return null;
  }

  return nickname;
}

function validatePassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function authError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createGameSession(walletAddress) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase
    .from("game_sessions")
    .insert({
      token_hash: tokenHash,
      wallet_address: walletAddress,
      expires_at: expiresAt,
      last_seen: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Unable to create game session: ${error.message}`);
  }

  return {
    token,
    expiresAt,
  };
}

async function registerGameAccount({
  email: emailInput,
  nickname: nicknameInput,
  password,
  walletAddress: walletAddressInput,
}) {
  const email = normalizeEmail(emailInput);
  const nickname = normalizeNickname(nicknameInput);
  const walletAddress = normalizeWalletAddress(walletAddressInput);

  if (!email) {
    throw authError("Enter a valid email address");
  }

  if (!nickname) {
    throw authError(
      "Nickname must be 3-20 characters and use letters, numbers, _ or -"
    );
  }

  if (!validatePassword(password)) {
    throw authError("Password must be at least 8 characters");
  }

  if (!walletAddress) {
    throw authError(
      "Connect your wallet in PLPE OS before creating a game account"
    );
  }

  const nicknameKey = nickname.toLocaleLowerCase("en-US");

  const [walletCheck, emailCheck, nicknameCheck] = await Promise.all([
    supabase
      .from("game_players")
      .select("wallet_address")
      .eq("wallet_address", walletAddress)
      .maybeSingle(),
    supabase
      .from("game_players")
      .select("wallet_address")
      .eq("login_email", email)
      .maybeSingle(),
    supabase
      .from("game_players")
      .select("wallet_address")
      .eq("nickname_key", nicknameKey)
      .maybeSingle(),
  ]);

  for (const check of [walletCheck, emailCheck, nicknameCheck]) {
    if (check.error) {
      throw new Error(`Unable to validate account: ${check.error.message}`);
    }
  }

  if (walletCheck.data) {
    throw authError("This wallet is already linked to a PLPE Game account", 409);
  }

  if (emailCheck.data) {
    throw authError("An account with this email already exists", 409);
  }

  if (nicknameCheck.data) {
    throw authError("This nickname is already taken", 409);
  }

  const { data: authData, error: authCreateError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nickname,
        wallet_address: walletAddress,
      },
    });

  if (authCreateError || !authData?.user) {
    const message = authCreateError?.message || "Unable to create account";

    if (/already|registered|exists/i.test(message)) {
      throw authError("An account with this email already exists", 409);
    }

    throw new Error(`Unable to create auth account: ${message}`);
  }

  const authUserId = authData.user.id;

  const { data: player, error: playerError } = await supabase
    .from("game_players")
    .insert({
      wallet_address: walletAddress,
      auth_user_id: authUserId,
      login_email: email,
      nickname,
      nickname_key: nicknameKey,
      presence_status: "online",
      last_seen: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (playerError) {
    await supabase.auth.admin.deleteUser(authUserId).catch(() => undefined);

    if (playerError.code === "23505") {
      throw authError("Email, nickname or wallet is already in use", 409);
    }

    throw new Error(`Unable to create player profile: ${playerError.message}`);
  }

  const session = await createGameSession(walletAddress);

  return {
    ...session,
    player,
  };
}

async function findAccountByLogin(loginInput) {
  if (typeof loginInput !== "string" || !loginInput.trim()) {
    throw authError("Enter your nickname or email");
  }

  const login = loginInput.trim();
  const email = normalizeEmail(login);

  let query = supabase
    .from("game_players")
    .select("*")
    .limit(1);

  if (email) {
    query = query.eq("login_email", email);
  } else {
    query = query.eq("nickname_key", login.toLocaleLowerCase("en-US"));
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Unable to load game account: ${error.message}`);
  }

  if (!data || !data.auth_user_id || !data.login_email) {
    throw authError("Invalid nickname/email or password", 401);
  }

  return data;
}

async function loginGameAccount(loginInput, password) {
  if (!validatePassword(password)) {
    throw authError("Invalid nickname/email or password", 401);
  }

  const player = await findAccountByLogin(loginInput);

  // IMPORTANT: never authenticate a user on the shared service-role client.
  // signInWithPassword mutates the client's auth session; if we used `supabase`
  // here, later database calls would run as the player and RLS would deny them.
  const authClient = createSupabaseAuthClient();

  const { data: authData, error: authErrorResult } =
    await authClient.auth.signInWithPassword({
      email: player.login_email,
      password,
    });

  if (
    authErrorResult ||
    !authData?.user ||
    authData.user.id !== player.auth_user_id
  ) {
    throw authError("Invalid nickname/email or password", 401);
  }

  const now = new Date().toISOString();

  const { data: refreshedPlayer, error: updateError } = await supabase
    .from("game_players")
    .update({
      presence_status: "online",
      last_seen: now,
      updated_at: now,
    })
    .eq("wallet_address", player.wallet_address)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(`Unable to update player login: ${updateError.message}`);
  }

  const session = await createGameSession(player.wallet_address);

  return {
    ...session,
    player: refreshedPlayer,
  };
}

async function getSessionByToken(token) {
  if (typeof token !== "string" || token.length < 32) {
    return null;
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("game_sessions")
    .select("token_hash,wallet_address,expires_at,last_seen")
    .eq("token_hash", tokenHash)
    .gt("expires_at", now)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load game session: ${error.message}`);
  }

  return data || null;
}

async function touchSession(token) {
  const tokenHash = hashToken(token);

  const { error } = await supabase
    .from("game_sessions")
    .update({
      last_seen: new Date().toISOString(),
    })
    .eq("token_hash", tokenHash);

  if (error) {
    console.warn("[GAME AUTH] Unable to touch session:", error.message);
  }
}

async function logoutSession(token) {
  if (!token) return;

  const tokenHash = hashToken(token);

  const { error } = await supabase
    .from("game_sessions")
    .delete()
    .eq("token_hash", tokenHash);

  if (error) {
    throw new Error(`Unable to log out game session: ${error.message}`);
  }
}

module.exports = {
  normalizeWalletAddress,
  normalizeEmail,
  normalizeNickname,
  registerGameAccount,
  loginGameAccount,
  getSessionByToken,
  touchSession,
  logoutSession,
};
