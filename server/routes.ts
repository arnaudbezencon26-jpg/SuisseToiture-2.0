import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/send-email", async (req, res) => {
    const { clientEmail, clientName, quoteData } = req.body;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("SMTP not configured, skipping email send");
      return res.json({ success: false, message: "SMTP non configuré" });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const serviceLabels: Record<string, string> = {
      toiture: "Toiture",
      facade: "Façade",
      terrasse: "Terrasse",
    };

    const projectLabels: Record<string, string> = {
      maison: "Maison",
      immeuble: "Immeuble",
      autre: "Autre",
    };

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
<ul>
  <li>Service : {{service}}</li>
  <li>Superficie : {{superficie}} m²</li>
  <li>Adresse : {{adresse}}</li>
</ul>
<p>Nous vous contacterons dans les plus brefs délais.</p>
<p>Cordialement,<br>L'équipe SuisseToiture</p>`;

    const adminTemplate = quoteData.adminEmailTemplate || `<h2>Nouvelle demande de devis</h2>
<p>Une nouvelle demande de devis a été reçue :</p>
<p><strong>Client :</strong> {{prenom}} {{nom}}<br>
<strong>Email :</strong> {{email}}<br>
<strong>Téléphone :</strong> {{telephone}}</p>
<p><strong>Détails du projet :</strong></p>
<ul>
  <li>Type : {{projectType}}</li>
  <li>Service : {{service}}</li>
  <li>Superficie : {{superficie}} m²</li>
  <li>Adresse : {{adresse}}</li>
</ul>`;

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
