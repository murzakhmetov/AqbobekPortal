import { useState, useMemo } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { generateSchedule, handleTeacherSick, DAYS } from '../../services/scheduleAlgorithm';
import { getTeachers, getClasses } from '../../services/bilimclassAPI';
import { CalendarDays, RefreshCw, AlertTriangle, CheckCircle, UserX, Zap } from 'lucide-react';

const DAY_LABELS = {
  ru: { monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср', thursday: 'Чт', friday: 'Пт', saturday: 'Сб' },
  en: { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' },
};

export default function ScheduleManagerPage() {
  const { t, lang } = useLang();
  const teachers = getTeachers();
  const classes = getClasses();
  
  const [scheduleData, setScheduleData] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [selectedClass, setSelectedClass] = useState('c10a');
  const [sickTeacher, setSickTeacher] = useState('');
  const [replacements, setReplacements] = useState([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateSchedule();
      setScheduleData(result.schedule);
      setConflicts(result.conflicts);
      setReplacements([]);
      setGenerating(false);
    }, 500);
  };

  const handleSickTeacher = () => {
    if (!sickTeacher || !scheduleData) return;
    const result = handleTeacherSick(scheduleData, sickTeacher);
    setScheduleData(result.schedule);
    setReplacements(result.replacements);
  };

  const currentSchedule = scheduleData?.[selectedClass];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><CalendarDays size={28} /> {t('scheduleManager')}</h1>
        <div className="schedule-actions">
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            <RefreshCw size={16} className={generating ? 'spin' : ''} />
            {generating ? (lang === 'ru' ? 'Генерация...' : 'Generating...') : t('generateSchedule')}
          </button>
        </div>
      </div>

      {/* Class selector */}
      <div className="class-tabs">
        {classes.map(cls => (
          <button
            key={cls.id}
            className={`quarter-tab ${selectedClass === cls.id ? 'active' : ''}`}
            onClick={() => setSelectedClass(cls.id)}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Sick teacher handler */}
      {scheduleData && (
        <div className="chart-card sick-teacher-card">
          <h3><UserX size={20} /> {t('teacherSick')}</h3>
          <div className="sick-teacher-form">
            <select value={sickTeacher} onChange={e => setSickTeacher(e.target.value)} className="select-input">
              <option value="">{lang === 'ru' ? 'Выберите учителя' : 'Select teacher'}</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{lang === 'ru' ? t.name : t.nameEn}</option>
              ))}
            </select>
            <button className="btn-danger" onClick={handleSickTeacher} disabled={!sickTeacher}>
              <Zap size={16} /> {t('autoReplace')}
            </button>
          </div>
          
          {replacements.length > 0 && (
            <div className="replacements-list">
              <h4>{lang === 'ru' ? 'Замены:' : 'Replacements:'}</h4>
              {replacements.map((r, i) => (
                <div key={i} className="replacement-item">
                  <span>{DAY_LABELS[lang][r.day]} {lang === 'ru' ? 'урок' : 'period'} {r.period}</span>
                  <span>{r.subject}</span>
                  <span className="replacement-arrow">{r.original} → {r.replacement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="chart-card conflicts-card">
          <h3><AlertTriangle size={20} color="#FF6B6B" /> {lang === 'ru' ? 'Конфликты' : 'Conflicts'} ({conflicts.length})</h3>
          {conflicts.map((c, i) => (
            <div key={i} className="conflict-item">
              <AlertTriangle size={14} color="#FF6B6B" />
              <span>{c.teacher} — {DAY_LABELS[lang][c.day]} {lang === 'ru' ? 'урок' : 'period'} {c.period} ({c.classes.join(', ')})</span>
            </div>
          ))}
        </div>
      )}

      {conflicts.length === 0 && scheduleData && (
        <div className="no-conflicts-badge">
          <CheckCircle size={16} /> {t('noConflicts')}
        </div>
      )}

      {/* Schedule Grid */}
      {currentSchedule ? (
        <div className="schedule-grid-card chart-card">
          <div className="schedule-grid">
            <div className="schedule-header-cell"></div>
            {DAYS.map(day => (
              <div key={day} className="schedule-header-cell">{DAY_LABELS[lang][day]}</div>
            ))}
            
            {[1,2,3,4,5,6,7].map(period => (
              <>
                <div key={`p${period}`} className="schedule-period-cell">{period}</div>
                {DAYS.map(day => {
                  const slot = currentSchedule[day]?.[period];
                  if (!slot) return <div key={`${day}-${period}`} className="schedule-cell empty"></div>;
                  return (
                    <div key={`${day}-${period}`} className={`schedule-cell ${slot.isReplacement ? 'replacement' : ''} ${slot.isCancelled ? 'cancelled' : ''}`}>
                      <span className="cell-subject">{lang === 'ru' ? slot.subjectName : slot.subjectNameEn}</span>
                      <span className="cell-teacher">{lang === 'ru' ? slot.teacherName : slot.teacherNameEn}</span>
                      <span className="cell-room">{slot.roomName}</span>
                      {slot.isReplacement && <span className="cell-badge replace">↻</span>}
                      {slot.isCancelled && <span className="cell-badge cancel">✕</span>}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      ) : (
        <div className="chart-card">
          <div className="empty-state">
            <CalendarDays size={48} />
            <h3>{lang === 'ru' ? 'Нажмите "Сгенерировать расписание"' : 'Click "Generate Schedule"'}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
