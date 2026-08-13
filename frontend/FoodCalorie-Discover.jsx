import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, BottomNav, Card } from './src/ui/common';

// 发现页：真实数据（GET contents 文章/食谱流，本地搜索 + 分类切换）
export default function FoodCalorieDiscover() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/contents', { pageSize: 50 });
        setItems(r.data.list);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== 'all') list = list.filter((x) => x.type === tab);
    if (keyword.trim()) list = list.filter((x) => (x.title + (x.summary || '')).includes(keyword.trim()));
    return list;
  }, [items, tab, keyword]);

  return (
    <div data-name="FoodCalorie-Discover" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      {/* 顶部：标题 + 铃铛 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>发现</span>
        <i className="fas fa-bell" style={{ fontSize: 16, color: '#1A1A1A' }} />
      </div>

      {/* 搜索框（本地过滤） */}
      <div style={{ padding: '4px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', borderRadius: 14, padding: '0 14px', height: 42, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: '#9CA3AF' }} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索食谱、减脂知识…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
          />
        </div>
      </div>

      {/* 分类切换 */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>
        {[{ v: 'all', l: '全部' }, { v: 'recipe', l: '食谱' }, { v: 'article', l: '文章' }].map((t) => (
          <div
            key={t.v}
            onClick={() => setTab(t.v)}
            style={{
              padding: '7px 18px',
              borderRadius: 18,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              background: tab === t.v ? '#34C759' : '#FFFFFF',
              color: tab === t.v ? '#FFFFFF' : '#6B7280'
            }}>
            {t.l}
          </div>
        ))}
      </div>

      {/* Banner：夏季轻食挑战 */}
      <div style={{ margin: '0 20px 14px' }} onClick={() => navigate('/challenge')}>
        <div style={{ borderRadius: 16, padding: '18px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fas fa-medal" style={{ fontSize: 26 }} />
            <div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>21 天打卡计划</div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>夏季轻食挑战</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>拍照记录 · 赢取轻食达人徽章 ›</div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容流 */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>{keyword ? '没有匹配的内容' : '暂无内容'}</div>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c) =>
            c.type === 'recipe' ? (
              <Card key={c.id} data-name={'discover-card-' + c.id} style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer' }} onClick={() => navigate('/recipe?id=' + c.id)}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 30 }}>{c.cover_icon || '🍽️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.summary}</div>
                  <div style={{ fontSize: 11, color: '#E8590C', marginTop: 4, fontWeight: 600 }}>{c.calories} kcal · {c.protein_g}g 蛋白</div>
                </div>
              </Card>
            ) : (
              <Card key={c.id} data-name={'discover-card-' + c.id} style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/article?id=' + c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{c.cover_icon || '📄'}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', flex: 1 }}>{c.title}</span>
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>{c.summary}</div>
                <div style={{ fontSize: 11, color: '#C0C4CC', marginTop: 6 }}>{c.author} · {c.views} 阅读</div>
              </Card>
            )
          )}
        </div>
      )}

      <BottomNav active="/discover" />
    </div>
  );
}
