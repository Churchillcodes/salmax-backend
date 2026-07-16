const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ROLES_LIST = require("../config/roles_list");

// register new user
const handleNewUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required!" });
    }

    const duplicateUsername = await User.findOne({ username });
    if (duplicateUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const duplicateEmail = await User.findOne({ email });
    if (duplicateEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPwd,
      roles: { User: ROLES_LIST.User },
    });

    res.status(201).json({ message: `User ${username} created successfully` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// handle new login
const handleNewLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!foundUser.isActive) {
      return res.status(403).json({
        message: "Account has been deactivated. Please contact support.",
      });
    }

    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const roles = Object.values(foundUser.roles).filter(Boolean);

    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// refreshing/getting new accessToken
const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) return res.sendStatus(403);

    if (!foundUser.isActive) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username) {
          return res.sendStatus(403);
        }

        const roles = Object.values(foundUser.roles).filter(Boolean);

        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
              roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );
        res.json({ accessToken });
      },
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// logging out
const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(204);
    }

    foundUser.refreshToken = "";
    await foundUser.save();

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  handleNewUser,
  handleNewLogin,
  handleRefreshToken,
  handleLogout,
};
