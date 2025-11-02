import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { userId, date } = await params;

        // IMPORTANT: Use .populate() to get full taskType details
        let entry = await DailyEntry.findOne({ user: userId, date })

        // Create entry if doesn't exist
        if (!entry) {
            const activeTasks = await TaskType.find({ active: true });

            entry = new DailyEntry({
                user: userId,
                date,
                tasks: activeTasks.map(task => ({
                    taskType: task._id,
                    value: 0,
                    completed: false,
                    markedAt: null
                }))
            });

            await entry.save();

            // CRITICAL: Populate after save
            entry = await DailyEntry.findById(entry._id)
                .populate({
                    path: 'tasks.taskType',
                    model: 'TaskType'
                });
        }


        console.log(entry, 'l')
        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error in GET daily entry:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
