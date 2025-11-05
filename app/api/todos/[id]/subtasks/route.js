// app/api/todos/[id]/subtasks/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

// POST - Add a subtask
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { title } = await request.json();
    
    const todo = await Todo.findByIdAndUpdate(
      params.id,
      { 
        $push: { 
          subTasks: { title, completed: false } 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
