const express = require("express");
const router = express.Router();
const Model_Absensi = require("../model/Model_Absensi");
const Model_Anggota = require("../model/Model_Anggota");
const Model_JenisLatihan = require("../model/Model_JenisLatihan");

// GET - Tampilkan daftar absensi
// GET - Tampilkan daftar anggota (halaman index absensi)
router.get('/', async function (req, res, next) {
  try {
    const tingkatan = req.query.tingkatan;

    let anggota;
    if (tingkatan && tingkatan !== '') {
      anggota = await Model_Anggota.getByTingkatan(tingkatan);
    } else {
      anggota = await Model_Anggota.getAll();
    }

    res.render('absensi/index', {
      anggota,
      tingkatan,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role},
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memuat data anggota');
    res.redirect('/');
  }
});



router.get('/users', async (req, res) => {
  console.log('Session role:', req.session.role); // Debug

  // Validasi: hanya user dengan role "anggota" yang bisa masuk
  if (!req.session.userId || req.session.role !== 'anggota') {
    console.log('❌ Akses ditolak. Redirect ke login.');
    return res.redirect('/login');
  }

  try {
    const id_users = req.session.userId;

    // Dapatkan NIA dari tabel anggota berdasarkan id_users
    const anggotaRows = await Model_Anggota.getByUserId(id_users);
    const anggota = anggotaRows[0];

    if (!anggota) {
      console.log('❌ Data anggota tidak ditemukan.');
      req.flash('error', 'Data anggota tidak ditemukan.');
      return res.redirect('/');
    }

    const nia = anggota.nia;

    // Ambil rekap absensi berdasarkan NIA
    const absensi = await Model_Absensi.getByNIA(nia);

    res.render('absensi/users/index', {
      layout: 'layouts/main-layout',
      title: 'Rekap Absensi Saya',
      absensi,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (error) {
    console.error('❌ Error saat memuat rekap absensi:', error);
    res.status(500).send('Terjadi kesalahan saat memuat rekap absensi.');
  }
});




// GET - Tampilkan form input absensi
router.get('/create', async function (req, res, next) {
  try {
    const tingkatan = req.query.tingkatan;
    let anggota;

    if (tingkatan && tingkatan !== '') {
      anggota = await Model_Anggota.getByTingkatan(tingkatan);
    } else {
      anggota = await Model_Anggota.getAll();
    }

    const jenisLatihan = await Model_JenisLatihan.getAll();

    res.render('absensi/create', {
      anggota,
      jenisLatihan,
      tingkatan // kirim ke view kalau mau ditampilkan juga
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memuat data absensi');
    res.redirect('/absensi');
  }
});


// POST - Simpan data absensi
router.post('/store', async function (req, res, next) {
  try {
    const { tanggal, id_jenis_latihan, nia, status } = req.body;

    console.log("📅 tanggal:", tanggal);
    console.log("🏋️‍♂️ id_jenis_latihan:", id_jenis_latihan);
    console.log("👥 nia:", nia);
    console.log("📊 status:", status);

    if (!tanggal || !id_jenis_latihan || !nia || !status) {
      console.log("⚠️ Ada data kosong!");
      req.flash('error', 'Data tidak lengkap');
      return res.redirect('/absensi/create');
    }

    const idAnggotaArray = Array.isArray(nia) ? nia : [nia];
    const statusArray = Array.isArray(status) ? status : [status];

    for (let i = 0; i < idAnggotaArray.length; i++) {
      const dataInsert = {
        nia: idAnggotaArray[i],
        tanggal,
        id_jenis_latihan,
        status: statusArray[i]
      };

      console.log("📝 Data yang akan disimpan:", dataInsert);

      await Model_Absensi.Store(dataInsert);
    }

    req.flash('success', 'Berhasil menyimpan data absensi!');
    res.redirect('/absensi/create');
  } catch (error) {
    console.error("❌ Gagal menyimpan absensi:", error);
    req.flash('error', 'Terjadi kesalahan saat menyimpan absensi');
    res.redirect('/absensi/create');
  }
});

router.get('/detail/:nia', async (req, res) => {
  const nia = req.params.nia;
  const bulan = new Date().getMonth() + 1;
  const tahun = new Date().getFullYear();
  const tahunAjaran = `${tahun}/${tahun + 1}`;

  try {
    const anggota = await Model_Anggota.getByNIA(nia);
    const absensi = await Model_Absensi.getByNIAAndBulan(nia, bulan, tahun);

    if (!anggota) {
      return res.render('absensi/detail', {
        namaAnggota: 'Tidak ditemukan',
        nia,
        absensi: [],
        bulan,
        tahun,
        tahunAjaran
      });
    }

    res.render('absensi/detail', {
      namaAnggota: anggota.nama,
      nia,
      absensi,
      bulan,
      tahun,
      tahunAjaran
    });
  } catch (err) {
    console.error('Error saat menampilkan detail:', err);
    res.redirect('/absensi');
  }
});





module.exports = router;
