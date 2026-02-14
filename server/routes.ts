import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : false,
      max: 5,
    });
  }
  return pool;
}

async function verifyPassword(dbPool: pg.Pool, password: string): Promise<boolean> {
  const result = await dbPool.query(`SELECT admin_password FROM settings LIMIT 1`);
  if (result.rows.length === 0) return false;
  return result.rows[0].admin_password === password;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/quotes", async (req, res) => {
    const dbPool = getPool();
    const { project_type, service, sub_services, superficie, nom, prenom, rue, numero, code_postal, ville, adresse, email, telephone, whatsapp } = req.body;

    try {
      const result = await dbPool.query(
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
  });

  app.post("/api/admin/login", async (req, res) => {
    const dbPool = getPool();
    const { password } = req.body;

    try {
      const valid = await verifyPassword(dbPool, password);
      res.json({ success: valid });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/admin/quotes", async (req, res) => {
    const dbPool = getPool();
    const { password } = req.body;

    if (!await verifyPassword(dbPool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await dbPool.query(`SELECT * FROM quotes ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Get quotes error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/quotes", async (req, res) => {
    const dbPool = getPool();
    const { password, id, status, notes } = req.body;

    if (!await verifyPassword(dbPool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await dbPool.query(
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
  });

  app.post("/api/admin/settings", async (req, res) => {
    const dbPool = getPool();
    const { password } = req.body;

    if (!await verifyPassword(dbPool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      const result = await dbPool.query(
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
  });

  app.patch("/api/admin/settings", async (req, res) => {
    const dbPool = getPool();
    const { password, type, ...data } = req.body;

    if (!await verifyPassword(dbPool, password)) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    try {
      if (type === 'password') {
        const { currentPassword, newPassword } = data;
        const check = await dbPool.query(`SELECT admin_password FROM settings LIMIT 1`);
        if (check.rows.length === 0 || check.rows[0].admin_password !== currentPassword) {
          return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
        }
        await dbPool.query(`UPDATE settings SET admin_password = $1, updated_at = NOW()`, [newPassword]);
        res.json({ success: true });
      } else if (type === 'email') {
        const { adminEmail } = data;
        await dbPool.query(`UPDATE settings SET admin_email = $1, updated_at = NOW()`, [adminEmail || null]);
        res.json({ success: true });
      } else if (type === 'templates') {
        const { clientTemplate, adminTemplate } = data;
        await dbPool.query(
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
  });

  app.post("/api/send-email", async (req, res) => {
    const { clientEmail, clientName, quoteData } = req.body;

    const smtpHost = process.env.SMTP_HOST || "mail.infomaniak.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;
    const smtpFrom = adminEmail || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP not configured, skipping email send");
      return res.json({ success: false, message: "SMTP non configuré" });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const serviceLabels: Record<string, string> = { toiture: "Toiture", facade: "Façade", terrasse: "Terrasse" };
    const projectLabels: Record<string, string> = { maison: "Maison", immeuble: "Immeuble", autre: "Autre" };

    const replaceVars = (template: string, data: any) => {
      return template
        .replace(/\{\{prenom\}\}/g, data.prenom || "")
        .replace(/\{\{nom\}\}/g, data.nom || "")
        .replace(/\{\{projectType\}\}/g, projectLabels[data.projectType] || data.projectType)
        .replace(/\{\{service\}\}/g, serviceLabels[data.service] || data.service)
        .replace(/\{\{superficie\}\}/g, String(data.superficie || ""))
        .replace(/\{\{adresse\}\}/g, data.adresse || "")
        .replace(/\{\{email\}\}/g, data.email || "")
        .replace(/\{\{telephone\}\}/g, data.telephone || "");
    };

    const clientTemplate = quoteData.clientEmailTemplate || `<h2>Confirmation de votre demande de devis</h2>
<p>Bonjour {{prenom}} {{nom}},</p>
<p>Nous avons bien reçu votre demande de devis pour votre projet de type <strong>{{projectType}}</strong>.</p>
<p><strong>Détails de votre demande :</strong></p>
<ul><li>Service : {{service}}</li><li>Superficie : {{superficie}} m²</li><li>Adresse : {{adresse}}</li></ul>
<p>Nous vous contacterons dans les plus brefs délais.</p>
<p>Cordialement,<br>L'équipe SuisseToiture</p>`;

    const adminTemplate = quoteData.adminEmailTemplate || `<h2>Nouvelle demande de devis</h2>
<p>Une nouvelle demande de devis a été reçue :</p>
<p><strong>Client :</strong> {{prenom}} {{nom}}<br>
<strong>Email :</strong> {{email}}<br>
<strong>Téléphone :</strong> {{telephone}}</p>
<p><strong>Détails du projet :</strong></p>
<ul><li>Type : {{projectType}}</li><li>Service : {{service}}</li><li>Superficie : {{superficie}} m²</li><li>Adresse : {{adresse}}</li></ul>`;

    try {
      const emailPromises = [];

      if (clientEmail) {
        emailPromises.push(
          transporter.sendMail({
            from: `"SuisseToiture" <${smtpFrom}>`,
            to: clientEmail,
            subject: "SuisseToiture - Confirmation de votre demande de devis",
            html: replaceVars(clientTemplate, { ...quoteData, email: clientEmail, nom: clientName?.split(" ").pop() || "", prenom: clientName?.split(" ")[0] || "" }),
          })
        );
      }

      const targetAdminEmail = adminEmail || quoteData.adminEmail;
      if (targetAdminEmail) {
        emailPromises.push(
          transporter.sendMail({
            from: `"SuisseToiture" <${smtpFrom}>`,
            to: targetAdminEmail,
            subject: `Nouveau devis - ${clientName || "Client"} - ${serviceLabels[quoteData.service] || quoteData.service}`,
            html: replaceVars(adminTemplate, { ...quoteData, email: clientEmail, nom: clientName?.split(" ").pop() || "", prenom: clientName?.split(" ")[0] || "" }),
          })
        );
      }

      await Promise.all(emailPromises);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Email send error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
