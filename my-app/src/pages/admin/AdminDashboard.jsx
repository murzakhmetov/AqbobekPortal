import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { getStudents, getClasses, getSubjects, calculateGPA, getSubjectAverages, getAtRiskStudents } from '../../services/bilimclassAPI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Legend
} from 'recharts';
import { Globe2, TrendingUp, Users, Award, AlertTriangle, CheckCircle, Target, ChevronDown, ChevronUp, Zap, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const students = getStudents();
  const classes = getClasses();
  const subjects = getSubjects();

  const [selectedClass, setSelectedClass] = useState(null);
  const [qualityExpanded, setQualityExpanded] = useState(true);

  const schoolGPA = (students.reduce((s, st) => s + calculateGPA(st), 0) / students.length).toFixed(1);
  const totalAtRisk = getAtRiskStudents().length;
  const excellentCount = students.filter(s => calculateGPA(s) >= 8).length;
  const excellentPct = Math.round(excellentCount / students.length * 100);

  const classStats = classes.map(cls => {
    const clsStudents = students.filter(s => s.classId === cls.id);
    const avg = clsStudents.reduce((s, st) => s + calculateGPA(st), 0) / clsStudents.length;
    const excellent = clsStudents.filter(s => calculateGPA(s) >= 8).length;
    const atRisk = clsStudents.filter(s => calculateGPA(s) < 5).length;
    const attendanceAvg = Math.round(clsStudents.reduce((s, st) => s + st.attendance, 0) / clsStudents.length);
    return {
      id: cls.id,
      name: cls.name,
      avg: Math.round(avg * 10) / 10,
      count: clsStudents.length,
      excellent,
      excellentPct: Math.round(excellent / clsStudents.length * 100),
      atRisk,
      attendance: attendanceAvg,
      achievementsTotal: clsStudents.reduce((s, st) => s + st.achievements.length, 0),
    };
  });

  const subjectStats = subjects.map(sub => {
    const avgs = students.map(s => {
      const sa = getSubjectAverages(s).find(x => x.id === sub.id);
      return sa?.avg || 0;
    });
    const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
    return {
      id: sub.id,
      name: (lang === 'ru' ? sub.name : sub.nameEn).slice(0, 10),
      fullName: lang === 'ru' ? sub.name : sub.nameEn,
      avg: Math.round(avg * 10) / 10
    };
  });

  const qualityDistribution = [
    { name: lang === 'ru' ? 'Отлично (8-10)' : 'Excellent (8-10)', value: students.filter(s => calculateGPA(s) >= 8).length, color: '#00C9A7', grade: 'A' },
    { name: lang === 'ru' ? 'Хорошо (6-8)' : 'Good (6-8)', value: students.filter(s => calculateGPA(s) >= 6 && calculateGPA(s) < 8).length, color: '#6C63FF', grade: 'B' },
    { name: lang === 'ru' ? 'Удовл. (4-6)' : 'Satisfactory (4-6)', value: students.filter(s => calculateGPA(s) >= 4 && calculateGPA(s) < 6).length, color: '#FFD93D', grade: 'C' },
    { name: lang === 'ru' ? 'Неудовл. (<4)' : 'Unsatisfactory (<4)', value: students.filter(s => calculateGPA(s) < 4).length, color: '#FF6B6B', grade: 'D' },
  ];

  const qualityScore = Math.round(
    (qualityDistribution[0].value * 100 + qualityDistribution[1].value * 75 + qualityDistribution[2].value * 50 + qualityDistribution[3].value * 20) / students.length
  );

  const qualityGrade = qualityScore >= 85 ? 'A+' : qualityScore >= 75 ? 'A' : qualityScore >= 65 ? 'B+' : qualityScore >= 55 ? 'B' : qualityScore >= 45 ? 'C' : 'D';
  const qualityColor = qualityScore >= 75 ? '#00C9A7' : qualityScore >= 55 ? '#FFD93D' : '#FF6B6B';

  const radarData = subjects.slice(0, 8).map(sub => {
    const avgs = students.map(s => {
      const sa = getSubjectAverages(s).find(x => x.id === sub.id);
      return sa?.avg || 0;
    });
    const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
    return { subject: (lang === 'ru' ? sub.name : sub.nameEn).slice(0, 8), value: Math.round(avg * 10) / 10 };
  });

  const quarterTrend = [1, 2, 3, 4].map(q => {
    const avgs = students.map(s => {
      const subjectGrades = Object.values(s.grades);
      const qGrades = subjectGrades.map(sg => sg[`q${q}`]?.quarterGrade || 0);
      return qGrades.reduce((a, b) => a + b, 0) / qGrades.length;
    });
    return {
      name: `${lang === 'ru' ? 'Четверть' : 'Q'} ${q}`,
      avg: Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length * 10) / 10,
    };
  });

  const selectedClassData = selectedClass ? classStats.find(c => c.id === selectedClass) : null;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><Globe2 size={28} /> {t('globalRadar')}</h1>
        <p>{t('globalAnalytics')}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#FFD93D' }}>
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-info">
            <span className="stat-value">{schoolGPA}</span>
            <span className="stat-label">{lang === 'ru' ? 'GPA школы' : 'School GPA'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#6C63FF' }}>
          <div className="stat-icon"><Users /></div>
          <div className="stat-info">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">{lang === 'ru' ? 'Всего учеников' : 'Total Students'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><Award /></div>
          <div className="stat-info">
            <span className="stat-value">{excellentPct}%</span>
            <span className="stat-label">{lang === 'ru' ? 'Отличников' : 'Honor Roll'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FF6B6B' }}>
          <div className="stat-icon"><AlertTriangle /></div>
          <div className="stat-info">
            <span className="stat-value">{totalAtRisk}</span>
            <span className="stat-label">{lang === 'ru' ? 'В зоне риска' : 'At Risk'}</span>
          </div>
        </div>
      </div>

      <div className="quality-index-section">
        <div className="quality-main-card">
          <div className="quality-header" onClick={() => setQualityExpanded(!qualityExpanded)} style={{ cursor: 'pointer' }}>
            <h3><Target size={20} /> {t('qualityIndex')}</h3>
            {qualityExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          <div className="quality-score-row">
            <div className="quality-gauge">
              <svg viewBox="0 0 200 120" className="gauge-svg">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="33%" stopColor="#FFD93D" />
                    <stop offset="66%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#00C9A7" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${qualityScore / 100 * 251.2} 251.2`}
                />
                <text x="100" y="85" textAnchor="middle" fill={qualityColor} fontSize="36" fontWeight="800">{qualityScore}</text>
                <text x="100" y="105" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">{lang === 'ru' ? 'из 100' : 'of 100'}</text>
              </svg>
            </div>

            <div className="quality-meta">
              <div className="quality-grade-badge" style={{ background: qualityColor }}>
                {qualityGrade}
              </div>
              <span className="quality-description">
                {qualityScore >= 75
                  ? (lang === 'ru' ? 'Высокое качество образования' : 'High educational quality')
                  : qualityScore >= 55
                  ? (lang === 'ru' ? 'Среднее качество. Есть потенциал' : 'Average quality. Room for growth')
                  : (lang === 'ru' ? 'Требуется внимание' : 'Needs attention')}
              </span>
            </div>

            <div className="quality-breakdown">
              {qualityDistribution.map((item, i) => (
                <div key={i} className="quality-bar-item">
                  <div className="quality-bar-label">
                    <span className="quality-dot" style={{ background: item.color }}></span>
                    <span>{item.name}</span>
                  </div>
                  <div className="quality-bar-track">
                    <div className="quality-bar-fill" style={{ width: `${item.value / students.length * 100}%`, background: item.color }}></div>
                  </div>
                  <span className="quality-bar-count">{item.value} ({Math.round(item.value / students.length * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {qualityExpanded && (
            <div className="quality-expanded">
              <div className="quality-metrics-grid">
                <div className="quality-metric">
                  <Zap size={16} color="#FFD93D" />
                  <div>
                    <span className="qm-value">{schoolGPA}</span>
                    <span className="qm-label">{lang === 'ru' ? 'Средний GPA' : 'Average GPA'}</span>
                  </div>
                </div>
                <div className="quality-metric">
                  <CheckCircle size={16} color="#00C9A7" />
                  <div>
                    <span className="qm-value">{Math.round(students.reduce((s, st) => s + st.attendance, 0) / students.length)}%</span>
                    <span className="qm-label">{lang === 'ru' ? 'Посещаемость' : 'Attendance'}</span>
                  </div>
                </div>
                <div className="quality-metric">
                  <Award size={16} color="#6C63FF" />
                  <div>
                    <span className="qm-value">{students.reduce((s, st) => s + st.achievements.length, 0)}</span>
                    <span className="qm-label">{lang === 'ru' ? 'Достижения' : 'Achievements'}</span>
                  </div>
                </div>
                <div className="quality-metric">
                  <BarChart3 size={16} color="#FF6B6B" />
                  <div>
                    <span className="qm-value">{totalAtRisk}</span>
                    <span className="qm-label">{lang === 'ru' ? 'Риск-зона' : 'At-Risk'}</span>
                  </div>
                </div>
              </div>

              <div className="quality-charts-row">
                <div className="quality-chart-mini">
                  <h4>{lang === 'ru' ? 'Распределение' : 'Distribution'}</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={qualityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                        {qualityDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="quality-chart-mini">
                  <h4>{lang === 'ru' ? 'Тренд по четвертям' : 'Quarterly Trend'}</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={quarterTrend}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#555" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#555" domain={[5, 8]} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="avg" stroke="#6C63FF" fill="url(#trendGrad)" strokeWidth={2} dot={{ r: 4, fill: '#6C63FF' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="quality-chart-mini">
                  <h4>{lang === 'ru' ? 'Предметный профиль' : 'Subject Profile'}</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#888' }} />
                      <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#FFD93D" fill="#FFD93D" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t('byGradeLevel')}</h3>
          <div className="class-selector-row">
            {classes.map(cls => {
              const data = classStats.find(c => c.id === cls.id);
              return (
                <div
                  key={cls.id}
                  className={`class-stat-card clickable ${selectedClass === cls.id ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                >
                  <span className="cs-name">{cls.name}</span>
                  <span className="cs-gpa">{data.avg}</span>
                  <span className="cs-meta">{data.count} {lang === 'ru' ? 'уч.' : 'st.'}</span>
                </div>
              );
            })}
          </div>

          {selectedClassData && (
            <div className="class-detail-expanded">
              <div className="class-detail-stats">
                <div className="cd-stat">
                  <span className="cd-value" style={{ color: '#00C9A7' }}>{selectedClassData.excellentPct}%</span>
                  <span className="cd-label">{lang === 'ru' ? 'Качество' : 'Quality'}</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-value">{selectedClassData.attendance}%</span>
                  <span className="cd-label">{lang === 'ru' ? 'Посещ.' : 'Attend.'}</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-value" style={{ color: '#FF6B6B' }}>{selectedClassData.atRisk}</span>
                  <span className="cd-label">{lang === 'ru' ? 'В риске' : 'At Risk'}</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-value" style={{ color: '#6C63FF' }}>{selectedClassData.achievementsTotal}</span>
                  <span className="cd-label">{lang === 'ru' ? 'Достиж.' : 'Achiev.'}</span>
                </div>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="avg" fill="url(#adminGrad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD93D" />
                  <stop offset="100%" stopColor="#FF8C00" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('bySubject')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#888" domain={[0, 10]} />
              <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Bar dataKey="avg" fill="url(#subjectGrad)" radius={[0, 8, 8, 0]} barSize={16} />
              <defs>
                <linearGradient id="subjectGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B35A2" />
                  <stop offset="100%" stopColor="#6C63FF" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
