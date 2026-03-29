const SUBJECTS = [
  { id: 'math', name: 'Алгебра', nameEn: 'Algebra' },
  { id: 'geometry', name: 'Геометрия', nameEn: 'Geometry' },
  { id: 'physics', name: 'Физика', nameEn: 'Physics' },
  { id: 'chemistry', name: 'Химия', nameEn: 'Chemistry' },
  { id: 'biology', name: 'Биология', nameEn: 'Biology' },
  { id: 'history', name: 'История Казахстана', nameEn: 'History of Kazakhstan' },
  { id: 'kazakh', name: 'Казахский язык', nameEn: 'Kazakh Language' },
  { id: 'russian', name: 'Русский язык', nameEn: 'Russian Language' },
  { id: 'english', name: 'Английский язык', nameEn: 'English Language' },
  { id: 'informatics', name: 'Информатика', nameEn: 'Computer Science' },
  { id: 'geography', name: 'География', nameEn: 'Geography' },
  { id: 'pe', name: 'Физкультура', nameEn: 'Physical Education' },
];

const TEACHERS = [
  { id: 't1', name: 'Айгуль Нурланова', nameEn: 'Aigul Nurlanova', subjects: ['math', 'geometry'], available: [1,2,3,4,5] },
  { id: 't2', name: 'Бауыржан Серікбаев', nameEn: 'Bauyrzhan Serikbayev', subjects: ['physics'], available: [1,2,3,4,5] },
  { id: 't3', name: 'Гүлнар Әбілқасымова', nameEn: 'Gulnar Abilkasymova', subjects: ['chemistry', 'biology'], available: [1,2,3,4,5] },
  { id: 't4', name: 'Дінмұхамед Жұмабеков', nameEn: 'Dinmukhamed Zhumabekov', subjects: ['history', 'geography'], available: [1,2,3,4,5] },
  { id: 't5', name: 'Елена Петрова', nameEn: 'Elena Petrova', subjects: ['russian', 'kazakh'], available: [1,2,3,5] },
  { id: 't6', name: 'Жанна Тілеуберди', nameEn: 'Zhanna Tileuberdi', subjects: ['english'], available: [1,2,3,4,5] },
  { id: 't7', name: 'Кайрат Оспанов', nameEn: 'Kairat Ospanov', subjects: ['informatics'], available: [1,2,4,5] },
  { id: 't8', name: 'Марат Жанібеков', nameEn: 'Marat Zhanibekov', subjects: ['pe'], available: [1,2,3,4,5] },
];

const ROOMS = [
  { id: 'r101', name: '101', capacity: 30 },
  { id: 'r102', name: '102', capacity: 30 },
  { id: 'r201', name: '201', capacity: 25 },
  { id: 'r202', name: '202', capacity: 25 },
  { id: 'r301', name: '301', capacity: 20 },
  { id: 'r302', name: '302', capacity: 20 },
  { id: 'r303', name: '303', capacity: 20 },
  { id: 'gym', name: 'Спортзал', capacity: 60 },
];

const CLASSES = [
  { id: 'c10a', name: '10А', grade: 10, students: [] },
  { id: 'c10b', name: '10Б', grade: 10, students: [] },
  { id: 'c11a', name: '11А', grade: 11, students: [] },
];

function generateStudentName(index) {
  const firstNames = [
    'Арман', 'Айдана', 'Бекзат', 'Дана', 'Ерасыл', 'Жансая', 'Ибрагим', 'Камила',
    'Мадина', 'Нұрсұлтан', 'Сәуле', 'Тимур', 'Алия', 'Дамир', 'Инжу', 'Қарақат',
    'Алтынай', 'Әсем', 'Нұрай', 'Ержан', 'Ботагөз', 'Серік', 'Ақмарал', 'Аяжан',
    'Дәурен', 'Еркебұлан', 'Жанар', 'Күнсұлу', 'Мерей', 'Санжар', 'Томирис', 'Ұлан'
  ];
  const lastNames = [
    'Абдуллаев', 'Байтұрсынов', 'Есенов', 'Жұмабаев', 'Қасымов', 'Мұратов',
    'Нұрманов', 'Сатпаев', 'Тоқаев', 'Әуезов', 'Бейсембаев', 'Жанібеков',
    'Кенесарин', 'Отырарбаев', 'Сүлейменов', 'Шоқанов', 'Абылайханов', 'Құнанбаев',
    'Момышұлы', 'Рахметов', 'Уәлиханов', 'Ходжанов', 'Досмұхамедов', 'Тәттібаев',
    'Бөкейханов', 'Ермеков', 'Қожанов', 'Менділбаев', 'Рысқұлов', 'Жандосов'
  ];
  return `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`;
}

function randomGrade(min = 3, max = 25) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGrades(studentId) {
  const grades = {};
  SUBJECTS.forEach(sub => {
    const baseLevel = Math.random() * 0.4 + 0.5;
    const quarters = {};
    for (let q = 1; q <= 4; q++) {
      const sorScores = [];
      const sochScore = Math.round(baseLevel * 25 + (Math.random() - 0.5) * 10);
      for (let s = 0; s < 3; s++) {
        sorScores.push({
          score: Math.round(baseLevel * 15 + (Math.random() - 0.5) * 6),
          maxScore: 15,
          date: `2025-${String(q * 2 + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          topic: `Тема ${s + 1}`
        });
      }
      quarters[`q${q}`] = {
        sor: sorScores,
        soch: { score: Math.min(25, Math.max(5, sochScore)), maxScore: 25 },
        quarterGrade: Math.round(
          (sorScores.reduce((a, b) => a + b.score, 0) / (15 * 3) * 0.5 + Math.min(25, Math.max(5, sochScore)) / 25 * 0.5) * 100
        ) / 10
      };
    }
    grades[sub.id] = quarters;
  });
  return grades;
}

function generateAchievements(studentId, count) {
  const types = ['olympiad', 'competition', 'certificate', 'volunteering'];
  const titles = {
    olympiad: ['Областная олимпиада по математике', 'Республиканская олимпиада по физике', 'Олимпиада по информатике «IT Zhuldyz»'],
    competition: ['Дебатный турнир', 'Конкурс научных проектов', 'Hackathon AIS 3.0'],
    certificate: ['Coursera: Python for Data Science', 'Cambridge B2 First', 'IELTS 7.0'],
    volunteering: ['Экологическая акция «Таза Қазақстан»', 'Помощь детскому дому', 'Учебный менторинг младших классов']
  };
  const results = [];
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const titleList = titles[type];
    results.push({
      id: `ach_${studentId}_${i}`,
      title: titleList[i % titleList.length],
      type,
      date: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      verified: Math.random() > 0.3,
      points: Math.floor(Math.random() * 50) + 10,
    });
  }
  return results;
}

function generateStudents() {
  const students = [];
  let idx = 0;
  CLASSES.forEach(cls => {
    const count = cls.id === 'c11a' ? 10 : 12;
    for (let i = 0; i < count; i++) {
      const sid = `s${idx + 1}`;
      const student = {
        id: sid,
        name: generateStudentName(idx),
        classId: cls.id,
        className: cls.name,
        email: `student${idx + 1}@aqbobek.kz`,
        grades: generateGrades(sid),
        achievements: generateAchievements(sid, Math.floor(Math.random() * 5) + 1),
        attendance: Math.round((0.85 + Math.random() * 0.15) * 100),
        avatar: null,
      };
      students.push(student);
      cls.students.push(sid);
      idx++;
    }
  });
  return students;
}

let _students = null;

export function getStudents() {
  if (!_students) _students = generateStudents();
  return _students;
}

export function getStudentById(id) {
  return getStudents().find(s => s.id === id);
}

export function getStudentsByClass(classId) {
  return getStudents().filter(s => s.classId === classId);
}

export function getSubjects() {
  return SUBJECTS;
}

export function getSubjectById(id) {
  return SUBJECTS.find(s => s.id === id);
}

export function getTeachers() {
  return TEACHERS;
}

export function getTeacherById(id) {
  return TEACHERS.find(t => t.id === id);
}

export function getRooms() {
  return ROOMS;
}

export function getClasses() {
  return CLASSES;
}

export function getClassById(id) {
  return CLASSES.find(c => c.id === id);
}

export function calculateGPA(student) {
  const subjects = Object.keys(student.grades);
  if (subjects.length === 0) return 0;
  let total = 0;
  let count = 0;
  subjects.forEach(subId => {
    Object.keys(student.grades[subId]).forEach(q => {
      total += student.grades[subId][q].quarterGrade;
      count++;
    });
  });
  return Math.round(total / count * 10) / 10;
}

export function getSubjectAverages(student) {
  return SUBJECTS.map(sub => {
    const subGrades = student.grades[sub.id];
    if (!subGrades) return { ...sub, avg: 0 };
    const vals = Object.values(subGrades).map(q => q.quarterGrade);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { ...sub, avg: Math.round(avg * 10) / 10 };
  });
}

export function getLeaderboard() {
  return getStudents()
    .map(s => ({
      id: s.id,
      name: s.name,
      className: s.className,
      gpa: calculateGPA(s),
      achievementPoints: s.achievements.reduce((a, b) => a + b.points, 0),
      totalScore: Math.round((calculateGPA(s) * 10 + s.achievements.reduce((a, b) => a + b.points, 0)) * 10) / 10,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function getAtRiskStudents(classId) {
  const students = classId ? getStudentsByClass(classId) : getStudents();
  return students.filter(s => {
    return Object.keys(s.grades).some(subId => {
      const q = s.grades[subId];
      if (q.q1 && q.q3) {
        const drop = (q.q1.quarterGrade - q.q3.quarterGrade) / q.q1.quarterGrade;
        return drop > 0.2;
      }
      return false;
    });
  }).map(s => {
    const riskSubjects = SUBJECTS.filter(sub => {
      const q = s.grades[sub.id];
      if (q?.q1 && q?.q3) {
        return (q.q1.quarterGrade - q.q3.quarterGrade) / q.q1.quarterGrade > 0.2;
      }
      return false;
    });
    return {
      ...s,
      gpa: calculateGPA(s),
      riskSubjects: riskSubjects.map(sub => sub.name),
      riskLevel: riskSubjects.length > 2 ? 'high' : 'medium',
    };
  });
}

export function getNews() {
  return [
    { id: 'n1', title: 'Олимпиада по математике', titleEn: 'Math Olympiad', content: 'Регистрация на областную олимпиаду открыта до 15 апреля.', contentEn: 'Registration for the regional olympiad is open until April 15.', date: '2025-03-25', targetGrades: [10, 11], author: 'Администрация' },
    { id: 'n2', title: 'День открытых дверей', titleEn: 'Open Day', content: 'Приглашаем родителей 5 апреля на день открытых дверей.', contentEn: 'We invite parents to the open day on April 5.', date: '2025-03-28', targetGrades: [], author: 'Администрация' },
    { id: 'n3', title: 'Хакатон AIShack 3.0', titleEn: 'AIShack 3.0 Hackathon', content: 'Наши ученики участвуют в хакатоне AIShack 3.0!', contentEn: 'Our students are participating in the AIShack 3.0 hackathon!', date: '2025-03-29', targetGrades: [10, 11], author: 'IT-отдел' },
    { id: 'n4', title: 'Спортивные соревнования', titleEn: 'Sports Competition', content: 'Межшкольный турнир по волейболу состоится 10 апреля.', contentEn: 'Inter-school volleyball tournament on April 10.', date: '2025-03-26', targetGrades: [], author: 'Кафедра физкультуры' },
  ];
}

export default {
  getStudents, getStudentById, getStudentsByClass,
  getSubjects, getSubjectById,
  getTeachers, getTeacherById,
  getRooms, getClasses, getClassById,
  calculateGPA, getSubjectAverages,
  getLeaderboard, getAtRiskStudents, getNews,
};
