const connection = require('../config/database');

class Model_Anggota {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT a.*, b.id_users, c.no_pendaftaran FROM anggota AS a JOIN users AS b ON a.id_users = b.id_users JOIN pendaftaran AS c ON a.no_pendaftaran = c.no_pendaftaran ORDER BY a.nia ASC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(DataAnggota) { // Perbaikan nama parameter
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO anggota SET ?', DataAnggota, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Simpan anggota baru
    static async createAnggota(Data) {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO anggota SET ?", Data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    nia, 
                    nama, 
                    jenis_kelamin, 
                    tempat_tanggal_lahir, 
                    alamat, 
                    peminatan, 
                    ayah, 
                    ibu, 
                    tingkatan, 
                    pendidikan_terakhir, 
                    email, 
                    kontak, 
                    foto, 
                    DATE_FORMAT(tanggal_masuk, '%d-%m-%Y %H:%i') AS tanggal_masuk 
                FROM anggota 
                WHERE nia = ?
            `;
    
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
            connection.query('update anggota set ? where nia =' + id, Data, function (err, result) {
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
            connection.query('delete from anggota where nia =' + id, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }


    static async getByTingkatan(tingkatan) {
        return new Promise((resolve, reject) => {
          connection.query('SELECT * FROM anggota WHERE tingkatan = ?', [tingkatan], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      }

      static async getByUserId(id_users) {
        return new Promise((resolve, reject) => {
          connection.query(
            "SELECT * FROM anggota WHERE id_users = ?",
            [id_users],
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
      

      static async getByNIA(nia) {
        return new Promise((resolve, reject) => {
          connection.query('SELECT * FROM anggota WHERE nia = ?', [nia], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
          });
        });
      }
      

}





module.exports = Model_Anggota;