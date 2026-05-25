import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: Request) {
  // Use x-forwarded headers to get the true protocol and host, as Vercel proxies requests
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request offline access to get a refresh token
    prompt: 'consent', // Force consent to ensure we get a refresh token
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
  });

  return NextResponse.redirect(url);
}
