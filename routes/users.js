var express = require("express");
const Model_Users = require("../model/Model_Users");
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let id = req.session.userId;
    let Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      //Kondisi pengecekan
      if(Data[0].level_users != "anggota"){
        res.redirect('/logout')
      }else{
      res.render("users/index", {
        title: "Users Home",
        email: Data[0].email,
        nama: Data[0].nama,
        role: req.session.role,
        user: {
          nama: req.session.nama,
          foto: req.session.foto,
          role: req.session.role,
          
        },
      });
    }
    //Akhir Kondisi

    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    res.status(501).json("Butuh akses login");
  }
});


module.exports = router;
