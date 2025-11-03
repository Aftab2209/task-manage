// app/api/fines/calculate/route.js (or your original route)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import TaskType from '@/models/TaskType';
import { getTodayIST, calculateFine } from '@/lib/helpers';

export async function GET() {
  try {
    await dbConnect();

    const today = getTodayIST();

    // Get the morning jobs task type ID to exclude it
    const morningJobsTaskType = await TaskType.findOne({ 
      key: 'morning_jobs_applied' 
    });

    const entries = await DailyEntry.find({
      date: today,
      fineCalculatedAt: null,
    }).populate('tasks.taskType');

    const results = [];

    for (const entry of entries) {
      // Filter out the morning jobs task - only process other tasks
      const tasksToProcess = entry.tasks.filter(task => {
        if (!morningJobsTaskType) return true; // If no morning jobs task exists, process all
        return task.taskType._id.toString() !== morningJobsTaskType._id.toString();
      });

      // Calculate fine only for non-morning-jobs tasks
      const { fine, failedTasks } = calculateFine(tasksToProcess);

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
        excludedMorningJobs: !!morningJobsTaskType,
      });
    }

    return NextResponse.json({
      message: 'Fines calculated successfully (excluding morning jobs)',
      processed: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}