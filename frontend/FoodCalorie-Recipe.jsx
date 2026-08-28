import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieRecipe() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [recipe, setRecipe] = useState(null);
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { run: runFav } = useBusy();

  const loadFav = useCallback(async () => {
    try {
      const r = await http.get('/api/v1/foodcalorie/favorites', { type: 'recipe' });
      setFaved((r.data || []).some((f) => f.ref_id === Number(id)));
    } catch {
      setFaved(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/contents/' + id);
        setRecipe(r.data);
        loadFav();
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, loadFav]);

  async function toggleFav() {
    await runFav(async () => {
      try {
        if (faved) {
          await http.del('/api/v1/foodcalorie/favorites?type=recipe&ref_id=' + id);
          setFaved(false);
          toast('已取消收藏');
        } else {
          await http.post('/api/v1/foodcalorie/favorites', { type: 'recipe', ref_id: Number(id) });
          setFaved(true);
          toast('已收藏食谱');
        }
      } catch (e) {
        toast(e.message || '操作失败');
      }
    });
  }

  const nutr = (label, val, unit = 'g') => (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 2px' }}>
      <div style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: colors.textPrimary }}>{val || 0}</div>
      <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{label} {unit}</div>
    </div>
  );

  if (loading) return <PageContainer><StatusBar /><NavBar title="食谱" /><div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div></PageContainer>;

  if (!recipe) {
    return (
      <PageContainer data-name="FoodCalorie-Recipe">
        <StatusBar /><NavBar title="食谱" />
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>内容不存在或已删除</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer data-name="FoodCalorie-Recipe">
      <StatusBar />
      <NavBar title="食谱" right={
        <i className={'fas fa-bookmark'} role="button" tabIndex={0} aria-label={faved ? '取消收藏' : '收藏食谱'} style={{ fontSize: 16, color: faved ? colors.primary : '#C0C4CC', cursor: 'pointer' }} onClick={toggleFav} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFav(); } }} />
      } />

      <div style={{ margin: '6px 20px 14px' }}>
        <div style={{ borderRadius: radius.xxl, padding: '22px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: colors.textInverse, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 40 }}>{recipe.cover_icon || '🍽️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: fontWeight.extrabold, lineHeight: 1.4 }}>{recipe.title}</div>
            <div style={{ fontSize: fontSize.xs, opacity: 0.85, marginTop: 6 }}>{recipe.summary || ''}</div>
            <div style={{ fontSize: fontSize.xs, opacity: 0.85, marginTop: 4 }}>{recipe.author} · {recipe.views} 阅读</div>
          </div>
        </div>
      </div>

      <Card style={{ margin: '0 20px 14px', padding: '6px 8px', display: 'flex' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 2px' }}>
          <div style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.extrabold, color: '#E8590C' }}>{kcal(recipe.calories)}</div>
          <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>热量 {unitCalorie}</div>
        </div>
        {nutr('蛋白质', g(recipe.protein_g), unitWeight)}
        {nutr('碳水', g(recipe.carbs_g), unitWeight)}
        {nutr('脂肪', g(recipe.fat_g), unitWeight)}
      </Card>

      <div style={{ padding: '0 20px 14px' }}>
        <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>所需食材</span>
        <Card style={{ marginTop: 10, padding: '4px 16px' }}>
          {(recipe.ingredients || []).map((ing, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: i < recipe.ingredients.length - 1 ? `1px solid ${colors.borderLight}` : 'none' }}>
              <i className="fas fa-check-circle" style={{ fontSize: 13, color: colors.primary }} />
              <span style={{ fontSize: fontSize.md, color: '#374151' }}>{ing}</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ padding: '0 20px 24px' }}>
        <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>烹饪步骤</span>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(recipe.steps || []).map((s, i) => (
            <Card key={i} style={{ display: 'flex', gap: 12, padding: 13 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: colors.primary, color: colors.textInverse, fontSize: fontSize.sm, fontWeight: fontWeight.bold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: fontSize.md, color: '#374151', lineHeight: 1.6, flex: 1 }}>{s}</span>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
