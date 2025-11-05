// app/api/fines/calculate-morning-jobs/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import FineLedger from '@/models/FineLedger';
import TaskType from '@/models/TaskType';
import { getTodayIST, evaluateCompletionRule, isSpecialDay, getEffectiveRule } from '@/lib/helpers';

export async function GET() {
  try {
    await dbConnect();

    const today = getTodayIST();

    // Check if today is a special day
    const isTodaySpecial = await isSpecialDay(today);

    // Find the morning jobs task type by key
    const morningJobsTaskType = await TaskType.findOne({ 
      key: 'morning_jobs_applied',
      active: true 
    });

    if (!morningJobsTaskType) {
      return NextResponse.json({ 
        error: 'Morning jobs task type not found' 
      }, { status: 404 });
    }

    // Get the effective rule for today
    const effectiveRule = getEffectiveRule(morningJobsTaskType, isTodaySpecial);

    // Find all entries for today
    const entries = await DailyEntry.find({ date: today });

    const results = [];

    for (const entry of entries) {
      // Find only the morning jobs task
      const morningJobTask = entry.tasks.find(
        t => t.taskType.toString() === morningJobsTaskType._id.toString()
      );

      if (!morningJobTask) {
        console.log(`User ${entry.user} has no morning jobs task`);
        continue;
      }

      // Check if this specific task is already marked as calculated
      const isAlreadyCalculated = morningJobTask.markedAt && 
        new Date(morningJobTask.markedAt).toDateString() === new Date().toDateString();

      if (isAlreadyCalculated && morningJobTask.completed) {
        console.log(`Morning jobs fine already calculated for user ${entry.user}`);
        continue;
      }

      // Evaluate if the task is completed using the effective rule (special day or regular)
      const isCompleted = evaluateCompletionRule(
        morningJobTask.value,
        effectiveRule
      );

      // Calculate fine only if failed
      const taskFine = isCompleted ? 0 : morningJobsTaskType.fineIfFailed;

      // Update the task's completion status
      morningJobTask.completed = isCompleted;
      morningJobTask.markedAt = new Date();

      // Add the fine to the daily total (don't overwrite existing fines)
      entry.dailyFine += taskFine;
      
      await entry.save();

      // Update or create fine ledger entry
      const existingLedger = await FineLedger.findOne({ 
        user: entry.user, 
        date: today 
      });

      if (existingLedger) {
        // Add to existing fine
        existingLedger.totalFine += taskFine;
        
        // Add to failed tasks if applicable
        if (!isCompleted) {
          existingLedger.tasksFailed.push(morningJobsTaskType.name);
        }
        
        // Update payment status if there's now a fine
        if (existingLedger.totalFine > 0) {
          existingLedger.paymentStatus = 'unpaid';
        }
        
        await existingLedger.save();
      } else {
        // Create new ledger entry
        await FineLedger.create({
          user: entry.user,
          date: today,
          totalFine: taskFine,
          tasksFailed: isCompleted ? [] : [morningJobsTaskType.name],
          paymentStatus: taskFine > 0 ? 'unpaid' : 'paid',
        });
      }

      results.push({
        userId: entry.user,
        date: today,
        taskName: morningJobsTaskType.name,
        value: morningJobTask.value,
        completed: isCompleted,
        fine: taskFine,
        totalDailyFine: entry.dailyFine,
        ruleUsed: effectiveRule,
        isSpecialDay: isTodaySpecial,
      });
    }

    return NextResponse.json({
      message: `Morning jobs fines calculated successfully${isTodaySpecial ? ' - SPECIAL DAY 🎉' : ''}`,
      processed: results.length,
      isSpecialDay: isTodaySpecial,
      ruleUsed: effectiveRule,
      results,
    });
  } catch (error) {
    console.error('Error calculating morning jobs fines:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}