/**
 * Admin Panel API — Control Panel endpoints
 * Auth: Bearer ADMIN_API_TOKEN header required on all protected routes
 */
import express from 'express';
import {
  getConfig, updateConfig, resetConfig,
  getErrorLogs, clearErrorLogs, logError,
  getStats, setLeadCount,
} from '../services/configService.js';

const router = express.Router();

// ─── Auth middleware ─────────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const TOKEN = process.env.ADMIN_API_TOKEN;
  if (!TOKEN) return res.status(503).json({ error: 'ADMIN_API_TOKEN not configured on server' });
  const bearer =
    req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-admin-token'];
  if (!bearer || bearer !== TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ─── POST /api/admin/verify ──────────────────────────────────────────────────
router.post('/api/admin/verify', express.json(), (req, res) => {
  const TOKEN = process.env.ADMIN_API_TOKEN;
  if (!TOKEN) return res.status(503).json({ error: 'ADMIN_API_TOKEN not configured' });
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Token required' });
  if (token === TOKEN) return res.json({ success: true });
  return res.status(401).json({ error: 'Invalid token' });
});

// ─── GET /api/admin/config ───────────────────────────────────────────────────
router.get('/api/admin/config', adminAuth, (_req, res) => {
  res.json(getConfig());
});

// ─── PATCH /api/admin/config ─────────────────────────────────────────────────
router.patch('/api/admin/config', adminAuth, express.json(), (req, res) => {
  try {
    const updated = updateConfig(req.body || {});
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─── POST /api/admin/config/reset ────────────────────────────────────────────
router.post('/api/admin/config/reset', adminAuth, (_req, res) => {
  res.json(resetConfig());
});

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
router.get('/api/admin/stats', adminAuth, async (req, res) => {
  // Live lead count
  try {
    const { getAll } = await import('../models/leadModel.js');
    setLeadCount(getAll().length);
  } catch (_) {}

  res.json({
    stats: getStats(),
    config: getConfig(),
    env: {
      whatsapp: !!process.env.WHATSAPP_ACCESS_TOKEN,
      fcm: !!process.env.FCM_SERVER_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      adminToken: !!process.env.ADMIN_API_TOKEN,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// ─── GET /api/admin/logs ─────────────────────────────────────────────────────
router.get('/api/admin/logs', adminAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const logs = getErrorLogs(limit);
  res.json({ logs, total: getErrorLogs(200).length });
});

// ─── DELETE /api/admin/logs ───────────────────────────────────────────────────
router.delete('/api/admin/logs', adminAuth, (_req, res) => {
  clearErrorLogs();
  res.json({ success: true, message: 'All logs cleared' });
});

// ─── POST /api/admin/logs/test ────────────────────────────────────────────────
router.post('/api/admin/logs/test', adminAuth, (_req, res) => {
  logError('AdminPanel', 'Test error entry — manual trigger from Control Panel', 'This is a test log to verify the error tracking system is working correctly.');
  res.json({ success: true, message: 'Test log entry added' });
});

export default router;
