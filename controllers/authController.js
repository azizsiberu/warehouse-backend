// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwtUtils");
const sendEmail = require("../utils/sendEmail");

const authController = {
  async register(req, res) {
    console.log("Memulai proses registrasi...");
    const { fullName, email, phone, password } = req.body;
    console.log("Data diterima untuk registrasi:", { fullName, email, phone });

    try {
      console.log("Mengecek apakah email atau username sudah terdaftar...");
      const existingUser = await User.getUserByEmailOrUsername(email);
      if (existingUser) {
        console.log("Email atau username sudah terdaftar:", email);
        return res
          .status(400)
          .json({ message: "Email atau username sudah terdaftar" });
      }

      console.log("Mendaftarkan pengguna baru...");
      const newUser = await User.registerUser({
        fullName,
        email,
        phone,
        password,
      });
      console.log("Pengguna baru berhasil didaftarkan:", newUser);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error saat registrasi:", error);
      res.status(500).json({ message: "Error saat registrasi", error });
    }
  },

  async login(req, res) {
    console.log("Memulai proses login...");
    const { identifier, password } = req.body;
    console.log("Data login diterima:", { identifier });

    try {
      console.log("Mencari pengguna berdasarkan email atau username...");
      const user = await User.getUserByEmailOrUsername(identifier);
      if (!user) {
        console.log("Pengguna tidak ditemukan:", identifier);
        return res
          .status(401)
          .json({ message: "Username/email atau password salah" });
      }

      console.log("Mencocokkan password...");
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordMatch) {
        console.log("Password tidak cocok untuk pengguna:", identifier);
        return res
          .status(401)
          .json({ message: "Username/email atau password salah" });
      }

      // Ambil profil pengguna dari tabel user_profiles
      const profile = await User.getProfile(user.id);

      console.log("Password cocok. Menghasilkan token...");
      const token = generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      console.log("Token berhasil dibuat:", token);

      // Mengembalikan token dan profil pengguna dalam respons
      res.json({
        token,
        profile: {
          nama_lengkap: profile.nama_lengkap,
          foto_profil: profile.foto_profil,
        },
        userId: user.id,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login error", error });
    }
  },

  async forgotPassword(req, res) {
    console.log("Memulai proses forgotPassword...");
    const { email } = req.body || {};
    console.log("Email dari request body:", email);

    if (!email) {
      console.log("Email tidak ditemukan di request body");
      return res.status(400).json({ message: "Email diperlukan" });
    }

    try {
      console.log("Mencari pengguna dengan email:", email);
      const user = await User.getUserByEmailOrUsername(email);
      if (!user) {
        console.log("Pengguna tidak ditemukan untuk email:", email);
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      console.log("Membuat kode verifikasi...");
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Kode verifikasi yang dihasilkan:", code);

      const expiresAt = new Date(Date.now() + 3600000);
      console.log("Waktu kadaluarsa kode verifikasi:", expiresAt);

      console.log("Menyimpan kode verifikasi ke database...");
      await User.setResetToken(email, code, expiresAt);

      const htmlContent = `
        <p>Gunakan kode berikut untuk reset password Anda:</p>
        <h2>${code}</h2>
        <p>Kode ini berlaku selama 1 jam.</p>
      `;
      console.log("Konten email siap untuk dikirim.");

      console.log("Mengirim email ke:", email);
      await sendEmail(
        email,
        "Kode Reset Password",
        `Gunakan kode ini untuk reset password Anda: ${code}`,
        htmlContent
      );
      console.log(
        `Kode terkirim ke email: ${email} dengan kode verifikasi: ${code}`
      );

      res
        .status(200)
        .json({ message: "Kode verifikasi telah dikirim ke email Anda" });
    } catch (error) {
      console.error("Error dalam proses forgotPassword:", error);
      res.status(500).json({ message: "Error saat lupa sandi", error });
    }
  },

  async resetPassword(req, res) {
    console.log("Memulai proses resetPassword...");
    const { email, newPassword } = req.body;
    console.log("Data reset password diterima:", { email });

    try {
      console.log("Memperbarui password di database...");
      await User.updatePassword(email, newPassword);
      console.log("Password berhasil diperbarui untuk email:", email);

      await User.clearResetToken(email); // Hapus reset token setelah berhasil
      console.log("Reset token dihapus dari database.");

      res.status(200).json({ message: "Password berhasil diperbarui" });
    } catch (error) {
      console.error("Error saat reset password:", error);
      res.status(500).json({ message: "Error saat reset password", error });
    }
  },

  async verifyCode(req, res) {
    console.log("Memulai proses verifikasi kode...");
    const { email, code } = req.body;
    console.log("Data verifikasi diterima:", { email, code });

    try {
      console.log("Mencari pengguna berdasarkan email...");
      const user = await User.getUserByEmailOrUsername(email);
      if (!user) {
        console.log("Pengguna tidak ditemukan:", email);
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      console.log("Mengambil reset token dari database...");
      const { reset_password_token, reset_password_expires } =
        await User.getResetToken(email);

      console.log("Memverifikasi kode yang diberikan...");
      if (reset_password_token !== code) {
        console.log("Kode verifikasi tidak valid:", code);
        return res.status(400).json({ message: "Kode verifikasi tidak valid" });
      }

      console.log("Memeriksa apakah kode sudah kedaluwarsa...");
      if (new Date() > new Date(reset_password_expires)) {
        console.log("Kode verifikasi sudah kedaluwarsa untuk email:", email);
        return res
          .status(400)
          .json({ message: "Kode verifikasi sudah kedaluwarsa" });
      }

      console.log("Kode verifikasi valid untuk email:", email);
      res.status(200).json({ message: "Kode verifikasi valid" });
    } catch (error) {
      console.error("Error saat verifikasi kode:", error);
      res.status(500).json({ message: "Error saat verifikasi kode", error });
    }
  },

  // Fungsi untuk memvalidasi token
  async validateToken(req, res) {
    try {
      console.log("Token valid untuk user:", req.user);
      res.status(200).json({ valid: true, user: req.user });
    } catch (error) {
      console.error("Validasi token gagal:", error);
      res.status(401).json({ valid: false, message: "Token tidak valid" });
    }
  },
};

module.exports = authController;
