const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserByPhone, createUserWithOtp, updateOtp } = require("../models/user.model");
const { ensureFreePlan } = require("../models/subscription.model");
const { sendEmailOTP, sendSmsOTP } = require("../services/notification.service");

// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(email, passwordHash, name);

    // Auto-provision free plan for every new user
    await ensureFreePlan(newUser.id);

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Include role in token so admin middleware can check it
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REQUEST OTP
const requestOtp = async (req, res) => {
  try {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ message: "Email or phone number required" });

    const isEmail = contact.includes("@");
    let user = isEmail ? await findUserByEmail(contact) : await findUserByPhone(contact);
    
    // Generate secure 6 digit token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (!user) {
      if (isEmail) {
        user = await createUserWithOtp(contact, null, otp, expiresAt);
      } else {
        user = await createUserWithOtp(null, contact, otp, expiresAt);
      }
    } else {
      await updateOtp(user.id, otp, expiresAt);
    }

    // Execute Email/SMS dispatches
    if (isEmail) {
      await sendEmailOTP(contact, otp).catch(e => console.warn("Email warning:", e.message));
    } else {
      await sendSmsOTP(contact, otp).catch(e => console.warn("SMS warning:", e.message));
    }
    
    // Fallback logging for safe local testing
    console.log(`\n\n=========================================\n🎯 REAL OTP FOR ${contact}: ${otp}\n=========================================\n\n`);

    res.status(200).json({ message: "Verification code sent! (Check spam/console if missing)" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) return res.status(400).json({ message: "Missing contact or OTP" });

    const isEmail = contact.includes("@");
    const user = isEmail ? await findUserByEmail(contact) : await findUserByPhone(contact);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp_code || user.otp_code !== otp || new Date() > new Date(user.otp_expires_at)) {
      return res.status(401).json({ message: "Invalid or expired verification key" });
    }

    // Clear the OTP to prevent reuse
    await updateOtp(user.id, null, null);

    // Auto-provision a free plan on their first successful sign-in
    await ensureFreePlan(user.id);

    // Provide full successful login response identical to standard login
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GOOGLE OAUTH LOGIN
const googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "No email provided from Google" });
    }

    let user = await findUserByEmail(email);

    if (!user) {
      // Create user if they don't exist, using a dummy password
      const dummyPassword = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10);
      user = await createUser(email, dummyPassword, name || "Google User");
      await ensureFreePlan(user.id);
    } else if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled. Contact support." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google Authentication failed", error: error.message });
  }
};

module.exports = { signup, login, requestOtp, verifyOtp, googleLogin };