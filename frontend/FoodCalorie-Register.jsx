import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from './src/api/auth';

// 注册页（真实表单）：邮箱 + 密码 + 确认密码，对接服务器 gakiwoo-api /api/auth/register
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
      alert('注册成功，请登录');
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
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
    color: '#1A1A1A',
    background: 'transparent',
    flex: 1
  };
  const fieldStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px',
    height: 50,
    background: '#FFFFFF',
    borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  };

  return (
    <div
      data-name="FoodCalorie-Register"
      style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {/* 状态栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 8px' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>9:41</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <i className="fas fa-signal" style={{ fontSize: 14, color: '#1A1A1A' }} />
          <i className="fas fa-wifi" style={{ fontSize: 14, color: '#1A1A1A' }} />
          <i className="fas fa-battery-full" style={{ fontSize: 14, color: '#1A1A1A' }} />
        </div>
      </div>

      {/* 顶栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>注册账号</span>
        <div style={{ width: 22 }} />
      </div>

      {/* Logo 区 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 6 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-utensils" style={{ fontSize: 28, color: '#FFFFFF' }} />
        </div>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>注册食刻账号，开启健康记录</span>
      </div>

      {/* 表单 */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 20px', gap: 12 }}>
        <div style={fieldStyle}>
          <i className="fas fa-envelope" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input type="email" placeholder="请输入邮箱地址" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
        </div>
        <div style={fieldStyle}>
          <i className="fas fa-lock" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="设置密码（6-20 位字母数字）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="new-password"
          />
          <i className={showPwd ? 'fas fa-eye-slash' : 'fas fa-eye'} style={{ fontSize: 14, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => setShowPwd(!showPwd)} />
        </div>
        <div style={fieldStyle}>
          <i className="fas fa-lock" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder="再次输入密码"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            style={inputStyle}
            autoComplete="new-password"
          />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div style={{ margin: '6px 20px 0', padding: '10px 14px', background: '#FFE8EC', borderRadius: 12, fontSize: 13, color: '#E03131' }}>
          {error}
        </div>
      )}

      {/* 注册按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 20px 8px' }}>
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 16,
            border: 'none',
            background: '#34C759',
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
          {loading ? '注册中…' : '注册并登录'}
        </button>
      </div>

      {/* 协议 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 20px 8px' }}>
        <i className="fas fa-check" style={{ fontSize: 10, color: '#FFFFFF', background: '#34C759', borderRadius: 8, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>我已阅读并同意</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#22A85A' }}>《用户协议》</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#22A85A' }}>《隐私政策》</span>
      </div>

      {/* 去登录 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '6px 20px 24px' }}>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>已有账号？</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#34C759', cursor: 'pointer' }} onClick={() => navigate('/login')}>
          去登录
        </span>
      </div>
    </div>
  );
}
