import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentsByClass, getAtRiskStudents, calculateGPA, getSubjects, getSubjectAverages } from '../../services/bilimclassAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Users, TrendingDown, TrendingUp, BookOpen, MessageSquare, Send, Plus, X, Star, Award } from 'lucide-react';

export default function TeacherDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const classId = user?.classId || 'c10a';
  const students = getStudentsByClass(classId);
  const atRisk = getAtRiskStudents(classId);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState({});
  const [noteInput, setNoteInput] = useState('');
  const [showAddAch, setShowAddAch] = useState(null);
  const [achTitle, setAchTitle] = useState('');
  const [addedAchs, setAddedAchs] = useState({});

  const classAvg = students.reduce((sum, s) => sum + calculateGPA(s), 0) / students.length;

  const subjectStats = getSubjects().map(sub => {
    const avgs = students.map(s => {
      const subAvgs = getSubjectAverages(s);
      return subAvgs.find(sa => sa.id === sub.id)?.avg || 0;
    });
    const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
    return { name: (lang === 'ru' ? sub.name : sub.nameEn).slice(0, 8), avg: Math.round(avg * 10) / 10 };
  });

  const addNote = (studentId) => {
    if (!noteInput.trim()) return;
    setStudentNotes(prev => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), { text: noteInput, date: new Date().toLocaleDateString() }]
    }));
    setNoteInput('');
  };

  const addAchievement = (studentId) => {
    if (!achTitle.trim()) return;
    setAddedAchs(prev => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), { title: achTitle, date: new Date().toLocaleDateString() }]
    }));
    setAchTitle('');
    setShowAddAch(null);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('dashboard')}</h1>
        <p>{lang === 'ru' ? `Класс: ${classId === 'c10a' ? '10А' : classId === 'c10b' ? '10Б' : '11А'}` : `Class: ${classId === 'c10a' ? '10A' : classId === 'c10b' ? '10B' : '11A'}`}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#6C63FF' }}>
          <div className="stat-icon"><Users /></div>
          <div className="stat-info">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">{lang === 'ru' ? 'Учеников' : 'Students'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><TrendingUp /></div>
          <div className="stat-info">
            <span className="stat-value">{classAvg.toFixed(1)}</span>
            <span className="stat-label">{lang === 'ru' ? 'Средний GPA' : 'Average GPA'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FF6B6B' }}>
          <div className="stat-icon"><AlertTriangle /></div>
          <div className="stat-info">
            <span className="stat-value">{atRisk.length}</span>
            <span className="stat-label">{t('studentsAtRisk')}</span>
          </div>
        </div>
      </div>

      {atRisk.length > 0 && (
        <div className="chart-card risk-alert-card">
          <h3><AlertTriangle size={20} color="#FF6B6B" /> {t('earlyWarning')}</h3>
          <div className="risk-students-list">
            {atRisk.map(s => (
              <div key={s.id} className="risk-student-item">
                <div className="risk-student-info">
                  <span className="risk-student-name">{s.name}</span>
                  <span className="risk-student-gpa">GPA: {s.gpa.toFixed(1)}</span>
                </div>
                <div className="risk-subjects-tags">
                  {s.riskSubjects.map((sub, i) => (
                    <span key={i} className={`risk-tag ${s.riskLevel}`}>{sub}</span>
                  ))}
                </div>
                <span className={`risk-level-badge ${s.riskLevel}`}>
                  <TrendingDown size={14} /> {s.riskLevel === 'high' ? (lang === 'ru' ? 'Высокий' : 'High') : (lang === 'ru' ? 'Средний' : 'Medium')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students list with interactive features */}
      <div className="chart-card">
        <h3><Users size={20} /> {lang === 'ru' ? 'Ученики класса' : 'Class Students'}</h3>
        <div className="students-interactive-list">
          {students.map(s => {
            const gpa = calculateGPA(s);
            const isSelected = selectedStudent?.id === s.id;
            return (
              <div key={s.id}>
                <div className={`student-row clickable ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedStudent(isSelected ? null : s)}>
                  <div className="student-avatar-sm">{s.name.charAt(0)}</div>
                  <div className="student-row-info">
                    <span className="student-row-name">{s.name}</span>
                    <span className="student-row-gpa">GPA: {gpa.toFixed(1)}</span>
                  </div>
                  <div className="student-row-actions">
                    <span className="attendance-badge">{s.attendance}%</span>
                    <button className="btn-icon-sm" onClick={e => { e.stopPropagation(); setShowAddAch(s.id); }} title={lang === 'ru' ? 'Добавить достижение' : 'Add achievement'}>
                      <Award size={14} />
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="student-expanded">
                    {/* Student achievements added by teacher */}
                    {(addedAchs[s.id] || []).length > 0 && (
                      <div className="teacher-added-items">
                        <span className="mini-label"><Star size={12} /> {lang === 'ru' ? 'Достижения (от учителя)' : 'Achievements (by teacher)'}:</span>
                        {addedAchs[s.id].map((a, i) => (
                          <span key={i} className="mini-tag">{a.title} ({a.date})</span>
                        ))}
                      </div>
                    )}
                    {/* Notes */}
                    <div className="teacher-notes-section">
                      <span className="mini-label"><MessageSquare size={12} /> {lang === 'ru' ? 'Заметки' : 'Notes'}:</span>
                      {(studentNotes[s.id] || []).map((n, i) => (
                        <div key={i} className="teacher-note">{n.text} <span className="note-date">({n.date})</span></div>
                      ))}
                      <div className="goal-input-row" style={{ marginTop: '8px' }}>
                        <input
                          className="form-input form-input-sm"
                          value={selectedStudent?.id === s.id ? noteInput : ''}
                          onChange={e => setNoteInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addNote(s.id)}
                          placeholder={lang === 'ru' ? 'Заметка о ученике...' : 'Note about student...'}
                        />
                        <button className="btn-primary btn-sm" onClick={() => addNote(s.id)}><Send size={12} /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Achievement Mini-Modal */}
      {showAddAch && (
        <div className="modal-overlay" onClick={() => setShowAddAch(null)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang === 'ru' ? 'Фиксация достижения' : 'Record Achievement'}</h2>
              <button className="modal-close" onClick={() => setShowAddAch(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>{lang === 'ru' ? 'Достижение' : 'Achievement'}</label>
                <input
                  className="form-input"
                  value={achTitle}
                  onChange={e => setAchTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAchievement(showAddAch)}
                  placeholder={lang === 'ru' ? 'например: Победил в дебатах' : 'e.g. Won debate tournament'}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddAch(null)}>{t('cancel')}</button>
              <button className="btn-primary" onClick={() => addAchievement(showAddAch)} disabled={!achTitle.trim()}>
                <Award size={16} /> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chart-card">
        <h3>{t('subjectPerformance')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" domain={[0, 10]} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
            <Bar dataKey="avg" fill="url(#teacherGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="teacherGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C9A7" />
                <stop offset="100%" stopColor="#006B5A" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
