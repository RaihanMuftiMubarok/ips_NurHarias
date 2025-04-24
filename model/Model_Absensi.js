const connection = require('../config/database');

class Model_Absensi {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT a.*, b.nama, c.nama_latihan FROM absensi AS a JOIN anggota AS b ON a.nia = b.nia JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan ORDER BY a.id_absensi ASC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async getByUserId(id_users) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, b.nama AS nama_anggota, c.nama_latihan, b.tingkatan
                FROM absensi AS a
                JOIN anggota AS b ON a.nia = b.nia
                JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan
                WHERE b.id_users = ?
                ORDER BY a.tanggal ASC
            `;
            connection.query(query, [id_users], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }



    static async Store(DataAbsensi) {
        return new Promise((resolve, reject) => {
            console.log("📦 INSERT ke database:", DataAbsensi);

            connection.query('INSERT INTO absensi SET ?', DataAbsensi, function (err, result) {
                if (err) {
                    console.error("🔥 ERROR query:", err);
                    reject(err);
                } else {
                    console.log("✅ Sukses insert:", result);
                    resolve(result);
                }
            });
        });
    }


    // Simpan absensi baru
    static async createabsensi(Data) {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO absensi SET ?", Data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, b.nia, c.id_jenis_latihan FROM anggota AS a JOIN anggota AS b ON a.nia = b.nia JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan WHERE a.id_absensi = ? `;

            connection.query(query, [id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }


    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update absensi set ? where id_absensi =' + id, Data, function (err, result) {
                if (err) {
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from absensi where id_absensi =' + id, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }


    static async getByNIA(nia) {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT a.*, b.nama, c.nama_latihan 
             FROM absensi AS a 
             JOIN anggota AS b ON a.nia = b.nia 
             JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan 
             WHERE a.nia = ?
             ORDER BY a.tanggal DESC`,
                [nia],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }


    static async getByNIAAndBulan(nia, bulan, tahun) {
        const query = `
          SELECT a.tanggal, a.status, jl.nama_latihan
          FROM absensi a
          JOIN jenis_latihan jl ON a.id_jenis_latihan = jl.id_jenis_latihan
          WHERE a.nia = ? AND MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
          ORDER BY a.tanggal ASC
        `;
        return new Promise((resolve, reject) => {
            connection.query(query, [nia, bulan, tahun], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }



}





module.exports = Model_Absensi;