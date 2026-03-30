import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById, getSubjects } from '../../services/bilimclassAPI';
import { useState } from 'react';
import { X, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function GradesPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const student = getStudentById(user?.studentId || 's1');
  const subjects = getSubjects();
  const [selectedQuarter, setSelectedQuarter] = useState('q3');
  const [selectedSubject, setSelectedSubject] = useState(null);

  const getGradeColor = (score, max) => {
    const pct = score / max;
    if (pct >= 0.85) return '#00C9A7';
    if (pct >= 0.7) return '#6C63FF';
    if (pct >= 0.5) return '#FFD93D';
    return '#FF6B6B';
  };

  const getTrend = (subId) => {
    const q1 = student.grades[subId]?.q1?.quarterGrade || 0;
    const current = student.grades[subId]?.[selectedQuarter]?.quarterGrade || 0;
    if (current > q1 + 0.5) return 'up';
    if (current < q1 - 0.5) return 'down';
    return 'stable';
  };

  const handleSubjectClick = (sub) => {
    setSelectedSubject(sub);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>{t('grades')}</h1>
        <div className="quarter-tabs">
          {[1,2,3,4].map(q => (
            <button
              key={q}
              className={`quarter-tab ${selectedQuarter === `q${q}` ? 'active' : ''}`}
              onClick={() => setSelectedQuarter(`q${q}`)}
            >
              {t('quarter')} {q}
            </button>
          ))}
        </div>
      </div>

      <div className="grades-table-card">
        <table className="grades-table">
          <thead>
            <tr>
              <th>{t('subject')}</th>
              <th>{t('sor')} 1</th>
              <th>{t('sor')} 2</th>
              <th>{t('sor')} 3</th>
              <th>{t('soch')}</th>
              <th>{t('average')}</th>
              <th>{lang === 'ru' ? 'Тренд' : 'Trend'}</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(sub => {
              const qData = student.grades[sub.id]?.[selectedQuarter];
              if (!qData) return null;
              const trend = getTrend(sub.id);
              return (
                <tr key={sub.id} className="grade-row clickable" onClick={() => handleSubjectClick(sub)}>
                  <td className="subject-name">
                    <span className="subject-dot" style={{ background: getGradeColor(qData.quarterGrade, 10) }}></span>
                    {lang === 'ru' ? sub.name : sub.nameEn}
                  </td>
                  {qData.sor.map((s, i) => (
                    <td key={i}>
                      <span className="grade-badge" style={{ color: getGradeColor(s.score, s.maxScore) }}>
                        {s.score}/{s.maxScore}
                      </span>
                    </td>
                  ))}
                  <td>
                    <span className="grade-badge soch" style={{ color: getGradeColor(qData.soch.score, qData.soch.maxScore) }}>
                      {qData.soch.score}/{qData.soch.maxScore}
                    </span>
                  </td>
                  <td>
                    <span className="grade-final" style={{ background: getGradeColor(qData.quarterGrade, 10) }}>
                      {qData.quarterGrade}
                    </span>
                  </td>
                  <td>
                    {trend === 'up' && <TrendingUp size={18} color="#00C9A7" />}
                    {trend === 'down' && <TrendingDown size={18} color="#FF6B6B" />}
                    {trend === 'stable' && <Minus size={18} color="#888" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang === 'ru' ? selectedSubject.name : selectedSubject.nameEn}</h2>
              <button className="modal-close" onClick={() => setSelectedSubject(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <h3 style={{ marginBottom: '16px', fontSize: '15px', color: '#888' }}>
                {lang === 'ru' ? 'Все четверти' : 'All quarters'}
              </h3>
              {[1,2,3,4].map(q => {
                const qData = student.grades[selectedSubject.id]?.[`q${q}`];
                if (!qData) return null;
                return (
                  <div key={q} className="quarter-detail">
                    <div className="quarter-detail-header">
                      <span className="quarter-label">{t('quarter')} {q}</span>
                      <span className="grade-final" style={{ background: getGradeColor(qData.quarterGrade, 10) }}>
                        {qData.quarterGrade}
                      </span>
                    </div>
                    <div className="quarter-scores">
                      {qData.sor.map((s, i) => (
                        <div key={i} className="score-item">
                          <span className="score-label">{t('sor')} {i + 1}</span>
                          <span className="score-topic">{s.topic}</span>
                          <span style={{ color: getGradeColor(s.score, s.maxScore), fontWeight: 600 }}>
                            {s.score}/{s.maxScore}
                          </span>
                        </div>
                      ))}
                      <div className="score-item soch-item">
                        <span className="score-label">{t('soch')}</span>
                        <span></span>
                        <span style={{ color: getGradeColor(qData.soch.score, qData.soch.maxScore), fontWeight: 700 }}>
                          {qData.soch.score}/{qData.soch.maxScore}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
