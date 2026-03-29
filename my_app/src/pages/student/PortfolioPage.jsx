import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getStudentById } from '../../services/bilimclassAPI';
import { Award, CheckCircle, Clock, Trophy, Medal, BookOpen, Heart, Plus, X, Upload, Star } from 'lucide-react';

export default function PortfolioPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const student = getStudentById(user?.studentId || 's1');

  const [achievements, setAchievements] = useState(student.achievements);
  const [showModal, setShowModal] = useState(false);
  const [newAch, setNewAch] = useState({ title: '', type: 'certificate', date: '', description: '' });
  const [selectedAch, setSelectedAch] = useState(null);

  const typeIcons = {
    olympiad: <Trophy size={20} color="#FFD93D" />,
    competition: <Medal size={20} color="#6C63FF" />,
    certificate: <BookOpen size={20} color="#00C9A7" />,
    volunteering: <Heart size={20} color="#FF6B6B" />,
  };

  const typeLabels = {
    olympiad: t('olympiads'),
    competition: t('competitions'),
    certificate: t('certificates'),
    volunteering: t('volunteering'),
  };

  const grouped = achievements.reduce((acc, ach) => {
    acc[ach.type] = acc[ach.type] || [];
    acc[ach.type].push(ach);
    return acc;
  }, {});

  const totalPoints = achievements.reduce((a, b) => a + b.points, 0);

  const handleAdd = () => {
    if (!newAch.title.trim()) return;
    const ach = {
      id: `ach_new_${Date.now()}`,
      title: newAch.title,
      type: newAch.type,
      date: newAch.date || new Date().toISOString().split('T')[0],
      description: newAch.description,
      verified: false,
      points: Math.floor(Math.random() * 30) + 10,
    };
    setAchievements(prev => [ach, ...prev]);
    setNewAch({ title: '', type: 'certificate', date: '', description: '' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    setSelectedAch(null);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><Award size={28} /> {t('digitalPortfolio')}</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> {t('addAchievement')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': '#6C63FF' }}>
          <div className="stat-icon"><Award /></div>
          <div className="stat-info">
            <span className="stat-value">{achievements.length}</span>
            <span className="stat-label">{t('achievements')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#00C9A7' }}>
          <div className="stat-icon"><CheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{achievements.filter(a => a.verified).length}</span>
            <span className="stat-label">{t('verified')}</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#FFD93D' }}>
          <div className="stat-icon"><Trophy /></div>
          <div className="stat-info">
            <span className="stat-value">{totalPoints}</span>
            <span className="stat-label">{t('points')}</span>
          </div>
        </div>
      </div>

      {Object.keys(grouped).map(type => (
        <div key={type} className="chart-card">
          <h3>{typeIcons[type]} {typeLabels[type]}</h3>
          <div className="achievements-list">
            {grouped[type].map(ach => (
              <div key={ach.id} className="achievement-item clickable" onClick={() => setSelectedAch(ach)}>
                <div className="ach-info">
                  <span className="ach-title">{ach.title}</span>
                  <span className="ach-date">{ach.date}</span>
                </div>
                <div className="ach-meta">
                  <span className="ach-points">+{ach.points} {t('points')}</span>
                  {ach.verified ? (
                    <span className="ach-badge verified"><CheckCircle size={14} /> {t('verified')}</span>
                  ) : (
                    <span className="ach-badge pending"><Clock size={14} /> {t('pending')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Achievement Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('addAchievement')}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>{lang === 'ru' ? 'Название' : 'Title'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={newAch.title}
                  onChange={e => setNewAch({ ...newAch, title: e.target.value })}
                  placeholder={lang === 'ru' ? 'Например: Олимпиада по математике' : 'e.g. Math Olympiad'}
                />
              </div>
              <div className="input-group">
                <label>{t('type')}</label>
                <select
                  className="select-input full-width"
                  value={newAch.type}
                  onChange={e => setNewAch({ ...newAch, type: e.target.value })}
                >
                  <option value="olympiad">{t('olympiads')}</option>
                  <option value="competition">{t('competitions')}</option>
                  <option value="certificate">{t('certificates')}</option>
                  <option value="volunteering">{t('volunteering')}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t('date')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={newAch.date}
                  onChange={e => setNewAch({ ...newAch, date: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>{lang === 'ru' ? 'Описание' : 'Description'}</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={newAch.description}
                  onChange={e => setNewAch({ ...newAch, description: e.target.value })}
                  placeholder={lang === 'ru' ? 'Опишите достижение...' : 'Describe the achievement...'}
                />
              </div>
              <div className="upload-area">
                <Upload size={24} />
                <span>{lang === 'ru' ? 'Загрузить сертификат (PDF/JPG)' : 'Upload certificate (PDF/JPG)'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
              <button className="btn-primary" onClick={handleAdd} disabled={!newAch.title.trim()}>
                <Plus size={16} /> {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAch && (
        <div className="modal-overlay" onClick={() => setSelectedAch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAch.title}</h2>
              <button className="modal-close" onClick={() => setSelectedAch(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">{t('type')}:</span>
                <span>{typeLabels[selectedAch.type]}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('date')}:</span>
                <span>{selectedAch.date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('points')}:</span>
                <span className="ach-points">+{selectedAch.points}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{lang === 'ru' ? 'Статус' : 'Status'}:</span>
                {selectedAch.verified ?
                  <span className="ach-badge verified"><CheckCircle size={14} /> {t('verified')}</span> :
                  <span className="ach-badge pending"><Clock size={14} /> {t('pending')}</span>
                }
              </div>
              {selectedAch.description && (
                <div className="detail-description">
                  <p>{selectedAch.description}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={() => handleDelete(selectedAch.id)}>
                {t('delete')}
              </button>
              <button className="btn-primary" onClick={() => setSelectedAch(null)}>
                {lang === 'ru' ? 'Закрыть' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
