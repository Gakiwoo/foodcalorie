import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 夏季轻食挑战页：真实数据（GET challenges + join + checkin）
export default function FoodCalorieChallenge() {
  const navigate = useNavigate();
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

  if (loading) return <div style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="夏季轻食挑战" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!challenge) {
    return (
      <div data-name="FoodCalorie-Challenge" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <NavBar title="夏季轻食挑战" />
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>暂无进行中的挑战</div>
      </div>
    );
  }

  const totalDays = challenge.tasks.reduce((s, t) => s + (t.target || 0), 0) || 21;
  const pct = Math.min(100, Math.round((challenge.check_in_days / totalDays) * 100));

  return (
    <div data-name="FoodCalorie-Challenge" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="夏季轻食挑战" right={<i className="fas fa-share-nodes" style={{ fontSize: 15, color: '#1A1A1A' }} />} />

      {/* Banner */}
      <div style={{ margin: '6px 20px 14px' }}>
        <div style={{ borderRadius: 16, padding: '20px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.85 }}>21 天打卡计划</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{challenge.name}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 6 }}>{challenge.start_date} ~ {challenge.end_date}</div>
          <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
            <div><div style={{ fontSize: 18, fontWeight: 800 }}>{challenge.check_in_days} 天</div><div style={{ fontSize: 10, opacity: 0.85 }}>已打卡</div></div>
            <div><div style={{ fontSize: 18, fontWeight: 800 }}>{challenge.streak_days || 0} 天</div><div style={{ fontSize: 10, opacity: 0.85 }}>连续打卡</div></div>
            <div><div style={{ fontSize: 18, fontWeight: 800 }}>{challenge.my_points}</div><div style={{ fontSize: 10, opacity: 0.85 }}>我的积分</div></div>
            <div><div style={{ fontSize: 18, fontWeight: 800 }}>{pct}%</div><div style={{ fontSize: 10, opacity: 0.85 }}>完成度</div></div>
          </div>
        </div>
      </div>

      {/* 进度 */}
      <Card style={{ margin: '0 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>
          <span>打卡进度</span><span style={{ color: '#34C759' }}>{challenge.check_in_days}/{totalDays} 天</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#E8F5EC', marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#34C759,#1FA355)', width: pct + '%' }} />
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>{challenge.joined ? '坚持打卡，赢取「轻食达人」徽章' : '加入挑战即可开始打卡'}</div>
      </Card>

      {/* 我的任务 */}
      <div style={{ padding: '0 20px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>我的任务</span>
        {(challenge.tasks || []).map((t, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-check" style={{ fontSize: 13, color: '#22A85A' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{i === 0 ? challenge.check_in_days + '/' + t.target + ' 天已完成' : t.target + ' 次'}</div>
            </div>
            <span style={{ fontSize: 11, color: '#22A85A', fontWeight: 600 }}>+10</span>
          </Card>
        ))}
      </div>

      {/* 操作按钮 */}
      <div style={{ padding: '8px 20px 24px' }}>
        {challenge.joined ? (
          <button onClick={checkIn} disabled={busy} style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 16, fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}>{busy ? '处理中…' : '今日打卡 +10'}</button>
        ) : (
          <button onClick={join} disabled={busy} style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 16, fontWeight: 700, cursor: busy ? 'wait' : 'pointer' }}>{busy ? '处理中…' : '立即参与挑战'}</button>
        )}
      </div>
    </div>
  );
}
