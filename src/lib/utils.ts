import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format time only
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Get day name from day of week
export function getDayName(dayOfWeek: number, short = false): string {
  const days = short 
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
}

// Get current week number of semester
export function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();
  const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, week);
}

// Check if date is today
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// Check if date is overdue
export function isOverdue(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  return d < now;
}

// Get days until deadline
export function getDaysUntil(date: Date | string): number {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

// Calculate GPA from grades
export function calculateGPA(grades: { credits: number; gradePoint?: number }[]): number {
  if (grades.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const grade of grades) {
    if (grade.gradePoint !== undefined) {
      totalPoints += grade.credits * grade.gradePoint;
      totalCredits += grade.credits;
    }
  }
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

// Convert score to grade point
export function scoreToGradePoint(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 85) return 3.7;
  if (score >= 80) return 3.3;
  if (score >= 75) return 3.0;
  if (score >= 70) return 2.7;
  if (score >= 65) return 2.3;
  if (score >= 60) return 2.0;
  if (score >= 55) return 1.7;
  if (score >= 50) return 1.0;
  return 0;
}

// Get letter grade from score
export function getLetterGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

// Course color palette
export const courseColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#0ea5e9', // sky
];

// Get random course color
export function getRandomCourseColor(): string {
  return courseColors[Math.floor(Math.random() * courseColors.length)];
}

// Format credits display
export function formatCredits(credits: number): string {
  return credits.toFixed(1);
}

// Parse time string to minutes
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if time overlaps
export function hasTimeOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// Generate initials from course name
export function getCourseInitials(name: string): string {
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Sort courses by time
export function sortByTime<T extends { startTime: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
}

// Format duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

// Get week dates
export function getWeekDates(date: Date = new Date()): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const dates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(d);
    newDate.setDate(d.getDate() - day + i);
    dates.push(newDate);
  }
  
  return dates;
}

// Check if schedule is in current week
export function isInWeek(
  schedule: { weekStart?: number; weekEnd?: number },
  currentWeek: number
): boolean {
  if (!schedule.weekStart || !schedule.weekEnd) return true;
  return currentWeek >= schedule.weekStart && currentWeek <= schedule.weekEnd;
}
