// path: models/Attribute.js
const pool = require("../config/db");

class Attribute {
  // Mendapatkan semua data dari tabel kain
  static async getKain() {
    try {
      const query = 'SELECT * FROM kain';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error retrieving kain data:', error);
      throw new Error('Failed to retrieve kain data');
    }
  }

  // Mendapatkan semua data dari tabel dudukan
  static async getDudukan() {
    try {
      const query = 'SELECT * FROM dudukan';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error retrieving dudukan data:', error);
      throw new Error('Failed to retrieve dudukan data');
    }
  }

  // Mendapatkan semua data dari tabel kaki
  static async getKaki() {
    try {
      const query = 'SELECT * FROM kaki';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error retrieving kaki data:', error);
      throw new Error('Failed to retrieve kaki data');
    }
  }

  // Mendapatkan data dari tabel warna berdasarkan id_kain
  static async getWarnaByKainId(id_kain) {
    try {
      const query = 'SELECT * FROM warna WHERE id_kain = $1';
      const { rows } = await pool.query(query, [id_kain]);
      return rows;
    } catch (error) {
      console.error(`Error retrieving warna data for kain id ${id_kain}:`, error);
      throw new Error('Failed to retrieve warna data');
    }
  }

  // Mendapatkan semua data dari tabel finishing
  static async getFinishing() {
    try {
      const query = 'SELECT * FROM finishing';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error retrieving finishing data:', error);
      throw new Error('Failed to retrieve finishing data');
    }
  }
}

module.exports = Attribute;
