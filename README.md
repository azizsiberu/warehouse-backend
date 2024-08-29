# warehouse-backend
Backend aplikasi warehouse management

---

# **Dokumentasi Backend Aplikasi Gudang**

## **1. Deskripsi Proyek**

Backend dari aplikasi gudang ini dibangun menggunakan Express.js sebagai framework utama untuk menangani permintaan HTTP dan mengelola API. Database PostgreSQL digunakan untuk menyimpan data inventaris, transaksi, pengguna, dan berbagai entitas lainnya. Backend ini bertanggung jawab untuk menyediakan API yang akan digunakan oleh frontend untuk berinteraksi dengan data dan logika bisnis.

## **2. Struktur Direktori**

```plaintext
backend/
├── config/                # Konfigurasi aplikasi, seperti koneksi database
│   ├── db.js              # Koneksi ke database PostgreSQL
│   └── config.js          # Variabel environment dan konfigurasi lainnya
├── controllers/           # Logika bisnis dan pengelolaan permintaan HTTP
│   ├── itemController.js  # Mengelola barang
│   ├── stockInController.js # Mengelola barang masuk
│   ├── stockOutController.js # Mengelola barang keluar
│   ├── scheduleController.js # Mengelola jadwal pengiriman
│   └── authController.js  # Autentikasi pengguna
├── middlewares/           # Middleware untuk validasi, autentikasi, dll.
│   └── authMiddleware.js  # Middleware untuk memeriksa autentikasi
├── models/                # Definisi skema database
│   ├── itemModel.js       # Skema untuk barang
│   ├── stockInModel.js    # Skema untuk barang masuk
│   ├── stockOutModel.js   # Skema untuk barang keluar
│   ├── scheduleModel.js   # Skema untuk jadwal pengiriman
│   └── userModel.js       # Skema untuk pengguna
├── routes/                # Definisi rute untuk API
│   ├── itemRoutes.js      # Rute untuk manajemen barang
│   ├── stockInRoutes.js   # Rute untuk barang masuk
│   ├── stockOutRoutes.js  # Rute untuk barang keluar
│   ├── scheduleRoutes.js  # Rute untuk jadwal pengiriman
│   └── authRoutes.js      # Rute untuk autentikasi
├── services/              # Layanan tambahan seperti email, notifikasi, dll.
│   └── emailService.js    # Layanan untuk mengirim email
├── utils/                 # Utilitas umum yang digunakan di berbagai bagian aplikasi
│   ├── errorHandler.js    # Penanganan error global
│   ├── logger.js          # Logging untuk aplikasi
│   └── helpers.js         # Fungsi-fungsi pembantu
├── .env                   # File untuk variabel environment
├── .gitignore             # File untuk mengabaikan file tertentu di Git
├── app.js                 # Entry point utama untuk aplikasi
├── package.json           # Konfigurasi dan dependencies Node.js
└── README.md              # Dokumentasi proyek
```

## **3. Setup Proyek**

### **3.1. Prasyarat**
Pastikan Anda telah menginstal Node.js dan npm (Node Package Manager) di sistem Anda. Juga, pastikan PostgreSQL telah diinstal dan dikonfigurasi.

### **3.2. Instalasi**
1. **Clone Repository Backend:**
   ```bash
   git clone https://github.com/username/warehouse-backend.git
   cd warehouse-backend
   ```

2. **Instal Dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   - Buat file `.env` di root direktori dan tambahkan variabel environment yang diperlukan. Contoh:
   ```plaintext
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/warehouse_db
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Migrasi Database:**
   - Jika Anda menggunakan migrasi untuk mengatur skema database, jalankan perintah migrasi:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Jalankan Aplikasi:**
   ```bash
   npm start
   ```
   Aplikasi akan berjalan di `http://localhost:5000`.

## **4. Konfigurasi Database**

### **4.1. Koneksi Database**
Koneksi ke PostgreSQL diatur di dalam file `config/db.js`:

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Atur ke true jika Anda ingin melihat query SQL di konsol
});

module.exports = sequelize;
```

### **4.2. Skema Database**
Model untuk setiap tabel di dalam database didefinisikan di dalam folder `models`. Contoh skema untuk tabel barang (`items`):

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.STRING,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Fields lainnya sesuai kebutuhan...
});

module.exports = Item;
```

### **4.3. Migrasi Database**
Jika Anda menggunakan Sequelize untuk migrasi database, pastikan Anda memiliki folder `migrations` dan `seeders` di dalam direktori proyek. Gunakan perintah berikut untuk membuat dan menjalankan migrasi:

```bash
npx sequelize-cli migration:generate --name migration_name
npx sequelize-cli db:migrate
```

## **5. Rute dan API**

### **5.1. Rute API**
Semua rute API didefinisikan di dalam folder `routes`. Setiap rute mengarahkan permintaan HTTP ke controller yang sesuai untuk memproses logika bisnis.

Contoh rute untuk manajemen barang (`itemRoutes.js`):

```javascript
const express = require('express');
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const router = express.Router();

router.get('/', getItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
```

### **5.2. Autentikasi dan Middleware**
Backend ini menggunakan JWT (JSON Web Token) untuk autentikasi. Middleware `authMiddleware.js` digunakan untuk memverifikasi token JWT pada setiap permintaan yang membutuhkan autentikasi.

Contoh middleware autentikasi:

```javascript
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};
```

### **5.3. Contoh Endpoint API**
Berikut adalah contoh endpoint API untuk mengambil daftar barang:

- **Endpoint:** `GET /api/items`
- **Deskripsi:** Mengambil daftar semua barang yang ada di gudang.
- **Respon:** JSON array dari barang-barang yang tersedia.

### **6. Pengujian dan Debugging**

### **6.1. Unit Testing**
Gunakan framework seperti Jest atau Mocha untuk melakukan unit testing pada controller dan model. 

Contoh menjalankan tes:

```bash
npm test
```

### **6.2. Debugging**
Gunakan `console.log` untuk debugging sederhana atau gunakan debugger bawaan Node.js atau Visual Studio Code untuk debugging yang lebih mendalam.

### **7. Deployment**

### **7.1. Build untuk Produksi**
Untuk menjalankan backend dalam mode produksi, pastikan Anda telah mengatur variabel environment untuk production, dan kemudian jalankan:

```bash
npm run build
npm start
```

### **7.2. Deploy ke Server**
Gunakan platform seperti Heroku, AWS EC2, atau DigitalOcean untuk deployment backend. Contoh deploy ke Heroku:

1. **Inisialisasi Heroku di Proyek Anda:**
   ```bash
   heroku create warehouse-backend
   ```

2. **Push Code ke Heroku:**
   ```bash
   git push heroku main
   ```

3. **Atur Variabel Environment di Heroku:**
   - Gunakan perintah `heroku config:set` untuk mengatur variabel environment seperti `DATABASE_URL`, `JWT_SECRET`, dll.

### **8. Dokumentasi API**

Gunakan tools seperti Swagger atau Postman untuk membuat dokumentasi API yang akan memudahkan integrasi dengan frontend atau layanan lain.

### **9. Logging dan Monitoring**

### **9.1. Logging**
Implementasi logging diatur di dalam file `logger.js`. Gunakan `winston` atau `morgan` untuk mencatat aktivitas aplikasi.

### **9.2. Monitoring**
Gunakan layanan seperti New Relic, Sentry, atau Loggly untuk memantau performa dan menangani error di produksi.
