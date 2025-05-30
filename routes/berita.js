const express = require("express");
const router = express.Router();
const Model_Berita = require('../model/Model_Berita.js');
// const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/berita')
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
        let id = req.session.userId;
        // let Data = await Model_Users.getId(id);
        let rows = await Model_Berita.getAll();
        res.render('berita/index', {
            data: rows,
            // data2: Data,
            
        });
    } catch (error) {
        next(error);
    }
});

router.get('/users', async function (req, res, next) {
    try {
      let rows = await Model_Berita.getAll();
      let recentPosts = await Model_Berita.getLimited(3); // Ambil 3 berita terbaru, selain yang sedang ditampilkan penuh (opsional)
  
      res.render('berita/users/index', {
        data: rows,
        recentPosts: recentPosts,
        user: {
          nama: req.session.nama,
          foto: req.session.foto,
          role: req.session.role,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      req.flash('invalid', 'Terjadi kesalahan saat memuat data berita');
      res.redirect('/berita');
    }
  });
  



router.get('/create', async function (req, res, next) {
    try {
        // let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Berita.getAll();
        // if(Data[0].level_users == "2") {
        res.render('berita/create', {
            judul: '',
            id_penulis: '',
            deskripsi: '',
            tanggal_posting: '',
            gambar: '',

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

router.post('/store', upload.single("gambar"), async function (req, res, next) {
    try {
        let { judul, deskripsi } = req.body;
        let id_penulis = req.session.userId; // Ambil dari session login
        let tanggal_posting = new Date(); // Tanggal saat ini

        let Data = {
            judul,
            id_penulis,
            tanggal_posting,
            deskripsi,
            gambar: req.file.filename
        }

        await Model_Berita.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/berita');
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi');
        console.log(error);
        res.redirect('/berita');
    }
});



router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Berita.getId(id);
        let rows2 = await Model_Berita.getAll();
        if (rows.length > 0) {
            res.render("berita/edit", {
                id: id,
                data: rows[0],
                data_berita: rows2,
            });
        } else {
            req.flash("error", "berita not found");
            res.redirect("/berita");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("gambar"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Berita.getId(id);
        const namaFileLama = rows[0].gambar;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/berita', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let {
            judul,
            id_penulis,
            tanggal_posting,
            deskripsi,
        } = req.body;
        
        let gambar = filebaru || namaFileLama

        let Data = {
            judul,
            id_penulis,
            tanggal_posting,
            deskripsi,
            gambar

        }
        console.log(req.body);
        console.log(Data);
        await Model_Berita.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data berita");
        res.redirect("/berita");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Berita.Delete(id);
        req.flash('success', 'Berhasil menghapus data berita');
        res.redirect('/berita');
    } catch (error) {
        req.flash("error", "Gagal menghapus data berita");
        res.redirect("/berita");
    }
});

router.get('/detail/:id_berita', async (req, res) => {
    try {
      const id = req.params.id_berita;
      const berita = await Model_Berita.getById(id);
  
      if (!berita) {
        req.flash('invalid', 'Berita tidak ditemukan');
        return res.redirect('/users');
      }
  
      const recentPosts = await Model_Berita.getLimited(3); // atau berapa pun jumlah recent post yang diinginkan
  
      res.render('berita/users/detail', {
        berita,
        recentPosts,
        user: {
            nama: req.session.nama,
            foto: req.session.foto,
            role: req.session.role,
          },
      });
  
    } catch (err) {
      console.error(err);
      req.flash('invalid', 'Terjadi kesalahan saat memuat berita');
      res.redirect('/users');
    }
  });
  
  

module.exports = router;