import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LanguageContext';
import {
  LayoutDashboard, BookOpen, Brain, Trophy, Award,
  AlertTriangle, FileText, Eye, CalendarClock,
  Globe2, Newspaper, CalendarDays, Monitor,
  LogOut, GraduationCap, Globe, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const roleMenus = {
  student: [
    { path: '/student', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/student/grades', icon: BookOpen, label: 'grades' },
    { path: '/student/ai-tutor', icon: Brain, label: 'aiTutor' },
    { path: '/student/portfolio', icon: Award, label: 'portfolio' },
    { path: '/student/leaderboard', icon: Trophy, label: 'leaderboard' },
  ],
  teacher: [
    { path: '/teacher', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/teacher/risk-analytics', icon: AlertTriangle, label: 'riskAnalytics' },
    { path: '/teacher/reports', icon: FileText, label: 'reports' },
  ],
  parent: [
    { path: '/parent', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/parent/weekly-summary', icon: CalendarClock, label: 'weeklySummary' },
  ],
  admin: [
    { path: '/admin', icon: LayoutDashboard, label: 'globalRadar' },
    { path: '/admin/schedule', icon: CalendarDays, label: 'schedule' },
    { path: '/admin/news', icon: Newspaper, label: 'news' },
    { path: '/admin/kiosk', icon: Monitor, label: 'kioskMode' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menu = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    student: '#6C63FF',
    teacher: '#00C9A7',
    parent: '#FF6B6B',
    admin: '#FFD93D',
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <GraduationCap size={collapsed ? 24 : 28} color={roleColors[user?.role]} />
          {!collapsed && <span className="logo-text">Aqbobek<span className="logo-accent">Portal</span></span>}
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ borderColor: roleColors[user?.role] }}>
          {(lang === 'ru' ? user?.name : user?.nameEn || user?.name)?.charAt(0)}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{lang === 'ru' ? user?.name : user?.nameEn || user?.name}</span>
            <span className="user-role" style={{ color: roleColors[user?.role] }}>{t(user?.role)}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${user?.role}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ '--item-color': roleColors[user?.role] }}
          >
            <item.icon size={20} />
            {!collapsed && <span>{t(item.label)}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item lang-btn" onClick={toggleLang}>
          <Globe size={20} />
          {!collapsed && <span>{lang === 'ru' ? 'English' : 'Русский'}</span>}
        </button>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
}
