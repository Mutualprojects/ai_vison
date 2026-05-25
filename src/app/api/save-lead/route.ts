import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAdminBySlug } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, phone, website, companySlug } = body;

    const serviceKeyString = process.env.GOOGLE_SERVICE_KEY;
    if (!serviceKeyString) {
      return NextResponse.json({ error: "Google Sheets service key is missing." }, { status: 500 });
    }

    if (!companySlug) {
      return NextResponse.json({ error: "Missing companySlug parameter. Cannot determine which Google Sheet to save to." }, { status: 400 });
    }

    // Dynamic Sheet ID & OAuth Token Lookup via Universal DB
    const adminConfig = await getAdminBySlug(companySlug);
    
    if (!adminConfig || !adminConfig.sheetId) {
      return NextResponse.json({ error: `No connected Google Sheet found for company '${companySlug}'. Please ask the admin to configure it.` }, { status: 404 });
    }
    
    if (!adminConfig.refreshToken && !adminConfig.accessToken) {
      return NextResponse.json({ error: `The admin for '${companySlug}' has not authenticated with Google. Please ask them to reconnect.` }, { status: 401 });
    }

    // Safely extract the Sheet ID just in case the admin pasted the entire URL instead of just the ID
    let sheetId = adminConfig.sheetId;
    if (sheetId.includes('/d/')) {
      sheetId = sheetId.split('/d/')[1].split('/')[0];
    }

    // Authenticate with the Admin's Google OAuth Credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: adminConfig.accessToken,
      refresh_token: adminConfig.refreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // PRO UX: Dynamically fetch the real name of the first sheet to prevent "Requested entity was not found" errors
    // (In case the Admin's Google account is not in English, so it's not named 'Sheet1')
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    const firstSheetName = sheetMetadata.data.sheets?.[0]?.properties?.title || 'Sheet1';

    // DEDUPLICATION: Fetch existing leads to check if this lead already exists
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${firstSheetName}'!A:Z`,
    });

    const rows = existingData.data.values || [];
    let isDuplicate = false;

    if (rows.length > 1) {
      // Find which columns contain Email and Phone
      const headers = rows[0];
      const emailIndex = headers.findIndex((h: string) => h.toLowerCase().includes('email'));
      const phoneIndex = headers.findIndex((h: string) => h.toLowerCase().includes('phone'));

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowEmail = emailIndex >= 0 ? row[emailIndex] : null;
        const rowPhone = phoneIndex >= 0 ? row[phoneIndex] : null;

        // Check if email matches
        if (email && rowEmail && rowEmail.toLowerCase().trim() === email.toLowerCase().trim()) {
          isDuplicate = true;
          break;
        }
        
        // If no email exists, fallback to checking if phone matches exactly
        if (!email && phone && rowPhone) {
           const cleanInputPhone = phone.replace(/\D/g, '');
           const cleanRowPhone = rowPhone.replace(/\D/g, '');
           if (cleanInputPhone.length > 5 && cleanInputPhone === cleanRowPhone) {
             isDuplicate = true;
             break;
           }
        }
      }
    }

    if (isDuplicate) {
      return NextResponse.json({ 
        success: true, 
        exists: true, 
        message: 'This lead is already in your database. Thank you!' 
      });
    }

    // Append the lead to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `'${firstSheetName}'!A:F`, 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            new Date().toLocaleString(), // Date added
            name || '',
            company || '',
            email || '',
            phone || '',
            website || ''
          ]
        ],
      },
    });

    return NextResponse.json({ success: true, message: 'Lead successfully saved to CRM!', data: response.data });
  } catch (error: any) {
    console.error('Error saving to Google Sheets:', error);
    return NextResponse.json({ error: error.message || 'Failed to save lead' }, { status: 500 });
  }
}
