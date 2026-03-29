// ============================================
// ⚔️ MiMo Effect Engine - محرك التأثيرات المتسلسلة
// ============================================
// كل أمر = Primary Action + System Effects
// الفكرة: أي حركة صغيرة = تأثير ضخم على النظام كله

import { generateId } from '@/lib/utils';

// ============================================
// 🎯 Types
// ============================================

export interface EffectResult {
  success: boolean;
  xpEarned: number;
  effects: string[];
  alerts?: string[];
  achievements?: string[];
}

export interface StudyEffectData {
  subject: string;
  hours: number;
  minutes?: number;
  topic?: string;
}

export interface TransactionEffectData {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

export interface TaskEffectData {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  dueDate?: Date;
}

export interface ExamEffectData {
  title: string;
  subject: string;
  date: Date;
}

export interface HabitEffectData {
  habitId: string;
  habitName: string;
}

export interface WorkoutEffectData {
  type: string;
  duration: number; // بالدقائق
  calories?: number;
}

// ============================================
// 🧠 Effect Engine Class
// ============================================

export class EffectEngine {
  private setXP: (xp: number, action: string) => void;
  private addStudySession: (session: any) => void;
  private updateSkill: (id: string, data: any) => void;
  private addTransaction: (transaction: any) => void;
  private addTask: (task: any) => void;
  private addExam: (exam: any) => void;
  private completeHabit: (id: string) => void;
  private addWorkout: (workout: any) => void;
  private addAlert: (alert: any) => void;
  private updateStreak: () => void;
  private skills: any[];
  private performance: any;
  private transactions: any[];

  constructor(store: {
    addXP: (xp: number, action: string) => void;
    addStudySession: (session: any) => void;
    updateSkill: (id: string, data: any) => void;
    addTransaction: (transaction: any) => void;
    addAssignment: (task: any) => void;
    addExam: (exam: any) => void;
    completeHabit: (id: string) => void;
    addWorkoutSession: (workout: any) => void;
    addDailyRecord: (record: any) => void;
    updateStreak: () => void;
    skills: any[];
    performance: any;
    transactions: any[];
  }) {
    this.setXP = store.addXP;
    this.addStudySession = store.addStudySession;
    this.updateSkill = store.updateSkill;
    this.addTransaction = store.addTransaction;
    this.addTask = store.addAssignment;
    this.addExam = store.addExam;
    this.completeHabit = store.completeHabit;
    this.addWorkout = store.addWorkoutSession;
    this.updateStreak = store.updateStreak;
    this.skills = store.skills;
    this.performance = store.performance;
    this.transactions = store.transactions;
  }

  // ============================================
  // 📚 STUDY EFFECTS - تأثيرات الدراسة
  // ============================================

  applyStudyEffects(data: StudyEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    const totalMinutes = (data.hours * 60) + (data.minutes || 0);
    
    // 1️⃣ Primary Action - تسجيل جلسة الدراسة
    this.addStudySession({
      id: generateId(),
      subject: data.subject,
      topic: data.topic,
      duration: totalMinutes,
      completed: true,
      date: new Date(),
      createdAt: new Date()
    });
    effects.push(`📚 سجلت ${data.hours} ساعة دراسة في ${data.subject}`);

    // 2️⃣ XP Reward - مكافأة XP
    const xpEarned = Math.round(totalMinutes * 2); // دقيقتين = 1 XP
    this.setXP(xpEarned, `دراسة ${data.subject}`);
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    // 3️⃣ Skill Update - تحديث المهارة
    const skill = this.skills.find((s: any) => 
      s.name.toLowerCase().includes(data.subject.toLowerCase()) ||
      data.subject.toLowerCase().includes(s.name.toLowerCase())
    );
    if (skill) {
      this.updateSkill(skill.id, {
        practiceHours: (skill.practiceHours || 0) + data.hours,
        progress: Math.min(100, (skill.progress || 0) + (data.hours * 2))
      });
      effects.push(`🎯 تطورت مهارة ${skill.name}`);
    }

    // 4️⃣ Streak Update - تحديث التتابع
    this.updateStreak();
    effects.push(`🔥 حافظت على التتابع`);

    // 5️⃣ Level Check - فحص المستوى
    const newLevel = Math.floor((this.performance.totalXP + xpEarned) / 500) + 1;
    if (newLevel > this.performance.level) {
      alerts.push(`🎉 مبروك! وصلت للمستوى ${newLevel}!`);
    }

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 💰 TRANSACTION EFFECTS - تأثيرات المالية
  // ============================================

  applyTransactionEffects(data: TransactionEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = 5; // XP أساسي

    // 1️⃣ Primary Action - تسجيل المعاملة
    this.addTransaction({
      id: generateId(),
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(),
      createdAt: new Date()
    });

    if (data.type === 'expense') {
      effects.push(`💸 سجلت مصروف: ${data.amount} شيكل على ${data.description}`);
      
      // 2️⃣ Alert for high spending
      const todayExpenses = this.transactions
        .filter((t: any) => 
          t.type === 'expense' && 
          new Date(t.date).toDateString() === new Date().toDateString()
        )
        .reduce((sum: number, t: any) => sum + t.amount, 0) + data.amount;
      
      if (data.amount > 100) {
        alerts.push(`⚠️ صرف كبير: ${data.amount} شيكل`);
        xpEarned = 0; // لا XP للصرف الكبير
      }
      
      if (todayExpenses > 200) {
        alerts.push(`🚨 صرفك اليوم عالي: ${todayExpenses} شيكل`);
      }
    } else {
      effects.push(`💰 سجلت دخل: ${data.amount} شيكل من ${data.description}`);
      xpEarned = Math.round(data.amount / 10); // 10% من الدخل كـ XP
      effects.push(`⭐ كسبت +${xpEarned} XP`);
    }

    this.setXP(xpEarned, data.type === 'income' ? 'تسجيل دخل' : 'تسجيل مصروف');

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 📋 TASK EFFECTS - تأثيرات المهام
  // ============================================

  applyTaskEffects(data: TaskEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = 10;

    // 1️⃣ Primary Action - إضافة المهمة
    this.addTask({
      id: generateId(),
      title: data.title,
      priority: data.priority,
      category: data.category,
      dueDate: data.dueDate || new Date(),
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    effects.push(`📝 أضفت مهمة: ${data.title}`);

    // 2️⃣ Priority Effects - تأثيرات الأولوية
    switch (data.priority) {
      case 'critical':
        xpEarned = 25;
        alerts.push(`🔥 مهمة حرجة: ${data.title}`);
        break;
      case 'high':
        xpEarned = 15;
        alerts.push(`⚡ مهمة عالية الأولوية`);
        break;
      case 'medium':
        xpEarned = 10;
        break;
      case 'low':
        xpEarned = 5;
        break;
    }

    this.setXP(xpEarned, 'إضافة مهمة');
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 📝 COMPLETE TASK EFFECTS - تأثيرات إنجاز المهام
  // ============================================

  applyCompleteTaskEffects(taskTitle: string, priority: string): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = 20;

    effects.push(`✅ أنجزت: ${taskTitle}`);

    // XP حسب الأولوية
    switch (priority) {
      case 'critical':
        xpEarned = 100;
        effects.push('🏆 مهمة حرجة مكتملة!');
        break;
      case 'high':
        xpEarned = 50;
        effects.push('🎯 مهمة عالية الأولوية مكتملة!');
        break;
      case 'medium':
        xpEarned = 30;
        break;
      case 'low':
        xpEarned = 15;
        break;
    }

    this.setXP(xpEarned, `إنجاز: ${taskTitle}`);
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    // تحديث Streak
    this.updateStreak();

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 📚 EXAM EFFECTS - تأثيرات الاختبارات
  // ============================================

  applyExamEffects(data: ExamEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = 15;

    // 1️⃣ Primary Action - إضافة الاختبار
    this.addExam({
      id: generateId(),
      title: data.title,
      subject: data.subject,
      examDate: data.date,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    effects.push(`📅 أضفت اختبار: ${data.title}`);

    // 2️⃣ Calculate days remaining
    const daysUntil = Math.ceil((data.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 3) {
      alerts.push(`🚨 اختبار ${data.subject} بعد ${daysUntil} أيام فقط!`);
      xpEarned = 25;
      effects.push('⚡ أولوية قصوى!');
    } else if (daysUntil <= 7) {
      alerts.push(`⚠️ اختبار ${data.subject} بعد ${daysUntil} أيام`);
      xpEarned = 20;
    }

    this.setXP(xpEarned, `إضافة اختبار: ${data.subject}`);
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    // 3️⃣ Auto-create study tasks
    const studyTasks = [
      `مراجعة ${data.subject} - الفصل الأول`,
      `حل أسئلة ${data.subject} السابقة`,
      `مراجعة نهائية لـ ${data.subject}`
    ];

    studyTasks.forEach((task, index) => {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + index);
      this.addTask({
        id: generateId(),
        title: task,
        priority: 'high',
        dueDate: taskDate,
        status: 'todo',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    effects.push(`📋 أنشأت ${studyTasks.length} مهام دراسة تلقائية`);

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 🔄 HABIT EFFECTS - تأثيرات العادات
  // ============================================

  applyHabitEffects(data: HabitEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = 15;

    // 1️⃣ Primary Action - إكمال العادة
    this.completeHabit(data.habitId);
    effects.push(`✨ أكملت عادة: ${data.habitName}`);

    // 2️⃣ XP for habit
    this.setXP(xpEarned, `عادة يومية: ${data.habitName}`);
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    // 3️⃣ Streak bonus
    this.updateStreak();
    effects.push(`🔥 حافظت على التتابع`);

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }

  // ============================================
  // 🏋️ WORKOUT EFFECTS - تأثيرات الرياضة
  // ============================================

  applyWorkoutEffects(data: WorkoutEffectData): EffectResult {
    const effects: string[] = [];
    const alerts: string[] = [];
    let xpEarned = Math.round(data.duration * 1.5); // 1.5 XP لكل دقيقة

    // 1️⃣ Primary Action - تسجيل التمرين
    this.addWorkout({
      id: generateId(),
      type: data.type,
      duration: data.duration,
      calories: data.calories,
      date: new Date(),
      createdAt: new Date()
    });
    effects.push(`🏋️ سجلت تمرين ${data.type} - ${data.duration} دقيقة`);

    // 2️⃣ XP Reward
    this.setXP(xpEarned, `تمرين ${data.type}`);
    effects.push(`⭐ كسبت +${xpEarned} XP`);

    // 3️⃣ Calories bonus
    if (data.calories && data.calories > 200) {
      xpEarned += 10;
      this.setXP(10, 'حرق سعرات إضافية');
      effects.push(`🔥 حرق ${data.calories} سعرة! +10 XP`);
    }

    return {
      success: true,
      xpEarned,
      effects,
      alerts
    };
  }
}

// ============================================
// 🎯 Helper Function - تحديد نوع الأمر
// ============================================

export function detectCommandType(text: string): string {
  const lower = text.toLowerCase();
  
  // دراسة
  if (lower.includes('درست') || lower.includes('دراسة') || lower.includes('ساعات') || lower.includes('ساعة')) {
    return 'record_study';
  }
  
  // مصروف/دخل
  if (lower.includes('صرفت') || lower.includes('دفع') || lower.includes('اشتريت') || 
      lower.includes('حصلت') || lower.includes('جمعت') || lower.includes('شيكل')) {
    return 'add_transaction';
  }
  
  // اختبار
  if (lower.includes('اختبار') || lower.includes('امتحان') || lower.includes('اختباري')) {
    return 'add_exam';
  }
  
  // مهمة
  if (lower.includes('مهمة') || lower.includes('واجب') || lower.includes('أسوي') || lower.includes('أعمل')) {
    return 'add_task';
  }
  
  // رياضة
  if (lower.includes('تمرين') || lower.includes('رياضة') || lower.includes('جري') || lower.includes('مشيت')) {
    return 'record_workout';
  }
  
  // عادة
  if (lower.includes('أكملت عادة') || lower.includes('سويت عادة')) {
    return 'complete_habit';
  }
  
  return 'general';
}

// ============================================
// 🔢 Extract Numbers from Text
// ============================================

export function extractNumbers(text: string): number[] {
  const numbers = text.match(/\d+/g);
  return numbers ? numbers.map(Number) : [];
}
