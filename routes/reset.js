const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Model_Users = require('../model/Model_Users');
const Model_ResetToken = require('../model/Model_ResetToken');
const axios = require('axios'); // Untuk kirim lewat Fonnte

router.get('/reset-password-request', (req, res) => {
    res.render('auth/request-reset', { messages: req.flash() });
  });
  

router.post('/reset-password-request', async (req, res) => {
    const { nama, email, kontak } = req.body;
  
    try {
      const users = await Model_Users.Login(email); // login pakai email
  
      if (!users || users.length === 0) {
        req.flash('error', 'Email tidak ditemukan');
        return res.redirect('/reset-password-request');
      }
  
      const user = users[0];
  
      // Validasi nama dan kontak cocok
      if (user.nama !== nama || user.kontak !== kontak) {
        req.flash('error', 'Nama atau kontak tidak sesuai dengan email');
        return res.redirect('/reset-password-request');
      }
  
      // Buat token dan simpan
      const token = crypto.randomBytes(32).toString('hex');
      const expired = new Date(Date.now() + 15 * 60 * 1000); // 15 menit dari sekarang
  
      await Model_ResetToken.deleteByUserId(user.id_users); // hapus token lama
      await Model_ResetToken.create({
        id_users: user.id_users,
        token,
        expired
      });
  
      // Kirim via WhatsApp (pakai Fonnte)
      const resetLink = `https://ipsnhtalango.kabupatensumenep.com/reset-password/${token}`;
      const pesan = `Halo ${user.nama},\n\nKami menerima permintaan reset password akun Anda.\nKlik link berikut:\n${resetLink}\n\nLink berlaku 15 menit.`;
  
      await axios.post('https://api.fonnte.com/send', {
        target: kontak,
        message: pesan
      }, {
        headers: {
          Authorization: 'MPr29fTEUGQwo6AzP9j8' // ganti dengan API key kamu
        }
      });
  
      req.flash('success', 'Link reset berhasil dikirim ke WhatsApp Anda');
      res.redirect('/reset-password-request');
  
    } catch (err) {
      console.error('Error reset-password-request:', err);
      req.flash('error', 'Terjadi kesalahan saat mengirim link reset');
      res.redirect('/reset-password-request');
    }
  });

  

// Tampilkan form reset password
router.get('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
  
    try {
      const tokenData = await Model_ResetToken.findByToken(token);
  
      if (!tokenData || new Date(tokenData.expired) < new Date()) {
        req.flash('error', 'Token tidak valid atau sudah kadaluarsa');
        return res.redirect('/reset-password-request');
      }
  
      res.render('auth/reset-password', { token, messages: req.flash() });
    } catch (err) {
      console.error('GET /reset-password/:token error:', err);
      req.flash('error', 'Terjadi kesalahan');
      res.redirect('/reset-password-request');
    }
  });
  



  router.post('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;
  
    try {
      const tokenData = await Model_ResetToken.findByToken(token);
  
      if (!tokenData || new Date(tokenData.expired) < new Date()) {
        req.flash('error', 'Token tidak valid atau sudah kadaluarsa');
        return res.redirect('/reset-password-request');
      }
  
      if (password !== confirmPassword) {
        req.flash('error', 'Password tidak sama');
        return res.redirect(`/reset-password/${token}`);
      }
  
      const hashed = await bcrypt.hash(password, 10);
  
      await Model_Users.UpdateById(tokenData.id_users, { password: hashed });
      await Model_ResetToken.deleteByUserId(tokenData.id_users); // hapus token setelah digunakan
  
      req.flash('success', 'Password berhasil diubah. Silakan login.');
      res.redirect('/login');
    } catch (err) {
      console.error('POST /reset-password/:token error:', err);
      req.flash('error', 'Gagal reset password');
      res.redirect('/reset-password-request');
    }
  });
  

module.exports = router;
