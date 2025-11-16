// app/api/stats/[userId]/heatmap-activity/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';

export async function GET(request, { params }) {
  console.log('➡️ Heatmap API called with params:', params);

  try {
    await dbConnect();
    const { userId } = await params;
    console.log('🧍‍♂️ User ID:', userId);

    // Fetch TaskTypes
    const jobsTaskType = await TaskType.findOne({ key: 'jobs_applied' });
    const morningJobsTaskType = await TaskType.findOne({ key: 'morning_jobs_applied' });
    const studyTaskType = await TaskType.findOne({ key: 'study_hours' });

    console.log('✅ TaskTypes found:', { jobsTaskType, morningJobsTaskType, studyTaskType });

    // Get last 30 days including today (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // 30 days including today

    const todayStr = today.toLocaleDateString('en-CA'); // ✅ 'YYYY-MM-DD' in local time
    const startDateStr = startDate.toLocaleDateString('en-CA');

    console.log('📅 Date range (string, local):', { startDateStr, todayStr });

    // Query entries
    const entries = await DailyEntry.find({
      user: userId,
      date: { $gte: startDateStr, $lte: todayStr }
    }).sort({ date: 1 });

    console.log(`🧾 Found ${entries.length} entries for user.`);

    const jobsMap = new Map();
    const studyMap = new Map();

    entries.forEach(entry => {
      const dateStr = entry.date; // stored as YYYY-MM-DD string
      const regularJobsTask = entry.tasks.find(
        t => jobsTaskType && t.taskType.toString() === jobsTaskType._id.toString()
      );
      const morningJobsTask = entry.tasks.find(
        t => morningJobsTaskType && t.taskType.toString() === morningJobsTaskType._id.toString()
      );

      const regularJobs = regularJobsTask ? parseInt(regularJobsTask.value) || 0 : 0;
      const morningJobs = morningJobsTask ? parseInt(morningJobsTask.value) || 0 : 0;
      const totalJobs = regularJobs + morningJobs;

      jobsMap.set(dateStr, totalJobs);

      const studyTask = entry.tasks.find(
        t => studyTaskType && t.taskType.toString() === studyTaskType._id.toString()
      );
      const studyHours = studyTask ? parseFloat(studyTask.value) || 0 : 0;
      studyMap.set(dateStr, Math.round(studyHours));
    });

    // Build 30-day data arrays including today
    const jobsData = [];
    const studyData = [];
    const dateLabels = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toLocaleDateString('en-CA'); // ✅ Local date string (YYYY-MM-DD)

      const jobValue = jobsMap.get(dateStr) || 0;
      const studyValue = studyMap.get(dateStr) || 0;

      jobsData.push(jobValue);
      studyData.push(studyValue);
      dateLabels.push(dateStr);

      console.log(`📅 ${dateStr} → Jobs=${jobValue}, Study=${studyValue}`);
    }

    console.log('✅ Final Response:', {
      jobs: jobsData,
      study: studyData,
      startDate: startDateStr,
      endDate: todayStr
    });

    return NextResponse.json({
      jobs: jobsData,
      study: studyData,
      dates: dateLabels,
      startDate: startDateStr,
      endDate: todayStr
    });

  } catch (error) {
    console.error('❌ Heatmap API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
