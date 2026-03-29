import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentsByClass, getAtRiskStudents, calculateGPA, getSubjects, getSubjectAverages } from '../../services/bilimclassAPI';
import { askGroq } from '../../services/groqAI';
import { AlertTriangle, User, TrendingDown, Send, Loader, Sparkles, ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';

export default function RiskAnalyticsPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [classFilter, setClassFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [aiAdvice, setAiAdvice] = useState({});
  const [loadingAdvice, setLoadingAdvice] = useState(null);

  const classes = ['c10a', 'c10b', 'c11a'];
  const classLabels = { c10a: '10A', c10b: '10Б', c11a: '11A' };
  const allRisk = classes.flatMap(cls => getAtRiskStudents(cls));
  const filteredRisk = classFilter === 'all' ? allRisk : allRisk.filter(s => s.className === classLabels[classFilter]);

  const highRisk = filteredRisk.filter(s => s.riskLevel === 'high');
  const mediumRisk = filteredRisk.filter(s => s.riskLevel === 'medium');

  const getAdvice = async (student) => {
    if (aiAdvice[student.id]) return;
    setLoadingAdvice(student.id);
    try {
      const prompt = lang === 'ru'
        ? `Ученик ${student.name}, GPA: ${student.gpa.toFixed(1)}, слабые предметы: ${student.riskSubjects.join(', ')}. Уровень риска: ${student.riskLevel}. Дай конкретные рекомендации учителю: что делать, как помочь, какие меры предпринять. Максимум 5 пунктов.`
        : `Student ${student.name}, GPA: ${student.gpa.toFixed(1)}, weak subjects: ${student.riskSubjects.join(', ')}. Risk level: ${student.riskLevel}. Give specific recommendations to the teacher: what to do, how to help. Max 5 points.`;

      const result = await askGroq('Ты — ассистент учителя в школе Aqbobek Lyceum.', prompt);
      setAiAdvice(prev => ({ ...prev, [student.id]: result }));
    } catch {
      setAiAdvice(prev => ({ ...prev, [student.id]: lang === 'ru' ? 'Ошибка генерации рекомендации.' : 'Error generating advice.' }));
    }
    setLoadingAdvice(null);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><AlertTriangle size={28} /> {t('riskAnalytics')}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#FF6B6B' }}>
          <div className="stat-icon"><AlertTriangle /></div>
          <div className="stat-info">
            <span className="stat-value">{highRisk.length}</span>
            <span className="stat-label">{lang === 'ru' ? 'Высокий риск' : 'High Risk'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FFD93D' }}>
          <div className="stat-icon"><TrendingDown /></div>
          <div className="stat-info">
            <span className="stat-value">{mediumRisk.length}</span>
            <span className="stat-label">{lang === 'ru' ? 'Средний риск' : 'Medium Risk'}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><User /></div>
          <div className="stat-info">
            <span className="stat-value">{filteredRisk.length}</span>
            <span className="stat-label">{lang === 'ru' ? 'Всего в зоне' : 'Total at Risk'}</span>
          </div>
        </div>
      </div>

      {/* Class filter */}
      <div className="quarter-tabs" style={{ marginBottom: '16px' }}>
        <button className={`quarter-tab ${classFilter === 'all' ? 'active' : ''}`} onClick={() => setClassFilter('all')}>
          {lang === 'ru' ? 'Все классы' : 'All Classes'}
        </button>
        {classes.map(cls => (
          <button key={cls} className={`quarter-tab ${classFilter === cls ? 'active' : ''}`} onClick={() => setClassFilter(cls)}>
            {classLabels[cls]}
          </button>
        ))}
      </div>

      {/* Risk Cards */}
      <div className="risk-cards-grid">
        {filteredRisk.map(student => {
          const isExpanded = selectedStudent?.id === student.id;
          return (
            <div key={student.id} className={`chart-card risk-student-card ${student.riskLevel}`}>
              <div className="risk-card-header clickable" onClick={() => setSelectedStudent(isExpanded ? null : student)}>
                <div className="risk-avatar"><User size={20} /></div>
                <div>
                  <h3>{student.name}</h3>
                  <span className="risk-student-class">{student.className}</span>
                </div>
                <span className={`risk-level-badge ${student.riskLevel}`} style={{ marginLeft: 'auto' }}>
                  <AlertTriangle size={12} />
                  {student.riskLevel === 'high' ? (lang === 'ru' ? 'Высокий' : 'High') : (lang === 'ru' ? 'Средний' : 'Medium')}
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              <div className="risk-details">
                <div className="risk-detail-row">
                  <span>GPA</span>
                  <span className="risk-detail-value" style={{ color: student.gpa < 5 ? '#FF6B6B' : '#FFD93D' }}>{student.gpa.toFixed(1)}</span>
                </div>
                <div className="risk-detail-row">
                  <span>{lang === 'ru' ? 'Предмет.' : 'Subjects'}</span>
                  <span className="risk-detail-value">{student.riskSubjects.length}</span>
                </div>
              </div>

              <div className="risk-subjects-section">
                <h4><BookOpen size={14} /> {lang === 'ru' ? 'Проблемные предметы' : 'Problem Subjects'}</h4>
                {student.riskSubjects.map((sub, i) => (
                  <div key={i} className="risk-subject-row">
                    <span>{sub}</span>
                    <div className="risk-bar-small">
                      <div className="risk-fill" style={{ width: `${Math.random() * 40 + 10}%`, background: student.riskLevel === 'high' ? '#FF6B6B' : '#FFD93D' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Advice */}
              {isExpanded && (
                <div className="ai-advice-section">
                  {!aiAdvice[student.id] ? (
                    <button className="btn-primary btn-sm" onClick={() => getAdvice(student)} disabled={loadingAdvice === student.id} style={{ marginTop: '12px' }}>
                      {loadingAdvice === student.id ? <><Loader size={14} className="spin" /> {t('analyzing')}</> : <><Sparkles size={14} /> {lang === 'ru' ? 'Получить AI-рекомендации' : 'Get AI Recommendations'}</>}
                    </button>
                  ) : (
                    <div className="ai-result" style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                        <Sparkles size={12} /> {lang === 'ru' ? 'Рекомендации AI' : 'AI Recommendations'}
                      </span>
                      {aiAdvice[student.id].split('\n').map((line, i) => {
                        if (line.trim()) return <p key={i}>{line}</p>;
                        return null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRisk.length === 0 && (
        <div className="chart-card">
          <div className="empty-state">
            <span className="emoji">✅</span>
            <h3>{lang === 'ru' ? 'Учеников в зоне риска нет!' : 'No students at risk!'}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
