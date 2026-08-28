import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

const MODES = [
  { value: 'fast', name: '快速', desc: '约 1 秒识别常见食物，省电', icon: 'fa-bolt' },
  { value: 'standard', name: '标准', desc: '约 2 秒识别，准确均衡', icon: 'fa-scale-balanced' },
  { value: 'precise', name: '精准', desc: '约 4 秒识别细分类目，最准确', icon: 'fa-microscope' }
];

export default function FoodCaloriePrecision() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('standard');
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setMode(r.data.precision_mode || 'standard');
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
        await http.put('/api/v1/foodcalorie/profile', { precision_mode: mode });
        toast('精度已保存');
        navigate('/settings');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Precision">
      <StatusBar />
      <NavBar title="拍照识别精度" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <div style={{ padding: '6px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODES.map((m) => {
              const on = mode === m.value;
              return (
                <Card key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, cursor: 'pointer', border: on ? `1.5px solid ${colors.primary}` : '1.5px solid transparent' }} onClick={() => setMode(m.value)}>
                  <div style={{ width: 40, height: 40, borderRadius: radius.lg, background: on ? colors.primary : colors.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={'fas ' + m.icon} style={{ fontSize: 16, color: on ? colors.textInverse : colors.textTertiary }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>{m.name}</div>
                    <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{m.desc}</div>
                  </div>
                  {on && <i className="fas fa-circle-check" style={{ fontSize: 18, color: colors.primary }} />}
                </Card>
              );
            })}
          </div>
          <Card style={{ margin: '0 20px 12px', background: '#FFF7E8', boxShadow: 'none' }}>
            <div style={{ fontSize: fontSize.sm, color: '#B25E09', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <i className="fas fa-circle-info" style={{ marginTop: 1 }} />
              <span>精度越高耗时耗电越多，日常使用建议「标准」。</span>
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
