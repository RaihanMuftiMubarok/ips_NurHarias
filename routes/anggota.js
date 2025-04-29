const express = require("express");
const router = express.Router();
const Model_Anggota = require('../model/Model_Anggota.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

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

module.exports = router;