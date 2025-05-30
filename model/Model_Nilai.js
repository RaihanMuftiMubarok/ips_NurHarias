const connection = require('../config/database');

class Model_Nilai {

    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT a.*, b.nama, c.nama_latihan 
                 FROM nilai AS a 
                 JOIN anggota AS b ON a.nia = b.nia 
                 JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan 
                 ORDER BY a.id_nilai ASC`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getByUserId(id_users) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, b.nama AS nama_anggota, c.nama_latihan, b.tingkatan
                FROM nilai AS a
                JOIN anggota AS b ON a.nia = b.nia
                JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan
                WHERE b.id_users = ?
                ORDER BY a.tanggal ASC
            `;
            connection.query(query, [id_users], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async Store(Datanilai) {
        return new Promise((resolve, reject) => {
            console.log("📦 INSERT ke database:", Datanilai);
            connection.query('INSERT INTO nilai SET ?', Datanilai, (err, result) => {
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

    static async createnilai(Data) {
        return new Promise((resolve, reject) => {
            connection.query("INSERT INTO nilai SET ?", Data, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async getId(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.*, b.nama, c.nama_latihan 
                FROM nilai AS a 
                JOIN anggota AS b ON a.nia = b.nia 
                JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan 
                WHERE a.id_nilai = ?
            `;
            connection.query(query, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE nilai SET ? WHERE id_nilai = ?', [Data, id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM nilai WHERE id_nilai = ?', [id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    static async getByNIA(nia) {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT a.*, b.nama, c.nama_latihan 
                 FROM nilai AS a 
                 JOIN anggota AS b ON a.nia = b.nia 
                 JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan 
                 WHERE a.nia = ?
                 ORDER BY a.tanggal DESC`,
                [nia],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getNilaiBulananByNIA(nia, bulan, tahun) {
        const query = `
          SELECT jl.id_jenis_latihan, jl.nama_latihan, n.nilai_angka
          FROM jenis_latihan jl
          LEFT JOIN (
            SELECT *
            FROM nilai
            WHERE nia = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?
          ) AS n ON n.id_jenis_latihan = jl.id_jenis_latihan
          ORDER BY jl.id_jenis_latihan ASC
        `;
        return new Promise((resolve, reject) => {
          connection.query(query, [nia, bulan, tahun], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
      }
      
      

    static async getByNIAAndMonth(nia, bulan, tahun) {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT a.*, b.nama, c.nama_latihan 
                 FROM nilai AS a 
                 JOIN anggota AS b ON a.nia = b.nia 
                 JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan 
                 WHERE a.nia = ? 
                   AND MONTH(a.tanggal) = ? 
                   AND YEAR(a.tanggal) = ?
                 ORDER BY a.tanggal ASC`,
                [nia, bulan, tahun],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getRekapByFilters({ bulan, tahun, tingkatan, idLatihan }) {
        const params = [bulan, tahun];
        let filter = `
            WHERE MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
        `;

        if (tingkatan !== 'all') {
            filter += ` AND b.tingkatan = ?`;
            params.push(tingkatan);
        }

        if (idLatihan !== 'all') {
            filter += ` AND c.id_jenis_latihan = ?`;
            params.push(idLatihan);
        }

        const query = `
            SELECT a.*, b.nama, b.nia, b.tingkatan, c.nama_latihan 
            FROM nilai AS a
            JOIN anggota AS b ON a.nia = b.nia
            JOIN jenis_latihan AS c ON a.id_jenis_latihan = c.id_jenis_latihan
            ${filter}
            ORDER BY b.nama, a.tanggal ASC
        `;

        return new Promise((resolve, reject) => {
            connection.query(query, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
}

module.exports = Model_Nilai;
