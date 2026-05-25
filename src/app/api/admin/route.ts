import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminsDb, saveAdminsDb } from '@/lib/db';

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
    const db = await getAdminsDb();

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

    await saveAdminsDb(db);

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


