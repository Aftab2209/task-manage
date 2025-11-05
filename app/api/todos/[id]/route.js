// app/api/todos/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';
// GET single todo by ID
export async function GET(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params

        const todo = await Todo.findById(id).populate('userId', 'name email');

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        return NextResponse.json(todo);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update todo
export async function PUT(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params
        const data = await request.json();

        const todo = await Todo.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate,
                    category: data.category,
                    tags: data.tags,
                    subTasks: data.subTasks,
                    links: data.links,
                    notes: data.notes,
                    ...(data.status === 'completed' && { completedAt: new Date() })
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

// PATCH - Partial update (for quick actions like status change)
export async function PATCH(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params
        const data = await request.json();

        const updateData = { ...data };

        // Auto-set completedAt when marking as completed
        if (data.status === 'completed') {
            updateData.completedAt = new Date();
        }

        const todo = await Todo.findByIdAndUpdate(
            id,
            { $set: updateData },
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

// DELETE - Soft delete (set active to false)
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params

        const todo = await Todo.findByIdAndUpdate(
            id,
            { $set: { active: false } },
            { new: true }
        );

        if (!todo) {
            return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Todo deleted successfully', todo });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
