import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TOKEN = process.env.CARD_VALIDATION_TOKEN;
const CLIENT = process.env.CARD_VALIDATION_CLIENT;

// Warn if credentials are not set (development fallback)
if (!TOKEN || !CLIENT) {
  console.warn('⚠️  CARD_VALIDATION_TOKEN or CARD_VALIDATION_CLIENT not set - API calls may fail in production');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': TOKEN || '8234d078-e3ab-479e-a20e-89eb4dd0133f',
        'client': CLIENT || '3W6izon01E77goCGve8pHA',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
