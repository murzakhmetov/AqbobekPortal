import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ref, push, onValue, remove, set } from 'firebase/database';
import { db } from '../../services/firebase';
import { Newspaper, Plus, X, Send, Trash2, Edit, Users, Clock, Eye, Target } from 'lucide-react';
import { useEffect } from 'react';

export default function NewsManagerPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [newsList, setNewsList] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const newsRef = ref(db, 'news');
    const unsub = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([key, val]) => ({ id: key, ...val }));
        setNewsList(arr.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setNewsList([]);
      }
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      const newsData = {
        title,
        content,
        target,
        priority,
        author: user?.name || 'Admin',
        date: new Date().toISOString(),
      };

      if (editId) {
        await set(ref(db, `news/${editId}`), newsData);
        showToast(lang === 'ru' ? '✅ Новость обновлена!' : '✅ News updated!');
        setEditId(null);
      } else {
        await push(ref(db, 'news'), newsData);
        showToast(lang === 'ru' ? '✅ Новость опубликована!' : '✅ News published!');
      }

      setTitle('');
      setContent('');
      setTarget('all');
      setPriority('normal');
    } catch (err) {
      showToast(lang === 'ru' ? '❌ Ошибка публикации' : '❌ Publish error');
    }
    setPublishing(false);
  };

  const handleDelete = async (id) => {
    try {
      await remove(ref(db, `news/${id}`));
      showToast(lang === 'ru' ? '🗑️ Новость удалена' : '🗑️ News deleted');
    } catch {
      showToast(lang === 'ru' ? '❌ Ошибка удаления' : '❌ Delete error');
    }
  };

  const handleEdit = (news) => {
    setTitle(news.title);
    setContent(news.content);
    setTarget(news.target || 'all');
    setPriority(news.priority || 'normal');
    setEditId(news.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const targetLabels = {
    all: t('allSchool'),
    students: t('student'),
    teachers: t('teacher'),
    parents: t('parent'),
    '10A': '10A', '10B': '10Б/B', '11A': '11A',
  };

  const priorityColors = {
    urgent: '#FF6B6B',
    important: '#FFD93D',
    normal: '#6C63FF',
  };

  return (
    <div className="dashboard-page">
      {toast && <div className="toast-notification">{toast}</div>}

      <div className="page-header">
        <h1><Newspaper size={28} /> {t('news')}</h1>
      </div>

      {/* Publish Form */}
      <div className="chart-card publish-card">
        <h3><Plus size={18} /> {editId ? (lang === 'ru' ? 'Редактировать новость' : 'Edit News') : t('publishNews')}</h3>
        <div className="publish-form">
          <div className="input-group">
            <label>{t('title')}</label>
            <input
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'ru' ? 'Заголовок новости' : 'News title'}
            />
          </div>
          <div className="input-group">
            <label>{t('content')}</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={lang === 'ru' ? 'Содержание новости...' : 'News content...'}
            />
          </div>

          <div className="form-row">
            <div className="target-section">
              <span className="target-label"><Target size={14} /> {t('targetAudience')}:</span>
              <div className="target-buttons">
                {['all', 'students', 'teachers', 'parents', '10A', '10B', '11A'].map(t2 => (
                  <button
                    key={t2}
                    className={`target-btn ${target === t2 ? 'active' : ''}`}
                    onClick={() => setTarget(t2)}
                  >
                    {targetLabels[t2]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="target-section">
              <span className="target-label">{lang === 'ru' ? 'Приоритет' : 'Priority'}:</span>
              <div className="target-buttons">
                {['normal', 'important', 'urgent'].map(p => (
                  <button
                    key={p}
                    className={`target-btn ${priority === p ? 'active' : ''}`}
                    style={priority === p ? { background: priorityColors[p], borderColor: priorityColors[p] } : {}}
                    onClick={() => setPriority(p)}
                  >
                    {p === 'normal' ? (lang === 'ru' ? 'Обычный' : 'Normal') :
                     p === 'important' ? (lang === 'ru' ? 'Важный' : 'Important') :
                     (lang === 'ru' ? 'Срочный' : 'Urgent')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {title && content && (
            <div className="news-preview-toggle">
              <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
                <Eye size={14} /> {lang === 'ru' ? (showPreview ? 'Скрыть превью' : 'Превью') : (showPreview ? 'Hide Preview' : 'Preview')}
              </button>
            </div>
          )}

          {showPreview && title && content && (
            <div className="news-preview">
              <div className="news-preview-badge" style={{ background: priorityColors[priority] }}>
                {priority === 'urgent' ? '🚨' : priority === 'important' ? '⚠️' : 'ℹ️'} {priority}
              </div>
              <h4>{title}</h4>
              <p>{content}</p>
              <span className="news-preview-meta">{lang === 'ru' ? 'Для:' : 'For:'} {targetLabels[target]}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {editId && (
              <button className="btn-secondary" onClick={() => { setEditId(null); setTitle(''); setContent(''); }}>
                {t('cancel')}
              </button>
            )}
            <button className="btn-primary" onClick={handlePublish} disabled={!title.trim() || !content.trim() || publishing}>
              <Send size={16} /> {editId ? (lang === 'ru' ? 'Обновить' : 'Update') : t('publish')}
            </button>
          </div>
        </div>
      </div>

      {/* News Feed */}
      <div className="chart-card">
        <h3><Newspaper size={18} /> {lang === 'ru' ? 'Лента новостей' : 'News Feed'} ({newsList.length})</h3>
        <div className="news-feed">
          {newsList.length === 0 && (
            <div className="empty-state">
              <span className="emoji">📰</span>
              <h3>{lang === 'ru' ? 'Новостей пока нет' : 'No news yet'}</h3>
            </div>
          )}
          {newsList.map(n => (
            <div key={n.id} className="chart-card news-item" style={{ borderLeft: `3px solid ${priorityColors[n.priority || 'normal']}` }}>
              <div className="news-header">
                <h4>{n.title}</h4>
                <div className="news-actions-row">
                  <button className="btn-icon-sm" onClick={() => handleEdit(n)} title={t('edit')}>
                    <Edit size={14} />
                  </button>
                  <button className="btn-icon-sm" onClick={() => handleDelete(n.id)} title={t('delete')} style={{ color: 'var(--accent-red)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="news-meta">
                <span className="news-date"><Clock size={12} /> {new Date(n.date).toLocaleDateString()}</span>
                <span className="news-target"><Users size={12} /> {targetLabels[n.target] || t('allSchool')}</span>
              </div>
              <p className="news-content">{n.content}</p>
              <span className="news-author">{lang === 'ru' ? 'Автор' : 'Author'}: {n.author}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
