import type { Language } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tagline: string;
  navTasks: string;
  navProjects: string;
  navTimer: string;
  navStats: string;
  navArchive: string;

  // Auto clear
  autoClearBadge: string;
  autoClearCycle: string;
  autoClearTooltip: string;
  autoClearNowBtn: string;
  autoClearSuccess: string;
  noCompletedToArchive: string;

  // Tasks
  taskInputPlaceholder: string;
  taskAddBtn: string;
  filterAll: string;
  filterActive: string;
  filterCompleted: string;
  priorityLabel: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  energyQuick: string;
  energyDeep: string;
  energyRoutine: string;
  noTasksTitle: string;
  noTasksDesc: string;
  taskDeleted: string;
  taskCompleted: string;
  projectTagNone: string;
  searchPlaceholder: string;
  soundCueNotice: string;
  dueDate: string;

  // Projects
  newProjectBtn: string;
  projectTitle: string;
  projectDesc: string;
  projectColor: string;
  createProjectModalTitle: string;
  editProjectModalTitle: string;
  saveProject: string;
  cancel: string;
  microTasksTitle: string;
  addMicroTaskPlaceholder: string;
  completedMicroTasks: string;
  noProjectsTitle: string;
  noProjectsDesc: string;
  targetDate: string;
  deleteProjectConfirm: string;

  // Timer
  timerWork: string;
  timerShortBreak: string;
  timerLongBreak: string;
  timerStart: string;
  timerPause: string;
  timerReset: string;
  timerZenMode: string;
  timerExitZen: string;
  ambientSoundTitle: string;
  ambientNone: string;
  ambientBrown: string;
  ambientRain: string;
  ambientBinaural: string;
  ambientVolume: string;
  timerSessionCompleted: string;
  timerMinutes: string;
  timerSeconds: string;
  focusQuote: string;

  // Stats & Gamification
  mindPowerTitle: string;
  levelLabel: string;
  xpLabel: string;
  nextLevelLabel: string;
  streakMatrixTitle: string;
  streakMatrixSubtitle: string;
  currentStreakDays: string;
  longestStreakDays: string;
  totalTasksTitle: string;
  totalFocusTitle: string;
  weeklyChartTitle: string;
  completionTrendTitle: string;
  badgesTitle: string;
  archivedTasksTitle: string;
  archivedCycleLabel: string;
  emptyArchiveTitle: string;
  emptyArchiveDesc: string;
  restoreTask: string;
  deleteArchived: string;

  // Levels
  levelNames: string[];
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'دِماغ مبرمِج | عقلي',
    appSubtitle: 'نظام الإنتاجية والتركيز الفائق للمفكرين والمبرمجين',
    tagline: 'تغلّب على المماطلة، ادخل حالة التدفق الذهني، واصنع إنجازاتك اليومية.',
    navTasks: 'إدارة المهام',
    navProjects: 'المشاريع',
    navTimer: 'مؤقت التركيز',
    navStats: 'التطور والأوسمة',
    navArchive: 'الأرشيف (12 ساعة)',

    // Auto clear
    autoClearBadge: 'المسح التلقائي القادم',
    autoClearCycle: 'دورة كل 12 ساعة (12:00 ص / 12:00 م)',
    autoClearTooltip: 'المهام المنجزة تُمسح وتُؤرشف تلقائيًا كل 12 ساعة لبدء صفحة ذهنية جديدة تمامًا، مع حفظ كافة الإنجازات في الإحصائيات.',
    autoClearNowBtn: 'أرشفة المنجز الآن',
    autoClearSuccess: 'تمت أرشفة المهام المكتملة وتحديث سجل الإنجازات بنجاح!',
    noCompletedToArchive: 'لا توجد مهام منجزة للأرشفة حاليًا.',

    // Tasks
    taskInputPlaceholder: 'ما المهمة التالية؟ (اكتب واضغط Enter للإضافة السريعة...)',
    taskAddBtn: 'إضافة',
    filterAll: 'كافة المهام',
    filterActive: 'قيد التنفيذ',
    filterCompleted: 'المكتملة (جاهزة للأرشفة)',
    priorityLabel: 'الأولوية',
    priorityHigh: 'عاجل وهام 🔥',
    priorityMedium: 'متوسط ⚡',
    priorityLow: 'عادي 🌿',
    energyQuick: 'سريع (15د) ⚡',
    energyDeep: 'تركيز عميق 🧠',
    energyRoutine: 'روتيني 📋',
    noTasksTitle: 'ذهنك صافٍ تمامًا!',
    noTasksDesc: 'أضف مهامك لليوم واستمتع بصوت الإنجاز الفوري عند إنهائها.',
    taskDeleted: 'تم حذف المهمة',
    taskCompleted: 'إنجاز رائع! +15 نقطة خبرة XP',
    projectTagNone: 'بدون مشروع',
    searchPlaceholder: 'ابحث في المهام...',
    soundCueNotice: 'نغمة إنجاز فورية مدمجة عبر Web Audio',
    dueDate: 'تاريخ الاستحقاق',

    // Projects
    newProjectBtn: 'مشروع جديد +',
    projectTitle: 'عنوان المشروع',
    projectDesc: 'وصف مختصر أو هدف رئيسي',
    projectColor: 'لون التوهج',
    createProjectModalTitle: 'إنشاء مشروع أسبوعي جديد',
    editProjectModalTitle: 'تعديل المشروع',
    saveProject: 'حفظ المشروع',
    cancel: 'إلغاء',
    microTasksTitle: 'المهام المصغرة المرتبطة (تتزامن مع قائمة المهام)',
    addMicroTaskPlaceholder: 'أضف مهمة مصغرة للمشروع...',
    completedMicroTasks: 'المهام المنجزة',
    noProjectsTitle: 'لا توجد مشاريع قائمة',
    noProjectsDesc: 'قسّم أهدافك الأسبوعية الكبيرة إلى مشاريع مركزة ومهام مصغرة قابلة للإنجاز.',
    targetDate: 'الموعد المستهدف',
    deleteProjectConfirm: 'هل أنت متأكد من رغبتك في حذف هذا المشروع؟ لن تُحذف المهام المرتبطة.',

    // Timer
    timerWork: 'جلسة تركيز 🧠',
    timerShortBreak: 'استراحة قصيرة ☕',
    timerLongBreak: 'استراحة طويلة 🧘',
    timerStart: 'ابدأ الجلسة',
    timerPause: 'إيقاف مؤقت',
    timerReset: 'إعادة ضبط',
    timerZenMode: 'شاشة الزِن الكاملة',
    timerExitZen: 'إنهاء وضع الزِن (ESC)',
    ambientSoundTitle: 'مؤثرات صوتية محيطية للتركيز (بدون إنترنت)',
    ambientNone: 'صامت',
    ambientBrown: 'الضجيج البني العميق (Brown Noise)',
    ambientRain: 'هدير المطر الهادئ (Rain)',
    ambientBinaural: 'موجات ألفا الثنائية 432Hz (Binaural Alpha)',
    ambientVolume: 'مستوى الصوت المحيطي',
    timerSessionCompleted: 'رائع! أكملت جلسة التركيز بنجاح (+50 XP)',
    timerMinutes: 'دقيقة',
    timerSeconds: 'ثانية',
    focusQuote: '«التركيز العميق ليس مجرد عمل، بل هو حالة تدفق تجعل المستحيل واقعًا ملموسًا.»',

    // Stats & Gamification
    mindPowerTitle: 'قوة العقل ومستوى التركيز',
    levelLabel: 'المستوى',
    xpLabel: 'نقاط الخبرة',
    nextLevelLabel: 'للمستوى القادم',
    streakMatrixTitle: 'مصفوفة الاستمرارية (لا تقطع السلسلة)',
    streakMatrixSubtitle: 'تتبع نشاطك وإنجازاتك اليومية عبر الـ 30 يومًا الماضية',
    currentStreakDays: 'أيام متتالية حاليًا 🔥',
    longestStreakDays: 'أطول سلسلة إنجاز ⚡',
    totalTasksTitle: 'إجمالي المهام المنجزة',
    totalFocusTitle: 'إجمالي دقائق التركيز',
    weeklyChartTitle: 'معدل ساعات التركيز الأسبوعي',
    completionTrendTitle: 'منحنى إنجاز المهام اليومية',
    badgesTitle: 'سجل الأوسمة والإنجازات',
    archivedTasksTitle: 'سجل المهام المؤرشفة (دورات الـ 12 ساعة السابقة)',
    archivedCycleLabel: 'دورة الأرشفة',
    emptyArchiveTitle: 'سجل الأرشيف فارغ',
    emptyArchiveDesc: 'تظهر هنا المهام التي تم مسحها تلقائيًا عند انتصاف الليل (12 ص) أو انتصاف النهار (12 م).',
    restoreTask: 'استعادة للقائمة النشطة',
    deleteArchived: 'حذف من الأرشيف',

    // Levels
    levelNames: [
      'مبتدئ التركيز (Novice Thinker)',
      'محارب التشتت (Focus Fighter)',
      'سيد الانضباط (Discipline Monk)',
      'مهندس التدفق الذهني (Flow Architect)',
      'العقل الخارق (Supermind Grandmaster)'
    ]
  },
  en: {
    appName: 'My Mind | دِماغ مبرمِج',
    appSubtitle: 'Hyper-Focus Productivity System for Developers & Thinkers',
    tagline: 'Eliminate procrastination, master deep flow, and gamify daily progress.',
    navTasks: 'Task Management',
    navProjects: 'Projects',
    navTimer: 'Pomodoro Timer',
    navStats: 'Stats & Badges',
    navArchive: 'Archive (12h)',

    // Auto clear
    autoClearBadge: 'Next Auto-Clear',
    autoClearCycle: '12-Hour Cycle (12:00 AM / 12:00 PM)',
    autoClearTooltip: 'Completed tasks auto-archive every 12 hours (at midnight and noon) to give you a pristine slate, while permanently recording progress in Stats.',
    autoClearNowBtn: 'Archive Completed Now',
    autoClearSuccess: 'Completed tasks archived & stats updated successfully!',
    noCompletedToArchive: 'No completed tasks ready to archive right now.',

    // Tasks
    taskInputPlaceholder: 'What is next? (Type & press Enter to add instantly...)',
    taskAddBtn: 'Add Task',
    filterAll: 'All Tasks',
    filterActive: 'Active',
    filterCompleted: 'Completed (Ready for 12h Archive)',
    priorityLabel: 'Priority',
    priorityHigh: 'Urgent 🔥',
    priorityMedium: 'Medium ⚡',
    priorityLow: 'Low 🌿',
    energyQuick: 'Quick (15m) ⚡',
    energyDeep: 'Deep Work 🧠',
    energyRoutine: 'Routine 📋',
    noTasksTitle: 'Your Mind is Clear!',
    noTasksDesc: 'Add your high-impact tasks and enjoy the crisp chime upon completion.',
    taskDeleted: 'Task deleted',
    taskCompleted: 'Boom! Completed! +15 XP',
    projectTagNone: 'No Project',
    searchPlaceholder: 'Search tasks...',
    soundCueNotice: 'Synthesized Web Audio completion chime active',
    dueDate: 'Due Date',

    // Projects
    newProjectBtn: 'New Project +',
    projectTitle: 'Project Title',
    projectDesc: 'Short description or key milestone',
    projectColor: 'Neon Glow Color',
    createProjectModalTitle: 'Create New Focused Project',
    editProjectModalTitle: 'Edit Project',
    saveProject: 'Save Project',
    cancel: 'Cancel',
    microTasksTitle: 'Linked Micro-tasks (Syncs with Task Board)',
    addMicroTaskPlaceholder: 'Add micro-task to this project...',
    completedMicroTasks: 'Completed Tasks',
    noProjectsTitle: 'No Projects Created',
    noProjectsDesc: 'Break your larger weekly objectives into focused projects and actionable micro-tasks.',
    targetDate: 'Target Date',
    deleteProjectConfirm: 'Are you sure you want to delete this project? Associated tasks will remain.',

    // Timer
    timerWork: 'Deep Focus 🧠',
    timerShortBreak: 'Short Break ☕',
    timerLongBreak: 'Long Break 🧘',
    timerStart: 'Start Focus',
    timerPause: 'Pause',
    timerReset: 'Reset',
    timerZenMode: 'Zen Fullscreen',
    timerExitZen: 'Exit Zen Mode (ESC)',
    ambientSoundTitle: 'Synthesized Ambient Audio (Zero Network Needed)',
    ambientNone: 'Mute',
    ambientBrown: 'Deep Brown Noise',
    ambientRain: 'Window Rainfall',
    ambientBinaural: '432Hz Alpha Waves (Binaural)',
    ambientVolume: 'Ambient Volume',
    timerSessionCompleted: 'Glorious! Focus session finished (+50 XP)',
    timerMinutes: 'min',
    timerSeconds: 'sec',
    focusQuote: '"Deep focus is not just hard work; it is the sacred state of flow where the impossible becomes effortless."',

    // Stats & Gamification
    mindPowerTitle: 'Mind Power & Focus Mastery',
    levelLabel: 'Level',
    xpLabel: 'XP Points',
    nextLevelLabel: 'Next Level in',
    streakMatrixTitle: 'Activity Streak (Never Break The Chain)',
    streakMatrixSubtitle: 'Track your daily consistency and momentum over the past 30 days',
    currentStreakDays: 'Current Streak Days 🔥',
    longestStreakDays: 'Longest Record ⚡',
    totalTasksTitle: 'Total Completed Tasks',
    totalFocusTitle: 'Total Focus Minutes',
    weeklyChartTitle: 'Weekly Focus Hours Rhythm',
    completionTrendTitle: 'Daily Task Completion Curve',
    badgesTitle: 'Badges & Milestone Achievements',
    archivedTasksTitle: 'Archived Tasks Log (12-Hour Clean Slate Cycles)',
    archivedCycleLabel: 'Archival Cycle',
    emptyArchiveTitle: 'Archive is Empty',
    emptyArchiveDesc: 'Tasks cleared at midnight (12:00 AM) or noon (12:00 PM) will appear here.',
    restoreTask: 'Restore to Active',
    deleteArchived: 'Delete from Archive',

    // Levels
    levelNames: [
      'Novice Thinker',
      'Focus Fighter',
      'Discipline Monk',
      'Flow Architect',
      'Supermind Grandmaster'
    ]
  }
};
