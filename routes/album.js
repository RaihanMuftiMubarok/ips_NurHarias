const express = require("express");
const router = express.Router();
const Model_Album = require('../model/Model_Album.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/album')
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
        let Data = await Model_Users.getId(id);
        let rows = await Model_Album.getAll();
        res.render('album/index', {
            data: rows,
            data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/users', async function (req, res, next) {
    try {
        let rows = await Model_Album.getAll();
        res.render('album/users/index', {
            data: rows,
            user: {
                nama: req.session.nama,
                foto: req.session.foto,
                role: req.session.role,
              },
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
    }
});


router.get('/create', async function (req, res, next) {
    try {
        let level_users = req.session.level;
        let id = req.session.userId;
        let Data = await Model_Album.getAll();
        // if(Data[0].level_users == "2") {
        res.render('album/create', {
            nama_service: '',
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

router.post('/store', upload.single("gambar_album"), async function (req, res, next) {
    try {
        let {nama_album,jenis_album ,deskripsi_album} = req.body;
        let Data = {
            nama_album,
            jenis_album,
            deskripsi_album,
            gambar_album: req.file.filename
        }
        await Model_Album.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/album');
        
    } catch (error) {
        req.flash('error', 'Terjadi kesalahan pada fungsi')
        console.log(error);
        res.redirect('/album')
    }
    
})


router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Album.getId(id);
        let rows2 = await Model_Album.getAll();
        if (rows.length > 0) {
            res.render("album/edit", {
                id: id,
                data: rows[0],
                data_album: rows2,
            });
        } else {
            req.flash("error", "album not found");
            res.redirect("/album");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("gambar_album"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Album.getId(id);
        const namaFileLama = rows[0].gambar_album;

        if (filebaru && namaFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images/album', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let {
            nama_album,
            jenis_album,
            deskripsi_album,
        } = req.body;
        
        let gambar_album = filebaru || namaFileLama

        let Data = {
            nama_album: nama_album,
            jenis_album: jenis_album,
            deskripsi_album: deskripsi_album,
            gambar_album
        }
        console.log(req.body);
        console.log(Data);
        await Model_Album.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data album");
        res.redirect("/album");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Album.Delete(id);
        req.flash('success', 'Berhasil menghapus data album');
        res.redirect('/album');
    } catch (error) {
        req.flash("error", "Gagal menghapus data album");
        res.redirect("/album");
    }
});


module.exports = router;