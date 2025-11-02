// app/api/task-types/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TaskType from '@/models/TaskType';

export async function GET() {
  try {
    await dbConnect();
    const taskTypes = await TaskType.find({ active: true }).sort({ createdAt: 1 });
    return NextResponse.json(taskTypes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name, key, inputType, completionRule, fineIfFailed } = await request.json();
    const taskType = new TaskType({
      name,
      key,
      inputType,
      completionRule,
      fineIfFailed: fineIfFailed || 100
    });
    await taskType.save();
    return NextResponse.json(taskType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
