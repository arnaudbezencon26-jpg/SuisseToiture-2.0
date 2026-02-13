import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export type QuoteRow = {
  id: number;
  project_type: string;
  service: string;
  sub_services: string[];
  superficie: number;
  nom: string | null;
  prenom: string | null;
  rue: string | null;
  numero: string | null;
  code_postal: string | null;
  ville: string | null;
  adresse: string | null;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: number;
  projectType: string;
  service: string;
  subServices: string[];
  superficie: number;
  nom: string | null;
  prenom: string | null;
  rue: string | null;
  numero: string | null;
  codePostal: string | null;
  ville: string | null;
  adresse: string | null;
  email: string | null;
  telephone: string | null;
  whatsapp: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function rowToQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    projectType: row.project_type,
    service: row.service,
    subServices: row.sub_services,
    superficie: row.superficie,
    nom: row.nom,
    prenom: row.prenom,
    rue: row.rue,
    numero: row.numero,
    codePostal: row.code_postal,
    ville: row.ville,
    adresse: row.adresse,
    email: row.email,
    telephone: row.telephone,
    whatsapp: row.whatsapp,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type Settings = {
  id: number;
  adminEmail: string | null;
  clientEmailTemplate: string;
  adminEmailTemplate: string;
  updatedAt: string;
};

export function rowToSettings(row: { id: number; admin_email: string | null; client_email_template: string; admin_email_template: string; updated_at: string }): Settings {
  return {
    id: row.id,
    adminEmail: row.admin_email,
    clientEmailTemplate: row.client_email_template,
    adminEmailTemplate: row.admin_email_template,
    updatedAt: row.updated_at,
  };
}

export function getAdminPassword(): string {
  return sessionStorage.getItem('admin_pwd') || '';
}

export function setAdminPassword(pwd: string): void {
  sessionStorage.setItem('admin_pwd', pwd);
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem('admin_pwd');
}
