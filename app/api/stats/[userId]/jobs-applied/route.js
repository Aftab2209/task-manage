// app/api/stats/[userId]/jobs-applied/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    
    // // Get jobs_applied task type
    // const jobsTaskType = await TaskType.findOne({ key: 'jobs_applied' });
    // if (!jobsTaskType) {
    //   return NextResponse.json({ error: 'Jobs applied task not found' }, { status: 404 });
    // }
    
    // Get all entries
    const allEntries = await DailyEntry.find({ user: userId });

    console.log(allEntries, 'aaaa')
    
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
      const jobsTask = entry.tasks.find(
        t => t.taskType.toString() === "67549a3e8a9e47b3f0d2c101"
      );
      
      if (jobsTask) {
        const jobs = parseInt(jobsTask.value) || 0;
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