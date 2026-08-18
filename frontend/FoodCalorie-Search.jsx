import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar } from './src/ui/common';

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

// 搜索页：真实数据（GET foods 搜索 → 点结果添加记录）
export default function FoodCalorieSearch() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [meal, setMeal] = useState('全部');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const timer = useRef(null);
  const seq = useRef(0); // 请求序号守卫：仅最新一次请求的结果允许写入 state

  useEffect(() => {
    clearTimeout(timer.current);
    if (!keyword.trim()) { setResults([]); setSearched(false); return; }
    const current = ++seq.current;
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await http.get('/api/v1/foodcalorie/foods', { keyword: keyword.trim(), pageSize: 30 });
        if (current !== seq.current) return; // 已有更新的关键词，丢弃过期响应
        setResults(r.data.list);
        setSearched(true);
      } catch (e) {
        if (current !== seq.current) return;
        toast(e.message || '搜索失败');
      } finally {
        if (current === seq.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [keyword]);

  const displayedResults = useMemo(() => {
    if (!sortAsc) return results;
    return [...results].sort((a, b) => (a.calories || 0) - (b.calories || 0));
  }, [results, sortAsc]);

  function mealForAdd() {
    return meal === '全部' ? '午餐' : meal;
  }

  async function addRecord(f) {
    if (adding) return;
    setAdding(true);
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
      setAdding(false);
    }
  }

  return (
    <div data-name="FoodCalorie-Search" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />

      {/* 搜索栏：返回图标 + 搜索框同行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <div style={{ flex: 1, height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: '#FFFFFF', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索食物（如：鸡胸肉、米饭）" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: '#1A1A1A' }} />
          {keyword && <i className="fas fa-circle-xmark" style={{ fontSize: 14, color: '#9CA3AF', cursor: 'pointer' }} onClick={() => setKeyword('')} />}
        </div>
      </div>

      {/* 餐次 pill chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 20px 8px', overflowX: 'auto' }}>
        {MEAL_OPTIONS.map((opt) => {
          const active = meal === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => setMeal(opt.value)}
              style={{
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 14px',
                borderRadius: 15,
                background: active ? '#34C759' : '#FFFFFF',
                boxShadow: active ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                color: active ? '#FFFFFF' : '#1A1A1A',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                lineHeight: '18px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>

      {/* 结果数量与排序 */}
      {searched && results.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 20px 8px' }}>
          <span style={{ color: '#9CA3AF', fontSize: 13, fontWeight: 500, lineHeight: '18px' }}>找到 {results.length} 条结果</span>
          <div
            onClick={() => setSortAsc((v) => !v)}
            style={{ height: 24, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', background: '#FFFFFF', borderRadius: 12, cursor: 'pointer' }}
          >
            <span style={{ color: '#1A1A1A', fontSize: 12, fontWeight: 500, lineHeight: '16px' }}>{sortAsc ? '热量从低到高' : '默认排序'}</span>
            <i className="fas fa-sort" style={{ fontSize: 10, color: '#1A1A1A' }} />
          </div>
        </div>
      )}

      {/* 结果列表 */}
      <div style={{ flex: 1, padding: '4px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 20 }}>搜索中…</div>}
        {!loading && searched && results.length === 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>没有找到「{keyword}」，可尝试手动添加</div>
          </div>
        )}
        {displayedResults.map((f, idx) => (
          <div
            key={f.id}
            data-name={'search-result-' + f.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: GRADIENTS[idx % GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-bowl-food" style={{ fontSize: 20, color: '#FFFFFF' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', lineHeight: '20px' }}>{f.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: '16px' }}>{f.unit_desc || '1 份'} · {f.calories || 0} kcal · 蛋白质 {f.protein_g || 0}g</div>
            </div>
            <div
              onClick={() => addRecord(f)}
              style={{ width: 32, height: 32, borderRadius: 16, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
            >
              <i className="fas fa-plus" style={{ fontSize: 14, color: '#22A85A' }} />
            </div>
          </div>
        ))}
        {!loading && !searched && !keyword && (
          <div style={{ textAlign: 'center', padding: 40, color: '#C0C4CC', fontSize: 13 }}>
            <i className="fas fa-magnifying-glass" style={{ fontSize: 30, marginBottom: 10 }} />
            <div>输入关键词搜索食物库</div>
          </div>
        )}
      </div>
    </div>
  );
}
