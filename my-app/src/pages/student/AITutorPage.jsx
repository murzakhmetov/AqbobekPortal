import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, calculateGPA, getSubjectAverages } from '../../services/bilimclassAPI';
import { askGroq } from '../../services/groqAI';
import { Sparkles, Send, Loader, AlertTriangle, CheckCircle, TrendingDown, BookOpen, Lightbulb, MessageSquare, Zap } from 'lucide-react';

export default function AITutorPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const student = getStudentById(user?.studentId || 's1');
  const gpa = calculateGPA(student);
  const subjectAvgs = getSubjectAverages(student);
  const chatRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisRun, setAnalysisRun] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  const weakSubjects = subjectAvgs.filter(s => s.avg < 5);
  const midSubjects = subjectAvgs.filter(s => s.avg >= 5 && s.avg < 7);
  const strongSubjects = subjectAvgs.filter(s => s.avg >= 8);

  const riskScore = weakSubjects.length * 30 + midSubjects.length * 10;
  const riskLevel = riskScore > 50 ? 'high' : riskScore > 20 ? 'medium' : 'low';

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysisRun(true);
    try {
      const context = `Ученик: ${student.name}, класс ${student.className}, GPA: ${gpa.toFixed(1)}.
Слабые предметы (ниже 5): ${weakSubjects.map(s => `${s.name} (${s.avg})`).join(', ') || 'нет'}.
Средние (5-7): ${midSubjects.map(s => `${s.name} (${s.avg})`).join(', ') || 'нет'}.
Сильные (выше 8): ${strongSubjects.map(s => `${s.name} (${s.avg})`).join(', ') || 'нет'}.
Посещаемость: ${student.attendance}%.`;

      const prompt = lang === 'ru'
        ? `Проанализируй успеваемость ученика и дай конкретные рекомендации. Укажи: 1) Риски по предметам 2) Рекомендации 3) Стратегию подготовки к СОЧ. Будь конкретным.`
        : `Analyze student performance and give specific recommendations. Include: 1) Subject risks 2) Recommendations 3) Exam preparation strategy. Be specific.`;

      const result = await askGroq(context, prompt);
      setMessages(prev => [...prev,
        { role: 'system', content: lang === 'ru' ? '🔍 Запущен полный анализ успеваемости...' : '🔍 Running full performance analysis...' },
        { role: 'assistant', content: result }
      ]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ru' ? 'Ошибка анализа.' : 'Analysis error.' }]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const context = `Ты — AI-тьютор для ученика ${student.name}, класс ${student.className}, GPA: ${gpa.toFixed(1)}.
${lang === 'ru' ? 'Отвечай на русском. Будь дружелюбным и конкретным.' : 'Reply in English. Be friendly and specific.'}
Слабые предметы: ${weakSubjects.map(s => `${s.name}(${s.avg})`).join(', ') || 'нет'}.
Сильные предметы: ${strongSubjects.map(s => `${s.name}(${s.avg})`).join(', ') || 'нет'}.`;

      const result = await askGroq(context, msg);
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'ru' ? 'Ошибка. Попробуйте ещё раз.' : 'Error. Try again.' }]);
    }
    setLoading(false);
  };

  const quickQuestions = lang === 'ru' ? [
    'Как подготовиться к СОЧ по физике?',
    'Составь мне план обучения на неделю',
    'Какие темы мне повторить?',
    'Как улучшить оценку по алгебре?',
    'Посоветуй ресурсы для подготовки',
    'Объясни тему: квадратные уравнения',
  ] : [
    'How to prepare for physics exam?',
    'Create a weekly study plan for me',
    'Which topics should I review?',
    'How to improve my algebra grade?',
    'Recommend study resources',
    'Explain: quadratic equations',
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><Sparkles size={28} /> {t('aiTutor')}</h1>
      </div>

      {/* Risk Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': riskLevel === 'high' ? '#FF6B6B' : riskLevel === 'medium' ? '#FFD93D' : '#00C9A7' }}>
          <div className="stat-icon">
            {riskLevel === 'low' ? <CheckCircle /> : <AlertTriangle />}
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ color: riskLevel === 'high' ? '#FF6B6B' : riskLevel === 'medium' ? '#FFD93D' : '#00C9A7' }}>
              {riskLevel === 'high' ? (lang === 'ru' ? 'Высокий' : 'High') : riskLevel === 'medium' ? (lang === 'ru' ? 'Средний' : 'Medium') : (lang === 'ru' ? 'Низкий' : 'Low')}
            </span>
            <span className="stat-label">{t('riskOfFailing')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FF6B6B' }}>
          <div className="stat-icon"><TrendingDown /></div>
          <div className="stat-info">
            <span className="stat-value">{weakSubjects.length}</span>
            <span className="stat-label">{t('weakSubjects')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><BookOpen /></div>
          <div className="stat-info">
            <span className="stat-value">{strongSubjects.length}</span>
            <span className="stat-label">{t('strongSubjects')}</span>
          </div>
        </div>
      </div>

      {/* Subject Risk Breakdown */}
      {(weakSubjects.length > 0 || midSubjects.length > 0) && (
        <div className="chart-card risk-alert-card">
          <h3><AlertTriangle size={18} color="#FF6B6B" /> {lang === 'ru' ? 'Предметы в зоне риска' : 'At-Risk Subjects'}</h3>
          <div className="risk-subjects-breakdown">
            {weakSubjects.map(s => (
              <div key={s.id} className="risk-subject-item high">
                <span className="risk-subj-name">{lang === 'ru' ? s.name : s.nameEn}</span>
                <div className="risk-bar">
                  <div className="risk-fill" style={{ width: `${s.avg * 10}%`, background: '#FF6B6B' }}></div>
                </div>
                <span className="risk-pct" style={{ color: '#FF6B6B' }}>{s.avg.toFixed(1)}</span>
              </div>
            ))}
            {midSubjects.map(s => (
              <div key={s.id} className="risk-subject-item medium">
                <span className="risk-subj-name">{lang === 'ru' ? s.name : s.nameEn}</span>
                <div className="risk-bar">
                  <div className="risk-fill" style={{ width: `${s.avg * 10}%`, background: '#FFD93D' }}></div>
                </div>
                <span className="risk-pct" style={{ color: '#FFD93D' }}>{s.avg.toFixed(1)}</span>
              </div>
            ))}
          </div>
          {!analysisRun && (
            <button className="btn-primary" onClick={runAnalysis} disabled={loading} style={{ marginTop: '16px' }}>
              {loading ? <><Loader size={16} className="spin" /> {t('analyzing')}</> : <><Zap size={16} /> {lang === 'ru' ? 'Запустить AI-анализ' : 'Run AI Analysis'}</>}
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="quarter-tabs" style={{ marginBottom: '16px' }}>
        <button className={`quarter-tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>
          <Sparkles size={14} /> {lang === 'ru' ? 'AI-Анализ' : 'AI Analysis'}
        </button>
        <button className={`quarter-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
          <MessageSquare size={14} /> {lang === 'ru' ? 'Чат с тьютором' : 'Chat with Tutor'}
        </button>
        <button className={`quarter-tab ${activeTab === 'tips' ? 'active' : ''}`} onClick={() => setActiveTab('tips')}>
          <Lightbulb size={14} /> {lang === 'ru' ? 'Советы' : 'Study Tips'}
        </button>
      </div>

      {activeTab === 'tips' && (
        <div className="chart-card">
          <h3><Lightbulb size={20} color="#FFD93D" /> {lang === 'ru' ? 'Советы по учёбе' : 'Study Tips'}</h3>
          <div className="tips-grid">
            {(lang === 'ru' ? [
              { icon: '📚', title: 'Метод Помодоро', desc: '25 минут учёбы, 5 минут отдыха. Повторить 4 раза.' },
              { icon: '🧠', title: 'Интервальное повторение', desc: 'Повторяйте через 1 день, 3 дня, 7 дней.' },
              { icon: '✍️', title: 'Активное чтение', desc: 'Конспектируйте, задавайте вопросы, пересказывайте.' },
              { icon: '📝', title: 'Практика задач', desc: 'Решайте минимум 5 задач из каждой слабой темы.' },
              { icon: '💪', title: 'Не откладывайте', desc: 'Начните с самой сложной задачи, когда энергия максимальна.' },
              { icon: '🎯', title: 'Ставьте микроцели', desc: 'Разбивайте большие задачи на маленькие шаги.' },
            ] : [
              { icon: '📚', title: 'Pomodoro Method', desc: '25 min study, 5 min break. Repeat 4 times.' },
              { icon: '🧠', title: 'Spaced Repetition', desc: 'Review after 1 day, 3 days, 7 days.' },
              { icon: '✍️', title: 'Active Reading', desc: 'Take notes, ask questions, summarize.' },
              { icon: '📝', title: 'Practice Problems', desc: 'Solve at least 5 problems from each weak topic.' },
              { icon: '💪', title: "Don't Procrastinate", desc: 'Start with hardest task when energy is highest.' },
              { icon: '🎯', title: 'Set Micro-Goals', desc: 'Break big tasks into small achievable steps.' },
            ]).map((tip, i) => (
              <div key={i} className="tip-card">
                <span className="tip-icon">{tip.icon}</span>
                <div>
                  <strong>{tip.title}</strong>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'analysis' || activeTab === 'chat') && (
        <div className="chart-card chat-card">
          <h3><MessageSquare size={20} /> {lang === 'ru' ? 'Чат с AI-тьютором' : 'AI Tutor Chat'}</h3>

          {/* Quick questions */}
          <div className="quick-questions">
            {quickQuestions.map((q, i) => (
              <button key={i} className="quick-q-btn" onClick={() => { setInput(q); setActiveTab('chat'); }}>
                {q}
              </button>
            ))}
          </div>

          <div className="chat-messages" ref={chatRef}>
            {messages.length === 0 && (
              <div className="chat-empty">
                <Sparkles size={48} />
                <h3>{lang === 'ru' ? 'Задайте вопрос или запустите анализ' : 'Ask a question or run analysis'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
                  {lang === 'ru' ? 'AI-тьютор знает ваши оценки и может давать персональные советы' : 'AI tutor knows your grades and can give personalized advice'}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="msg-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg assistant">
                <div className="msg-content typing">
                  <Loader size={16} className="spin" /> {t('analyzing')}
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={t('askAI')}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
