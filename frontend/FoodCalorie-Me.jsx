import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { fetchMe } from './src/api/auth';
import { todayStr } from './src/ui/toast';
import { StatusBar, BottomNav } from './src/ui/common';

const APP_VERSION = 'v1.0.3';

// 我的页：真实数据（/auth/me 用户信息 + profile 目标 + 今日摄入摘要；data-name 保留供全局 NAV 跳转）
export default function FoodCalorieMe() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    (async () => {
      // 用户信息（fetchMe 已返回 user 对象，直接使用）
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        setAuthed(false);
      }
      // 今日摄入
      try {
        const r = await http.get('/api/v1/foodcalorie/records/stats', { range: 'day', date: todayStr() });
        setStats(r.data);
      } catch {
        /* 未登录时忽略 */
      }
    })();
  }, []);

  const avatarBg = authed ? 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)' : 'linear-gradient(135deg,#D1D5DB 0%,#9CA3AF 100%)';

  const intake = stats ? stats.total : 0;
  const target = stats ? stats.target : 0;
  const remain = Math.max(0, target - intake);
  const percent = target > 0 ? Math.min(100, Math.round((intake / target) * 100)) : 0;

  return (
    <div data-name="FoodCalorie-Me" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />

      {/* 个人信息卡 */}
      <div data-name="profile-section" style={{ margin: '4px 20px 8px' }}>
        <div data-name="profile-card" onClick={() => navigate(authed ? '/profile' : '/login')} style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div data-name="avatar" style={{ width: 64, height: 64, borderRadius: 64, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-user" style={{ fontSize: 28, color: '#FFFFFF' }} />
          </div>
          <div data-name="profile-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div data-name="profile-name" style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authed ? (user?.nickname || '未设置昵称') : '未登录'}
            </div>
            <div data-name="profile-bio" style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {authed ? (user?.streak ? `已坚持健康饮食 ${user.streak} 天` : (user?.email || '已坚持健康饮食')) : '点击登录账号'}
            </div>
          </div>
          <i className="fas fa-chevron-right" style={{ fontSize: 14, color: '#C0C4CC', flexShrink: 0 }} />
        </div>
      </div>

      {/* 今日摄入 */}
      <div data-name="today-section" style={{ margin: '4px 20px 8px' }}>
        <div data-name="today-card" style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div data-name="today-header" onClick={() => navigate('/today')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span data-name="today-title" style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>今日摄入</span>
            <span data-name="today-detail" style={{ fontSize: 12, fontWeight: 500, color: '#34C759' }}>查看详情</span>
          </div>
          <div data-name="today-stats" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div data-name="stat-intake" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span data-name="intake-value" style={{ fontSize: 22, fontWeight: 700, color: '#34C759', lineHeight: '28px' }}>{stats ? intake : '--'}</span>
              <span data-name="intake-label" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>已摄入 kcal</span>
            </div>
            <div data-name="stat-divider-1" style={{ width: 1, height: 32, background: '#EEF0F2' }} />
            <div data-name="stat-goal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span data-name="goal-value" style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: '28px' }}>{stats ? target : '--'}</span>
              <span data-name="goal-label" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>目标 kcal</span>
            </div>
            <div data-name="stat-divider-2" style={{ width: 1, height: 32, background: '#EEF0F2' }} />
            <div data-name="stat-remain" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span data-name="remain-value" style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: '28px' }}>{stats ? remain : '--'}</span>
              <span data-name="remain-label" style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>剩余 kcal</span>
            </div>
          </div>
          <div data-name="today-bar" style={{ width: '100%', height: 8, background: '#E8F5EC', borderRadius: 8, overflow: 'hidden' }}>
            <div data-name="today-bar-fill" style={{ width: `${percent}%`, height: 8, background: '#34C759', borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div data-name="quick-section" style={{ margin: '8px 20px' }}>
        <div data-name="quick-grid" style={{ display: 'flex', gap: 12 }}>
          {[
            { to: '/records', icon: 'fa-clipboard-list', label: '我的记录', bg: '#E8F5EC', color: '#22A85A' },
            { to: '/goal', icon: 'fa-bullseye', label: '目标设置', bg: '#FFF4E5', color: '#FA8C16' },
            { to: '/favorites', icon: 'fa-heart', label: '我的收藏', bg: '#FFE8EC', color: '#FF4D4F' },
            { to: '/dataexport', icon: 'fa-file-export', label: '数据导出', bg: '#E6F4FF', color: '#1677FF' }
          ].map((g) => (
            <div key={g.label} onClick={() => navigate(g.to)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', borderRadius: 16, background: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              <div data-name="quick-icon" style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: g.bg, borderRadius: '16px 16px 0 0' }}>
                <i className={'fas ' + g.icon} style={{ fontSize: 22, color: g.color }} />
              </div>
              <div data-name="quick-body" style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span data-name="quick-label" style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{g.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 设置列表 */}
      <div data-name="settings-section" style={{ margin: '8px 20px 16px' }}>
        <div data-name="settings-card" style={{ borderRadius: 16, background: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
          {[
            { to: '/notification', icon: 'fa-bell', label: '通知设置', bg: '#E8F5EC', color: '#22A85A' },
            { to: '/privacy', icon: 'fa-shield-halved', label: '隐私设置', bg: '#E6F4FF', color: '#1677FF' },
            { to: '/help', icon: 'fa-circle-question', label: '帮助反馈', bg: '#FFF4E5', color: '#FA8C16' },
            { to: '/about', icon: 'fa-circle-info', label: '关于我们', bg: '#F3E8FF', color: '#9254DE', version: APP_VERSION }
          ].map((s, i) => (
            <div key={s.label}>
              <div onClick={() => navigate(s.to)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}>
                <div data-name="s-icon" style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={'fas ' + s.icon} style={{ fontSize: 16, color: s.color }} />
                </div>
                <span data-name="s-label" style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#1A1A1A', lineHeight: '20px' }}>{s.label}</span>
                {s.version && <span data-name="s-version" style={{ fontSize: 12, color: '#9CA3AF' }}>{s.version}</span>}
                <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC', flexShrink: 0 }} />
              </div>
              {i < 3 && <div data-name="settings-divider" style={{ height: 1, background: '#EEF0F2', margin: '0 16px' }} />}
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="/me" />
    </div>
  );
}
