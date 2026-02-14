import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pool = getPool();

  if (req.method === 'POST') {
    const { project_type, service, sub_services, superficie, nom, prenom, rue, numero, code_postal, ville, adresse, email, telephone, whatsapp } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO quotes (project_type, service, sub_services, superficie, nom, prenom, rue, numero, code_postal, ville, adresse, email, telephone, whatsapp, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'en_attente', NOW(), NOW())
         RETURNING *`,
        [project_type, service, sub_services, superficie, nom, prenom, rue, numero, code_postal, ville, adresse, email, telephone, whatsapp]
      );
      res.json({ success: true, quote: result.rows[0] });
    } catch (error: any) {
      console.error('Create quote error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
