// app/api/daily-entries/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    
    const entries = await DailyEntry.find({ user: params.userId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('tasks.taskType');
    
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
