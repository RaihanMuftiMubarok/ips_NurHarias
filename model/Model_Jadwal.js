const connection = require('../config/database');

class Model_Jadwal {

        // static async getAll(){
        //     return new Promise((resolve, reject) => {
        //         connection.query(`select a.*, b.nama_dokter from jadwal as a
        //             join dokter as b on a.id_dokter=b.id_dokter
        //             order by id_jadwal desc`, (err, rows) => {
        //             if(err){
        //                 reject(err);
        //             } else {
        //                 resolve(rows);
        //             }
        //         });
        //     });
        // }
        
        static async getAll() {
            return new Promise((resolve, reject) => {
                const sql = `select a.*, b.nama_latihan from jadwal as a
                            join jenis_latihan as b on a.id_jenis_latihan = b.id_jenis_latihan
                            order by id_jadwal asc`;
        
                console.log('Executing SQL query:', sql); // Log the SQL query
        
                connection.query(sql, (err, rows) => {
                    if (err) {
                        console.error('Error executing SQL query:', err); // Log the error if it occurs
                        reject(err);
                    } else {
                        console.log('Query result:', rows); // Log the result of the query
                        resolve(rows);
                    }
                });
            });
        }
        

    static async Store(Data){
        return new Promise((resolve, reject) => {
            let query = connection.query('insert into jadwal set ?', Data, function(err, result){
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
            connection.query(`select a.*,  b.nama_latihan from jadwal as a
                join jenis_latihan as b on a.id_jenis_latihan=b.id_jenis_latihan
                where id_jadwal = ` + id, (err,rows) => {
                if(err) {
                    reject(err);
                    console
                } else {
                    resolve(rows);
                }
            })
        })
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update jadwal set ? where id_jadwal =' + id, Data, function(err, result){
                if(err){
                    reject(err);
                    console.log(err);
                } else {
                    resolve(result);
                    console.log(result, Data);
                }
            })
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('delete from jadwal where id_jadwal =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}


module.exports = Model_Jadwal;