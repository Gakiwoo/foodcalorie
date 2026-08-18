import React, { useState, useEffect, useCallback } from 'react';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar } from './src/ui/common';

// 夏季轻食挑战页：真实数据（GET challenges + join + checkin）
export default function FoodCalorieChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await http.get('/api/v1/foodcalorie/challenges');
      const list = r.data || [];
      setChallenge(list[0] || null);
    } catch (e) {
      toast(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function join() {
    if (!challenge || busy) return;
    setBusy(true);
    try {
      await http.post(`/api/v1/foodcalorie/challenges/${challenge.id}/join`);
      toast('已加入挑战，开始打卡吧！');
      load();
    } catch (e) {
      toast(e.message || '操作失败');
    } finally {
      setBusy(false);
    }
  }

  async function checkIn() {
    if (!challenge || busy) return;
    setBusy(true);
    try {
      await http.post(`/api/v1/foodcalorie/challenges/${challenge.id}/checkin`);
      toast('打卡成功 +10 积分');
      load();
    } catch (e) {
      toast(e.message || '操作失败');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="夏季轻食挑战" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!challenge) {
    return (
      <div data-name="FoodCalorie-Challenge" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <NavBar title="夏季轻食挑战" />
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>暂无进行中的挑战</div>
      </div>
    );
  }

  const totalDays = challenge.tasks.reduce((s, t) => s + (t.target || 0), 0) || 21;
  const pct = Math.min(100, Math.round((challenge.check_in_days / totalDays) * 100));

  const getTaskProgress = (t, i) => {
    if (i === 0) return challenge.check_in_days || 0;
    if (i === 1) return challenge.streak_days || 0;
    return t.completed || 0;
  };

  const getTaskStatusText = (t, i, progress) => {
    if (i === 0) return `已完成 ${progress}/${t.target} 天`;
    if (i === 1) return `已连续 ${progress} 天`;
    return `已完成 ${progress}/${t.target}`;
  };

  const cardShadow = '0px 4px 14px 0px rgba(0,0,0,0.05)';

  return (
    <div data-name="FoodCalorie-Challenge" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="夏季轻食挑战" right={<i className="fas fa-share-nodes" style={{ fontSize: 18, color: '#1A1A1A' }} />} />

      {/* Banner */}
      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', height: 150, borderRadius: 20, padding: '0 20px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>21 天打卡计划</span>
            <span style={{ fontSize: 22, lineHeight: '28px', fontWeight: 700, color: '#FFFFFF' }}>{challenge.name}</span>
            <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>健康饮食 21 天，赢专属徽章</span>
          </div>
          <i className="fas fa-medal" style={{ fontSize: 56, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
        </div>
      </div>

      {/* Info Card */}
      <div style={{ padding: '8px 20px' }}>
        <div style={{ width: '100%', padding: '16px 18px', borderRadius: 16, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: 700, color: '#1A1A1A' }}>{challenge.start_date}-{challenge.end_date}</span>
            <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 400, color: '#9CA3AF' }}>活动时间</span>
          </div>
          <div style={{ width: 1, height: 32, background: '#EEF0F2' }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: 700, color: '#34C759' }}>{challenge.participants || 0}</span>
            <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 400, color: '#9CA3AF' }}>参与人数</span>
          </div>
          <div style={{ width: 1, height: 32, background: '#EEF0F2' }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: 700, color: '#1A1A1A' }}>{challenge.completed || 0}</span>
            <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 400, color: '#9CA3AF' }}>已完成</span>
          </div>
        </div>
      </div>

      {/* 我的任务 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', padding: 16, borderRadius: 16, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 15, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>我的任务</span>
          {(challenge.tasks || []).map((t, i) => {
            const progress = getTaskProgress(t, i);
            const status = progress >= (t.target || 1) ? 'done' : progress > 0 ? 'doing' : 'todo';
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '100%', height: 1, background: '#EEF0F2' }} />}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10 }}>
                  {status === 'done' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-check" style={{ fontSize: 11, color: '#FFFFFF' }} />
                    </div>
                  )}
                  {status === 'doing' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-check" style={{ fontSize: 11, color: '#22A85A' }} />
                    </div>
                  )}
                  {status === 'todo' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-circle" style={{ fontSize: 8, color: '#D9DEE3' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                    <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 600, color: '#1A1A1A' }}>{t.name}</span>
                    <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 400, color: '#9CA3AF' }}>{getTaskStatusText(t, i, progress)}</span>
                  </div>
                  <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 600, color: '#22A85A', textAlign: 'right', flexShrink: 0 }}>+{t.points || 10} 积分</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 进度 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', padding: 16, borderRadius: 16, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>打卡进度</span>
            <span style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600, color: '#34C759' }}>{challenge.check_in_days}/{totalDays} 天</span>
          </div>
          <div style={{ width: '100%', height: 10, borderRadius: 5, background: '#F7F8FA', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: '#34C759', width: pct + '%' }} />
          </div>
          <span style={{ fontSize: 11, lineHeight: '15px', fontWeight: 400, color: '#9CA3AF' }}>{challenge.joined ? `再坚持 ${Math.max(0, totalDays - challenge.check_in_days)} 天即可获得「轻食达人」徽章` : '加入挑战即可开始打卡'}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ padding: '8px 20px 24px' }}>
        {challenge.joined ? (
          <button onClick={checkIn} disabled={busy} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'wait' : 'pointer' }}>
            <i className="fas fa-trophy" style={{ fontSize: 16, color: '#FFFFFF', marginRight: 8 }} />
            <span>{busy ? '处理中…' : '今日打卡 +10'}</span>
          </button>
        ) : (
          <button onClick={join} disabled={busy} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'wait' : 'pointer' }}>
            <i className="fas fa-trophy" style={{ fontSize: 16, color: '#FFFFFF', marginRight: 8 }} />
            <span>{busy ? '处理中…' : '立即参与挑战'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
