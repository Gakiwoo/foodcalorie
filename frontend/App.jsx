import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import FoodCalorieHome from './FoodCalorie-Home.jsx';
import FoodCalorieSettings from './FoodCalorie-Settings.jsx';
import FoodCalorieCamera from './FoodCalorie-Camera.jsx';
import FoodCalorieRecords from './FoodCalorie-Records.jsx';
import FoodCalorieToday from './FoodCalorie-Today.jsx';
import FoodCalorieDetail from './FoodCalorie-Detail.jsx';
import FoodCalorieDiscover from './FoodCalorie-Discover.jsx';
import FoodCalorieMe from './FoodCalorie-Me.jsx';
import FoodCalorieAddFood from './FoodCalorie-AddFood.jsx';
import FoodCalorieCameraResult from './FoodCalorie-CameraResult.jsx';
import FoodCalorieGoal from './FoodCalorie-Goal.jsx';
import FoodCalorieArticle from './FoodCalorie-Article.jsx';
import FoodCalorieRecipe from './FoodCalorie-Recipe.jsx';
import FoodCalorieSearch from './FoodCalorie-Search.jsx';
import FoodCalorieFavorites from './FoodCalorie-Favorites.jsx';
import FoodCalorieDataExport from './FoodCalorie-DataExport.jsx';
import FoodCalorieNotification from './FoodCalorie-Notification.jsx';
import FoodCaloriePrivacy from './FoodCalorie-Privacy.jsx';
import FoodCalorieAbout from './FoodCalorie-About.jsx';
// 本轮新增 10 页
import FoodCalorieProfile from './FoodCalorie-Profile.jsx';
import FoodCalorieHelp from './FoodCalorie-Help.jsx';
import FoodCalorieDietPref from './FoodCalorie-DietPref.jsx';
import FoodCalorieUnit from './FoodCalorie-Unit.jsx';
import FoodCaloriePrecision from './FoodCalorie-Precision.jsx';
import FoodCalorieBurst from './FoodCalorie-Burst.jsx';
import FoodCalorieChallenge from './FoodCalorie-Challenge.jsx';
import FoodCalorieEditRecord from './FoodCalorie-EditRecord.jsx';
import FoodCalorieRecordsWeek from './FoodCalorie-RecordsWeek.jsx';
import FoodCalorieRecordsMonth from './FoodCalorie-RecordsMonth.jsx';
// 登录注册
import FoodCalorieLogin from './FoodCalorie-Login.jsx';
import FoodCalorieRegister from './FoodCalorie-Register.jsx';
// 真实后端对接
// (logout 已内聚到 Settings 组件内部处理，不再需要全局注入)

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

// ===== 全局 toast 注入（供 src/ui/toast.js 的 toast() 使用）=====
let toastFn = null;      // 由 App 注入
function addMsg(name) {
  const m = name.match(/^food-add-(\d+)$/) || name.match(/^result-(\d+)-add$/);
  return m ? `已添加第 ${m[1]} 项，正在返回记录页` : '已添加，正在返回记录页';
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const stackRef = useRef([]);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  toastFn = (msg) => showToast(msg);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1600);
  }

  useEffect(() => {
    const s = stackRef.current;
    if (s[s.length - 1] !== location.pathname) s.push(location.pathname);
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
        <Routes>
          {PAGES.map((p) => (
            <Route key={p.path} path={p.path} element={<p.Comp />} />
          ))}
        </Routes>
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
