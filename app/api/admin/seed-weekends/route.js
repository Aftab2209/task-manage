// app/api/admin/seed-weekends/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SpecialDay from '@/models/SpecialDay';

/**
 * Generate all weekends between two dates
 */
function generateWeekends(startDate, endDate) {
  const weekends = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (day === 0 || day === 6) {
      const dateStr = d.toISOString().split('T')[0];
      const dayName = day === 0 ? "Sunday" : "Saturday";
      
      weekends.push({
        date: dateStr,
        name: dayName,
        type: "weekend",
        active: true
      });
    }
  }
  
  return weekends;
}

export async function POST(request) {
  try {
    await dbConnect();
    
    // Get parameters from request body (optional)
    const body = await request.json().catch(() => ({}));
    const { 
      months = 6,           // Default: 6 months
      clearExisting = true  // Default: clear old weekends
    } = body;
    
    // Generate weekends for specified months
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    
    const weekends = generateWeekends(today, futureDate);
    
    // Clear existing weekends if requested
    let deletedCount = 0;
    if (clearExisting) {
      const deleteResult = await SpecialDay.deleteMany({ type: 'weekend' });
      deletedCount = deleteResult.deletedCount;
    }
    
    // Insert new weekends (ignore duplicates)
    let insertedCount = 0;
    const errors = [];
    
    for (const weekend of weekends) {
      try {
        await SpecialDay.create(weekend);
        insertedCount++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key - skip silently
          continue;
        }
        errors.push({ date: weekend.date, error: error.message });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedCount} weekend dates for next ${months} months`,
      stats: {
        generated: weekends.length,
        deleted: deletedCount,
        inserted: insertedCount,
        skipped: weekends.length - insertedCount,
        errors: errors.length
      },
      dateRange: {
        from: today.toISOString().split('T')[0],
        to: futureDate.toISOString().split('T')[0]
      },
      sample: weekends.slice(0, 10).map(w => `${w.date} (${w.name})`),
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error seeding weekends:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}

// GET method to preview what will be generated
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    
    const weekends = generateWeekends(today, futureDate);
    
    return NextResponse.json({
      preview: true,
      message: `Preview of ${weekends.length} weekends for next ${months} months`,
      dateRange: {
        from: today.toISOString().split('T')[0],
        to: futureDate.toISOString().split('T')[0]
      },
      count: weekends.length,
      weekends: weekends.map(w => `${w.date} (${w.name})`)
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}