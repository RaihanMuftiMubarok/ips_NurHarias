const express = require("express");
const router = express.Router();
const Model_JenisLatihan = require('../model/Model_JenisLatihan.js');
// const Model_Users = require('../model/Model_Users.js');




router.get('/', async (req, res, next) => {
    try {
        let id = req.session.userId;
        // let Data = await Model_Users.getId(id);
        let rows = await Model_JenisLatihan.getAll();
        res.render('jenis_latihan/index', {
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
        let Data = await Model_JenisLatihan.getAll();
        // if(Data[0].level_users == "2") {
        res.render('jenis_latihan/create', {
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

router.post('/store', async function (req, res, next) {
    try {
        let { nama_latihan } = req.body;
        
        let Data = {
            nama_latihan, 
        }
        await Model_JenisLatihan.Store(Data);
        req.flash('success', 'Berhasil Menyimpan Data!');
        res.redirect("/jenis_latihan");
    } catch(error) {
        console.log(error);
        req.flash('error', "Terjadi kesalahan pada Menyimpan Data!");
        res.redirect("/jenis_latihan");
    }
});



router.get("/edit/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        let rows = await Model_JenisLatihan.getId(id);
        let rows2 = await Model_JenisLatihan.getAll();
        if (rows.length > 0) {
            res.render("jenis_latihan/edit", {
                id: id,
                data: rows[0],
                data_jenis_latihan: rows2,
            });
        } else {
            req.flash("error", "jenis_latihan not found");
            res.redirect("/jenis_latihan");
        }
    } catch (error) {
        next(error);
    }
});

router.post("/update/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        let {
            nama_latihan
        } = req.body;

        let Data = {
            nama_latihan
        }
        console.log(req.body);
        console.log(Data);
        await Model_JenisLatihan.Update(id, Data);
        req.flash("success", "Berhasil mengupdate data dokter");
        res.redirect("/jenis_latihan");
    } catch (error) {
        console.log(error);
    }
});

router.get('/delete/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        await Model_JenisLatihan.Delete(id);
        req.flash('success', 'Berhasil menghapus data jenis_latihan');
        res.redirect('/jenis_latihan');
    } catch (error) {
        req.flash("error", "Gagal menghapus data jenis_latihan");
        res.redirect("/jenis_latihan");
    }
});

module.exports = router;