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
    
    // Calculate yesterday's date (since this runs at midnight for previous day)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get the morning jobs task type ID to exclude it
    const morningJobsTaskType = await TaskType.findOne({ 
      key: 'morning_jobs_applied' 
    });

    // Get ALL task types for manual population
    const allTaskTypes = await TaskType.find({}).lean();

    const entries = await DailyEntry.find({
      date: yesterdayStr,
      fineCalculatedAt: null,
    }).lean(); // Use .lean() for better performance

    const results = [];

    for (const entry of entries) {
      // Manually populate taskType for each task
      const populatedTasks = entry.tasks.map(task => ({
        ...task,
        taskType: allTaskTypes.find(tt => tt._id.toString() === task.taskType.toString())
      }));

      // Filter out tasks with null taskType and the morning jobs task
      const tasksToProcess = populatedTasks.filter(task => {
        if (!task.taskType) {
          console.warn('Task with null taskType found:', task);
          return false;
        }
        if (!morningJobsTaskType) return true;
        return task.taskType._id.toString() !== morningJobsTaskType._id.toString();
      });

      // Calculate fine only for non-morning-jobs tasks
      const { fine, failedTasks } = calculateFine(tasksToProcess);

      // Update the entry in the database
      await DailyEntry.findByIdAndUpdate(entry._id, {
        dailyFine: fine,
        fineCalculatedAt: new Date()
      });

      await FineLedger.findOneAndUpdate(
        { user: entry.user, date: yesterdayStr },
        {
          totalFine: fine,
          tasksFailed: failedTasks,
          paymentStatus: fine > 0 ? 'unpaid' : 'paid',
        },
        { upsert: true, new: true }
      );

      results.push({
        userId: entry.user,
        date: yesterdayStr,
        fine,
        tasksFailed: failedTasks,
        excludedMorningJobs: !!morningJobsTaskType,
      });
    }

    return NextResponse.json({
      message: 'Fines calculated successfully for yesterday (excluding morning jobs)',
      processed: results.length,
      calculatedFor: yesterdayStr,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}