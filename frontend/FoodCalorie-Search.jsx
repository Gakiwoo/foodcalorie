import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, MealPills } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';
import { useDebouncedSearch } from './src/ui/useDebouncedSearch';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

const MEAL_OPTIONS = [
  { value: '全部', label: '全部' },
  { value: '早餐', label: '早餐' },
  { value: '午餐', label: '午餐' },
  { value: '晚餐', label: '晚餐' },
  { value: '加餐', label: '加餐' }
];

const GRADIENTS = [
  'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
  'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
  'linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%)',
  'linear-gradient(135deg, #FFCDD2 0%, #EF9A9A 100%)',
  'linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)',
  'linear-gradient(135deg, #B2DFDB 0%, #80CBC4 100%)'
];

export default function FoodCalorieSearch() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [keyword, setKeyword] = useState('');
  const [meal, setMeal] = useState('全部');
  const { run: runAdding } = useBusy();
  const [sortAsc, setSortAsc] = useState(false);

  const fetchFoods = useCallback(
    async (kw) => http.get('/api/v1/foodcalorie/foods', { keyword: kw, pageSize: 30 }),
    []
  );
  const { loading, searched, results } = useDebouncedSearch(keyword, fetchFoods);

  const displayedResults = useMemo(() => {
    if (!sortAsc) return results;
    return [...results].sort((a, b) => (a.calories || 0) - (b.calories || 0));
  }, [results, sortAsc]);

  function mealForAdd() {
    return meal === '全部' ? '午餐' : meal;
  }

  async function addRecord(f) {
    await runAdding(async () => {
      try {
        await http.post('/api/v1/foodcalorie/records', {
          food_name: f.name,
          category: f.category || null,
          meal_type: mealForAdd(),
          calories: f.calories || 0,
          protein_g: f.protein_g || 0,
          carbs_g: f.carbs_g || 0,
          fat_g: f.fat_g || 0,
          portion: f.unit_desc || '1 份',
          record_time: nowDateTime(),
          source: 'search'
        });
        toast('已添加「' + f.name + '」');
        navigate('/records');
      } catch (e) {
        toast(e.message || '添加失败');
      }
    });
  }

  return (
    <PageContainer data-name="FoodCalorie-Search">
      <StatusBar />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: colors.textPrimary, cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <div style={{ flex: 1, height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: colors.surface, borderRadius: 20, boxShadow: shadow.md }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索食物（如：鸡胸肉、米饭）" aria-label="搜索食物" style={{ flex: 1, border: 'none', outline: 'none', fontSize: fontSize.lg, background: 'transparent', color: colors.textPrimary }} />
          {keyword && <i className="fas fa-circle-xmark" style={{ fontSize: 14, color: colors.textTertiary, cursor: 'pointer' }} onClick={() => setKeyword('')} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 20px 8px' }}>
        <MealPills options={MEAL_OPTIONS} value={meal} onChange={setMeal} />
      </div>

      {searched && results.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 8px' }}>
          <span style={{ color: colors.textTertiary, fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: '18px' }}>找到 {results.length} 条结果</span>
          <div onClick={() => setSortAsc((v) => !v)} style={{ height: 24, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', background: colors.surface, borderRadius: 12, cursor: 'pointer' }}>
            <span style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: '16px' }}>{sortAsc ? '热量从低到高' : '默认排序'}</span>
            <i className="fas fa-sort" style={{ fontSize: 10, color: colors.textPrimary }} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {loading && <div style={{ textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.md, padding: 20 }}>搜索中…</div>}
        {!loading && searched && results.length === 0 && (
          <div style={{ background: colors.surface, borderRadius: radius.xl, padding: 20, textAlign: 'center', boxShadow: shadow.lg }}>
            <div style={{ fontSize: fontSize.md, color: colors.textTertiary }}>没有找到「{keyword}」，可尝试手动添加</div>
          </div>
        )}
        {displayedResults.map((f, idx) => (
          <div key={f.id} data-name={'search-result-' + f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg }}>
            <div style={{ width: 48, height: 48, borderRadius: radius.lg, background: GRADIENTS[idx % GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-bowl-food" style={{ fontSize: 20, color: colors.textInverse }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textPrimary, lineHeight: '20px' }}>{f.name}</div>
              <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, lineHeight: '16px' }}>{f.unit_desc || '1 份'} · {kcal(f.calories)} {unitCalorie} · 蛋白质 {g(f.protein_g)} {unitWeight}</div>
            </div>
            <div onClick={() => addRecord(f)} style={{ width: 32, height: 32, borderRadius: 16, background: colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
              <i className="fas fa-plus" style={{ fontSize: 14, color: colors.primaryDark }} />
            </div>
          </div>
        ))}
        {!loading && !searched && !keyword && (
          <div style={{ textAlign: 'center', padding: 40, color: '#C0C4CC', fontSize: fontSize.md }}>
            <i className="fas fa-magnifying-glass" style={{ fontSize: 30, marginBottom: 10 }} />
            <div>输入关键词搜索食物库</div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
