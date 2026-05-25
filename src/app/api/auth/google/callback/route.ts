import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Use x-forwarded headers to get the true protocol and host, as Vercel proxies requests
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // We get id_token, access_token, and potentially refresh_token
    // In a real app we'd save refresh_token securely in a DB linked to the user's ID
    
    const cookieStore = await cookies();
    
    // Store the tokens securely in HTTP-only cookies so the admin page can use them
    cookieStore.set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    if (tokens.refresh_token) {
      cookieStore.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
    }

    // Redirect back to the admin dashboard after successful authentication
    return NextResponse.redirect(new URL('/admin', req.url));

  } catch (error: any) {
    console.error('Error exchanging Google code:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
