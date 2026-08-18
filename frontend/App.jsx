import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

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

  return (
    <div className="app-shell">
      <div className="page-frame">
        <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>加载中…</div>}>
          <Routes>
            {PAGES.map((p) => (
              <Route key={p.path} path={p.path} element={<p.Comp />} />
            ))}
          </Routes>
        </Suspense>
        {fromSettings && (
          <button
            className="records-back-btn"
            data-name="records-back-float"
            onClick={goBack}
            aria-label="返回设置">
            <i className="fas fa-chevron-left" style={{ fontSize: '16px', color: '#1A1A1A' }} />
            <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 600 }}>设置</span>
          </button>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
