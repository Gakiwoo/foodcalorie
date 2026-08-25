import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast, todayStr } from './src/ui/toast';
import { StatusBar, BottomNav } from './src/ui/common';
import { ProtectedImage } from './src/ui/ProtectedImage';
import { useUnits } from './src/ui/units';
import { Loading, ErrorRetry, EmptyState } from './src/ui/PageState';

export default function FoodCalorieHome() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await http.get('/api/v1/foodcalorie/records', { date: todayStr(), pageSize: 3 });
      setList(r.data.list || []);
    } catch (e) {
      setError(e.message || '加载失败');
      toast(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return (
    <div data-name="FoodCalorie-Home" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />

      {/* 顶部导航：左"今日" / 中"食刻" / 右设置图标 */}
      <div data-name="top-nav" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '10px 20px' }}>
        <span data-name="nav-date" style={{ color: '#1A1A1A', fontSize: 16, fontWeight: 600, lineHeight: '22px' }}>今日</span>
        <p data-name="nav-title" style={{ flex: 1, color: '#1A1A1A', fontSize: 18, fontWeight: 700, lineHeight: '24px', textAlign: 'center', margin: 0 }}>食刻</p>
        <div data-name="nav-settings-wrap" onClick={() => navigate('/settings')} style={{ padding: 8, margin: -8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i data-name="nav-settings" className="fas fa-gear" style={{ fontSize: 20, color: '#1A1A1A' }} />
        </div>
      </div>

      {/* 拍照识别大卡 */}
      <div data-name="camera-section" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', padding: '12px 20px' }}>
        <div
          data-name="camera-card"
          onClick={() => navigate('/camera')}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 18,
            padding: 28,
            background: 'linear-gradient(129deg, #34C759 0%, #22A85A 100%)',
            borderRadius: 24,
            boxShadow: '0 14px 32px rgba(52,199,89,0.35)',
            cursor: 'pointer'
          }}>
          <div data-name="camera-icon-wrap" style={{ width: 76, height: 76, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.22)', borderRadius: 76 }}>
            <i data-name="camera-icon" className="fas fa-camera" style={{ fontSize: 34, color: '#FFFFFF' }} />
          </div>
          <div data-name="camera-text" style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', gap: 6 }}>
            <p data-name="camera-title" style={{ alignSelf: 'stretch', flexShrink: 0, color: '#FFFFFF', fontSize: 20, fontWeight: 700, lineHeight: '26px', textAlign: 'center', margin: 0 }}>拍照识别食物</p>
            <p data-name="camera-sub" style={{ alignSelf: 'stretch', flexShrink: 0, color: 'rgba(255,255,255,0.92)', fontSize: 14, lineHeight: '20px', textAlign: 'center', margin: 0 }}>一键识别热量与营养</p>
          </div>
          <div data-name="camera-cta" style={{ width: '100%', maxWidth: 279, height: 52, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: '#FFFFFF', borderRadius: 26, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
            <i data-name="cta-icon" className="fas fa-camera" style={{ fontSize: 18, color: '#34C759' }} />
            <span data-name="cta-text" style={{ color: '#34C759', fontSize: 16, fontWeight: 700, lineHeight: '22px', textAlign: 'center' }}>拍照识别</span>
          </div>
        </div>
      </div>

      {/* 今日记录 */}
      <div data-name="history-section" style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column', gap: 12, padding: '12px 20px', overflow: 'hidden' }}>
        <div data-name="history-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span data-name="history-title" style={{ color: '#1A1A1A', fontSize: 17, fontWeight: 700, lineHeight: '22px' }}>今日记录</span>
          <span data-name="history-more" style={{ color: '#34C759', fontSize: 13, fontWeight: 500, lineHeight: '18px', cursor: 'pointer' }} onClick={() => navigate('/today')}>查看全部</span>
        </div>

        {loading ? (
          <Loading text="加载中…" padding={40} />
        ) : error ? (
          <ErrorRetry error={error} onRetry={loadRecords} padding={32} />
        ) : list.length === 0 ? (
          <EmptyState icon="fa-utensils" text="今天还没有记录" actionText="+ 添加记录" onAction={() => navigate('/addfood')} />
        ) : (
          <div data-name="history-list" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((r) => (
              <div
                key={r.id}
                data-name={'food-card-' + r.id}
                onClick={() => navigate('/detail?id=' + r.id)}
                style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, padding: 12, background: '#FFFFFF', borderRadius: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div data-name={'food-thumb-' + r.id} style={{ width: 56, height: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6' }}>
                  {r.image_url ? (
                    <ProtectedImage data-name={'food-img-' + r.id} src={r.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'cover' }} />
                  ) : (
                    <i className="fas fa-utensils" style={{ fontSize: 20, color: '#D1D5DB' }} />
                  )}
                </div>
                <div data-name={'food-info-' + r.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 4, minWidth: 0 }}>
                  <p data-name={'food-name-' + r.id} style={{ alignSelf: 'stretch', flexShrink: 0, color: '#1A1A1A', fontSize: 15, fontWeight: 600, lineHeight: '20px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.food_name}</p>
                  <span data-name={'food-time-' + r.id} style={{ flexShrink: 0, color: '#9CA3AF', fontSize: 12, lineHeight: '16px' }}>{r.record_time ? r.record_time.slice(11, 16) : '--:--'} · {r.meal_type}</span>
                </div>
                <div data-name={'food-cal-' + r.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'column', gap: 2 }}>
                  <span data-name={'food-cal-value-' + r.id} style={{ color: '#34C759', fontSize: 16, fontWeight: 700, lineHeight: '22px', textAlign: 'right' }}>{kcal(r.calories)} {unitCalorie}</span>
                  <span data-name={'food-cal-proto-' + r.id} style={{ color: '#9CA3AF', fontSize: 11, lineHeight: '15px', textAlign: 'right' }}>蛋白 {g(r.protein_g)} {unitWeight}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="/" />
    </div>
  );
}
