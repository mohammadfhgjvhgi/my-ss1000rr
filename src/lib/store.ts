import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Course, 
  CourseSchedule, 
  Assignment, 
  Exam, 
  Grade, 
  Quote, 
  Settings,
  NavigationView,
  StudySession,
  AIInsight,
  DailyMission,
  StudyPlan,
  PerformanceStats,
  GPARiskIndicator,
  WarModeSession,
  XPReward,
  Priority,
  Note,
  NoteFolder,
  AIConversation,
  EditHistory,
  MoodEntry,
  FinancialTransaction,
  QuickNote,
  StreakData,
  DailyLog,
  TawjihiSubject,
  TawjihiGoal,
  StudyScheduleItem,
  ExamCountdown,
  BMSComponent,
  BMSTechnicalChallenge,
  BMSProjectProgress,
  CodeSnippet,
  ScholarshipRequirement,
  ApplicationDocument,
  ApplicationTimeline,
  ChinaPreparation,
  BusinessIdea,
  ProjectPortfolio,
  Skill,
  LearningResource,
  VisionBoardItem,
  YearlyGoal,
  WeeklyTask,
  UserProfile,
  AIAgentMessage,
  AIConversationSession,
  MediaFile,
  MediaFolder,
  ArchiveTopic,
  ProjectArchive,
  UserExperience,
  DailyRecord,
  // ⚔️ Execution Engine Types
  ExecutionTask,
  SmartAlert,
  HardModeSettings,
  AICommand,
  // 🏥 Health & Fitness Types
  HealthRecord,
  WorkoutSession,
  HealthGoal,
  // 🔄 Habits Types
  Habit,
  HabitCompletion,
  // 📚 Library Types
  Book,
  ReadingSession,
  ReadingGoal,
  ResourceLink,
  // 📅 Calendar Types
  CalendarEvent,
  // 📝 Review Types
  DailyReview,
  ReflectionQuestion
} from '@/types';
import { calculateGPA, getDaysUntil, scoreToGradePoint, getRandomCourseColor, generateId } from '@/lib/utils';

// ============================================
// USER PROFILE
// ============================================

const userProfile: UserProfile = {
  name: 'محمد',
  age: 18,
  location: 'الخليل / دورا - فلسطين 🇵🇸',
  education: 'توجيهي صناعي',
  major: 'تكنولوجيا المباني الذكية',
  personality: 'ENTJ-A',
  goals: [
    'التفوق في التوجيهي',
    'إكمال مشروع BMS بنجاح',
    'الحصول على منحة دراسية في الصين',
    'بناء مشاريع تجارية ناجحة'
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateXPEarned = (duration: number, completed: boolean, priority?: Priority): number => {
  if (!completed) return 0;
  let base = duration * 2;
  if (priority === 'critical') base *= 2;
  if (priority === 'high') base *= 1.5;
  return Math.round(base);
};

const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 500) + 1;
};

const defaultSettings: Settings = {
  id: 'default',
  totalRequiredCredits: 150,
  targetGPA: 3.5,
  currentSemester: '2024-Fall',
  reminderEnabled: true,
  theme: 'light',
};

const defaultPerformance: PerformanceStats = {
  totalStudyHours: 0,
  sessionsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalXP: 0,
  level: 1,
  weeklyGoal: 10,
  weeklyProgress: 0,
};

// ============================================
// DEFAULT TAWJIHI SUBJECTS (التوجيهي الصناعي)
// ============================================

const defaultTawjihiSubjects: TawjihiSubject[] = [
  // المواد الأكاديمية
  { id: '1', name: 'اللغة العربية', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'اللغة الإنجليزية', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'الرياضيات', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'الفيزياء', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'الكيمياء', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'التربية الإسلامية', type: 'academic', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  // المواد المهنية
  { id: '7', name: 'الرسم الصناعي', type: 'vocational', category: 'رسم صناعي', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '8', name: 'مشروع التخرج', type: 'vocational', category: 'مشروع', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '9', name: 'العملي', type: 'vocational', category: 'عملي', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
  { id: '10', name: 'النظري المهني', type: 'vocational', category: 'نظري', maxGrade: 100, weight: 1, semester: 'first', createdAt: new Date(), updatedAt: new Date() },
];

// ============================================
// STORE INTERFACE
// ============================================

interface LifeOSState {
  // User Profile
  userProfile: UserProfile;
  
  // Navigation
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Courses (Legacy - for backward compatibility)
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Schedules
  schedules: CourseSchedule[];
  setSchedules: (schedules: CourseSchedule[]) => void;
  addSchedule: (schedule: CourseSchedule) => void;
  updateSchedule: (id: string, schedule: Partial<CourseSchedule>) => void;
  deleteSchedule: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Exams
  exams: Exam[];
  setExams: (exams: Exam[]) => void;
  addExam: (exam: Exam) => void;
  updateExam: (id: string, exam: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Grades
  grades: Grade[];
  setGrades: (grades: Grade[]) => void;
  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, grade: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // ============================================
  // TAWJIHI TRACKER (التوجيهي)
  // ============================================
  
  tawjihiSubjects: TawjihiSubject[];
  updateTawjihiSubject: (id: string, subject: Partial<TawjihiSubject>) => void;
  
  tawjihiGoal: TawjihiGoal;
  setTawjihiGoal: (goal: Partial<TawjihiGoal>) => void;
  
  studySchedule: StudyScheduleItem[];
  addStudyScheduleItem: (item: StudyScheduleItem) => void;
  updateStudyScheduleItem: (id: string, item: Partial<StudyScheduleItem>) => void;
  deleteStudyScheduleItem: (id: string) => void;
  
  examCountdowns: ExamCountdown[];
  addExamCountdown: (countdown: ExamCountdown) => void;
  updateExamCountdown: (id: string, countdown: Partial<ExamCountdown>) => void;
  deleteExamCountdown: (id: string) => void;

  // ============================================
  // BMS PROJECT (مشروع التخرج)
  // ============================================
  
  bmsComponents: BMSComponent[];
  addBMSComponent: (component: BMSComponent) => void;
  updateBMSComponent: (id: string, component: Partial<BMSComponent>) => void;
  deleteBMSComponent: (id: string) => void;
  
  bmsChallenges: BMSTechnicalChallenge[];
  addBMSChallenge: (challenge: BMSTechnicalChallenge) => void;
  updateBMSChallenge: (id: string, challenge: Partial<BMSTechnicalChallenge>) => void;
  deleteBMSChallenge: (id: string) => void;
  
  bmsProgress: BMSProjectProgress[];
  addBMSProgress: (progress: BMSProjectProgress) => void;
  updateBMSProgress: (id: string, progress: Partial<BMSProjectProgress>) => void;
  
  codeSnippets: CodeSnippet[];
  addCodeSnippet: (snippet: CodeSnippet) => void;
  updateCodeSnippet: (id: string, snippet: Partial<CodeSnippet>) => void;
  deleteCodeSnippet: (id: string) => void;

  // ============================================
  // UNIVERSITY & SCHOLARSHIP (المنحة والجامعة)
  // ============================================
  
  scholarshipRequirements: ScholarshipRequirement[];
  addScholarshipRequirement: (req: ScholarshipRequirement) => void;
  updateScholarshipRequirement: (id: string, req: Partial<ScholarshipRequirement>) => void;
  deleteScholarshipRequirement: (id: string) => void;
  
  applicationDocuments: ApplicationDocument[];
  addApplicationDocument: (doc: ApplicationDocument) => void;
  updateApplicationDocument: (id: string, doc: Partial<ApplicationDocument>) => void;
  deleteApplicationDocument: (id: string) => void;
  
  applicationTimeline: ApplicationTimeline[];
  addTimelineEvent: (event: ApplicationTimeline) => void;
  updateTimelineEvent: (id: string, event: Partial<ApplicationTimeline>) => void;
  deleteTimelineEvent: (id: string) => void;
  
  chinaPreparations: ChinaPreparation[];
  addChinaPreparation: (prep: ChinaPreparation) => void;
  updateChinaPreparation: (id: string, prep: Partial<ChinaPreparation>) => void;
  deleteChinaPreparation: (id: string) => void;

  // ============================================
  // BUSINESS & PROJECTS (المشاريع والأعمال)
  // ============================================
  
  businessIdeas: BusinessIdea[];
  addBusinessIdea: (idea: BusinessIdea) => void;
  updateBusinessIdea: (id: string, idea: Partial<BusinessIdea>) => void;
  deleteBusinessIdea: (id: string) => void;
  
  projectPortfolio: ProjectPortfolio[];
  addProject: (project: ProjectPortfolio) => void;
  updateProject: (id: string, project: Partial<ProjectPortfolio>) => void;
  deleteProject: (id: string) => void;

  // ============================================
  // SKILLS TRACKER
  // ============================================
  
  skills: Skill[];
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  
  learningResources: LearningResource[];
  addLearningResource: (resource: LearningResource) => void;
  updateLearningResource: (id: string, resource: Partial<LearningResource>) => void;
  deleteLearningResource: (id: string) => void;

  // ============================================
  // LIFE GOALS
  // ============================================
  
  visionBoard: VisionBoardItem[];
  addVisionItem: (item: VisionBoardItem) => void;
  updateVisionItem: (id: string, item: Partial<VisionBoardItem>) => void;
  deleteVisionItem: (id: string) => void;
  
  yearlyGoals: YearlyGoal[];
  addYearlyGoal: (goal: YearlyGoal) => void;
  updateYearlyGoal: (id: string, goal: Partial<YearlyGoal>) => void;
  deleteYearlyGoal: (id: string) => void;
  
  weeklyTasks: WeeklyTask[];
  addWeeklyTask: (task: WeeklyTask) => void;
  updateWeeklyTask: (id: string, task: Partial<WeeklyTask>) => void;
  deleteWeeklyTask: (id: string) => void;

  // ============================================
  // PERSONAL MANAGEMENT
  // ============================================
  
  // Study Sessions
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, session: Partial<StudySession>) => void;
  getTodayStudyHours: () => number;
  
  // Performance
  performance: PerformanceStats;
  updatePerformance: (stats: Partial<PerformanceStats>) => void;
  addXP: (xp: number, action: string) => void;
  
  // War Mode
  warModeSession: WarModeSession | null;
  startWarMode: (courseId: string, duration: number) => void;
  pauseWarMode: () => void;
  resumeWarMode: () => void;
  endWarMode: (completed: boolean) => void;
  tickWarMode: (seconds: number) => void;
  isWarModeModalOpen: boolean;
  setWarModeModalOpen: (open: boolean) => void;
  
  // XP History
  xpHistory: XPReward[];

  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  currentNoteId: string | null;
  setCurrentNoteId: (id: string | null) => void;
  
  // Folders
  folders: NoteFolder[];
  setFolders: (folders: NoteFolder[]) => void;
  addFolder: (folder: NoteFolder) => void;
  updateFolder: (id: string, folder: Partial<NoteFolder>) => void;
  deleteFolder: (id: string) => void;

  // Mood Tracking
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: MoodEntry) => void;
  getTodayMood: () => MoodEntry | null;
  
  // Financial Transactions
  transactions: FinancialTransaction[];
  addTransaction: (transaction: FinancialTransaction) => void;
  deleteTransaction: (id: string) => void;
  getTodayTransactions: () => FinancialTransaction[];
  getTotalBalance: () => number;
  
  // Quick Notes
  quickNotes: QuickNote[];
  addQuickNote: (note: QuickNote) => void;
  deleteQuickNote: (id: string) => void;
  
  // Streak Tracking
  streak: StreakData;
  updateStreak: () => void;
  
  // Daily Logs
  dailyLogs: DailyLog[];
  addDailyLog: (log: DailyLog) => void;
  getTodayLog: () => DailyLog | null;

  // AI Agent
  aiMessages: AIAgentMessage[];
  addAIMessage: (message: AIAgentMessage) => void;
  clearAIMessages: () => void;
  
  // AI Conversations (ChatGPT-like)
  aiConversations: AIConversationSession[];
  currentConversationId: string | null;
  createConversation: (context?: AIConversationSession['context']) => string;
  setCurrentConversation: (id: string | null) => void;
  addMessageToConversation: (conversationId: string, message: AIAgentMessage) => void;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  pinConversation: (id: string, pinned: boolean) => void;
  
  // User Experiences & Extracted Data
  userExperiences: UserExperience[];
  addExperience: (experience: UserExperience) => void;
  updateExperience: (id: string, experience: Partial<UserExperience>) => void;
  deleteExperience: (id: string) => void;
  
  // Daily Records (for AI to record automatically)
  dailyRecords: DailyRecord[];
  addDailyRecord: (record: DailyRecord) => void;
  
  // Media & Archive
  mediaFiles: MediaFile[];
  addMediaFile: (file: MediaFile) => void;
  deleteMediaFile: (id: string) => void;
  mediaFolders: MediaFolder[];
  addMediaFolder: (folder: MediaFolder) => void;
  deleteMediaFolder: (id: string) => void;
  archiveTopics: ArchiveTopic[];
  addArchiveTopic: (topic: ArchiveTopic) => void;
  updateArchiveTopic: (id: string, topic: Partial<ArchiveTopic>) => void;
  deleteArchiveTopic: (id: string) => void;
  projectArchives: ProjectArchive[];
  addProjectArchive: (project: ProjectArchive) => void;
  updateProjectArchive: (id: string, project: Partial<ProjectArchive>) => void;
  deleteProjectArchive: (id: string) => void;

  // Quote
  dailyQuote: Quote | null;
  setDailyQuote: (quote: Quote | null) => void;

  // ============================================
  // ⚔️ EXECUTION ENGINE - محرك التنفيذ
  // ============================================
  
  // Daily Missions (Auto-generated tasks)
  dailyMissions: ExecutionTask[];
  generateDailyMissions: () => void;
  completeMission: (id: string) => void;
  
  // Smart Alerts
  alerts: SmartAlert[];
  generateAlerts: () => void;
  dismissAlert: (id: string) => void;
  
  // Hard Mode
  hardMode: HardModeSettings;
  toggleHardMode: () => void;
  
  // AI Commands
  executeCommand: (command: AICommand) => void;
  commandsQueue: AICommand[];
  
  // Daily Records
  addDailyRecord: (record: DailyRecord) => void;

  // ============================================
  // 🏥 HEALTH & FITNESS - الصحة واللياقة
  // ============================================
  
  healthRecords: HealthRecord[];
  addHealthRecord: (record: HealthRecord) => void;
  updateHealthRecord: (id: string, record: Partial<HealthRecord>) => void;
  getTodayHealthRecord: () => HealthRecord | null;
  
  workoutSessions: WorkoutSession[];
  addWorkoutSession: (session: WorkoutSession) => void;
  updateWorkoutSession: (id: string, session: Partial<WorkoutSession>) => void;
  deleteWorkoutSession: (id: string) => void;
  
  healthGoals: HealthGoal[];
  addHealthGoal: (goal: HealthGoal) => void;
  updateHealthGoal: (id: string, goal: Partial<HealthGoal>) => void;
  deleteHealthGoal: (id: string) => void;

  // ============================================
  // 🔄 HABITS - العادات اليومية
  // ============================================
  
  habits: Habit[];
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string) => void;
  
  habitCompletions: HabitCompletion[];
  addHabitCompletion: (completion: HabitCompletion) => void;
  getTodayHabitCompletions: () => HabitCompletion[];

  // ============================================
  // 📚 LIBRARY - الكتب والموارد
  // ============================================
  
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  
  readingSessions: ReadingSession[];
  addReadingSession: (session: ReadingSession) => void;
  
  readingGoals: ReadingGoal[];
  setReadingGoal: (goal: ReadingGoal) => void;
  
  resourceLinks: ResourceLink[];
  addResourceLink: (link: ResourceLink) => void;
  updateResourceLink: (id: string, link: Partial<ResourceLink>) => void;
  deleteResourceLink: (id: string) => void;

  // ============================================
  // 📅 CALENDAR - التقويم والأحداث
  // ============================================
  
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  getUpcomingEvents: () => CalendarEvent[];

  // ============================================
  // 📝 REVIEW - المراجعات والتأملات
  // ============================================
  
  dailyReviews: DailyReview[];
  addDailyReview: (review: DailyReview) => void;
  updateDailyReview: (id: string, review: Partial<DailyReview>) => void;
  getTodayReview: () => DailyReview | null;
  getWeeklyReviews: () => DailyReview[];
  getMonthlyReviews: () => DailyReview[];
  
  reflectionQuestions: ReflectionQuestion[];
  addReflectionQuestion: (question: ReflectionQuestion) => void;
  updateReflectionQuestion: (id: string, question: Partial<ReflectionQuestion>) => void;
  deleteReflectionQuestion: (id: string) => void;

  // Data Persistence
  exportData: () => string;
  importData: (jsonString: string) => boolean;
  clearAllData: () => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useStore = create<LifeOSState>()(
  persist(
    (set, get) => ({
      // User Profile
      userProfile,
      
      // Navigation
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Courses
      courses: [],
      setCourses: (courses) => set({ courses }),
      addCourse: (course) => set((state) => ({ 
        courses: [...state.courses, course] 
      })),
      updateCourse: (id, course) => set((state) => ({
        courses: state.courses.map((c) => 
          c.id === id ? { ...c, ...course } : c
        ),
      })),
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
      })),

      // Schedules
      schedules: [],
      setSchedules: (schedules) => set({ schedules }),
      addSchedule: (schedule) => set((state) => ({ 
        schedules: [...state.schedules, schedule] 
      })),
      updateSchedule: (id, schedule) => set((state) => ({
        schedules: state.schedules.map((s) => 
          s.id === id ? { ...s, ...schedule } : s
        ),
      })),
      deleteSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
      })),

      // Assignments
      assignments: [],
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) => set((state) => ({ 
        assignments: [...state.assignments, assignment] 
      })),
      updateAssignment: (id, assignment) => set((state) => ({
        assignments: state.assignments.map((a) => 
          a.id === id ? { ...a, ...assignment } : a
        ),
      })),
      deleteAssignment: (id) => set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
      })),

      // Exams
      exams: [],
      setExams: (exams) => set({ exams }),
      addExam: (exam) => set((state) => ({ 
        exams: [...state.exams, exam] 
      })),
      updateExam: (id, exam) => set((state) => ({
        exams: state.exams.map((e) => 
          e.id === id ? { ...e, ...exam } : e
        ),
      })),
      deleteExam: (id) => set((state) => ({
        exams: state.exams.filter((e) => e.id !== id),
      })),

      // Grades
      grades: [],
      setGrades: (grades) => set({ grades }),
      addGrade: (grade) => set((state) => ({ 
        grades: [...state.grades, grade] 
      })),
      updateGrade: (id, grade) => set((state) => ({
        grades: state.grades.map((g) => 
          g.id === id ? { ...g, ...grade } : g
        ),
      })),
      deleteGrade: (id) => set((state) => ({
        grades: state.grades.filter((g) => g.id !== id),
      })),

      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

      // ============================================
      // TAWJIHI TRACKER
      // ============================================
      
      tawjihiSubjects: defaultTawjihiSubjects,
      updateTawjihiSubject: (id, subject) => set((state) => ({
        tawjihiSubjects: state.tawjihiSubjects.map((s) => 
          s.id === id ? { ...s, ...subject, updatedAt: new Date() } : s
        ),
      })),
      
      tawjihiGoal: {
        id: '1',
        targetGrade: 400, // من 500
        currentGrade: 0,
        remainingPoints: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      setTawjihiGoal: (goal) => set((state) => ({
        tawjihiGoal: { ...state.tawjihiGoal, ...goal, updatedAt: new Date() },
      })),
      
      studySchedule: [],
      addStudyScheduleItem: (item) => set((state) => ({ 
        studySchedule: [...state.studySchedule, item] 
      })),
      updateStudyScheduleItem: (id, item) => set((state) => ({
        studySchedule: state.studySchedule.map((s) => 
          s.id === id ? { ...s, ...item } : s
        ),
      })),
      deleteStudyScheduleItem: (id) => set((state) => ({
        studySchedule: state.studySchedule.filter((s) => s.id !== id),
      })),
      
      examCountdowns: [],
      addExamCountdown: (countdown) => set((state) => ({ 
        examCountdowns: [...state.examCountdowns, countdown] 
      })),
      updateExamCountdown: (id, countdown) => set((state) => ({
        examCountdowns: state.examCountdowns.map((c) => 
          c.id === id ? { ...c, ...countdown } : c
        ),
      })),
      deleteExamCountdown: (id) => set((state) => ({
        examCountdowns: state.examCountdowns.filter((c) => c.id !== id),
      })),

      // ============================================
      // BMS PROJECT
      // ============================================
      
      bmsComponents: [],
      addBMSComponent: (component) => set((state) => ({ 
        bmsComponents: [...state.bmsComponents, component] 
      })),
      updateBMSComponent: (id, component) => set((state) => ({
        bmsComponents: state.bmsComponents.map((c) => 
          c.id === id ? { ...c, ...component, updatedAt: new Date() } : c
        ),
      })),
      deleteBMSComponent: (id) => set((state) => ({
        bmsComponents: state.bmsComponents.filter((c) => c.id !== id),
      })),
      
      bmsChallenges: [],
      addBMSChallenge: (challenge) => set((state) => ({ 
        bmsChallenges: [...state.bmsChallenges, challenge] 
      })),
      updateBMSChallenge: (id, challenge) => set((state) => ({
        bmsChallenges: state.bmsChallenges.map((c) => 
          c.id === id ? { ...c, ...challenge, updatedAt: new Date() } : c
        ),
      })),
      deleteBMSChallenge: (id) => set((state) => ({
        bmsChallenges: state.bmsChallenges.filter((c) => c.id !== id),
      })),
      
      bmsProgress: [
        { id: '1', phase: 'التخطيط والتصميم', progress: 100, status: 'completed' },
        { id: '2', phase: 'تجميع المكونات', progress: 60, status: 'in_progress' },
        { id: '3', phase: 'البرمجة والتطوير', progress: 0, status: 'not_started' },
        { id: '4', phase: 'الاختبار والتحسين', progress: 0, status: 'not_started' },
        { id: '5', phase: 'التوثيق والعرض', progress: 0, status: 'not_started' },
      ],
      addBMSProgress: (progress) => set((state) => ({ 
        bmsProgress: [...state.bmsProgress, progress] 
      })),
      updateBMSProgress: (id, progress) => set((state) => ({
        bmsProgress: state.bmsProgress.map((p) => 
          p.id === id ? { ...p, ...progress } : p
        ),
      })),
      
      codeSnippets: [],
      addCodeSnippet: (snippet) => set((state) => ({ 
        codeSnippets: [...state.codeSnippets, snippet] 
      })),
      updateCodeSnippet: (id, snippet) => set((state) => ({
        codeSnippets: state.codeSnippets.map((s) => 
          s.id === id ? { ...s, ...snippet, updatedAt: new Date() } : s
        ),
      })),
      deleteCodeSnippet: (id) => set((state) => ({
        codeSnippets: state.codeSnippets.filter((s) => s.id !== id),
      })),

      // ============================================
      // UNIVERSITY & SCHOLARSHIP
      // ============================================
      
      scholarshipRequirements: [
        { id: '1', title: 'شهادة الثانوية العامة', category: 'academic', status: 'in_progress', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'معدل 80% أو أعلى', category: 'academic', status: 'in_progress', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'اختبار اللغة الإنجليزية (IELTS/TOEFL)', category: 'language', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', title: 'جواز سفر ساري المفعول', category: 'documents', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '5', title: 'صور شخصية', category: 'documents', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '6', title: 'شهادة حسن سيرة وسلوك', category: 'documents', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '7', title: 'كشف طبي', category: 'documents', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '8', title: 'إثبات مالي', category: 'financial', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
      ],
      addScholarshipRequirement: (req) => set((state) => ({ 
        scholarshipRequirements: [...state.scholarshipRequirements, req] 
      })),
      updateScholarshipRequirement: (id, req) => set((state) => ({
        scholarshipRequirements: state.scholarshipRequirements.map((r) => 
          r.id === id ? { ...r, ...req, updatedAt: new Date() } : r
        ),
      })),
      deleteScholarshipRequirement: (id) => set((state) => ({
        scholarshipRequirements: state.scholarshipRequirements.filter((r) => r.id !== id),
      })),
      
      applicationDocuments: [],
      addApplicationDocument: (doc) => set((state) => ({ 
        applicationDocuments: [...state.applicationDocuments, doc] 
      })),
      updateApplicationDocument: (id, doc) => set((state) => ({
        applicationDocuments: state.applicationDocuments.map((d) => 
          d.id === id ? { ...d, ...doc, updatedAt: new Date() } : d
        ),
      })),
      deleteApplicationDocument: (id) => set((state) => ({
        applicationDocuments: state.applicationDocuments.filter((d) => d.id !== id),
      })),
      
      applicationTimeline: [],
      addTimelineEvent: (event) => set((state) => ({ 
        applicationTimeline: [...state.applicationTimeline, event] 
      })),
      updateTimelineEvent: (id, event) => set((state) => ({
        applicationTimeline: state.applicationTimeline.map((e) => 
          e.id === id ? { ...e, ...event } : e
        ),
      })),
      deleteTimelineEvent: (id) => set((state) => ({
        applicationTimeline: state.applicationTimeline.filter((e) => e.id !== id),
      })),
      
      chinaPreparations: [
        { id: '1', category: 'visa', title: 'تأشيرة الطالب الصينية', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', category: 'housing', title: 'البحث عن سكن', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', category: 'language', title: 'تعلم أساسيات اللغة الصينية', status: 'in_progress', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', category: 'packing', title: 'قائمة الأغراض المطلوبة', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
        { id: '5', category: 'finance', title: 'توفير المال اللازم', status: 'in_progress', createdAt: new Date(), updatedAt: new Date() },
      ],
      addChinaPreparation: (prep) => set((state) => ({ 
        chinaPreparations: [...state.chinaPreparations, prep] 
      })),
      updateChinaPreparation: (id, prep) => set((state) => ({
        chinaPreparations: state.chinaPreparations.map((p) => 
          p.id === id ? { ...p, ...prep, updatedAt: new Date() } : p
        ),
      })),
      deleteChinaPreparation: (id) => set((state) => ({
        chinaPreparations: state.chinaPreparations.filter((p) => p.id !== id),
      })),

      // ============================================
      // BUSINESS & PROJECTS
      // ============================================
      
      businessIdeas: [],
      addBusinessIdea: (idea) => set((state) => ({ 
        businessIdeas: [...state.businessIdeas, idea] 
      })),
      updateBusinessIdea: (id, idea) => set((state) => ({
        businessIdeas: state.businessIdeas.map((i) => 
          i.id === id ? { ...i, ...idea, updatedAt: new Date() } : i
        ),
      })),
      deleteBusinessIdea: (id) => set((state) => ({
        businessIdeas: state.businessIdeas.filter((i) => i.id !== id),
      })),
      
      projectPortfolio: [],
      addProject: (project) => set((state) => ({ 
        projectPortfolio: [...state.projectPortfolio, project] 
      })),
      updateProject: (id, project) => set((state) => ({
        projectPortfolio: state.projectPortfolio.map((p) => 
          p.id === id ? { ...p, ...project, updatedAt: new Date() } : p
        ),
      })),
      deleteProject: (id) => set((state) => ({
        projectPortfolio: state.projectPortfolio.filter((p) => p.id !== id),
      })),

      // ============================================
      // SKILLS TRACKER
      // ============================================
      
      skills: [
        { id: '1', name: 'Arduino', category: 'technical', level: 'intermediate', progress: 60, resources: [], practiceHours: 50, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Python', category: 'technical', level: 'beginner', progress: 30, resources: [], practiceHours: 20, createdAt: new Date(), updatedAt: new Date() },
        { id: '3', name: 'BMS Systems', category: 'technical', level: 'beginner', progress: 40, resources: [], practiceHours: 30, createdAt: new Date(), updatedAt: new Date() },
        { id: '4', name: 'English', category: 'language', level: 'intermediate', progress: 70, resources: [], practiceHours: 200, createdAt: new Date(), updatedAt: new Date() },
        { id: '5', name: 'Chinese', category: 'language', level: 'beginner', progress: 10, resources: [], practiceHours: 5, createdAt: new Date(), updatedAt: new Date() },
        { id: '6', name: 'Leadership', category: 'soft', level: 'intermediate', progress: 50, resources: [], practiceHours: 30, createdAt: new Date(), updatedAt: new Date() },
      ],
      addSkill: (skill) => set((state) => ({ 
        skills: [...state.skills, skill] 
      })),
      updateSkill: (id, skill) => set((state) => ({
        skills: state.skills.map((s) => 
          s.id === id ? { ...s, ...skill, updatedAt: new Date() } : s
        ),
      })),
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter((s) => s.id !== id),
      })),
      
      learningResources: [],
      addLearningResource: (resource) => set((state) => ({ 
        learningResources: [...state.learningResources, resource] 
      })),
      updateLearningResource: (id, resource) => set((state) => ({
        learningResources: state.learningResources.map((r) => 
          r.id === id ? { ...r, ...resource } : r
        ),
      })),
      deleteLearningResource: (id) => set((state) => ({
        learningResources: state.learningResources.filter((r) => r.id !== id),
      })),

      // ============================================
      // LIFE GOALS
      // ============================================
      
      visionBoard: [
        { id: '1', title: 'التفوق في التوجيهي', category: 'education', status: 'working', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'دراسة في جامعة هونان للتكنولوجيا', category: 'education', status: 'planning', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'بناء شركة ناشئة في الذكاء الاصطناعي', category: 'career', status: 'dreaming', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', title: 'زيارة المعبد المحظور في بكين', category: 'travel', status: 'dreaming', createdAt: new Date(), updatedAt: new Date() },
      ],
      addVisionItem: (item) => set((state) => ({ 
        visionBoard: [...state.visionBoard, item] 
      })),
      updateVisionItem: (id, item) => set((state) => ({
        visionBoard: state.visionBoard.map((i) => 
          i.id === id ? { ...i, ...item, updatedAt: new Date() } : i
        ),
      })),
      deleteVisionItem: (id) => set((state) => ({
        visionBoard: state.visionBoard.filter((i) => i.id !== id),
      })),
      
      yearlyGoals: [],
      addYearlyGoal: (goal) => set((state) => ({ 
        yearlyGoals: [...state.yearlyGoals, goal] 
      })),
      updateYearlyGoal: (id, goal) => set((state) => ({
        yearlyGoals: state.yearlyGoals.map((g) => 
          g.id === id ? { ...g, ...goal, updatedAt: new Date() } : g
        ),
      })),
      deleteYearlyGoal: (id) => set((state) => ({
        yearlyGoals: state.yearlyGoals.filter((g) => g.id !== id),
      })),
      
      weeklyTasks: [],
      addWeeklyTask: (task) => set((state) => ({ 
        weeklyTasks: [...state.weeklyTasks, task] 
      })),
      updateWeeklyTask: (id, task) => set((state) => ({
        weeklyTasks: state.weeklyTasks.map((t) => 
          t.id === id ? { ...t, ...task } : t
        ),
      })),
      deleteWeeklyTask: (id) => set((state) => ({
        weeklyTasks: state.weeklyTasks.filter((t) => t.id !== id),
      })),

      // ============================================
      // PERSONAL MANAGEMENT
      // ============================================
      
      // Study Sessions
      studySessions: [],
      addStudySession: (session) => set((state) => {
        const xpEarned = calculateXPEarned(session.duration, session.completed);
        const newTotalXP = state.performance.totalXP + xpEarned;
        const newTotalHours = state.performance.totalStudyHours + (session.duration / 60);
        
        return {
          studySessions: [...state.studySessions, session],
          performance: {
            ...state.performance,
            totalStudyHours: newTotalHours,
            sessionsCompleted: session.completed ? state.performance.sessionsCompleted + 1 : state.performance.sessionsCompleted,
            totalXP: newTotalXP,
            level: calculateLevel(newTotalXP),
            weeklyProgress: state.performance.weeklyProgress + (session.duration / 60),
          },
          xpHistory: [...state.xpHistory, { action: session.completed ? 'جلسة دراسة مكتملة' : 'جلسة دراسة', xp: xpEarned, timestamp: new Date() }],
        };
      }),
      updateStudySession: (id, session) => set((state) => ({
        studySessions: state.studySessions.map((s) => 
          s.id === id ? { ...s, ...session } : s
        ),
      })),
      getTodayStudyHours: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.studySessions
          .filter(s => new Date(s.date).toDateString() === today && s.completed)
          .reduce((sum, s) => sum + s.duration, 0) / 60;
      },
      
      // Performance
      performance: defaultPerformance,
      updatePerformance: (stats) => set((state) => ({
        performance: { ...state.performance, ...stats },
      })),
      addXP: (xp, action) => set((state) => ({
        performance: {
          ...state.performance,
          totalXP: state.performance.totalXP + xp,
          level: calculateLevel(state.performance.totalXP + xp),
        },
        xpHistory: [...state.xpHistory, { action, xp, timestamp: new Date() }],
      })),
      
      // War Mode
      warModeSession: null,
      startWarMode: (courseId, duration) => set({
        warModeSession: {
          id: generateId(),
          courseId,
          targetDuration: duration * 60,
          elapsed: 0,
          startedAt: new Date(),
          status: 'active',
          xpRate: 2,
        },
      }),
      pauseWarMode: () => set((state) => ({
        warModeSession: state.warModeSession ? { ...state.warModeSession, status: 'paused' } : null,
      })),
      resumeWarMode: () => set((state) => ({
        warModeSession: state.warModeSession ? { ...state.warModeSession, status: 'active' } : null,
      })),
      endWarMode: (completed) => {
        const state = get();
        if (!state.warModeSession) return;
        
        const duration = Math.floor(state.warModeSession.elapsed / 60);
        const xpEarned = completed ? duration * state.warModeSession.xpRate : 0;
        
        const session: StudySession = {
          id: generateId(),
          courseId: state.warModeSession.courseId,
          duration,
          completed,
          date: new Date(),
          createdAt: new Date(),
          xpEarned,
        };
        
        set((state) => ({
          warModeSession: null,
          studySessions: [...state.studySessions, session],
          performance: {
            ...state.performance,
            totalStudyHours: state.performance.totalStudyHours + (duration / 60),
            sessionsCompleted: completed ? state.performance.sessionsCompleted + 1 : state.performance.sessionsCompleted,
            totalXP: state.performance.totalXP + xpEarned,
            level: calculateLevel(state.performance.totalXP + xpEarned),
            weeklyProgress: state.performance.weeklyProgress + (duration / 60),
          },
          xpHistory: [...state.xpHistory, { action: completed ? 'وضع الحرب مكتمل' : 'جلسة وضع الحرب', xp: xpEarned, timestamp: new Date() }],
        }));
      },
      tickWarMode: (seconds) => set((state) => {
        if (!state.warModeSession || state.warModeSession.status !== 'active') return state;
        return {
          warModeSession: {
            ...state.warModeSession,
            elapsed: state.warModeSession.elapsed + seconds,
          },
        };
      }),
      isWarModeModalOpen: false,
      setWarModeModalOpen: (open) => set({ isWarModeModalOpen: open }),
      
      // XP History
      xpHistory: [],

      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ 
        notes: [...state.notes, note] 
      })),
      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map((n) => 
          n.id === id ? { ...n, ...note, updatedAt: new Date() } : n
        ),
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
      })),
      currentNoteId: null,
      setCurrentNoteId: (id) => set({ currentNoteId: id }),
      
      // Folders
      folders: [],
      setFolders: (folders) => set({ folders }),
      addFolder: (folder) => set((state) => ({ 
        folders: [...state.folders, folder] 
      })),
      updateFolder: (id, folder) => set((state) => ({
        folders: state.folders.map((f) => 
          f.id === id ? { ...f, ...folder, updatedAt: new Date() } : f
        ),
      })),
      deleteFolder: (id) => set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        notes: state.notes.map((n) => 
          n.folderId === id ? { ...n, folderId: null } : n
        ),
      })),

      // Mood Tracking
      moodEntries: [],
      addMoodEntry: (entry) => set((state) => {
        const existingIndex = state.moodEntries.findIndex(
          m => new Date(m.date).toDateString() === new Date(entry.date).toDateString()
        );
        const newEntries = existingIndex >= 0 
          ? state.moodEntries.map((m, i) => i === existingIndex ? entry : m)
          : [...state.moodEntries, entry];
        return { moodEntries: newEntries };
      }),
      getTodayMood: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.moodEntries.find(m => new Date(m.date).toDateString() === today) || null;
      },
      
      // Financial Transactions
      transactions: [],
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [...state.transactions, transaction] 
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id),
      })),
      getTodayTransactions: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.transactions.filter(t => new Date(t.date).toDateString() === today);
      },
      getTotalBalance: () => {
        const state = get();
        return state.transactions.reduce((balance, t) => 
          t.type === 'income' ? balance + t.amount : balance - t.amount, 0
        );
      },
      
      // Quick Notes
      quickNotes: [],
      addQuickNote: (note) => set((state) => ({ 
        quickNotes: [...state.quickNotes, note] 
      })),
      deleteQuickNote: (id) => set((state) => ({
        quickNotes: state.quickNotes.filter(n => n.id !== id),
      })),
      
      // Streak Tracking
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        totalDays: 0,
      },
      updateStreak: () => {
        const state = get();
        const today = new Date();
        const todayStr = today.toDateString();
        const lastActive = state.streak.lastActiveDate ? new Date(state.streak.lastActiveDate) : null;
        
        let newStreak = { ...state.streak };
        
        if (!lastActive) {
          newStreak = {
            currentStreak: 1,
            longestStreak: 1,
            lastActiveDate: today,
            totalDays: 1,
          };
        } else {
          const lastStr = lastActive.toDateString();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          
          if (lastStr === todayStr) {
            return;
          } else if (lastStr === yesterdayStr) {
            newStreak.currentStreak += 1;
            newStreak.totalDays += 1;
            newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);
            newStreak.lastActiveDate = today;
          } else {
            newStreak.currentStreak = 1;
            newStreak.totalDays += 1;
            newStreak.lastActiveDate = today;
          }
        }
        
        set({ streak: newStreak });
      },
      
      // Daily Logs
      dailyLogs: [],
      addDailyLog: (log) => set((state) => {
        const existingIndex = state.dailyLogs.findIndex(
          l => new Date(l.date).toDateString() === new Date(log.date).toDateString()
        );
        if (existingIndex >= 0) {
          return {
            dailyLogs: state.dailyLogs.map((l, i) => i === existingIndex ? log : l)
          };
        }
        return { dailyLogs: [...state.dailyLogs, log] };
      }),
      getTodayLog: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.dailyLogs.find(l => new Date(l.date).toDateString() === today) || null;
      },

      // AI Agent
      aiMessages: [],
      addAIMessage: (message) => set((state) => ({ 
        aiMessages: [...state.aiMessages, message] 
      })),
      clearAIMessages: () => set({ aiMessages: [] }),
      
      // AI Conversations (ChatGPT-like)
      aiConversations: [],
      currentConversationId: null,
      createConversation: (context = 'general') => {
        const id = generateId();
        const newConversation: AIConversationSession = {
          id,
          title: 'محادثة جديدة',
          messages: [],
          context,
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ 
          aiConversations: [newConversation, ...state.aiConversations],
          currentConversationId: id 
        }));
        return id;
      },
      setCurrentConversation: (id) => set({ currentConversationId: id }),
      addMessageToConversation: (conversationId, message) => set((state) => ({
        aiConversations: state.aiConversations.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                messages: [...c.messages, message],
                updatedAt: new Date(),
                title: c.messages.length === 0 ? message.content.slice(0, 30) + '...' : c.title
              } 
            : c
        ),
      })),
      updateConversationTitle: (id, title) => set((state) => ({
        aiConversations: state.aiConversations.map(c => 
          c.id === id ? { ...c, title, updatedAt: new Date() } : c
        ),
      })),
      deleteConversation: (id) => set((state) => ({
        aiConversations: state.aiConversations.filter(c => c.id !== id),
        currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
      })),
      pinConversation: (id, pinned) => set((state) => ({
        aiConversations: state.aiConversations.map(c => 
          c.id === id ? { ...c, isPinned: pinned, updatedAt: new Date() } : c
        ),
      })),
      
      // User Experiences
      userExperiences: [],
      addExperience: (experience) => set((state) => ({ 
        userExperiences: [...state.userExperiences, experience] 
      })),
      updateExperience: (id, experience) => set((state) => ({
        userExperiences: state.userExperiences.map(e => 
          e.id === id ? { ...e, ...experience, updatedAt: new Date() } : e
        ),
      })),
      deleteExperience: (id) => set((state) => ({
        userExperiences: state.userExperiences.filter(e => e.id !== id),
      })),
      
      // Daily Records
      dailyRecords: [],
      addDailyRecord: (record) => set((state) => ({ 
        dailyRecords: [...state.dailyRecords, record] 
      })),
      
      // Media Files
      mediaFiles: [],
      addMediaFile: (file) => set((state) => ({ 
        mediaFiles: [...state.mediaFiles, file] 
      })),
      deleteMediaFile: (id) => set((state) => ({
        mediaFiles: state.mediaFiles.filter(f => f.id !== id),
      })),
      
      // Media Folders
      mediaFolders: [],
      addMediaFolder: (folder) => set((state) => ({ 
        mediaFolders: [...state.mediaFolders, folder] 
      })),
      deleteMediaFolder: (id) => set((state) => ({
        mediaFolders: state.mediaFolders.filter(f => f.id !== id),
      })),
      
      // Archive Topics
      archiveTopics: [],
      addArchiveTopic: (topic) => set((state) => ({ 
        archiveTopics: [...state.archiveTopics, topic] 
      })),
      updateArchiveTopic: (id, topic) => set((state) => ({
        archiveTopics: state.archiveTopics.map(t => 
          t.id === id ? { ...t, ...topic, updatedAt: new Date() } : t
        ),
      })),
      deleteArchiveTopic: (id) => set((state) => ({
        archiveTopics: state.archiveTopics.filter(t => t.id !== id),
      })),
      
      // Project Archives
      projectArchives: [],
      addProjectArchive: (project) => set((state) => ({ 
        projectArchives: [...state.projectArchives, project] 
      })),
      updateProjectArchive: (id, project) => set((state) => ({
        projectArchives: state.projectArchives.map(p => 
          p.id === id ? { ...p, ...project, updatedAt: new Date() } : p
        ),
      })),
      deleteProjectArchive: (id) => set((state) => ({
        projectArchives: state.projectArchives.filter(p => p.id !== id),
      })),

      // Quote
      dailyQuote: null,
      setDailyQuote: (quote) => set({ dailyQuote: quote }),

      // Data Persistence
      exportData: () => {
        const state = get();
        const data = {
          version: '3.0',
          exportedAt: new Date().toISOString(),
          userProfile: state.userProfile,
          courses: state.courses,
          tawjihiSubjects: state.tawjihiSubjects,
          tawjihiGoal: state.tawjihiGoal,
          bmsComponents: state.bmsComponents,
          scholarshipRequirements: state.scholarshipRequirements,
          businessIdeas: state.businessIdeas,
          skills: state.skills,
          visionBoard: state.visionBoard,
          performance: state.performance,
          notes: state.notes,
        };
        return JSON.stringify(data, null, 2);
      },
      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.version) {
            set({
              courses: data.courses || [],
              tawjihiSubjects: data.tawjihiSubjects || defaultTawjihiSubjects,
              tawjihiGoal: data.tawjihiGoal || { id: '1', targetGrade: 400, currentGrade: 0, remainingPoints: 400, createdAt: new Date(), updatedAt: new Date() },
              bmsComponents: data.bmsComponents || [],
              scholarshipRequirements: data.scholarshipRequirements || [],
              businessIdeas: data.businessIdeas || [],
              skills: data.skills || [],
              visionBoard: data.visionBoard || [],
              performance: data.performance || defaultPerformance,
              notes: data.notes || [],
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
      clearAllData: () => set({
        courses: [],
        assignments: [],
        exams: [],
        grades: [],
        tawjihiSubjects: defaultTawjihiSubjects,
        bmsComponents: [],
        scholarshipRequirements: [],
        businessIdeas: [],
        skills: [],
        visionBoard: [],
        performance: defaultPerformance,
        notes: [],
        studySessions: [],
        xpHistory: [],
      }),
      
      // ============================================
      // ⚔️ EXECUTION ENGINE - محرك التنفيذ
      // ============================================
      
      dailyMissions: [],
      generateDailyMissions: () => {
        const state = get();
        const today = new Date();
        const missions: ExecutionTask[] = [];
        
        // 1. تحليل مواد التوجيهي - البحث عن المواد الضعيفة
        const weakSubjects = state.tawjihiSubjects.filter(s => (s.grade || 0) < 60 && (s.grade || 0) > 0);
        if (weakSubjects.length > 0) {
          const subject = weakSubjects[0];
          missions.push({
            id: generateId(),
            title: `مراجعة ${subject.name}`,
            description: `درجة ${subject.grade} تحتاج تحسين`,
            type: 'study',
            priority: 'high',
            source: 'auto_generated',
            relatedData: { subjectId: subject.id },
            xpReward: 50,
            completed: false,
            date: today,
            createdAt: new Date()
          });
        }
        
        // 2. فحص مكونات BMS المطلوبة
        const neededComponents = state.bmsComponents.filter(c => c.status === 'needed');
        if (neededComponents.length > 0) {
          missions.push({
            id: generateId(),
            title: `الحصول على: ${neededComponents[0].name}`,
            description: `${neededComponents.length} مكون مطلوب للمشروع`,
            type: 'project',
            priority: 'medium',
            source: 'auto_generated',
            relatedData: { componentId: neededComponents[0].id },
            xpReward: 30,
            completed: false,
            date: today,
            createdAt: new Date()
          });
        }
        
        // 3. فحص متطلبات المنحة
        const pendingRequirements = state.scholarshipRequirements.filter(r => r.status === 'pending');
        if (pendingRequirements.length > 0) {
          missions.push({
            id: generateId(),
            title: `إعداد: ${pendingRequirements[0].title}`,
            description: `${pendingRequirements.length} متطلبات معلقة`,
            type: 'scholarship',
            priority: 'high',
            source: 'auto_generated',
            relatedData: { requirementId: pendingRequirements[0].id },
            xpReward: 40,
            completed: false,
            date: today,
            createdAt: new Date()
          });
        }
        
        // 4. مهمة مهارية
        const lowSkills = state.skills.filter(s => s.progress < 50);
        if (lowSkills.length > 0) {
          missions.push({
            id: generateId(),
            title: `تطوير مهارة: ${lowSkills[0].name}`,
            description: `المستوى الحالي: ${lowSkills[0].progress}%`,
            type: 'skill',
            priority: 'low',
            source: 'auto_generated',
            relatedData: { skillId: lowSkills[0].id },
            xpReward: 25,
            completed: false,
            date: today,
            createdAt: new Date()
          });
        }
        
        // Hard Mode: فقط المهام الصعبة
        const finalMissions = state.hardMode?.enabled 
          ? missions.filter(m => m.priority === 'high' || m.priority === 'critical')
          : missions.slice(0, 3);
        
        set({ dailyMissions: finalMissions });
      },
      completeMission: (id) => set((state) => {
        const mission = state.dailyMissions.find(m => m.id === id);
        if (!mission) return state;
        
        const xpMultiplier = state.hardMode?.enabled ? state.hardMode.xpMultiplier : 1;
        const xpEarned = Math.round(mission.xpReward * xpMultiplier);
        
        return {
          dailyMissions: state.dailyMissions.map(m => 
            m.id === id ? { ...m, completed: true, completedAt: new Date() } : m
          ),
          performance: {
            ...state.performance,
            totalXP: state.performance.totalXP + xpEarned,
            level: calculateLevel(state.performance.totalXP + xpEarned),
          },
          xpHistory: [...state.xpHistory, { 
            action: `مهمة مكتملة: ${mission.title}`, 
            xp: xpEarned, 
            timestamp: new Date() 
          }],
          hardMode: state.hardMode?.enabled ? {
            ...state.hardMode,
            stats: {
              ...state.hardMode.stats,
              tasksCompleted: state.hardMode.stats.tasksCompleted + 1,
              xpEarned: state.hardMode.stats.xpEarned + xpEarned
            }
          } : state.hardMode
        };
      }),
      
      alerts: [],
      generateAlerts: () => {
        const state = get();
        const alerts: SmartAlert[] = [];
        
        // 1. تنبيه المواد الضعيفة
        const veryWeakSubjects = state.tawjihiSubjects.filter(s => (s.grade || 0) < 50 && (s.grade || 0) > 0);
        if (veryWeakSubjects.length > 0) {
          alerts.push({
            id: generateId(),
            type: 'critical',
            category: 'grade',
            title: 'تحذير: مواد ضعيفة',
            message: `${veryWeakSubjects.map(s => s.name).join('، ')}`,
            action: { label: 'مراجعة', view: 'tawjihi' },
            dismissed: false,
            timestamp: new Date()
          });
        }
        
        // 2. تنبيه المصروفات العالية
        const thisMonthExpenses = state.transactions
          .filter(t => {
            const tDate = new Date(t.date);
            const now = new Date();
            return t.type === 'expense' && 
              tDate.getMonth() === now.getMonth() && 
              tDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (thisMonthExpenses > 500) {
          alerts.push({
            id: generateId(),
            type: 'warning',
            category: 'finance',
            title: 'مصروفات مرتفعة',
            message: `صرفت ${thisMonthExpenses} شيكل هذا الشهر`,
            action: { label: 'التفاصيل', view: 'finance' },
            dismissed: false,
            timestamp: new Date()
          });
        }
        
        // 3. تنبيه التتابع
        if (state.streak.currentStreak === 0) {
          alerts.push({
            id: generateId(),
            type: 'info',
            category: 'streak',
            title: 'ابدأ تتابع جديد!',
            message: 'لم تسجل أي نشاط اليوم',
            dismissed: false,
            timestamp: new Date()
          });
        }
        
        // 4. تنبيه BMS
        const neededCount = state.bmsComponents.filter(c => c.status === 'needed').length;
        if (neededCount > 3) {
          alerts.push({
            id: generateId(),
            type: 'warning',
            category: 'project',
            title: 'مكونات BMS ناقصة',
            message: `${neededCount} مكون مطلوب للمشروع`,
            action: { label: 'المشروع', view: 'bms-project' },
            dismissed: false,
            timestamp: new Date()
          });
        }
        
        set({ alerts });
      },
      dismissAlert: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, dismissed: true } : a)
      })),
      
      hardMode: {
        enabled: false,
        xpMultiplier: 2,
        restrictions: {
          noEasyTasks: true,
          noPostponement: true,
          onlyDifficult: true
        },
        stats: {
          tasksCompleted: 0,
          xpEarned: 0,
          daysActive: 0
        }
      },
      toggleHardMode: () => set((state) => ({
        hardMode: {
          ...state.hardMode,
          enabled: !state.hardMode.enabled,
          activatedAt: !state.hardMode.enabled ? new Date() : state.hardMode.activatedAt
        }
      })),
      
      commandsQueue: [],
      executeCommand: (command) => {
        const state = get();
        
        switch (command.type) {
          case 'add_exam':
            // يمكن إضافة اختبار جديد
            state.addExam({
              id: generateId(),
              courseId: String(command.data.courseId || ''),
              title: String(command.data.title || 'اختبار جديد'),
              examDate: new Date(String(command.data.date || new Date())),
              createdAt: new Date(),
              updatedAt: new Date()
            });
            break;
            
          case 'add_task':
            state.addAssignment({
              id: generateId(),
              courseId: String(command.data.courseId || ''),
              title: String(command.data.title || 'مهمة جديدة'),
              dueDate: new Date(String(command.data.dueDate || new Date())),
              status: 'todo',
              priority: String(command.data.priority || 'medium') as Priority,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            break;
            
          case 'set_priority':
            if (command.data.taskId) {
              state.updateAssignment(String(command.data.taskId), {
                priority: String(command.data.priority || 'medium') as Priority
              });
            }
            break;
            
          case 'record_progress':
            state.addDailyRecord({
              id: generateId(),
              date: new Date(),
              type: 'progress',
              category: String(command.data.category || 'general'),
              title: String(command.data.title || 'تقدم'),
              value: Number(command.data.value || 0),
              unit: String(command.data.unit || ''),
              source: 'ai_recorded',
              createdAt: new Date()
            });
            break;
            
          case 'update_grade':
            if (command.data.subjectId) {
              state.updateTawjihiSubject(String(command.data.subjectId), {
                grade: Number(command.data.grade || 0)
              });
            }
            break;
        }
        
        set((state) => ({
          commandsQueue: [...state.commandsQueue, { ...command, executed: true, result: 'تم التنفيذ' }]
        }));
      },
      
      // ============================================
      // 🏥 HEALTH & FITNESS - الصحة واللياقة
      // ============================================
      
      healthRecords: [],
      addHealthRecord: (record) => set((state) => ({ 
        healthRecords: [...state.healthRecords, record] 
      })),
      updateHealthRecord: (id, record) => set((state) => ({
        healthRecords: state.healthRecords.map((r) => 
          r.id === id ? { ...r, ...record } : r
        ),
      })),
      getTodayHealthRecord: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.healthRecords.find(r => new Date(r.date).toDateString() === today) || null;
      },
      
      workoutSessions: [],
      addWorkoutSession: (session) => set((state) => ({ 
        workoutSessions: [...state.workoutSessions, session] 
      })),
      updateWorkoutSession: (id, session) => set((state) => ({
        workoutSessions: state.workoutSessions.map((s) => 
          s.id === id ? { ...s, ...session } : s
        ),
      })),
      deleteWorkoutSession: (id) => set((state) => ({
        workoutSessions: state.workoutSessions.filter((s) => s.id !== id),
      })),
      
      healthGoals: [],
      addHealthGoal: (goal) => set((state) => ({ 
        healthGoals: [...state.healthGoals, goal] 
      })),
      updateHealthGoal: (id, goal) => set((state) => ({
        healthGoals: state.healthGoals.map((g) => 
          g.id === id ? { ...g, ...goal, updatedAt: new Date() } : g
        ),
      })),
      deleteHealthGoal: (id) => set((state) => ({
        healthGoals: state.healthGoals.filter((g) => g.id !== id),
      })),

      // ============================================
      // 🔄 HABITS - العادات اليومية
      // ============================================
      
      habits: [],
      addHabit: (habit) => set((state) => ({ 
        habits: [...state.habits, habit] 
      })),
      updateHabit: (id, habit) => set((state) => ({
        habits: state.habits.map((h) => 
          h.id === id ? { ...h, ...habit, updatedAt: new Date() } : h
        ),
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),
      completeHabit: (id) => {
        const state = get();
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return;
        
        const today = new Date().toDateString();
        const alreadyCompleted = habit.completedDates.some(
          d => new Date(d).toDateString() === today
        );
        
        if (!alreadyCompleted) {
          const newStreak = habit.streak + 1;
          const newLongestStreak = Math.max(newStreak, habit.longestStreak);
          
          set((state) => ({
            habits: state.habits.map((h) => 
              h.id === id ? { 
                ...h, 
                streak: newStreak, 
                longestStreak: newLongestStreak,
                completedDates: [...h.completedDates, new Date()],
                updatedAt: new Date()
              } : h
            ),
          }));
        }
      },
      
      habitCompletions: [],
      addHabitCompletion: (completion) => set((state) => ({ 
        habitCompletions: [...state.habitCompletions, completion] 
      })),
      getTodayHabitCompletions: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.habitCompletions.filter(
          c => new Date(c.date).toDateString() === today
        );
      },

      // ============================================
      // 📚 LIBRARY - الكتب والموارد
      // ============================================
      
      books: [],
      addBook: (book) => set((state) => ({ 
        books: [...state.books, book] 
      })),
      updateBook: (id, book) => set((state) => ({
        books: state.books.map((b) => 
          b.id === id ? { ...b, ...book, updatedAt: new Date() } : b
        ),
      })),
      deleteBook: (id) => set((state) => ({
        books: state.books.filter((b) => b.id !== id),
      })),
      
      readingSessions: [],
      addReadingSession: (session) => set((state) => ({ 
        readingSessions: [...state.readingSessions, session] 
      })),
      
      readingGoals: [],
      setReadingGoal: (goal) => set((state) => ({ 
        readingGoals: [...state.readingGoals.filter(g => g.year !== goal.year), goal] 
      })),
      
      resourceLinks: [],
      addResourceLink: (link) => set((state) => ({ 
        resourceLinks: [...state.resourceLinks, link] 
      })),
      updateResourceLink: (id, link) => set((state) => ({
        resourceLinks: state.resourceLinks.map((l) => 
          l.id === id ? { ...l, ...link, updatedAt: new Date() } : l
        ),
      })),
      deleteResourceLink: (id) => set((state) => ({
        resourceLinks: state.resourceLinks.filter((l) => l.id !== id),
      })),

      // ============================================
      // 📅 CALENDAR - التقويم والأحداث
      // ============================================
      
      calendarEvents: [],
      addCalendarEvent: (event) => set((state) => ({ 
        calendarEvents: [...state.calendarEvents, event] 
      })),
      updateCalendarEvent: (id, event) => set((state) => ({
        calendarEvents: state.calendarEvents.map((e) => 
          e.id === id ? { ...e, ...event, updatedAt: new Date() } : e
        ),
      })),
      deleteCalendarEvent: (id) => set((state) => ({
        calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
      })),
      getUpcomingEvents: () => {
        const state = get();
        const now = new Date();
        return state.calendarEvents
          .filter(e => new Date(e.startDate) >= now && !e.completed)
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 5);
      },

      // ============================================
      // 📝 REVIEW - المراجعات والتأملات
      // ============================================
      
      dailyReviews: [],
      addDailyReview: (review) => set((state) => ({ 
        dailyReviews: [...state.dailyReviews, review] 
      })),
      updateDailyReview: (id, review) => set((state) => ({
        dailyReviews: state.dailyReviews.map((r) => 
          r.id === id ? { ...r, ...review, updatedAt: new Date() } : r
        ),
      })),
      getTodayReview: () => {
        const state = get();
        const today = new Date().toDateString();
        return state.dailyReviews.find(r => 
          new Date(r.date).toDateString() === today && r.type === 'daily'
        ) || null;
      },
      getWeeklyReviews: () => {
        const state = get();
        return state.dailyReviews.filter(r => r.type === 'weekly');
      },
      getMonthlyReviews: () => {
        const state = get();
        return state.dailyReviews.filter(r => r.type === 'monthly');
      },
      
      reflectionQuestions: [
        { id: '1', question: 'ما أهم إنجاز حققته اليوم؟', category: 'daily', order: 1, isActive: true },
        { id: '2', question: 'ما التحدي الأكبر الذي واجهته؟', category: 'daily', order: 2, isActive: true },
        { id: '3', question: 'كيف كان مزاجك اليوم؟', category: 'daily', order: 3, isActive: true },
        { id: '4', question: 'ما الذي يمكنك تحسينه غداً؟', category: 'daily', order: 4, isActive: true },
        { id: '5', question: 'ما أهم 3 إنجازات هذا الأسبوع؟', category: 'weekly', order: 1, isActive: true },
        { id: '6', question: 'ما الدروس المستفادة؟', category: 'weekly', order: 2, isActive: true },
        { id: '7', question: 'ما أهداف الأسبوع القادم؟', category: 'weekly', order: 3, isActive: true },
        { id: '8', question: 'ما أهم إنجازات هذا الشهر؟', category: 'monthly', order: 1, isActive: true },
        { id: '9', question: 'كيف أقوم بتقييم تقدمي نحو أهدافي؟', category: 'monthly', order: 2, isActive: true },
      ],
      addReflectionQuestion: (question) => set((state) => ({ 
        reflectionQuestions: [...state.reflectionQuestions, question] 
      })),
      updateReflectionQuestion: (id, question) => set((state) => ({
        reflectionQuestions: state.reflectionQuestions.map((q) => 
          q.id === id ? { ...q, ...question } : q
        ),
      })),
      deleteReflectionQuestion: (id) => set((state) => ({
        reflectionQuestions: state.reflectionQuestions.filter((q) => q.id !== id),
      })),
    }),
    {
      name: 'lifeos-v3-storage',
      partialize: (state) => ({
        courses: state.courses,
        assignments: state.assignments,
        exams: state.exams,
        grades: state.grades,
        settings: state.settings,
        studySessions: state.studySessions,
        performance: state.performance,
        xpHistory: state.xpHistory,
        tawjihiSubjects: state.tawjihiSubjects,
        tawjihiGoal: state.tawjihiGoal,
        studySchedule: state.studySchedule,
        examCountdowns: state.examCountdowns,
        bmsComponents: state.bmsComponents,
        bmsChallenges: state.bmsChallenges,
        bmsProgress: state.bmsProgress,
        codeSnippets: state.codeSnippets,
        scholarshipRequirements: state.scholarshipRequirements,
        applicationDocuments: state.applicationDocuments,
        applicationTimeline: state.applicationTimeline,
        chinaPreparations: state.chinaPreparations,
        businessIdeas: state.businessIdeas,
        projectPortfolio: state.projectPortfolio,
        skills: state.skills,
        learningResources: state.learningResources,
        visionBoard: state.visionBoard,
        yearlyGoals: state.yearlyGoals,
        weeklyTasks: state.weeklyTasks,
        notes: state.notes,
        folders: state.folders,
        moodEntries: state.moodEntries,
        transactions: state.transactions,
        quickNotes: state.quickNotes,
        streak: state.streak,
        dailyLogs: state.dailyLogs,
        aiMessages: state.aiMessages,
        aiConversations: state.aiConversations,
        userExperiences: state.userExperiences,
        dailyRecords: state.dailyRecords,
        dailyMissions: state.dailyMissions,
        alerts: state.alerts,
        hardMode: state.hardMode,
        commandsQueue: state.commandsQueue,
        // 🏥 Health & Fitness
        healthRecords: state.healthRecords,
        workoutSessions: state.workoutSessions,
        healthGoals: state.healthGoals,
        // 🔄 Habits
        habits: state.habits,
        habitCompletions: state.habitCompletions,
        // 📚 Library
        books: state.books,
        readingSessions: state.readingSessions,
        readingGoals: state.readingGoals,
        resourceLinks: state.resourceLinks,
        // 📅 Calendar
        calendarEvents: state.calendarEvents,
        // 📝 Review
        dailyReviews: state.dailyReviews,
        reflectionQuestions: state.reflectionQuestions,
      }),
    }
  )
);
