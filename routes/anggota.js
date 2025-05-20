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
        const qrLink = `http://192.168.204.209:3000/anggota/detail/${nia}`; // saat scan di komputer server

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
    const url = `http://192.168.204.209:3000/anggota/detail/${nia}/kartu`; // Sesuaikan port

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'networkidle0'
        });

        const buffer = await page.screenshot({ fullPage: true });

        await browser.close();

        const filename = `kartu-anggota-${nia}.png`;
        const filepath = path.join(__dirname, '../public/images/anggota', filename);

        fs.writeFileSync(filepath, buffer);

        res.download(filepath, filename, () => {
            // Hapus file setelah diunduh (opsional)
            fs.unlinkSync(filepath);
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Gagal membuat gambar kartu.');
    }
});



module.exports = router;