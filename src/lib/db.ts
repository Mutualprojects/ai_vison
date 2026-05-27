import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

const isProd = process.env.NODE_ENV === 'production';
const dbDir = isProd ? '/tmp/data' : path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'admins.json');

// Interface for what an Admin looks like
export interface AdminConfig {
  slug: string;
  companyName: string;
  sheetId: string;
  accessToken: string;
  refreshToken?: string;
  createdAt: string;
}

/**
 * Automatically chooses between Vercel KV (Production) and local JSON (Development)
 */
export async function getAdminsDb(): Promise<{ admins: AdminConfig[] }> {
  // If Vercel KV is connected, use it!
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const data = await kv.get<{ admins: AdminConfig[] }>('admins_db');
      return data || { admins: [] };
    } catch (e) {
      console.error("Vercel KV Read Error:", e);
      return { admins: [] };
    }
  }

  // Otherwise, fallback to local JSON file for localhost
  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify({ admins: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export async function saveAdminsDb(db: { admins: AdminConfig[] }): Promise<void> {
  // If Vercel KV is connected, use it!
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set('admins_db', db);
      return;
    } catch (e) {
      console.error("Vercel KV Write Error:", e);
    }
  }

  // Otherwise, fallback to local JSON file
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export async function getAdminBySlug(slug: string): Promise<AdminConfig | null> {
  // Single-Tenant Override check first
  if (process.env.ADMIN_REFRESH_TOKEN && process.env.ADMIN_SHEET_ID) {
    return {
      slug: slug,
      companyName: "Single Tenant",
      sheetId: process.env.ADMIN_SHEET_ID,
      accessToken: '',
      refreshToken: process.env.ADMIN_REFRESH_TOKEN,
      createdAt: new Date().toISOString()
    };
  }

  const db = await getAdminsDb();
  return db.admins.find(a => a.slug === slug) || null;
}
