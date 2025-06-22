var express = require("express");
var router = express.Router();
var connection = require("../config/database.js");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const Model_Berita = require('../model/Model_Berita.js');

var Model_Users = require("../model/Model_Users.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/users"); // Pastikan folder ini ada
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res, next) => {
  try {
    let id = req.session.userId;
    // let Data = await Model_Users.getId(id);
    let rows = await Model_Berita.getAll();
    let batas = await Model_Berita.getLimited(4);
    res.render('index', {
        data: rows,
        batas: batas,
        user: {
          nama: req.session.nama,
          foto: req.session.foto,
          role: req.session.role,
          
        },
        
    });
} catch (error) {
    next(error);
}

});


router.get("/register", function (req, res, next) {
  res.render("auth/register");
});

router.get("/login", function (req, res, next) {
  res.render("auth/login", {
    success: req.flash('success'),
    failure: req.flash('failure'),
    error: req.flash('error'),
    title: 'Login - IPS Nur Harias'
  });
});
router.get("/loginAdmin", function (req, res, next) {
  res.render("auth/loginAdmin");
});

// ROUTE UNTUK REGISTER USER
router.post("/saveusers", async (req, res) => {
  try {
    console.log("Data dari form:", req.body); // Debugging

    let { nama, kontak, email, password } = req.body;

    // Validasi Input
    if (!nama || !kontak || !email || !password) {
      req.flash("error", "Semua field harus diisi.");
      return res.redirect("/register");
    }

    // Enkripsi Password
    let enkripsi = await bcrypt.hash(password, 10);

    let Data = {
      nama,
      kontak,
      email,
      password: enkripsi,
      role: "admin", // Perbaiki menjadi string ENUM dari database
    };

    console.log("Data yang akan disimpan:", Data); // Debugging

    await Model_Users.Store(Data); // Pastikan fungsi ini benar
    req.flash("success", "Berhasil Register");
    res.redirect("/login");
  } catch (error) {
    console.error("Error saat register:", error);
    req.flash("error", "Registration failed. Please try again.");
    res.redirect("/register");
  }
});

// ROUTE UNTUK LOGIN USER
router.post("/log", async (req, res) => {
  let { email, password } = req.body;

  try {
    let Data = await Model_Users.Login(email);
    console.log("Hasil pencarian user:", Data); // Debugging data dari database

    if (Data.length > 0) {
      let enkripsi = Data[0].password;
      let cek = await bcrypt.compare(password, enkripsi);

      if (cek) {
        // Simpan data session dasar
        req.session.userId = Data[0].id_users;
        req.session.role = Data[0].role;
        req.session.nama = Data[0].nama;
        req.session.kontak = Data[0].kontak;
        req.session.email = Data[0].email;
        req.session.foto = Data[0].foto || 'default.jpg';

      
        if (Data[0].role === "anggota") {
          connection.query(
            "SELECT foto FROM anggota WHERE id_users = ?",
            [Data[0].id_users],
            (err, rows) => {
              if (err) throw err;
              req.session.foto = rows[0]?.foto || "default.jpg"; // fallback jika null
              req.flash("success", "Berhasil login");
              return res.redirect("/");
            }
          );
        } else if (Data[0].role === "pelatih") {
          connection.query(
            "SELECT foto FROM pelatih WHERE id_users = ?",
            [Data[0].id_users],
            (err, rows) => {
              if (err) throw err;
              req.session.foto = rows[0]?.foto || "default.jpg";
              req.flash("success", "Berhasil login");
              return res.redirect("/");
            }
          );
        
        } else {
          req.flash("failure", "Role user tidak dikenali");
          return res.redirect("/login");
        }
      }
       else {
        console.log("Password salah untuk email:", email);
        req.flash("failure", "Email atau password salah");
        return res.redirect("/login");
      }
    } else {
      console.log("Akun tidak ditemukan untuk email:", email);
      req.flash("failure", "Akun tidak ditemukan");
      return res.redirect("/login");
    }
  } catch (err) {
    console.error("Error saat login:", err);
    req.flash("failure", "Terjadi kesalahan saat login");
    return res.redirect("/login");
  }
});

// ROUTE UNTUK LOGIN ADMIN
router.post("/logadmin", async (req, res) => {
  let { email, password } = req.body;

  try {
    let Data = await Model_Users.Login(email);
    console.log("Login admin:", Data);

    if (Data.length > 0) {
      let enkripsi = Data[0].password;
      let cek = await bcrypt.compare(password, enkripsi);

      if (cek) {
        if (Data[0].role === "admin") {
          req.session.userId = Data[0].id_users;
          req.session.role = Data[0].role;
          req.session.nama = Data[0].nama;
          req.session.kontak = Data[0].kontak;
          req.session.email = Data[0].email;
          req.session.foto = "default.jpg";

          req.flash("success", "Berhasil login sebagai admin");
          return res.redirect("/superusers");
        } else {
          req.flash("failure", "Role bukan admin");
          return res.redirect("/loginAdmin");
        }
      } else {
        req.flash("failure", "Email atau password salah");
        return res.redirect("/loginAdmin");
      }
    } else {
      req.flash("failure", "Akun tidak ditemukan");
      return res.redirect("/loginAdmin");
    }
  } catch (err) {
    console.error("Error saat login admin:", err);
    req.flash("failure", "Terjadi kesalahan saat login admin");
    return res.redirect("/loginAdmin");
  }
});


// ROUTE UNTUK LOGOUT
router.get("/logout/landingpage", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

// ROUTE UNTUK LOGOUT
router.get("/logoutadmin", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/loginAdmin");
  });
});
module.exports = router;
