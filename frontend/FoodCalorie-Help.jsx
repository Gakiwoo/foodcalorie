import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from './src/ui/toast';
import { StatusBar } from './src/ui/common';
import { PageContainer } from './src/ui/components';
import { colors, radius, shadow, fontSize, fontWeight } from './src/ui/theme';

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
    <PageContainer data-name="FoodCalorie-Help">
      <StatusBar />

      <div style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 20px' }}>
        <i className="fas fa-chevron-left" style={{ fontSize: 22, color: colors.textPrimary, cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: fontSize.display, fontWeight: fontWeight.bold, color: colors.textPrimary }}>帮助与反馈</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 20px 8px' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg }}>
          <div style={{ padding: '16px 16px 12px' }}>
            <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>常见问题</span>
          </div>
          {FAQS.map((q, i) => (
            <React.Fragment key={q}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toast('常见问题详情开发中')}>
                <span style={{ flex: 1, fontSize: fontSize.lg, color: colors.textPrimary }}>{q}</span>
                <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC' }} />
              </div>
              {i < FAQS.length - 1 && <div style={{ width: 'calc(100% - 32px)', height: 1, background: colors.segBg, margin: '0 auto' }} />}
            </React.Fragment>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 16px', cursor: 'pointer' }} onClick={() => toast('全部问题列表开发中')}>
            <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.primaryDark }}>查看全部问题</span>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg }}>
          <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary }}>意见反馈</span>
          <div style={{ width: '100%', minHeight: 96, padding: '10px 12px', background: colors.bg, borderRadius: radius.lg }}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请描述你遇到的问题或建议（选填）"
              style={{ width: '100%', height: 74, border: 'none', outline: 'none', background: 'transparent', resize: 'none', fontSize: fontSize.md, color: colors.textPrimary, fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px', height: 44, background: colors.bg, borderRadius: radius.lg }}>
            <span style={{ fontSize: fontSize.md, color: colors.textTertiary }}>联系方式</span>
            <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary }}>微信号 / 手机号（选填）</span>
          </div>
          <div style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 14, background: colors.primary, cursor: 'pointer' }} onClick={() => toast(feedback.trim() ? '反馈已提交，感谢你的建议' : '请先填写反馈内容')}>
            <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textInverse }}>提交反馈</span>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: colors.surface, borderRadius: radius.xl, boxShadow: shadow.lg, cursor: 'pointer' }} onClick={() => toast('客服接入开发中')}>
          <div style={{ width: 36, height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, background: '#E6F4FF', flexShrink: 0 }}>
            <i className="fas fa-headset" style={{ fontSize: 16, color: '#1677FF' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>联系客服</span>
            <span style={{ fontSize: fontSize.xs, color: colors.textTertiary }}>工作日 9:00-18:00 在线</span>
          </div>
          <i className="fas fa-chevron-right" style={{ fontSize: 12, color: '#C0C4CC' }} />
        </div>
      </div>
    </PageContainer>
  );
}
