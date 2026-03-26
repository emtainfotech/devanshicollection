import 'dotenv/config';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { ensureSchema } from './schema.js';
import { query } from './db.js';
import { authRequired, adminRequired, signToken, verifyPassword } from './auth.js';
import { sendMail } from './email.js';
import crypto from 'crypto';
import fetch from 'node-fetch';

const app = express();
const APP_URL = 'https://devanshicollection.com';
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeJson = (value) => {
  if (value == null) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return value;
  }
};

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true });
});

// Auth
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing?.length) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const resId = await query('SELECT UUID() as id');
  const userId = resId[0].id;

  await query(
    'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
    [userId, email, hash]
  );

  await query(
    'INSERT INTO profiles (user_id, first_name, last_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [userId, first_name || null, last_name || null]
  );

  await query('INSERT INTO user_roles (user_id, role) VALUES (?, ?)', [userId, 'user']);

  const token = signToken({ id: userId, email, role: 'user' });
  await sendMail(email, 'Welcome to Devanshi Collection!', `<h1>Welcome, ${first_name || 'friend'}!</h1><p>Thanks for signing up. We're excited to have you.</p><p><a href="${APP_URL}">Visit our website</a></p>`);
  res.json({ token, user: { id: userId, email, first_name, last_name, role: 'user' } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await verifyPassword(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const profiles = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [user.id]);
  const profile = profiles?.[0] || {};

  const roles = await query('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
  const role = roles?.[0]?.role || 'user';

  const token = signToken({ id: user.id, email: user.email, role });
  res.json({
    token,
    user: { id: user.id, email: user.email, first_name: profile.first_name, last_name: profile.last_name, role, created_at: user.created_at },
  });
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const users = await query('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.id]);
  const user = users?.[0];
  if (!user) return res.json({ user: null });

  const profiles = await query('SELECT first_name, last_name FROM profiles WHERE user_id = ?', [user.id]);
  const profile = profiles?.[0] || {};

  const roles = await query('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
  const role = roles?.[0]?.role || 'user';

  res.json({
    user: { ...user, first_name: profile.first_name, last_name: profile.last_name, role }
  });
});

// Public data
app.get('/api/categories', async (_req, res) => {
  const rows = await query('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC');
  res.json(rows);
});

app.get('/api/products', async (req, res) => {
  const { category } = req.query;
  let rows;
  if (category) {
    const cat = await query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [String(category)]);
    const catId = cat?.[0]?.id;
    rows = await query('SELECT * FROM products WHERE is_active = 1 AND category_id = ? ORDER BY created_at DESC', [catId || '']);
  } else {
    rows = await query('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
  }
  res.json(
    rows.map((p) => ({
      ...p,
      sizes: safeJson(p.sizes) || [],
      colors: safeJson(p.colors) || [],
      images: safeJson(p.images) || [],
    }))
  );
});

app.get('/api/products/:slug', async (req, res) => {
  const rows = await query('SELECT * FROM products WHERE slug = ? LIMIT 1', [req.params.slug]);
  const p = rows?.[0];
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...p,
    sizes: safeJson(p.sizes) || [],
    colors: safeJson(p.colors) || [],
    images: safeJson(p.images) || [],
  });
});

app.get('/api/banners', async (req, res) => {
  const position = String(req.query.position || '');
  const rows = position
    ? await query('SELECT * FROM banners WHERE is_active = 1 AND position = ? ORDER BY sort_order ASC', [position])
    : await query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC');
  res.json(rows);
});

app.get('/api/site-settings', async (_req, res) => {
  const rows = await query('SELECT * FROM site_settings ORDER BY created_at ASC LIMIT 1');
  res.json(rows?.[0] || null);
});

app.get('/api/shipping-rules', async (_req, res) => {
  const rows = await query('SELECT free_shipping_threshold, flat_shipping_rate FROM site_settings LIMIT 1');
  res.json(rows?.[0] || { free_shipping_threshold: 4999, flat_shipping_rate: 100 });
});

app.get('/api/testimonials', async (_req, res) => {
  const rows = await query('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC');
  res.json(rows);
});

app.get('/api/reviews', async (req, res) => {
  const productId = String(req.query.product_id || '');
  if (!productId) return res.json([]);
  const rows = await query('SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC', [productId]);
  res.json(rows);
});

// Orders (user)
app.post('/api/orders', authRequired, async (req, res) => {
  const body = req.body || {};
  const { items, shipping_address, totals, coupon_code } = body;
  if (!items?.length) return res.status(400).json({ error: 'No items' });

  let discount_amount = 0;
  if (coupon_code) {
    const couponRows = await query('SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1', [String(coupon_code).toUpperCase()]);
    const coupon = couponRows?.[0];
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discount_amount = (Number(totals?.subtotal || 0) * Number(coupon.discount_value)) / 100;
      } else {
        discount_amount = Number(coupon.discount_value);
      }
      await query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
    }
  }

  const orderIdRows = await query('SELECT UUID() as id');
  const orderId = orderIdRows[0].id;

  await query(
    `INSERT INTO orders (id, user_id, status, payment_status, payment_method, subtotal, discount_amount, shipping_amount, tax_amount, total_amount, shipping_address, coupon_code, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      orderId,
      req.user.id,
      'pending',
      'unpaid',
      'manual',
      Number(totals?.subtotal || 0),
      discount_amount,
      Number(totals?.shipping_amount || 0),
      Number(totals?.tax_amount || 0),
      Number(totals?.total_amount || 0) - discount_amount,
      JSON.stringify(shipping_address || {}),
      coupon_code || null,
    ]
  );

  for (const it of items) {
    const itemId = (await query('SELECT UUID() as id'))[0].id;
    await query(
      `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, size, color, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemId,
        orderId,
        it.product_id || null,
        it.product_name,
        it.product_image || null,
        it.size || null,
        it.color || null,
        Number(it.quantity || 1),
        Number(it.unit_price || 0),
        Number(it.total_price || 0),
      ]
    );
  }

  res.json({ id: orderId });
});

app.get('/api/my-orders', authRequired, async (req, res) => {
  const rows = await query(`
    SELECT o.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'product_name', product_name, 'product_image', product_image, 'size', size, 'color', color, 'quantity', quantity, 'unit_price', unit_price)) FROM order_items WHERE order_id = o.id) as items
    FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC`, [req.user.id]);
  res.json(rows.map((o) => ({ ...o, shipping_address: safeJson(o.shipping_address), items: safeJson(o.items) })));
});

// Reviews submit (user)
app.post('/api/reviews', authRequired, async (req, res) => {
  const { product_id, rating, comment } = req.body || {};
  if (!product_id || !rating) return res.status(400).json({ error: 'Missing product_id/rating' });
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO reviews (id, user_id, product_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, 1)',
    [id, req.user.id, product_id, Number(rating), comment || null]
  );

  const agg = await query('SELECT COUNT(*) as c, AVG(rating) as a FROM reviews WHERE product_id = ? AND is_approved = 1', [product_id]);
  const count = Number(agg?.[0]?.c || 0);
  const avg = Number(agg?.[0]?.a || 0);
  await query('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [Number(avg.toFixed(1)), count, product_id]);

  res.json({ ok: true });
});

// Chatbot logs
app.post('/api/chatbot', async (req, res) => {
  const { question, answer, page_url, user_agent, user_id } = req.body || {};
  if (!question || !answer) return res.status(400).json({ error: 'Missing question/answer' });
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO chatbot_messages (id, user_id, question, answer, page_url, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
    [id, user_id || null, question, answer, page_url || null, user_agent || null]
  );
  res.json({ ok: true });
});

// Blog endpoints (public)
app.get('/api/blogs', async (req, res) => {
  const rows = await query('SELECT * FROM blogs WHERE is_published = 1 ORDER BY published_at DESC');
  res.json(rows);
});

app.get('/api/blogs/:slug', async (req, res) => {
  const rows = await query('SELECT * FROM blogs WHERE slug = ? AND is_published = 1', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Blog not found' });
  res.json(rows[0]);
});

// Blog Admin endpoints
app.get('/api/admin/blogs', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM blogs ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/admin/blogs', authRequired, adminRequired, async (req, res) => {
  const { title, slug, content, excerpt, image_url, author, is_published } = req.body || {};
  if (!title || !slug || !content) return res.status(400).json({ error: 'Missing title/slug/content' });
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO blogs (id, title, slug, content, excerpt, image_url, author, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, title, slug, content, excerpt || null, image_url || null, author || null, is_published ? 1 : 0, is_published ? new Date() : null]
  );
  res.json({ id, ok: true });
});

app.patch('/api/admin/blogs/:id', authRequired, adminRequired, async (req, res) => {
  const { title, slug, content, excerpt, image_url, author, is_published } = req.body || {};
  const updates = [];
  const params = [];
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
  if (content !== undefined) { updates.push('content = ?'); params.push(content); }
  if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
  if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }
  if (author !== undefined) { updates.push('author = ?'); params.push(author); }
  if (is_published !== undefined) {
    updates.push('is_published = ?');
    params.push(is_published ? 1 : 0);
    if (is_published) {
      updates.push('published_at = COALESCE(published_at, NOW())');
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  params.push(req.params.id);
  await query(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`, params);
  res.json({ ok: true });
});

app.delete('/api/admin/blogs/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.post('/api/pay', authRequired, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'Order ID is required' });

  const [order] = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const merchantTransactionId = `MT_${order.id.slice(0, 8)}_${Date.now()}`;
  const transactionId = (await query('SELECT UUID() as id'))[0].id;

  await query(
    `INSERT INTO transactions (id, order_id, user_id, provider_transaction_id, amount, currency)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [transactionId, order.id, req.user.id, merchantTransactionId, order.total_amount, 'INR']
  );

  const payload = {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: req.user.id,
    amount: Math.round(Number(order.total_amount) * 100), // Amount in paise as a strict integer
    redirectUrl: `${process.env.APP_URL}/payment/callback`,
    redirectMode: 'GET',
    callbackUrl: `${process.env.APP_URL}/api/payment/callback`,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY).digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

  try {
    const response = await fetch(`${process.env.PHONEPE_HOST}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (data.success) {
      res.json({ redirectUrl: data.data.instrumentResponse.redirectInfo.url });
    } else {
      res.status(500).json({ error: data.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PhonePe Callback Handler
app.post('/api/payment/callback', async (req, res) => {
  const { response } = req.body;
  const xVerify = req.headers['x-verify'];

  if (!response || !xVerify) {
    return res.status(400).json({ error: 'Missing response or checksum' });
  }

  // Verify checksum
  const checksum = crypto.createHash('sha256').update(response + process.env.PHONEPE_SALT_KEY).digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;
  if (checksum !== xVerify) {
    return res.status(401).json({ error: 'Invalid checksum' });
  }

  const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
  const { success, code, data } = decodedResponse;

  if (success && code === 'PAYMENT_SUCCESS') {
    const { merchantTransactionId, transactionId: providerTransactionId, amount, paymentInstrument } = data;
    
    // Find transaction
    const [transaction] = await query('SELECT * FROM transactions WHERE provider_transaction_id = ?', [merchantTransactionId]);
    if (transaction) {
      // Update transaction
      await query(
        `UPDATE transactions SET status = 'success', provider_transaction_id = ?, payment_method_type = ?, payment_method_provider = ?, provider_response = ? WHERE id = ?`,
        [providerTransactionId, paymentInstrument.type, paymentInstrument.cardType || paymentInstrument.bankId || null, JSON.stringify(decodedResponse), transaction.id]
      );

      // Update order
      await query(
        `UPDATE orders SET payment_status = 'paid', payment_method = ?, updated_at = NOW() WHERE id = ?`,
        ['phonepe', transaction.order_id]
      );

      // Send confirmation email
      const [order] = await query('SELECT o.*, u.email, p.first_name FROM orders o JOIN users u ON o.user_id = u.id JOIN profiles p ON o.user_id = p.user_id WHERE o.id = ?', [transaction.order_id]);
      if (order) {
        await sendMail(order.email, `Order Confirmation - #${order.id.slice(0, 8)}`, `<h1>Payment Successful!</h1><p>Hi ${order.first_name}, your payment for order #${order.id.slice(0, 8)} was successful. We're processing your order now.</p>`);
      }
    }
  } else {
    // Handle failure
    const { merchantTransactionId } = data;
    await query(`UPDATE transactions SET status = 'failed', provider_response = ? WHERE provider_transaction_id = ?`, [JSON.stringify(decodedResponse), merchantTransactionId]);
  }

  res.status(200).send('OK');
});

// Handle cases where PhonePe might still try to POST to the redirectUrl
app.post('/payment/callback', (req, res) => {
  res.redirect(303, `${process.env.APP_URL}/payment/callback`);
});

// Verify payment status (polling or redirect)
app.get('/api/payment/status/:orderId', authRequired, async (req, res) => {
  const { orderId } = req.params;
  const [order] = await query('SELECT payment_status FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ status: order.payment_status });
});

// Complaints API
app.post('/api/complaints', authRequired, async (req, res) => {
  const { order_id, utr_number, transaction_id, complaint_reason, image_url } = req.body;
  if (!order_id || !complaint_reason) return res.status(400).json({ error: 'Order ID and reason are required' });

  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    `INSERT INTO payment_complaints (id, order_id, user_id, utr_number, transaction_id, complaint_reason, image_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, order_id, req.user.id, utr_number || null, transaction_id || null, complaint_reason, image_url || null]
  );

  res.json({ id, ok: true });
});

app.get('/api/my-complaints', authRequired, async (req, res) => {
  const rows = await query('SELECT * FROM payment_complaints WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows);
});

// Admin Complaints & Transactions
app.get('/api/admin/complaints', authRequired, adminRequired, async (_req, res) => {
  const rows = await query(`
    SELECT c.*, o.total_amount, u.email as customer_email
    FROM payment_complaints c
    JOIN orders o ON c.order_id = o.id
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `);
  res.json(rows);
});

app.patch('/api/admin/complaints/:id', authRequired, adminRequired, async (req, res) => {
  const { status, admin_remarks } = req.body;
  await query('UPDATE payment_complaints SET status = ?, admin_remarks = ?, updated_at = NOW() WHERE id = ?', [status, admin_remarks, req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/transactions', authRequired, adminRequired, async (_req, res) => {
  const rows = await query(`
    SELECT t.*, o.id as order_display_id, u.email as customer_email
    FROM transactions t
    JOIN orders o ON t.order_id = o.id
    JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `);
  res.json(rows);
});

app.get('/api/invoice/:orderId', authRequired, async (req, res) => {
  const { orderId } = req.params;
  const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) return res.status(404).send('Order not found');

  // For simplicity, we'll allow admins to view any invoice, and users to view their own.
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).send('Forbidden');
  }

  const [items, [user]] = await Promise.all([
    query('SELECT * FROM order_items WHERE order_id = ?', [orderId]),
    query('SELECT * FROM users WHERE id = ?', [order.user_id])
  ]);

  const shipping = JSON.parse(order.shipping_address || '{}');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${order.id.slice(0,8)}</b></title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { margin: 0; font-size: 2.5em; color: #E6007E; }
          .details, .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .details th, .details td, .items th, .items td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .details th { background-color: #f8f8f8; width: 150px; }
          .items th { background-color: #E6007E; color: white; }
          .items .total-row td { font-weight: bold; border-top: 2px solid #333; }
          .footer { text-align: center; margin-top: 40px; font-size: 0.9em; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Devanshi Collection</h1>
            <p>Plot 47, Sector 10, Kharghar, Navi Mumbai - 410210</p>
            <p>support@devanshicollection.com</p>
          </div>
          
          <h2>Invoice #${order.id.slice(0,8)}</h2>

          <table class="details">
            <tr><th>Order ID</th><td>${order.id}</td></tr>
            <tr><th>Order Date</th><td>${new Date(order.created_at).toLocaleString()}</td></tr>
            <tr><th>Status</th><td>${order.status.toUpperCase()}</td></tr>
            <tr><th>Payment</th><td>${order.payment_status.toUpperCase()} via ${order.payment_method}</td></tr>
          </table>

          <table class="details">
            <tr><th>Billed To</th><td>
              <strong>${shipping.full_name}</strong><br>
              ${user.email}<br>
              ${shipping.address_line1}<br>
              ${shipping.city}, ${shipping.state} ${shipping.postal_code}<br>
              ${shipping.phone}
            </td></tr>
          </table>

          <table class="items">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>
                    <strong>${item.product_name}</strong><br>
                    <small>Size: ${item.size} / Color: ${item.color}</small>
                  </td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unit_price.toFixed(2)}</td>
                  <td>₹${item.total_price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">Subtotal</td>
                <td>₹${order.subtotal.toFixed(2)}</td>
              </tr>
              ${order.discount_amount > 0 ? `
                <tr>
                  <td colspan="3">Discount (${order.coupon_code})</td>
                  <td>-₹${order.discount_amount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td colspan="3">Shipping</td>
                <td>${order.shipping_amount > 0 ? `₹${order.shipping_amount.toFixed(2)}` : 'FREE'}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td>₹${order.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  res.send(html);
});

// Admin endpoints
app.get('/api/admin/stats', authRequired, adminRequired, async (_req, res) => {
  const [p, o, c, r] = await Promise.all([
    query('SELECT COUNT(*) as c FROM products'),
    query('SELECT COUNT(*) as c, COALESCE(SUM(total_amount),0) as s FROM orders'),
    query('SELECT COUNT(*) as c FROM categories'),
    query('SELECT COUNT(*) as c FROM reviews'),
  ]);
  res.json({
    products: Number(p[0].c || 0),
    orders: Number(o[0].c || 0),
    categories: Number(c[0].c || 0),
    revenue: Number(o[0].s || 0),
    reviews: Number(r[0].c || 0),
  });
});

app.get('/api/admin/orders', authRequired, adminRequired, async (_req, res) => {
  const rows = await query(`
    SELECT o.*, 
    (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'product_name', product_name, 'product_image', product_image, 'size', size, 'color', color, 'quantity', quantity, 'unit_price', unit_price)) FROM order_items WHERE order_id = o.id) as items,
    u.email as customer_email, p.first_name as customer_first_name, p.last_name as customer_last_name
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    LEFT JOIN profiles p ON o.user_id = p.user_id
    ORDER BY o.created_at DESC`);
  res.json(rows.map((o) => ({ ...o, shipping_address: safeJson(o.shipping_address), items: safeJson(o.items) })));
});

app.patch('/api/admin/orders/:id', authRequired, adminRequired, async (req, res) => {
  const { status, payment_status, tracking_number, carrier } = req.body || {};
  let updateFields = [];
  let params = [];

  if (status) { updateFields.push('status = ?'); params.push(status); }
  if (payment_status) { updateFields.push('payment_status = ?'); params.push(payment_status); }
  if (tracking_number) { updateFields.push('tracking_number = ?'); params.push(tracking_number); }
  if (carrier) { updateFields.push('carrier = ?'); params.push(carrier); }

  if (status === 'shipped') { updateFields.push('shipped_at = NOW()'); }
  if (status === 'delivered') { updateFields.push('delivered_at = NOW()'); }

  if (updateFields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.id);
  await query(`UPDATE orders SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

  const orders = await query('SELECT o.id, o.status, o.total_amount, u.email, p.first_name FROM orders o JOIN users u ON o.user_id = u.id JOIN profiles p ON o.user_id = p.user_id WHERE o.id = ?', [req.params.id]);
  const order = orders?.[0];
  if (order) {
    let emailHtml = `<h1>Order Status Updated</h1><p>Hi, ${order.first_name || 'friend'}. Your order status has been updated to: <strong>${status}</strong>.</p>`;
    if (tracking_number && carrier) {
      emailHtml += `<p>Tracking Number: <strong>${tracking_number}</strong></p><p>Carrier: <strong>${carrier}</strong></p>`;
    }
    if (status === 'delivered') {
      emailHtml += `<p>Your order has been successfully delivered. You can download your invoice from the account section.</p>`;
    }
    emailHtml += `<p>View your order details at: <a href="${APP_URL}/account">${APP_URL}/account</a></p>`;
    await sendMail(order.email, `Order #${order.id} Status Update`, emailHtml);
  }

  res.json({ ok: true });
});

app.get('/api/admin/products', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM products ORDER BY created_at DESC');
  res.json(rows.map((p) => ({ ...p, sizes: safeJson(p.sizes) || [], colors: safeJson(p.colors) || [], images: safeJson(p.images) || [] })));
});

app.post('/api/admin/products', authRequired, adminRequired, async (req, res, next) => {
  try {
    await query('SELECT 1'); // DB Ping
    const p = req.body || {};
    const id = (await query('SELECT UUID() as id'))[0].id;
    await query(
      `INSERT INTO products (id, name, slug, description, price, discount, sizes, colors, stock, sku, category_id, images, video_url, is_featured, is_trending, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p.name,
        p.slug,
        p.description || null,
        Number(p.price || 0),
        Number(p.discount || 0),
        JSON.stringify(p.sizes || []),
        JSON.stringify(p.colors || []),
        Number(p.stock || 0),
        p.sku || null,
        p.category_id || null,
        JSON.stringify(p.images || []),
        p.video_url || null,
        p.is_featured ? 1 : 0,
        p.is_trending ? 1 : 0,
        p.is_active === false ? 0 : 1,
      ]
    );
    res.json({ id });
  } catch (err) {
    console.error('[PRODUCT CREATION ERROR]', JSON.stringify(err, null, 2));
    next(err);
  }
});

app.put('/api/admin/products/:id', authRequired, adminRequired, async (req, res) => {
  const p = req.body || {};
  await query(
    `UPDATE products SET name=?, slug=?, description=?, price=?, discount=?, sizes=?, colors=?, stock=?, sku=?, category_id=?, images=?, video_url=?, is_featured=?, is_trending=?, is_active=? WHERE id=?`,
    [
      p.name,
      p.slug,
      p.description || null,
      Number(p.price || 0),
      Number(p.discount || 0),
      JSON.stringify(p.sizes || []),
      JSON.stringify(p.colors || []),
      Number(p.stock || 0),
      p.sku || null,
      p.category_id || null,
      JSON.stringify(p.images || []),
      p.video_url || null,
      p.is_featured ? 1 : 0,
      p.is_trending ? 1 : 0,
      p.is_active === false ? 0 : 1,
      req.params.id,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/categories', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM categories ORDER BY sort_order ASC');
  res.json(rows);
});

app.post('/api/admin/categories', authRequired, adminRequired, async (req, res) => {
  const c = req.body || {};
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, c.name, c.slug, c.description || null, c.image_url || null, Number(c.sort_order || 0), c.is_active === false ? 0 : 1]
  );
  res.json({ id });
});

app.put('/api/admin/categories/:id', authRequired, adminRequired, async (req, res) => {
  const c = req.body || {};
  await query(
    'UPDATE categories SET name=?, slug=?, description=?, image_url=?, sort_order=?, is_active=? WHERE id=?',
    [c.name, c.slug, c.description || null, c.image_url || null, Number(c.sort_order || 0), c.is_active === false ? 0 : 1, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/admin/categories/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/banners', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM banners ORDER BY sort_order ASC');
  res.json(rows);
});

app.post('/api/admin/banners', authRequired, adminRequired, async (req, res) => {
  const b = req.body || {};
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO banners (id, title, subtitle, image_url, link, position, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, b.title || null, b.subtitle || null, b.image_url, b.link || null, b.position || 'hero', b.is_active === false ? 0 : 1, Number(b.sort_order || 0)]
  );
  res.json({ id });
});

app.put('/api/admin/banners/:id', authRequired, adminRequired, async (req, res) => {
  const b = req.body || {};
  await query(
    'UPDATE banners SET title=?, subtitle=?, image_url=?, link=?, position=?, is_active=?, sort_order=? WHERE id=?',
    [b.title || null, b.subtitle || null, b.image_url, b.link || null, b.position || 'hero', b.is_active === false ? 0 : 1, Number(b.sort_order || 0), req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/admin/banners/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM banners WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.get('/api/admin/testimonials', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM testimonials ORDER BY sort_order ASC');
  res.json(rows);
});

app.post('/api/admin/testimonials', authRequired, adminRequired, async (req, res) => {
  const t = req.body || {};
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    'INSERT INTO testimonials (id, customer_name, city, rating, comment, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, t.customer_name, t.city || null, Number(t.rating || 5), t.comment, Number(t.sort_order || 0), t.is_active === false ? 0 : 1]
  );
  res.json({ id });
});

app.put('/api/admin/testimonials/:id', authRequired, adminRequired, async (req, res) => {
  const t = req.body || {};
  await query(
    'UPDATE testimonials SET customer_name=?, city=?, rating=?, comment=?, sort_order=?, is_active=? WHERE id=?',
    [t.customer_name, t.city || null, Number(t.rating || 5), t.comment, Number(t.sort_order || 0), t.is_active === false ? 0 : 1, req.params.id]
  );
  res.json({ ok: true });
});

app.delete('/api/admin/testimonials/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

app.put('/api/admin/site-settings', authRequired, adminRequired, async (req, res) => {
  const { announcement_text } = req.body || {};
  const existing = await query('SELECT id FROM site_settings ORDER BY created_at ASC LIMIT 1');
  if (existing?.[0]?.id) {
    await query('UPDATE site_settings SET announcement_text=? WHERE id=?', [announcement_text || null, existing[0].id]);
  } else {
    await query('INSERT INTO site_settings (id, announcement_text) VALUES (UUID(), ?)', [announcement_text || null]);
  }
  res.json({ ok: true });
});

app.get('/api/admin/chatbot-logs', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM chatbot_messages ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

// Coupons
app.get('/api/coupons', async (_req, res) => {
  const rows = await query('SELECT * FROM coupons WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())');
  res.json(rows);
});

app.post('/api/coupons/validate', async (req, res) => {
  const { code, amount } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Code required' });

  const rows = await query('SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1', [String(code).toUpperCase()]);
  const c = rows?.[0];

  if (!c) return res.status(404).json({ error: 'Invalid or expired coupon' });
  if (c.max_uses && c.used_count >= c.max_uses) return res.status(400).json({ error: 'Coupon usage limit reached' });
  if (amount && Number(amount) < Number(c.min_order_amount)) return res.status(400).json({ error: `Min order amount is ${c.min_order_amount}` });

  res.json(c);
});

// Search
app.get('/api/search', async (req, res) => {
  const { q, user_id } = req.query;
  const queryStr = String(q || '').trim();

  if (queryStr) {
    // Record search history
    const historyId = (await query('SELECT UUID() as id'))[0].id;
    await query(`
      INSERT INTO search_history (id, user_id, query, count)
      VALUES (?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE count = count + 1, updated_at = NOW()
    `, [historyId, user_id || null, queryStr]);

    const products = await query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)
      ORDER BY p.created_at DESC
    `, [`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`]);

    return res.json({
      products: products.map((p) => ({
        ...p,
        sizes: safeJson(p.sizes) || [],
        colors: safeJson(p.colors) || [],
        images: safeJson(p.images) || [],
      }))
    });
  }

  // Popular searches
  const popular = await query('SELECT query, COUNT(*) as total FROM search_history GROUP BY query ORDER BY total DESC LIMIT 5');

  // Recent searches for user
  let recent = [];
  if (user_id) {
    recent = await query('SELECT query FROM search_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5', [user_id]);
  }

  // Popular categories
  const categories = await query('SELECT name, slug, image_url FROM categories WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 5');

  res.json({ popular: popular.map(s => s.query), recent: recent.map(s => s.query), categories });
});

app.get('/api/admin/coupons', authRequired, adminRequired, async (_req, res) => {
  const rows = await query('SELECT * FROM coupons ORDER BY created_at DESC');
  res.json(rows);
});

app.post('/api/admin/coupons', authRequired, adminRequired, async (req, res) => {
  const c = req.body || {};
  const id = (await query('SELECT UUID() as id'))[0].id;
  await query(
    `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, expires_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(c.code || '').toUpperCase(),
      c.description || null,
      c.discount_type || 'percentage',
      Number(c.discount_value || 0),
      Number(c.min_order_amount || 0),
      c.max_uses ? Number(c.max_uses) : null,
      Number(c.used_count || 0),
      c.expires_at ? new Date(c.expires_at) : null,
      c.is_active === false ? 0 : 1,
    ]
  );
  res.json({ id });
});

app.put('/api/admin/coupons/:id', authRequired, adminRequired, async (req, res) => {
  const c = req.body || {};
  await query(
    `UPDATE coupons SET code=?, description=?, discount_type=?, discount_value=?, min_order_amount=?, max_uses=?, expires_at=?, is_active=? WHERE id=?`,
    [
      String(c.code || '').toUpperCase(),
      c.description || null,
      c.discount_type || 'percentage',
      Number(c.discount_value || 0),
      Number(c.min_order_amount || 0),
      c.max_uses ? Number(c.max_uses) : null,
      c.expires_at ? new Date(c.expires_at) : null,
      c.is_active === false ? 0 : 1,
      req.params.id,
    ]
  );
  res.json({ ok: true });
});

app.delete('/api/admin/coupons/:id', authRequired, adminRequired, async (req, res) => {
  await query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// Serve frontend (Hostinger Node app)
app.use(express.static(distDir));
app.get('*', (req, res) => {
  // Allow API routes to 404 if reached here
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(distDir, 'index.html'));
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

const port = Number(process.env.PORT || 4000);

app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

async function start() {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});