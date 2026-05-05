import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export function authRequired(req, res, next) {
  console.log('Auth middleware triggered');
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    console.log('Auth failed: No token');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth success', req.user);
    next();
  } catch (err) {
    console.log('Auth failed: Invalid token', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function adminRequired(req, res, next) {
  console.log('Admin middleware triggered');
  if (!req.user || req.user.role !== 'admin') {
    console.log('Admin auth failed', req.user);
    return res.status(403).json({ error: 'Forbidden' });
  }
  console.log('Admin auth success');
  next();
}

export async function verifyPassword(email, password) {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows?.[0];
  if (!user || !user.password_hash) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

