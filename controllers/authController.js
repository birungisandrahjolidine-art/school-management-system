const User = require("../models/User");
const {
  clearSessionCookie,
  redirectForRole,
  roleLabel,
  setSessionCookie,
} = require("../middleware/auth");

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 64;

// Verified against when the username does not exist so that a missing account
// and a wrong password take a similar amount of time.
const DUMMY_HASH = User.hashPassword("edusphere-dummy-password");

function normaliseUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function normaliseRole(value) {
  return String(value || "").trim().toLowerCase();
}

function validateCredentials(username, password) {
  if (!username) return "Username is required.";
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-30 characters using letters, numbers, dots, hyphens or underscores.";
  }
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  }
  return "";
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
    roleLabel: roleLabel(user.role),
    fullName: user.fullName,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

async function countActiveAdmins(exceptId) {
  const filter = { role: "admin", isActive: true };
  if (exceptId) filter._id = { $ne: exceptId };
  return User.countDocuments(filter);
}

exports.login = async (req, res, next) => {
  try {
    const username = normaliseUsername(req.body.username);
    const password = String(req.body.password || "");
    const requestedRole = normaliseRole(req.body.role);

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = await User.findOne({ username }).select("+passwordHash");
    const matches = User.verifyPassword(password, user ? user.passwordHash : DUMMY_HASH);

    if (!user || !matches) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "This account has been deactivated. Please contact the administrator.",
      });
    }

    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({
        error: `This account is registered as ${roleLabel(user.role)}, not ${roleLabel(requestedRole)}.`,
      });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    setSessionCookie(res, user);

    res.json({ user: publicUser(user), redirect: redirectForRole(user.role) });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
};

exports.logoutPage = (req, res) => {
  clearSessionCookie(res);
  res.redirect("/teachers/login");
};

exports.me = (req, res) => {
  res.json({ user: publicUser(req.user), redirect: redirectForRole(req.user.role) });
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const username = normaliseUsername(req.body.username);
    const password = String(req.body.password || "");
    const role = normaliseRole(req.body.role);
    const fullName = String(req.body.fullName || "").trim();

    const problem = validateCredentials(username, password);
    if (problem) return res.status(400).json({ error: problem });

    if (!User.ROLES.includes(role)) {
      return res.status(400).json({ error: "Select a valid role." });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "That username is already taken." });
    }

    const user = await User.create({
      username,
      role,
      fullName,
      passwordHash: User.hashPassword(password),
      createdBy: req.user._id,
    });

    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ error: first ? first.message : "Invalid user details." });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "That username is already taken." });
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    const isSelf = String(user._id) === String(req.user._id);

    if (req.body.role !== undefined) {
      const role = normaliseRole(req.body.role);
      if (!User.ROLES.includes(role)) {
        return res.status(400).json({ error: "Select a valid role." });
      }

      const losesAdmin = user.role === "admin" && role !== "admin";
      if (losesAdmin && isSelf) {
        return res.status(400).json({ error: "You cannot change your own admin role." });
      }
      if (losesAdmin && (await countActiveAdmins(user._id)) === 0) {
        return res.status(400).json({ error: "At least one active admin must remain." });
      }

      user.role = role;
    }

    if (req.body.isActive !== undefined) {
      const isActive = Boolean(req.body.isActive);

      if (!isActive && isSelf) {
        return res.status(400).json({ error: "You cannot deactivate your own account." });
      }
      if (!isActive && user.role === "admin" && (await countActiveAdmins(user._id)) === 0) {
        return res.status(400).json({ error: "At least one active admin must remain." });
      }

      user.isActive = isActive;
    }

    if (req.body.fullName !== undefined) {
      user.fullName = String(req.body.fullName || "").trim();
    }

    if (req.body.password !== undefined && String(req.body.password).length > 0) {
      const password = String(req.body.password);
      const problem = validateCredentials(user.username, password);
      if (problem) return res.status(400).json({ error: problem });
      user.passwordHash = User.hashPassword(password);
    }

    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }

    if (user.role === "admin" && user.isActive && (await countActiveAdmins(user._id)) === 0) {
      return res.status(400).json({ error: "At least one active admin must remain." });
    }

    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
