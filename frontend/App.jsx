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
import { logout } from './src/api/auth';

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
  { path: '/camerresult', Comp: FoodCalorieCameraResult },
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

// ===== 点击跳转规则表（按 data-name 正则匹配）=====
// action: 路径字符串 | 'back' | 函数(名称)
//   函数返回值: 字符串=目标路径 | {toast?, path?, state?} | null
let toastFn = null;      // 由 App 注入
let confirmDeleteFn = null; // 由 App 注入
function addMsg(name) {
  const m = name.match(/^food-add-(\d+)$/) || name.match(/^result-(\d+)-add$/);
  return m ? `已添加第 ${m[1]} 项，正在返回记录页` : '已添加，正在返回记录页';
}

const NAV = {
  '/': [
    [/^nav-record/, '/records'],
    [/^nav-discover/, '/discover'],
    [/^nav-me/, '/me'],
    [/^camera-(card|cta|section)/, '/camera'],
    [/^food-card-[123]$/, '/detail'],
    [/^history-more/, '/records'],
    [/^nav-settings/, '/settings'],
    [/^nav-date/, '/today']
  ],
  '/camera': [],
  '/camerresult': [],
  // ===== 以下页面已改为真实数据组件（组件内部自处理导航与交互，不再使用全局委托）=====
  '/records': [],
  '/today': [],
  '/addfood': [],
  '/search': [],
  // ===== 真实数据组件（组件内部自处理导航与交互）=====
  '/detail': [],
  '/editrecord': [],
  '/records-week': [],
  '/records-month': [],
  '/dataexport': [],
  '/discover': [],
  '/challenge': [],
  '/favorites': [],
  '/article': [],
  '/recipe': [],
  '/me': [
    [/^nav-home/, '/'],
    [/^nav-record/, '/records'],
    [/^nav-discover/, '/discover'],
    [/^quick-1/, '/records'],
    [/^quick-2/, '/goal'],
    [/^quick-3/, '/favorites'],
    [/^quick-4/, '/dataexport'],
    [/^settings-row-1/, '/notification'],
    [/^settings-row-2/, '/privacy'],
    [/^settings-row-3/, '/help'],
    [/^settings-row-4/, '/about'],
    [/^s-icon-1|^s-label-1|^s-arrow-1|^s-icon-i-1/, '/notification'],
    [/^s-icon-2|^s-label-2|^s-arrow-2|^s-icon-i-2/, '/privacy'],
    [/^s-icon-3|^s-label-3|^s-arrow-3|^s-icon-i-3/, '/help'],
    [/^s-icon-4|^s-label-4|^s-arrow-4|^s-icon-i-4/, '/about'],
    [/^today-detail/, '/today'],
    [/^profile-arrow/, '/profile']
  ],
  '/goal': [],
  '/notification': [],
  '/privacy': [
    [/^nav-back/, 'back'],
    [/^security-row-1/, () => ({ toast: '修改密码开发中' })],
    [/^security-row-2/, () => ({ toast: '注销账号需二次确认（演示）' })]
  ],
  '/about': [
    [/^nav-back/, 'back'],
    [/^link-1/, () => ({ toast: '用户协议（演示）' })],
    [/^link-2/, () => ({ toast: '隐私政策（演示）' })],
    [/^link-3/, () => ({ toast: '联系我们：hello@shike.app' })],
    [/^update-btn/, () => ({ toast: '已是最新版本 v1.0.0' })]
  ],
  '/settings': [
    [/^nav-back/, 'back'],
    [/^card-target/, '/goal'],
    [/^card-recognize/, '/precision'],
    [/^card-notify/, '/notification'],
    [/^label-target-cal|^icon-target-cal|^chev-target-cal/, '/goal'],
    [/^label-diet|^icon-diet|^chev-diet/, '/dietpref'],
    [/^label-unit|^icon-unit|^chev-unit/, '/unit'],
    [/^label-precision|^icon-precision|^chev-precision/, '/precision'],
    [/^label-burst|^icon-burst|^chev-burst/, '/burst'],
    [/^label-privacy|^icon-privacy|^chev-privacy/, '/privacy'],
    [/^label-about|^icon-about|^chev-about/, '/about'],
    [/^label-help|^icon-help|^chev-help/, '/help'],
    [/^account-card/, '/profile'],
    [/^card-records|^label-records|^records-left/, () => ({ path: '/records', state: { from: 'settings' } })],
    [/^logout-card/, () => {
      logout().catch(() => {});
      return { toast: '已退出登录', path: '/login' };
    }]
  ],
  // ===== 登录注册（真实表单组件内部处理交互，无需全局委托规则）=====
  '/login': [],
  '/register': [],
  // ===== 以下设置/资料页已改为真实数据组件（组件内部自处理）=====
  '/profile': [],
  '/dietpref': [],
  '/unit': [],
  '/precision': [],
  '/burst': [],
  '/help': [
    [/^nav-back/, 'back'],
    [/^faq-/, () => ({ toast: '常见问题详情开发中' })],
    [/^feedback-submit/, () => ({ toast: '反馈已提交，感谢你的建议' })],
    [/^contact-card/, () => ({ toast: '客服接入开发中' })]
  ]
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const stackRef = useRef([]);
  const [toast, setToast] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const toastTimer = useRef(null);

  toastFn = (msg) => showToast(msg);
  confirmDeleteFn = () => setShowDelete(true);

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

  // 删除确认
  function confirmDelete() {
    setShowDelete(false);
    showToast('记录已删除');
    navigate('/records');
  }

  // 全局点击事件委托
  useEffect(() => {
    const handler = (e) => {
      const rules = NAV[location.pathname];
      if (!rules) return;
      let el = e.target;
      while (el && el !== document.body && el.nodeType === 1) {
        const name = el.getAttribute && el.getAttribute('data-name');
        if (name) {
          for (const [re, action] of rules) {
            if (re.test(name)) {
              let target = action;
              let toastMsg = null;
              if (typeof action === 'function') {
                const r = action(name);
                if (typeof r === 'string') target = r;
                else if (r && typeof r === 'object') {
                  toastMsg = r.toast || null;
                  target = r.path ? { path: r.path, state: r.state || {} } : null;
                } else target = null;
              }
              if (target === 'back') goBack();
              else if (typeof target === 'string') navigate(target);
              else if (target && typeof target === 'object' && target.path) navigate(target.path, { state: target.state });
              if (toastMsg) showToast(toastMsg);
              return;
            }
          }
        }
        el = el.parentElement;
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [location.pathname]);

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
      {showDelete && (
        <div className="modal-mask" onClick={() => setShowDelete(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <i className="fas fa-trash-can" style={{ fontSize: '22px', color: '#FF6B6B' }} />
            </div>
            <p className="modal-title">删除这条记录？</p>
            <p className="modal-desc">「红烧牛肉面 · 520 kcal」删除后无法恢复</p>
            <div className="modal-actions">
              <button className="modal-btn modal-cancel" onClick={() => setShowDelete(false)}>
                取消
              </button>
              <button className="modal-btn modal-danger" onClick={confirmDelete}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
