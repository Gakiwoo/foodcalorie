#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build an interactive clickable prototype from the 19 FoodCalorie page HTML files."""
import os, re, json

BASE = r"C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/.mastergo/design/200862263389388/M"
OUT  = r"C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/foodcalorie-interactive.html"

# page key -> (file, display name)
PAGES = [
    ("home",        "FoodCalorie-Home-5-022855.html",        "首页"),
    ("camera",      "FoodCalorie-Camera-5-025542.html",      "拍照识别"),
    ("camerresult", "FoodCalorie-CameraResult-12-13437.html","识别结果确认"),
    ("records",     "FoodCalorie-Records-5-025802.html",     "记录"),
    ("today",       "FoodCalorie-Today-5-027553.html",       "今日记录"),
    ("addfood",     "FoodCalorie-AddFood-12-12141.html",     "手动添加"),
    ("search",      "FoodCalorie-Search-12-19005.html",      "搜索结果"),
    ("detail",      "FoodCalorie-Detail-5-087836.html",      "记录详情"),
    ("discover",    "FoodCalorie-Discover-12-09187.html",    "发现"),
    ("article",     "FoodCalorie-Article-12-15888.html",     "文章详情"),
    ("recipe",      "FoodCalorie-Recipe-12-17086.html",      "食谱详情"),
    ("me",          "FoodCalorie-Me-12-10863.html",          "我的"),
    ("goal",        "FoodCalorie-Goal-12-14572.html",        "目标设置"),
    ("favorites",   "FoodCalorie-Favorites.html",            "我的收藏"),
    ("dataexport",  "FoodCalorie-DataExport-12-21042.html",  "数据导出"),
    ("notification","FoodCalorie-Notification-12-22019.html","通知设置"),
    ("privacy",     "FoodCalorie-Privacy-12-22841.html",     "隐私设置"),
    ("about",       "FoodCalorie-About-12-23711.html",       "关于我们"),
    ("settings",    "FoodCalorie-Settings-5-024266.html",    "设置"),
]

def load(name):
    p = os.path.join(BASE, name)
    with open(p, "r", encoding="utf-8") as f:
        return f.read().strip()

# strip the outer <main ...>...</main> so we can re-wrap each page in a screen div
def extract_main(html):
    m = re.search(r"<main\b[^>]*>([\s\S]*?)</main>", html)
    if m:
        return m.group(1)
    return html

screens = {}
for key, fname, label in PAGES:
    html = load(fname)
    body = extract_main(html)
    screens[key] = {"label": label, "body": body}

screens_json = json.dumps({k: {"label": v["label"], "body": v["body"]} for k, v in screens.items()}, ensure_ascii=False)

# interaction map: (pageKey, selector) -> targetPage  ("" means back)
NAV = {
    "home":        [["[data-name='nav-record']", "records"], ["[data-name='nav-discover']", "discover"], ["[data-name='nav-me']", "me"], ["[data-name='camera-card']", "camera"], ["[data-name='food-card-1']", "detail"], ["[data-name='food-card-2']", "detail"], ["[data-name='food-card-3']", "detail"], ["[data-name='history-more']", "records"]],
    "camera":      [["[data-name='shutter']", "camerresult"], ["[data-name='nav-back']", ""]],
    "camerresult": [["[data-name='btn-confirm']", "records"], ["[data-name='btn-retake']", "camera"], ["[data-name='nav-back']", ""]],
    "records":     [["[data-name='nav-home']", "home"], ["[data-name='nav-discover']", "discover"], ["[data-name='nav-me']", "me"], ["[data-name='food-card-1']", "detail"], ["[data-name='food-card-2']", "detail"], ["[data-name='food-card-3']", "detail"], ["[data-name='food-card-4']", "detail"], ["[data-name='food-card-5']", "detail"]],
    "today":       [["[data-name='nav-back']", ""], ["[data-name='food-card-b']", "detail"], ["[data-name='food-card-l']", "detail"], ["[data-name='food-card-d']", "detail"]],
    "addfood":     [["[data-name='nav-back']", ""], ["[data-name='search-bar']", "search"], ["[data-name='food-add-1']", "records"], ["[data-name='food-add-2']", "records"], ["[data-name='food-add-3']", "records"], ["[data-name='food-add-4']", "records"], ["[data-name='food-add-5']", "records"], ["[data-name='food-add-6']", "records"]],
    "search":      [["[data-name='nav-back']", ""], ["[data-name='search-bar']", "search"], ["[data-name='result-1-add']", "records"], ["[data-name='result-2-add']", "records"], ["[data-name='result-3-add']", "records"], ["[data-name='result-4-add']", "records"], ["[data-name='result-5-add']", "records"], ["[data-name='result-6-add']", "records"]],
    "detail":      [["[data-name='nav-back']", ""], ["[data-name='btn-delete']", "records"], ["[data-name='btn-edit']", "records"]],
    "discover":    [["[data-name='nav-home']", "home"], ["[data-name='nav-record']", "records"], ["[data-name='nav-me']", "me"], ["[data-name='search-bar']", "search"], ["[data-name='article-card']", "article"], ["[data-name='recipe-card-1']", "recipe"], ["[data-name='recipe-card-2']", "recipe"], ["[data-name='knowledge-card']", "article"]],
    "article":     [["[data-name='nav-back']", ""], ["[data-name='related-card-1']", "article"], ["[data-name='related-card-2']", "article"]],
    "recipe":      [["[data-name='nav-back']", ""]],
    "me":          [["[data-name='nav-home']", "home"], ["[data-name='nav-record']", "records"], ["[data-name='nav-discover']", "discover"], ["[data-name='quick-1']", "records"], ["[data-name='quick-2']", "goal"], ["[data-name='quick-3']", "favorites"], ["[data-name='quick-4']", "dataexport"], ["[data-name='s-icon-1']", "notification"], ["[data-name='s-icon-2']", "privacy"], ["[data-name='s-icon-3']", "about"], ["[data-name='s-icon-4']", "about"]],
    "goal":        [["[data-name='nav-back']", ""], ["[data-name='save-btn']", "me"]],
    "favorites":   [["[data-name='nav-back']", ""]],
    "dataexport":  [["[data-name='nav-back']", ""]],
    "notification":[["[data-name='nav-back']", ""], ["[data-name='save-btn']", "me"]],
    "privacy":     [["[data-name='nav-back']", ""]],
    "about":       [["[data-name='nav-back']", ""]],
    "settings":    [["[data-name='nav-back']", "me"]],
}

nav_json = json.dumps(NAV, ensure_ascii=False)

html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>食刻 App · 可点击交互原型</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
  html,body{margin:0;padding:0;background:#eef0f3;font-family:Inter,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;}
  .stage{display:flex;flex-direction:column;align-items:center;min-height:100vh;padding:24px 16px 60px;}
  .toolbar{position:sticky;top:0;z-index:50;width:100%;max-width:900px;display:flex;flex-direction:column;gap:8px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px 16px;box-shadow:0 4px 14px rgba(0,0,0,.05);margin-bottom:20px;}
  .toolbar-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
  .toolbar h1{font-size:16px;font-weight:600;color:#111;margin:0;}
  .toolbar .sub{font-size:12px;color:#9ca3af;}
  .jump{display:flex;flex-wrap:wrap;gap:6px;}
  .jump button{font-size:12px;padding:4px 10px;border-radius:12px;border:1px solid #e5e7eb;background:#f7f8fa;color:#333;cursor:pointer;}
  .jump button:hover{background:#e8f5ec;border-color:#34c759;color:#22a85a;}
  .phone{position:relative;width:375px;border-radius:38px;background:#111;padding:10px;box-shadow:0 20px 60px rgba(0,0,0,.25);}
  .phone-screen{position:relative;width:355px;height:772px;background:#F7F8FA;border-radius:30px;overflow:hidden;}
  .screen{position:absolute;inset:0;display:none;overflow-y:auto;}
  .screen.active{display:block;}
  .screen::-webkit-scrollbar{width:0;}
  .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:100px;background:rgba(17,17,17,.88);color:#fff;font-size:13px;padding:10px 18px;border-radius:20px;z-index:99;opacity:0;pointer-events:none;transition:opacity .25s;}
  .toast.show{opacity:1;}
  .crumb{font-size:11px;color:#9ca3af;}
</style>
</head>
<body>
<div class="stage">
  <div class="toolbar">
    <div class="toolbar-top">
      <h1>食刻 App · 交互原型</h1>
      <span class="crumb" id="crumb">当前页：首页</span>
      <span style="flex:1"></span>
      <button onclick="historyBack()" style="font-size:12px;padding:5px 12px;border-radius:12px;background:#34c759;color:#fff;border:none;cursor:pointer;">← 返回上页</button>
      <button onclick="resetProto()" style="font-size:12px;padding:5px 12px;border-radius:12px;background:#f7f8fa;color:#555;border:1px solid #e5e7eb;cursor:pointer;">重置到首页</button>
    </div>
    <div class="jump" id="jump"></div>
  </div>
  <div class="phone">
    <div class="phone-screen" id="phoneScreen"></div>
  </div>
  <div class="toast" id="toast"></div>
  <p style="margin-top:16px;font-size:12px;color:#9ca3af;text-align:center;">提示：点击页面内卡片 / 按钮 / 底部 Tab 体验跳转；顶部按钮可快速直达任意页面。<br>原型演示仅做跳转串联，不代表最终交互还原。</p>
</div>
<script>
var SCREENS = __SCREENS__;
var NAV = __NAV__;
var order = Object.keys(SCREENS);
var stack = [];
var current = "home";

function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;");}

function render(){
  var ps = document.getElementById("phoneScreen");
  ps.innerHTML = "";
  order.forEach(function(key){
    var d = document.createElement("div");
    d.className = "screen" + (key===current ? " active" : "");
    d.id = "screen-" + key;
    d.innerHTML = SCREENS[key].body;
    ps.appendChild(d);
  });
  bindNav();
  document.getElementById("crumb").textContent = "当前页：" + SCREENS[current].label;
}

function go(key, push){
  if(!SCREENS[key]) return;
  if(push!==false){ stack.push(current); }
  current = key;
  var els = document.querySelectorAll(".screen");
  for(var i=0;i<els.length;i++){ els[i].classList.remove("active"); }
  var t = document.getElementById("screen-"+key);
  if(t){ t.classList.add("active"); t.scrollTop = 0; }
  document.getElementById("crumb").textContent = "当前页：" + SCREENS[key].label;
}

function historyBack(){
  if(stack.length===0){ go("home",false); return; }
  var prev = stack.pop();
  go(prev, false);
}

function resetProto(){ stack=[]; go("home",false); }

function toast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(function(){ t.classList.remove("show"); }, 1600);
}

function bindNav(){
  order.forEach(function(key){
    var page = document.getElementById("screen-"+key);
    if(!page || !NAV[key]) return;
    NAV[key].forEach(function(item){
      var sel = item[0], target = item[1];
      var els = page.querySelectorAll(sel);
      for(var i=0;i<els.length;i++){
        els[i].style.cursor = "pointer";
        els[i].addEventListener("click", function(e){
          e.stopPropagation();
          if(target===""){ historyBack(); }
          else if(SCREENS[target]){ go(target); }
        });
      }
    });
  });
}

// build jump panel
(function(){
  var j = document.getElementById("jump");
  order.forEach(function(key){
    var b = document.createElement("button");
    b.textContent = SCREENS[key].label;
    b.onclick = function(){ go(key); };
    j.appendChild(b);
  });
})();

render();
</script>
</body>
</html>
"""

html = html.replace("__SCREENS__", screens_json).replace("__NAV__", nav_json)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

print("OK ->", OUT)
print("pages:", len(PAGES))
print("size:", os.path.getsize(OUT), "bytes")
