# -*- coding: utf-8 -*-
"""记录页 61% / 今日记录页 77% 环形图：React JSX 退化白圆 -> 渐变 SVG 环；画布源 HTML 升级渐变"""
import re

def replace_div_block(html, data_name, new_block):
    """找到 data-name=xxx 的 <div 块（div 嵌套计数），整块替换"""
    i = html.find('data-name="' + data_name + '"')
    if i < 0:
        return html, False
    start = html.rfind('<div', 0, i)
    if start < 0:
        return html, False
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
    return html[:start] + new_block + html[pos:], True

def replace_svg_block(html, data_name, new_svg):
    """找到 <svg data-name=xxx ...> 到 </svg> 整块替换"""
    i = html.find("data-name='" + data_name + "'")
    if i < 0:
        i = html.find('data-name="' + data_name + '"')
    if i < 0:
        return html, False
    start = html.rfind('<svg', 0, i)
    if start < 0:
        return html, False
    end = html.find('</svg>', start)
    if end < 0:
        return html, False
    end += len('</svg>')
    return html[:start] + new_svg + html[end:], True

# ===== 1. React JSX: Records.jsx donut -> 渐变 SVG =====
records_svg_jsx = """          <svg
            data-node-id="5:025919"
            data-name="donut"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            style={{ flex: 'none' }}>
            <defs>
              <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34C759" />
                <stop offset="100%" stopColor="#1FA355" />
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="42" fill="none" stroke="#E8F5EC" strokeWidth="12" />
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="url(#donutGrad)"
              strokeWidth="12"
              strokeDasharray="160.98 263.89"
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
            />
            <circle cx="48" cy="48" r="36" fill="#FFFFFF" />
            <text x="48" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1A1A1A" fontFamily="Inter">
              61%
            </text>
            <text x="48" y="60" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter">
              已摄入
            </text>
          </svg>
"""

html = open('FoodCalorie-Records.jsx', encoding='utf-8').read()
html, ok = replace_div_block(html, 'donut', records_svg_jsx)
if ok:
    open('FoodCalorie-Records.jsx', 'w', encoding='utf-8').write(html)
    print('Records.jsx: donut 已替换为渐变 SVG')
else:
    print('Records.jsx: 替换失败')

# ===== 2. React JSX: Today.jsx ring -> 渐变 SVG =====
today_svg_jsx = """          <svg
            data-node-id="5:027717"
            data-name="ring"
            width="112"
            height="112"
            viewBox="0 0 112 112"
            style={{ flex: 'none' }}>
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34C759" />
                <stop offset="100%" stopColor="#1FA355" />
              </linearGradient>
            </defs>
            <circle cx="56" cy="56" r="49.5" fill="none" stroke="#E8F5EC" strokeWidth="13" />
            <circle
              cx="56"
              cy="56"
              r="49.5"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="13"
              strokeDasharray="239.45 310.97"
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
            <circle cx="56" cy="56" r="43" fill="#FFFFFF" />
            <text x="56" y="52" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1A1A1A" fontFamily="Inter">
              1080
            </text>
            <text x="56" y="68" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="Inter">
              已摄入 kcal
            </text>
          </svg>
"""
html = open('FoodCalorie-Today.jsx', encoding='utf-8').read()
html, ok = replace_div_block(html, 'ring', today_svg_jsx)
if ok:
    open('FoodCalorie-Today.jsx', 'w', encoding='utf-8').write(html)
    print('Today.jsx: ring 已替换为渐变 SVG')
else:
    print('Today.jsx: 替换失败')

# ===== 3. 画布源 HTML: Records.html donut SVG 升级渐变 =====
records_svg_html = """<svg data-name='donut' width='96' height='96' viewBox='0 0 96 96' class='shrink-0'>
        <defs>
          <linearGradient id='donutGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='#34C759'/>
            <stop offset='100%' stop-color='#1FA355'/>
          </linearGradient>
        </defs>
        <circle cx='48' cy='48' r='42' fill='none' stroke='#E8F5EC' stroke-width='12'></circle>
        <circle cx='48' cy='48' r='42' fill='none' stroke='url(#donutGrad)' stroke-width='12' stroke-dasharray='160.98 263.89' stroke-linecap='round' transform='rotate(-90 48 48)'></circle>
        <circle cx='48' cy='48' r='36' fill='#FFFFFF'></circle>
        <text x='48' y='44' text-anchor='middle' font-family='Inter' font-size='18' font-weight='700' fill='#1A1A1A'>61%</text>
        <text x='48' y='60' text-anchor='middle' font-family='Inter' font-size='11' fill='#9CA3AF'>已摄入</text>
      </svg>"""
html = open('../.mastergo/design/200862263389388/M/FoodCalorie-Records.html', encoding='utf-8').read()
html, ok = replace_svg_block(html, 'donut', records_svg_html)
if ok:
    open('../.mastergo/design/200862263389388/M/FoodCalorie-Records.html', 'w', encoding='utf-8').write(html)
    print('Records.html: donut SVG 已升级渐变')
else:
    print('Records.html: 替换失败')

# ===== 4. 画布源 HTML: Today.html ring SVG 升级渐变 =====
today_svg_html = """<svg data-name='ring' width='112' height='112' viewBox='0 0 112 112' class='shrink-0'>
        <defs>
          <linearGradient id='ringGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='#34C759'/>
            <stop offset='100%' stop-color='#1FA355'/>
          </linearGradient>
        </defs>
        <circle cx='56' cy='56' r='49.5' fill='none' stroke='#E8F5EC' stroke-width='13'></circle>
        <circle cx='56' cy='56' r='49.5' fill='none' stroke='url(#ringGrad)' stroke-width='13' stroke-dasharray='239.45 310.97' stroke-linecap='round' transform='rotate(-90 56 56)'></circle>
        <circle cx='56' cy='56' r='43' fill='#FFFFFF'></circle>
        <text x='56' y='52' text-anchor='middle' font-family='Inter' font-size='22' font-weight='700' fill='#1A1A1A'>1080</text>
        <text x='56' y='68' text-anchor='middle' font-family='Inter' font-size='11' fill='#9CA3AF'>已摄入 kcal</text>
      </svg>"""
html = open('../.mastergo/design/200862263389388/M/FoodCalorie-Today.html', encoding='utf-8').read()
html, ok = replace_svg_block(html, 'ring', today_svg_html)
if ok:
    open('../.mastergo/design/200862263389388/M/FoodCalorie-Today.html', 'w', encoding='utf-8').write(html)
    print('Today.html: ring SVG 已升级渐变')
else:
    print('Today.html: 替换失败')
