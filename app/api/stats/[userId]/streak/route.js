// app/api/stats/[userId]/streak/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyEntry from '@/models/DailyEntry';
import { getTodayIST } from '@/lib/helpers';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { userId } = await params;
    
    // Get all entries sorted by date descending
    const allEntries = await DailyEntry.find({ user: userId })
      .sort({ date: -1 });
    
    if (allEntries.length === 0) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        streakStartDate: null,
        lastFineDate: null,
        isActive: false
      });
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let streakStartDate = null;
    let lastFineDate = null;
    let currentStreakActive = true;
    
    // Calculate streaks (days with zero fines)
    for (let i = 0; i < allEntries.length; i++) {
      const entry = allEntries[i];
      const fine = entry.dailyFine || 0;
      
      if (fine === 0) {
        tempStreak++;
        
        // If this is the most recent entry and has no fine
        if (i === 0) {
          currentStreak = tempStreak;
          streakStartDate = entry.date;
        }
      } else {
        // Found a fine, break the streak
        if (i === 0) {
          currentStreak = 0;
          currentStreakActive = false;
          lastFineDate = entry.date;
        }
        
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        
        tempStreak = 0;
        
        if (!lastFineDate) {
          lastFineDate = entry.date;
        }
      }
    }
    
    // Check final streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    // If we have a current streak but no start date, use the oldest zero-fine entry
    if (currentStreak > 0 && !streakStartDate) {
      for (let i = currentStreak - 1; i >= 0; i--) {
        if (allEntries[i].dailyFine === 0) {
          streakStartDate = allEntries[i].date;
        }
      }
    }
    
    return NextResponse.json({
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      streakStartDate,
      lastFineDate,
      isActive: currentStreakActive
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
