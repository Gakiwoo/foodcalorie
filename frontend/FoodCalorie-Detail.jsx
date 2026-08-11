import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 记录详情页：真实数据（GET /records/:id + 删除 + 编辑入口）
export default function FoodCalorieDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    setDeleting(true);
    try {
      await http.del('/api/v1/foodcalorie/records/' + id);
      toast('记录已删除');
      navigate('/records');
    } catch (e) {
      toast(e.message || '删除失败');
      setDeleting(false);
    }
  }

  const mealIcon = { 早餐: 'fa-mug-hot', 午餐: 'fa-bowl-food', 晚餐: 'fa-moon', 加餐: 'fa-apple-whole' };
  const nutr = (label, val, unit = 'g') => (
    <div style={{ flex: 1, textAlign: 'center', padding: '12px 4px' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{val || 0}</div>
      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{label} {unit}</div>
    </div>
  );

  if (loading) return <div style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="记录详情" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!record) {
    return (
      <div data-name="FoodCalorie-Detail" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
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

  return (
    <div data-name="FoodCalorie-Detail" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="记录详情" right={<i className="fas fa-pen-to-square" style={{ fontSize: 15, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => navigate('/editrecord?id=' + id)} />} />

      {/* Hero：热量 */}
      <div style={{ margin: '6px 20px 14px' }}>
        {record.image_url && (
          <img src={record.image_url} alt="记录照片" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 16, marginBottom: 10, display: 'block' }} />
        )}
        <div style={{ borderRadius: 20, padding: '24px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className={'fas ' + (mealIcon[record.meal_type] || 'fa-bowl-food')} style={{ fontSize: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{record.food_name}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>{record.category || '未分类'} · {record.meal_type} · {record.record_time}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{record.calories}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>kcal</div>
          </div>
        </div>
      </div>

      {/* 营养 */}
      <Card style={{ margin: '0 20px 14px', padding: '6px 8px', display: 'flex' }}>
        {nutr('蛋白质', record.protein_g)}
        {nutr('碳水', record.carbs_g)}
        {nutr('脂肪', record.fat_g)}
        {nutr('膳食纤维', record.fiber_g)}
      </Card>

      {/* 信息 */}
      <Card style={{ margin: '0 20px 14px', padding: '0 16px' }}>
        {[
          ['来源', record.source === 'AI识别' ? 'AI 拍照识别' : record.source === 'search' ? '食物库搜索' : '手动添加'],
          ['份量', record.portion || '1 份'],
          ['记录时间', record.record_time],
          ['创建时间', record.created_at ? record.created_at.replace('T', ' ').slice(0, 19) : '—']
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
            <span style={{ color: '#9CA3AF' }}>{k}</span><span style={{ color: '#1A1A1A', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </Card>

      {/* 操作 */}
      <div style={{ padding: '6px 20px 24px', display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/editrecord?id=' + id)} style={{ flex: 1, height: 48, borderRadius: 16, border: '1.5px solid #34C759', background: '#fff', color: '#22A85A', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>编辑记录</button>
        <button onClick={() => setConfirmDel(true)} style={{ flex: 1, height: 48, borderRadius: 16, border: 'none', background: '#FFE8EC', color: '#E03131', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>删除记录</button>
      </div>

      {/* 删除确认 */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }} onClick={() => setConfirmDel(false)}>
          <div style={{ width: 280, background: '#fff', borderRadius: 18, padding: 22, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: '#FFE8EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <i className="fas fa-trash-can" style={{ fontSize: 18, color: '#FF6B6B' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '12px 0 4px' }}>删除这条记录？</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 16px' }}>「{record.food_name} · {record.calories} kcal」删除后无法恢复</p>
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
