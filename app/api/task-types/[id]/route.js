// app/api/task-types/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TaskType from '@/models/TaskType';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const taskType = await TaskType.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!taskType) {
      return NextResponse.json({ error: 'Task type not found' }, { status: 404 });
    }
    return NextResponse.json(taskType);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const taskType = await TaskType.findByIdAndUpdate(
      params.id,
      { active: false },
      { new: true }
    );
    if (!taskType) {
      return NextResponse.json({ error: 'Task type not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Task type deactivated', taskType });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
