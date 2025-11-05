// app/api/todos/stats/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

// GET - Get todo statistics for a user
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const query = { userId, active: true };

        const [total, completed, pending, inProgress, overdue] = await Promise.all([
            Todo.countDocuments(query),
            Todo.countDocuments({ ...query, status: 'completed' }),
            Todo.countDocuments({ ...query, status: 'pending' }),
            Todo.countDocuments({ ...query, status: 'in_progress' }),
            Todo.countDocuments({
                ...query,
                status: { $ne: 'completed' },
                dueDate: { $lt: new Date() }
            })
        ]);

        const stats = {
            total,
            completed,
            pending,
            inProgress,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}