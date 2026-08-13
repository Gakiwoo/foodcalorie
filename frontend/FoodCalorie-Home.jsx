import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, Ring } from './src/ui/common';

// 首页：真实数据（GET stats 今日摄入环 + 快捷入口；data-name 保留供全局 NAV 跳转）
export default function FoodCalorieHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [authed, setAuthed] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/stats', { range: 'day', date: todayStr() });
        setStats(r.data);
      } catch (e) {
        if (e.status === 401) setAuthed(false);
        else toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';
  const today = todayStr();

  return (
    <div data-name="FoodCalorie-Home" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />

      {/* 顶部：问候 + 设置 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{greet}，{today.slice(5)}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>食刻</div>
        </div>
        <div onClick={() => navigate('/settings')} style={{ width: 36, height: 36, borderRadius: 18, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
          <i className="fas fa-gear" style={{ fontSize: 15, color: '#1A1A1A' }} />
        </div>
      </div>

      {/* 拍照识别卡 */}
      <div style={{ margin: '6px 20px 14px' }}>
        <div onClick={() => navigate('/camera')} style={{ borderRadius: 20, padding: '18px 20px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-camera" style={{ fontSize: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>拍照识别</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>拍一拍，自动识别食物与热量</div>
          </div>
          <i className="fas fa-chevron-right" style={{ fontSize: 14, opacity: 0.8 }} />
        </div>
      </div>

      {/* 今日摄入卡（真实数据） */}
      <div style={{ margin: '0 20px 14px' }}>
        <div onClick={() => navigate('/today')} style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }}>
          {loading ? (
            <div style={{ padding: '24px 0', flex: 1, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>加载中…</div>
          ) : !authed ? (
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>登录后查看今日摄入</div>
              <button onClick={() => navigate('/login')} style={{ marginTop: 10, padding: '8px 26px', borderRadius: 12, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>去登录</button>
            </div>
          ) : (
            <>
              <Ring size={110} stroke={11} percent={stats.percent} label={stats.total} sub="已摄入 kcal" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>今日目标</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{stats.target}<span style={{ fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}> kcal</span></div>
                </div>
                <div style={{ fontSize: 12, color: stats.total <= stats.target ? '#22A85A' : '#E8590C', fontWeight: 600 }}>
                  {stats.total <= stats.target ? `还可摄入 ${stats.target - stats.total} kcal` : `已超出 ${stats.total - stats.target} kcal`}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>达标 {stats.reachedDays}/{stats.totalDays} 天 · 点击查看今日记录</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 快捷宫格 */}
      <div style={{ margin: '0 20px 14px' }}>
        <div style={{ borderRadius: 20, background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '18px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>快捷入口</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { to: '/records', icon: 'fa-clipboard-list', label: '记录' },
              { to: '/discover', icon: 'fa-compass', label: '发现' },
              { to: '/me', icon: 'fa-user', label: '我的' },
              { to: '/camera', icon: 'fa-camera', label: '拍照' }
            ].map((g) => (
              <div key={g.label} onClick={() => navigate(g.to)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 0', borderRadius: 14, cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={'fas ' + g.icon} style={{ fontSize: 17, color: '#22A85A' }} />
                </div>
                <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 600 }}>{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#FFFFFF', borderTop: '1px solid #F0F2F5', padding: '8px 0 20px' }}>
        {[{ k: '/', i: 'fa-house', l: '首页' }, { k: '/discover', i: 'fa-compass', l: '发现' }, { k: '/records', i: 'fa-clipboard-list', l: '记录' }, { k: '/me', i: 'fa-user', l: '我的' }].map((n) => (
          <div key={n.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => navigate(n.k)}>
            <i className={'fas ' + n.i} style={{ fontSize: 18, color: n.k === '/' ? '#34C759' : '#C0C4CC' }} />
            <span style={{ fontSize: 10, color: n.k === '/' ? '#34C759' : '#9CA3AF' }}>{n.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
