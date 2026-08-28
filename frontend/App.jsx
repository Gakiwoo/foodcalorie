import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { UnitProvider } from './src/ui/units.jsx';
import AppErrorBoundary from './src/ui/AppErrorBoundary';
import { colors, fontSize, fontWeight } from './src/ui/theme';

// 路由级代码分割（F7）：首页保持静态加载保证首屏，其余页面按需懒加载
const FoodCalorieHome = lazy(() => import('./FoodCalorie-Home.jsx'));
const FoodCalorieSettings = lazy(() => import('./FoodCalorie-Settings.jsx'));
const FoodCalorieCamera = lazy(() => import('./FoodCalorie-Camera.jsx'));
const FoodCalorieRecords = lazy(() => import('./FoodCalorie-Records.jsx'));
const FoodCalorieToday = lazy(() => import('./FoodCalorie-Today.jsx'));
const FoodCalorieDetail = lazy(() => import('./FoodCalorie-Detail.jsx'));
const FoodCalorieDiscover = lazy(() => import('./FoodCalorie-Discover.jsx'));
const FoodCalorieMe = lazy(() => import('./FoodCalorie-Me.jsx'));
const FoodCalorieAddFood = lazy(() => import('./FoodCalorie-AddFood.jsx'));
const FoodCalorieCameraResult = lazy(() => import('./FoodCalorie-CameraResult.jsx'));
const FoodCalorieGoal = lazy(() => import('./FoodCalorie-Goal.jsx'));
const FoodCalorieArticle = lazy(() => import('./FoodCalorie-Article.jsx'));
const FoodCalorieRecipe = lazy(() => import('./FoodCalorie-Recipe.jsx'));
const FoodCalorieSearch = lazy(() => import('./FoodCalorie-Search.jsx'));
const FoodCalorieFavorites = lazy(() => import('./FoodCalorie-Favorites.jsx'));
const FoodCalorieDataExport = lazy(() => import('./FoodCalorie-DataExport.jsx'));
const FoodCalorieNotification = lazy(() => import('./FoodCalorie-Notification.jsx'));
const FoodCaloriePrivacy = lazy(() => import('./FoodCalorie-Privacy.jsx'));
const FoodCalorieAbout = lazy(() => import('./FoodCalorie-About.jsx'));
const FoodCalorieProfile = lazy(() => import('./FoodCalorie-Profile.jsx'));
const FoodCalorieHelp = lazy(() => import('./FoodCalorie-Help.jsx'));
const FoodCalorieDietPref = lazy(() => import('./FoodCalorie-DietPref.jsx'));
const FoodCalorieUnit = lazy(() => import('./FoodCalorie-Unit.jsx'));
const FoodCaloriePrecision = lazy(() => import('./FoodCalorie-Precision.jsx'));
const FoodCalorieBurst = lazy(() => import('./FoodCalorie-Burst.jsx'));
const FoodCalorieChallenge = lazy(() => import('./FoodCalorie-Challenge.jsx'));
const FoodCalorieEditRecord = lazy(() => import('./FoodCalorie-EditRecord.jsx'));
const FoodCalorieRecordsWeek = lazy(() => import('./FoodCalorie-RecordsWeek.jsx'));
const FoodCalorieRecordsMonth = lazy(() => import('./FoodCalorie-RecordsMonth.jsx'));
const FoodCalorieLogin = lazy(() => import('./FoodCalorie-Login.jsx'));
const FoodCalorieRegister = lazy(() => import('./FoodCalorie-Register.jsx'));
const FoodCalorieNotFound = lazy(() => import('./FoodCalorie-NotFound.jsx'));

// 路由注册
const PAGES = [
  { path: '/', Comp: FoodCalorieHome },
  { path: '/settings', Comp: FoodCalorieSettings },
  { path: '/camera', Comp: FoodCalorieCamera },
  { path: '/records', Comp: FoodCalorieRecords },
  { path: '/today', Comp: FoodCalorieToday },
  { path: '/detail', Comp: FoodCalorieDetail },
  { path: '/discover', Comp: FoodCalorieDiscover },
  { path: '/me', Comp: FoodCalorieMe },
  { path: '/addfood', Comp: FoodCalorieAddFood },
  { path: '/camera-result', Comp: FoodCalorieCameraResult },
  { path: '/goal', Comp: FoodCalorieGoal },
  { path: '/article', Comp: FoodCalorieArticle },
  { path: '/recipe', Comp: FoodCalorieRecipe },
  { path: '/search', Comp: FoodCalorieSearch },
  { path: '/favorites', Comp: FoodCalorieFavorites },
  { path: '/dataexport', Comp: FoodCalorieDataExport },
  { path: '/notification', Comp: FoodCalorieNotification },
  { path: '/privacy', Comp: FoodCaloriePrivacy },
  { path: '/about', Comp: FoodCalorieAbout },
  // 本轮新增
  { path: '/profile', Comp: FoodCalorieProfile },
  { path: '/help', Comp: FoodCalorieHelp },
  { path: '/dietpref', Comp: FoodCalorieDietPref },
  { path: '/unit', Comp: FoodCalorieUnit },
  { path: '/precision', Comp: FoodCaloriePrecision },
  { path: '/burst', Comp: FoodCalorieBurst },
  { path: '/challenge', Comp: FoodCalorieChallenge },
  { path: '/editrecord', Comp: FoodCalorieEditRecord },
  { path: '/records-week', Comp: FoodCalorieRecordsWeek },
  { path: '/records-month', Comp: FoodCalorieRecordsMonth },
  { path: '/login', Comp: FoodCalorieLogin },
  { path: '/register', Comp: FoodCalorieRegister }
];

// 路由路径 → 页面标题映射（用于 document.title 动态更新与屏幕阅读器通知）
const PAGE_TITLES = {
  '/': '首页 - 食刻',
  '/settings': '设置 - 食刻',
  '/camera': '拍照识别 - 食刻',
  '/records': '饮食记录 - 食刻',
  '/today': '今日摄入 - 食刻',
  '/detail': '记录详情 - 食刻',
  '/discover': '发现 - 食刻',
  '/me': '我的 - 食刻',
  '/addfood': '添加食物 - 食刻',
  '/camera-result': '识别结果 - 食刻',
  '/goal': '目标设置 - 食刻',
  '/article': '文章详情 - 食刻',
  '/recipe': '食谱详情 - 食刻',
  '/search': '搜索食物 - 食刻',
  '/favorites': '我的收藏 - 食刻',
  '/dataexport': '数据导出 - 食刻',
  '/notification': '通知设置 - 食刻',
  '/privacy': '隐私设置 - 食刻',
  '/about': '关于食刻',
  '/profile': '个人资料 - 食刻',
  '/help': '帮助与反馈 - 食刻',
  '/dietpref': '饮食偏好 - 食刻',
  '/unit': '单位设置 - 食刻',
  '/precision': '识别精度 - 食刻',
  '/burst': '连拍模式 - 食刻',
  '/challenge': '挑战活动 - 食刻',
  '/editrecord': '编辑记录 - 食刻',
  '/records-week': '周记录 - 食刻',
  '/records-month': '月历 - 食刻',
  '/login': '登录 - 食刻',
  '/register': '注册 - 食刻',
  '*': '页面未找到 - 食刻'
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const stackRef = useRef([]);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  }

  useEffect(() => {
    const s = stackRef.current;
    // 模拟原生导航栈：目标页已在栈中时截断到该位置（而非重复 push），
    // 避免 Tab 反复切换后栈内堆积重复项、返回键在相同页面间打转
    const existing = s.lastIndexOf(location.pathname);
    if (existing >= 0) {
      s.length = existing + 1;
    } else {
      s.push(location.pathname);
    }
  }, [location.pathname]);

  function goBack() {
    const s = stackRef.current;
    if (s.length > 1) {
      s.pop();
      const prev = s[s.length - 1];
      navigate(prev);
    } else {
      navigate('/');
    }
  }

  // 记录页：从设置进入时显示返回箭头
  const fromSettings = location.pathname === '/records' && location.state && location.state.from === 'settings';

  // 全局 toast 事件（由 src/ui/toast.js 派发，供真实数据组件复用 toast UI）
  useEffect(() => {
    const h = (e) => showToast(e.detail);
    window.addEventListener('fc-toast', h);
    return () => window.removeEventListener('fc-toast', h);
  }, []);

  // 路由切换：动态更新 document.title 并将焦点移至主内容区（屏幕阅读器友好）
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || '食刻 - 健康饮食记录';
    document.title = title;
    // 延迟一帧聚焦，确保新页面 DOM 已渲染
    const t = requestAnimationFrame(() => {
      const main = document.getElementById('main-content');
      if (main) main.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(t);
  }, [location.pathname]);

  return (
    <UnitProvider>
      <div className="app-shell">
        {/* 键盘可访问的跳转链接：Tab 聚焦时显示，回车跳至主内容 */}
        <a
          href="#main-content"
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const main = document.getElementById('main-content');
            if (main) main.focus({ preventScroll: false });
          }}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            zIndex: 9999,
            padding: '10px 20px',
            background: colors.primary,
            color: colors.textInverse,
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold,
            borderRadius: '0 0 8px 0',
            textDecoration: 'none'
          }}
          onFocus={(e) => { e.target.style.left = '0'; }}
          onBlur={(e) => { e.target.style.left = '-9999px'; }}>
          跳至主内容
        </a>
        <div className="page-frame">
          <AppErrorBoundary>
            <Suspense fallback={<div style={{ minHeight: '100dvh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textTertiary, fontSize: fontSize.md }}>加载中…</div>}>
              <Routes>
                {PAGES.map((p) => (
                  <Route key={p.path} path={p.path} element={<p.Comp />} />
                ))}
                <Route path="*" element={<FoodCalorieNotFound />} />
              </Routes>
            </Suspense>
          </AppErrorBoundary>
          {fromSettings && (
            <button
              className="records-back-btn"
              data-name="records-back-float"
              onClick={goBack}
              aria-label="返回设置">
              <i className="fas fa-chevron-left" style={{ fontSize: '16px', color: colors.textPrimary }} />
              <span style={{ fontSize: '13px', color: colors.textPrimary, fontWeight: 600 }}>设置</span>
            </button>
          )}
        </div>
        {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
      </div>
    </UnitProvider>
  );
}
