// app/api/todos/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

// GET all todos (with optional filters)
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const category = searchParams.get('category');
        const overdue = searchParams.get('overdue');

        // Build query
        const query = { active: true };

        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (category) query.category = category;

        // Handle overdue filter
        if (overdue === 'true') {
            query.dueDate = { $lt: new Date() };
            query.status = { $ne: 'completed' };
        }

        const todos = await Todo.find(query)
            .sort({ priority: -1, dueDate: 1, createdAt: -1 })
            .populate('userId', 'name email');

        return NextResponse.json(todos);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new todo
export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();

        const todo = new Todo({
            title: data.title,
            description: data.description,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            dueDate: data.dueDate,
            category: data.category,
            tags: data.tags || [],
            userId: data.userId,
            subTasks: data.subTasks || [],
            links: data.links || [],
            notes: data.notes
        });

        await todo.save();
        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}






