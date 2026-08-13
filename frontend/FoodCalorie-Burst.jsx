import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 连拍模式页：真实数据（GET/PUT profile.burst_enabled + burst_count）
export default function FoodCalorieBurst() {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(false);
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setEnabled(!!r.data.burst_enabled);
        setCount(r.data.burst_count || 3);
      } catch (e) {
        toast(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      await http.put('/api/v1/foodcalorie/profile', { burst_enabled: enabled, burst_count: count });
      toast('设置已保存');
      navigate('/settings');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  return (
    <div data-name="FoodCalorie-Burst" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="连拍模式" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          <Card style={{ margin: '6px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8F5EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fas fa-camera" style={{ fontSize: 16, color: '#22A85A' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>启用连拍模式</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>摆盘复杂时开启，自动选清晰度最高的一张</div>
            </div>
            <div
              onClick={() => setEnabled(!enabled)}
              style={{
                width: 46,
                height: 26,
                borderRadius: 13,
                background: enabled ? '#34C759' : '#D1D5DB',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background .2s',
                flexShrink: 0
              }}>
              <div style={{ position: 'absolute', top: 3, left: enabled ? 23 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left .2s' }} />
            </div>
          </Card>

          <Card style={{ margin: '0 20px 12px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>连拍张数</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[2, 3, 5].map((n) => (
                <div
                  key={n}
                  onClick={() => setCount(n)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '10px 0',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: count === n ? '#34C759' : '#F3F4F6',
                    color: count === n ? '#FFFFFF' : '#6B7280'
                  }}>
                  {n} 张
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ margin: '0 20px 12px', background: '#FFF7E8', boxShadow: 'none' }}>
            <div style={{ fontSize: 12, color: '#B25E09', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <i className="fas fa-circle-info" style={{ marginTop: 1 }} />
              <span>连拍占用更多存储，日常可关闭。</span>
            </div>
          </Card>

          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存设置'}</button>
          </div>
        </>
      )}
    </div>
  );
}
