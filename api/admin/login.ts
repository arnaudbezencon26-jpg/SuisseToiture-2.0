import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password } = req.body;
  const pool = getPool();

  try {
    const result = await pool.query(
      `SELECT admin_password FROM settings LIMIT 1`
    );
    if (result.rows.length === 0) {
      return res.json({ success: false });
    }
    const valid = result.rows[0].admin_password === password;
    res.json({ success: valid });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
