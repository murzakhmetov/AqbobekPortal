import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LanguageContext';
import { GraduationCap, User, BookOpen, Shield, Globe, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsRole } = useAuth();
  const { t, lang, toggleLang } = useLang();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(lang === 'ru' ? 'Неверный email или пароль' : 'Invalid email or password');
    }
    setLoading(false);
  };

  const roleIcons = {
    student: <GraduationCap size={20} />,
    teacher: <BookOpen size={20} />,
    parent: <User size={20} />,
    admin: <Shield size={20} />,
  };

  const roleColors = {
    student: '#6C63FF',
    teacher: '#00C9A7',
    parent: '#FF6B6B',
    admin: '#FFD93D',
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <button className="lang-toggle-login" onClick={toggleLang}>
        <Globe size={16} />
        {lang === 'ru' ? 'EN' : 'RU'}
      </button>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <GraduationCap size={40} />
          </div>
          <h1>{t('portalName')}</h1>
          <p>{t('login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@aqbobek.kz"
              required
            />
          </div>
          <div className="input-group">
            <label>{t('password')}</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '...' : t('signIn')}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">{t('selectRole')}</p>
          <div className="demo-buttons">
            {['student', 'teacher', 'parent', 'admin'].map(role => (
              <button
                key={role}
                className="demo-btn"
                style={{ '--role-color': roleColors[role] }}
                onClick={() => loginAsRole(role)}
              >
                {roleIcons[role]}
                <span>{t(role)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
