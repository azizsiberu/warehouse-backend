// models/User.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  async registerUser({ fullName, email, phone, password }) {
    const username = fullName.toLowerCase().replace(/\s/g, "");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Menyimpan user di tabel `users`
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email`,
      [username, email, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Menyimpan profil di tabel `user_profiles`
    await pool.query(
      `INSERT INTO user_profiles (id_users, nama_lengkap, nomor_telepon) VALUES ($1, $2, $3)`,
      [userId, fullName, phone]
    );

    return userResult.rows[0];
  },

  async getUserByEmailOrUsername(identifier) {
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)",
      [identifier]
    );
    return result.rows[0];
  },

  async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);
  },

  async getProfile(userId) {
    const result = await pool.query(
      "SELECT nama_lengkap, foto_profil FROM user_profiles WHERE id_users = $1",
      [userId]
    );
    return result.rows[0];
  },

  // Menyimpan token reset dan waktu kedaluwarsanya
  async setResetToken(email, token, expiresAt) {
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expiresAt, email]
    );
  },

  // Memeriksa token reset dan waktu kedaluwarsa
  async getResetToken(email) {
    const result = await pool.query(
      "SELECT reset_password_token, reset_password_expires FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },

  async clearResetToken(email) {
    await pool.query(
      "UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE email = $1",
      [email]
    );
  },
};

module.exports = User;
