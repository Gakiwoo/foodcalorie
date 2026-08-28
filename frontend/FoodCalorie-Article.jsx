import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';
import { useBusy } from './src/ui/useBusy';
import { PageContainer } from './src/ui/components';
import { colors, radius, fontSize, fontWeight } from './src/ui/theme';

export default function FoodCalorieArticle() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [article, setArticle] = useState(null);
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { run: runFav } = useBusy();

  const loadFav = useCallback(async () => {
    try {
      const r = await http.get('/api/v1/foodcalorie/favorites', { type: 'article' });
      setFaved((r.data || []).some((f) => f.ref_id === Number(id)));
    } catch {
      setFaved(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/contents/' + id);
        setArticle(r.data);
        loadFav();
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, loadFav]);

  async function toggleFav() {
    await runFav(async () => {
      try {
        if (faved) {
          await http.del('/api/v1/foodcalorie/favorites?type=article&ref_id=' + id);
          setFaved(false);
          toast('已取消收藏');
        } else {
          await http.post('/api/v1/foodcalorie/favorites', { type: 'article', ref_id: Number(id) });
          setFaved(true);
          toast('已收藏文章');
        }
      } catch (e) {
        toast(e.message || '操作失败');
      }
    });
  }

  if (loading) return <PageContainer><StatusBar /><NavBar title="文章" /><div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>加载中…</div></PageContainer>;

  if (!article) {
    return (
      <PageContainer data-name="FoodCalorie-Article">
        <StatusBar /><NavBar title="文章" />
        <div style={{ padding: 60, textAlign: 'center', color: colors.textTertiary, fontSize: fontSize.lg }}>内容不存在或已删除</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer data-name="FoodCalorie-Article">
      <StatusBar />
      <NavBar title="文章" right={
        <i className={'fas fa-bookmark'} role="button" tabIndex={0} aria-label={faved ? '取消收藏' : '收藏文章'} style={{ fontSize: 16, color: faved ? colors.primary : '#C0C4CC', cursor: 'pointer' }} onClick={toggleFav} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFav(); } }} />
      } />

      <div style={{ margin: '6px 20px 14px' }}>
        <div style={{ borderRadius: radius.xxl, padding: '22px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: colors.textInverse }}>
          <div style={{ fontSize: 34 }}>{article.cover_icon || '📄'}</div>
          <div style={{ fontSize: 19, fontWeight: fontWeight.extrabold, marginTop: 10, lineHeight: 1.4 }}>{article.title}</div>
          <div style={{ fontSize: fontSize.xs, opacity: 0.85, marginTop: 8 }}>{article.author} · {article.views} 阅读</div>
        </div>
      </div>

      <Card style={{ margin: '0 20px 20px' }}>
        <div style={{ fontSize: fontSize.lg, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{article.body || '（暂无正文内容）'}</div>
      </Card>
    </PageContainer>
  );
}
