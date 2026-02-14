import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';

async function verifyPassword(pool: any, password: string): Promise<boolean> {
  const result = await pool.query(`SELECT admin_password FROM settings LIMIT 1`);
  if (result.rows.length === 0) return false;
  return result.rows[0].admin_password === password;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  if (req.method === 'POST') {
    const { password } = req.body;
    if (!await verifyPassword(pool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await pool.query(
        `SELECT id, admin_email, client_email_template, admin_email_template, updated_at FROM settings LIMIT 1`
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Paramètres non trouvés' });
      }
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PATCH') {
    const { password, type, ...data } = req.body;
    if (!await verifyPassword(pool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      if (type === 'password') {
        const { currentPassword, newPassword } = data;
        const check = await pool.query(`SELECT admin_password FROM settings LIMIT 1`);
        if (check.rows.length === 0 || check.rows[0].admin_password !== currentPassword) {
          return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }
        await pool.query(`UPDATE settings SET admin_password = $1, updated_at = NOW()`, [newPassword]);
        res.json({ success: true });
      } else if (type === 'email') {
        const { adminEmail } = data;
        await pool.query(`UPDATE settings SET admin_email = $1, updated_at = NOW()`, [adminEmail || null]);
        res.json({ success: true });
      } else if (type === 'templates') {
        const { clientTemplate, adminTemplate } = data;
        await pool.query(
          `UPDATE settings SET client_email_template = $1, admin_email_template = $2, updated_at = NOW()`,
          [clientTemplate, adminTemplate]
        );
        res.json({ success: true });
      } else {
        res.status(400).json({ message: 'Type de mise à jour invalide' });
      }
    } catch (error: any) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
