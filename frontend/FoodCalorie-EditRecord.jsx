import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieEditRecord() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [loading, setLoading] = useState(true);
  const { busy: saving, run: runSaving } = useBusy();
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
    await runSaving(async () => {
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
      }
    });
  }

  const field = (label, placeholder, value, onChange, type = 'number') => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
      <span style={{ fontSize: fontSize.lg, color: colors.textPrimary, fontWeight: fontWeight.medium }}>{label}</span>
      <input value={value} onChange={onChange} type={type} placeholder={placeholder} aria-label={label} style={{ border: 'none', outline: 'none', textAlign: 'right', fontSize: fontSize.lg, color: colors.textPrimary, width: 160, background: 'transparent' }} />
    </div>
  );

  if (loading) return <PageContainer><StatusBar /><NavBar title="编辑记录" /><div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div></PageContainer>;

  if (!id) {
    return (
      <PageContainer data-name="FoodCalorie-EditRecord">
        <StatusBar /><NavBar title="编辑记录" />
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>缺少记录参数</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer data-name="FoodCalorie-EditRecord">
      <StatusBar />
      <NavBar title="编辑记录" right={<span style={{ fontSize: fontSize.md, color: colors.primaryDark, fontWeight: fontWeight.semibold }} onClick={save}>保存</span>} />

      <Card style={{ margin: '6px 20px 12px', padding: '0 16px' }}>
        {field('食物名称', '如：红烧牛肉面', form.food_name, set('food_name'), 'text')}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
          <span style={{ fontSize: fontSize.lg, color: colors.textPrimary, fontWeight: fontWeight.medium }}>餐次</span>
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
        <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.lg, fontWeight: fontWeight.bold, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存修改'}</button>
      </div>
    </PageContainer>
  );
}
