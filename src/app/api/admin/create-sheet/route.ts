import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export async function POST(req: Request) {
  try {
    const { companyName } = await req.json();

    if (!companyName) {
      return NextResponse.json({ error: "Missing company name" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated with Google." }, { status: 401 });
    }

    // Authenticate with the Admin's Google OAuth Credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Automatically create a brand new Google Sheet specifically for this LeadScanner
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `LeadScanner CRM - ${companyName}`,
        },
        sheets: [
          {
            properties: { title: "Leads" },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "Date Captured" }, userEnteredFormat: { textFormat: { bold: true } } },
                      { userEnteredValue: { stringValue: "Name" }, userEnteredFormat: { textFormat: { bold: true } } },
                      { userEnteredValue: { stringValue: "Company" }, userEnteredFormat: { textFormat: { bold: true } } },
                      { userEnteredValue: { stringValue: "Email" }, userEnteredFormat: { textFormat: { bold: true } } },
                      { userEnteredValue: { stringValue: "Phone" }, userEnteredFormat: { textFormat: { bold: true } } },
                      { userEnteredValue: { stringValue: "Website" }, userEnteredFormat: { textFormat: { bold: true } } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    });

    return NextResponse.json({ success: true, sheetId: response.data.spreadsheetId });

  } catch (error: any) {
    console.error('Error creating Google Sheet automatically:', error);
    return NextResponse.json({ error: error.message || 'Failed to auto-create sheet' }, { status: 500 });
  }
}
