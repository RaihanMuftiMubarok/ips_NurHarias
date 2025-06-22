const connection = require('../config/database');

class Model_ResetToken {
  static async create(tokenData) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO reset_token SET ?', tokenData, (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  }

  static async getByToken(token) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM reset_token WHERE token = ?', [token], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }

  static async deleteByUserId(id_users) {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM reset_token WHERE id_users = ?', [id_users], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  static async findByToken(token) {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM reset_token WHERE token = ?", [token], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  }
  
}

module.exports = Model_ResetToken;
