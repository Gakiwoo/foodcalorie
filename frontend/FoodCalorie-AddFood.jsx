import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, NavBar, Card, MealPills } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';
import { useDebouncedSearch } from './src/ui/useDebouncedSearch';

const MEAL_OPTIONS = ['全部', '早餐', '午餐', '晚餐', '加餐'];

const DEFAULT_FOODS = [
  { id: 'common-1', name: '香蕉', category: '水果', unit_desc: '1 份', calories: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3 },
  { id: 'common-2', name: '全麦面包', category: '主食', unit_desc: '1 片', calories: 75, protein_g: 4, carbs_g: 13, fat_g: 1 },
  { id: 'common-3', name: '鸡胸肉', category: '肉蛋', unit_desc: '100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
  { id: 'common-4', name: '燕麦片', category: '主食', unit_desc: '40g', calories: 150, protein_g: 5, carbs_g: 27, fat_g: 3 },
  { id: 'common-5', name: '希腊酸奶', category: '奶类', unit_desc: '100g', calories: 59, protein_g: 10, carbs_g: 3.6, fat_g: 0.4 },
  { id: 'common-6', name: '苹果', category: '水果', unit_desc: '1 个', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
];

const GRADIENTS = [
  'linear-gradient(135deg, #FFF59D 0%, #FFE082 100%)',
  'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
  'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
  'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
  'linear-gradient(135deg, #FFE8EC 0%, #FFCDD2 100%)',
  'linear-gradient(135deg, #C5E1A5 0%, #AED581 100%)',
];

// 添加记录页：真实数据（GET foods 搜索 → POST records 创建）
export default function FoodCalorieAddFood() {
  const navigate = useNavigate();
  const { unitCalorie, kcal } = useUnits();
  const [keyword, setKeyword] = useState('');
  const [meal, setMeal] = useState('全部');
  const { busy: adding, run: runAdding } = useBusy();
  const [selected, setSelected] = useState([]);
  const [customOpen, setCustomOpen] = useState(false);
  // 自定义添加
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');

  // 防抖搜索 + 序号守卫（收敛自原内联 effect）
  const fetchFoods = useCallback(
    async (kw) => http.get('/api/v1/foodcalorie/foods', { keyword: kw, pageSize: 20 }),
    []
  );
  const { loading, searched, results } = useDebouncedSearch(keyword, fetchFoods);

  const displayedFoods = keyword.trim() ? results : DEFAULT_FOODS;
  const totalCal = selected.reduce((sum, item) => sum + (item.calories || 0), 0);

  const isSelected = (item) => selected.some((s) => s.id === item.id);

  function toggleSelected(item) {
    setSelected((prev) => {
      if (prev.some((s) => s.id === item.id)) {
        return prev.filter((s) => s.id !== item.id);
      }
      return [...prev, item];
    });
  }

  async function saveSelected() {
    if (selected.length === 0) return toast('请先选择食物');
    const effectiveMeal = meal === '全部' ? '早餐' : meal;
    // runAdding：同步闩锁防双击重复提交（重复点击只执行一次）
    await runAdding(async () => {
      let successCount = 0;
      for (const item of selected) {
        try {
          await http.post('/api/v1/foodcalorie/records', {
            food_name: item.name,
            category: item.category || null,
            meal_type: effectiveMeal,
            calories: item.calories || 0,
            protein_g: item.protein_g || 0,
            carbs_g: item.carbs_g || 0,
            fat_g: item.fat_g || 0,
            portion: item.unit_desc || '1 份',
            record_time: nowDateTime(),
            // 常见食物预设（common-*）无后端枚举值，归为 manual；搜索结果为 search
            source: String(item.id).startsWith('common-') ? 'manual' : 'search',
          });
          successCount++;
        } catch {
          // 单条失败继续提交其余项，最后统一提示
        }
      }
      if (successCount > 0) {
        toast(`已成功添加 ${successCount} 项食物`);
        navigate('/records');
      } else {
        toast('保存失败，请稍后重试');
      }
    });
  }

  async function addCustom() {
    const cal = Number(customCal);
    if (!customName.trim()) return toast('请输入食物名称');
    if (!cal || cal <= 0) return toast('请输入有效热量');
    const effectiveMeal = meal === '全部' ? '早餐' : meal;
    await runAdding(async () => {
      try {
        await http.post('/api/v1/foodcalorie/records', {
          food_name: customName.trim(),
          meal_type: effectiveMeal,
          calories: Math.round(cal),
          portion: '1 份',
          record_time: nowDateTime(),
          source: 'manual',
        });
        toast('已添加「' + customName.trim() + '」');
        navigate('/records');
      } catch (e) {
        toast(e.message || '添加失败');
      }
    });
  }

  return (
    <div data-name="FoodCalorie-AddFood" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar
        title="添加记录"
        right={
          <i
            className="fas fa-check"
            data-name="nav-save-check"
            style={{ fontSize: 20, color: '#34C759', cursor: 'pointer' }}
            onClick={saveSelected}
          />
        }
      />

      {/* 搜索框 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', borderRadius: 20, padding: '0 14px', height: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索食物名称"
            aria-label="搜索食物名称"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
          {keyword && <i className="fas fa-circle-xmark" style={{ fontSize: 14, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => setKeyword('')} />}
        </div>
      </div>

      {/* 餐次 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <MealPills options={MEAL_OPTIONS} value={meal} onChange={setMeal} />
      </div>

      {/* 食物列表 */}
      <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {!keyword.trim() && (
          <div style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>常见食物</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>共 {DEFAULT_FOODS.length} 种</span>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 20 }}>搜索中…</div>}
        {!loading && keyword.trim() && searched && results.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 20, borderRadius: 16, background: '#FFFFFF' }}>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>没有找到「{keyword}」，可自定义添加</div>
          </Card>
        )}

        {displayedFoods.map((f, idx) => {
          const sel = isSelected(f);
          return (
            <Card
              key={f.id}
              data-name={'food-result-' + f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 16,
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                border: sel ? '2px solid #34C759' : '2px solid transparent',
              }}
              onClick={() => toggleSelected(f)}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: GRADIENTS[idx % GRADIENTS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-bowl-food" style={{ fontSize: 18, color: '#FFFFFF' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{f.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{f.unit_desc} · {kcal(f.calories)} {unitCalorie}</div>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); toggleSelected(f); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: sel ? '#34C759' : '#E8F5EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <i className={sel ? 'fas fa-check' : 'fas fa-plus'} style={{ fontSize: 12, color: sel ? '#FFFFFF' : '#22A85A' }} />
              </div>
            </Card>
          );
        })}

        {/* 自定义添加 */}
        <Card style={{ padding: 12, borderRadius: 16, background: '#FFFFFF' }}>
          <div
            onClick={() => setCustomOpen((o) => !o)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>没找到？自定义添加</span>
            <i className={customOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} style={{ fontSize: 12, color: '#9CA3AF' }} />
          </div>
          {customOpen && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="食物名称" style={{ flex: 1.4, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
              <input value={customCal} onChange={(e) => setCustomCal(e.target.value)} placeholder="热量 kcal" type="number" style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
              <button onClick={addCustom} disabled={adding} style={{ padding: '0 18px', borderRadius: 10, border: 'none', background: '#34C759', color: '#fff', fontWeight: 700, fontSize: 13, cursor: adding ? 'wait' : 'pointer' }}>添加</button>
            </div>
          )}
        </Card>
      </div>

      {/* 底部保存栏（F8：safe-area 适配全面屏手势条） */}
      <div style={{ position: 'sticky', bottom: 0, background: '#FFFFFF', padding: '12px 20px calc(20px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10 }}>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>已选 {selected.length} 项</span>
          <span style={{ fontSize: 13, color: '#34C759', fontWeight: 600 }}>{kcal(totalCal)} {unitCalorie}</span>
        </div>
        <div
          data-name="save-records-btn"
          onClick={saveSelected}
          style={{
            width: '100%',
            height: 48,
            borderRadius: 16,
            background: '#34C759',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: adding || selected.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selected.length === 0 ? 0.5 : 1,
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 700 }}>保存记录</span>
        </div>
      </div>
    </div>
  );
}
