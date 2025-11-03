// app/api/stats/[userId]/jobs-applied/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;

    // Get both job-related task types
    const jobsTaskType = await TaskType.findOne({ key: 'jobs_applied' });
    const morningJobsTaskType = await TaskType.findOne({ key: 'morning_jobs_applied' });

    const allEntries = await DailyEntry.find({ user: userId });

    // Calculate totals
    let totalJobs = 0;
    let last7DaysJobs = 0;
    let last30DaysJobs = 0;
    let bestDay = { date: '', jobs: 0 };
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    allEntries.forEach(entry => {
      // Find both job tasks
      const regularJobsTask = entry.tasks.find(
        t => jobsTaskType && t.taskType.toString() === jobsTaskType._id.toString()
      );
      const morningJobsTask = entry.tasks.find(
        t => morningJobsTaskType && t.taskType.toString() === morningJobsTaskType._id.toString()
      );
      
      // Sum both job counts
      const regularJobs = regularJobsTask ? parseInt(regularJobsTask.value) || 0 : 0;
      const morningJobs = morningJobsTask ? parseInt(morningJobsTask.value) || 0 : 0;
      const jobs = regularJobs + morningJobs;
      
      totalJobs += jobs;
      
      const entryDate = new Date(entry.date);
      if (entryDate >= sevenDaysAgo) {
        last7DaysJobs += jobs;
      }
      if (entryDate >= thirtyDaysAgo) {
        last30DaysJobs += jobs;
      }
      
      if (jobs > bestDay.jobs) {
        bestDay = { date: entry.date, jobs };
      }
    });
    
    const totalDays = allEntries.length || 1;
    
    return NextResponse.json({
      totalJobs,
      last7Days: last7DaysJobs,
      last30Days: last30DaysJobs,
      averagePerDay: Math.round((totalJobs / totalDays) * 100) / 100,
      bestDay
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}