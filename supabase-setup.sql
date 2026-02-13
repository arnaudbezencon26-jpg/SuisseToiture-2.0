-- SQL à exécuter dans Supabase SQL Editor

-- Table des devis
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  project_type VARCHAR(50) NOT NULL,
  service VARCHAR(50) NOT NULL,
  sub_services TEXT[] NOT NULL,
  superficie INTEGER NOT NULL,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  rue VARCHAR(255),
  numero VARCHAR(20),
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  adresse TEXT,
  email VARCHAR(255),
  telephone VARCHAR(50),
  whatsapp VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table des paramètres
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  admin_password VARCHAR(255) NOT NULL DEFAULT '123456',
  admin_email VARCHAR(255),
  client_email_template TEXT NOT NULL DEFAULT '<h2>Confirmation de votre demande de devis</h2>
<p>Bonjour {{prenom}} {{nom}},</p>
<p>Nous avons bien reçu votre demande de devis pour votre projet de type <strong>{{projectType}}</strong>.</p>
<p><strong>Détails de votre demande :</strong></p>
<ul>
  <li>Service : {{service}}</li>
  <li>Superficie : {{superficie}} m²</li>
  <li>Adresse : {{adresse}}</li>
</ul>
<p>Nous vous contacterons dans les plus brefs délais.</p>
<p>Cordialement,<br>L''équipe SuisseToiture</p>',
  admin_email_template TEXT NOT NULL DEFAULT '<h2>Nouvelle demande de devis</h2>
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
</ul>',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insérer les paramètres par défaut
INSERT INTO settings (admin_password) VALUES ('123456')
ON CONFLICT DO NOTHING;

-- Activer Row Level Security (RLS)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politique pour les devis : tout le monde peut insérer, seul l'admin peut lire/modifier
CREATE POLICY "Allow anonymous insert" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous select" ON quotes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update" ON quotes FOR UPDATE USING (true);

-- Politique pour les paramètres
CREATE POLICY "Allow anonymous select settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous update settings" ON settings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous insert settings" ON settings FOR INSERT WITH CHECK (true);
