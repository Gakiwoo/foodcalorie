import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 文章详情页：真实数据（GET /contents/:id 正文 + 收藏/取消收藏）
export default function FoodCalorieArticle() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('id');
  const [article, setArticle] = useState(null);
  const [faved, setFaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
  }

  if (loading) return <div style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}><StatusBar /><NavBar title="文章" /><div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div></div>;

  if (!article) {
    return (
      <div data-name="FoodCalorie-Article" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column' }}>
        <StatusBar /><NavBar title="文章" />
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>内容不存在或已删除</div>
      </div>
    );
  }

  return (
    <div data-name="FoodCalorie-Article" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="文章" right={
        <i className={'fas fa-bookmark'} style={{ fontSize: 16, color: faved ? '#34C759' : '#C0C4CC', cursor: 'pointer' }} onClick={toggleFav} />
      } />

      {/* 封面 + 标题 */}
      <div style={{ margin: '6px 20px 14px' }}>
        <div style={{ borderRadius: 20, padding: '22px 18px', background: 'linear-gradient(135deg,#34C759 0%,#1FA355 100%)', color: '#fff' }}>
          <div style={{ fontSize: 34 }}>{article.cover_icon || '📄'}</div>
          <div style={{ fontSize: 19, fontWeight: 800, marginTop: 10, lineHeight: 1.4 }}>{article.title}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 8 }}>{article.author} · {article.views} 阅读</div>
        </div>
      </div>

      {/* 正文 */}
      <Card style={{ margin: '0 20px 20px' }}>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{article.body || '（暂无正文内容）'}</div>
      </Card>
    </div>
  );
}
