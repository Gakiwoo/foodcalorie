import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './src/api/auth';
import { toast } from './src/ui/toast';
import { StatusBar } from './src/ui/common';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (e) {
      setError(e.message || '登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: fontSize.lg,
    fontFamily: 'Inter, sans-serif',
    color: colors.textPrimary,
    background: 'transparent',
    flex: 1
  };

  const fieldStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px',
    height: 50,
    background: colors.surface,
    borderRadius: radius.lg,
    boxShadow: shadow.sm
  };

  return (
    <PageContainer data-name="FoodCalorie-Login">
      <StatusBar />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 20px', gap: 10 }}>
        <div style={{ width: 88, height: 88, borderRadius: 44, background: 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-utensils" style={{ fontSize: 40, color: colors.textInverse }} />
        </div>
        <p style={{ fontSize: 26, fontWeight: fontWeight.bold, color: colors.textPrimary, margin: 0 }}>食刻</p>
        <span style={{ fontSize: fontSize.md, color: colors.textTertiary }}>记录每一餐，健康每一天</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 20px', gap: 12 }}>
        <div style={fieldStyle}>
          <i className="fas fa-envelope" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input type="email" placeholder="请输入邮箱地址" aria-label="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
        </div>
        <div style={fieldStyle}>
          <i className="fas fa-lock" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input type={showPwd ? 'text' : 'password'} placeholder="请输入密码" aria-label="密码" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={inputStyle} autoComplete="current-password" />
          <i className={showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => setShowPwd(!showPwd)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => toast('密码找回功能开发中，请联系管理员')}>忘记密码？</span>
        </div>
      </div>

      {error && (
        <div style={{ margin: '6px 20px 0', padding: '10px 14px', background: colors.dangerBg, borderRadius: radius.md, fontSize: fontSize.md, color: colors.danger }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px 8px' }}>
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', height: 50, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.display, fontWeight: fontWeight.bold, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? '登录中…' : '登 录'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 8px' }}>
        <div style={{ flex: 1, height: 1, background: colors.segBg }} />
        <span style={{ fontSize: fontSize.sm, color: '#C0C4CC' }}>或</span>
        <div style={{ flex: 1, height: 1, background: colors.segBg }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 20px 8px' }}>
        <button onClick={() => toast('微信登录开发中，请先用邮箱登录')} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: `1.5px solid ${colors.border}`, background: colors.surface, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="fab fa-weixin" style={{ fontSize: 20, color: colors.primary }} />
          微信一键登录
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 20px 8px' }}>
        <i className="fas fa-check" style={{ fontSize: 10, color: colors.textInverse, background: colors.primary, borderRadius: 8, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <span style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>我已阅读并同意</span>
        <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => toast('《用户协议》（开发中）')}>《用户协议》</span>
        <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => navigate('/privacy')}>《隐私政策》</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '6px 20px 24px' }}>
        <span style={{ fontSize: fontSize.md, color: colors.textTertiary }}>还没有账号？</span>
        <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, cursor: 'pointer' }} onClick={() => navigate('/register')}>立即注册</span>
      </div>
    </PageContainer>
  );
}
