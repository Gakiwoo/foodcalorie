import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 搜索页：真实数据（GET foods 搜索 → 点结果添加记录）
export default function FoodCalorieSearch() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [meal, setMeal] = useState('午餐');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!keyword.trim()) { setResults([]); setSearched(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await http.get('/api/v1/foodcalorie/foods', { keyword: keyword.trim(), pageSize: 30 });
        setResults(r.data.list);
        setSearched(true);
      } catch (e) {
        toast(e.message || '搜索失败');
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [keyword]);

  async function addRecord(f) {
    if (adding) return;
    setAdding(true);
    try {
      await http.post('/api/v1/foodcalorie/records', {
        food_name: f.name,
        category: f.category || null,
        meal_type: meal,
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
      <NavBar title="搜索" right={<span style={{ fontSize: 13, color: '#22A85A', fontWeight: 600 }} onClick={() => navigate('/addfood')}>手动添加</span>} />

      {/* 搜索框 */}
      <div style={{ padding: '6px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', borderRadius: 14, padding: '0 14px', height: 44, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索食物（如：鸡胸肉、米饭）" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }} />
          {keyword && <i className="fas fa-circle-xmark" style={{ fontSize: 14, color: '#C0C4CC', cursor: 'pointer' }} onClick={() => setKeyword('')} />}
        </div>
      </div>

      {/* 餐次 */}
      <div style={{ padding: '0 20px 12px' }}>
        <Seg options={[{ value: '早餐', label: '早餐' }, { value: '午餐', label: '午餐' }, { value: '晚餐', label: '晚餐' }, { value: '加餐', label: '加餐' }]} value={meal} onChange={setMeal} />
      </div>

      {/* 结果 */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, padding: 20 }}>搜索中…</div>}
        {!loading && searched && results.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 13, color: '#9CA3AF' }}>没有找到「{keyword}」，可尝试手动添加</div>
          </Card>
        )}
        {results.map((f) => (
          <Card key={f.id} data-name={'search-result-' + f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer' }} onClick={() => addRecord(f)}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-bowl-food" style={{ fontSize: 16, color: '#22A85A' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{f.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{f.category} · {f.unit_desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8590C' }}>{f.calories}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> kcal</span></div>
              <div style={{ fontSize: 10, color: '#22A85A', fontWeight: 600, marginTop: 2 }}>+ 添加到{meal}</div>
            </div>
          </Card>
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
