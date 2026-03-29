import { useState, useEffect, useRef } from 'react';
import { useLang } from '../../i18n/LanguageContext';
import { getLeaderboard, getNews } from '../../services/bilimclassAPI';
import { Crown, Medal, Trophy, Calendar, Star, Newspaper, Clock, Maximize, Minimize } from 'lucide-react';

export default function KioskPage() {
  const { t, lang } = useLang();
  const leaderboard = getLeaderboard().slice(0, 10);
  const news = getNews();
  const scrollRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    let scrollPos = 0;
    const interval = setInterval(() => {
      scrollPos += 1;
      if (scrollPos >= container.scrollHeight - container.clientHeight) {
        scrollPos = 0;
      }
      container.scrollTop = scrollPos;
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getRankIcon = (i) => {
    if (i === 0) return <Crown size={32} color="#FFD93D" />;
    if (i === 1) return <Medal size={28} color="#C0C0C0" />;
    if (i === 2) return <Medal size={28} color="#CD7F32" />;
    return <span className="kiosk-rank-num">{i + 1}</span>;
  };

  return (
    <div className="kiosk-page">
      <div className="kiosk-header">
        <div className="kiosk-logo">
          <Trophy size={36} color="#FFD93D" />
          <h1>Aqbobek Lyceum</h1>
        </div>
        <div className="kiosk-clock">
          <Clock size={24} />
          <span>{currentTime.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="kiosk-date">{currentTime.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <button className="kiosk-fullscreen" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
      </div>

      <div className="kiosk-content" ref={scrollRef}>
        {/* Top Students */}
        <div className="kiosk-section">
          <h2 className="kiosk-section-title">
            <Star size={28} /> {t('topStudents')}
          </h2>
          <div className="kiosk-leaderboard">
            {leaderboard.map((entry, i) => (
              <div key={entry.id} className={`kiosk-leader-item ${i < 3 ? 'top' : ''}`}>
                <div className="kiosk-leader-rank">{getRankIcon(i)}</div>
                <div className="kiosk-leader-info">
                  <span className="kiosk-leader-name">{entry.name}</span>
                  <span className="kiosk-leader-class">{entry.className}</span>
                </div>
                <div className="kiosk-leader-score">
                  <span className="kiosk-score-value">{entry.totalScore}</span>
                  <span className="kiosk-score-label">{t('points')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School News */}
        <div className="kiosk-section">
          <h2 className="kiosk-section-title">
            <Newspaper size={28} /> {t('schoolNews')}
          </h2>
          <div className="kiosk-news">
            {news.map(item => (
              <div key={item.id} className="kiosk-news-item">
                <div className="kiosk-news-date">
                  <Calendar size={18} />
                  <span>{item.date}</span>
                </div>
                <h3>{lang === 'ru' ? item.title : (item.titleEn || item.title)}</h3>
                <p>{lang === 'ru' ? item.content : (item.contentEn || item.content)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events Banner */}
        <div className="kiosk-section">
          <h2 className="kiosk-section-title">
            <Calendar size={28} /> {t('upcomingEvents')}
          </h2>
          <div className="kiosk-events">
            <div className="kiosk-event-item">
              <div className="event-date-badge">
                <span className="event-day">5</span>
                <span className="event-month">{lang === 'ru' ? 'АПР' : 'APR'}</span>
              </div>
              <div className="event-info">
                <h3>{lang === 'ru' ? 'День открытых дверей' : 'Open Day'}</h3>
                <p>{lang === 'ru' ? '10:00 — Актовый зал' : '10:00 — Assembly Hall'}</p>
              </div>
            </div>
            <div className="kiosk-event-item">
              <div className="event-date-badge">
                <span className="event-day">10</span>
                <span className="event-month">{lang === 'ru' ? 'АПР' : 'APR'}</span>
              </div>
              <div className="event-info">
                <h3>{lang === 'ru' ? 'Турнир по волейболу' : 'Volleyball Tournament'}</h3>
                <p>{lang === 'ru' ? '14:00 — Спортзал' : '14:00 — Gym'}</p>
              </div>
            </div>
            <div className="kiosk-event-item">
              <div className="event-date-badge">
                <span className="event-day">15</span>
                <span className="event-month">{lang === 'ru' ? 'АПР' : 'APR'}</span>
              </div>
              <div className="event-info">
                <h3>{lang === 'ru' ? 'Олимпиада по математике' : 'Math Olympiad'}</h3>
                <p>{lang === 'ru' ? '09:00 — Каб. 101' : '09:00 — Room 101'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
