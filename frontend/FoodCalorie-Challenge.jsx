import React, { useState, useEffect, useCallback } from 'react';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const { busy, run: runBusy } = useBusy();

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
    if (!challenge) return;
    await runBusy(async () => {
      try {
        await http.post(`/api/v1/foodcalorie/challenges/${challenge.id}/join`);
        toast('已加入挑战，开始打卡吧！');
        load();
      } catch (e) {
        toast(e.message || '操作失败');
      }
    });
  }

  async function checkIn() {
    if (!challenge) return;
    await runBusy(async () => {
      try {
        await http.post(`/api/v1/foodcalorie/challenges/${challenge.id}/checkin`);
        toast('打卡成功 +10 积分');
        load();
      } catch (e) {
        toast(e.message || '操作失败');
      }
    });
  }

  if (loading) return <PageContainer><StatusBar /><NavBar title="夏季轻食挑战" /><div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div></PageContainer>;

  if (!challenge) {
    return (
      <PageContainer data-name="FoodCalorie-Challenge">
        <StatusBar />
        <NavBar title="夏季轻食挑战" />
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>暂无进行中的挑战</div>
      </PageContainer>
    );
  }

  const totalDays = (challenge.tasks || []).reduce((s, t) => s + (t.target || 0), 0) || 21;
  const pct = Math.min(100, Math.round(((challenge.check_in_days || 0) / totalDays) * 100));

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

  return (
    <PageContainer data-name="FoodCalorie-Challenge">
      <StatusBar />
      <NavBar title="夏季轻食挑战" right={<i className="fas fa-share-nodes" style={{ fontSize: 18, color: colors.textPrimary }} />} />

      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', height: 150, borderRadius: radius.xxl, padding: '0 20px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.semibold, color: 'rgba(255,255,255,0.9)' }}>21 天打卡计划</span>
            <span style={{ fontSize: 22, lineHeight: '28px', fontWeight: fontWeight.bold, color: colors.textInverse }}>{challenge.name}</span>
            <span style={{ fontSize: fontSize.sm, lineHeight: '16px', fontWeight: fontWeight.regular, color: 'rgba(255,255,255,0.85)' }}>健康饮食 21 天，赢专属徽章</span>
          </div>
          <i className="fas fa-medal" style={{ fontSize: 56, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ padding: '8px 20px' }}>
        <div style={{ width: '100%', padding: '16px 18px', borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: fontWeight.bold, color: colors.textPrimary }}>{challenge.start_date}-{challenge.end_date}</span>
            <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.regular, color: colors.textTertiary }}>活动时间</span>
          </div>
          <div style={{ width: 1, height: 32, background: colors.segBg }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: fontWeight.bold, color: colors.primary }}>{challenge.participants || 0}</span>
            <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.regular, color: colors.textTertiary }}>参与人数</span>
          </div>
          <div style={{ width: 1, height: 32, background: colors.segBg }} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 18, lineHeight: '22px', fontWeight: fontWeight.bold, color: colors.textPrimary }}>{challenge.completed || 0}</span>
            <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.regular, color: colors.textTertiary }}>已完成</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', padding: 16, borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: fontSize.xl, lineHeight: '20px', fontWeight: fontWeight.bold, color: colors.textPrimary }}>我的任务</span>
          {(challenge.tasks || []).map((t, i) => {
            const progress = getTaskProgress(t, i);
            const status = progress >= (t.target || 1) ? 'done' : progress > 0 ? 'doing' : 'todo';
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '100%', height: 1, background: colors.segBg }} />}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 10 }}>
                  {status === 'done' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-check" style={{ fontSize: 11, color: colors.textInverse }} />
                    </div>
                  )}
                  {status === 'doing' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-check" style={{ fontSize: 11, color: colors.primaryDark }} />
                    </div>
                  )}
                  {status === 'todo' && (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fas fa-circle" style={{ fontSize: 8, color: '#D9DEE3' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                    <span style={{ fontSize: fontSize.lg, lineHeight: '20px', fontWeight: fontWeight.semibold, color: colors.textPrimary }}>{t.name}</span>
                    <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.regular, color: colors.textTertiary }}>{getTaskStatusText(t, i, progress)}</span>
                  </div>
                  <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.semibold, color: colors.primaryDark, textAlign: 'right', flexShrink: 0 }}>+{t.points || 10} 积分</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', padding: 16, borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: fontSize.xl, lineHeight: '20px', fontWeight: fontWeight.bold, color: colors.textPrimary }}>打卡进度</span>
            <span style={{ fontSize: fontSize.lg, lineHeight: '18px', fontWeight: fontWeight.semibold, color: colors.primary }}>{challenge.check_in_days}/{totalDays} 天</span>
          </div>
          <div style={{ width: '100%', height: 10, borderRadius: 5, background: colors.bg, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 5, background: colors.primary, width: pct + '%' }} />
          </div>
          <span style={{ fontSize: fontSize.xs, lineHeight: '15px', fontWeight: fontWeight.regular, color: colors.textTertiary }}>{challenge.joined ? `再坚持 ${Math.max(0, totalDays - challenge.check_in_days)} 天即可获得「轻食达人」徽章` : '加入挑战即可开始打卡'}</span>
        </div>
      </div>

      <div style={{ padding: '8px 20px 24px' }}>
        {challenge.joined ? (
          <button onClick={checkIn} disabled={busy} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.display, fontWeight: fontWeight.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'wait' : 'pointer' }}>
            <i className="fas fa-trophy" style={{ fontSize: 16, color: colors.textInverse, marginRight: 8 }} />
            <span>{busy ? '处理中…' : '今日打卡 +10'}</span>
          </button>
        ) : (
          <button onClick={join} disabled={busy} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.display, fontWeight: fontWeight.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: busy ? 'wait' : 'pointer' }}>
            <i className="fas fa-trophy" style={{ fontSize: 16, color: colors.textInverse, marginRight: 8 }} />
            <span>{busy ? '处理中…' : '立即参与挑战'}</span>
          </button>
        )}
      </div>
    </PageContainer>
  );
}
