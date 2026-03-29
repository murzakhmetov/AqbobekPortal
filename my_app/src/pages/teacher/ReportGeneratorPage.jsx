import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentsByClass, calculateGPA, getSubjectAverages, getSubjects } from '../../services/bilimclassAPI';
import { askGroq, buildTeacherReportPrompt } from '../../services/groqAI';
import { FileText, Loader, Download, Sparkles } from 'lucide-react';

export default function ReportGeneratorPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const classId = user?.classId || 'c10a';
  const students = getStudentsByClass(classId);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const classData = {
        className: classId === 'c10a' ? '10А' : classId === 'c10b' ? '10Б' : '11А',
        studentsCount: students.length,
        averageGPA: (students.reduce((s, st) => s + calculateGPA(st), 0) / students.length).toFixed(1),
        students: students.map(s => ({
          name: s.name,
          gpa: calculateGPA(s).toFixed(1),
          attendance: s.attendance,
          weakSubjects: getSubjectAverages(s).filter(sa => sa.avg < 5).map(sa => sa.name),
          strongSubjects: getSubjectAverages(s).filter(sa => sa.avg > 8).map(sa => sa.name),
        })),
      };

      const prompt = buildTeacherReportPrompt(classData, lang);
      const result = await askGroq(prompt, `Сгенерируй подробный отчёт по классу ${classData.className}. Включи: общий анализ, учеников в зоне риска, лучших учеников, рекомендации.`);
      setReport(result);
    } catch (err) {
      setReport(lang === 'ru' ? 'Ошибка генерации отчёта.' : 'Report generation error.');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><FileText size={28} /> {t('reports')}</h1>
        <p>{t('classReport')}</p>
      </div>

      <div className="chart-card">
        <div className="report-actions">
          <button className="btn-primary" onClick={generateReport} disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> {t('generatingReport')}</> : <><Sparkles size={16} /> {t('generateReport')}</>}
          </button>
        </div>

        {report && (
          <div className="report-content">
            {report.split('\n').map((line, i) => {
              if (line.startsWith('##')) return <h3 key={i}>{line.replace(/##/g, '').trim()}</h3>;
              if (line.startsWith('#')) return <h2 key={i}>{line.replace(/#/g, '').trim()}</h2>;
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i}>{line.replace(/^[-*]\s/, '')}</li>;
              if (line.startsWith('**')) return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
              if (line.trim()) return <p key={i}>{line}</p>;
              return <br key={i} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
