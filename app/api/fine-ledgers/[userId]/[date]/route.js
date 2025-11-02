
// app/api/fine-ledgers/[userId]/[date]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FineLedger from '@/models/FineLedger';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { userId, date } = params;
    const { paymentStatus, notes } = await request.json();
    
    const ledger = await FineLedger.findOneAndUpdate(
      { user: userId, date },
      { paymentStatus, notes },
      { new: true }
    );
    
    if (!ledger) {
      return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
    }
    
    return NextResponse.json(ledger);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
