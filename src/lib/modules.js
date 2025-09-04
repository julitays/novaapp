// src/lib/modules.js
// Большие моки данных + базовые утилиты. Без UI.

// ────────────────────────────────────────────────────────────────────────────
// Компетенции (единый справочник)
export const ALL_COMPETENCIES = [
  "Стратегическое мышление",
  "Переговоры",
  "Аналитика",
  "Коммуникация",
  "Лидерство",
  "Финансовое мышление",
  "Тайм-менеджмент",
  "Проектное управление",
];

// --- вакансии (моки) ---
export const initialVacancies = [
  {
    id: "vac-001",
    role: "KAM",
    department: "Продажи",
    unit: "FMCG",
    manager: "Сергей Брагин",
    headcount: 1,
    location: "СПб",
    status: "open",
  },
  {
    id: "vac-002",
    role: "RM",
    department: "Продажи",
    unit: "Северо-Запад",
    manager: "Иван Иванов",
    headcount: 2,
    location: "СПб/удаленно",
    status: "open",
  },
  {
    id: "vac-003",
    role: "Category Manager (FMCG)",
    department: "Маркетинг",
    unit: "Категорийный менеджмент",
    manager: "Директор по маркетингу",
    headcount: 1,
    location: "Мск",
    status: "draft",
  },
];



// ────────────────────────────────────────────────────────────────────────────
// Эталоны ролей (краткие модели для сопоставления на радарах)
export const initialRoles = [
  {
    id: 1,
    name: "RM",
    version: "v1.0",
    kpi: "Рост продаж 10%",
    created: "2025-08-01",
    competencies: {
      "Стратегическое мышление": 3,
      "Переговоры": 3,
      "Коммуникация": 4,
      "Тайм-менеджмент": 4,
      "Аналитика": 2,
    },
  },
  {
    id: 2,
    name: "KAM",
    version: "v1.0",
    kpi: "Рост продаж 15%",
    created: "2025-08-02",
    competencies: {
      "Стратегическое мышление": 4,
      "Аналитика": 3,
      "Переговоры": 4,
      "Коммуникация": 4,
      "Проектное управление": 3,
    },
  },
  {
    id: 3,
    name: "GKAM (Electronics)",
    version: "v1.0",
    kpi: "Доля полки +20%, NPS ключевых сетей +10",
    created: "2025-08-10",
    competencies: {
      "Стратегическое мышление": 4,
      "Аналитика": 4,
      "Переговоры": 4,
      "Лидерство": 4,
      "Финансовое мышление": 3,
    },
  },
  {
    id: 4,
    name: "Руководитель отдела обучения",
    version: "v1.0",
    kpi: "Time-to-Productivity −20%, охват обучением 90%",
    created: "2025-08-12",
    competencies: {
      "Лидерство": 4,
      "Коммуникация": 4,
      "Проектное управление": 4,
      "Стратегическое мышление": 3,
      "Аналитика": 3,
    },
  },
  {
    id: 5,
    name: "TM",
    version: "v1.0",
    kpi: "Выполнение планов тренингов 95%",
    created: "2025-08-12",
    competencies: {
      "Коммуникация": 4,
      "Проектное управление": 3,
      "Тайм-менеджмент": 4,
      "Аналитика": 2,
    },
  },
  {
    id: 6,
    name: "HRBP",
    version: "v1.0",
    kpi: "Заполнение позиций SLA, eNPS +10",
    created: "2025-08-15",
    competencies: {
      "Коммуникация": 4,
      "Стратегическое мышление": 3,
      "Лидерство": 3,
      "Проектное управление": 3,
      "Аналитика": 3,
    },
  },
  {
    id: 7,
    name: "Category Manager",
    version: "v1.0",
    kpi: "GM% +2п.п., оборачиваемость +10%",
    created: "2025-08-16",
    competencies: {
      "Аналитика": 4,
      "Переговоры": 3,
      "Стратегическое мышление": 3,
      "Финансовое мышление": 4,
      "Проектное управление": 3,
    },
  },
  {
    id: 8,
    name: "Директор по маркетингу",
    version: "v1.0",
    kpi: "ROMI > 1.5, Brand Lift +X",
    created: "2025-08-17",
    competencies: {
      "Стратегическое мышление": 4,
      "Лидерство": 4,
      "Аналитика": 4,
      "Коммуникация": 4,
      "Проектное управление": 3,
    },
  },
  {
    id: 9,
    name: "CFO",
    version: "v1.0",
    kpi: "Точность прогноза 98%, маржа +",
    created: "2025-08-18",
    competencies: {
      "Финансовое мышление": 4,
      "Стратегическое мышление": 4,
      "Лидерство": 3,
      "Коммуникация": 3,
      "Аналитика": 4,
    },
  },
  {
    id: 10,
    name: "Директор по цифровой трансформации",
    version: "v1.0",
    kpi: "Автоматизация процессов 30%, Снижение TTM",
    created: "2025-08-19",
    competencies: {
      "Стратегическое мышление": 4,
      "Проектное управление": 4,
      "Аналитика": 4,
      "Лидерство": 4,
      "Коммуникация": 3,
    },
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Полные карточки эталонов для «RoleDetailsView» (можно редактировать/экспортить)
export const roleStandards = [
  {
    id: "std_kam_v1",
    status: "active",
    division: "Sales / FMCG",
    name: "KAM",
    version: "v1.0",
    goal: "Увеличение sell-out, доли полки и внедрение JBP с ТОП-сетями.",
    responsibilities: [
      "Стратегия и планирование по ключевым сетям",
      "Переговоры, листинг, промо, SLA",
      "Кросс-функциональная синхронизация (финансы, логистика, маркетинг)",
    ],
    kpi: {
      current: [
        { name: "Sell-out рост", target: "+10% QoQ", period: "квартал" },
        { name: "Доля полки в ТОП-сетях", target: "≥95%", period: "месяц" },
      ],
      recommended: [
        { name: "Маржинальность категории", target: "≥Х%", period: "квартал" },
        { name: "NPS сети", target: "+10", period: "полугодие" },
      ],
    },
    competencyMap: initialRoles.find(r => r.name==="KAM").competencies,
    assessmentGuidelines: {
      scales: "Шкала 1–4, поведенческие индикаторы на каждый уровень.",
      behavioralAnchors: {
        "Переговоры": [
          "Управляет повесткой, фиксирует договорённости письменно",
          "Использует BATNA, готовит позицию обеих сторон",
        ],
        "Аналитика": [
          "Принимает решения из цифр, управляет воронкой/полкой, читает тренды",
        ],
      },
      evidenceExamples: ["JBP с X5", "Снижение OOS на 25%"],
    },
    testAssignment: {
      objective: "Собрать JBP на 6 месяцев для сети Y",
      timeboxHours: 8,
      deliverables: ["Презентация 10 слайдов", "Мини-модель P&L"],
      evaluationCriteria: ["Логика гипотез", "Финансовая обоснованность", "План рисков"],
    },
    assessmentCenter: {
      cases: [
        {
          title: "Эскалация с категорией",
          durationMin: 30,
          observersRoles: ["HRBP", "Sales Director"],
          competenciesObserved: ["Коммуникация", "Переговоры", "Лидерство"],
        },
      ],
      rubrics: "Матрица Компетенции × Поведенческие индикаторы",
    },
    tags: ["Sales", "Key Accounts"],
    createdAt: "2025-08-10",
    updatedAt: "2025-08-19",
  },
  {
    id: "std_gkam_el_v1",
    status: "active",
    division: "Sales / Electronics",
    name: "GKAM (Electronics)",
    version: "v1.0",
    goal: "Ведение федеральных ключей электроники, масштабирование полки и доли в канале.",
    responsibilities: [
      "Стратегическое планирование по ключевым сетям электроники",
      "Переговоры на уровне категорийных директоров",
      "Кросс-категорийная координация, запуск инноваций",
    ],
    kpi: {
      current: [
        { name: "Доля полки", target: "+20%", period: "квартал" },
        { name: "NPS ключевых сетей", target: "+10", period: "полугодие" },
      ],
      recommended: [
        { name: "ROMI промо", target: "≥1.4", period: "квартал" },
      ],
    },
    competencyMap: initialRoles.find(r => r.name==="GKAM (Electronics)").competencies,
    assessmentGuidelines: {
      scales: "Шкала 1–4",
      behavioralAnchors: { "Лидерство": ["Ведёт переговоры на С-уровне", "Создаёт коалиции под решения"] },
      evidenceExamples: ["Эксклюзив по ТОП SKU", "Внедрение DSA в сети Z"],
    },
    testAssignment: {
      objective: "Стратегия полки на 12 мес. для сети Z",
      timeboxHours: 10,
      deliverables: ["Roadmap и KPI", "Финансовая модель промо"],
      evaluationCriteria: ["Глубина анализа", "Реалистичность", "Риски/планы"],
    },
    assessmentCenter: { cases: [], rubrics: "Поведенческие индикаторы" },
    createdAt: "2025-08-10",
    updatedAt: "2025-08-19",
  },
  {
    id: "std_lnd_head_v1",
    status: "active",
    division: "L&D",
    name: "Руководитель отдела обучения",
    version: "v1.0",
    goal: "Сокращение time-to-productivity и устойчивый рост навыков полевых команд.",
    responsibilities: [
      "Стратегия обучения и академии",
      "Запуск программ, метрики эффективности",
      "Управление командой тренеров",
    ],
    kpi: {
      current: [
        { name: "Охват обучением", target: "≥90%", period: "квартал" },
        { name: "Time-to-Productivity", target: "−20%", period: "квартал" },
      ],
      recommended: [{ name: "Качество (CSAT обучения)", target: "≥4.6/5", period: "квартал" }],
    },
    competencyMap: initialRoles.find(r => r.name==="Руководитель отдела обучения").competencies,
    assessmentGuidelines: { scales: "1–4", behavioralAnchors: {}, evidenceExamples: [] },
    testAssignment: { objective: "Запуск Академии KAM", timeboxHours: 12, deliverables: [], evaluationCriteria: [] },
    assessmentCenter: { cases: [], rubrics: "" },
    createdAt: "2025-08-12",
    updatedAt: "2025-08-19",
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Сотрудники (богатая выборка). Иерархия: CEO → CEO-1 → CEO-2 → CEO-3…
// managerId задан, где уместно. orgTag помогает строить дерево, даже если managerId нет.

function comp(a=0,b=0,c=0,d=0,e=0,f=0,g=0,h=0) {
  return {
    "Стратегическое мышление": a,
    "Переговоры": b,
    "Аналитика": c,
    "Коммуникация": d,
    "Лидерство": e,
    "Финансовое мышление": f,
    "Тайм-менеджмент": g,
    "Проектное управление": h,
  };
}

export const initialEmployees = [
  // Корень
  { id: 1, name: "Наталья Смирнова", title: "CEO", department: "HQ", region: "Москва",
    orgTag: "CEO", competencies: comp(4,4,4,4,4,4,4,4),
    readiness: { percent: 100 }, assessments: [{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },

  // CEO-1 слой (директора функций)
  { id: 2, name: "Алексей Гордеев", title: "Sales Director", department: "Продажи", region: "Москва",
    managerId: 1, orgTag: "CEO-1", competencies: comp(4,4,4,4,4,3,4,4),
    readiness: { percent: 100 }, assessments:[{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },
  { id: 3, name: "Ирина Крылова", title: "HR Director", department: "HR", region: "Москва",
    managerId: 1, orgTag: "CEO-1", competencies: comp(4,3,3,4,4,3,4,3),
    readiness: { percent: 100 }, assessments:[{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },
  { id: 4, name: "Михаил Данилов", title: "Директор по маркетингу", department: "Marketing", region: "Москва",
    managerId: 1, orgTag: "CEO-1", competencies: comp(4,3,4,4,4,3,3,3),
    readiness: { percent: 100 }, assessments:[{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },
  { id: 5, name: "Оксана Савельева", title: "CFO", department: "Finance", region: "Москва",
    managerId: 1, orgTag: "CEO-1", competencies: comp(4,3,4,3,3,4,3,3),
    readiness: { percent: 100 }, assessments:[{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },
  { id: 6, name: "Георгий Лебедев", title: "Директор по цифровой трансформации", department: "DT", region: "Москва",
    managerId: 1, orgTag: "CEO-1", competencies: comp(4,3,4,3,4,3,3,4),
    readiness: { percent: 100 }, assessments:[{date:"2025-06",percent:100},{date:"2025-07",percent:100}]
  },

  // Sales цепочка
  // CEO-2
  { id: 103, name: "Дмитрий Кузнецов", title: "KAM", department: "Продажи", region: "Москва",
    managerId: 2, orgTag: "CEO-2", competencies: comp(4,3,4,4,3,3,3,3),
    readiness: { targetRole: "GKAM (Electronics)", percent: 88 },
    assessments: [{date:"2025-05",percent:78},{date:"2025-06",percent:84},{date:"2025-07",percent:88}]
  },
  { id: 104, name: "Сергей Брагин", title: "KAM", department: "Продажи", region: "Москва",
    managerId: 2, orgTag: "CEO-2", competencies: comp(3,4,3,4,3,2,3,3),
    readiness: { targetRole: "GKAM (Electronics)", percent: 76 },
    assessments: [{date:"2025-05",percent:70},{date:"2025-06",percent:73},{date:"2025-07",percent:76}]
  },
  { id: 150, name: "Екатерина Алексеева", title: "Category Manager", department: "Продажи", region: "СПБ",
    managerId: 2, orgTag: "CEO-2", competencies: comp(3,3,4,3,2,4,3,3),
    readiness: { targetRole: "KAM", percent: 69 },
    assessments: [{date:"2025-05",percent:62},{date:"2025-06",percent:66},{date:"2025-07",percent:69}]
  },

  // CEO-3 (RM)
  { id: 101, name: "Иван Иванов", title: "RM", department: "Продажи", region: "Центр",
    managerId: 103, orgTag: "CEO-3", competencies: comp(3,3,2,4,2,2,4,2),
    readiness: { targetRole: "KAM", percent: 72 },
    assessments: [{date:"2025-05",percent:60},{date:"2025-06",percent:68},{date:"2025-07",percent:72}]
  },
  { id: 102, name: "Анна Петрова", title: "RM", department: "Продажи", region: "СЗФО",
    managerId: 103, orgTag: "CEO-3", competencies: comp(2,3,2,3,2,2,4,2),
    readiness: { targetRole: "KAM", percent: 65 },
    assessments: [{date:"2025-05",percent:55},{date:"2025-06",percent:61},{date:"2025-07",percent:65}]
  },
  { id: 105, name: "Маргарита Орлова", title: "RM", department: "Продажи", region: "Юг",
    managerId: 104, orgTag: "CEO-3", competencies: comp(3,3,3,4,2,2,4,3),
    readiness: { targetRole: "KAM", percent: 74 },
    assessments: [{date:"2025-05",percent:66},{date:"2025-06",percent:70},{date:"2025-07",percent:74}]
  },
  { id: 106, name: "Виктор Логинов", title: "RM", department: "Продажи", region: "Поволжье",
    managerId: 104, orgTag: "CEO-3", competencies: comp(3,2,3,3,2,2,4,3),
    readiness: { targetRole: "KAM", percent: 63 },
    assessments: [{date:"2025-05",percent:55},{date:"2025-06",percent:59},{date:"2025-07",percent:63}]
  },

  // L&D цепочка
  { id: 200, name: "Юлия Буянова", title: "Руководитель отдела обучения", department: "L&D", region: "Москва",
    managerId: 3, orgTag: "CEO-2", competencies: comp(3,2,3,4,4,2,4,4),
    readiness: { percent: 92, targetRole: "HRBP" },
    assessments: [{date:"2025-05",percent:88},{date:"2025-06",percent:90},{date:"2025-07",percent:92}]
  },
  { id: 201, name: "Мария Волконская", title: "TM", department: "L&D", region: "Москва",
    managerId: 200, orgTag: "CEO-3", competencies: comp(2,2,2,4,2,1,4,3),
    readiness: { targetRole: "Руководитель отдела обучения", percent: 78 },
    assessments: [{date:"2025-05",percent:72},{date:"2025-06",percent:75},{date:"2025-07",percent:78}]
  },
  { id: 202, name: "Алексей Фадеев", title: "TM", department: "L&D", region: "СПБ",
    managerId: 200, orgTag: "CEO-3", competencies: comp(2,2,3,4,2,1,4,3),
    readiness: { targetRole: "Руководитель отдела обучения", percent: 73 },
    assessments: [{date:"2025-05",percent:66},{date:"2025-06",percent:70},{date:"2025-07",percent:73}]
  },

  // HRBP ветка
  { id: 220, name: "Светлана Юрьева", title: "HRBP", department: "HR", region: "Москва",
    managerId: 3, orgTag: "CEO-2", competencies: comp(3,2,3,4,3,2,4,3),
    readiness: { targetRole: "HR Director", percent: 81 },
    assessments: [{date:"2025-05",percent:76},{date:"2025-06",percent:79},{date:"2025-07",percent:81}]
  },

  // Marketing
  { id: 240, name: "Григорий Панов", title: "Brand Manager", department: "Marketing", region: "Москва",
    managerId: 4, orgTag: "CEO-2", competencies: comp(3,2,3,4,2,2,3,3),
    readiness: { targetRole: "Директор по маркетингу", percent: 64 },
    assessments: [{date:"2025-05",percent:58},{date:"2025-06",percent:61},{date:"2025-07",percent:64}]
  },
  { id: 241, name: "Алина Рудская", title: "Digital Manager", department: "Marketing", region: "СПБ",
    managerId: 4, orgTag: "CEO-2", competencies: comp(3,2,4,4,2,2,3,3),
    readiness: { targetRole: "Директор по маркетингу", percent: 70 },
    assessments: [{date:"2025-05",percent:62},{date:"2025-06",percent:67},{date:"2025-07",percent:70}]
  },

  // Finance
  { id: 260, name: "Игорь Костров", title: "FP&A Manager", department: "Finance", region: "Москва",
    managerId: 5, orgTag: "CEO-2", competencies: comp(3,2,4,3,2,4,3,3),
    readiness: { targetRole: "CFO", percent: 77 },
    assessments: [{date:"2025-05",percent:71},{date:"2025-06",percent:74},{date:"2025-07",percent:77}]
  },
  { id: 261, name: "Дарья Минаева", title: "Controller", department: "Finance", region: "СПБ",
    managerId: 5, orgTag: "CEO-2", competencies: comp(2,2,4,3,2,4,3,2),
    readiness: { targetRole: "FP&A Manager", percent: 68 },
    assessments: [{date:"2025-05",percent:60},{date:"2025-06",percent:64},{date:"2025-07",percent:68}]
  },

  // DT
  { id: 280, name: "Роман Ермаков", title: "Product Owner", department: "DT", region: "Москва",
    managerId: 6, orgTag: "CEO-2", competencies: comp(3,2,4,3,3,2,3,4),
    readiness: { targetRole: "Директор по цифровой трансформации", percent: 74 },
    assessments: [{date:"2025-05",percent:68},{date:"2025-06",percent:71},{date:"2025-07",percent:74}]
  },
  { id: 281, name: "Елена Пахомова", title: "Business Analyst", department: "DT", region: "СПБ",
    managerId: 6, orgTag: "CEO-2", competencies: comp(3,1,4,3,2,2,3,3),
    readiness: { targetRole: "Product Owner", percent: 66 },
    assessments: [{date:"2025-05",percent:59},{date:"2025-06",percent:63},{date:"2025-07",percent:66}]
  },

  // Пара дополнительных RM/KAM для объёма
  { id: 107, name: "Павел Зуев", title: "RM", department: "Продажи", region: "Урал",
    managerId: 104, orgTag: "CEO-3", competencies: comp(3,2,3,3,2,2,4,3),
    readiness: { targetRole: "KAM", percent: 62 },
    assessments: [{date:"2025-05",percent:54},{date:"2025-06",percent:58},{date:"2025-07",percent:62}]
  },
  { id: 108, name: "Юлия Белова", title: "RM", department: "Продажи", region: "Сибирь",
    managerId: 103, orgTag: "CEO-3", competencies: comp(3,3,3,4,2,2,4,3),
    readiness: { targetRole: "KAM", percent: 71 },
    assessments: [{date:"2025-05",percent:65},{date:"2025-06",percent:68},{date:"2025-07",percent:71}]
  },
  { id: 151, name: "Олег Яковлев", title: "Category Manager", department: "Продажи", region: "Юг",
    managerId: 2, orgTag: "CEO-2", competencies: comp(3,3,4,3,2,4,3,3),
    readiness: { targetRole: "KAM", percent: 72 },
    assessments: [{date:"2025-05",percent:66},{date:"2025-06",percent:69},{date:"2025-07",percent:72}]
  },
  { id: 109, name: "Евгений Соловьёв", title: "RM", department: "Продажи", region: "ЦФО",
    managerId: 103, orgTag: "CEO-3", competencies: comp(3,2,3,3,2,2,4,2),
    readiness: { targetRole: "KAM", percent: 64 },
    assessments: [{date:"2025-05",percent:58},{date:"2025-06",percent:61},{date:"2025-07",percent:64}]
  },
];

// ────────────────────────────────────────────────────────────────────────────
// 360° моки (по нескольким сотрудникам). Формат ожидает ui-screens EmployeeProfileView.
export const employee360 = {
  101: [
    {
      name: "Стратегическое мышление",
      anchor: "Формулирует цели, просчитывает сценарии, риски, приоритеты.",
      questions: [
        { question: "Ставит измеримые цели на квартал", scores: { peers: 3.4, reports: 3.5, manager: 3.6, self: 4.0 } },
        { question: "Оценивает риски до запуска инициатив", scores: { peers: 3.1, reports: 3.0, manager: 3.2, self: 3.9 } },
      ],
    },
    {
      name: "Переговоры",
      anchor: "Управляет повесткой, использует BATNA, фиксирует договорённости письменно.",
      questions: [
        { question: "Фиксирует договорённости письменно", scores: { peers: 3.6, reports: 3.7, manager: 3.8, self: 3.9 } },
        { question: "Держит рамку встречи и тайминг", scores: { peers: 3.2, reports: 3.1, manager: 3.4, self: 3.7 } },
      ],
    },
  ],
  103: [
    {
      name: "Аналитика",
      anchor: "Решения из цифр, отчёты, тренды, полка.",
      questions: [
        { question: "Собирает weekly-отчёт по полке", scores: { peers: 4.2, reports: 4.1, manager: 4.3, self: 4.0 } },
        { question: "Видит тренды и предлагает гипотезы", scores: { peers: 4.0, reports: 3.9, manager: 4.1, self: 4.2 } },
      ],
    },
  ],
};

