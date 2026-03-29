'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Wrench, GraduationCap, Briefcase, Globe, FileText,
  Wallet, Settings, ChevronDown, Menu, X, Plus, Check,
  Clock, Target, Flame, Brain, Sparkles,
  AlertCircle, Calendar, BarChart3, Star, Heart,
  CheckCircle2, Circle, Zap, Trash2, Send, Bot, User,
  Lightbulb, Rocket, Trophy, TrendingUp, Archive, Image, Video,
  Edit3, Save, FolderOpen, Tag, Eye, Download, Upload,
  Award, Medal, Crown, Diamond, Shield, Swords, Timer,
  Bell, BellRing, AlertTriangle, Info, CheckCheck, XCircle,
  Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX
} from 'lucide-react';
import MiMoAIView from '@/components/mimo-chat';
import { cn, generateId, getDaysUntil } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { NavigationView, Priority, BMSComponent, ExecutionTask, SmartAlert, Skill, BusinessIdea, Note, NoteFolder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// ============================================
// 📝 النصوص العربية - MiMo Style
// ============================================
const text = {
  appName: 'MiMo Life OS',
  welcome: 'مرحباً، محمد! 👋',
  home: 'الرئيسية',
  tawjihi: 'التوجيهي',
  bmsProject: 'مشروع التخرج',
  university: 'المنحة والجامعة',
  business: 'المشاريع',
  notes: 'الملاحظات',
  finance: 'المالية',
  settings: 'الإعدادات',
  warMode: 'وضع التركيز',
  aiAssistant: 'MiMo AI',
  vision: 'رؤية الحياة',
  skills: 'المهارات',
  archive: 'الأرشيف',
  media: 'الوسائط',
};

// بيانات الرسم البياني
const weeklyStudyData = [
  { day: 'السبت', hours: 2.5 },
  { day: 'الأحد', hours: 3.2 },
  { day: 'الاثنين', hours: 1.8 },
  { day: 'الثلاثاء', hours: 4.1 },
  { day: 'الأربعاء', hours: 2.9 },
  { day: 'الخميس', hours: 3.5 },
  { day: 'الجمعة', hours: 1.2 },
];

// ألوان للرسوم البيانية
const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#eab308'];

// شارة الحالة
const StatusBadge = ({ status, label }: { status: string; label?: string }) => {
  const config: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-700' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    overdue: { bg: 'bg-red-100', text: 'text-red-700' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', c.bg, c.text)}>
      {label || status}
    </span>
  );
};

// ============================================
// 🎯 نظام المهام اليومية التلقائية
// ============================================
const DailyMissionsCard = () => {
  const { dailyMissions, generateDailyMissions, completeMission } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    const today = new Date().toDateString();
    const hasTodayMissions = dailyMissions.some(m => new Date(m.date).toDateString() === today);
    if (!hasTodayMissions) {
      generateDailyMissions();
    }
  }, [mounted, dailyMissions, generateDailyMissions]);
  
  const todayMissions = mounted ? dailyMissions.filter(m => 
    new Date(m.date).toDateString() === new Date().toDateString()
  ).slice(0, 3) : [];
  
  const handleComplete = (id: string) => {
    completeMission(id);
    toast.success('تم إنجاز المهمة! +10 نقاط');
  };
  
  if (!mounted) return null;
  
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900">
          <Target className="h-4 w-4 text-orange-500" />
          مهام اليوم
          <Badge variant="secondary" className="text-xs">{todayMissions.filter(m => m.completed).length}/{todayMissions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {todayMissions.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-gray-500 text-sm">لا توجد مهام لليوم</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayMissions.map((mission) => (
              <div 
                key={mission.id} 
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer",
                  mission.completed ? "bg-green-100 opacity-75" : "bg-white hover:shadow-sm"
                )}
                onClick={() => !mission.completed && handleComplete(mission.id)}
              >
                {mission.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    mission.completed ? "text-gray-500 line-through" : "text-gray-900"
                  )}>{mission.title}</p>
                  <p className="text-xs text-gray-500">{mission.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-bold text-orange-500">+{mission.xpReward}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// 🔔 نظام التنبيهات الذكية
// ============================================
const SmartAlertsCard = () => {
  const { alerts, generateAlerts, dismissAlert } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  
  useEffect(() => {
    if (mounted) {
      generateAlerts();
    }
  }, [mounted, generateAlerts]);
  
  const activeAlerts = mounted ? alerts.filter(a => !a.dismissed).slice(0, 3) : [];
  
  const alertIcons = {
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    critical: <AlertCircle className="h-4 w-4 text-red-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  };
  
  const alertBg = {
    warning: 'bg-yellow-50 border-yellow-200',
    critical: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
  };
  
  if (!mounted || activeAlerts.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {activeAlerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={cn("flex items-start gap-2 p-3 rounded-lg border", alertBg[alert.type])}
        >
          {alertIcons[alert.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{alert.title}</p>
            <p className="text-xs text-gray-600">{alert.message}</p>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// 🏆 نظام الشارات والإنجازات
// ============================================
const AchievementsCard = () => {
  const { performance, streak, studySessions } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  
  const achievements = [
    { 
      id: 'first-session', 
      title: 'البداية', 
      desc: 'أول جلسة دراسة', 
      icon: Rocket, 
      unlocked: (studySessions?.length || 0) >= 1,
      color: 'text-blue-500'
    },
    { 
      id: 'streak-3', 
      title: 'مثابر', 
      desc: '3 أيام متتالية', 
      icon: Flame, 
      unlocked: streak.currentStreak >= 3,
      color: 'text-orange-500'
    },
    { 
      id: 'streak-7', 
      title: 'محارب', 
      desc: '7 أيام متتالية', 
      icon: Swords, 
      unlocked: streak.currentStreak >= 7,
      color: 'text-red-500'
    },
    { 
      id: 'xp-100', 
      title: 'متميز', 
      desc: '100 نقطة خبرة', 
      icon: Star, 
      unlocked: performance.totalXP >= 100,
      color: 'text-yellow-500'
    },
    { 
      id: 'xp-500', 
      title: 'خبير', 
      desc: '500 نقطة خبرة', 
      icon: Medal, 
      unlocked: performance.totalXP >= 500,
      color: 'text-purple-500'
    },
    { 
      id: 'level-5', 
      title: 'قائد', 
      desc: 'الوصول للمستوى 5', 
      icon: Crown, 
      unlocked: performance.level >= 5,
      color: 'text-amber-500'
    },
    { 
      id: 'sessions-10', 
      title: 'مجتهد', 
      desc: '10 جلسات دراسة', 
      icon: Trophy, 
      unlocked: (studySessions?.length || 0) >= 10,
      color: 'text-green-500'
    },
    { 
      id: 'hours-10', 
      title: 'عامل', 
      desc: '10 ساعات دراسة', 
      icon: Clock, 
      unlocked: performance.totalStudyHours >= 10,
      color: 'text-cyan-500'
    },
  ];
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  if (!mounted) return null;
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900">
          <Trophy className="h-4 w-4 text-yellow-500" />
          الإنجازات
          <Badge variant="secondary" className="text-xs">{unlockedCount}/{achievements.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-4 gap-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all",
                ach.unlocked ? "bg-gradient-to-br from-yellow-50 to-orange-50" : "bg-gray-50 opacity-50"
              )}
              title={ach.desc}
            >
              <ach.icon className={cn("h-6 w-6 mb-1", ach.unlocked ? ach.color : "text-gray-400")} />
              <span className="text-xs text-center text-gray-700">{ach.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// 📊 لوحة الإحصائيات المتقدمة
// ============================================
const StatsPanel = () => {
  const { performance, studySessions, streak } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  
  if (!mounted) return null;
  
  // بيانات آخر 7 أيام
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toDateString();
    const daySessions = (studySessions || []).filter(s => 
      new Date(s.date).toDateString() === dayStr
    );
    const totalHours = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    return {
      day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
      hours: totalHours,
      sessions: daySessions.length
    };
  });
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          إحصائيات الأسبوع
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                formatter={(value: number) => [`${value.toFixed(1)} ساعة`, 'الدراسة']}
              />
              <Line type="monotone" dataKey="hours" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <p className="text-lg font-bold text-orange-600">{last7Days.reduce((s, d) => s + d.hours, 0).toFixed(1)}</p>
            <p className="text-xs text-gray-500">ساعات الأسبوع</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{last7Days.reduce((s, d) => s + d.sessions, 0)}</p>
            <p className="text-xs text-gray-500">جلسات</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-600">{streak.currentStreak}</p>
            <p className="text-xs text-gray-500">أيام متتالية</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// ⚔️ وضع Hard Mode
// ============================================
const HardModeToggle = () => {
  const { hardMode, toggleHardMode } = useStore();
  
  return (
    <Card className={cn(
      "shadow-sm transition-all",
      hardMode.enabled ? "bg-gradient-to-br from-red-500 to-orange-500 text-white" : "bg-white"
    )}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              hardMode.enabled ? "bg-white/20" : "bg-red-100"
            )}>
              <Swords className={cn("h-5 w-5", hardMode.enabled ? "text-white" : "text-red-500")} />
            </div>
            <div>
              <h3 className={cn("font-bold", hardMode.enabled ? "text-white" : "text-gray-900")}>
                وضع المحارب
              </h3>
              <p className={cn("text-xs", hardMode.enabled ? "text-white/80" : "text-gray-500")}>
                {hardMode.enabled ? `${hardMode.stats.daysActive} يوم نشط` : "تحديات أصعب = مكافآت أكبر"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleHardMode}
            className={cn(
              "w-14 h-8 rounded-full transition-all relative",
              hardMode.enabled ? "bg-white/30" : "bg-gray-200"
            )}
          >
            <motion.div
              className={cn(
                "absolute top-1 w-6 h-6 rounded-full shadow",
                hardMode.enabled ? "bg-white right-1" : "bg-white left-1"
              )}
              animate={{ x: hardMode.enabled ? 0 : 0 }}
            />
          </button>
        </div>
        {hardMode.enabled && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white/20 rounded-lg">
              <p className="text-lg font-bold">{hardMode.stats.tasksCompleted}</p>
              <p className="text-xs text-white/80">مهام</p>
            </div>
            <div className="text-center p-2 bg-white/20 rounded-lg">
              <p className="text-lg font-bold">{hardMode.stats.xpEarned}</p>
              <p className="text-xs text-white/80">نقاط</p>
            </div>
            <div className="text-center p-2 bg-white/20 rounded-lg">
              <p className="text-lg font-bold">×{hardMode.xpMultiplier}</p>
              <p className="text-xs text-white/80">مضاعف</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// 🏠 لوحة التحكم الرئيسية
// ============================================
const DashboardView = () => {
  const { 
    userProfile, tawjihiSubjects, tawjihiGoal, bmsComponents, 
    scholarshipRequirements, performance, streak, studySessions, 
    addMoodEntry, moodEntries, setWarModeModalOpen, setCurrentView
  } = useStore();
  
  const today = new Date();
  const todayStr = today.toDateString();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted on client
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);
  
  // Compute today's mood on client only
  const todayMood = mounted 
    ? moodEntries.find(m => new Date(m.date).toDateString() === todayStr) || null
    : null;
  
  // حساب الإحصائيات
  const totalStudyMinutes = (studySessions || [])
    .filter(s => new Date(s.date).toDateString() === todayStr && s.completed)
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  const todayStudyHours = Math.floor(totalStudyMinutes / 60);
  const todayStudyMins = totalStudyMinutes % 60;
  
  const calculatedGrade = tawjihiSubjects.reduce((sum, s) => sum + (s.grade || 0), 0);
  const gradeProgress = (calculatedGrade / tawjihiGoal.targetGrade) * 100;
  
  const bmsReceived = bmsComponents.filter(c => c.status === 'received' || c.status === 'integrated').length;
  const bmsProgress = bmsComponents.length > 0 ? (bmsReceived / bmsComponents.length) * 100 : 0;
  
  const scholarshipCompleted = scholarshipRequirements.filter(r => r.status === 'completed').length;
  const scholarshipProgress = scholarshipRequirements.length > 0 
    ? (scholarshipCompleted / scholarshipRequirements.length) * 100 : 0;
  
  const moodEmojis = [
    { id: 'excellent', emoji: '😊' },
    { id: 'good', emoji: '🙂' },
    { id: 'neutral', emoji: '😐' },
    { id: 'bad', emoji: '😔' },
    { id: 'terrible', emoji: '😫' },
  ];

  const handleSaveMood = () => {
    if (!selectedMood) return;
    const mood = moodEmojis.find(m => m.id === selectedMood);
    if (mood) {
      addMoodEntry({
        id: generateId(),
        date: today,
        mood: selectedMood as 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible',
        emoji: mood.emoji,
        createdAt: new Date(),
      });
      toast.success('تم حفظ المزاج!');
    }
  };

  const urgentTasks = [
    ...scholarshipRequirements.filter(r => r.status === 'pending').slice(0, 2).map(r => ({
      id: r.id, title: r.title, category: 'المنحة', priority: 'high' as Priority,
    })),
    ...bmsComponents.filter(c => c.status === 'needed').slice(0, 2).map(c => ({
      id: c.id, title: `الحصول على: ${c.name}`, category: 'مشروع BMS', priority: 'medium' as Priority,
    })),
  ];

  const quotes = [
    { text: 'النجاح ليس نهاية المطاف، والفشل ليس قاتلاً.', author: 'ونستون تشرشل' },
    { text: 'الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.', author: 'ستيف جوبز' },
    { text: 'المثابرة هي سر النجاح في كل مجال.', author: 'ألبرت أينشتاين' },
    { text: 'لا تخف من الفشل، بل خف من عدم المحاولة.', author: 'روي بينيت' },
    { text: 'كل يوم هو فرصة جديدة للتغيير.', author: 'مجهول' },
  ];
  const dailyQuote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* الترحيب */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-gray-500 text-xs sm:text-sm" suppressHydrationWarning>
              {today.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{text.welcome}</h1>
          <p className="text-gray-500 text-sm">{userProfile.location}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs sm:text-sm"
            onClick={() => setCurrentView('ai-agent')}
          >
            <Brain className="h-4 w-4 ml-1" />
            <span className="hidden sm:inline">{text.aiAssistant}</span>
          </Button>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm"
            onClick={() => setWarModeModalOpen(true)}
          >
            <Flame className="h-4 w-4 ml-1" />
            {text.warMode}
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات - 4 أعمدة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock, value: `${todayStudyHours}س ${todayStudyMins}د`, label: 'دراسة اليوم', color: 'blue' },
          { icon: CheckCircle2, value: performance.sessionsCompleted, label: 'جلسات', color: 'green' },
          { icon: Star, value: performance.totalXP, label: 'نقاط', color: 'yellow' },
          { icon: Flame, value: streak.currentStreak, label: 'متتالي', color: 'orange' },
        ].map((stat, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <stat.icon className={cn('h-6 w-6 mb-2', 
                stat.color === 'blue' ? 'text-blue-500' :
                stat.color === 'green' ? 'text-green-500' :
                stat.color === 'yellow' ? 'text-yellow-500' : 'text-orange-500'
              )} />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-xs sm:text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* مهام اليوم + التنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DailyMissionsCard />
        <div>
          <SmartAlertsCard />
          <HardModeToggle />
        </div>
      </div>

      {/* التقدم في الأهداف - 3 أعمدة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* التوجيهي */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <BookOpen className="h-4 w-4 text-blue-500" />
              التوجيهي
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center mb-2">
              <span className="text-2xl font-bold text-gray-900">{calculatedGrade}</span>
              <span className="text-gray-400 text-sm"> / {tawjihiGoal.targetGrade}</span>
            </div>
            <Progress value={gradeProgress} className="h-2" />
            <p className="text-gray-500 text-xs text-center mt-2">
              {tawjihiGoal.targetGrade - calculatedGrade} نقطة للهدف
            </p>
          </CardContent>
        </Card>

        {/* مشروع BMS */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <Wrench className="h-4 w-4 text-purple-500" />
              مشروع BMS
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center mb-2">
              <span className="text-2xl font-bold text-gray-900">{bmsReceived}</span>
              <span className="text-gray-400 text-sm"> / {bmsComponents.length || 0}</span>
            </div>
            <Progress value={bmsProgress} className="h-2" />
            <p className="text-gray-500 text-xs text-center mt-2">{bmsProgress.toFixed(0)}%</p>
          </CardContent>
        </Card>

        {/* المنحة */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <GraduationCap className="h-4 w-4 text-green-500" />
              المنحة
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-center mb-2">
              <span className="text-2xl font-bold text-gray-900">{scholarshipCompleted}</span>
              <span className="text-gray-400 text-sm"> / {scholarshipRequirements.length}</span>
            </div>
            <Progress value={scholarshipProgress} className="h-2" />
            <p className="text-gray-500 text-xs text-center mt-2">{scholarshipProgress.toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* الإحصائيات + الإنجازات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StatsPanel />
        <AchievementsCard />
      </div>

      {/* المهام العاجلة + المزاج */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* المهام العاجلة - عمودين */}
        <Card className="bg-white shadow-sm lg:col-span-2">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <AlertCircle className="h-4 w-4 text-red-500" />
              المهام العاجلة
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                <p className="text-gray-500 text-sm">لا توجد مهام عاجلة!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{task.title}</p>
                      <p className="text-gray-500 text-xs">{task.category}</p>
                    </div>
                    <StatusBadge 
                      status={task.priority === 'high' ? 'overdue' : 'pending'} 
                      label={task.priority === 'high' ? 'عاجل' : 'متوسط'} 
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* المزاج - عمود واحد */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <Heart className="h-4 w-4 text-pink-500" />
              المزاج
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {todayMood ? (
              <div className="text-center py-4">
                <span className="text-3xl">{todayMood.emoji}</span>
                <p className="text-gray-500 text-xs mt-1">تم التسجيل</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center gap-1">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all',
                        selectedMood === mood.id 
                          ? 'bg-blue-100 ring-2 ring-blue-500' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      )}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
                {selectedMood && (
                  <Button onClick={handleSaveMood} size="sm" className="w-full bg-blue-500 text-white">
                    حفظ
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* الاقتباس */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <Sparkles className="h-6 w-6 mx-auto mb-3 text-yellow-500" />
            <blockquote className="text-base text-gray-800 font-medium mb-2">
              &quot;{dailyQuote.text}&quot;
            </blockquote>
            <p className="text-gray-500 text-xs">— {dailyQuote.author}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// 📚 قسم التوجيهي
// ============================================
const TawjihiView = () => {
  const { tawjihiSubjects, tawjihiGoal, updateTawjihiSubject } = useStore();
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<string>('');

  const academicSubjects = tawjihiSubjects.filter(s => s.type === 'academic');
  const vocationalSubjects = tawjihiSubjects.filter(s => s.type === 'vocational');

  const totalGrade = tawjihiSubjects.reduce((sum, s) => sum + (s.grade || 0), 0);
  const gradeProgress = (totalGrade / 500) * 100;

  const handleSaveGrade = (subjectId: string) => {
    const grade = parseFloat(tempGrade);
    if (!isNaN(grade) && grade >= 0) {
      updateTawjihiSubject(subjectId, { grade });
      toast.success('تم حفظ الدرجة!');
    }
    setEditingSubject(null);
    setTempGrade('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* الهدف */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold">الهدف: {tawjihiGoal.targetGrade} من 500</h2>
              <p className="text-blue-100 text-sm">المجموع الحالي: {totalGrade}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{gradeProgress.toFixed(1)}%</p>
            </div>
          </div>
          <Progress value={gradeProgress} className="h-2 mt-3 bg-white/20" />
        </CardContent>
      </Card>

      {/* المواد الأكاديمية */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <BookOpen className="h-4 w-4 text-blue-500" />
            المواد الأكاديمية
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {academicSubjects.map((subject) => (
              <div key={subject.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{subject.name}</h3>
                  {editingSubject === subject.id ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={tempGrade}
                        onChange={(e) => setTempGrade(e.target.value)}
                        className="w-16 h-7 text-sm"
                      />
                      <Button size="sm" onClick={() => handleSaveGrade(subject.id)} className="h-7 w-7 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingSubject(subject.id);
                        setTempGrade(subject.grade?.toString() || '');
                      }}
                      className="text-xl font-bold text-gray-900 hover:text-blue-500"
                    >
                      {subject.grade || 0}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>من {subject.maxGrade}</span>
                  <Progress 
                    value={((subject.grade || 0) / subject.maxGrade) * 100} 
                    className="w-16 h-1" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* المواد المهنية */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Wrench className="h-4 w-4 text-purple-500" />
            المواد المهنية
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vocationalSubjects.map((subject) => (
              <div key={subject.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{subject.name}</h3>
                    {subject.category && <Badge variant="secondary" className="mt-1 text-xs">{subject.category}</Badge>}
                  </div>
                  {editingSubject === subject.id ? (
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        value={tempGrade}
                        onChange={(e) => setTempGrade(e.target.value)}
                        className="w-16 h-7 text-sm"
                      />
                      <Button size="sm" onClick={() => handleSaveGrade(subject.id)} className="h-7 w-7 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingSubject(subject.id);
                        setTempGrade(subject.grade?.toString() || '');
                      }}
                      className="text-xl font-bold text-gray-900 hover:text-purple-500"
                    >
                      {subject.grade || 0}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>من {subject.maxGrade}</span>
                  <Progress 
                    value={((subject.grade || 0) / subject.maxGrade) * 100} 
                    className="w-16 h-1" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// 🔧 قسم مشروع BMS
// ============================================
const BMSProjectView = () => {
  const { bmsComponents, bmsProgress, addBMSComponent, updateBMSComponent, deleteBMSComponent } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newComponent, setNewComponent] = useState<Partial<BMSComponent>>({
    name: '', category: 'other', status: 'needed', quantity: 1,
  });

  const statusLabels: Record<string, string> = {
    needed: 'مطلوب', ordered: 'تم الطلب', received: 'تم الاستلام', integrated: 'تم التركيب', tested: 'تم الاختبار',
  };

  const categoryLabels: Record<string, string> = {
    microcontroller: 'متحكم', sensor: 'مستشعر', actuator: 'محرك', communication: 'اتصالات', power: 'طاقة', other: 'أخرى',
  };

  const handleAddComponent = () => {
    if (!newComponent.name) return;
    addBMSComponent({
      id: generateId(),
      name: newComponent.name || '',
      category: newComponent.category || 'other',
      status: newComponent.status || 'needed',
      quantity: newComponent.quantity || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewComponent({ name: '', category: 'other', status: 'needed', quantity: 1 });
    setIsAddDialogOpen(false);
    toast.success('تم إضافة المكون!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* مراحل المشروع */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Target className="h-4 w-4 text-purple-500" />
            مراحل المشروع
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            {bmsProgress.map((phase, index) => (
              <div key={phase.id} className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                  phase.status === 'completed' ? 'bg-green-500' :
                  phase.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                )}>
                  {phase.status === 'completed' ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">{phase.phase}</span>
                    <span className="text-xs text-gray-500">{phase.progress}%</span>
                  </div>
                  <Progress value={phase.progress} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* المكونات */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Wrench className="h-4 w-4 text-blue-500" />
            المكونات
          </CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 ml-1" />
            إضافة
          </Button>
        </CardHeader>
        <CardContent className="pb-4">
          {bmsComponents.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد مكونات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bmsComponents.map((component) => (
                <div key={component.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{component.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">{categoryLabels[component.category]}</Badge>
                      <span className="text-gray-500 text-xs">×{component.quantity}</span>
                    </div>
                  </div>
                  <Select
                    value={component.status}
                    onValueChange={(value) => updateBMSComponent(component.id, { status: value as BMSComponent['status'] })}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBMSComponent(component.id)}
                    className="h-8 w-8 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* حوار الإضافة */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>إضافة مكون</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">اسم المكون</Label>
              <Input
                value={newComponent.name}
                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                placeholder="Arduino Mega"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newComponent.category}
                onValueChange={(value) => setNewComponent({ ...newComponent, category: value as BMSComponent['category'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">الكمية</Label>
              <Input
                type="number"
                value={newComponent.quantity}
                onChange={(e) => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddComponent} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🎓 قسم المنحة
// ============================================
const UniversityView = () => {
  const { scholarshipRequirements, updateScholarshipRequirement, chinaPreparations, updateChinaPreparation } = useStore();

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
  };

  const completedCount = scholarshipRequirements.filter(r => r.status === 'completed').length;
  const progressPercent = (completedCount / scholarshipRequirements.length) * 100;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* معلومات الجامعة */}
      <Card className="bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🇨🇳</div>
            <div>
              <h2 className="text-xl font-bold">جامعة هونان للتكنولوجيا</h2>
              <p className="text-yellow-100 text-sm">تشانغشا، الصين</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span>التقدم</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* المتطلبات */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">المتطلبات</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {scholarshipRequirements.map((req) => (
              <div key={req.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{req.title}</p>
                  <p className="text-xs text-gray-500">{req.category}</p>
                </div>
                <Select
                  value={req.status}
                  onValueChange={(value) => updateScholarshipRequirement(req.id, { status: value as any })}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* التحضيرات للصين */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">التحضيرات للصين</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2">
            {chinaPreparations.map((prep) => (
              <div key={prep.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{prep.title}</p>
                  <p className="text-xs text-gray-500">{prep.category}</p>
                </div>
                <Select
                  value={prep.status}
                  onValueChange={(value) => updateChinaPreparation(prep.id, { status: value as any })}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// 💼 قسم المشاريع (مُصلح)
// ============================================
const BusinessView = () => {
  const { businessIdeas, addBusinessIdea, updateBusinessIdea, deleteBusinessIdea, projectPortfolio, addProject } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [newIdea, setNewIdea] = useState<Partial<BusinessIdea>>({
    title: '',
    description: '',
    category: 'other',
    status: 'idea',
    priority: 'medium',
    tags: []
  });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'other' as const,
    technologies: ''
  });

  const categoryLabels: Record<string, string> = {
    security: 'أمن',
    smart_home: 'منزل ذكي',
    consulting: 'استشارات',
    education: 'تعليم',
    other: 'أخرى',
  };

  const statusLabels: Record<string, string> = {
    idea: 'فكرة',
    planning: 'تخطيط',
    developing: 'تطوير',
    launched: 'منطلق',
    on_hold: 'معلق',
  };

  const handleAddIdea = () => {
    if (!newIdea.title) return;
    addBusinessIdea({
      id: generateId(),
      title: newIdea.title || '',
      description: newIdea.description || '',
      category: newIdea.category || 'other',
      status: newIdea.status || 'idea',
      priority: newIdea.priority || 'medium',
      tags: newIdea.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewIdea({ title: '', description: '', category: 'other', status: 'idea', priority: 'medium', tags: [] });
    setShowAddDialog(false);
    toast.success('تم إضافة الفكرة!');
  };

  const handleAddProject = () => {
    if (!newProject.title) return;
    addProject({
      id: generateId(),
      title: newProject.title,
      description: newProject.description,
      type: newProject.type,
      technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
      status: 'planning',
      images: [],
      notes: '',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewProject({ title: '', description: '', type: 'other', technologies: '' });
    setShowProjectDialog(false);
    toast.success('تم إضافة المشروع!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* أزرار الإضافة */}
      <div className="flex gap-2">
        <Button onClick={() => setShowAddDialog(true)} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Plus className="h-4 w-4 ml-1" />
          فكرة جديدة
        </Button>
        <Button onClick={() => setShowProjectDialog(true)} variant="outline" className="flex-1">
          <FolderOpen className="h-4 w-4 ml-1" />
          مشروع جديد
        </Button>
      </div>

      {/* أفكار تجارية */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            أفكار تجارية ({businessIdeas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {businessIdeas.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد أفكار بعد</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddDialog(true)}>
                أضف فكرتك الأولى
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {businessIdeas.map((idea) => (
                <div key={idea.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{idea.title}</h3>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Badge variant="secondary" className="text-xs">{categoryLabels[idea.category]}</Badge>
                        <Select
                          value={idea.status}
                          onValueChange={(value) => updateBusinessIdea(idea.id, { status: value as BusinessIdea['status'] })}
                        >
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBusinessIdea(idea.id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* معرض المشاريع */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Briefcase className="h-4 w-4 text-purple-500" />
            معرض المشاريع ({projectPortfolio.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {projectPortfolio.length === 0 ? (
            <div className="text-center py-6">
              <Briefcase className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد مشاريع بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectPortfolio.map((project) => (
                <div key={project.id} className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <h3 className="font-medium text-gray-900 text-sm">{project.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{project.description}</p>
                  <div className="mt-2">
                    <Progress value={project.progress} className="h-1" />
                    <p className="text-xs text-gray-400 mt-1">{project.progress}% مكتمل</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* حوار إضافة فكرة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>فكرة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">العنوان</Label>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="مشروع تطبيقي..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الوصف</Label>
              <textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="وصف مختصر للفكرة..."
                className="w-full h-20 p-2 rounded-lg border text-sm resize-none mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newIdea.category}
                onValueChange={(value) => setNewIdea({ ...newIdea, category: value as BusinessIdea['category'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddIdea} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار إضافة مشروع */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>مشروع جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">اسم المشروع</Label>
              <Input
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="نظام BMS الذكي"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الوصف</Label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="وصف المشروع..."
                className="w-full h-20 p-2 rounded-lg border text-sm resize-none mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">التقنيات (مفصولة بفواصل)</Label>
              <Input
                value={newProject.technologies}
                onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                placeholder="Arduino, Python, Sensors"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddProject} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 📝 قسم الملاحظات (مُصلح مع Markdown)
// ============================================
const NotesView = () => {
  const { notes, addNote, updateNote, deleteNote, folders, addFolder, currentNoteId, setCurrentNoteId } = useStore();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // تحميل الملاحظة الحالية
  useEffect(() => {
    if (currentNoteId) {
      const note = notes.find(n => n.id === currentNoteId);
      if (note) {
        requestAnimationFrame(() => {
          setTitle(note.title);
          setContent(note.content);
          setSelectedFolder(note.folderId);
        });
      }
    } else {
      requestAnimationFrame(() => {
        setTitle('');
        setContent('');
        setSelectedFolder(null);
      });
    }
  }, [currentNoteId, notes]);
  
  // حفظ تلقائي
  useEffect(() => {
    if (!title && !content) return;
    
    requestAnimationFrame(() => setAutoSaveStatus('saving'));
    const timer = setTimeout(() => {
      if (currentNoteId) {
        updateNote(currentNoteId, {
          title: title || 'بدون عنوان',
          content,
          folderId: selectedFolder,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          updatedAt: new Date()
        });
      } else if (title || content) {
        const newId = generateId();
        addNote({
          id: newId,
          title: title || 'بدون عنوان',
          content,
          folderId: selectedFolder,
          tags: [],
          isPinned: false,
          isFavorite: false,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setCurrentNoteId(newId);
      }
      requestAnimationFrame(() => setAutoSaveStatus('saved'));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [title, content, selectedFolder]);
  
  const handleNewNote = () => {
    setCurrentNoteId(null);
    setTitle('');
    setContent('');
    setSelectedFolder(null);
  };
  
  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({
      id: generateId(),
      name: newFolderName,
      parentId: null,
      order: folders.length,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setNewFolderName('');
    setShowFolderDialog(false);
    toast.success('تم إضافة المجلد!');
  };
  
  // محاكاة Markdown بسيط
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="mr-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📝 الملاحظات</h2>
          <p className="text-gray-500 text-xs">
            {autoSaveStatus === 'saved' ? '✓ محفوظ' : autoSaveStatus === 'saving' ? '⏳ جاري الحفظ...' : 'غير محفوظ'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 ml-1" />
            معاينة
          </Button>
          <Button size="sm" onClick={handleNewNote}>
            <Plus className="h-4 w-4 ml-1" />
            جديدة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* قائمة الملاحظات */}
        <Card className="bg-white shadow-sm lg:col-span-1">
          <CardHeader className="pb-2 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-700">الملاحظات ({notes.length})</CardTitle>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowFolderDialog(true)}>
                <FolderOpen className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">لا توجد ملاحظات</p>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setCurrentNoteId(note.id)}
                    className={cn(
                      "w-full text-right p-2 rounded-lg text-sm transition-colors",
                      currentNoteId === note.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                    )}
                  >
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-gray-400">{note.wordCount} كلمة</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* المحرر */}
        <Card className="bg-white shadow-sm lg:col-span-3">
          <CardContent className="pt-4 pb-4">
            <div className="space-y-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الملاحظة..."
                className="text-lg font-bold border-none shadow-none p-0 focus-visible:ring-0"
              />
              
              {showPreview ? (
                <div 
                  className="min-h-[300px] p-3 bg-gray-50 rounded-lg text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا... 

يدعم Markdown:
# عنوان كبير
## عنوان متوسط
**نص عريض**
*نص مائل*
`كود`
- قائمة"
                  className="w-full min-h-[300px] p-3 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{content.split(/\s+/).filter(Boolean).length} كلمة</span>
                {currentNoteId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteNote(currentNoteId);
                      handleNewNote();
                      toast.success('تم حذف الملاحظة');
                    }}
                    className="text-red-500 h-6"
                  >
                    <Trash2 className="h-3 w-3 ml-1" />
                    حذف
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* حوار إضافة مجلد */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="sm:max-w-xs bg-white">
          <DialogHeader>
            <DialogTitle>مجلد جديد</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="اسم المجلد"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddFolder} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 💰 قسم المالية
// ============================================
const FinanceView = () => {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'general',
    description: ''
  });

  const balance = transactions.reduce((sum, t) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categories = [
    { id: 'general', label: 'عام' },
    { id: 'study', label: 'دراسة' },
    { id: 'project', label: 'مشاريع' },
    { id: 'personal', label: 'شخصي' },
    { id: 'scholarship', label: 'منحة' },
  ];

  // بيانات للرسم البياني
  const expenseByCategory = categories.map(cat => ({
    name: cat.label,
    value: transactions.filter(t => t.type === 'expense' && t.category === cat.id).reduce((s, t) => s + t.amount, 0)
  })).filter(d => d.value > 0);

  const handleAdd = () => {
    if (!newTransaction.amount || !newTransaction.description) return;
    addTransaction({
      id: generateId(),
      type: newTransaction.type,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      description: newTransaction.description,
      date: new Date(),
      createdAt: new Date()
    });
    setNewTransaction({ type: 'expense', amount: '', category: 'general', description: '' });
    setShowAddDialog(false);
    toast.success('تم إضافة المعاملة!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ملخص الرصيد */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">الدخل</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
              <span className="text-xs text-red-600 font-medium">المصروفات</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{totalExpense.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "shadow-sm",
          balance >= 0 ? "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" : "bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200"
        )}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className={cn("h-4 w-4", balance >= 0 ? "text-blue-600" : "text-orange-600")} />
              <span className={cn("text-xs font-medium", balance >= 0 ? "text-blue-600" : "text-orange-600")}>الرصيد</span>
            </div>
            <p className={cn("text-2xl font-bold", balance >= 0 ? "text-blue-700" : "text-orange-700")}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* زر إضافة */}
      <Button 
        onClick={() => setShowAddDialog(true)} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      >
        <Plus className="h-4 w-4 ml-1" />
        إضافة معاملة جديدة
      </Button>

      {/* الرسم البياني */}
      {expenseByCategory.length > 0 && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base text-gray-900">توزيع المصروفات</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة المعاملات */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Clock className="h-4 w-4 text-gray-500" />
            آخر المعاملات
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {transactions.length === 0 ? (
            <div className="text-center py-6">
              <Wallet className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد معاملات</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.slice(-10).reverse().map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    t.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {t.type === 'income' 
                      ? <TrendingUp className="h-4 w-4 text-green-600" />
                      : <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                    <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold text-sm",
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => {
                        deleteTransaction(t.id);
                        toast.success('تم حذف المعاملة');
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>إضافة معاملة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  newTransaction.type === 'income' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                دخل
              </button>
              <button
                onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  newTransaction.type === 'expense' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                مصروف
              </button>
            </div>
            <div>
              <Label className="text-sm">المبلغ</Label>
              <Input
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(v) => setNewTransaction({...newTransaction, category: v})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">الوصف</Label>
              <Input
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                placeholder="وصف المعاملة"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAdd} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🌟 قسم رؤية الحياة
// ============================================
const VisionView = () => {
  const { visionBoard, yearlyGoals, skills, addVisionItem, updateVisionItem } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVision, setNewVision] = useState({
    title: '',
    category: 'education' as const,
    targetDate: ''
  });

  const lifeAreas = [
    {
      title: '🎓 التعليم',
      items: visionBoard.filter(v => v.category === 'education'),
      color: 'blue'
    },
    {
      title: '💼 المشاريع',
      items: visionBoard.filter(v => v.category === 'career'),
      color: 'purple'
    },
    {
      title: '🌍 الحياة',
      items: visionBoard.filter(v => v.category === 'travel' || v.category === 'personal'),
      color: 'green'
    },
    {
      title: '💡 التطوير',
      items: visionBoard.filter(v => v.category === 'financial'),
      color: 'orange'
    },
  ];

  const categoryLabels: Record<string, string> = {
    education: 'تعليم',
    career: 'مهنة',
    personal: 'شخصي',
    financial: 'مالي',
    travel: 'سفر',
    other: 'أخرى'
  };

  const statusLabels: Record<string, string> = {
    dreaming: 'حلم',
    planning: 'تخطيط',
    working: 'عمل',
    achieved: 'محقق'
  };

  const handleAddVision = () => {
    if (!newVision.title) return;
    addVisionItem({
      id: generateId(),
      title: newVision.title,
      category: newVision.category,
      status: 'dreaming',
      targetDate: newVision.targetDate ? new Date(newVision.targetDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setNewVision({ title: '', category: 'education', targetDate: '' });
    setShowAddDialog(false);
    toast.success('تم إضافة الهدف!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* الرؤية الكبرى */}
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl">
        <CardContent className="pt-6 pb-6">
          <div className="text-center">
            <Rocket className="h-10 w-10 mx-auto mb-3 opacity-90" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">رؤيتي للحياة</h2>
            <p className="text-white/90 text-sm sm:text-base max-w-lg mx-auto">
              أن أصبح مهندساً مبدعاً في مجال المباني الذكية، 
              وأساهم في تطوير التقنيات التي تجعل الحياة أسهل وأذكى.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* زر إضافة هدف */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة هدف جديد
      </Button>

      {/* مجالات الحياة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lifeAreas.map((area, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className={cn(
                "text-base",
                area.color === 'blue' ? 'text-blue-600' :
                area.color === 'purple' ? 'text-purple-600' :
                area.color === 'green' ? 'text-green-600' : 'text-orange-600'
              )}>
                {area.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {area.items.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-2">لا توجد أهداف</p>
              ) : (
                <ul className="space-y-2">
                  {area.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
                      <Star className={cn(
                        "h-4 w-4 flex-shrink-0 mt-0.5",
                        item.status === 'achieved' ? 'text-green-500' :
                        item.status === 'working' ? 'text-blue-500' :
                        item.status === 'planning' ? 'text-yellow-500' : 'text-gray-400'
                      )} />
                      <div className="flex-1">
                        <span className={cn(item.status === 'achieved' && 'line-through')}>{item.title}</span>
                        <p className="text-xs text-gray-400">{statusLabels[item.status]}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* المهارات الحالية */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <TrendingUp className="h-4 w-4 text-green-500" />
            تقدم المهارات
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            {skills.slice(0, 4).map((skill) => (
              <div key={skill.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-xs text-gray-500">{skill.progress}%</span>
                </div>
                <Progress value={skill.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* حوار إضافة هدف */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>هدف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">الهدف</Label>
              <Input
                value={newVision.title}
                onChange={(e) => setNewVision({ ...newVision, title: e.target.value })}
                placeholder="ما الذي تريد تحقيقه؟"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newVision.category}
                onValueChange={(v) => setNewVision({ ...newVision, category: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">تاريخ مستهدف (اختياري)</Label>
              <Input
                type="date"
                value={newVision.targetDate}
                onChange={(e) => setNewVision({ ...newVision, targetDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddVision} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 📊 قسم المهارات (مُصلح)
// ============================================
const SkillsView = () => {
  const { skills, addSkill, updateSkill, deleteSkill, learningResources, addLearningResource } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'technical' as const,
    level: 'beginner' as const
  });

  const skillCategories = [
    { id: 'technical', label: 'تقنية', color: 'blue' },
    { id: 'language', label: 'لغات', color: 'green' },
    { id: 'soft', label: 'مهارات شخصية', color: 'purple' },
  ];

  const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    expert: 'خبير'
  };

  const handleAddSkill = () => {
    if (!newSkill.name) return;
    addSkill({
      id: generateId(),
      name: newSkill.name,
      category: newSkill.category,
      level: newSkill.level,
      progress: newSkill.level === 'beginner' ? 10 : newSkill.level === 'intermediate' ? 40 : newSkill.level === 'advanced' ? 70 : 90,
      resources: [],
      practiceHours: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setNewSkill({ name: '', category: 'technical', level: 'beginner' });
    setShowAddDialog(false);
    toast.success('تم إضافة المهارة!');
  };

  const handleProgressUpdate = (skillId: string, progress: number) => {
    const level = progress < 25 ? 'beginner' : progress < 50 ? 'intermediate' : progress < 75 ? 'advanced' : 'expert';
    updateSkill(skillId, { progress, level, updatedAt: new Date() });
    toast.success('تم تحديث التقدم!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ملخص المهارات */}
      <div className="grid grid-cols-3 gap-3">
        {skillCategories.map((cat) => {
          const catSkills = skills.filter(s => s.category === cat.id);
          const avgProgress = catSkills.length > 0 
            ? Math.round(catSkills.reduce((sum, s) => sum + s.progress, 0) / catSkills.length)
            : 0;
          return (
            <Card key={cat.id} className="bg-white shadow-sm text-center">
              <CardContent className="pt-4 pb-4">
                <p className={cn(
                  "text-2xl font-bold",
                  cat.color === 'blue' ? 'text-blue-600' :
                  cat.color === 'green' ? 'text-green-600' : 'text-purple-600'
                )}>{avgProgress}%</p>
                <p className="text-gray-500 text-xs mt-1">{cat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة مهارة جديدة
      </Button>

      {/* قائمة المهارات */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            جميع المهارات ({skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {skills.map((skill) => (
              <div key={skill.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{skill.name}</h3>
                    <p className="text-xs text-gray-500">
                      {skill.category === 'technical' ? 'تقنية' :
                       skill.category === 'language' ? 'لغة' : 'شخصية'}
                      {' • '}مستوى: {levelLabels[skill.level]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{skill.progress}%</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSkill(skill.id)}
                      className="h-6 w-6 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={skill.progress} className="h-2" />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    ساعات التدريب: {skill.practiceHours} ساعة
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProgressUpdate(skill.id, Math.min(100, skill.progress + 10))}
                      className="h-6 text-xs"
                    >
                      +10%
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* نصيحة التعلم */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">نصيحة التعلم</h3>
              <p className="text-gray-600 text-xs">
                خصص 30 دقيقة يومياً لتعلم مهارة جديدة. الاستمرارية أهم من الكثافة!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حوار إضافة مهارة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>مهارة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">اسم المهارة</Label>
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="مثال: React.js"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newSkill.category}
                onValueChange={(v) => setNewSkill({ ...newSkill, category: v as Skill['category'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">المستوى الحالي</Label>
              <Select
                value={newSkill.level}
                onValueChange={(v) => setNewSkill({ ...newSkill, level: v as Skill['level'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddSkill} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 📚 قسم الأرشيف والمواضيع المهمة
// ============================================
const ArchiveView = () => {
  const { archiveTopics, addArchiveTopic, userExperiences, projectArchives, addProjectArchive } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'other' as const,
    importance: 'normal' as const
  });

  const categories = [
    { id: 'all', label: 'الكل', icon: FileText },
    { id: 'arduino', label: 'Arduino', icon: Wrench },
    { id: 'bms', label: 'BMS', icon: Target },
    { id: 'programming', label: 'برمجة', icon: Brain },
    { id: 'electronics', label: 'إلكترونيات', icon: Zap },
    { id: 'education', label: 'تعليم', icon: BookOpen },
  ];

  const allTopics = [
    ...archiveTopics,
    ...userExperiences.map(exp => ({
      id: exp.id,
      title: exp.title,
      category: exp.category as string,
      importance: exp.importance as 'critical' | 'important' | 'normal',
      tags: exp.tags,
      content: exp.description,
      isFavorite: false,
      reviewCount: 0,
      mediaIds: [],
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt
    })),
    { 
      id: 'default-1', 
      title: 'دليل Arduino Mega الكامل', 
      category: 'arduino',
      importance: 'critical' as const,
      tags: ['arduino', 'microcontroller'],
      content: 'شرح شامل للمتحكم Arduino Mega مع الأمثلة والتطبيقات العملية...',
      isFavorite: true,
      reviewCount: 5,
      mediaIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 'default-2', 
      title: 'نظام BMS - المرحلة الأولى', 
      category: 'bms',
      importance: 'critical' as const,
      tags: ['bms', 'project'],
      content: 'تخطيط وتصميم نظام إدارة المبنى الذكي...',
      isFavorite: true,
      reviewCount: 3,
      mediaIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  const filteredItems = allTopics.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddTopic = () => {
    if (!newTopic.title.trim()) return;
    
    addArchiveTopic({
      id: generateId(),
      title: newTopic.title,
      content: newTopic.content,
      category: newTopic.category as 'arduino' | 'bms' | 'programming' | 'electronics' | 'education' | 'other',
      importance: newTopic.importance,
      tags: [],
      isFavorite: false,
      reviewCount: 0,
      mediaIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    setNewTopic({ title: '', content: '', category: 'other', importance: 'normal' });
    setShowAddDialog(false);
    toast.success('تم إضافة الموضوع!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">📚 الأرشيف</h1>
          <p className="text-gray-500 text-sm">{allTopics.length} موضوع • {userExperiences.length} خبرة مسجلة</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
        >
          <Plus className="h-4 w-4 ml-1" />
          موضوع جديد
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-cyan-600">{archiveTopics.length}</p>
            <p className="text-xs text-cyan-700">مواضيع محفوظة</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-green-600">{userExperiences.length}</p>
            <p className="text-xs text-green-700">خبرات مسجلة</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{projectArchives.length}</p>
            <p className="text-xs text-purple-700">مشاريع مؤرشفة</p>
          </CardContent>
        </Card>
      </div>

      {/* البحث والفلترة */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث في الأرشيف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              )}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة المواضيع */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <Archive className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">لا توجد مواضيع</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowAddDialog(true)}
              >
                أضف موضوعك الأول
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-2 h-full min-h-[60px] rounded-full flex-shrink-0',
                    item.importance === 'critical' ? 'bg-red-500' :
                    item.importance === 'important' ? 'bg-yellow-500' : 'bg-gray-300'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{item.title}</h3>
                      {item.importance === 'critical' && (
                        <Badge className="bg-red-100 text-red-700 text-xs">مهم جداً</Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-2">{item.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>موضوع جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">العنوان</Label>
              <Input
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">المحتوى</Label>
              <textarea
                value={newTopic.content}
                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                className="w-full h-24 p-2 rounded-lg border text-sm resize-none mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newTopic.category}
                onValueChange={(v) => setNewTopic({ ...newTopic, category: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">الأهمية</Label>
              <Select
                value={newTopic.importance}
                onValueChange={(v) => setNewTopic({ ...newTopic, importance: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">عادي</SelectItem>
                  <SelectItem value="important">مهم</SelectItem>
                  <SelectItem value="critical">مهم جداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddTopic} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🖼️ قسم الوسائط
// ============================================
const MediaView = () => {
  const { mediaFiles, addMediaFile, mediaFolders, addMediaFolder } = useStore();
  const [selectedTab, setSelectedTab] = useState<'all' | 'images' | 'videos' | 'documents'>('all');

  const tabs = [
    { id: 'all' as const, label: 'الكل', icon: FileText },
    { id: 'images' as const, label: 'صور', icon: Heart },
    { id: 'videos' as const, label: 'فيديوهات', icon: Zap },
    { id: 'documents' as const, label: 'مستندات', icon: FileText },
  ];

  const filteredItems = selectedTab === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(item => item.type === selectedTab.slice(0, -1));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* العنوان */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🖼️ الوسائط</h1>
          <p className="text-gray-500 text-sm">{mediaFiles.length} ملفات</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Upload className="h-4 w-4 ml-1" />
          رفع ملف
        </Button>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              selectedTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* شبكة الوسائط */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white shadow-sm">
              <CardContent className="pt-8 pb-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">لا توجد ملفات</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {item.type === 'image' && <Heart className="h-8 w-8 text-gray-400" />}
                {item.type === 'video' && <Zap className="h-8 w-8 text-gray-400" />}
                {item.type === 'document' && <FileText className="h-8 w-8 text-gray-400" />}
              </div>
              <CardContent className="pt-2 pb-2 px-3">
                <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* إحصائيات التخزين */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">مساحة التخزين</p>
              <p className="text-xs text-gray-500">{mediaFiles.length} ملفات</p>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-purple-600">{mediaFiles.length > 0 ? '0.5' : '0'}%</p>
              <p className="text-xs text-gray-500">مستخدم</p>
            </div>
          </div>
          <Progress value={mediaFiles.length > 0 ? 0.5 : 0} className="h-2 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// ⚙️ قسم الإعدادات
// ============================================
const SettingsView = () => {
  const { clearAllData, exportData, importData, performance, streak, hardMode } = useStore();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = importData(result);
        if (success) {
          toast.success('تم استيراد البيانات بنجاح!');
        } else {
          toast.error('فشل استيراد البيانات');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* معلومات المستخدم */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">المعلومات</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
              م
            </div>
            <div>
              <p className="font-medium text-gray-900">محمد</p>
              <p className="text-xs text-gray-500">18 سنة • الخليل/دورا</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-orange-50 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-600">{performance.totalXP}</p>
              <p className="text-xs text-gray-500">نقطة خبرة</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-center">
              <p className="text-lg font-bold text-red-600">{streak.currentStreak}</p>
              <p className="text-xs text-gray-500">يوم متتالي</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إدارة البيانات */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">إدارة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {
              const data = exportData();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mimo-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              toast.success('تم تصدير البيانات!');
            }}
          >
            <Download className="h-4 w-4 ml-2" />
            تصدير البيانات
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 ml-2" />
              استيراد البيانات
            </Button>
          </div>
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={() => {
              if (confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات!')) {
                clearAllData();
                toast.success('تم حذف جميع البيانات');
              }
            }}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف جميع البيانات
          </Button>
        </CardContent>
      </Card>

      {/* إحصائيات النظام */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="pt-4 pb-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">إحصائيات النظام</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>المستوى الحالي</span>
              <span className="font-medium">{performance.level}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي ساعات الدراسة</span>
              <span className="font-medium">{performance.totalStudyHours.toFixed(1)} ساعة</span>
            </div>
            <div className="flex justify-between">
              <span>الجلسات المكتملة</span>
              <span className="font-medium">{performance.sessionsCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span>أطول سلسلة متتالية</span>
              <span className="font-medium">{streak.longestStreak} يوم</span>
            </div>
            {hardMode.enabled && (
              <div className="flex justify-between">
                <span>وضع المحارب</span>
                <span className="font-medium text-red-500">نشط</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// 🤖 المساعد الذكي - MiMo AI
// ============================================

const AIAgentView = () => {
  return <MiMoAIView />;
};

// ============================================
// 🔥 وضع الحرب - Modal (مُحسّن)
// ============================================
const WarModeModal = () => {
  const { 
    isWarModeModalOpen, setWarModeModalOpen, warModeSession, 
    startWarMode, pauseWarMode, resumeWarMode, endWarMode, 
    tickWarMode, addXP, performance, hardMode 
  } = useStore();
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (warModeSession?.status === 'active') {
      intervalRef.current = setInterval(() => {
        tickWarMode(1);
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [warModeSession?.status, tickWarMode]);

  const handleStart = () => {
    startWarMode('', selectedDuration);
    setElapsed(0);
  };

  const handleEnd = (completed: boolean) => {
    if (completed) {
      const baseXP = Math.floor(elapsed / 60) * 2;
      const bonusXP = hardMode.enabled ? Math.floor(baseXP * hardMode.xpMultiplier) : baseXP;
      addXP(bonusXP, hardMode.enabled ? 'جلسة دراسة مكتملة (وضع المحارب)' : 'جلسة دراسة مكتملة');
      toast.success(`🎉 مبروك! حصلت على ${bonusXP} نقطة!`);
    }
    endWarMode(completed);
    setElapsed(0);
    setIsFullscreen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const durations = [15, 25, 45, 60, 90];

  if (!isWarModeModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
          isFullscreen && "bg-black/95"
        )}
        onClick={() => !isFullscreen && setWarModeModalOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "bg-white rounded-2xl shadow-2xl overflow-hidden",
            isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-sm"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 text-center relative">
            {!isFullscreen && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            )}
            <Flame className={cn("mx-auto mb-2", isFullscreen ? "h-16 w-16" : "h-10 w-10")} />
            <h2 className={cn("font-bold", isFullscreen ? "text-3xl" : "text-xl")}>وضع الحرب</h2>
            <p className="text-orange-100 text-sm">ركز وادرس بكل قوتك!</p>
            {hardMode.enabled && (
              <Badge className="mt-2 bg-white/20 text-white">
                <Swords className="h-3 w-3 ml-1" />
                وضع المحارب ×{hardMode.xpMultiplier}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className={cn("p-6", isFullscreen && "flex flex-col items-center justify-center h-[calc(100%-120px)]")}>
            {!warModeSession ? (
              <>
                <p className="text-gray-600 text-sm text-center mb-4">
                  اختر مدة الجلسة:
                </p>
                <div className={cn("grid gap-2 mb-6", isFullscreen ? "grid-cols-5 gap-4" : "grid-cols-3")}>
                  {durations.map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDuration(d)}
                      className={cn(
                        "rounded-lg font-medium transition-all",
                        isFullscreen ? "py-4 text-lg" : "py-3",
                        selectedDuration === d
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {d} دقيقة
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleStart}
                  className={cn(
                    "w-full bg-gradient-to-r from-orange-500 to-red-600 text-white",
                    isFullscreen && "py-4 text-lg"
                  )}
                >
                  <Flame className="h-5 w-5 ml-2" />
                  ابدأ المعركة!
                </Button>
              </>
            ) : (
              <>
                {/* Timer Display */}
                <div className="text-center mb-6">
                  <div className={cn(
                    "font-bold text-gray-900 mb-2",
                    isFullscreen ? "text-8xl" : "text-6xl"
                  )}>
                    {formatTime(warModeSession.elapsed || elapsed)}
                  </div>
                  <p className="text-gray-500 text-sm">
                    الهدف: {warModeSession.targetDuration / 60} دقيقة
                  </p>
                  <div className="mt-4 max-w-xs mx-auto">
                    <Progress 
                      value={((warModeSession.elapsed || elapsed) / warModeSession.targetDuration) * 100} 
                      className="h-2"
                    />
                  </div>
                  {isFullscreen && (
                    <div className="mt-8 flex justify-center gap-8">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-orange-500">{performance.totalXP}</p>
                        <p className="text-gray-400 text-sm">إجمالي النقاط</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold text-green-500">{performance.level}</p>
                        <p className="text-gray-400 text-sm">المستوى</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className={cn("flex gap-2", isFullscreen && "gap-4")}>
                  {warModeSession.status === 'active' && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={pauseWarMode}
                      size={isFullscreen ? "lg" : "default"}
                    >
                      <Pause className="h-4 w-4 ml-1" />
                      إيقاف مؤقت
                    </Button>
                  )}
                  {warModeSession.status === 'paused' && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resumeWarMode}
                      size={isFullscreen ? "lg" : "default"}
                    >
                      <Play className="h-4 w-4 ml-1" />
                      استئناف
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleEnd(false)}
                    size={isFullscreen ? "lg" : "default"}
                  >
                    إنهاء
                  </Button>
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleEnd(true)}
                    size={isFullscreen ? "lg" : "default"}
                  >
                    <Check className="h-4 w-4 ml-1" />
                    اكتمل
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// 🔄 قسم العادات اليومية
// ============================================
const HabitsView = () => {
  const { habits, addHabit, updateHabit, deleteHabit, completeHabit } = useStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'personal', color: 'gray' });

  const categoryLabels: Record<string, string> = {
    health: 'صحة',
    learning: 'تعلم',
    spiritual: 'روحاني',
    productivity: 'إنتاجية',
    social: 'اجتماعي',
    personal: 'شخصي',
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    cyan: 'bg-cyan-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    indigo: 'bg-indigo-500',
  };

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    addHabit({
      id: generateId(),
      name: newHabit.name,
      category: newHabit.category as any,
      color: newHabit.color,
      icon: 'check',
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      frequency: 'daily',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setNewHabit({ name: '', category: 'personal', color: 'gray' });
    setShowAddDialog(false);
    toast.success('تم إضافة العادة!');
  };

  const handleCompleteHabit = (id: string) => {
    completeHabit(id);
    toast.success('تم إكمال العادة! 🔥');
  };

  const today = new Date().toDateString();
  const completedCount = habits.filter(h => 
    h.completedDates.some(d => new Date(d).toDateString() === today)
  ).length;
  const progressPercent = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* التقدم اليومي */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">عادات اليوم</h2>
              <p className="text-green-100 text-sm">{completedCount} من {habits.length} مكتملة</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{progressPercent.toFixed(0)}%</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 mt-3 bg-white/20" />
        </CardContent>
      </Card>

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة عادة جديدة
      </Button>

      {/* قائمة العادات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {habits.length === 0 ? (
          <Card className="col-span-full bg-white shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <Flame className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">لا توجد عادات بعد</p>
              <p className="text-gray-400 text-xs mt-1">أضف عادة جديدة للبدء!</p>
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => {
            const isCompletedToday = habit.completedDates.some(d => new Date(d).toDateString() === today);
            return (
              <Card 
                key={habit.id} 
                className={cn(
                  "shadow-sm cursor-pointer transition-all hover:shadow-md",
                  isCompletedToday ? "bg-green-50 border-green-200" : "bg-white"
                )}
                onClick={() => !isCompletedToday && handleCompleteHabit(habit.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white",
                      colorClasses[habit.color] || 'bg-gray-500'
                    )}>
                      {isCompletedToday ? <Check className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-medium text-sm",
                        isCompletedToday && "line-through text-gray-400"
                      )}>{habit.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{categoryLabels[habit.category]}</Badge>
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <Flame className="h-3 w-3" /> {habit.streak} يوم
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* إحصائيات الأسبوع */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">إحصائيات الأسبوع</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-7 gap-1">
            {['س', 'ح', 'ن', 'ث', 'أ', 'خ', 'ج'].map((day, i) => (
              <div key={i} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{day}</p>
                <div className={cn(
                  "w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold",
                  i < 5 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                )}>
                  {i < 5 ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 2}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>عادة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">اسم العادة</Label>
              <Input
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="مثال: قراءة 30 دقيقة"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newHabit.category}
                onValueChange={(v) => setNewHabit({ ...newHabit, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">اللون</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(colorClasses).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewHabit({ ...newHabit, color })}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      colorClasses[color],
                      newHabit.color === color && "ring-2 ring-offset-2 ring-gray-400"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={handleAddHabit} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 📚 قسم القراءة والكتب
// ============================================
const ReadingView = () => {
  const [books, setBooks] = useState([
    { id: '1', title: 'العادات الذرية', author: 'جيمس كلير', status: 'reading', totalPages: 320, currentPage: 156, category: 'self-development' },
    { id: '2', title: 'التفكير السريع والبطيء', author: 'دانيال كاهنمان', status: 'to-read', totalPages: 450, currentPage: 0, category: 'self-development' },
    { id: '3', title: 'دليل Arduino', author: 'متنوع', status: 'reading', totalPages: 200, currentPage: 80, category: 'technical' },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: '', category: 'self-development' });

  const statusLabels: Record<string, string> = {
    'to-read': 'للقراءة',
    'reading': 'أقرأ الآن',
    'completed': 'مكتمل',
    'on-hold': 'معلق',
  };

  const statusColors: Record<string, string> = {
    'to-read': 'bg-gray-100 text-gray-700',
    'reading': 'bg-blue-100 text-blue-700',
    'completed': 'bg-green-100 text-green-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
  };

  const categoryLabels: Record<string, string> = {
    'self-development': 'تطوير ذاتي',
    'technical': 'تقني',
    'fiction': 'خيالي',
    'religious': 'ديني',
    'educational': 'تعليمي',
    'other': 'أخرى',
  };

  const addBook = () => {
    if (!newBook.title) return;
    setBooks([...books, {
      id: generateId(),
      title: newBook.title,
      author: newBook.author,
      status: 'to-read',
      totalPages: parseInt(newBook.totalPages) || 100,
      currentPage: 0,
      category: newBook.category as any
    }]);
    setNewBook({ title: '', author: '', totalPages: '', category: 'self-development' });
    setShowAddDialog(false);
    toast.success('تم إضافة الكتاب!');
  };

  const updateProgress = (id: string, pages: number) => {
    setBooks(books.map(b => {
      if (b.id === id) {
        const newPage = Math.min(b.totalPages, Math.max(0, pages));
        return { 
          ...b, 
          currentPage: newPage,
          status: newPage >= b.totalPages ? 'completed' : newPage > 0 ? 'reading' : 'to-read'
        };
      }
      return b;
    }));
  };

  const currentlyReading = books.filter(b => b.status === 'reading');
  const completedBooks = books.filter(b => b.status === 'completed');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* إحصائيات القراءة */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-3 pb-3 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{books.length}</p>
            <p className="text-xs text-blue-700">كتاب</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-3 pb-3 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{completedBooks.length}</p>
            <p className="text-xs text-green-700">مكتمل</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="pt-3 pb-3 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold text-orange-600">{currentlyReading.length}</p>
            <p className="text-xs text-orange-700">أقرأ الآن</p>
          </CardContent>
        </Card>
      </div>

      {/* الكتب الحالية */}
      {currentlyReading.length > 0 && (
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <BookOpen className="h-4 w-4 text-blue-500" />
              أقرأ حالياً
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              {currentlyReading.map((book) => (
                <div key={book.id} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{book.title}</h3>
                      <p className="text-xs text-gray-500">{book.author}</p>
                    </div>
                    <Badge className={statusColors[book.status]}>{statusLabels[book.status]}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(book.currentPage / book.totalPages) * 100} className="h-2 flex-1" />
                    <span className="text-xs text-gray-500">{book.currentPage}/{book.totalPages}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(book.id, book.currentPage + 10)}
                      className="h-7 text-xs"
                    >
                      +10 صفحات
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة كتاب جديد
      </Button>

      {/* جميع الكتب */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">مكتبتي ({books.length})</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {books.map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className={cn(
                  "w-10 h-14 rounded flex items-center justify-center",
                  book.status === 'completed' ? "bg-green-100" : "bg-blue-100"
                )}>
                  <BookOpen className={cn("h-4 w-4", book.status === 'completed' ? "text-green-500" : "text-blue-500")} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-gray-500">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{categoryLabels[book.category]}</Badge>
                    <span className="text-xs text-gray-400">{book.currentPage}/{book.totalPages}</span>
                  </div>
                </div>
                <Select
                  value={book.status}
                  onValueChange={(v) => setBooks(books.map(b => b.id === book.id ? { ...b, status: v as any } : b))}
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>إضافة كتاب</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">عنوان الكتاب</Label>
              <Input
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">المؤلف</Label>
              <Input
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">عدد الصفحات</Label>
              <Input
                type="number"
                value={newBook.totalPages}
                onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newBook.category}
                onValueChange={(v) => setNewBook({ ...newBook, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addBook} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🏥 قسم الصحة واللياقة
// ============================================
const HealthView = () => {
  const { 
    healthRecords, addHealthRecord, updateHealthRecord, getTodayHealthRecord,
    workoutSessions, addWorkoutSession,
    healthGoals, addHealthGoal, updateHealthGoal
  } = useStore();
  
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ type: 'walking', name: '', duration: '30', intensity: 'medium' as const });
  
  // Get or create today's health record
  const todayRecord = getTodayHealthRecord();
  
  const [localData, setLocalData] = useState({
    waterGlasses: todayRecord?.waterGlasses || 0,
    sleepHours: todayRecord?.sleepHours || 7,
    sleepQuality: todayRecord?.sleepQuality || 'good' as const,
    steps: todayRecord?.steps || 0,
    exerciseMinutes: todayRecord?.exerciseMinutes || 0,
    energy: todayRecord?.energy || 5,
    mood: todayRecord?.mood || 'good' as const,
  });

  const workoutTypes = [
    { id: 'walking', label: 'مشي', icon: '🚶' },
    { id: 'running', label: 'جري', icon: '🏃' },
    { id: 'strength', label: 'قوة', icon: '💪' },
    { id: 'cardio', label: 'كارديو', icon: '❤️' },
    { id: 'flexibility', label: 'مرونة', icon: '🧘' },
    { id: 'sports', label: 'رياضة', icon: '⚽' },
  ];

  const saveHealthRecord = () => {
    if (todayRecord) {
      updateHealthRecord(todayRecord.id, localData);
    } else {
      addHealthRecord({
        id: generateId(),
        date: new Date(),
        waterGlasses: localData.waterGlasses,
        sleepHours: localData.sleepHours,
        sleepQuality: localData.sleepQuality,
        steps: localData.steps,
        exerciseMinutes: localData.exerciseMinutes,
        mood: localData.mood,
        energy: localData.energy,
        createdAt: new Date(),
      });
    }
    toast.success('تم حفظ البيانات الصحية! 💪');
  };

  const addWater = () => {
    if (localData.waterGlasses < 12) {
      setLocalData({ ...localData, waterGlasses: localData.waterGlasses + 1 });
      toast.success('كوب ماء +1 💧');
    }
  };

  const addWorkout = () => {
    if (!newWorkout.name) return;
    const calories = parseInt(newWorkout.duration) * 5;
    
    addWorkoutSession({
      id: generateId(),
      type: newWorkout.type as any,
      name: newWorkout.name,
      duration: parseInt(newWorkout.duration),
      calories,
      intensity: newWorkout.intensity,
      exercises: [],
      date: new Date(),
      completed: true,
      createdAt: new Date(),
    });
    
    setLocalData({ ...localData, exerciseMinutes: localData.exerciseMinutes + parseInt(newWorkout.duration) });
    setNewWorkout({ type: 'walking', name: '', duration: '30', intensity: 'medium' });
    setShowWorkoutDialog(false);
    toast.success('تم إضافة التمرين! 🏋️');
  };

  // Get today's workouts
  const todayWorkouts = workoutSessions.filter(
    w => new Date(w.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ملخص الصحة */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl mb-1">💧</div>
            <p className="text-2xl font-bold text-cyan-600">{localData.waterGlasses}/8</p>
            <p className="text-xs text-cyan-700">أكواب ماء</p>
            <Button onClick={addWater} size="sm" className="mt-2 h-6 text-xs bg-cyan-500 text-white">
              + كوب
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl mb-1">👣</div>
            <p className="text-2xl font-bold text-green-600">{localData.steps}</p>
            <p className="text-xs text-green-700">خطوة</p>
            <Button 
              onClick={() => setLocalData({ ...localData, steps: localData.steps + 1000 })} 
              size="sm" className="mt-2 h-6 text-xs bg-green-500 text-white"
            >
              +1000
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl mb-1">🏋️</div>
            <p className="text-2xl font-bold text-orange-600">{localData.exerciseMinutes}</p>
            <p className="text-xs text-orange-700">دقيقة تمرين</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl mb-1">😴</div>
            <p className="text-2xl font-bold text-purple-600">{localData.sleepHours}h</p>
            <p className="text-xs text-purple-700">ساعات نوم</p>
          </CardContent>
        </Card>
      </div>

      {/* مؤشر الطاقة */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <Zap className="h-4 w-4 text-yellow-500" />
            مستوى الطاقة
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setLocalData({ ...localData, energy: i + 1 })}
                className={cn(
                  "flex-1 h-8 rounded transition-all",
                  i < localData.energy 
                    ? i < 3 ? "bg-red-400" : i < 6 ? "bg-yellow-400" : "bg-green-400"
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <p className="text-center mt-2 text-sm text-gray-500">
            {localData.energy < 4 ? 'تعبان 😔' : localData.energy < 7 ? 'معتدل 🙂' : 'ممتاز! 💪'}
          </p>
        </CardContent>
      </Card>

      {/* زر حفظ + إضافة تمرين */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={saveHealthRecord} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <Save className="h-4 w-4 ml-1" />
          حفظ البيانات
        </Button>
        <Button onClick={() => setShowWorkoutDialog(true)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <Plus className="h-4 w-4 ml-1" />
          تمرين جديد
        </Button>
      </div>

      {/* سجل التمارين */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">تمارين اليوم</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {todayWorkouts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">لا توجد تمارين مسجلة</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todayWorkouts.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <span className="text-2xl">{workoutTypes.find(t => t.id === w.type)?.icon || '🏃'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{w.name}</p>
                    <p className="text-xs text-gray-500">{w.duration} دقيقة • {w.calories} سعرة</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {w.intensity === 'low' ? 'خفيف' : w.intensity === 'medium' ? 'متوسط' : 'شديد'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* أهداف صحية */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-4 pb-4">
          <h3 className="font-medium text-gray-900 text-sm mb-3">الأهداف اليومية</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>الماء (8 أكواب)</span>
                <span>{localData.waterGlasses}/8</span>
              </div>
              <Progress value={(localData.waterGlasses / 8) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>الخطوات (10,000)</span>
                <span>{localData.steps.toLocaleString()}/10,000</span>
              </div>
              <Progress value={(localData.steps / 10000) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>التمرين (30 دقيقة)</span>
                <span>{localData.exerciseMinutes}/30</span>
              </div>
              <Progress value={(localData.exerciseMinutes / 30) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حوار إضافة تمرين */}
      <Dialog open={showWorkoutDialog} onOpenChange={setShowWorkoutDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>تسجيل تمرين</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">نوع التمرين</Label>
              <Select
                value={newWorkout.type}
                onValueChange={(v) => setNewWorkout({ ...newWorkout, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">اسم التمرين</Label>
              <Input
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                placeholder="مثال: مشي صباحي"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">المدة (دقيقة)</Label>
              <Input
                type="number"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الشدة</Label>
              <Select
                value={newWorkout.intensity}
                onValueChange={(v) => setNewWorkout({ ...newWorkout, intensity: v as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">خفيف</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">شديد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkoutDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addWorkout} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🎯 قسم الأهداف المتقدمة
// ============================================
const GoalsView = () => {
  const [goals, setGoals] = useState([
    { 
      id: '1', 
      title: 'التفوق في التوجيهي', 
      category: 'education', 
      type: 'short-term',
      progress: 65, 
      status: 'in-progress',
      priority: 'critical',
      milestones: [
        { id: 'm1', title: 'إنهاء المنهج', status: 'completed' },
        { id: 'm2', title: 'المراجعة الشاملة', status: 'in-progress' },
        { id: 'm3', title: 'الامتحانات التجريبية', status: 'pending' },
      ]
    },
    { 
      id: '2', 
      title: 'إكمال مشروع BMS', 
      category: 'career', 
      type: 'medium-term',
      progress: 40, 
      status: 'in-progress',
      priority: 'high',
      milestones: []
    },
    { 
      id: '3', 
      title: 'الحصول على المنحة الصينية', 
      category: 'education', 
      type: 'long-term',
      progress: 25, 
      status: 'in-progress',
      priority: 'critical',
      milestones: []
    },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    category: 'personal', 
    type: 'short-term',
    priority: 'medium'
  });

  const categoryLabels: Record<string, string> = {
    career: 'مهنة',
    education: 'تعليم',
    health: 'صحة',
    finance: 'مالية',
    personal: 'شخصي',
    relationships: 'علاقات',
    spiritual: 'روحاني',
    other: 'أخرى',
  };

  const typeLabels: Record<string, string> = {
    'short-term': 'قصير المدى',
    'medium-term': 'متوسط المدى',
    'long-term': 'طويل المدى',
    'lifetime': 'مدى الحياة',
  };

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  const addGoal = () => {
    if (!newGoal.title) return;
    setGoals([...goals, {
      id: generateId(),
      title: newGoal.title,
      category: newGoal.category,
      type: newGoal.type,
      progress: 0,
      status: 'not-started',
      priority: newGoal.priority as any,
      milestones: []
    }]);
    setNewGoal({ title: '', category: 'personal', type: 'short-term', priority: 'medium' });
    setShowAddDialog(false);
    toast.success('تم إضافة الهدف!');
  };

  const updateProgress = (id: string, progress: number) => {
    setGoals(goals.map(g => 
      g.id === id ? { 
        ...g, 
        progress: Math.min(100, Math.max(0, progress)),
        status: progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
      } : g
    ));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* إحصائيات الأهداف */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(typeLabels).map(([key, label]) => {
          const count = goals.filter(g => g.type === key).length;
          return (
            <Card key={key} className="bg-white shadow-sm text-center">
              <CardContent className="pt-3 pb-3">
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة هدف جديد
      </Button>

      {/* قائمة الأهداف */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <Card key={goal.id} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className={cn("w-3 h-3 rounded-full mt-1.5", priorityColors[goal.priority])} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <Badge variant="secondary">{typeLabels[goal.type]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{categoryLabels[goal.category]}</Badge>
                    <span className="text-xs text-gray-400">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 mb-3" />
                  
                  {goal.milestones.length > 0 && (
                    <div className="space-y-1">
                      {goal.milestones.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-2 text-xs">
                          {m.status === 'completed' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : m.status === 'in-progress' ? (
                            <Circle className="h-3 w-3 text-blue-500 fill-blue-100" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-300" />
                          )}
                          <span className={m.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-600'}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(goal.id, goal.progress + 10)}
                      className="h-6 text-xs"
                    >
                      +10%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateProgress(goal.id, 100)}
                      className="h-6 text-xs text-green-600"
                    >
                      اكتمل ✓
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>هدف جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">عنوان الهدف</Label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newGoal.category}
                onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">المدى</Label>
              <Select
                value={newGoal.type}
                onValueChange={(v) => setNewGoal({ ...newGoal, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">الأولوية</Label>
              <Select
                value={newGoal.priority}
                onValueChange={(v) => setNewGoal({ ...newGoal, priority: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addGoal} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 📅 قسم التقويم والأحداث
// ============================================
const CalendarView = () => {
  const [events, setEvents] = useState([
    { id: '1', title: 'امتحان الرياضيات', type: 'deadline', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), color: 'red' },
    { id: '2', title: 'مراجعة الفيزياء', type: 'study', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), color: 'blue' },
    { id: '3', title: 'تسليم المشروع', type: 'deadline', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), color: 'orange' },
  ]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'task', date: '' });

  const typeLabels: Record<string, string> = {
    meeting: 'اجتماع',
    task: 'مهمة',
    reminder: 'تذكير',
    deadline: 'موعد نهائي',
    event: 'حدث',
    study: 'دراسة',
    other: 'أخرى',
  };

  const typeColors: Record<string, string> = {
    meeting: 'bg-purple-500',
    task: 'bg-blue-500',
    reminder: 'bg-yellow-500',
    deadline: 'bg-red-500',
    event: 'bg-green-500',
    study: 'bg-cyan-500',
    other: 'bg-gray-500',
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, {
      id: generateId(),
      title: newEvent.title,
      type: newEvent.type,
      date: new Date(newEvent.date),
      color: newEvent.type
    }]);
    setNewEvent({ title: '', type: 'task', date: '' });
    setShowAddDialog(false);
    toast.success('تم إضافة الحدث!');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => 
      e.date.toDateString() === date.toDateString()
    );
  };

  const days = getDaysInMonth(selectedDate);
  const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📅 التقويم</h2>
          <p className="text-gray-500 text-sm">
            {selectedDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            اليوم
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
          >
            التالي
          </Button>
        </div>
      </div>

      {/* التقويم */}
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-4 pb-4">
          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* الأيام */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="h-10" />;
              
              const dayEvents = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={day.toISOString()}
                  className={cn(
                    "h-10 rounded-lg text-sm relative transition-all",
                    isToday && "bg-blue-500 text-white font-bold",
                    dayEvents.length > 0 && !isToday && "bg-gray-50"
                  )}
                >
                  {day.getDate()}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div key={e.id} className={cn("w-1.5 h-1.5 rounded-full", typeColors[e.type])} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        إضافة حدث
      </Button>

      {/* الأحداث القادمة */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base text-gray-900">الأحداث القادمة</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events
              .filter(e => e.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event) => {
                const daysUntil = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className={cn("w-3 h-10 rounded-full", typeColors[event.type])} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {event.date.toLocaleDateString('ar-SA')} • {typeLabels[event.type]}
                      </p>
                    </div>
                    <Badge variant={daysUntil <= 3 ? 'destructive' : 'secondary'}>
                      {daysUntil === 0 ? 'اليوم' : daysUntil === 1 ? 'غداً' : `${daysUntil} أيام`}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>حدث جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">العنوان</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">النوع</Label>
              <Select
                value={newEvent.type}
                onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">التاريخ</Label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addEvent} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 💬 قسم اليوميات والتأملات
// ============================================
const JournalView = () => {
  const [entries, setEntries] = useState([
    {
      id: '1',
      date: new Date(),
      content: 'يوم جيد، أنجزت الكثير من المهام الدراسية',
      mood: 'good',
      gratitude: ['العائلة', 'الصحة'],
      achievements: ['إنهاء واجب الرياضيات'],
      challenges: ['الصعوبات في الفيزياء'],
      tomorrowGoals: ['مراجعة الكيمياء']
    }
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: '',
    mood: 'good',
    gratitude: '',
    achievements: '',
    challenges: '',
    tomorrowGoals: ''
  });

  const moodEmojis: Record<string, { emoji: string; label: string }> = {
    great: { emoji: '😊', label: 'ممتاز' },
    good: { emoji: '🙂', label: 'جيد' },
    okay: { emoji: '😐', label: 'عادي' },
    bad: { emoji: '😔', label: 'سيء' },
    terrible: { emoji: '😫', label: 'سيء جداً' },
  };

  const addEntry = () => {
    if (!newEntry.content) return;
    setEntries([{
      id: generateId(),
      date: new Date(),
      content: newEntry.content,
      mood: newEntry.mood as any,
      gratitude: newEntry.gratitude.split(',').map(s => s.trim()).filter(Boolean),
      achievements: newEntry.achievements.split(',').map(s => s.trim()).filter(Boolean),
      challenges: newEntry.challenges.split(',').map(s => s.trim()).filter(Boolean),
      tomorrowGoals: newEntry.tomorrowGoals.split(',').map(s => s.trim()).filter(Boolean),
    }, ...entries]);
    setNewEntry({ content: '', mood: 'good', gratitude: '', achievements: '', challenges: '', tomorrowGoals: '' });
    setShowAddDialog(false);
    toast.success('تم حفظ اليومية! 📝');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        كتابة يومية جديدة
      </Button>

      {/* قائمة اليوميات */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{moodEmojis[entry.mood].emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <Badge variant="secondary">{moodEmojis[entry.mood].label}</Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{entry.content}</p>
                  
                  {entry.gratitude.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">🙏 امتنان:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.gratitude.map((g, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entry.achievements.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">✅ إنجازات:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.achievements.map((a, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-green-600">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {entry.tomorrowGoals.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">🎯 أهداف الغد:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.tomorrowGoals.map((t, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-blue-600">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>يومية جديدة 📝</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">كيف تشعر اليوم؟</Label>
              <div className="flex gap-2 mt-2 justify-center">
                {Object.entries(moodEmojis).map(([key, { emoji }]) => (
                  <button
                    key={key}
                    onClick={() => setNewEntry({ ...newEntry, mood: key })}
                    className={cn(
                      "text-3xl p-2 rounded-lg transition-all",
                      newEntry.mood === key ? "bg-purple-100 ring-2 ring-purple-500" : "hover:bg-gray-100"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">ماذا حدث اليوم؟</Label>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className="w-full h-24 p-2 rounded-lg border text-sm resize-none mt-1"
                placeholder="اكتب أفكارك..."
              />
            </div>
            <div>
              <Label className="text-sm">🙏 ممتن لـ... (مفصولة بفواصل)</Label>
              <Input
                value={newEntry.gratitude}
                onChange={(e) => setNewEntry({ ...newEntry, gratitude: e.target.value })}
                placeholder="العائلة، الصحة، الأصدقاء..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">✅ إنجازات اليوم</Label>
              <Input
                value={newEntry.achievements}
                onChange={(e) => setNewEntry({ ...newEntry, achievements: e.target.value })}
                placeholder="إنهاء الواجب..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">🎯 أهداف الغد</Label>
              <Input
                value={newEntry.tomorrowGoals}
                onChange={(e) => setNewEntry({ ...newEntry, tomorrowGoals: e.target.value })}
                placeholder="مراجعة الدرس..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addEntry} size="sm">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 💡 قسم الأفكار والعصف الذهني
// ============================================
const IdeasView = () => {
  const [ideas, setIdeas] = useState([
    { id: '1', title: 'تطبيق إدارة المنازل الذكية', category: 'business', status: 'exploring', priority: 'high', votes: 5 },
    { id: '2', title: 'دورة تعليمية للـ Arduino', category: 'creative', status: 'new', priority: 'medium', votes: 3 },
    { id: '3', title: 'موقع لمساعدة الطلاب', category: 'social', status: 'developing', priority: 'high', votes: 8 },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', category: 'personal', priority: 'medium', description: '' });

  const categoryLabels: Record<string, string> = {
    business: 'تجاري',
    creative: 'إبداعي',
    technical: 'تقني',
    personal: 'شخصي',
    social: 'اجتماعي',
    other: 'أخرى',
  };

  const statusLabels: Record<string, string> = {
    new: 'جديدة',
    exploring: 'قيد الاستكشاف',
    developing: 'قيد التطوير',
    implemented: 'منفذة',
    archived: 'مؤرشفة',
  };

  const addIdea = () => {
    if (!newIdea.title) return;
    setIdeas([...ideas, {
      id: generateId(),
      title: newIdea.title,
      category: newIdea.category,
      status: 'new',
      priority: newIdea.priority as any,
      votes: 0
    }]);
    setNewIdea({ title: '', category: 'personal', priority: 'medium', description: '' });
    setShowAddDialog(false);
    toast.success('تم إضافة الفكرة! 💡');
  };

  const voteIdea = (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        فكرة جديدة 💡
      </Button>

      {/* الأفكار */}
      <div className="space-y-3">
        {ideas.sort((a, b) => b.votes - a.votes).map((idea) => (
          <Card key={idea.id} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => voteIdea(idea.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-gray-50 hover:bg-orange-50"
                >
                  <ChevronDown className="h-4 w-4 text-orange-500 rotate-180" />
                  <span className="text-sm font-bold text-orange-500">{idea.votes}</span>
                </button>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{idea.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{categoryLabels[idea.category]}</Badge>
                    <Select
                      value={idea.status}
                      onValueChange={(v) => setIdeas(ideas.map(i => i.id === idea.id ? { ...i, status: v } : i))}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>فكرة جديدة 💡</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">الفكرة</Label>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Select
                value={newIdea.category}
                onValueChange={(v) => setNewIdea({ ...newIdea, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">الأولوية</Label>
              <Select
                value={newIdea.priority}
                onValueChange={(v) => setNewIdea({ ...newIdea, priority: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addIdea} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🎓 قسم التعلم والمسارات
// ============================================
const LearningView = () => {
  const [paths, setPaths] = useState([
    { 
      id: '1', 
      title: 'Arduino المتقدم', 
      category: 'تقني',
      difficulty: 'intermediate',
      totalHours: 40,
      completedHours: 15,
      status: 'in-progress',
      resources: [
        { id: 'r1', title: 'أساسيات Arduino', type: 'video', completed: true },
        { id: 'r2', title: 'المستشعرات', type: 'article', completed: false },
        { id: 'r3', title: 'مشروع عملي', type: 'project', completed: false },
      ]
    },
    { 
      id: '2', 
      title: 'اللغة الإنجليزية', 
      category: 'لغات',
      difficulty: 'intermediate',
      totalHours: 100,
      completedHours: 50,
      status: 'in-progress',
      resources: []
    },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPath, setNewPath] = useState({ title: '', category: '', difficulty: 'beginner', totalHours: '' });

  const difficultyLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-600',
    intermediate: 'text-yellow-600',
    advanced: 'text-red-600',
  };

  const addPath = () => {
    if (!newPath.title) return;
    setPaths([...paths, {
      id: generateId(),
      title: newPath.title,
      category: newPath.category,
      difficulty: newPath.difficulty as any,
      totalHours: parseInt(newPath.totalHours) || 10,
      completedHours: 0,
      status: 'not-started',
      resources: []
    }]);
    setNewPath({ title: '', category: '', difficulty: 'beginner', totalHours: '' });
    setShowAddDialog(false);
    toast.success('تم إضافة مسار التعلم!');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-white shadow-sm text-center">
          <CardContent className="pt-3 pb-3">
            <p className="text-2xl font-bold text-blue-600">{paths.length}</p>
            <p className="text-xs text-gray-500">مسارات</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm text-center">
          <CardContent className="pt-3 pb-3">
            <p className="text-2xl font-bold text-green-600">
              {paths.reduce((s, p) => s + p.completedHours, 0)}
            </p>
            <p className="text-xs text-gray-500">ساعات مكتملة</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm text-center">
          <CardContent className="pt-3 pb-3">
            <p className="text-2xl font-bold text-orange-600">
              {paths.filter(p => p.status === 'in-progress').length}
            </p>
            <p className="text-xs text-gray-500">قيد التعلم</p>
          </CardContent>
        </Card>
      </div>

      {/* زر إضافة */}
      <Button onClick={() => setShowAddDialog(true)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
        <Plus className="h-4 w-4 ml-1" />
        مسار تعلم جديد
      </Button>

      {/* المسارات */}
      <div className="space-y-3">
        {paths.map((path) => (
          <Card key={path.id} className="bg-white shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{path.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{path.category}</Badge>
                    <span className={cn("text-xs font-medium", difficultyColors[path.difficulty])}>
                      {difficultyLabels[path.difficulty]}
                    </span>
                  </div>
                </div>
                <Badge variant={path.status === 'completed' ? 'default' : 'secondary'}>
                  {path.status === 'completed' ? 'مكتمل' : path.status === 'in-progress' ? 'جاري' : 'لم يبدأ'}
                </Badge>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>التقدم</span>
                  <span>{path.completedHours}/{path.totalHours} ساعة</span>
                </div>
                <Progress value={(path.completedHours / path.totalHours) * 100} className="h-2" />
              </div>
              
              {path.resources.length > 0 && (
                <div className="mt-3 space-y-1">
                  {path.resources.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs">
                      {r.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-300" />
                      )}
                      <span className={r.completed ? 'text-gray-400 line-through' : 'text-gray-600'}>
                        {r.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaths(paths.map(p => 
                  p.id === path.id ? { ...p, completedHours: Math.min(p.totalHours, p.completedHours + 1) } : p
                ))}
                className="mt-3 h-7 text-xs"
              >
                + ساعة تعلم
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* حوار الإضافة */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>مسار تعلم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">العنوان</Label>
              <Input
                value={newPath.title}
                onChange={(e) => setNewPath({ ...newPath, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">الفئة</Label>
              <Input
                value={newPath.category}
                onChange={(e) => setNewPath({ ...newPath, category: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">المستوى</Label>
              <Select
                value={newPath.difficulty}
                onValueChange={(v) => setNewPath({ ...newPath, difficulty: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficultyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">عدد الساعات المتوقعة</Label>
              <Input
                type="number"
                value={newPath.totalHours}
                onChange={(e) => setNewPath({ ...newPath, totalHours: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} size="sm">إلغاء</Button>
            <Button onClick={addPath} size="sm">إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// 🏠 الصفحة الرئيسية
// ============================================
export default function Page() {
  const { currentView, setCurrentView } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavigationView, label: text.home, icon: Home },
    { id: 'vision' as NavigationView, label: text.vision, icon: Rocket },
    { id: 'tawjihi' as NavigationView, label: text.tawjihi, icon: BookOpen },
    { id: 'bms-project' as NavigationView, label: text.bmsProject, icon: Wrench },
    { id: 'university' as NavigationView, label: text.university, icon: GraduationCap },
    { id: 'skills' as NavigationView, label: text.skills, icon: TrendingUp },
    { id: 'habits' as NavigationView, label: 'العادات', icon: CheckCircle2 },
    { id: 'health' as NavigationView, label: 'الصحة', icon: Heart },
    { id: 'reading' as NavigationView, label: 'القراءة', icon: BookOpen },
    { id: 'goals' as NavigationView, label: 'الأهداف', icon: Target },
    { id: 'calendar' as NavigationView, label: 'التقويم', icon: Calendar },
    { id: 'journal' as NavigationView, label: 'اليوميات', icon: FileText },
    { id: 'ideas' as NavigationView, label: 'الأفكار', icon: Lightbulb },
    { id: 'learning' as NavigationView, label: 'التعلم', icon: GraduationCap },
    { id: 'business' as NavigationView, label: text.business, icon: Briefcase },
    { id: 'finance' as NavigationView, label: text.finance, icon: Wallet },
    { id: 'notes' as NavigationView, label: text.notes, icon: FileText },
    { id: 'archive' as NavigationView, label: text.archive, icon: Archive },
    { id: 'settings' as NavigationView, label: text.settings, icon: Settings },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'vision': return <VisionView />;
      case 'tawjihi': return <TawjihiView />;
      case 'bms-project': return <BMSProjectView />;
      case 'university': return <UniversityView />;
      case 'skills': return <SkillsView />;
      case 'habits': return <HabitsView />;
      case 'health': return <HealthView />;
      case 'reading': return <ReadingView />;
      case 'goals': return <GoalsView />;
      case 'calendar': return <CalendarView />;
      case 'journal': return <JournalView />;
      case 'ideas': return <IdeasView />;
      case 'learning': return <LearningView />;
      case 'business': return <BusinessView />;
      case 'finance': return <FinanceView />;
      case 'notes': return <NotesView />;
      case 'archive': return <ArchiveView />;
      case 'settings': return <SettingsView />;
      case 'ai-agent': return <AIAgentView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gray-50">
      {/* الهيدر - موبايل */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-gray-900">{text.appName}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('ai-agent')}
            className="text-cyan-500"
          >
            <Brain className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - موبايل overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-64 max-w-[80vw] bg-white shadow-xl"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">{text.appName}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="p-2 space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors',
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Sidebar - ديسكتوب */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 bg-white border-l shadow-sm flex-shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{text.appName}</h2>
                <p className="text-gray-400 text-xs">مساعدك الذكي الشخصي</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-colors',
                  currentView === item.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
          {/* AI Assistant Button in Sidebar */}
          <div className="p-3 border-t">
            <button
              onClick={() => setCurrentView('ai-agent')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-right transition-all hover:shadow-lg"
            >
              <Brain className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">MiMo Chat</span>
            </button>
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 min-w-0 overflow-x-auto">
          <div className="p-4 sm:p-5 lg:p-6 xl:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* War Mode Modal */}
      <WarModeModal />

      {/* Footer - Sticky at bottom */}
      <footer className="mt-auto py-3 text-center text-gray-400 text-xs border-t bg-white flex-shrink-0">
        MiMo Life OS • مساعدك الذكي الشخصي | Powered by Xiaomi MiMo
      </footer>
    </div>
  );
}
