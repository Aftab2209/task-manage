// app/api/stats/[userId]/study-hours/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import TaskType from '@/models/TaskType';
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    
    // // Get study_hours task type
    // const studyTaskType = await TaskType.findOne({ key: 'study_hours' });
    // if (!studyTaskType) {
    //   return NextResponse.json({ error: 'Study hours task not found' }, { status: 404 });
    // }

    
    
    // Get all entries
    const allEntries = await DailyEntry.find({ user: userId });

    
    // Calculate totals
    let totalHours = 0;
    let last7DaysHours = 0;
    let last30DaysHours = 0;
    let bestDay = { date: '', hours: 0 };
    
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);


    allEntries.forEach(entry => {
      const studyTask = entry.tasks.find(
        t => t.taskType.toString() === "67549a3e8a9e47b3f0d2c102"
      );
      
      if (studyTask) {

        console.log(studyTask, 'aaa')
        const hours = parseFloat(studyTask.value) || 0;
        totalHours += hours;
        
        const entryDate = new Date(entry.date);
        if (entryDate >= sevenDaysAgo) {
          last7DaysHours += hours;
        }
        if (entryDate >= thirtyDaysAgo) {
          last30DaysHours += hours;
        }
        
        if (hours > bestDay.hours) {
          bestDay = { date: entry.date, hours };
        }
      }
    });
    
    const totalDays = allEntries.length || 1;
    
    return NextResponse.json({
      totalHours: Math.round(totalHours * 10) / 10,
      last7Days: Math.round(last7DaysHours * 10) / 10,
      last30Days: Math.round(last30DaysHours * 10) / 10,
      averagePerDay: Math.round((totalHours / totalDays) * 100) / 100,
      bestDay
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }}







