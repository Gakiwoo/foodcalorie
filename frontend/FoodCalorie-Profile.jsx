import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http, apiClient } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 个人信息页：真实数据（GET/PUT profile + PUT /api/auth/me 昵称）
const GOALS = [
  { value: '减脂', label: '减脂' },
  { value: '保持', label: '保持' },
  { value: '增肌', label: '增肌' }
];

export default function FoodCalorieProfile() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('减脂');
  const [target, setTarget] = useState(1400);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, me] = await Promise.all([
          http.get('/api/v1/foodcalorie/profile'),
          apiClient('/api/auth/me').catch(() => null)
        ]);
        const d = p.data;
        setNickname(me?.user?.nickname || d.nickname || '');
        setGender(d.gender || '');
        setBirthday(d.birthday || '');
        setHeight(d.height_cm != null ? String(d.height_cm) : '');
        setWeight(d.weight_kg != null ? String(d.weight_kg) : '');
        setGoal(d.goal_type || '减脂');
        setTarget(d.target_calories || 1400);
      } catch (e) {
        toast(e.message || '加载失败，请确认已登录');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    if (!nickname.trim()) return toast('昵称不能为空');
    setSaving(true);
    try {
      // 昵称走 gakiwoo /api/auth/me；其余走 profile
      if (nickname !== '') {
        await apiClient('/api/auth/me', { method: 'PUT', body: JSON.stringify({ nickname: nickname.trim() }) }).catch(() => null);
      }
      await http.put('/api/v1/foodcalorie/profile', {
        gender: gender || null,
        birthday: birthday || null,
        height_cm: height ? Number(height) : null,
        weight_kg: weight ? Number(weight) : null,
        goal_type: goal,
        target_calories: Number(target) || 1400
      });
      toast('个人信息已保存');
      navigate('/me');
    } catch (e) {
      toast(e.message || '保存失败');
      setSaving(false);
    }
  }

  const row = (label, child) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{label}</span>
      {child}
    </div>
  );

  const inputStyle = { border: 'none', outline: 'none', textAlign: 'right', fontSize: 14, color: '#1A1A1A', background: 'transparent', width: 150 };

  return (
    <div data-name="FoodCalorie-Profile" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="个人信息" right={<span style={{ fontSize: 13, color: '#22A85A', fontWeight: 600 }} onClick={save}>保存</span>} />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>加载中…</div>
      ) : (
        <>
          {/* 头像卡 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 20px', gap: 8 }}>
            <div style={{ width: 76, height: 76, borderRadius: 38, background: 'linear-gradient(135deg,#34C759 0%,#22A85A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-user" style={{ fontSize: 30, color: '#FFFFFF' }} />
            </div>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>更换头像</span>
          </div>

          <Card style={{ margin: '0 20px 12px', padding: '0 16px' }}>
            {row('昵称', <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={inputStyle} placeholder="请输入昵称" />)}
            {row('性别', <Seg options={[{ value: '女', label: '女' }, { value: '男', label: '男' }]} value={gender} onChange={setGender} />)}
            {row('生日', <input value={birthday} onChange={(e) => setBirthday(e.target.value)} type="date" style={inputStyle} />)}
            {row('身高 (cm)', <input value={height} onChange={(e) => setHeight(e.target.value)} type="number" placeholder="如 175" style={inputStyle} />)}
            {row('体重 (kg)', <input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="如 68" style={inputStyle} />)}
            {row('健康目标', <Seg options={GOALS} value={goal} onChange={setGoal} />)}
            {row('每日目标 (kcal)', <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" style={inputStyle} />)}
          </Card>

          <div style={{ padding: '10px 20px' }}>
            <button onClick={save} disabled={saving} style={{ width: '100%', height: 48, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? '保存中…' : '保存修改'}</button>
          </div>
        </>
      )}
    </div>
  );
}
