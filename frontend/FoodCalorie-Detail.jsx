import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar } from './src/ui/common';
import { ProtectedImage } from './src/ui/ProtectedImage';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';

// 记录详情页：真实数据（GET /records/:id + 删除 + 编辑入口）
export default function FoodCalorieDetail() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDel, setConfirmDel] = useState(false);
  const { busy: deleting, run: runDeleting } = useBusy();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/records/' + id);
        setRecord(r.data);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function doDelete() {
    // runDeleting：同步闩锁防双击重复删除（第二次请求会 404 并弹错）
    await runDeleting(async () => {
      try {
        await http.del('/api/v1/foodcalorie/records/' + id);
        toast('记录已删除');
        navigate('/records');
      } catch (e) {
        toast(e.message || '删除失败');
      }
    });
  }

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-food', 晚餐: 'fa-moon', 加餐: 'fa-apple-whole' };
  const cardShadow = '0px 4px 14px 0px rgba(0,0,0,0.05)';
  const SOURCE_META = {
    'AI识别': { icon: 'fa-camera', title: 'AI 图像识别', desc: '数据来自照片识别，仅供参考' },
    search: { icon: 'fa-magnifying-glass', title: '食物库搜索', desc: '数据来自食物库搜索添加' },
    manual: { icon: 'fa-pen', title: '手动添加', desc: '手动录入的记录' }
  }[record.source] || { icon: 'fa-pen', title: '手动添加', desc: '手动录入的记录' };

  if (loading) return <div style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="记录详情" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!record) {
    return (
      <div data-name="FoodCalorie-Detail" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <NavBar title="记录详情" />
        <div style={{ padding: 60, textAlign: 'center' }}>
          <i className="fas fa-folder-open" style={{ fontSize: 34, color: '#D1D5DB' }} />
          <div style={{ marginTop: 10, fontSize: 13, color: '#9CA3AF' }}>记录不存在或已删除</div>
          <button onClick={() => navigate('/records')} style={{ marginTop: 16, padding: '9px 28px', borderRadius: 14, border: 'none', background: '#34C759', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>返回记录页</button>
        </div>
      </div>
    );
  }

  const totalMacro = (record.carbs_g || 0) + (record.protein_g || 0) + (record.fat_g || 0);
  const carbPct = totalMacro ? Math.round(((record.carbs_g || 0) / totalMacro) * 100) : 0;
  const proPct = totalMacro ? Math.round(((record.protein_g || 0) / totalMacro) * 100) : 0;
  const fatPct = totalMacro ? Math.round(((record.fat_g || 0) / totalMacro) * 100) : 0;
  const sum = carbPct + proPct + fatPct;
  const diff = 100 - sum;
  let adjustedCarb = carbPct;
  let adjustedPro = proPct;
  let adjustedFat = fatPct;
  if (diff !== 0 && totalMacro > 0) {
    const maxKey = adjustedCarb >= adjustedPro && adjustedCarb >= adjustedFat ? 'carb' : adjustedPro >= adjustedFat ? 'pro' : 'fat';
    if (maxKey === 'carb') adjustedCarb += diff;
    else if (maxKey === 'pro') adjustedPro += diff;
    else adjustedFat += diff;
  }

  const dateText = record.created_at ? (record.created_at.slice(5, 7) + '月' + record.created_at.slice(8, 10) + '日') : '';

  return (
    <div data-name="FoodCalorie-Detail" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="记录详情" right={<i className="fas fa-pen" style={{ fontSize: 20, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => navigate('/editrecord?id=' + id)} />} />

      {/* Hero */}
      <div style={{ padding: '8px 20px' }}>
        {record.image_url && (
          <ProtectedImage src={record.image_url} alt="记录照片" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 16, marginBottom: 10, display: 'block' }} />
        )}
        <div style={{ width: '100%', padding: '24px', borderRadius: 20, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: 'linear-gradient(135deg,#FFE0B2 0%,#FFCC80 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={'fas ' + (mealIcon[record.meal_type] || 'fa-bowl-food')} style={{ fontSize: 40, color: '#FFFFFF' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20, lineHeight: '26px', fontWeight: 700, color: '#1A1A1A', textAlign: 'center' }}>{record.food_name}</span>
            <span style={{ fontSize: 13, lineHeight: '18px', fontWeight: 400, color: '#9CA3AF', textAlign: 'center' }}>{record.record_time} · {record.meal_type} · {dateText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 32, lineHeight: '38px', fontWeight: 800, color: '#34C759', textAlign: 'center' }}>{kcal(record.calories)}</span>
            <span style={{ fontSize: 15, lineHeight: '20px', fontWeight: 600, color: '#34C759', textAlign: 'center' }}>{unitCalorie}</span>
          </div>
        </div>
      </div>

      {/* 营养卡片 */}
      <div style={{ padding: '8px 20px' }}>
        <div style={{ width: '100%', padding: 16, borderRadius: 16, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 15, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>营养成分</span>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>{g(record.protein_g)} {unitWeight}</span>
              <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: '#9CA3AF' }}>蛋白质</span>
            </div>
            <div style={{ width: 1, height: 28, background: '#EEF0F2' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>{g(record.carbs_g)} {unitWeight}</span>
              <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: '#9CA3AF' }}>碳水</span>
            </div>
            <div style={{ width: 1, height: 28, background: '#EEF0F2' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>{g(record.fat_g)} {unitWeight}</span>
              <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: '#9CA3AF' }}>脂肪</span>
            </div>
            <div style={{ width: 1, height: 28, background: '#EEF0F2' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 16, lineHeight: '20px', fontWeight: 700, color: '#1A1A1A' }}>{record.fiber_g || 0}g</span>
              <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: '#9CA3AF' }}>膳食纤维</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 10, borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
            <div style={{ height: '100%', width: adjustedCarb + '%', background: '#34C759' }} />
            <div style={{ height: '100%', width: adjustedPro + '%', background: '#FFB020' }} />
            <div style={{ height: '100%', width: adjustedFat + '%', background: '#5B8DEF' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: '#34C759' }} />
              <span style={{ fontSize: 11, lineHeight: '14px', fontWeight: 400, color: '#9CA3AF' }}>碳水 {adjustedCarb}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: '#FFB020' }} />
              <span style={{ fontSize: 11, lineHeight: '14px', fontWeight: 400, color: '#9CA3AF' }}>蛋白 {adjustedPro}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: '#5B8DEF' }} />
              <span style={{ fontSize: 11, lineHeight: '14px', fontWeight: 400, color: '#9CA3AF' }}>脂肪 {adjustedFat}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 来源（按 record.source 真实渲染，避免 manual/search 被误标为 AI 识别） */}
      <div style={{ padding: '8px 20px' }}>
        <div style={{ width: '100%', padding: '14px 16px', borderRadius: 16, background: '#FFFFFF', boxShadow: cardShadow, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <i className={'fas ' + SOURCE_META.icon} style={{ fontSize: 20, color: '#34C759', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, lineHeight: '18px', fontWeight: 600, color: '#1A1A1A' }}>{SOURCE_META.title}</span>
            <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 400, color: '#9CA3AF' }}>{SOURCE_META.desc}</span>
          </div>
        </div>
      </div>

      {/* 操作 */}
      <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'row', gap: 12 }}>
        <button onClick={() => setConfirmDel(true)} style={{ flex: 1, height: 48, borderRadius: 24, border: '1px solid #FF3B30', background: '#FFFFFF', color: '#FF3B30', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>删除记录</button>
        <button onClick={() => navigate('/editrecord?id=' + id)} style={{ flex: 1, height: 48, borderRadius: 24, border: 'none', background: '#34C759', boxShadow: '0px 6px 16px 0px rgba(52,199,89,0.3)', color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>编辑</button>
      </div>

      {/* 删除确认 */}
      {confirmDel && (
        <div role="dialog" aria-modal="true" aria-label="删除记录确认" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }} onClick={() => setConfirmDel(false)}>
          <div style={{ width: 280, background: '#fff', borderRadius: 18, padding: 22, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: '#FFE8EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <i className="fas fa-trash-can" style={{ fontSize: 18, color: '#FF6B6B' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '12px 0 4px' }}>删除这条记录？</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 16px' }}>「{record.food_name} · {kcal(record.calories)} {unitCalorie}」删除后无法恢复</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(false)} style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: '#F3F4F6', color: '#6B7280', fontWeight: 600, cursor: 'pointer' }}>取消</button>
              <button onClick={doDelete} disabled={deleting} style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: '#E03131', color: '#fff', fontWeight: 600, cursor: deleting ? 'wait' : 'pointer' }}>{deleting ? '删除中…' : '删除'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
