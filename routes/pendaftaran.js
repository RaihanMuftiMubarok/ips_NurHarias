const express = require("express");
const router = express.Router();
const Model_Pendaftaran = require('../model/Model_Pendaftaran.js');
const Model_Anggota = require('../model/Model_Anggota.js');
const Model_Users = require('../model/Model_Users.js');
var connection = require("../config/database.js");
const bcrypt = require("bcrypt");
const { generateRandomPassword } = require("../helpers/passwordHelper");
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const sanitizeInput = require('../helpers/sanitizeInput');
const validator = require('validator'); // tetap dibutuhkan untuk email


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/pendaftaran')
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
        let rows = await Model_Pendaftaran.getAll();
        res.render('pendaftaran/index', {
            data: rows,
            // data2: Data,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/users', async function (req, res, next) {
    try {
        let Data = await Model_Pendaftaran.getAll();
        res.render('pendaftaran/users/index', {
            data: Data,
            user: {
                nama: req.session.nama,
                foto: req.session.foto,
                role: req.session.role,
              },
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pendaftaran');
        res.redirect('/pendaftaran');
    }
});



// router.get('/create', async function (req, res, next) {
//     try {
//         // let level_users = req.session.level;
//         // let id = req.session.userId;
//         let Data = await Model_Pendaftaran.getAll();
//         // if(Data[0].level_users == "2") {
//         res.render('pendaftaran/create', {
//             data: Data,
//         })
//         // }
//         // else if (Data[0].level_users == "1"){
//         //     req.flash('failure', 'Anda bukan admin');
//         //     res.redirect('/sevice')
//         // }
//     } catch (error) {
//         console.log(error);
//     }
// })

const axios = require('axios');

router.post('/store', upload.single("foto"), async function (req, res, next) {
    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = '6LcAgRQrAAAAAKBprMIX6n6qG6WSRG_sF9gMR5ET'; // Ganti dengan secret key dari Google

    // Cek apakah CAPTCHA diisi
    if (!recaptchaToken) {
        req.flash('error', 'Captcha harus diisi.');
        return res.redirect('/pendaftaran/users');
    }

    try {
        // Verifikasi CAPTCHA ke server Google
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: secretKey,
                response: recaptchaToken
            }
        });

        // Jika CAPTCHA gagal diverifikasi
        if (!response.data.success) {
            req.flash('error', 'Captcha tidak valid.');
            return res.redirect('/pendaftaran/users');
        }

        // Jika CAPTCHA valid, simpan data
        let { nama, jenis_kelamin, tempat_tanggal_lahir, alamat, peminatan, ayah, ibu, pendidikan_terakhir, email, kontak, riwayat_perguruan_silat } = req.body;

        // Sanitasi input (selain email dan file)
        let sanitizedInput = sanitizeInput({
            nama,
            jenis_kelamin,
            tempat_tanggal_lahir,
            alamat,
            peminatan,
            ayah,
            ibu,
            pendidikan_terakhir,
            riwayat_perguruan_silat,
            kontak
        });
        
        // Cek apakah email sudah digunakan
        const existing = await Model_Pendaftaran.getByEmail(email);
        if (existing) {
            req.flash('error', 'Email sudah digunakan untuk pendaftaran sebelumnya.');
            return res.redirect('/pendaftaran/users');
        }

        

        // Normalisasi email
        email = validator.normalizeEmail(email);
        // Gabungkan semua untuk dikirim ke database
        let Data = {
            ...sanitizedInput,
            email,
            foto: req.file.filename
        };


        await Model_Pendaftaran.Store(Data);
        req.flash('success', 'Berhasil menyimpan data');
        res.redirect('/pendaftaran/users');

    } catch (error) {
        console.log(error);
        req.flash('error', 'Terjadi kesalahan saat menyimpan data.');
        res.redirect('/pendaftaran/users');
    }
});



// router.get("/edit/:id", async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         let rows = await Model_Pendaftaran.getId(id);
//         let rows2 = await Model_Pendaftaran.getAll();
//         if (rows.length > 0) {
//             res.render("pendaftaran/edit", {
//                 id: id,
//                 data: rows[0],
//                 data_pendaftaran: rows2,
//             });
//         } else {
//             req.flash("error", "pendaftaran not found");
//             res.redirect("/pendaftaran");
//         }
//     } catch (error) {
//         next(error);
//     }
// });


// router.post("/update/:id", upload.single("gambar_pendaftaran"), async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         let filebaru = req.file ? req.file.filename : null;
//         let rows = await Model_Pendaftaran.getId(id);
//         const namaFileLama = rows[0].gambar_pendaftaran;

//         if (filebaru && namaFileLama) {
//             const pathFileLama = path.join(__dirname, '../public/images/pendaftaran', namaFileLama);
//             fs.unlinkSync(pathFileLama);
//         }

//         let {
//             nama,
//             jenis,
//         } = req.body;

//         let gambar_pendaftaran = filebaru || namaFileLama

//         let Data = {
//             nama: nama,
//             jenis: jenis,
//             gambar_pendaftaran
//         }
//         console.log(req.body);
//         console.log(Data);
//         await Model_Pendaftaran.Update(id, Data);
//         req.flash("success", "Berhasil mengupdate data pendaftaran");
//         res.redirect("/pendaftaran");
//     } catch (error) {
//         console.log(error);
//     }
// });

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_Pendaftaran.Delete(id);
        req.flash('success', 'Berhasil menghapus data pendaftaran');
        res.redirect('/pendaftaran');
    } catch (error) {
        req.flash("error", "Gagal menghapus data pendaftaran");
        res.redirect("/pendaftaran");
    }
});

router.get('/detail/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const Data = await Model_Pendaftaran.getId(id);


        res.render('pendaftaran/detail', {
            data: Data[0],
        });
    } catch (error) {
        next(error);
    }
});

// Route untuk mengubah status pendaftaran

const qs = require('qs');
const formatNomor = nomor => nomor.replace(/^0/, '62');
const fontekApiKey = 'YoBt6b6x6KE9k4WsTPfw'; // Ganti dengan API key Fonte

router.post("/update-status/:no_pendaftaran", async (req, res) => {
    try {
        const { status, alasan } = req.body;
        const { no_pendaftaran } = req.params;

        const pendaftaran = await Model_Pendaftaran.getByNoPendaftaran(no_pendaftaran);

        if (!pendaftaran) {
            return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
        }

        // === STATUS: TERIMA ===
        if (status === "terima") {
            const passwordAcak = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(passwordAcak, 10);

            const newUser = {
                nama: pendaftaran.nama,
                kontak: pendaftaran.kontak,
                email: pendaftaran.email,
                password: hashedPassword,
                role: "anggota",
            };

            const userId = await Model_Users.createUser(newUser);

            const anggotaBaru = {
                id_users: userId,
                no_pendaftaran: pendaftaran.no_pendaftaran,
                nama: pendaftaran.nama,
                jenis_kelamin: pendaftaran.jenis_kelamin,
                tempat_tanggal_lahir: pendaftaran.tempat_tanggal_lahir,
                alamat: pendaftaran.alamat,
                peminatan: pendaftaran.peminatan,
                ayah: pendaftaran.ayah,
                ibu: pendaftaran.ibu,
                pendidikan_terakhir: pendaftaran.pendidikan_terakhir,
                email: pendaftaran.email,
                kontak: pendaftaran.kontak,
                foto: pendaftaran.foto,
            };

            await Model_Anggota.createAnggota(anggotaBaru);

            const sourcePath = path.join(__dirname, '../public/images/pendaftaran', pendaftaran.foto);
            const destDir = path.join(__dirname, '../public/images/anggota');
            const destPath = path.join(destDir, pendaftaran.foto);

            // Pastikan folder tujuan ada
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            // Salin file foto dari folder pendaftaran ke folder anggota
            fs.copyFileSync(sourcePath, destPath);

            // Kirim pesan WA konfirmasi penerimaan
            const nomorTujuan = formatNomor(pendaftaran.kontak);
            const pesan = `Selamat anda sudah bergabung di IPS Nur Harias.\n\nBerikut informasi akun anda sebagai Anggota\n\nAkun : ${pendaftaran.email}\nPassword : ${passwordAcak}`;

            const payload = qs.stringify({
                target: nomorTujuan,
                message: pesan,
                countryCode: '62'
            });

            try {
                await axios.post('https://api.fonnte.com/send', payload, {
                    headers: {
                        'Authorization': fontekApiKey,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log("✅ Pesan WhatsApp diterima terkirim");
            } catch (err) {
                console.error("❌ Gagal kirim WA penerimaan:", err.response?.data || err.message);
            }
        }

        // === STATUS: TOLAK ===
        if (status === "tolak") {
            const nomorTujuan = formatNomor(pendaftaran.kontak);
            const pesanPenolakan = `Mohon maaf anda tidak dapat bergabung pada IPSI Nur Harias.\nAlasan: ${alasan || "Tidak disebutkan"}`;

            const payload = qs.stringify({
                target: nomorTujuan,
                message: pesanPenolakan,
                countryCode: '62'
            });

            try {
                await axios.post('https://api.fonnte.com/send', payload, {
                    headers: {
                        'Authorization': fontekApiKey,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log("✅ Pesan WhatsApp penolakan terkirim");
            } catch (err) {
                console.error("❌ Gagal kirim WA penolakan:", err.response?.data || err.message);
            }
        }

        // Update status tetap dijalankan
        await Model_Pendaftaran.updateStatus(no_pendaftaran, status);

        // Redirect sesuai status
        res.redirect("/pendaftaran");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan", error });
    }
});






module.exports = router;