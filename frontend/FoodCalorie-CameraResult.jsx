import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, nowDateTime } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';
import { PageContainer } from './src/ui/components';
import { colors, spacing, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieCameraResult() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const location = useLocation();
  const state = useMemo(() => location.state || {}, [location.state]);
  const candidates = useMemo(() => state.candidates || [], [state]);
  const preview = state.preview || null;
  const storedImageUrl = state.storedImageUrl || null;

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

  useEffect(() => setSelectedIndex(selectedDefault), [selectedDefault]);

  useEffect(() => () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  async function confirmAdd() {
    const item = candidates[selectedIndex];
    if (!item) return;
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

  if (!candidates.length) {
    return (
      <PageContainer data-name="FoodCalorie-CameraResult">
        <StatusBar /><NavBar title="识别结果" />
        <div style={{ padding: 60, textAlign: 'center' }}>
          <i className="fas fa-camera" style={{ fontSize: 34, color: colors.textDisabled }} />
          <div style={{ marginTop: 10, fontSize: fontSize.md, color: colors.textTertiary }}>请先拍照识别</div>
          <button onClick={() => navigate('/camera')} style={{ marginTop: 16, padding: '9px 28px', borderRadius: 14, border: 'none', background: colors.primary, color: colors.textInverse, fontWeight: fontWeight.semibold, fontSize: fontSize.md, cursor: 'pointer' }}>去拍照</button>
        </div>
      </PageContainer>
    );
  }

  const item = candidates[selectedIndex];
  const confidencePct = Math.round((item.confidence ?? 0) * 100);
  const ingredients = item.ingredients || state.ingredients || [];

  return (
    <PageContainer data-name="FoodCalorie-CameraResult">
      <StatusBar />
      <NavBar title="识别结果" right={
        <i className="fas fa-share-nodes" role="button" tabIndex={0} aria-label="分享识别结果" style={{ fontSize: 18, color: colors.textPrimary, cursor: 'pointer' }} onClick={() => toast('分享功能开发中')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toast('分享功能开发中'); } }} />
      } />

      <div style={{ padding: '4px 20px 8px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 335, height: 200, borderRadius: radius.xl, overflow: 'hidden', background: 'linear-gradient(121deg, #FFE0B2 0%, #FFCC80 100%)' }}>
          {preview && (
            <img src={preview} alt="识别照片" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '55%', objectFit: 'cover' }} />
          )}
          {preview && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(121deg, #FFE0B2 0%, #FFCC80 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <i className="fas fa-bowl-food" style={{ fontSize: 64, color: colors.textInverse }} />
            <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textInverse, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{item.name}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ height: 26, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', background: colors.primaryBg, borderRadius: 13 }}>
            <i className="fas fa-wand-magic-sparkles" style={{ fontSize: 11, color: colors.primaryDark }} />
            <span style={{ fontSize: fontSize.sm, color: colors.primaryDark, fontWeight: fontWeight.semibold, lineHeight: '16px' }}>AI 智能识别</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>置信度</span>
            <span style={{ fontSize: fontSize.md, color: colors.primaryDark, fontWeight: fontWeight.bold, lineHeight: '18px' }}>{confidencePct}%</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: '14px 16px', borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '24px' }}>{item.name}</span>
              <span style={{ fontSize: fontSize.sm, color: colors.textTertiary, lineHeight: '16px' }}>
                <span style={{ color: colors.primaryDark, cursor: 'pointer' }} onClick={() => {
                  const opts = ['早餐', '午餐', '晚餐', '加餐'];
                  setMeal(opts[(opts.indexOf(meal) + 1) % opts.length]);
                }}>{meal}</span>
                <span> · {item.category || '其他'}</span>
              </span>
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: colors.bg, borderRadius: 15 }}>
              <i className="fas fa-minus" style={{ fontSize: 12, color: portionCount > 1 ? colors.textTertiary : colors.textDisabled, cursor: portionCount > 1 ? 'pointer' : 'not-allowed' }} onClick={() => portionCount > 1 && setPortionCount(c => c - 1)} />
              <span style={{ fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.semibold, lineHeight: '18px', minWidth: 28, textAlign: 'center' }}>{portionCount} 份</span>
              <i className="fas fa-plus" style={{ fontSize: 12, color: colors.primaryDark, cursor: 'pointer' }} onClick={() => setPortionCount(c => Math.min(99, c + 1))} />
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: fontSize.sm, color: colors.textTertiary }}>每份 {kcal(item.calories)} {unitCalorie}</div>
        </Card>

        {candidates.length > 1 && (
          <>
            <div onClick={() => setShowOthers(s => !s)} style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: colors.surface, borderRadius: radius.lg, cursor: 'pointer', boxShadow: shadow.md }}>
              <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>其他候选</span>
              <i className={showOthers ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} style={{ fontSize: 12, color: colors.textTertiary }} />
            </div>
            {showOthers && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {candidates.map((c, idx) => {
                  if (idx === selectedIndex) return null;
                  const key = c.id != null ? c.id : 'cand-' + idx;
                  return (
                    <Card key={key} style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: spacing.md, cursor: 'pointer', border: '1.5px solid transparent', background: colors.surface }} onClick={() => { setSelectedIndex(idx); setPortionCount(1); setShowOthers(false); }}>
                      <div style={{ width: 40, height: 40, borderRadius: radius.lg, background: colors.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fas fa-bowl-food" style={{ fontSize: 15, color: colors.textTertiary }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>{c.name} <span style={{ fontSize: 10, color: colors.textTertiary, fontWeight: fontWeight.regular }}>{c.category}</span></div>
                        <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 }}>{c.unit_desc} · 推荐度 {Math.round((c.confidence ?? 0) * 100)}%</div>
                      </div>
                      <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.warning }}>{kcal(c.calories)}<span style={{ fontSize: 10, fontWeight: fontWeight.regular, color: colors.textTertiary }}> {unitCalorie}</span></div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: 0, borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 12px' }}>
            <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '20px' }}>营养数据</span>
            <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>每份</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 16px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.primary, lineHeight: '22px' }}>{kcal(item.calories)}</span>
              <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>{unitCalorie}</span>
            </div>
            <div style={{ width: 1, height: 32, background: colors.segBg }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '20px' }}>{g(item.protein_g)} {unitWeight}</span>
              <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>蛋白质</span>
            </div>
            <div style={{ width: 1, height: 32, background: colors.segBg }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '20px' }}>{g(item.carbs_g)} {unitWeight}</span>
              <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>碳水</span>
            </div>
            <div style={{ width: 1, height: 32, background: colors.segBg }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '20px' }}>{g(item.fat_g)} {unitWeight}</span>
              <span style={{ fontSize: fontSize.xs, color: colors.textTertiary, lineHeight: '15px' }}>脂肪</span>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ padding: '4px 20px 8px' }}>
        <Card style={{ padding: '14px 16px', borderRadius: radius.xl, background: colors.surface, boxShadow: shadow.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: '20px' }}>AI 检测食材</span>
            <span style={{ fontSize: fontSize.sm, color: colors.textTertiary, lineHeight: '16px' }}>{ingredients.length} 种</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ingredients.length ? ingredients.map((ing, i) => {
              const ingColors = [
                { bg: colors.primaryBg, text: colors.primaryDark },
                { bg: '#FFE8EC', text: '#E91E63' },
                { bg: '#DCFCE7', text: '#16A34A' },
                { bg: '#FFF3E0', text: '#F97316' },
                { bg: '#E0F2FE', text: '#0EA5E9' }
              ];
              const style = ingColors[i % ingColors.length];
              return (
                <div key={i} style={{ height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: style.bg, borderRadius: 15 }}>
                  <i className="fas fa-leaf" style={{ fontSize: 11, color: style.text }} />
                  <span style={{ fontSize: fontSize.sm, color: style.text, fontWeight: fontWeight.semibold, lineHeight: '16px' }}>{ing}</span>
                </div>
              );
            }) : (
              <span style={{ fontSize: fontSize.sm, color: colors.textTertiary }}>未检测到详细食材</span>
            )}
          </div>
        </Card>
      </div>

      <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        <div style={{ display: 'flex', gap: spacing.md }}>
          <button onClick={() => navigate('/camera')} style={{ flex: 1, height: 48, borderRadius: radius.xl, border: `1.5px solid ${colors.border}`, background: colors.surface, color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.semibold, cursor: 'pointer' }}>重新拍照</button>
          <button onClick={confirmAdd} disabled={adding} style={{ flex: 1, height: 48, borderRadius: radius.xl, border: 'none', background: colors.primary, color: colors.textInverse, fontSize: fontSize.xl, fontWeight: fontWeight.bold, cursor: adding ? 'wait' : 'pointer' }}>
            {adding ? '添加中…' : '确认添加'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
