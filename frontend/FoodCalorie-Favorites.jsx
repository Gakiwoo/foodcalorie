import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { useUnits } from './src/ui/units';
import { Loading, EmptyState } from './src/ui/PageState';

// 我的收藏页：真实数据（GET favorites 联查内容标题 + 取消收藏）
export default function FoodCalorieFavorites() {
  const navigate = useNavigate();
  const { unitCalorie, kcal } = useUnits();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { run: runUncollect } = useBusy();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await http.get('/api/v1/foodcalorie/favorites');
      setItems(r.data || []);
    } catch (e) {
      toast(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uncollect(fav) {
    // runUncollect：同步闩锁防双击连点重复取消收藏
    await runUncollect(async () => {
      try {
        await http.del('/api/v1/foodcalorie/favorites?type=' + fav.type + '&ref_id=' + fav.ref_id);
        toast('已取消收藏');
        load();
      } catch (e) {
        toast(e.message || '操作失败');
      }
    });
  }

  return (
    <div data-name="FoodCalorie-Favorites" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="我的收藏" />

      {loading ? (
        <Loading text="加载中…" padding={60} />
      ) : items.length === 0 ? (
        <EmptyState icon="fa-bookmark" text="还没有收藏内容" actionText="去发现页逛逛" onAction={() => navigate('/discover')} padding={40} />
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((f) => (
            <Card
              key={f.id}
              data-name={'fav-card-' + f.id}
              style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer' }}
              onClick={() => navigate(`${f.type === 'recipe' ? '/recipe' : '/article'}?id=${encodeURIComponent(f.ref_id)}`)}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 26 }}>{f.cover_icon || (f.type === 'recipe' ? '🍽️' : '📄')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.title || ('内容 #' + f.ref_id)}
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {f.summary || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: f.type === 'recipe' ? '#E8F5EC' : '#EFF6FF', color: f.type === 'recipe' ? '#22A85A' : '#3B82F6', fontWeight: 600 }}>{f.type === 'recipe' ? '食谱' : '文章'}</span>
                  {f.calories > 0 && <span style={{ fontSize: 11, color: '#E8590C', fontWeight: 600 }}>{kcal(f.calories)} {unitCalorie}</span>}
                </div>
              </div>
              <i className="fas fa-bookmark" style={{ fontSize: 15, color: '#34C759', cursor: 'pointer', alignSelf: 'center' }} onClick={(e) => { e.stopPropagation(); uncollect(f); }} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
