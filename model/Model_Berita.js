const connection = require('../config/database');

class Model_Berita {

    static async getAll(){
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.*, 
                    SUBSTRING_INDEX(b.nama, ' ', 1) AS nama_depan, 
                    DATE_FORMAT(a.tanggal_posting, '%d-%m-%Y') AS tanggal_format
                FROM berita AS a 
                JOIN users AS b ON a.id_penulis = b.id_users 
                ORDER BY a.id_berita DESC
            `;
            connection.query(query, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    

    static async Store(Data){
        return new Promise((resolve, reject) => {
            connection.query('insert into berita set ?', Data, function(err, result){
                if(err){
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
          const query = `
            SELECT berita.*, users.nama AS nama_user,
       DATE_FORMAT(berita.tanggal_posting, '%d %M %Y') AS tanggal_format
FROM berita
JOIN users ON berita.id_penulis = users.id_users
WHERE berita.id_berita = ?
`;
      
          connection.query(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]); // Hanya 1 berita
          });
        });
      }
      

    static async getId(id){
        return new Promise((resolve, reject) => {
            connection.query('select * from berita where id_berita = ' + id, (err,rows) => {
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
            connection.query('update berita set ? where id_berita =' + id, Data, function(err, result){
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
            connection.query('delete from berita where id_berita =' + id, function(err,result){
                if(err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    static async getLimited(limit) {
        return new Promise((resolve, reject) => {
          const query = "SELECT * FROM berita ORDER BY tanggal_posting DESC LIMIT ?";
          connection.query(query, [limit], (err, rows) => {
            if (err) {
              return reject(err);
            }
            resolve(rows);
          });
        });
      }
      
    
    
}





module.exports = Model_Berita;