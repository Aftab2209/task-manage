// app/api/stats/[userId]/fines/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FineLedger from '@/models/FineLedger';
import DailyEntry from '@/models/DailyEntry';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    
    // Get all fine ledgers
    const allLedgers = await FineLedger.find({ user: userId });
    
    // Calculate totals
    let totalFinesAllTime = 0;
    let unpaidFines = 0;
    let paidFines = 0;
    let last7DaysFines = 0;
    let last30DaysFines = 0;
    let fineDays = 0;
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    allLedgers.forEach(ledger => {
      const fine = ledger.totalFine;
      totalFinesAllTime += fine;
      
      if (fine > 0) {
        fineDays++;
      }
      
      if (ledger.paymentStatus === 'unpaid') {
        unpaidFines += fine;
      } else {
        paidFines += fine;
      }
      
      const ledgerDate = new Date(ledger.date);
      if (ledgerDate >= sevenDaysAgo) {
        last7DaysFines += fine;
      }
      if (ledgerDate >= thirtyDaysAgo) {
        last30DaysFines += fine;
      }
    });
    
    // Get days with zero fines
    const allEntries = await DailyEntry.find({ user: userId });
    const zeroFineDays = allEntries.filter(e => e.dailyFine === 0).length;
    
    return NextResponse.json({
      totalFinesAllTime,
      unpaidFines,
      paidFines,
      last7DaysFines,
      last30DaysFines,
      fineDays,
      zeroFineDays
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}