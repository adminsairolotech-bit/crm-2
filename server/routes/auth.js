import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || 'sai-rolotech-crm-secret-2024';

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const { data: users, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('app_users')
      .insert([{ username, password_hash: passwordHash, name, email, phone, role: role || 'admin' }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      console.error('[auth/register]', error);
      return res.status(500).json({ error: 'Registration failed' });
    }

    const { password_hash, ...safeUser } = data;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, username, name, email, phone, role, avatar_url, is_active, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, name, email, phone, role, avatar_url, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) { console.error('[auth/users]', error); return res.status(500).json({ error: 'Failed to fetch users' }); }
    res.json({ success: true, users: data });
  } catch (err) {
    console.error('[auth/users]', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
