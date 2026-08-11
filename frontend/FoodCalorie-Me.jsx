import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http, apiClient } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar } from './src/ui/common';

// 我的页：真实数据（/auth/me 用户信息 + profile 目标 + 今日摄入摘要；data-name 保留供全局 NAV 跳转）
export default function FoodCalorieMe() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    (async () => {
      // 用户信息
      try {
        const me = await apiClient('/api/auth/me');
        setUser(me.user);
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

  const initial = (user?.nickname || user?.email || '?').slice(0, 1).toUpperCase();
  const avatarBg = authed ? 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)' : 'linear-gradient(135deg,#D1D5DB 0%,#9CA3AF 100%)';
  const today = todayStr();

  return (
    <div data-name="FoodCalorie-Me" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />

      {/* 个人信息卡 */}
      <div data-name="profile-section" style={{ margin: '6px 20px 14px' }}>
        <div data-name="profile-card" style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div data-name="avatar" style={{ width: 60, height: 60, borderRadius: 30, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-user" style={{ fontSize: 24, color: '#FFFFFF' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div data-name="profile-name" style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {authed ? (user?.nickname || '未设置昵称') : '未登录'}
              </div>
              <div data-name="profile-bio" style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {authed ? (user?.email || '') + (stats ? ' · 目标 ' + stats.target + ' kcal' : '') : '点击右侧箭头登录账号'}
              </div>
            </div>
            <div data-name="profile-arrow" style={{ width: 34, height: 34, borderRadius: 17, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <i className="fas fa-chevron-right" style={{ fontSize: 13, color: '#6B7280' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 今日记录摘要 */}
      <div style={{ margin: '0 20px 14px' }}>
        <div data-name="today-card" style={{ borderRadius: 20, background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', padding: '16px 18px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <i className="fas fa-bowl-food" style={{ fontSize: 22, opacity: 0.9 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, opacity: 0.9 }}>今日摄入</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{stats ? stats.total + ' kcal' : '-- kcal'}<span style={{ fontSize: 11, opacity: 0.85 }}> / {stats ? stats.target : '--'} 目标</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{stats ? stats.percent + '%' : '--'}</div>
            <div style={{ fontSize: 10, opacity: 0.85 }}>{stats && stats.total <= stats.target ? '未超标 ✓' : stats ? '已超标 ⚠' : '查看记录'}</div>
          </div>
        </div>
      </div>

      {/* 快捷宫格 */}
      <div style={{ margin: '0 20px 14px' }}>
        <div style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '16px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>快捷功能</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { n: 'quick-1', icon: 'fa-clipboard-list', label: '我的记录' },
              { n: 'quick-2', icon: 'fa-bullseye', label: '目标设置' },
              { n: 'quick-3', icon: 'fa-bookmark', label: '我的收藏' },
              { n: 'quick-4', icon: 'fa-file-export', label: '数据导出' }
            ].map((g) => (
              <div key={g.label} data-name={g.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 0', borderRadius: 14, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={'fas ' + g.icon} style={{ fontSize: 16, color: '#22A85A' }} />
                </div>
                <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600 }}>{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 设置列表 */}
      <div style={{ margin: '0 20px 14px' }}>
        <div style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '4px 16px' }}>
          {[
            { n: 1, icon: 'fa-bell', label: '通知设置' },
            { n: 2, icon: 'fa-shield-halved', label: '隐私设置' },
            { n: 3, icon: 'fa-circle-question', label: '帮助反馈' },
            { n: 4, icon: 'fa-circle-info', label: '关于食刻' }
          ].map((s, i) => (
            <div key={s.n} data-name={'settings-row-' + s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}>
              <div data-name={'s-icon-' + s.n} style={{ width: 34, height: 34, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={'fas ' + s.icon} style={{ fontSize: 13, color: '#6B7280' }} />
              </div>
              <span data-name={'s-label-' + s.n} style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{s.label}</span>
              <i data-name={'s-arrow-' + s.n} className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC' }} />
            </div>
          ))}
        </div>
      </div>

      {/* 退出登录 */}
      <div style={{ margin: '0 20px 24px' }}>
        <div data-name="logout-card" style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '15px 0', textAlign: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#E03131' }}>{authed ? '退出登录' : '登录账号'}</span>
        </div>
      </div>
    </div>
  );
}
