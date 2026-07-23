import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'halloween_party_secret_key_2026';

// MySQL Configuration from .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'halloween_party';

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('يرجى رفع صور فقط!'), false);
  }
});

// Database Driver Wrapper (Supports MySQL with automatic SQLite fallback)
let activeDriver = 'none'; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

async function dbQuery(sql, params = []) {
  if (activeDriver === 'mysql') {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  } else {
    // SQLite
    return await sqliteDb.all(sql, params);
  }
}

async function dbExecute(sql, params = []) {
  if (activeDriver === 'mysql') {
    const [result] = await mysqlPool.query(sql, params);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  } else {
    // SQLite
    const result = await sqliteDb.run(sql, params);
    return { insertId: result.lastID, affectedRows: result.changes };
  }
}

async function initDB() {
  let mysqlConnected = false;

  // Try connecting to MySQL first
  try {
    const tempConn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tempConn.end();

    mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    await mysqlPool.query('SELECT 1');
    activeDriver = 'mysql';
    mysqlConnected = true;
    console.log(`✅ Connected to MySQL Database '${DB_NAME}' successfully!`);
  } catch (err) {
    console.warn(`⚠️ MySQL Connection Failed (${err.message}). Falling back to SQLite...`);
  }

  // Fallback to SQLite if MySQL fails
  if (!mysqlConnected) {
    sqliteDb = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
    activeDriver = 'sqlite';
    console.log('✅ Connected to SQLite Database fallback successfully!');
  }

  // Create Tables (Compatible DDL for both)
  if (activeDriver === 'mysql') {
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 10,
        description TEXT,
        image TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(255) NOT NULL,
        customer_address TEXT,
        shipping_method VARCHAR(255),
        total_amount DECIMAL(10, 2) NOT NULL,
        items JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'قيد الانتظار',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } else {
    // SQLite DDL
    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 10,
        description TEXT,
        image TEXT
      );
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT NOT NULL,
        customer_address TEXT,
        shipping_method TEXT,
        total_amount REAL NOT NULL,
        items TEXT NOT NULL,
        status TEXT DEFAULT 'قيد الانتظار',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Seed Admin User
  const adminUsers = await dbQuery('SELECT * FROM users WHERE username = ?', ['admin']);
  if (adminUsers.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await dbExecute('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
    console.log(`✅ Default Admin created (${activeDriver}): username=admin, password=admin123`);
  }

  // Seed Initial Products
  const productCountRows = await dbQuery('SELECT COUNT(*) as count FROM products');
  const count = productCountRows[0] ? (productCountRows[0].count || productCountRows[0]['COUNT(*)']) : 0;
  if (count === 0) {
    const initialProducts = [
      {
        name: "تجهيز حفلة عيد ميلاد",
        category: "عيد ميلاد",
        price: 1500,
        stock: 10,
        image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop",
        description: "تجهيزات كاملة لحفلات أعياد الميلاد تشمل البالونات والديكور المتناسق."
      },
      {
        name: "هدية سبوع فاخرة",
        category: "سبوع",
        price: 450,
        stock: 15,
        image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop",
        description: "طقم هدايا فاخر وشامل للمولود الجديد بلمسة مميزة."
      },
      {
        name: "باقة ورد جوري",
        category: "ورد وهدايا",
        price: 1200,
        stock: 8,
        image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&auto=format&fit=crop",
        description: "باقة ورد طبيعي طازج بألوان جذابة لتناسب كافة المناسبات."
      },
      {
        name: "تورتة عيد ميلاد مميزة",
        category: "عيد ميلاد",
        price: 300,
        stock: 4,
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=800&auto=format&fit=crop",
        description: "تورتة مميزة بأشكال رقيقة ومذاق رائع."
      }
    ];

    for (const p of initialProducts) {
      await dbExecute(
        'INSERT INTO products (name, category, price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.category, p.price, p.stock, p.description, p.image]
      );
    }
    console.log(`✅ Initial seed products inserted into ${activeDriver}`);
  }
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'رمز الجلسة غير صالح أو منتهي الصلاحية' });
    req.user = user;
    next();
  });
};

// ==================== AUTH & ADMIN ROUTES ====================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });

    const rows = await dbQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const totalProductsRows = await dbQuery('SELECT COUNT(*) as count FROM products');
    const totalSalesRows = await dbQuery("SELECT SUM(total_amount) as total FROM orders WHERE status != 'إلغاء'");
    const stockOutsRows = await dbQuery('SELECT COUNT(*) as count FROM products WHERE stock <= 5');

    const totalProducts = totalProductsRows[0] ? (totalProductsRows[0].count || totalProductsRows[0]['COUNT(*)']) : 0;
    const totalSales = totalSalesRows[0] && totalSalesRows[0].total ? parseFloat(totalSalesRows[0].total) : 0;
    const stockOuts = stockOutsRows[0] ? (stockOutsRows[0].count || stockOutsRows[0]['COUNT(*)']) : 0;

    res.json({ totalProducts, totalSales, stockOuts });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'خطأ أثناء جلب الإحصائيات' });
  }
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const adminId = req.user.id;

    const rows = await dbQuery('SELECT * FROM users WHERE id = ?', [adminId]);
    if (rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    let finalPassword = user.password;
    if (newPassword && newPassword.trim() !== '') {
      finalPassword = await bcrypt.hash(newPassword, 10);
    }

    await dbExecute('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, finalPassword, adminId]);
    res.json({ message: 'تم تحديث البيانات بنجاح' });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'فشل تحديث البيانات' });
  }
});

// ==================== PRODUCTS ROUTES ====================

app.get('/api/products', async (req, res) => {
  try {
    const products = await dbQuery('SELECT * FROM products ORDER BY id DESC');
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'فشل جلب المنتجات' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ error: 'فشل جلب تفاصيل المنتج' });
  }
});

app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    let imagePath = req.body.image || '';
    if (req.file) imagePath = `/uploads/${req.file.filename}`;

    const result = await dbExecute(
      'INSERT INTO products (name, category, price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, parseFloat(price), parseInt(stock), description || '', imagePath]
    );

    const rows = await dbQuery('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'فشل إضافة المنتج' });
  }
});

app.put('/api/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description } = req.body;

    const existingRows = await dbQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });

    const existingProduct = existingRows[0];
    let imagePath = existingProduct.image;
    if (req.file) imagePath = `/uploads/${req.file.filename}`;
    else if (req.body.image) imagePath = req.body.image;

    await dbExecute(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ?, image = ? WHERE id = ?',
      [name, category, parseFloat(price), parseInt(stock), description || '', imagePath, id]
    );

    const updatedRows = await dbQuery('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedRows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'فشل تعديل المنتج' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbExecute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'فشل حذف المنتج' });
  }
});

// ==================== ORDERS ROUTES ====================

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, customer_address, shipping_method, total_amount, items } = req.body;

    if (!customer_name || !customer_phone || !total_amount || !items) {
      return res.status(400).json({ error: 'يرجى استكمال بيانات الطلب' });
    }

    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items);

    const result = await dbExecute(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, shipping_method, total_amount, items, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, customer_email || '', customer_phone, customer_address || '', shipping_method || 'استلام من المحل', parseFloat(total_amount), itemsJson, 'قيد الانتظار']
    );

    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      for (const item of parsedItems) {
        if (item.id && item.quantity) {
          const updateStockSql = activeDriver === 'mysql'
            ? 'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?'
            : 'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?';
          await dbExecute(updateStockSql, [item.quantity, item.id]);
        }
      }
    } catch (parseErr) {
      console.error('Error updating stock after order:', parseErr);
    }

    res.status(201).json({ id: result.insertId, message: 'تم إرسال الطلب بنجاح' });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'فشل إرسال الطلب' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await dbQuery('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'فشل جلب الطلبات' });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'الحالة الجديدة مطلوبة' });

    const result = await dbExecute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'الطلب غير موجود' });

    res.json({ message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'فشل تحديث حالة الطلب' });
  }
});

app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbExecute('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'فشل حذف الطلب' });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (Active Driver: ${activeDriver.toUpperCase()})`);
  });
}).catch((err) => {
  console.error('❌ Database Initialization Fatal Error:', err);
});
