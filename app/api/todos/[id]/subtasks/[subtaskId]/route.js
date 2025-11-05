// app/api/todos/[id]/subtasks/[subtaskId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

// PATCH - Toggle subtask completion
export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { completed } = await request.json();

        const todo = await Todo.findOneAndUpdate(
            {
                _id: params.id,
                'subTasks._id': params.subtaskId
            },
            {
                $set: { 'subTasks.$.completed': completed }
            },
            { new: true }
        );

        if (!todo) {
            return NextResponse.json({ error: 'Todo or subtask not found' }, { status: 404 });
        }

        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE - Remove subtask
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id, subtaskId } = await params


        const todo = await Todo.findByIdAndUpdate(
            id,
            {
                $pull: {
                    subTasks: { _id: subtaskId }
                }
            },
            { new: true }
        );

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}