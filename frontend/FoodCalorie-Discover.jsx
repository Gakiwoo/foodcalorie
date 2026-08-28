import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, BottomNav, Card } from './src/ui/common';
import { useUnits } from './src/ui/units';
import { Loading, EmptyState } from './src/ui/PageState';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieDiscover() {
  const navigate = useNavigate();
  const { unitCalorie, unitWeight, kcal, g } = useUnits();
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
    <PageContainer data-name="FoodCalorie-Discover">
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <span style={{ fontSize: 20, fontWeight: fontWeight.extrabold, color: colors.textPrimary }}>发现</span>
        <i className="fas fa-bell" style={{ fontSize: 16, color: colors.textPrimary, cursor: 'pointer' }} onClick={() => navigate('/notification')} />
      </div>

      <div style={{ padding: '4px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: colors.surface, borderRadius: radius.lg, padding: '0 14px', height: 42, boxShadow: shadow.md }}>
          <i className="fas fa-magnifying-glass" style={{ fontSize: 14, color: colors.textTertiary }} />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索食谱、减脂知识…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: fontSize.lg, background: 'transparent' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>
        {[{ v: 'all', l: '全部' }, { v: 'recipe', l: '食谱' }, { v: 'article', l: '文章' }].map((t) => (
          <div key={t.v} onClick={() => setTab(t.v)} style={{ padding: '7px 18px', borderRadius: 18, fontSize: fontSize.md, fontWeight: fontWeight.semibold, cursor: 'pointer', background: tab === t.v ? colors.primary : colors.surface, color: tab === t.v ? colors.textInverse : colors.textSecondary }}>
            {t.l}
          </div>
        ))}
      </div>

      <div style={{ margin: '0 20px 14px' }} onClick={() => navigate('/challenge')}>
        <div style={{ borderRadius: radius.xl, padding: '18px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: colors.textInverse, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="fas fa-medal" style={{ fontSize: 26 }} />
            <div>
              <div style={{ fontSize: fontSize.xs, opacity: 0.85 }}>21 天打卡计划</div>
              <div style={{ fontSize: 17, fontWeight: fontWeight.extrabold }}>夏季轻食挑战</div>
              <div style={{ fontSize: fontSize.xs, opacity: 0.85, marginTop: 2 }}>拍照记录 · 赢取轻食达人徽章 ›</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading text="加载中…" padding={40} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="fa-compass" text={keyword ? '没有匹配的内容' : '暂无内容'} padding={40} />
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c) =>
            c.type === 'recipe' ? (
              <Card key={c.id} data-name={'discover-card-' + c.id} style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer' }} onClick={() => navigate('/recipe?id=' + c.id)}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: colors.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 30 }}>{c.cover_icon || '🍽️'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.summary}</div>
                  <div style={{ fontSize: fontSize.xs, color: '#E8590C', marginTop: 4, fontWeight: fontWeight.semibold }}>{kcal(c.calories)} {unitCalorie} · {g(c.protein_g)} {unitWeight} 蛋白</div>
                </div>
              </Card>
            ) : (
              <Card key={c.id} data-name={'discover-card-' + c.id} style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/article?id=' + c.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{c.cover_icon || '📄'}</span>
                  <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, flex: 1 }}>{c.title}</span>
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textTertiary, marginTop: 6 }}>{c.summary}</div>
                <div style={{ fontSize: fontSize.xs, color: '#C0C4CC', marginTop: 6 }}>{c.author} · {c.views} 阅读</div>
              </Card>
            )
          )}
        </div>
      )}

      <BottomNav active="/discover" />
    </PageContainer>
  );
}
