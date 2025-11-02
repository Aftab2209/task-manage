// app/api/cron/calculate-fines/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import TaskType from '@/models/TaskType';
import { getTodayIST, calculateFine } from '@/lib/helpers';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const today = getTodayIST();
    
    // Find all entries for today that haven't been calculated
    const entries = await DailyEntry.find({
      date: today,
      fineCalculatedAt: null
    }).populate('tasks.taskType');
    
    const results = [];
    
    for (const entry of entries) {
      const { fine, failedTasks } = calculateFine(entry.tasks);
      
      entry.dailyFine = fine;
      entry.fineCalculatedAt = new Date();
      await entry.save();
      
      // Create or update fine ledger
      await FineLedger.findOneAndUpdate(
        { user: entry.user, date: today },
        {
          totalFine: fine,
          tasksFailed: failedTasks,
          paymentStatus: fine > 0 ? 'unpaid' : 'paid'
        },
        { upsert: true, new: true }
      );
      
      results.push({
        userId: entry.user,
        date: today,
        fine,
        tasksFailed: failedTasks
      });
    }
    
    return NextResponse.json({
      message: 'Fines calculated successfully',
      processed: results.length,
      results
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
