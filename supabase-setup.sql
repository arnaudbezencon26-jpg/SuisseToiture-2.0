-- SQL à exécuter dans Supabase SQL Editor
-- SuisseToiture - Schema complet avec sécurité

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

-- Politique pour les devis : tout le monde peut insérer uniquement
CREATE POLICY "Allow anonymous insert" ON quotes FOR INSERT WITH CHECK (true);

-- Politique pour les paramètres : aucun accès direct anonyme
-- Toutes les opérations passent par des fonctions RPC sécurisées

-- ============================================
-- Fonctions RPC sécurisées (SECURITY DEFINER)
-- ============================================

-- Vérifier le mot de passe admin (ne renvoie jamais le mot de passe)
CREATE OR REPLACE FUNCTION verify_admin_password(input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_password TEXT;
BEGIN
  SELECT admin_password INTO stored_password FROM settings LIMIT 1;
  IF stored_password IS NULL THEN
    RETURN (input_password = '123456');
  END IF;
  RETURN (stored_password = input_password);
END;
$$;

-- Récupérer les paramètres sans le mot de passe
CREATE OR REPLACE FUNCTION get_admin_settings(input_password TEXT)
RETURNS TABLE(
  id INTEGER,
  admin_email VARCHAR,
  client_email_template TEXT,
  admin_email_template TEXT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(input_password) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  RETURN QUERY SELECT s.id, s.admin_email, s.client_email_template, s.admin_email_template, s.updated_at FROM settings s LIMIT 1;
END;
$$;

-- Modifier le mot de passe admin
CREATE OR REPLACE FUNCTION update_admin_password(current_password TEXT, new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(current_password) THEN
    RAISE EXCEPTION 'Mot de passe actuel incorrect';
  END IF;
  IF LENGTH(new_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit contenir au moins 6 caractères';
  END IF;
  UPDATE settings SET admin_password = new_password, updated_at = NOW();
  RETURN TRUE;
END;
$$;

-- Mettre à jour l'email admin
CREATE OR REPLACE FUNCTION update_admin_email(input_password TEXT, new_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(input_password) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  UPDATE settings SET admin_email = new_email, updated_at = NOW();
  RETURN TRUE;
END;
$$;

-- Mettre à jour les templates email
CREATE OR REPLACE FUNCTION update_email_templates(input_password TEXT, new_client_template TEXT, new_admin_template TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(input_password) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  UPDATE settings SET client_email_template = new_client_template, admin_email_template = new_admin_template, updated_at = NOW();
  RETURN TRUE;
END;
$$;

-- Récupérer les devis (admin uniquement)
CREATE OR REPLACE FUNCTION get_quotes(input_password TEXT)
RETURNS SETOF quotes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(input_password) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  RETURN QUERY SELECT * FROM quotes ORDER BY created_at DESC;
END;
$$;

-- Mettre à jour un devis (admin uniquement)
CREATE OR REPLACE FUNCTION update_quote(input_password TEXT, quote_id INTEGER, new_status TEXT, new_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT verify_admin_password(input_password) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  UPDATE quotes SET status = new_status, notes = new_notes, updated_at = NOW() WHERE id = quote_id;
  RETURN TRUE;
END;
$$;
