import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, calculateGPA, getSubjectAverages, getLeaderboard } from '../../services/bilimclassAPI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Eye, TrendingUp, BookOpen, Award, Star, MessageSquare, Send, Bell, CheckCircle, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight, Calendar, Clock } from 'lucide-react';

export default function ParentDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const child = getStudentById(user?.linkedStudentId || 's1');
  const gpa = calculateGPA(child);
  const subjectAvgs = getSubjectAverages(child);
  const leaderboard = getLeaderboard();
  const rank = leaderboard.findIndex(l => l.id === child.id) + 1;

  const [notifications, setNotifications] = useState([
    { id: 1, text: lang === 'ru' ? '📚 СОЧ по математике через 3 дня' : '📚 Math exam in 3 days', read: false, time: '10:30' },
    { id: 2, text: lang === 'ru' ? '🏆 Ваш ребёнок вошёл в топ-5 рейтинга' : '🏆 Your child is in the top 5', read: false, time: '09:15' },
    { id: 3, text: lang === 'ru' ? '📝 Новая оценка по физике: СОР 12/15' : '📝 New physics grade: 12/15', read: true, time: 'вчера' },
    { id: 4, text: lang === 'ru' ? '📅 Родительское собрание 5 апреля' : '📅 Parent meeting on April 5', read: false, time: '08:00' },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const markRead = (id) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { from: 'parent', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'teacher',
        text: lang === 'ru' ? 'Спасибо за сообщение. Я обратила внимание и свяжусь с вами.' : 'Thank you for your message. I noted it and will get back to you.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  const quarterTrend = [1, 2, 3, 4].map(q => {
    const vals = Object.keys(child.grades).map(subId => child.grades[subId][`q${q}`]?.quarterGrade || 0);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { quarter: `${lang === 'ru' ? 'Четв' : 'Q'} ${q}`, avg: Math.round(avg * 10) / 10 };
  });

  const radarData = subjectAvgs.map(s => ({
    name: (lang === 'ru' ? s.name : s.nameEn).slice(0, 8),
    avg: s.avg,
  }));

  const unreadCount = notifications.filter(n => !n.read).length;
  const strongSubjects = subjectAvgs.filter(s => s.avg >= 7).sort((a, b) => b.avg - a.avg).slice(0, 3);
  const weakSubjects = subjectAvgs.filter(s => s.avg < 6).sort((a, b) => a.avg - b.avg).slice(0, 3);
  const gpaPercent = Math.round(gpa / 10 * 100);
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (gpaPercent / 100) * circumference;

  const gpaChange = quarterTrend[2].avg - quarterTrend[1].avg;
  const gpaUp = gpaChange >= 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><Eye size={28} /> {t('observerMode')}</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="notif-wrapper">
            <button className="btn-icon notif-bell" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div className="notif-dropdown">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <h4 style={{ margin: 0 }}>{lang === 'ru' ? 'Уведомления' : 'Notifications'}</h4>
                  {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>{lang === 'ru' ? 'Прочитать все' : 'Mark all read'}</button>}
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`} onClick={() => markRead(n.id)}>
                    <span style={{ flex: 1 }}>{n.text}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.time}</span>
                    {!n.read && <span className="notif-dot"></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="parent-child-profile">
        <div className="child-avatar-big" style={{ borderColor: gpaUp ? '#00C9A7' : '#FF6B6B' }}>
          <svg viewBox="0 0 100 100" className="child-gpa-ring">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={gpaUp ? '#00C9A7' : '#FF6B6B'} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <span className="child-avatar-letter">{child.name.charAt(0)}</span>
        </div>
        <div className="child-profile-info">
          <h2>{child.name}</h2>
          <span className="child-class-label">{child.className} · {child.email}</span>
          <div className="child-quick-stats">
            <div className="cqs-item">
              <span className="cqs-value">{gpa.toFixed(1)}</span>
              <span className="cqs-label">GPA</span>
              <span className={`cqs-change ${gpaUp ? 'up' : 'down'}`}>
                {gpaUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(gpaChange).toFixed(1)}
              </span>
            </div>
            <div className="cqs-item">
              <span className="cqs-value">#{rank}</span>
              <span className="cqs-label">{t('classRank')}</span>
            </div>
            <div className="cqs-item">
              <span className="cqs-value">{child.attendance}%</span>
              <span className="cqs-label">{t('attendanceRate')}</span>
            </div>
            <div className="cqs-item">
              <span className="cqs-value">{child.achievements.length}</span>
              <span className="cqs-label">{t('achievements')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-two-col">
        <div className="chart-card">
          <h3>{lang === 'ru' ? 'Успеваемость по предметам' : 'Subject Performance'}</h3>
          <div className="sw-section">
            <div className="sw-group">
              <span className="sw-label good"><ArrowUpRight size={14} /> {lang === 'ru' ? 'Сильные предметы' : 'Strong Subjects'}</span>
              {strongSubjects.map(s => (
                <div key={s.id} className="sw-item">
                  <span>{lang === 'ru' ? s.name : s.nameEn}</span>
                  <div className="sw-bar-track"><div className="sw-bar-fill good" style={{ width: `${s.avg * 10}%` }}></div></div>
                  <span className="sw-score good">{s.avg.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="sw-group">
              <span className="sw-label weak"><ArrowDownRight size={14} /> {lang === 'ru' ? 'Нужно внимание' : 'Needs Attention'}</span>
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

        <div className="chart-card">
          <h3><Calendar size={18} /> {lang === 'ru' ? 'Ближайшие события' : 'Upcoming Events'}</h3>
          <div className="upcoming-events">
            {[
              { emoji: '📝', title: lang === 'ru' ? 'СОЧ по алгебре' : 'Algebra Exam', date: lang === 'ru' ? 'через 3 дня' : 'in 3 days', color: '#FF6B6B' },
              { emoji: '🏅', title: lang === 'ru' ? 'Олимпиада по физике' : 'Physics Olympiad', date: lang === 'ru' ? 'через 1 неделю' : 'in 1 week', color: '#FFD93D' },
              { emoji: '📅', title: lang === 'ru' ? 'Родительское собрание' : 'Parent Meeting', date: '5 ' + (lang === 'ru' ? 'апреля' : 'April'), color: '#6C63FF' },
              { emoji: '🎭', title: lang === 'ru' ? 'Школьный концерт' : 'School Concert', date: '12 ' + (lang === 'ru' ? 'апреля' : 'April'), color: '#00C9A7' },
            ].map((ev, i) => (
              <div key={i} className="event-item" style={{ borderLeftColor: ev.color }}>
                <span className="ev-emoji">{ev.emoji}</span>
                <div className="ev-info">
                  <span className="ev-title">{ev.title}</span>
                  <span className="ev-date"><Clock size={11} /> {ev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t('childProgress')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={quarterTrend}>
              <defs>
                <linearGradient id="parentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="quarter" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="avg" stroke="#FF6B6B" fill="url(#parentAreaGrad)" strokeWidth={3} dot={{ fill: '#FF6B6B', r: 6 }} activeDot={{ r: 8 }} />
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
              <Radar dataKey="avg" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card chat-card">
        <h3><MessageSquare size={20} /> {lang === 'ru' ? 'Написать классному руководителю' : 'Message Class Teacher'}</h3>
        <div className="chat-messages" style={{ maxHeight: '250px' }}>
          {messages.length === 0 && (
            <div className="chat-empty" style={{ padding: '20px 0' }}>
              <p>{lang === 'ru' ? 'Напишите сообщение учителю' : 'Write a message to the teacher'}</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.from === 'parent' ? 'user' : 'assistant'}`}>
              <div className="msg-content">
                {msg.text}
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={lang === 'ru' ? 'Ваше сообщение...' : 'Your message...'} />
          <button onClick={sendMessage} disabled={!message.trim()}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
