var express = require("express");
const Model_Users = require("../model/Model_Users");
const Dashboard = require("../model/Dashboard"); // ← Tambahkan import model dashboard
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);

    if (Data.length > 0) {
      // Validasi role
      if (Data[0].role !== "admin") {
        return res.redirect('/logout');
      }

      // Ambil data dashboard
      const jumlahTingkatan = await Dashboard.getJumlahPerTingkatan();

      // jumlahTingkatan = [ { tingkatan: 'hitam', jumlah: 5 }, ... ]
      // const jumlahArray = jumlahTingkatan.map(item => item.jumlah); 
      const jumlahAnggota = await Dashboard.getJumlahAnggota();
      const jumlahPelatih = await Dashboard.getJumlahPelatih();

      console.log("tingkatanData (dari DB):", jumlahTingkatan);

      res.render("users/superusers", {
        title: "Users Home",
        email: Data[0].email,
        nama: Data[0].nama,
        data2: Data,
        role: req.session.role,
        tingkatanData: jumlahTingkatan, // hanya array angka!
        jumlahAnggota,
        jumlahPelatih
      });

    } else {
      res.status(401).json({ error: "user tidak ada" });
    }

  } catch (error) {
    console.log(error);
    res.redirect("/login");
  }
});

module.exports = router;
