import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card } from './src/ui/common';

// 拍照识别精度页：真实数据（GET/PUT profile.precision_mode）
const MODES = [
  { value: 'fast', name: '快速', desc: '约 1 秒识别常见食物，省电', icon: 'fa-bolt' },
  { value: 'standard', name: '标准', desc: '约 2 秒识别，准确均衡', icon: 'fa-scale-balanced' },
  { value: 'precise', name: '精准', desc: '约 4 秒识别细分类目，最准确', icon: 'fa-microscope' }
];

export default function FoodCaloriePrecision() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await http.get('/api/v1/foodcalorie/profile');
        setMode(r.data.precision_mode || 'standard');
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
      await http.put('/api/v1/foodcalorie/profile', { precision_mode: mode });
      toast('精度已保存');
      navigate('/settings');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  return (
    <div data-name="FoodCalorie-Precision" style={{ width: 375, minHeight: 812, background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="拍照识别精度" />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          <div style={{ padding: '6px 20px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MODES.map((m) => {
              const on = mode === m.value;
              return (
                <Card key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, cursor: 'pointer', border: on ? '1.5px solid #34C759' : '1.5px solid transparent' }} onClick={() => setMode(m.value)}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: on ? '#34C759' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={'fas ' + m.icon} style={{ fontSize: 16, color: on ? '#FFFFFF' : '#9CA3AF' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{m.desc}</div>
                  </div>
                  {on && <i className="fas fa-circle-check" style={{ fontSize: 18, color: '#34C759' }} />}
                </Card>
              );
            })}
          </div>
          <Card style={{ margin: '0 20px 12px', background: '#FFF7E8', boxShadow: 'none' }}>
            <div style={{ fontSize: 12, color: '#B25E09', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <i className="fas fa-circle-info" style={{ marginTop: 1 }} />
              <span>精度越高耗时耗电越多，日常使用建议「标准」。</span>
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
