const express = require("express");
const router = express.Router();
const Model_Pelatih = require('../model/Model_Pelatih.js');
const Model_Users = require('../model/Model_Users.js');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { generateRandomPassword } = require('../helpers/passwordHelper'); // sesuaikan path kalau perlu

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/pelatih')
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
        let rows = await Model_Pelatih.getAll();
        res.render('pelatih/index', {
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
        let Data = await Model_Pelatih.getAll();
        // if(Data[0].level_users == "2") {
        res.render('pelatih/create', {
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




const qs = require('qs');
const formatNomor = nomor => nomor.replace(/^0/, '62');
const fontekApiKey = 'YoBt6b6x6KE9k4WsTPfw'; // Simpan di .env kalau bisa

router.post('/store', upload.single("foto"), async function (req, res, next) {
    try {
        let {
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak
        } = req.body;

        // 1. Generate password acak dan hash
        const randomPassword = generateRandomPassword(10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // 2. Insert user
        const userData = {
            nama,
            email,
            password: hashedPassword,
            role: 'pelatih',
            kontak
        };

        const id_users = await Model_Users.createUser(userData);

        // 3. Insert pelatih
        const DataPelatih = {
            id_users,
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            foto: req.file.filename
        };

        await Model_Pelatih.Store(DataPelatih);

        // 4. Format nomor WhatsApp
        const nomorTujuan = formatNomor(kontak);

        // 5. Kirim pesan WhatsApp via Fonnte
        const pesan = `Selamat Datang di Ikatan Pencak Silat Nur Harias Ranting Talango\n\nBerikut informasi akun anda sebagai Pelatih\n\nAkun : ${email}\nPassword : ${randomPassword}`;

        const payload = qs.stringify({
            target: nomorTujuan,
            message: pesan,
            delay: 3 // delay dalam detik (opsional)
        });
        
        

        try {
            await axios.post('https://api.fonnte.com/send', payload, {
                headers: {
                    'Authorization': fontekApiKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            console.log("✅ Pesan WhatsApp pelatih berhasil dikirim");
        } catch (err) {
            console.error("❌ Gagal kirim WA pelatih:", err.response?.data || err.message);
        }

        req.flash('success', 'Berhasil menyimpan data pelatih dan mengirim pesan WhatsApp.');
        res.redirect('/pelatih');

    } catch (error) {
        console.error('❌ Error umum:', error);
        req.flash('error', 'Terjadi kesalahan saat menyimpan data');
        res.redirect('/pelatih');
    }
});





router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_Pelatih.getId(id);
        let rows2 = await Model_Pelatih.getAll();
        if (rows.length > 0) {
            res.render("pelatih/edit", {
                id: id,
                data: rows[0],
                data2: rows2,
            });
        } else {
            req.flash("error", "pelatih not found");
            res.redirect("/pelatih");
        }
    } catch (error) {
        next(error);
    }
});


router.post("/update/:id",  upload.single("foto"), async (req, res, next) => {
    try {
        const id = req.params.id;
        let filebaru = req.file ? req.file.filename : null;
        let rows = await Model_Pelatih.getId(id);
        const namaFileLama = rows[0].foto;

        if (filebaru && namaFileLama && fs.existsSync(path.join(__dirname, '../public/images/pelatih', namaFileLama))) {
            fs.unlinkSync(path.join(__dirname, '../public/images/pelatih', namaFileLama));
        }


        let {
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,

        } = req.body;

        let foto = filebaru || namaFileLama

        let Data = {
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            ayah,
            ibu,
            tingkatan,
            pendidikan_terakhir,
            email,
            kontak,
            foto
        }
        console.log(req.body);
        console.log(Data);
        await Model_Pelatih.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data pelatih");
        res.redirect("/pelatih");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Pelatih.Delete(id);
        req.flash('success', 'Berhasil menghapus data pelatih');
        res.redirect('/pelatih');
    } catch (error) {
        req.flash("error", "Gagal menghapus data pelatih");
        res.redirect("/pelatih");
    }
});

router.get('/detail/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const Data = await Model_Pelatih.getId(id);


        res.render('pelatih/detail', {
            data: Data[0],
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;