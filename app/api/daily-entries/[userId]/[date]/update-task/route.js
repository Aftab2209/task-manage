// app/api/daily-entries/[userId]/[date]/update-task/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import TaskType from '@/models/TaskType';
import { evaluateCompletionRule } from '@/lib/helpers';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    // DEBUG: Check connection details
    console.log('=== CONNECTION DEBUG ===');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('TaskType collection:', TaskType.collection.name);
    
    const { userId, date } = await params;
    const { taskTypeId, value } = await request.json();
    
    console.log('Received taskTypeId:', taskTypeId);
    console.log('Type:', typeof taskTypeId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskTypeId)) {
      return NextResponse.json({ error: 'Invalid task type ID format' }, { status: 400 });
    }
    
    // DEBUG: Try direct collection query first
    const db = mongoose.connection.db;
    const taskTypesCollection = db.collection('task_types');
    const directQuery = await taskTypesCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(taskTypeId) 
    });
    console.log('Direct collection query result:', directQuery ? 'FOUND' : 'NOT FOUND');
    if (directQuery) {
      console.log('Direct query data:', JSON.stringify(directQuery, null, 2));
    }
    
    // Try model query
    let taskType = await TaskType.findOne({ 
      _id: new mongoose.Types.ObjectId(taskTypeId) 
    });
    console.log('Model query result:', taskType ? 'FOUND' : 'NOT FOUND');
    
    if (!taskType) {
      console.log('TaskType not found. Debugging further...');
      
      // Check with .find() to see what's actually there
      const allTaskTypes = await TaskType.find({});

      
      // Compare the IDs byte-by-byte
      if (allTaskTypes.length > 0) {
        const firstTask = allTaskTypes[0];
      }
      
      // Try one more thing - search by string comparison
      const foundByString = allTaskTypes.find(tt => tt._id.toString() === taskTypeId);
      console.log('Found by string comparison?', foundByString ? 'YES' : 'NO');
      
      if (foundByString) {
        console.log('FOUND IT with string comparison! Using this one.');
        taskType = foundByString;
      } else {
        return NextResponse.json({ 
          error: 'Task type not found',
          receivedId: taskTypeId,
          availableIds: allTaskTypes.map(tt => tt._id.toString())
        }, { status: 404 });
      }
    }
    
    // Find daily entry
    const entry = await DailyEntry.findOne({ user: userId, date });
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // Find and update the specific task
    const taskIndex = entry.tasks.findIndex(
      t => t.taskType.toString() === taskTypeId.toString()
    );
    
    if (taskIndex === -1) {
      console.log('Task not found in entry. Entry tasks:', entry.tasks.map(t => ({
        taskTypeId: t.taskType.toString(),
        value: t.value
      })));
      return NextResponse.json({ 
        error: 'Task not found in entry',
        lookingFor: taskTypeId,
        availableInEntry: entry.tasks.map(t => t.taskType.toString())
      }, { status: 404 });
    }
    
    entry.tasks[taskIndex].value = value;
    entry.tasks[taskIndex].completed = evaluateCompletionRule(
      value,
      taskType.completionRule
    );
    entry.tasks[taskIndex].markedAt = new Date();
    
    await entry.save();
    await entry.populate('tasks.taskType');
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}