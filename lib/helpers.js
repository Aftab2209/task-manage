

// lib/helpers.js
export function getTodayIST() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getISTDateTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}

export function isBeforeCutoff() {
  const istNow = getISTDateTime();
  const hours = istNow.getUTCHours();
  const minutes = istNow.getUTCMinutes();

  // Check if before 11:59 PM IST (23:59)
  return hours < 23 || (hours === 23 && minutes <= 59);
}

// In helpers.js
export function evaluateCompletionRule(value, rule) {
  // rule = "value >= 1"
  // value = 3

  // Step 1: Replace 'value' with actual number
  const normalizedRule = rule.replace(/value/g, value);
  // Result: "3 >= 1"

  // Step 2: Evaluate the expression
  return eval(normalizedRule);
  // Result: true
}
export function calculateFine(tasks) {
  let failedCount = 0;
  const failedTasks = [];

  for (const task of tasks) {
    if (!task.completed) {
      failedCount++;
      failedTasks.push(task.taskType.key || task.taskType._id.toString());
    }
  }

  // Each failed task = ₹100, max ₹200
  const fine = Math.min(failedCount * 100, 200);

  return {
    fine,
    failedTasks,
    failedCount
  };
}

export function getDateRange(days = 30) {
  const dates = [];
  const today = getTodayIST();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}





// .env.local example
/*
MONGODB_URI=mongodb://localhost:27017/friend-tracker
# or MongoDB Atlas:

CRON_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
*/

// package.json dependencies
/*
{
  "dependencies": {
    "mongoose": "^8.0.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
*/