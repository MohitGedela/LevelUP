import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    message: 'Test endpoint working'
  });
}
