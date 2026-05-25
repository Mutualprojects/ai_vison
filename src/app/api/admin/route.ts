import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'admins.json');

// Helper to get local DB
function getAdminsDb() {
  if (!fs.existsSync(dbPath)) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify({ admins: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export async function POST(req: Request) {
  try {
    const { companyName, sheetId } = await req.json();

    if (!companyName || !sheetId) {
      return NextResponse.json({ error: "Missing company name or sheet ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated with Google. Please sign in first." }, { status: 401 });
    }

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const db = getAdminsDb();

    // Check if exists, update if it does
    const existingIndex = db.admins.findIndex((a: any) => a.slug === slug);
    if (existingIndex >= 0) {
      db.admins[existingIndex].sheetId = sheetId;
      db.admins[existingIndex].accessToken = accessToken;
      if (refreshToken) db.admins[existingIndex].refreshToken = refreshToken;
    } else {
      db.admins.push({
        slug,
        companyName,
        sheetId,
        accessToken,
        refreshToken,
        createdAt: new Date().toISOString()
      });
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ 
      success: true, 
      slug, 
      publicUrl: `/scan/${slug}` 
    });

  } catch (error: any) {
    console.error('Error saving admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
    const db = getAdminsDb();
    return NextResponse.json(db.admins);
}
