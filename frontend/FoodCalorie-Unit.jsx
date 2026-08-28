import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieUnit() {
  const navigate = useNavigate();
  const [calorie, setCalorie] = useState('kcal');
  const [weight, setWeight] = useState('g');
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setCalorie(r.data.unit_calorie || 'kcal');
        setWeight(r.data.unit_weight || 'g');
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
        await http.put('/api/v1/foodcalorie/profile', { unit_calorie: calorie, unit_weight: weight });
        toast('单位已保存');
        navigate('/settings');
      } catch (e) {
        toast(e.message || '保存失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Unit">
      <StatusBar />
      <NavBar title="单位设置" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 4 }}>热量单位</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 12 }}>1 kcal ≈ 4.184 kJ</div>
            <Seg options={[{ value: 'kcal', label: '千卡 kcal' }, { value: 'kJ', label: '千焦 kJ' }]} value={calorie} onChange={setCalorie} />
          </Card>
          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 4 }}>重量单位</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 12 }}>1 oz ≈ 28.35 g</div>
            <Seg options={[{ value: 'g', label: '克 g' }, { value: 'oz', label: '盎司 oz' }]} value={weight} onChange={setWeight} />
          </Card>
          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存设置'}</button>
          </div>
        </>
      )}
    </PageContainer>
  );
}
