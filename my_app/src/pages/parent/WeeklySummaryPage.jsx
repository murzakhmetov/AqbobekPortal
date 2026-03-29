import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, calculateGPA, getSubjectAverages } from '../../services/bilimclassAPI';
import { askGroq, buildParentSummaryPrompt } from '../../services/groqAI';
import { CalendarClock, Loader, Sparkles, MessageSquare, Send, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';

export default function WeeklySummaryPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const child = getStudentById(user?.linkedStudentId || 's1');
  const gpa = calculateGPA(child);
  const subjectAvgs = getSubjectAverages(child);

  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [notes, setNotes] = useState([
    { id: 1, text: lang === 'ru' ? 'Обсудить с учителем физики' : 'Discuss with physics teacher', date: '2025-03-28' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [askingAI, setAskingAI] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const childData = {
        name: child.name,
        class: child.className,
        gpa: gpa.toFixed(1),
        attendance: child.attendance,
        subjects: subjectAvgs.map(s => ({ name: s.name, avg: s.avg })),
        achievements: child.achievements.length,
        weakSubjects: subjectAvgs.filter(s => s.avg < 5).map(s => s.name),
        strongSubjects: subjectAvgs.filter(s => s.avg > 8).map(s => s.name),
      };
      const prompt = buildParentSummaryPrompt(childData, lang);
      const result = await askGroq(prompt, `Сделай еженедельную сводку для родителя ученика ${child.name}. Будь дружелюбным и конкретным.`);
      setSummary(result);
    } catch {
      setSummary(lang === 'ru' ? 'Ошибка генерации сводки.' : 'Error generating summary.');
    }
    setLoading(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), text: newNote, date: new Date().toISOString().split('T')[0] }]);
    setNewNote('');
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const askQuestion = async () => {
    if (!newQuestion.trim() || askingAI) return;
    const q = newQuestion;
    setNewQuestion('');
    setQuestions(prev => [...prev, { role: 'parent', content: q }]);
    setAskingAI(true);
    try {
      const prompt = `Ты — AI-помощник для родителей в школе Aqbobek Lyceum. ${lang === 'ru' ? 'Отвечай на русском.' : 'Reply in English.'}
Ребёнок: ${child.name}, класс ${child.className}, GPA: ${gpa.toFixed(1)}, посещаемость: ${child.attendance}%.
Помоги родителю с его вопросом.`;
      const reply = await askGroq(prompt, q);
      setQuestions(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setQuestions(prev => [...prev, { role: 'ai', content: lang === 'ru' ? 'Ошибка. Попробуйте ещё раз.' : 'Error. Try again.' }]);
    }
    setAskingAI(false);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><CalendarClock size={28} /> {t('weeklySummary')}</h1>
        <p>{child.name} — {child.className}</p>
      </div>

      <div className="chart-card">
        <div className="report-actions">
          <button className="btn-primary" onClick={generateSummary} disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> {t('analyzing')}</> : <><Sparkles size={16} /> {t('weeklyAISummary')}</>}
          </button>
        </div>

        {summary && (
          <>
            <div className="report-content">
              {summary.split('\n').map((line, i) => {
                if (line.startsWith('##')) return <h3 key={i}>{line.replace(/##/g, '').trim()}</h3>;
                if (line.startsWith('#')) return <h2 key={i}>{line.replace(/#/g, '').trim()}</h2>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i}>{line.replace(/^[-*]\s/, '')}</li>;
                if (line.trim()) return <p key={i}>{line}</p>;
                return <br key={i} />;
              })}
            </div>
            <div className="feedback-row">
              <span>{lang === 'ru' ? 'Была ли сводка полезной?' : 'Was this summary helpful?'}</span>
              <button className={`feedback-btn ${feedback === 'up' ? 'active-green' : ''}`} onClick={() => setFeedback('up')}>
                <ThumbsUp size={16} />
              </button>
              <button className={`feedback-btn ${feedback === 'down' ? 'active-red' : ''}`} onClick={() => setFeedback('down')}>
                <ThumbsDown size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Parent Notes */}
      <div className="chart-card">
        <h3><BookOpen size={20} /> {lang === 'ru' ? 'Мои заметки' : 'My Notes'}</h3>
        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note-item">
              <span className="note-text">{note.text}</span>
              <span className="note-date">{note.date}</span>
              <button className="note-delete" onClick={() => deleteNote(note.id)}>×</button>
            </div>
          ))}
        </div>
        <div className="goal-input-row" style={{ marginTop: '12px' }}>
          <input
            className="form-input"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
            placeholder={lang === 'ru' ? 'Добавить заметку...' : 'Add a note...'}
          />
          <button className="btn-primary btn-sm" onClick={addNote} disabled={!newNote.trim()}>
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Ask AI */}
      <div className="chart-card chat-card">
        <h3><MessageSquare size={20} /> {lang === 'ru' ? 'Задать вопрос об учёбе ребёнка' : 'Ask about your child\'s studies'}</h3>
        
        <div className="quick-questions">
          {[
            lang === 'ru' ? 'Как улучшить успеваемость?' : 'How to improve grades?',
            lang === 'ru' ? 'Нужен ли репетитор?' : 'Does my child need a tutor?',
            lang === 'ru' ? 'Как мотивировать ребёнка?' : 'How to motivate my child?',
          ].map((q, i) => (
            <button key={i} className="quick-q-btn" onClick={() => { setNewQuestion(q); }}>
              {q}
            </button>
          ))}
        </div>

        <div className="chat-messages" style={{ maxHeight: '300px' }}>
          {questions.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role === 'parent' ? 'user' : 'assistant'}`}>
              <div className="msg-content">{msg.content}</div>
            </div>
          ))}
          {askingAI && <div className="chat-msg assistant"><div className="msg-content typing"><Loader size={16} className="spin" /> {t('analyzing')}</div></div>}
        </div>
        <div className="chat-input">
          <input
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askQuestion()}
            placeholder={lang === 'ru' ? 'Ваш вопрос...' : 'Your question...'}
          />
          <button onClick={askQuestion} disabled={askingAI || !newQuestion.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
