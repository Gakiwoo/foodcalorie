import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, ToggleSwitch } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

const SWITCHES = [
  { key: 'notif_record', label: '记录提醒', desc: '到了饭点提醒记录饮食' },
  { key: 'notif_goal', label: '目标达成提醒', desc: '达到每日目标热量时通知' },
  { key: 'notif_community', label: '社区互动', desc: '点赞、评论、关注通知' },
  { key: 'notif_weekly', label: '每周报告', desc: '每周日发送本周饮食总结' },
  { key: 'notif_activity', label: '活动通知', desc: '挑战活动、运营活动通知' }
];

export default function FoodCalorieNotification() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState({ notif_record: 1, notif_goal: 1, notif_community: 0, notif_weekly: 1, notif_activity: 0 });
  const [quiet, setQuiet] = useState({ start: '22:00', end: '08:00' });
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        const d = r.data;
        setFlags({
          notif_record: d.notif_record ?? 1,
          notif_goal: d.notif_goal ?? 1,
          notif_community: d.notif_community ?? 0,
          notif_weekly: d.notif_weekly ?? 1,
          notif_activity: d.notif_activity ?? 0
        });
        setQuiet({ start: d.quiet_start || '22:00', end: d.quiet_end || '08:00' });
      } catch (e) {
        toast(e.message || '加载失败，请先登录');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    await runSaving(async () => {
      try {
        const body = {}
        for (const k of Object.keys(flags)) body[k] = !!flags[k]
        body.quiet_start = quiet.start
        body.quiet_end = quiet.end
        await http.put('/api/v1/foodcalorie/profile', body);
        toast('通知设置已保存');
        navigate('/settings');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Notification">
      <StatusBar />
      <NavBar title="通知设置" />

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px', padding: '4px 16px' }}>
            {SWITCHES.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i < SWITCHES.length - 1 ? `1px solid ${colors.borderLight}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>{s.label}</div>
                  <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{s.desc}</div>
                </div>
                <ToggleSwitch checked={!!flags[s.key]} label={s.label} onChange={(v) => setFlags((f) => ({ ...f, [s.key]: v ? 1 : 0 }))} />
              </div>
            ))}
          </Card>

          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 4 }}>免打扰时段</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 14 }}>该时段内不推送通知</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="time" value={quiet.start} onChange={(e) => setQuiet((q) => ({ ...q, start: e.target.value }))} style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '11px 12px', fontSize: fontSize.lg, outline: 'none', color: colors.textPrimary }} />
              <span style={{ color: colors.textTertiary, fontWeight: fontWeight.semibold }}>至</span>
              <input type="time" value={quiet.end} onChange={(e) => setQuiet((q) => ({ ...q, end: e.target.value }))} style={{ flex: 1, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: '11px 12px', fontSize: fontSize.lg, outline: 'none', color: colors.textPrimary }} />
            </div>
          </Card>

          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存设置'}</button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
