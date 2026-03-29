import { useState } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard, getStudentById, calculateGPA, getSubjectAverages } from '../../services/bilimclassAPI';
import { Trophy, Crown, Medal, Award, Star, TrendingUp, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function LeaderboardPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const student = getStudentById(user?.studentId || 's1');
  const leaderboard = getLeaderboard();
  const myRank = leaderboard.findIndex(l => l.id === student.id) + 1;

  const [timeFilter, setTimeFilter] = useState('allTime');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState('score');

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} color="#FFD93D" />;
    if (rank === 2) return <Medal size={20} color="#C0C0C0" />;
    if (rank === 3) return <Medal size={20} color="#CD7F32" />;
    return <span className="rank-num">{rank}</span>;
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'gpa') return b.gpa - a.gpa;
    return a.name.localeCompare(b.name);
  });

  const handleStudentClick = (s) => {
    if (selectedStudent?.id === s.id) {
      setSelectedStudent(null);
    } else {
      setSelectedStudent(s);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1><Trophy size={28} /> {t('schoolLeaderboard')}</h1>
      </div>

      {/* My Rank */}
      <div className="my-rank-card">
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{lang === 'ru' ? 'Ваша позиция' : 'Your Position'}</span>
          <span className="my-rank-position">#{myRank} / {leaderboard.length}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t('score')}</span>
          <span className="my-rank-score">{leaderboard[myRank - 1]?.score || 0} {t('points')}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>GPA</span>
          <span className="my-rank-score">{calculateGPA(student).toFixed(1)}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="quarter-tabs">
          {['allTime', 'monthlyTop', 'weeklyTop'].map(filter => (
            <button
              key={filter}
              className={`quarter-tab ${timeFilter === filter ? 'active' : ''}`}
              onClick={() => setTimeFilter(filter)}
            >
              {t(filter)}
            </button>
          ))}
        </div>
        <div className="quarter-tabs" style={{ marginLeft: 'auto' }}>
          <button className={`quarter-tab ${sortBy === 'score' ? 'active' : ''}`} onClick={() => setSortBy('score')}>
            {t('score')}
          </button>
          <button className={`quarter-tab ${sortBy === 'gpa' ? 'active' : ''}`} onClick={() => setSortBy('gpa')}>
            GPA
          </button>
          <button className={`quarter-tab ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>
            {t('name')}
          </button>
        </div>
      </div>

      {/* Podium for top 3 */}
      <div className="podium-row">
        {sortedLeaderboard.slice(0, 3).map((s, i) => {
          const positions = [1, 0, 2]; // Show #2, #1, #3 for podium effect
          const idx = positions[i];
          const item = sortedLeaderboard[idx];
          if (!item) return null;
          return (
            <div
              key={item.id}
              className={`podium-item podium-${idx + 1}`}
              onClick={() => handleStudentClick(item)}
            >
              <div className="podium-crown">{getRankIcon(idx + 1)}</div>
              <div className="podium-avatar">{item.name.charAt(0)}</div>
              <span className="podium-name">{item.name}</span>
              <span className="podium-class">{item.className}</span>
              <span className="podium-score">{item.score}</span>
              <span className="podium-label">{t('points')}</span>
            </div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="chart-card">
        <h3><Star size={18} /> {lang === 'ru' ? 'Полный рейтинг' : 'Full Ranking'}</h3>
        <div className="leaderboard-list">
          {sortedLeaderboard.map((s, i) => (
            <div key={s.id}>
              <div
                className={`leaderboard-item clickable ${s.id === student.id ? 'highlight' : ''} ${i < 3 ? 'top-three' : ''}`}
                onClick={() => handleStudentClick(s)}
              >
                <div className="lb-rank">{getRankIcon(i + 1)}</div>
                <div className="lb-info">
                  <span className="lb-name">{s.name}</span>
                  <span className="lb-class">{s.className}</span>
                </div>
                <div className="lb-stats">
                  <span className="lb-score">{s.score} {t('points')}</span>
                  <span className="lb-gpa">GPA: {s.gpa.toFixed(1)}</span>
                </div>
                {selectedStudent?.id === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {selectedStudent?.id === s.id && (
                <div className="student-expanded-card">
                  <div className="expanded-stats">
                    <div className="expanded-stat">
                      <span className="expanded-stat-label">GPA</span>
                      <span className="expanded-stat-value">{s.gpa.toFixed(1)}</span>
                    </div>
                    <div className="expanded-stat">
                      <span className="expanded-stat-label">{t('score')}</span>
                      <span className="expanded-stat-value" style={{ color: 'var(--accent-yellow)' }}>{s.score}</span>
                    </div>
                    <div className="expanded-stat">
                      <span className="expanded-stat-label">{t('class')}</span>
                      <span className="expanded-stat-value">{s.className}</span>
                    </div>
                    <div className="expanded-stat">
                      <span className="expanded-stat-label">{t('achievements')}</span>
                      <span className="expanded-stat-value">{s.achievements || 0}</span>
                    </div>
                  </div>
                  {s.id === student.id && (
                    <div className="expanded-cta">
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang === 'ru' ? 'Это вы!' : "That's you!"} 🎉</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
