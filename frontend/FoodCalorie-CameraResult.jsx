import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';

// 识别结果页：显示图片 + 候选食物 → 确认创建记录（source=AI识别）
export default function FoodCalorieCameraResult() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const location = useLocation();
  const state = useMemo(() => location.state || {}, [location.state]);
  const candidates = useMemo(() => state.candidates || [], [state]);
  const preview = state.preview || null;
  const storedImageUrl = state.storedImageUrl || null;

  // 默认选中置信度最高的候选
  const selectedDefault = useMemo(() => {
    if (!candidates.length) return 0;
    return candidates.reduce((bestIdx, c, i, arr) =>
      (c.confidence ?? 0) > (arr[bestIdx].confidence ?? 0) ? i : bestIdx, 0);
  }, [candidates]);

  const [selectedIndex, setSelectedIndex] = useState(selectedDefault);
  const [meal, setMeal] = useState('午餐');
  const { busy: adding, run: runAdding } = useBusy();
  const [portionCount, setPortionCount] = useState(1);
  const [showOthers, setShowOthers] = useState(false);

  // candidates 变化时回默认选中最高置信度项
  useEffect(() => setSelectedIndex(selectedDefault), [selectedDefault]);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  async function confirmAdd() {
    const item = candidates[selectedIndex];
    if (!item) return;
    // runAdding：同步闩锁防双击重复添加记录
    await runAdding(async () => {
      try {
        await http.post('/api/v1/foodcalorie/records', {
          food_name: item.name,
          category: item.category || null,
          meal_type: meal,
          calories: Math.round((item.calories || 0) * portionCount),
          protein_g: Math.round((item.protein_g || 0) * portionCount * 10) / 10,
          carbs_g: Math.round((item.carbs_g || 0) * portionCount * 10) / 10,
          fat_g: Math.round((item.fat_g || 0) * portionCount * 10) / 10,
          portion: portionCount + ' 份',
          record_time: nowDateTime(),
          source: 'AI识别',
          image_url: storedImageUrl
        });
        toast('已添加「' + item.name + '」');
        navigate('/records');
      } catch (e) {
        toast(e.message || '添加失败');
      }
    });
  }

  // 无识别状态（直接访问）
  if (!candidates.length) {
    return (
      <div data-name="FoodCalorie-CameraResult" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="识别结果" />
        <div style={{ padding: 60, textAlign: 'center' }}>
          <i className="fas fa-camera" style={{ fontSize: 34, color: '#D1D5DB' }} />
          <div style={{ marginTop: 10, fontSize: 13, color: '#9CA3AF' }}>请先拍照识别</div>
          <button onClick={() => navigate('/camera')} style={{ marginTop: 16, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>去拍照</button>
        </div>
      </div>
    );
  }

  const item = candidates[selectedIndex];
  const confidencePct = Math.round((item.confidence ?? 0) * 100);
  const ingredients = item.ingredients || state.ingredients || [];

  return (
    <div data-name="FoodCalorie-CameraResult" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="识别结果" right={
        <i className="fas fa-share-nodes" style={{ fontSize: 18, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => toast('分享功能开发中')} />
      } />

      {/* 照片展示区：335x200 渐变卡片 + 64px 食物图标，有 preview 时上半部分展示图片 */}
      <div style={{ padding: '4px 20px 8px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 335, height: 200, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(121deg, #FFE0B2 0%, #FFCC80 100%)' }}>
          {preview && (
            <img src={preview} alt="识别照片" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '55%', objectFit: 'cover' }} />
          )}
          {preview && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(121deg, #FFE0B2 0%, #FFCC80 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="fas fa-bowl-food" style={{ fontSize: 64, color: '#fff' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{item.name}</span>
          </div>
        </div>
      </div>

      {/* AI 识别信息 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ height: 26, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', background: '#E8F5EC', borderRadius: 13 }}>
            <i className="fas fa-wand-magic-sparkles" style={{ fontSize: 11, color: '#22A85A' }} />
            <span style={{ fontSize: 12, color: '#22A85A', fontWeight: 600, lineHeight: '16px' }}>AI 智能识别</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>置信度</span>
            <span style={{ fontSize: 13, color: '#22A85A', fontWeight: 700, lineHeight: '18px' }}>{confidencePct}%</span>
          </div>
        </div>
      </div>

      {/* 候选食物 name-card + 份量调整 + 其他候选折叠入口 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: '14px 16px', borderRadius: 16, background: '#fff', boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', lineHeight: '24px' }}>{item.name}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF', lineHeight: '16px' }}>
                <span style={{ color: '#22A85A', cursor: 'pointer' }} onClick={() => {
                  const opts = ['早餐', '午餐', '晚餐', '加餐'];
                  setMeal(opts[(opts.indexOf(meal) + 1) % opts.length]);
                }}>{meal}</span>
                <span> · {item.category || '其他'}</span>
              </span>
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: '#F7F8FA', borderRadius: 15 }}>
              <i
                className="fas fa-minus"
                style={{ fontSize: 12, color: portionCount > 1 ? '#9CA3AF' : '#D1D5DB', cursor: portionCount > 1 ? 'pointer' : 'not-allowed' }}
                onClick={() => portionCount > 1 && setPortionCount(c => c - 1)}
              />
              <span style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600, lineHeight: '18px', minWidth: 28, textAlign: 'center' }}>{portionCount} 份</span>
              <i
                className="fas fa-plus"
                style={{ fontSize: 12, color: '#22A85A', cursor: 'pointer' }}
                onClick={() => setPortionCount(c => Math.min(99, c + 1))}
              />
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF' }}>每份 {kcal(item.calories)} {unitCalorie}</div>
        </Card>

        {candidates.length > 1 && (
          <>
            <div
              onClick={() => setShowOthers(s => !s)}
              style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fff', borderRadius: 12, cursor: 'pointer', boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.04)' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>其他候选</span>
              <i className={showOthers ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} style={{ fontSize: 12, color: '#9CA3AF' }} />
            </div>
            {showOthers && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {candidates.map((c, idx) => {
                  if (idx === selectedIndex) return null;
                  const key = c.id != null ? c.id : 'cand-' + idx;
                  return (
                    <Card
                      key={key}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', border: '1.5px solid transparent', background: '#fff' }}
                      onClick={() => { setSelectedIndex(idx); setPortionCount(1); setShowOthers(false); }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fas fa-bowl-food" style={{ fontSize: 15, color: '#9CA3AF' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{c.name} <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>{c.category}</span></div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{c.unit_desc} · 推荐度 {Math.round((c.confidence ?? 0) * 100)}%</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#E8590C' }}>{kcal(c.calories)}<span style={{ fontSize: 10, fontWeight: 400, color: '#9CA3AF' }}> {unitCalorie}</span></div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 营养数据卡片 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: 0, borderRadius: 16, background: '#fff', boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 12px' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', lineHeight: '20px' }}>营养数据</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>每份</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 16px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#34C759', lineHeight: '22px' }}>{kcal(item.calories)}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>{unitCalorie}</span>
            </div>
            <div style={{ width: 1, height: 32, background: '#EEF0F2' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', lineHeight: '20px' }}>{g(item.protein_g)} {unitWeight}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>蛋白质</span>
            </div>
            <div style={{ width: 1, height: 32, background: '#EEF0F2' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', lineHeight: '20px' }}>{g(item.carbs_g)} {unitWeight}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>碳水</span>
            </div>
            <div style={{ width: 1, height: 32, background: '#EEF0F2' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', lineHeight: '20px' }}>{g(item.fat_g)} {unitWeight}</span>
              <span style={{ fontSize: 11, color: '#9CA3AF', lineHeight: '15px' }}>脂肪</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI 检测食材 */}
      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: '14px 16px', borderRadius: 16, background: '#fff', boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', lineHeight: '20px' }}>AI 检测食材</span>
            <span style={{ fontSize: 12, color: '#9CA3AF', lineHeight: '16px' }}>{ingredients.length} 种</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ingredients.length ? ingredients.map((ing, i) => {
              const colors = [
                { bg: '#E8F5EC', text: '#22A85A' },
                { bg: '#FFE8EC', text: '#E91E63' },
                { bg: '#DCFCE7', text: '#16A34A' },
                { bg: '#FFF3E0', text: '#F97316' },
                { bg: '#E0F2FE', text: '#0EA5E9' }
              ];
              const style = colors[i % colors.length];
              return (
                <div key={i} style={{ height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: style.bg, borderRadius: 15 }}>
                  <i className="fas fa-leaf" style={{ fontSize: 11, color: style.text }} />
                  <span style={{ fontSize: 12, color: style.text, fontWeight: 600, lineHeight: '16px' }}>{ing}</span>
                </div>
              );
            }) : (
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>未检测到详细食材</span>
            )}
          </div>
        </Card>
      </div>

      {/* 底部操作区 */}
      <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/camera')} style={{ flex: 1, height: 48, borderRadius: 16, border: '1.5px solid #E5E7EB', background: '#fff', color: '#1A1A1A', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>重新拍照</button>
          <button onClick={confirmAdd} disabled={adding} style={{ flex: 1, height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: adding ? 'wait' : 'pointer' }}>
            {adding ? '添加中…' : '确认添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
