import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './src/api/auth';
import { toast } from './src/ui/toast';
import { StatusBar } from './src/ui/common';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieRegister() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function handleRegister() {
    setError('');
    if (!email.trim()) return setError('请输入邮箱地址');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('请输入有效的邮箱地址');
    if (password.length < 6) return setError('密码至少 6 位字符');
    if (password !== confirm) return setError('两次输入的密码不一致');

    setLoading(true);
    try {
      await register({ email: email.trim(), password, nickname: email.split('@')[0] });
      toast('注册成功，请登录');
      navigate('/login');
    } catch (e) {
      setError(e.message || '注册失败，请稍后再试');
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
    <PageContainer data-name="FoodCalorie-Register">
      <StatusBar />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: colors.textPrimary, cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.textPrimary }}>注册账号</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 6 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-utensils" style={{ fontSize: 28, color: colors.textInverse }} />
        </div>
        <span style={{ fontSize: fontSize.sm, color: colors.textTertiary }}>注册食刻账号，开启健康记录</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 20px', gap: 12 }}>
        <div style={fieldStyle}>
          <i className="fas fa-envelope" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input type="email" placeholder="请输入邮箱地址" aria-label="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
        </div>
        <div style={fieldStyle}>
          <i className="fas fa-lock" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input type={showPwd ? 'text' : 'password'} placeholder="设置密码（6-20 位字母数字）" aria-label="设置密码" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="new-password" />
          <i className={showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => setShowPwd(!showPwd)} />
        </div>
        <div style={fieldStyle}>
          <i className="fas fa-lock" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input type={showPwd ? 'text' : 'password'} placeholder="再次输入密码" aria-label="再次输入密码" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRegister()} style={inputStyle} autoComplete="new-password" />
        </div>
      </div>

      {error && (
        <div style={{ margin: '6px 20px 0', padding: '10px 14px', background: colors.dangerBg, borderRadius: radius.md, fontSize: fontSize.md, color: colors.danger }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px 8px' }}>
        <button onClick={handleRegister} disabled={loading} style={{ width: '100%', height: 50, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.display, fontWeight: fontWeight.bold, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? '注册中…' : '注册并登录'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 20px 8px' }}>
        <i className="fas fa-check" style={{ fontSize: 10, color: colors.textInverse, background: colors.primary, borderRadius: 8, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <span style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>我已阅读并同意</span>
        <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => toast('《用户协议》（开发中）')}>《用户协议》</span>
        <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.medium, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => navigate('/privacy')}>《隐私政策》</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '6px 20px 24px' }}>
        <span style={{ fontSize: fontSize.md, color: colors.textTertiary }}>已有账号？</span>
        <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary, cursor: 'pointer' }} onClick={() => navigate('/login')}>去登录</span>
      </div>
    </PageContainer>
  );
}
