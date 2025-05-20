const connection = require('../config/database');

class Dashboard {
  static async getJumlahAnggota() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS total FROM anggota`;
      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  }
  
  static async getJumlahPelatih() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS total FROM pelatih`;
      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results[0].total);
      });
    });
  }

  static async getJumlahPerTingkatan() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT tingkatan, COUNT(*) AS jumlah 
        FROM anggota 
        GROUP BY tingkatan 
        ORDER BY FIELD(tingkatan, 'hitam','merah','biru','hijau','oren','kuning','putih','intan')
      `;
      connection.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = Dashboard;
