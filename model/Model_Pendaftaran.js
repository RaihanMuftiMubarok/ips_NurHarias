const connection = require('../config/database');

class Model_Pendaftaran {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('select * from pendaftaran order by no_pendaftaran desc', (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into pendaftaran set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getId(id){
        return new Promise((resolve, reject) => {
            connection.query('select * from pendaftaran where no_pendaftaran = ' + id, (err,rows) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update pendaftaran set ? where no_pendaftaran =' + id, Data, function(err, result){
                if(err){
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
            connection.query('delete from pendaftaran where no_pendaftaran =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

        // Ambil data pendaftaran berdasarkan no_pendaftaran
        static async getByNoPendaftaran(no_pendaftaran) {
            return new Promise((resolve, reject) => {
                connection.query("SELECT * FROM pendaftaran WHERE no_pendaftaran = ?", [no_pendaftaran], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows[0]); // Kembalikan hanya satu hasil
                });
            });
        }

    // Perbarui status pendaftaran
    static async updateStatus(no_pendaftaran, status) {
        return new Promise((resolve, reject) => {
            connection.query("UPDATE pendaftaran SET status = ? WHERE no_pendaftaran = ?", [status, no_pendaftaran], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
    
    static async getByEmail(email) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM pendaftaran WHERE email = ?", [email], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]); // hasil baris pertama jika ada
            });
        });
    }
    
    
}






module.exports = Model_Pendaftaran;