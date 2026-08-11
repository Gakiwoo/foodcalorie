import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from './src/ui/toast';
import { StatusBar } from './src/ui/common';

// 帮助与反馈页：静态内容（原 raw import HTML → React 组件，弃用全局委托）
const FAQS = [
  '如何修改每日卡路里目标？',
  '拍照识别不准怎么办？',
  '如何导出我的健康数据？',
  '更换手机后数据会丢失吗？'
];

export default function FoodCalorieHelp() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');

  return (
    <div data-name="FoodCalorie-Help" style={{ width: 375, minHeight: 812, display: 'flex', flexDirection: 'column', background: '#F7F8FA' }}>
      <StatusBar />

      {/* 顶部导航 */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: '#1A1A1A', cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>帮助与反馈</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 20px 8px' }}>
        {/* 常见问题 */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '16px 16px 12px' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>常见问题</span>
          </div>
          {FAQS.map((q, i) => (
            <React.Fragment key={q}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toast('常见问题详情开发中')}>
                <span style={{ flex: 1, fontSize: 14, color: '#1A1A1A' }}>{q}</span>
                <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC' }} />
              </div>
              {i < FAQS.length - 1 && <div style={{ width: 'calc(100% - 32px)', height: 1, background: '#EEF0F2', margin: '0 auto' }} />}
            </React.Fragment>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toast('全部问题列表开发中')}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#22A85A' }}>查看全部问题</span>
          </div>
        </div>

        {/* 意见反馈 */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>意见反馈</span>
          <div style={{ width: '100%', minHeight: 96, padding: '10px 12px', background: '#F7F8FA', borderRadius: 12 }}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请描述你遇到的问题或建议（选填）"
              style={{ width: '100%', height: 74, border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontSize: 13, color: '#1A1A1A', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', height: 44, background: '#F7F8FA', borderRadius: 12 }}>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>联系方式</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>微信号 / 手机号（选填）</span>
          </div>
          <div
            style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 14, background: '#34C759', cursor: 'pointer' }}
            onClick={() => toast(feedback.trim() ? '反馈已提交，感谢你的建议' : '请先填写反馈内容')}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>提交反馈</span>
          </div>
        </div>

        {/* 联系客服 */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#FFFFFF', borderRadius: 16, boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => toast('客服接入开发中')}>
          <div style={{ width: 36, height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 10, background: '#E6F4FF', flexShrink: 0 }}>
            <i className="fas fa-headset" style={{ fontSize: 16, color: '#1677FF' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>联系客服</span>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>工作日 9:00-18:00 在线</span>
          </div>
          <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC' }} />
        </div>
      </div>
    </div>
  );
}
