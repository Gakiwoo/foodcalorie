import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 编辑记录页：真实数据（GET 填充 → PUT 部分更新）
export default function FoodCalorieEditRecord() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ food_name: '', meal_type: '午餐', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, portion: '1 份', record_time: '' });

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/' + id);
        const d = r.data;
        setForm({
          food_name: d.food_name || '',
          meal_type: d.meal_type || '午餐',
          calories: d.calories || 0,
          protein_g: d.protein_g || 0,
          carbs_g: d.carbs_g || 0,
          fat_g: d.fat_g || 0,
          portion: d.portion || '1 份',
          record_time: d.record_time || ''
        });
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.food_name.trim()) return toast('食物名称不能为空');
    if (!Number(form.calories) || Number(form.calories) <= 0) return toast('请输入有效热量');
    setSaving(true);
    try {
      await http.put('/api/v1/foodcalorie/records/' + id, {
        food_name: form.food_name.trim(),
        meal_type: form.meal_type,
        calories: Math.round(Number(form.calories)),
        protein_g: Number(form.protein_g) || 0,
        carbs_g: Number(form.carbs_g) || 0,
        fat_g: Number(form.fat_g) || 0,
        portion: form.portion || '1 份',
        record_time: form.record_time
      });
      toast('记录已更新');
      navigate('/detail?id=' + id);
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  const field = (label, placeholder, value, onChange, type = 'number') => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{label}</span>
      <input value={value} onChange={onChange} type={type} placeholder={placeholder} style={{ border: 'none', outline: 'none', textAlign: 'right', fontSize: 14, color: '#1A1A1A', width: 160, background: 'transparent' }} />
    </div>
  );

  if (loading) return <div style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="编辑记录" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!id) {
    return (
      <div data-name="FoodCalorie-EditRecord" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="编辑记录" />
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>缺少记录参数</div>
      </div>
    );
  }

  return (
    <div data-name="FoodCalorie-EditRecord" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="编辑记录" right={<span style={{ fontSize: 13, color: '#22A85A', fontWeight: 600 }} onClick={save}>保存</span>} />

      <Card style={{ margin: '6px 20px 12px', padding: '0 16px' }}>
        {field('食物名称', '如：红烧牛肉面', form.food_name, set('food_name'), 'text')}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F3F4F6' }}>
          <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>餐次</span>
          <Seg options={[{ value: '早餐', label: '早餐' }, { value: '午餐', label: '午餐' }, { value: '晚餐', label: '晚餐' }, { value: '加餐', label: '加餐' }]} value={form.meal_type} onChange={(v) => setForm((f) => ({ ...f, meal_type: v }))} />
        </div>
        {field('热量 (kcal)', '如 520', form.calories, set('calories'))}
        {field('蛋白质 (g)', '如 28', form.protein_g, set('protein_g'))}
        {field('碳水 (g)', '如 65', form.carbs_g, set('carbs_g'))}
        {field('脂肪 (g)', '如 18', form.fat_g, set('fat_g'))}
        {field('份量', '如 1 份 / 2 碗', form.portion, set('portion'), 'text')}
        {field('记录时间', 'YYYY-MM-DD HH:mm', form.record_time, set('record_time'), 'text')}
      </Card>

      <div style={{ padding: '10px 20px' }}>
        <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存修改'}</button>
      </div>
    </div>
  );
}
