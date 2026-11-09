const crypto = require("crypto");
const User = require("../models/User");

const COOKIE_NAME = "edusphere_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 8;

const DEV_SECRET = "edusphere-development-secret";
const SECRET = process.env.SESSION_SECRET || DEV_SECRET;

if (!process.env.SESSION_SECRET) {
  console.warn(
    "[auth] SESSION_SECRET is not set - falling back to an insecure development secret."
  );
}

const ROLE_HOME = {
  admin: "/home",
  teacher: "/teachers/dashboard",
  bursar: "/bursar/dashboard",
  librarian: "/library.pug",
};

const ROLE_LABEL = {
  admin: "Admin",
  teacher: "Teacher",
  bursar: "Bursar",
  librarian: "Librarian",
};

function redirectForRole(role) {
  return ROLE_HOME[role] || "/teachers/login";
}

function roleLabel(role) {
  return ROLE_LABEL[role] || "User";
}

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: String(user._id),
      role: user.role,
      exp: Date.now() + MAX_AGE_MS,
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token) {
  if (typeof token !== "string") return null;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const payload = token.slice(0, separator);
  const signature = Buffer.from(token.slice(separator + 1));
  const expected = Buffer.from(sign(payload));

  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(signature, expected)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch (err) {
    return null;
  }

  if (!data || !data.sub || !data.exp || data.exp < Date.now()) return null;

  return data;
}

function parseCookies(header) {
  const parsed = {};

  if (!header) return parsed;

  header.split(";").forEach((chunk) => {
    const separator = chunk.indexOf("=");
    if (separator < 1) return;

    const key = chunk.slice(0, separator).trim();
    const value = chunk.slice(separator + 1).trim();

    if (key) parsed[key] = decodeURIComponent(value);
  });

  return parsed;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, createSessionToken(user), {
    ...cookieOptions(),
    maxAge: MAX_AGE_MS,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

async function currentUser(req) {
  const session = readSessionToken(parseCookies(req.headers.cookie)[COOKIE_NAME]);
  if (!session) return null;

  const user = await User.findById(session.sub);
  if (!user || !user.isActive) return null;

  // A role change invalidates existing sessions.
  if (user.role !== session.role) return null;

  return user;
}

function expectsJson(req) {
  return (
    req.originalUrl.startsWith("/api") ||
    (req.get("accept") || "").includes("application/json")
  );
}

function reject(req, res, status, message) {
  if (expectsJson(req)) {
    return res.status(status).json({ error: message });
  }
  return res.redirect("/teachers/login");
}

// Attaches req.user when a valid session exists but never blocks the request.
async function loadCurrentUser(req, res, next) {
  try {
    req.user = await currentUser(req);
  } catch (err) {
    req.user = null;
  }
  next();
}

async function requireAuth(req, res, next) {
  try {
    const user = await currentUser(req);
    if (!user) return reject(req, res, 401, "Please sign in to continue.");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  const allowed = roles.flat();

  return async function (req, res, next) {
    try {
      const user = await currentUser(req);

      if (!user) return reject(req, res, 401, "Please sign in to continue.");

      if (!allowed.includes(user.role)) {
        const message = `This area is restricted to ${allowed
          .map(roleLabel)
          .join(", ")} accounts.`;

        if (expectsJson(req)) {
          return res.status(403).json({ error: message });
        }

        // Send a signed-in user back to their own dashboard instead of the
        // sign-in page, so they are not bounced around.
        return res.redirect(redirectForRole(user.role));
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  COOKIE_NAME,
  ROLE_HOME,
  clearSessionCookie,
  currentUser,
  loadCurrentUser,
  redirectForRole,
  requireAuth,
  requireRole,
  roleLabel,
  setSessionCookie,
};
