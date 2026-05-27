import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ 
      error: "No refresh token found in cookies. Please go to the /admin page and Sign in with Google first." 
    }, { status: 400 });
  }

  return NextResponse.json({ 
    instructions: "Here is your Refresh Token. Copy the long string below and paste it into your Vercel Environment Variables as 'ADMIN_REFRESH_TOKEN'. Also don't forget to add 'ADMIN_SHEET_ID'.",
    ADMIN_REFRESH_TOKEN: refreshToken 
  });
}
