const connection = require('../config/database');

class Model_Pelatih {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT a.*, b.id_users FROM pelatih AS a JOIN users AS b ON a.id_users = b.id_users  ORDER BY a.nip ASC', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(DataPelatih) { // Perbaikan nama parameter
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO pelatih SET ?', DataPelatih, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Simpan pelatih baru
    static async createPelatih(Data) {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO pelatih SET ?", Data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM pelatih 
                WHERE nip = ?
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
            connection.query('update pelatih set ? where nip =' + id, Data, function (err, result) {
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
            connection.query('delete from pelatih where nip =' + id, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }




}





module.exports = Model_Pelatih;