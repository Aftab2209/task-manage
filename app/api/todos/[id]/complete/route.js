// app/api/todos/[id]/complete/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

// POST - Mark todo as completed
export async function POST(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params
        const todo = await Todo.findById(id);

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        await todo.markCompleted();

        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}