import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieBurst() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setEnabled(!!r.data.burst_enabled);
        setCount(r.data.burst_count || 3);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    await runSaving(async () => {
      try {
        await http.put('/api/v1/foodcalorie/profile', { burst_enabled: enabled, burst_count: count });
        toast('设置已保存');
        navigate('/settings');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Burst">
      <StatusBar />
      <NavBar title="连拍模式" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: radius.lg, background: colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-camera" style={{ fontSize: 16, color: colors.primaryDark }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>启用连拍模式</div>
              <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>摆盘复杂时开启，自动选清晰度最高的一张</div>
            </div>
            <div onClick={() => setEnabled(!enabled)} style={{ width: 46, height: 26, borderRadius: 13, background: enabled ? colors.primary : colors.textDisabled, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: enabled ? 23 : 3, width: 20, height: 20, borderRadius: 10, background: colors.surface, transition: 'left .2s' }} />
            </div>
          </Card>

          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 12 }}>连拍张数</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[2, 3, 5].map((n) => (
                <div key={n} onClick={() => setCount(n)} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: radius.lg, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: 'pointer', background: count === n ? colors.primary : colors.borderLight, color: count === n ? colors.textInverse : colors.textSecondary }}>
                  {n} 张
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ margin: '0 20px 12px', background: '#FFF7E8', boxShadow: 'none' }}>
            <div style={{ fontSize: fontSize.sm, color: '#B25E09', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <i className="fas fa-circle-info" style={{ marginTop: 1 }} />
              <span>连拍占用更多存储，日常可关闭。</span>
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
