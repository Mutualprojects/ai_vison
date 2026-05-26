import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { getAdminsDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const browserAccessToken = cookieStore.get('google_access_token')?.value;
    const browserRefreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!browserAccessToken && !browserRefreshToken) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const db = await getAdminsDb();
    
    // Find the admin configuration that belongs to this logged-in user
    // We match by accessToken or refreshToken
    const adminConfig = db.admins.find((a: any) => 
      (a.accessToken && a.accessToken === browserAccessToken) || 
      (a.refreshToken && a.refreshToken === browserRefreshToken)
    );

    if (!adminConfig || !adminConfig.sheetId) {
      return NextResponse.json({ error: "No scanner configured. Please configure your scanner first." }, { status: 404 });
    }

    let sheetId = adminConfig.sheetId;
    if (sheetId.includes('/d/')) {
      sheetId = sheetId.split('/d/')[1].split('/')[0];
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: browserAccessToken || adminConfig.accessToken,
      refresh_token: browserRefreshToken || adminConfig.refreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Fetch the first sheet name
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    const firstSheetName = sheetMetadata.data.sheets?.[0]?.properties?.title || 'Sheet1';

    // Fetch the data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${firstSheetName}'!A:Z`,
    });

    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      return NextResponse.json({ leads: [], companyName: adminConfig.companyName });
    }

    const headers = rows[0];
    const leads = rows.slice(1).map((row) => {
      let leadObj: any = {};
      headers.forEach((header: string, index: number) => {
        leadObj[header] = row[index] || '';
      });
      return leadObj;
    });

    // Reverse so newest is first
    return NextResponse.json({ 
      leads: leads.reverse(), 
      companyName: adminConfig.companyName,
      slug: adminConfig.slug 
    });
  } catch (error: any) {
    console.error('Error fetching admin leads:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
