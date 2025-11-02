// app/api/stats/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    
    // Total unpaid fines
    const unpaidFines = await FineLedger.aggregate([
      { $match: { user: userId, paymentStatus: 'unpaid' } },
      { $group: { _id: null, total: { $sum: '$totalFine' } } }
    ]);
    
    // Last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentEntries = await DailyEntry.find({
      user: userId,
      date: { $gte: dateStr }
    }).populate('tasks.taskType');
    
    const stats = {
      totalUnpaidFines: unpaidFines[0]?.total || 0,
      last7Days: {
        totalDays: recentEntries.length,
        daysWithFines: recentEntries.filter(e => e.dailyFine > 0).length,
        totalFines: recentEntries.reduce((sum, e) => sum + e.dailyFine, 0)
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}