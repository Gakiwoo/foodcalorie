import React, { useState } from 'react';
import { apiClient } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar, Card, Seg } from './src/ui/common';

// 数据导出页：真实导出（POST /export → CSV 附件下载 / JSON 预览）
export default function FoodCalorieDataExport() {
  const [range, setRange] = useState('all');
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [jsonPreview, setJsonPreview] = useState(null);

  async function doExport() {
    setExporting(true);
    setJsonPreview(null);
    try {
      const url = '/api/v1/foodcalorie/export?format=' + format + '&range=' + range;
      // 统一走 apiClient（_raw 返回原始 Response）：自动鉴权 + 401 刷新自愈
      const resp = await apiClient(url, { method: 'POST', _raw: true });
      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error(body?.message || '导出失败');
      }
      if (format === 'csv') {
        // 触发浏览器下载
        const blob = await resp.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `foodcalorie-records-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        a.remove();
        toast('CSV 已导出并下载');
      } else {
        const body = await resp.json();
        setJsonPreview(body.data);
        toast(`已导出 ${body.data.count} 条记录`);
      }
    } catch (e) {
      toast(e.message || '导出失败，请先登录');
    } finally {
      setExporting(false);
    }
  }

  const RANGES = [
    { value: 'all', label: '全部' },
    { value: 'month', label: '近一月' },
    { value: 'week', label: '近一周' },
    { value: 'day', label: '今日' }
  ];

  return (
    <div data-name="FoodCalorie-DataExport" style={{ width: '100%', minHeight: '100dvh', background: '#F7F8FA', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <StatusBar />
      <NavBar title="数据导出" />

      {/* 时间范围 */}
      <Card style={{ margin: '6px 20px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>导出时间范围</div>
        <Seg options={RANGES} value={range} onChange={setRange} />
      </Card>

      {/* 格式 */}
      <Card style={{ margin: '0 20px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>导出格式</div>
        <Seg options={[{ value: 'csv', label: 'CSV（Excel 可用）' }, { value: 'json', label: 'JSON（程序对接）' }]} value={format} onChange={setFormat} />
      </Card>

      <Card style={{ margin: '0 20px 12px', background: '#FFF7E8', boxShadow: 'none' }}>
        <div style={{ fontSize: 12, color: '#B25E09', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <i className="fas fa-circle-info" style={{ marginTop: 1 }} />
          <span>导出包含：食物名称、餐次、热量、蛋白质/碳水/脂肪、记录时间。CSV 带 BOM，Excel 打开中文不乱码。</span>
        </div>
      </Card>

      <div style={{ padding: '10px 20px' }}>
        <button onClick={doExport} disabled={exporting} style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', background: '#34C759', color: '#fff', fontSize: 15, fontWeight: 700, cursor: exporting ? 'wait' : 'pointer' }}>
          {exporting ? '导出中…' : format === 'csv' ? '导出并下载 CSV' : '导出 JSON'}
        </button>
      </div>

      {/* JSON 预览 */}
      {jsonPreview && (
        <Card style={{ margin: '0 20px 20px', padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>导出结果（{jsonPreview.count} 条）</div>
          <pre style={{ fontSize: 11, color: '#4B5563', maxHeight: 200, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(jsonPreview.records?.slice(0, 5) || [], null, 1)}
          </pre>
        </Card>
      )}
    </div>
  );
}
