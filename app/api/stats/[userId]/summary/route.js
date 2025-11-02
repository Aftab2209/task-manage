// app/api/stats/[userId]/summary/route.js
// Combined endpoint for all dashboard data in one call
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import TaskType from '@/models/TaskType';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = params;
    
    // Fetch all data in parallel
    const [studyTaskType, jobsTaskType, allEntries, allLedgers] = await Promise.all([
      TaskType.findOne({ key: 'study_hours' }),
      TaskType.findOne({ key: 'jobs_applied' }),
      DailyEntry.find({ user: userId }).sort({ date: -1 }),
      FineLedger.find({ user: userId })
    ]);
    
    // Calculate study hours
    let totalStudyHours = 0;
    let last7DaysStudy = 0;
    
    // Calculate jobs applied
    let totalJobs = 0;
    let last7DaysJobs = 0;
    
    // Calculate fines
    let totalFines = 0;
    let unpaidFines = 0;
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Process entries
    allEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.date);
      const isRecent = entryDate >= sevenDaysAgo;
      
      // Study hours
      if (studyTaskType) {
        const studyTask = entry.tasks.find(
          t => t.taskType.toString() === studyTaskType._id.toString()
        );
        if (studyTask) {
          const hours = parseFloat(studyTask.value) || 0;
          totalStudyHours += hours;
          if (isRecent) last7DaysStudy += hours;
        }
      }
      
      // Jobs applied
      if (jobsTaskType) {
        const jobsTask = entry.tasks.find(
          t => t.taskType.toString() === jobsTaskType._id.toString()
        );
        if (jobsTask) {
          const jobs = parseInt(jobsTask.value) || 0;
          totalJobs += jobs;
          if (isRecent) last7DaysJobs += jobs;
        }
      }
      
      // Streak calculation
      if (entry.dailyFine === 0) {
        tempStreak++;
        if (index === 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    });
    
    // Final streak check
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    
    // Process fines
    allLedgers.forEach(ledger => {
      totalFines += ledger.totalFine;
      if (ledger.paymentStatus === 'unpaid') {
        unpaidFines += ledger.totalFine;
      }
    });
    
    return NextResponse.json({
      studyHours: {
        total: Math.round(totalStudyHours * 10) / 10,
        last7Days: Math.round(last7DaysStudy * 10) / 10
      },
      jobsApplied: {
        total: totalJobs,
        last7Days: last7DaysJobs
      },
      fines: {
        total: totalFines,
        unpaid: unpaidFines
      },
      streak: {
        current: currentStreak,
        longest: Math.max(longestStreak, currentStreak)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}