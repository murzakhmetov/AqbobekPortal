import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, calculateGPA, getSubjectAverages, getLeaderboard } from '../../services/bilimclassAPI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar } from 'recharts';
import { TrendingUp, Award, Target, Star, Zap, BookOpen, Plus, X, CheckCircle, Trash2, Flame, Clock, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

export default function StudentDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const student = getStudentById(user?.studentId || 's1');
  const gpa = calculateGPA(student);
  const subjectAvgs = getSubjectAverages(student);
  const leaderboard = getLeaderboard();
  const rank = leaderboard.findIndex(l => l.id === student.id) + 1;

  const [goals, setGoals] = useState([
    { id: 1, text: lang === 'ru' ? 'Поднять GPA до 8.0' : 'Raise GPA to 8.0', done: false },
    { id: 2, text: lang === 'ru' ? 'Подготовиться к СОЧ по физике' : 'Prepare for Physics exam', done: false },
    { id: 3, text: lang === 'ru' ? 'Участвовать в олимпиаде по информатике' : 'Participate in CS olympiad', done: true },
  ]);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };
  const addGoal = () => { if (!newGoal.trim()) return; setGoals(prev => [...prev, { id: Date.now(), text: newGoal, done: false }]); setNewGoal(''); setShowGoalInput(false); showToast(lang === 'ru' ? '🎯 Цель добавлена!' : '🎯 Goal added!'); };
  const toggleGoal = (id) => { setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g)); const goal = goals.find(g => g.id === id); if (goal && !goal.done) showToast(lang === 'ru' ? '🏆 Ачивка получена! +10 очков' : '🏆 Achievement unlocked! +10 points'); };
  const deleteGoal = (id) => { setGoals(prev => prev.filter(g => g.id !== id)); };

  const quarterTrend = [1, 2, 3, 4].map(q => {
    const vals = Object.keys(student.grades).map(subId => student.grades[subId][`q${q}`]?.quarterGrade || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { quarter: `Q${q}`, avg: Math.round(avg * 10) / 10 };
  });

  const radarData = subjectAvgs.map(s => ({
    name: (lang === 'ru' ? s.name : s.nameEn).slice(0, 8),
    avg: s.avg,
  }));

  const strongSubjects = subjectAvgs.filter(s => s.avg >= 7).sort((a, b) => b.avg - a.avg).slice(0, 3);
  const weakSubjects = subjectAvgs.filter(s => s.avg < 6).sort((a, b) => a.avg - b.avg).slice(0, 3);

  const gpaPercent = Math.round(gpa / 10 * 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (gpaPercent / 100) * circumference;

  const achievementPoints = student.achievements.reduce((a, b) => a + b.points, 0);

  return (
    <div className="dashboard-page">
      {toast && <div className="toast-notification">{toast}</div>}

      <div className="welcome-banner">
        <div className="welcome-text">
          <span className="welcome-greeting">{lang === 'ru' ? 'Привет' : 'Hello'}, {student.name.split(' ')[0]}! 👋</span>
          <h1 className="welcome-title">{lang === 'ru' ? 'Твой прогресс сегодня' : 'Your progress today'}</h1>
          <p className="welcome-subtitle">
            {lang === 'ru'
              ? `Ты на ${rank} месте из ${leaderboard.length}. Так держать!`
              : `You're ranked #${rank} out of ${leaderboard.length}. Keep it up!`}
          </p>
          <div className="welcome-badges">
            <span className="w-badge"><Flame size={14} /> {lang === 'ru' ? '7 дней подряд' : '7 days streak'}</span>
            <span className="w-badge"><Trophy size={14} /> {lang === 'ru' ? 'Топ 50%' : 'Top 50%'}</span>
            <span className="w-badge"><Zap size={14} /> {achievementPoints} {t('points')}</span>
          </div>
        </div>
        <div className="welcome-gpa-ring">
          <svg viewBox="0 0 120 120" className="gpa-ring-svg">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gpaGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            <defs>
              <linearGradient id="gpaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#00C9A7" />
              </linearGradient>
            </defs>
            <text x="60" y="55" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{gpa.toFixed(1)}</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">GPA</text>
          </svg>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#6C63FF' }}>
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-info">
            <span className="stat-value">{gpa.toFixed(1)}</span>
            <span className="stat-label">{t('overallGPA')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FFD93D' }}>
          <div className="stat-icon"><Star /></div>
          <div className="stat-info">
            <span className="stat-value">#{rank}</span>
            <span className="stat-label">{t('classRank')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><Award /></div>
          <div className="stat-info">
            <span className="stat-value">{student.achievements.length}</span>
            <span className="stat-label">{t('achievements')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FF6B6B' }}>
          <div className="stat-icon"><Clock /></div>
          <div className="stat-info">
            <span className="stat-value">{student.attendance}%</span>
            <span className="stat-label">{t('attendanceRate')}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-two-col">
        <div className="chart-card goals-card">
          <div className="goals-header">
            <h3><Target size={20} /> {lang === 'ru' ? 'Мои цели' : 'My Goals'}</h3>
            <button className="btn-icon" onClick={() => setShowGoalInput(!showGoalInput)}><Plus size={18} /></button>
          </div>
          {showGoalInput && (
            <div className="goal-input-row">
              <input className="form-input" value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} placeholder={lang === 'ru' ? 'Новая цель...' : 'New goal...'} autoFocus />
              <button className="btn-primary btn-sm" onClick={addGoal}><Plus size={14} /></button>
            </div>
          )}
          <div className="goals-list">
            {goals.map(goal => (
              <div key={goal.id} className={`goal-item ${goal.done ? 'done' : ''}`}>
                <button className="goal-checkbox" onClick={() => toggleGoal(goal.id)}>
                  {goal.done ? <CheckCircle size={18} color="#00C9A7" /> : <div className="checkbox-empty"></div>}
                </button>
                <span className="goal-text">{goal.text}</span>
                <button className="goal-delete" onClick={() => deleteGoal(goal.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="goals-progress">
            <div className="goals-progress-bar">
              <div className="goals-progress-fill" style={{ width: `${goals.length > 0 ? (goals.filter(g => g.done).length / goals.length * 100) : 0}%` }}></div>
            </div>
            <span className="goals-progress-text">{goals.filter(g => g.done).length}/{goals.length} {lang === 'ru' ? 'выполнено' : 'completed'}</span>
          </div>
        </div>

        <div className="chart-card">
          <h3>{lang === 'ru' ? 'Сильные и слабые стороны' : 'Strengths & Weaknesses'}</h3>
          <div className="sw-section">
            <div className="sw-group">
              <span className="sw-label good"><ArrowUpRight size={14} /> {lang === 'ru' ? 'Сильные' : 'Strong'}</span>
              {strongSubjects.map(s => (
                <div key={s.id} className="sw-item">
                  <span>{lang === 'ru' ? s.name : s.nameEn}</span>
                  <div className="sw-bar-track"><div className="sw-bar-fill good" style={{ width: `${s.avg * 10}%` }}></div></div>
                  <span className="sw-score good">{s.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="sw-group">
              <span className="sw-label weak"><ArrowDownRight size={14} /> {lang === 'ru' ? 'Нужно подтянуть' : 'Needs work'}</span>
              {weakSubjects.map(s => (
                <div key={s.id} className="sw-item">
                  <span>{lang === 'ru' ? s.name : s.nameEn}</span>
                  <div className="sw-bar-track"><div className="sw-bar-fill weak" style={{ width: `${s.avg * 10}%` }}></div></div>
                  <span className="sw-score weak">{s.avg.toFixed(1)}</span>
                </div>
              ))}
              {weakSubjects.length === 0 && <p style={{ fontSize: '13px', color: 'var(--accent-green)' }}>🎉 {lang === 'ru' ? 'Всё отлично!' : 'All good!'}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t('gradesDynamics')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={quarterTrend}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="quarter" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="avg" stroke="#6C63FF" fill="url(#areaGrad)" strokeWidth={3} dot={{ fill: '#6C63FF', r: 6 }} activeDot={{ r: 8, fill: '#8B80FF' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('subjectPerformance')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#ccc', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar dataKey="avg" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>{lang === 'ru' ? 'Последние достижения' : 'Recent Achievements'}</h3>
        <div className="recent-achievements-row">
          {student.achievements.slice(0, 4).map(ach => (
            <div key={ach.id} className="recent-ach-card">
              <span className="ach-emoji">{ach.type === 'olympiad' ? '🏅' : ach.type === 'competition' ? '🏆' : ach.type === 'certificate' ? '📜' : '🤝'}</span>
              <div className="ach-card-info">
                <span className="ach-card-title">{ach.title}</span>
                <span className="ach-card-date">{ach.date}</span>
              </div>
              <span className="ach-card-pts">+{ach.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
