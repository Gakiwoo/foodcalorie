import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 单位设置页：真实数据（GET/PUT profile.unit_calorie + unit_weight）
export default function FoodCalorieUnit() {
  const navigate = useNavigate();
  const [calorie, setCalorie] = useState('kcal');
  const [weight, setWeight] = useState('g');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await http.put('/api/v1/foodcalorie/profile', { unit_calorie: calorie, unit_weight: weight });
      toast('单位已保存');
      navigate('/settings');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  return (
    <div data-name="FoodCalorie-Unit" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="单位设置" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>热量单位</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>1 kcal ≈ 4.184 kJ</div>
            <Seg options={[{ value: 'kcal', label: '千卡 kcal' }, { value: 'kJ', label: '千焦 kJ' }]} value={calorie} onChange={setCalorie} />
          </Card>
          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>重量单位</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>1 oz ≈ 28.35 g</div>
            <Seg options={[{ value: 'g', label: '克 g' }, { value: 'oz', label: '盎司 oz' }]} value={weight} onChange={setWeight} />
          </Card>
          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存设置'}</button>
          </div>
        </>
      )}
    </div>
  );
}
