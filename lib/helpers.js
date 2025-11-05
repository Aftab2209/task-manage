// lib/helpers.js
import SpecialDay from '@/models/SpecialDay';

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

/**
 * Check if a given date is a weekend (Saturday or Sunday)
 */
function isWeekend(dateStr) {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Check if a given date is a special day (weekend OR in special_days collection)
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {Promise<boolean>}
 */
export async function isSpecialDay(dateStr) {
  // Check if it's a weekend first (no DB call needed)
  if (isWeekend(dateStr)) {
    return true;
  }

  // Check if it's in the special_days collection
  try {
    const specialDay = await SpecialDay.findOne({
      date: dateStr,
      active: true
    });
    return !!specialDay;
  } catch (error) {
    console.error('Error checking special day:', error);
    return false; // Fail gracefully - treat as regular day
  }
}

/**
 * Get the effective completion rule for a task type based on whether it's a special day
 * @param {Object} taskType - TaskType document
 * @param {boolean} isSpecial - Whether it's a special day
 * @returns {string} - The completion rule to use
 */
export function getEffectiveRule(taskType, isSpecial) {
  // If it's a special day AND specialDayCompletionRule exists, use it
  if (isSpecial && taskType.specialDayCompletionRule) {
    return taskType.specialDayCompletionRule;
  }
  // Otherwise, use the regular rule
  return taskType.completionRule;
}

/**
 * Evaluate a completion rule against a value
 */
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

/**
 * Calculate fine for a set of tasks
 * @param {Array} tasks - Array of task objects with taskType populated
 * @returns {Object} - { fine, failedTasks, failedCount }
 */
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