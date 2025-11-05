import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';
import { isSpecialDay, getEffectiveRule } from '@/lib/helpers'; // ✅ import helpers
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  console.log('🔹 GET /daily-entries triggered');
  try {
    await dbConnect();
    console.log('✅ Database connected');

    const { userId, date } = await params;
    console.log('📅 Params:', { userId, date });

    // --- Check if it's a special day (weekend or custom logic) ---
    console.log('🔍 Checking if date is special:', date);
    const isDateSpecial = await isSpecialDay(date);
    console.log('🌞 isSpecialDay result:', isDateSpecial);

    // --- Find existing entry ---
    let entry = await DailyEntry.findOne({ user: userId, date })

    console.log(entry ? '✅ Found DailyEntry' : '⚠️ No entry found');

    // --- Create entry if doesn't exist ---
    if (!entry) {
      console.log('🧱 Creating new DailyEntry...');
      const activeTasks = await TaskType.find({ active: true });
      console.log('🧾 Active TaskTypes:', activeTasks.length);

      entry = new DailyEntry({
        user: userId,
        date,
        tasks: activeTasks.map(task => ({
          taskType: task._id,
          value: 0,
          completed: false,
          markedAt: null
        }))
      });

      await entry.save();
      console.log('💾 New entry saved:', entry._id.toString());

      entry = await DailyEntry.findById(entry._id)

      console.log('🔄 Populated entry after creation');
    }

    // --- Apply effective rules if needed ---
    console.log('⚙️ Determining effective rules for each taskType...');
    const response = entry.toObject();
    response.isSpecialDay = isDateSpecial;

    
    response.tasks = response.tasks.map(task => {
      const effectiveRule = getEffectiveRule(task.taskType, isDateSpecial);
      return {
        ...task,
        effectiveRule
      };
    });

    console.log('🧠 Final response prepared');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Error in GET daily entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
