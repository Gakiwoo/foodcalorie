# -*- coding: utf-8 -*-
"""给设置页 JSX 插入「我的记录」行"""
html = open('FoodCalorie-Settings.jsx', encoding='utf-8').read()
i = html.find('data-name="account-card"')
start = html.rfind('<div', 0, i)
depth = 0
pos = start
while pos < len(html):
    o = html.find('<div', pos)
    c = html.find('</div>', pos)
    if o == -1 and c == -1:
        break
    if o != -1 and (c == -1 or o < c):
        depth += 1
        pos = o + 5
    else:
        depth -= 1
        pos = c + 6
        if depth == 0:
            break
end = pos

new_row = """
      <div
        data-node-id="S-RECORDS"
        data-name="card-records"
        style={{
          width: '335px',
          height: '48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: '16px',
          paddingRight: '16px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
        }}>
        <div
          data-name="records-left"
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '12px'
          }}>
          <div
            data-name="records-icon-wrap"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px',
              background: '#E8F5EC'
            }}>
            <i className="fas fa-clipboard-list" style={{ fontSize: '16px', color: '#22A85A' }} />
          </div>
          <span
            data-name="label-records"
            style={{
              color: '#1A1A1A',
              fontSize: '14px',
              fontWeight: '600',
              lineHeight: '20px'
            }}>
            我的记录
          </span>
        </div>
        <div data-name="records-right" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span data-name="records-sub" style={{ color: '#9CA3AF', fontSize: '12px' }}>128 条记录</span>
          <i className="fas fa-chevron-right" style={{ fontSize: '12px', color: '#C0C4CC' }} />
        </div>
      </div>
"""
html = html[:end] + new_row + html[end:]
open('FoodCalorie-Settings.jsx', 'w', encoding='utf-8').write(html)
print('我的记录行已插入，文件长度:', len(html))
