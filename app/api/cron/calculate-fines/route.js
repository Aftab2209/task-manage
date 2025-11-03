import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import { getTodayIST, calculateFine } from '@/lib/helpers';

export async function GET() {
  try {
    await dbConnect();

    const today = getTodayIST();

    const entries = await DailyEntry.find({
      date: today,
      fineCalculatedAt: null,
    }).populate('tasks.taskType');

    const results = [];

    for (const entry of entries) {
      const { fine, failedTasks } = calculateFine(entry.tasks);

      entry.dailyFine = fine;
      entry.fineCalculatedAt = new Date();
      await entry.save();

      await FineLedger.findOneAndUpdate(
        { user: entry.user, date: today },
        {
          totalFine: fine,
          tasksFailed: failedTasks,
          paymentStatus: fine > 0 ? 'unpaid' : 'paid',
        },
        { upsert: true, new: true }
      );

      results.push({
        userId: entry.user,
        date: today,
        fine,
        tasksFailed: failedTasks,
      });
    }

    return NextResponse.json({
      message: 'Fines calculated successfully',
      processed: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
