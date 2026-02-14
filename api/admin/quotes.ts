import type { VercelRequest, VercelResponse } from '@vercel/node';
import pg from 'pg';
const { Pool } = pg;

let pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 5 });
  }
  return pool;
}

async function verifyPassword(db: pg.Pool, password: string): Promise<boolean> {
  const result = await db.query(`SELECT admin_password FROM settings LIMIT 1`);
  if (result.rows.length === 0) return false;
  return result.rows[0].admin_password === password;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = getPool();

  if (req.method === 'POST') {
    const { password } = req.body;
    if (!await verifyPassword(db, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await db.query(`SELECT * FROM quotes ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Get quotes error:', error);
      res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PATCH') {
    const { password, id, status, notes } = req.body;
    if (!await verifyPassword(db, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await db.query(
        `UPDATE quotes SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [status, notes || null, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Devis non trouvé' });
      }
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Update quote error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
