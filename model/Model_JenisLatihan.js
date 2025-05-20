const connection = require('../config/database');

class Model_JenisLatihan {

    static async getAll(){
        return new Promise((resolve, reject) => {
            connection.query('select * from jenis_latihan order by id_jenis_latihan desc', (err, rows) => {
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
            connection.query('insert into jenis_latihan set ?', Data, function(err, result){
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
    connection.query(
      'SELECT * FROM jenis_latihan WHERE id_jenis_latihan = ?',
      [id],
      (err, rows) => {
        if(err) reject(err);
        else resolve(rows);
      }
    );
  });
}


    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('update jenis_latihan set ? where id_jenis_latihan =' + id, Data, function(err, result){
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
            connection.query('delete from jenis_latihan where id_jenis_latihan =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

}





module.exports = Model_JenisLatihan;