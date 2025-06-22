const express = require("express");
const router = express.Router();
const Model_Nilai = require("../model/Model_Nilai");
const Model_Anggota = require("../model/Model_Anggota");
const Model_JenisLatihan = require("../model/Model_JenisLatihan");

// GET - Tampilkan daftar anggota untuk input nilai
router.get('/', async function (req, res, next) {
  try {
    const tingkatan = req.query.tingkatan;
    let anggota;

    if (tingkatan && tingkatan !== '') {
      anggota = await Model_Anggota.getByTingkatan(tingkatan);
    } else {
      anggota = await Model_Anggota.getAll();
    }

    res.render('nilai/index', {
      anggota,
      tingkatan,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      },
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memuat data anggota');
    res.redirect('/');
  }
});

// GET - Nilai untuk user yang login (anggota)
router.get('/users', async (req, res) => {
  // Pengecekan session dan role
  if (!req.session.userId || req.session.role !== 'anggota') {
    return res.redirect('/login');
  }

  try {
    // 1. Dapatkan data anggota berdasarkan id_users dari session
    const id_users = req.session.userId;
    const anggotaRows = await Model_Anggota.getByUserId(id_users);
    const anggota = anggotaRows[0];

    if (!anggota) {
      req.flash('error', 'Data anggota tidak ditemukan.');
      return res.redirect('/');
    }

    const nia = anggota.nia;

    // 2. Ambil bulan dan tahun dari query, default ke bulan & tahun sekarang
    const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || new Date().getFullYear();

    // 3. Dapatkan data nilai bulanan
    const nilai = await Model_Nilai.getNilaiBulananByNIA(nia, bulan, tahun);

    // 4. Render view khusus untuk user
    res.render('nilai/users/index', {
      layout: 'layouts/main-layout',
      title: 'Nilai Saya',
      nilai,
      namaAnggota: anggota.nama,
      nia,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      },
      bulan,
      tahun
    });

  } catch (error) {
    console.error('❌ Error saat memuat data nilai:', error);
    req.flash('error', 'Gagal memuat data nilai.');
    res.redirect('/dashboard');
  }
});

// GET - Halaman input nilai
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

    res.render('nilai/create', {
      anggota,
      jenisLatihan,
      tingkatan,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memuat form input nilai');
    res.redirect('/nilai');
  }
});

// POST - Simpan nilai
router.post('/store', async function (req, res, next) {
  try {
    const { tanggal, id_jenis_latihan, nia, nilai_angka } = req.body;

    if (!tanggal || !id_jenis_latihan || !nia || !nilai_angka) {
      req.flash('error', 'Data tidak lengkap');
      return res.redirect('/nilai/create');
    }

    const idAnggotaArray = Array.isArray(nia) ? nia : [nia];
    const nilaiArray = Object.keys(nilai_angka).map(key => nilai_angka[key]);

    for (let i = 0; i < idAnggotaArray.length; i++) {
      const dataInsert = {
        nia: idAnggotaArray[i],
        tanggal,
        id_jenis_latihan,
        nilai_angka: nilaiArray[i]
      };

      await Model_Nilai.Store(dataInsert);
    }

    req.flash('success', 'Berhasil menyimpan nilai!');
    res.redirect('/nilai/create');
  } catch (error) {
    console.error("❌ Gagal menyimpan nilai:", error);
    req.flash('error', 'Terjadi kesalahan saat menyimpan nilai');
    res.redirect('/nilai/create');
  }
});

// GET - Detail nilai per anggota
router.get('/detail/:nia', async (req, res) => {
  const { nia } = req.params;
  const bulan = parseInt(req.query.bulan) || new Date().getMonth() + 1;
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear();

  try {
    const anggota = await Model_Anggota.getByNIA(nia);
    const nilai = await Model_Nilai.getNilaiBulananByNIA(nia, bulan, tahun);

    res.render('nilai/detail', {
      nia,
      namaAnggota: anggota.nama, // asumsi field nama
      bulan,
      tahun,
      nilai,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan.");
  }
});


// GET - Rekap nilai semua anggota
router.get('/rekap', async (req, res) => {
  const bulan = req.query.bulan || 'all';
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear();
  const tingkatan = req.query.tingkatan || 'all';
  const idLatihan = req.query.id_latihan || 'all';
  const tahunAjaran = `${tahun}/${tahun + 1}`;

  try {
    const latihanList = await Model_JenisLatihan.getAll();
    const tingkatanList = await Model_Anggota.getTingkatanList();

    // Kalau jenis latihan belum dipilih, langsung render view tanpa data
    if (idLatihan === 'all') {
      return res.render('nilai/rekap', {
        nilai: [],
        bulan,
        tahun,
        tahunAjaran,
        tingkatan,
        idLatihan,
        nama_latihan: 'Belum dipilih',
        latihanList,
        tingkatanList,
        user: {
          nama: req.session.nama,
          foto: req.session.foto,
          role: req.session.role
        }
      });
    }

    // Lanjutkan kalau sudah pilih latihan
    const nilai = await Model_Nilai.getRekapByFilters({ bulan, tahun, tingkatan, idLatihan });
    let nama_latihan = 'Latihan';

    const latihan = await Model_JenisLatihan.getId(parseInt(idLatihan));
    if (latihan && latihan.length > 0) {
      nama_latihan = latihan[0].nama_latihan;
    }

    res.render('nilai/rekap', {
      nilai,
      bulan,
      tahun,
      tahunAjaran,
      tingkatan,
      idLatihan,
      nama_latihan,
      latihanList,
      tingkatanList,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (err) {
    console.error('Gagal load rekap nilai:', err);
    res.redirect('/nilai');
  }
});

module.exports = router;
