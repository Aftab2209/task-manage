// app/api/daily-entries/[userId]/[date]/update-task/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';
import { evaluateCompletionRule, isSpecialDay, getEffectiveRule } from '@/lib/helpers';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    console.log('✅ Database connected for PATCH');

    const { userId, date } = await params;
    const { taskTypeId, value } = await request.json();

    console.log('🧩 Params:', { userId, date });
    console.log('🧾 Payload:', { taskTypeId, value });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskTypeId)) {
      console.error('❌ Invalid taskTypeId:', taskTypeId);
      return NextResponse.json({ error: 'Invalid task type ID format' }, { status: 400 });
    }

    // 🔍 1️⃣ Check if this date is a special day (e.g., weekend)
    console.log('🔍 Checking if date is special:', date);
    const isDateSpecial = await isSpecialDay(date);
    console.log('🌞 isSpecialDay result:', isDateSpecial);

    // 🔍 2️⃣ Try fetching TaskType
    let taskType = await TaskType.findById(taskTypeId);
    if (!taskType) {
      console.warn('⚠️ TaskType not found by ID, checking manually...');
      const all = await TaskType.find({});
      const found = all.find(tt => tt._id.toString() === taskTypeId);
      if (!found) {
        console.error('❌ TaskType not found at all.');
        return NextResponse.json(
          {
            error: 'Task type not found',
            receivedId: taskTypeId,
            availableIds: all.map(t => t._id.toString())
          },
          { status: 404 }
        );
      }
      taskType = found;
    }

    // 🧠 3️⃣ Compute which rule applies
    const effectiveRule = getEffectiveRule(taskType, isDateSpecial);
    console.log('⚙️ Effective rule selected:', effectiveRule);

    // 🔍 4️⃣ Find user's daily entry
    const entry = await DailyEntry.findOne({ user: userId, date });
    if (!entry) {
      console.error('❌ Daily entry not found for user/date');
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // 🧩 5️⃣ Find specific task in entry
    const taskIndex = entry.tasks.findIndex(
      t => t.taskType.toString() === taskTypeId.toString()
    );

    if (taskIndex === -1) {
      console.error('❌ Task not found in entry');
      console.log('Available task IDs:', entry.tasks.map(t => t.taskType.toString()));
      return NextResponse.json(
        {
          error: 'Task not found in entry',
          lookingFor: taskTypeId,
          availableInEntry: entry.tasks.map(t => t.taskType.toString())
        },
        { status: 404 }
      );
    }

    // 🧾 6️⃣ Update task with new value + apply rule check
    console.log('✏️ Updating task index:', taskIndex);
    entry.tasks[taskIndex].value = value;
    entry.tasks[taskIndex].completed = evaluateCompletionRule(value, effectiveRule);
    entry.tasks[taskIndex].markedAt = new Date();

    console.log('✅ Updated Task:', {
      value,
      completed: entry.tasks[taskIndex].completed,
      markedAt: entry.tasks[taskIndex].markedAt,
      ruleUsed: effectiveRule,
      isSpecialDay: isDateSpecial
    });

    // 💾 7️⃣ Save and return updated entry
    await entry.save();
    await entry.populate('tasks.taskType');

    const response = entry.toObject();
    response.isSpecialDay = isDateSpecial;
    response.ruleUsed = effectiveRule;

    console.log('🧠 Final Response Prepared');
    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 Update task error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
