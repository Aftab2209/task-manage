// app/api/fine-ledgers/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FineLedger from '@/models/FineLedger';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const status = searchParams.get('status'); // 'paid' or 'unpaid'
    
    const query = { user: params.userId };
    if (status) {
      query.paymentStatus = status;
    }
    
    const ledgers = await FineLedger.find(query)
      .sort({ date: -1 })
      .limit(limit);
    
    return NextResponse.json(ledgers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
