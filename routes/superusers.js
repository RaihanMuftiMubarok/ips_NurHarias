var express = require("express");
const Model_Users = require("../model/Model_Users");
var router = express.Router();

/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let id = req.session.userId;
    console.log(id);
    let Data = await Model_Users.getId(id);
    console.log("Data: ",Data);
    if (Data.length > 0) {
      //Kondisi pengecekan
      if(Data[0].role != "admin"){
        res.redirect('/logout')
      }else{
      res.render("users/superusers", {
        title: "Users Home",
        email: Data[0].email,
        nama: Data[0].nama,
        data2: Data,
        role: req.session.role
      });
    }
    //Akhir Kondisi

    } else {
      res.status(401).json({ error: "user tidak ada" });
    }
  } catch (error) {
    res.status(501).json("Butuh akses login");
    console.log(error)
  }
});


module.exports = router;
