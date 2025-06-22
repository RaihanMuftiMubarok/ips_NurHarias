const express = require("express");
const router = express.Router();
const Model_Anggota = require('../model/Model_Anggota.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');
const ejs = require('ejs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/anggota')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

router.get('/', async (req, res, next) => {
    try {
        // let id = req.session.userId;
        // let Data = await Model_Users.getId(id);
        let rows = await Model_Anggota.getAll();
        res.render('anggota/index', {
            data: rows,
            // data2: Data,
        });
    } catch (error) {
        next(error);
    }
});





router.get('/create', async function (req, res, next) {
    try {
        // let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Anggota.getAll();
        // if(Data[0].level_users == "2") {
        res.render('anggota/create', {
            nama: '',
            data: Data,
        })
        // }
        // else if (Data[0].level_users == "1"){
        //     req.flash('failure', 'Anda bukan admin');
        //     res.redirect('/sevice')
        // }
    } catch (error) {
        console.log(error);
    }
})

router.post('/store', upload.single("foto"), async function (req, res, next) {
    try {
        let { id_users: userId,
            no_pendaftaran,
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            peminatan,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            tanggal_masuk } = req.body;
        let Data = {
            id_users: userId,
            no_pendaftaran,
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            peminatan,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            tanggal_masuk,
            foto: req.file.filename
        }
        await Model_Anggota.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/anggota');

    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/anggota')
    }

})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Anggota.getId(id);
        let rows2 = await Model_Anggota.getAll();
        if (rows.length > 0) {
            res.render("anggota/edit", {
                id: id,
                data: rows[0],
                data2: rows2,
            });
        } else {
            req.flash("error", "anggota not found");
            res.redirect("/anggota");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/update/:id", upload.single("foto"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Anggota.getId(id);
        const namaFileLama = rows[0].foto;

        if (filebaru && namaFileLama && fs.existsSync(path.join(__dirname, '../public/images/anggota', namaFileLama))) {
            fs.unlinkSync(path.join(__dirname, '../public/images/anggota', namaFileLama));
        }
        const moment = require("moment"); // atas file routes

        let {
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            peminatan,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            tanggal_masuk
        } = req.body;
        tanggal_masuk = moment(tanggal_masuk, "DD-MM-YYYY HH:mm").format("YYYY-MM-DD HH:mm:ss");
        let foto = filebaru || namaFileLama

        let Data = {
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            peminatan,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            tanggal_masuk,
            foto
        }
        console.log(req.body);
        console.log(Data);
        await Model_Anggota.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data anggota");
        res.redirect("/anggota");
    } catch (error) {
        console.log(error);
        req.flash("error", "Gagal mengupdate data");
        res.redirect("/anggota");
    }
});

// GET - Edit data anggota untuk user yang login
router.get("/editusers", async (req, res, next) => {
    try {
        // Pengecekan session
        if (!req.session.userId) {  // Ubah pengecekan, tidak perlu cek role
            return res.redirect('/login');
        }

        // Dapatkan data anggota berdasarkan id_users dari session
        const id_users = req.session.userId;
        const anggotaRows = await Model_Anggota.getByUserId(id_users);
        
        if (!anggotaRows || anggotaRows.length === 0) {
            req.flash("error", "Data anggota tidak ditemukan");
            return res.redirect('/');
        }

        const anggota = anggotaRows[0];
        
        res.render("anggota/users/editusers", {  // Sesuaikan path view
            id: anggota.id_anggota,
            data: anggota,
            user: {
                nama: req.session.nama,
                foto: req.session.foto,
                role: req.session.role
            }
        });
    } catch (error) {
        console.error("Error in editusers route:", error);
        req.flash("error", "Terjadi kesalahan saat memuat form edit");
        res.redirect('/');
    }
});

router.post("/updateusers", upload.single("foto"), async (req, res, next) => {
    try {
      const id_users = req.session.userId;
  
      // Ambil data anggota dulu
      const anggotaRows = await Model_Anggota.getByUserId(id_users);
      if (!anggotaRows.length) throw new Error("Data anggota tidak ditemukan");
      const anggota = anggotaRows[0];
  
      // Handle foto dan set DataAnggota
      const filebaru = req.file ? req.file.filename : null;
      const namaFileLama = anggota.foto;
      if (filebaru && namaFileLama) {
        const oldPath = path.join(__dirname, '../public/images/anggota', namaFileLama);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const foto = filebaru || namaFileLama;
  
      // Ambil dan format tanggal masuk
      const moment = require("moment");
      let { nama, jenis_kelamin, tempat_tanggal_lahir, alamat, peminatan, ayah, ibu, tingkatan, pendidikan_terakhir, email, kontak, tanggal_masuk } = req.body;
      tanggal_masuk = moment(tanggal_masuk, "DD-MM-YYYY HH:mm").format("YYYY-MM-DD HH:mm:ss");
  
      // Data untuk tabel anggota
      const DataAnggota = { nama, jenis_kelamin, tempat_tanggal_lahir, alamat, peminatan, ayah, ibu, tingkatan, pendidikan_terakhir, email, kontak, tanggal_masuk, foto };
      await Model_Anggota.Update(anggota.nia, DataAnggota);
  
      // Data untuk tabel users — hanya kolom yang sama
      const DataUser = { nama, email, kontak };
      await Model_Users.UpdateById(id_users, DataUser);
  
      // Update session jika diperlukan
      if (nama !== req.session.nama || foto !== req.session.foto) {
        req.session.nama = nama;
        req.session.foto = foto;
      }
  
      req.flash("success", "Berhasil mengupdate data anggota & user");
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash("error", "Gagal mengupdate data");
      res.redirect("/");
    }
  });
  

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Anggota.Delete(id);
        req.flash('success', 'Berhasil menghapus data anggota');
        res.redirect('/anggota');
    } catch (error) {
        req.flash("error", "Gagal menghapus data anggota");
        res.redirect("/anggota");
    }
});

router.get('/detail/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const Data = await Model_Anggota.getId(id);


        res.render('anggota/detail', {
            data: Data[0],
        });
    } catch (error) {
        next(error);
    }
});

// Detail kartu anggota
router.get('/detail/:nia/kartu', async (req, res) => {
    const nia = req.params.nia;

    try {
        const data = await Model_Anggota.getId(nia); // asumsi method getId menerima nia
        if (!data) {
            return res.status(404).send('Anggota tidak ditemukan');
        }
        const qrLink = `https://ipsnhtalango.kabupatensumenep.com/anggota/detail/${nia}`; // saat scan di komputer server

        //   const qrLink = `https://domainmu.com/anggota/detail/${nia}`; // ganti dengan domain asli
        const qrCodeDataUrl = await QRCode.toDataURL(qrLink);

        res.render('anggota/kartu', {
            data: data[0],
            qrCode: qrCodeDataUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan server');
    }
});

router.get('/detail/:nia/kartu/download-image', async (req, res) => {
    const nia = req.params.nia;
    const url = `https://ipsnhtalango.kabupatensumenep.com/anggota/detail/${nia}/kartu`; // sesuaikan dengan port & URL kamu

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'networkidle0'
        });

        // ✅ Cari elemen .card-wrapper (kartu anggota)
        const cardElement = await page.$('.card-wrapper');
        if (!cardElement) {
            throw new Error("Elemen kartu tidak ditemukan di halaman.");
        }

        // ✅ Screenshot hanya elemen kartu anggota
        const buffer = await cardElement.screenshot();

        await browser.close();

        const filename = `kartu-anggota-${nia}.png`;
        const filepath = path.join(__dirname, '../public/images/anggota', filename);

        fs.writeFileSync(filepath, buffer);

        // ✅ Download dan hapus file sementara
        res.download(filepath, filename, () => {
            fs.unlinkSync(filepath); // hapus setelah diunduh
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal membuat gambar kartu.');
    }
});



module.exports = router;