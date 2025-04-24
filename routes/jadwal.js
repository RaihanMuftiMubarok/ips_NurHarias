var express = require('express');
var router = express.Router();

var Model_Jadwal = require('../model/Model_Jadwal.js')
var Model_Users = require('../model/Model_Users.js');
const Model_JenisLatihan = require('../model/Model_JenisLatihan.js');


router.get('/', async function (req, res, next) {
    let id = req.session.userId;
    // let Data = await Model_Users.getId(id);
    let rows = await Model_Jadwal.getAll();
    res.render('jadwal/index', {
        data: rows,
        // data2: Data,
    })
});

router.get('/create', async function (req, res, next) {
    let rows = await Model_Jadwal.getAll()
    res.render('jadwal/create', {
        jadwal: '',
        data: rows
    });
});

router.post('/store', async function (req, res, next) {
    try {
        let { id_jenis_latihan, minggu, hari, jam_mulai, jam_selesai } = req.body;

        let Data = {
            id_jenis_latihan,
            minggu,
            hari,
            jam_mulai,
            jam_selesai,
        }
        await Model_Jadwal.Store(Data);
        req.flash('success', 'Berhasil Menyimpan Data!');
        res.redirect("/jadwal");
    } catch (error) {
        console.log(error);
        req.flash('error', "Terjadi kesalahan pada Menyimpan Data!");
        res.redirect("/jadwal");
    }
});

router.get('/edit/(:id)', async function (req, res, next) {
    let id = req.params.id;
    let rows = await Model_Jadwal.getId(id);
    let rows2 = await Model_JenisLatihan.getAll()
    res.render('jadwal/edit', {
        id: rows[0].id_jadwal,
        id_jenis_latihan: rows[0].id_jenis_latihan,
        nama_latihan: rows[0].nama_latihan,
        minggu: rows[0].minggu,
        hari: rows[0].hari,
        jam_mulai: rows[0].jam_mulai,
        jam_selesai: rows[0].jam_selesai,
        data: rows,
        rows2: rows2
    })
});


router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        let { id_jenis_latihan, minggu, hari, jam_mulai, jam_selesai} = req.body;

        let Data = {
            id_jenis_latihan,
            minggu,
            hari,
            jam_mulai,
            jam_selesai,
        }
        await Model_Jadwal.Update(id, Data);
        req.flash('Success', 'Berhasil Menyimpan Data Baru')
        res.redirect('/jadwal')
    } catch (error) {
        console.log(error);
    }
});


router.get('/delete/(:id)', async function (req, res) {
    let id = req.params.id;
    await Model_Jadwal.Delete(id);
    req.flash('success', 'Berhasil Menghapus data!');
    res.redirect('/jadwal');
})

router.get('/users', async function (req, res, next) {
    try {
        let rows = await Model_Jadwal.getAll(); // Ambil data dari database
        res.render('jadwal/users/index', {
            data: rows, // Kirim data ke view
            user: {
                nama: req.session.nama,
                foto: req.session.foto,
                role: req.session.role,
              },
        });
    } catch (error) {
        console.error("Error:", error);
        req.flash('invalid', 'Terjadi kesalahan saat memuat data pengguna');
        res.redirect('/login');
    }
});


module.exports = router;