import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { wrap } from '../util/wrap.js';

const router = Router();
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, degree: u.degree, yearOfStudy: u.year_of_study });

router.post('/register', wrap(async (req, res) => {
  const { email, password, name, degree, yearOfStudy } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const exists = await query('select 1 from users where email = $1', [email.toLowerCase()]);
  if (exists.rowCount) return res.status(409).json({ error: 'That email is already registered' });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    'insert into users(email,password_hash,name,degree,year_of_study) values($1,$2,$3,$4,$5) returning *',
    [email.toLowerCase(), hash, name, degree || null, yearOfStudy || null]);
  res.json({ token: signToken(rows[0]), user: publicUser(rows[0]) });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const { rows } = await query('select * from users where email = $1', [(email || '').toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', requireAuth, wrap(async (req, res) => {
  const { rows } = await query('select * from users where id = $1', [req.user.id]);
  if (!rows[0]) return res.status(401).json({ error: 'Please log in' });
  res.json({ user: publicUser(rows[0]) });
}));

export default router;
