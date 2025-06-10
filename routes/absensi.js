const express = require("express");
const router = express.Router();
const Model_Absensi = require("../model/Model_Absensi");
const Model_Anggota = require("../model/Model_Anggota");
const Model_JenisLatihan = require("../model/Model_JenisLatihan");
const ExcelJS = require('exceljs');
const fetch = require('node-fetch');


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



router.get('/users', async (req, res) => {
  if (!req.session.userId || req.session.role !== 'anggota') {
    return res.redirect('/login');
  }

  try {
    const id_users = req.session.userId;
    const anggotaRows = await Model_Anggota.getByUserId(id_users);
    const anggota = anggotaRows[0];

    if (!anggota) {
      req.flash('error', 'Data anggota tidak ditemukan.');
      return res.redirect('/');
    }

    const nia = anggota.nia;

    // Ambil bulan dan tahun dari query, kalau tidak ada pakai bulan & tahun sekarang
    const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || new Date().getFullYear();

    const absensi = await Model_Absensi.getByNIAAndMonth(nia, bulan, tahun);

    res.render('absensi/users/index', {
      layout: 'layouts/main-layout',
      title: 'Rekap Absensi Saya',
      absensi,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      },
      bulan,
      tahun
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
      tingkatan,// kirim ke view kalau mau ditampilkan juga
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal memuat data absensi');
    res.redirect('/absensi');
  }
});


router.post('/store', async function (req, res, next) {
  try {
    const { tanggal, id_jenis_latihan, nia, status } = req.body;

    if (!tanggal || !id_jenis_latihan || !nia || !status) {
      req.flash('error', 'Data tidak lengkap');
      return res.redirect('/absensi/create');
    }

    const idAnggotaArray = Array.isArray(nia) ? nia : [nia];
    const statusArray = Object.keys(status).map(key => status[key]);

    for (let i = 0; i < idAnggotaArray.length; i++) {
      const niaAnggota = idAnggotaArray[i];
      const statusAnggota = statusArray[i];

      const dataInsert = {
        nia: niaAnggota,
        tanggal,
        id_jenis_latihan,
        status: statusAnggota
      };

      await Model_Absensi.Store(dataInsert);

      // ✅ Kirim WA jika status Alfa
      if (statusAnggota === 'A') {
        const kontak = await Model_Anggota.getKontakByNIA(niaAnggota);
        if (kontak && kontak.kontak) {
          let nomor = kontak.kontak;

          if (nomor.startsWith('08')) {
            nomor = '62' + nomor.slice(1); // ubah ke format internasional
          }

          const nama = kontak.nama;
          const tanggalFormatted = new Date(tanggal).toLocaleDateString('id-ID');
          const pesan = `Halo ${nama}, kami mendeteksi bahwa Anda TIDAK HADIR (Alfa) pada latihan tanggal ${tanggalFormatted}. Mohon konfirmasi ke pelatih.`;

          try {
            await fetch('https://api.fonnte.com/send', {
              method: 'POST',
              headers: {
                Authorization: 'YoBt6b6x6KE9k4WsTPfw',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                target: nomor,
                message: pesan
              })
            });

            console.log(`✅ WA terkirim ke ${nama} (${nomor})`);
          } catch (err) {
            console.error(`❌ Gagal kirim WA ke ${nama}:`, err);
          }
        }
      }
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
  const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1);
  const tahun = parseInt(req.query.tahun) || (new Date().getFullYear());
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
      tahunAjaran,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (err) {
    console.error('Error saat menampilkan detail:', err);
    res.redirect('/absensi');
  }
});

router.get('/rekap', async (req, res) => {
  const bulan = parseInt(req.query.bulan) || (new Date().getMonth() + 1);
  const tahun = parseInt(req.query.tahun) || new Date().getFullYear();
  const tingkatan = req.query.tingkatan || 'all';
  const idLatihan = req.query.id_latihan || 'all';
  const tahunAjaran = `${tahun}/${tahun + 1}`;
  console.log('FILTER PARAMS:', { bulan, tahun, tingkatan, idLatihan });

  try {
    const latihanList = await Model_JenisLatihan.getAll(); // ambil daftar latihan
    const tingkatanList = await Model_Anggota.getTingkatanList(); // ambil enum tingkatan

    const absensi = await Model_Absensi.getRekapByFilters({ bulan, tahun, tingkatan, idLatihan });

    let nama_latihan = 'Semua Latihan';

    if (idLatihan && idLatihan !== 'all') {
      const latihan = await Model_JenisLatihan.getId(parseInt(idLatihan));
      if (latihan && latihan.length > 0) {
        nama_latihan = latihan[0].nama_latihan;
      }
    }





    res.render('absensi/rekap', {
      absensi,
      bulan,
      tahun,
      tahunAjaran,
      tingkatan,
      idLatihan,
      nama_latihan, // <- tambahkan ke render
      latihanList,
      tingkatanList,
      user: {
        nama: req.session.nama,
        foto: req.session.foto,
        role: req.session.role
      }
    });
  } catch (err) {
    console.error('Gagal load rekap:', err);
    res.redirect('/absensi');
  }
});






module.exports = router;
