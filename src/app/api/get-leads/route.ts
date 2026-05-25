import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companySlug = url.searchParams.get('companySlug');

    if (!companySlug) {
      return NextResponse.json({ error: "Missing companySlug parameter." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const browserRefreshToken = cookieStore.get('google_refresh_token')?.value;
    const browserAccessToken = cookieStore.get('google_access_token')?.value;

    // Dynamic Sheet ID Lookup
    const dbPath = path.join(process.cwd(), 'data', 'admins.json');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: "Admin database not initialized." }, { status: 500 });
    }
    
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const adminConfig = db.admins.find((a: any) => a.slug === companySlug);
    
    if (!adminConfig || !adminConfig.sheetId) {
      return NextResponse.json({ error: `No connected Google Sheet found for company '${companySlug}'.` }, { status: 404 });
    }
    
    let sheetId = adminConfig.sheetId;
    if (sheetId.includes('/d/')) {
      sheetId = sheetId.split('/d/')[1].split('/')[0];
    }

    // STRICT AUTHENTICATION: Delegate to Google
    // We attempt to access the spreadsheet using ONLY the credentials present in the user's browser cookies.
    // If they are a public user, they won't have tokens, or their tokens won't have permission to read the Admin's sheet.
    if (!browserAccessToken && !browserRefreshToken) {
       return NextResponse.json({ error: "Unauthorized. Please sign in as Admin to view this dashboard." }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: browserAccessToken,
      refresh_token: browserRefreshToken
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
      return NextResponse.json({ leads: [] });
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
    return NextResponse.json({ leads: leads.reverse(), companyName: adminConfig.companyName });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
