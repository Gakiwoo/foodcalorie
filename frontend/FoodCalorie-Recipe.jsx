import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 食谱详情页：真实数据（GET /contents/:id 营养/食材/步骤 + 收藏/取消收藏）
export default function FoodCalorieRecipe() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [recipe, setRecipe] = useState(null);
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }

  const nutr = (label, val, unit = 'g') => (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 2px' }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>{val || 0}</div>
      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{label} {unit}</div>
    </div>
  );

  if (loading) return <div style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="食谱" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!recipe) {
    return (
      <div data-name="FoodCalorie-Recipe" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="食谱" />
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>内容不存在或已删除</div>
      </div>
    );
  }

  return (
    <div data-name="FoodCalorie-Recipe" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="食谱" right={
        <i className={'fas fa-bookmark'} style={{ fontSize: 16, color: faved ? '#34C759' : '#C0C4CC', cursor: 'pointer' }} onClick={toggleFav} />
      } />

      {/* 封面 */}
      <div style={{ margin: '6px 20px 14px' }}>
        <div style={{ borderRadius: 20, padding: '22px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 40 }}>{recipe.cover_icon || '🍽️'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.4 }}>{recipe.title}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 6 }}>{recipe.summary || ''}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{recipe.author} · {recipe.views} 阅读</div>
          </div>
        </div>
      </div>

      {/* 营养 */}
      <Card style={{ margin: '0 20px 14px', padding: '6px 8px', display: 'flex' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 2px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#E8590C' }}>{recipe.calories || 0}</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>热量 kcal</div>
        </div>
        {nutr('蛋白质', recipe.protein_g)}
        {nutr('碳水', recipe.carbs_g)}
        {nutr('脂肪', recipe.fat_g)}
      </Card>

      {/* 食材 */}
      <div style={{ padding: '0 20px 14px' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>所需食材</span>
        <Card style={{ marginTop: 10, padding: '4px 16px' }}>
          {(recipe.ingredients || []).map((ing, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: i < recipe.ingredients.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <i className="fas fa-check-circle" style={{ fontSize: 13, color: '#34C759' }} />
              <span style={{ fontSize: 13, color: '#374151' }}>{ing}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* 步骤 */}
      <div style={{ padding: '0 20px 24px' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>烹饪步骤</span>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(recipe.steps || []).map((s, i) => (
            <Card key={i} style={{ display: 'flex', gap: 12, padding: 13 }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: '#34C759', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, flex: 1 }}>{s}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
