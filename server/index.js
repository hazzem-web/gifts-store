import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'gifts-store-dev-secret';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gifts-store';
const AdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const AdminUser = process.env.ADMIN_USER || 'admin';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ORDER_NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || 'partyhalloween672@gmail.com';
const ORDER_NOTIFICATION_NAME = process.env.ORDER_NOTIFICATION_NAME || 'Gifts Store';

// Create uploads directory if it doesn't exist
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('يرجى رفع صور فقط!'), false);
  }
});

// Helper to check valid MongoDB ObjectId
function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeParseOrderItems(items) {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
}

function formatOrderItemsForEmail(items) {
  const parsedItems = safeParseOrderItems(items);

  if (parsedItems.length === 0) {
    return '<tr><td colspan="4" style="padding: 12px; text-align: center; color: #666;">لا توجد عناصر في الطلب</td></tr>';
  }

  return parsedItems.map((item, index) => {
    const itemName = escapeHtml(item.name || `عنصر ${index + 1}`);
    const itemQuantity = Number(item.quantity || 1);
    const itemPrice = Number(item.price || 0);
    const itemTotal = itemQuantity * itemPrice;

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${itemName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${itemQuantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${itemPrice.toFixed(2)} ج.م</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${itemTotal.toFixed(2)} ج.م</td>
      </tr>
    `;
  }).join('');
}

const orderEmailTransporter = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  : null;

if (!orderEmailTransporter) {
  console.warn('⚠️ Order email notifications disabled: set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment to enable Nodemailer.');
}

async function sendOrderNotificationEmail(orderPayload) {
  if (!orderEmailTransporter) return;

  const orderId = escapeHtml(String(orderPayload.id || ''));
  const customerName = escapeHtml(orderPayload.customer_name || '');
  const customerAddress = escapeHtml(orderPayload.customer_address || 'استلام من المحل');
  const customerPhone = escapeHtml(orderPayload.customer_phone || 'غير متوفر');
  const itemRows = formatOrderItemsForEmail(orderPayload.items);
  const customerEmail = escapeHtml(orderPayload.customer_email || 'غير محدد');
  const shippingMethod = escapeHtml(orderPayload.shipping_method || 'استلام من المحل');

  await orderEmailTransporter.sendMail({
    from: `${escapeHtml(ORDER_NOTIFICATION_NAME)} <${SMTP_USER}>`,
    to: ORDER_NOTIFICATION_EMAIL,
    subject: `طلب جديد من متجر الهدايا - #${orderId}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; background: #f8f8f8; padding: 24px; color: #222;">
        <div style="max-width: 760px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.06);">
          <div style="background: #ff7a1a; color: #fff; padding: 20px 24px; font-size: 22px; font-weight: bold;">
            طلب جديد في المتجر
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 8px;"><strong>رقم الطلب:</strong> ${orderId}</p>
            <p style="margin: 0 0 8px;"><strong>اسم العميل:</strong> ${customerName}</p>
            <p style="margin: 0 0 8px;"><strong>البريد الإلكتروني:</strong> ${customerEmail}</p>
            <p style="margin: 0 0 8px;"><strong>رقم الهاتف:</strong> ${customerPhone}</p>
            <p style="margin: 0 0 8px;"><strong>العنوان:</strong> ${customerAddress}</p>
            <p style="margin: 0 0 8px;"><strong>طريقة الشحن/الاستلام:</strong> ${shippingMethod}</p>
            <p style="margin: 0 0 18px;"><strong>الإجمالي:</strong> ${Number(orderPayload.total_amount || 0).toFixed(2)} ج.م</p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
              <thead>
                <tr style="background: #fff7f0;">
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">المنتج</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">الكمية</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">السعر</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>

            <p style="margin-top: 18px; color: #555; font-size: 14px;">تم إنشاء هذا الطلب تلقائيًا عبر نظام البريد الإلكتروني في المتجر.</p>
          </div>
        </div>
      </div>
    `
  });
}

// ==================== MONGOOSE SCHEMAS & MODELS ====================

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 10 },
  description: { type: String, default: '' },
  image: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  customer_email: { type: String, default: '' },
  customer_phone: { type: String, required: true },
  customer_address: { type: String, default: '' },
  shipping_method: { type: String, default: 'استلام من المحل' },
  total_amount: { type: Number, required: true },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, default: 'قيد الانتظار' },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Order = mongoose.model('Order', orderSchema);

// ==================== DATABASE INITIALIZATION ====================

async function initDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`🍃 Connected to MongoDB Database via Mongoose successfully! (${MONGODB_URI})`);

    // Seed Default Admin User
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(AdminPassword, 10);
      await User.create({ username:AdminUser, password: hashedPassword });
      console.log('✅ Default Admin created in MongoDB: username=admin, password=admin123');
    }

    // Seed Default Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
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

      await Product.insertMany(initialProducts);
      console.log('✅ Initial seed products inserted into MongoDB');
    }
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
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

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const stockOuts = await Product.countDocuments({ stock: { $lte: 5 } });

    const salesAggregate = await Order.aggregate([
      { $match: { status: { $ne: 'إلغاء' } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].total : 0;

    res.json({ totalProducts, totalSales, stockOuts });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'خطأ أثناء جلب الإحصائيات' });
  }
});

// Admin Settings
app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const adminId = req.user.id;

    if (!isValidObjectId(adminId)) return res.status(400).json({ error: 'معرف غير صالح' });

    const user = await User.findById(adminId);
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    user.username = username;
    if (newPassword && newPassword.trim() !== '') {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: 'تم تحديث البيانات بنجاح' });
  } catch (err) {
    console.error('Settings update error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'اسم المستخدم هذا مستخدم بالفعل' });
    }
    res.status(500).json({ error: 'فشل تحديث البيانات' });
  }
});

// ==================== PRODUCTS ROUTES (CRUD) ====================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'فشل جلب المنتجات' });
  }
});

// Get Single Product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;
    if (isValidObjectId(id)) {
      product = await Product.findById(id);
    }
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    console.error('Fetch product error:', err);
    res.status(500).json({ error: 'فشل جلب تفاصيل المنتج' });
  }
});

// Create Product (Admin CRUD)
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, stock, description } = req.body;
    let imagePath = req.body.image || '';

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create({
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || '',
      image: imagePath
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'فشل إضافة المنتج' });
  }
});

// Update Product (Admin CRUD)
app.put('/api/products/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description } = req.body;

    if (!isValidObjectId(id)) return res.status(404).json({ error: 'المنتج غير موجود' });

    const existingProduct = await Product.findById(id);
    if (!existingProduct) return res.status(404).json({ error: 'المنتج غير موجود' });

    let imagePath = existingProduct.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    existingProduct.name = name;
    existingProduct.category = category;
    existingProduct.price = parseFloat(price);
    existingProduct.stock = parseInt(stock);
    existingProduct.description = description || '';
    existingProduct.image = imagePath;

    await existingProduct.save();
    res.json(existingProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'فشل تعديل المنتج' });
  }
});

// Delete Product (Admin CRUD)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(404).json({ error: 'المنتج غير موجود' });

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'فشل حذف المنتج' });
  }
});

// ==================== ORDERS ROUTES ====================

// Create Order (Customer)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, customer_address, shipping_method, total_amount, items } = req.body;

    if (!customer_name || !customer_phone || !total_amount || !items) {
      return res.status(400).json({ error: 'يرجى استكمال بيانات الطلب' });
    }

    const newOrder = await Order.create({
      customer_name,
      customer_email: customer_email || '',
      customer_phone,
      customer_address: customer_address || '',
      shipping_method: shipping_method || 'استلام من المحل',
      total_amount: parseFloat(total_amount),
      items,
      status: 'قيد الانتظار'
    });

    try {
      await sendOrderNotificationEmail({
        id: newOrder._id,
        customer_name,
        customer_email: customer_email || '',
        customer_phone,
        customer_address: customer_address || '',
        shipping_method: shipping_method || 'استلام من المحل',
        total_amount: parseFloat(total_amount),
        items
      });
    } catch (emailErr) {
      console.error('Order email notification failed:', emailErr);
    }

    // Safe Update Product Stock
    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      for (const item of parsedItems) {
        const targetId = item.id || item._id;
        if (targetId && isValidObjectId(targetId)) {
          await Product.findByIdAndUpdate(targetId, {
            $inc: { stock: -item.quantity }
          });
        } else if (item.name) {
          // Fallback: match by product name if item ID was numeric (from legacy SQLite cache)
          await Product.findOneAndUpdate(
            { name: item.name },
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    } catch (parseErr) {
      console.error('Error updating stock after order:', parseErr);
    }

    res.status(201).json({ id: newOrder._id, message: 'تم إرسال الطلب بنجاح' });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'فشل إرسال الطلب' });
  }
});

// Get All Orders (Admin)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'فشل جلب الطلبات' });
  }
});

// Update Order Status (Admin)
app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'الحالة الجديدة مطلوبة' });
    if (!isValidObjectId(id)) return res.status(404).json({ error: 'الطلب غير موجود' });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    res.json({ message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'فشل تحديث حالة الطلب' });
  }
});

// Delete Order (Admin)
app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(404).json({ error: 'الطلب غير موجود' });

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'فشل حذف الطلب' });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} with MongoDB & Mongoose`);
  });
}).catch((err) => {
  console.error('❌ Failed to initialize database:', err);
});
