import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 识别结果页：显示图片 + 候选食物 → 确认创建记录（source=AI识别）
export default function FoodCalorieCameraResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const candidates = state.candidates || [];
  const imageUrl = state.imageUrl || null;
  const [selected, setSelected] = useState(null);
  const [meal, setMeal] = useState('午餐');
  const [adding, setAdding] = useState(false);

  async function confirmAdd() {
    const item = selected || candidates[0];
    if (!item || adding) return;
    setAdding(true);
    try {
      await http.post('/api/v1/foodcalorie/records', {
        food_name: item.name,
        category: item.category || null,
        meal_type: meal,
        calories: item.calories || 0,
        protein_g: item.protein_g || 0,
        carbs_g: item.carbs_g || 0,
        fat_g: item.fat_g || 0,
        portion: item.unit_desc || '1 份',
        record_time: nowDateTime(),
        source: 'AI识别',
        image_url: imageUrl && imageUrl.startsWith('/uploads/') ? imageUrl : null
      });
      toast('已添加「' + item.name + '」');
      navigate('/records');
    } catch (e) {
      toast(e.message || '添加失败');
      setAdding(false);
    }
  }

  // 无识别状态（直接访问）
  if (!candidates.length) {
    return (
      <div data-name="FoodCalorie-CameraResult" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="识别结果" />
        <div style={{ padding: 60, textAlign: 'center' }}>
          <i className="fas fa-camera" style={{ fontSize: 34, color: '#D1D5DB' }} />
          <div style={{ marginTop: 10, fontSize: 13, color: '#9CA3AF' }}>请先拍照识别</div>
          <button onClick={() => navigate('/camera')} style={{ marginTop: 16, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>去拍照</button>
        </div>
      </div>
    );
  }

  const item = selected || candidates[0];

  return (
    <div data-name="FoodCalorie-CameraResult" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="识别结果" right={<span style={{ fontSize: 13, color: '#22A85A', fontWeight: 600 }} onClick={() => navigate('/camera')}>重拍</span>} />

      {/* 照片 */}
      {imageUrl && (
        <div style={{ margin: '6px 20px 12px' }}>
          <img src={imageUrl} alt="识别照片" style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 16 }} />
        </div>
      )}

      {/* 确认提示 */}
      <Card style={{ margin: '0 20px 12px', background: '#F0FBF4', boxShadow: 'none' }}>
        <div style={{ fontSize: 12, color: '#22A85A', display: 'flex', gap: 8 }}>
          <i className="fas fa-circle-check" style={{ marginTop: 1 }} />
          <span>{state.message || '已识别出可能食物，请选择最接近的一项确认'}</span>
        </div>
      </Card>

      {/* 候选列表 */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>选择食物</span>
        {candidates.map((c, idx) => {
          // 未匹配食物库的候选 id 为 null：用索引兜底做 key，避免 React key 重复 + 多选高亮
          const key = c.id != null ? c.id : 'cand-' + idx;
          const on = (item && item.id === c.id) || (!item && idx === 0);
          return (
            <Card key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', border: on ? '1.5px solid #34C759' : '1.5px solid transparent' }} onClick={() => setSelected(c)}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: on ? '#34C759' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-bowl-food" style={{ fontSize: 15, color: on ? '#fff' : '#9CA3AF' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{c.name} <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>{c.category}</span></div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.unit_desc} · 推荐度 {Math.round(c.confidence * 100)}%</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8590C' }}>{c.calories}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> kcal</span></div>
              {on && <i className="fas fa-circle-check" style={{ fontSize: 16, color: '#34C759' }} />}
            </Card>
          );
        })}
      </div>

      {/* 餐次 + 确认 */}
      <div style={{ padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Seg options={[{ value: '早餐', label: '早餐' }, { value: '午餐', label: '午餐' }, { value: '晚餐', label: '晚餐' }, { value: '加餐', label: '加餐' }]} value={meal} onChange={setMeal} />
        <button onClick={confirmAdd} disabled={adding} style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: adding ? 'wait' : 'pointer' }}>
          {adding ? '添加中…' : '确认添加 ' + (item.name || '') + ' · ' + (item.calories || 0) + ' kcal'}
        </button>
      </div>
    </div>
  );
}
