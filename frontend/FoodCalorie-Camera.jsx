import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upload } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar } from './src/ui/common';

// 拍照识别页：选图/拍照 → 本地预览 → 上传识别 → 跳转结果页
export default function FoodCalorieCamera() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [recognizing, setRecognizing] = useState(false);

  function pickFile(capture) {
    const input = fileRef.current;
    input.capture = capture ? 'environment' : '';
    input.click();
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(jpeg|png|webp|heic|heif)/.test(file.type)) return toast('请选择 JPEG/PNG/WEBP 图片');
    if (file.size > 10 * 1024 * 1024) return toast('图片不能超过 10MB');
    setPreview(URL.createObjectURL(file));
  }

  async function recognize() {
    if (!preview || recognizing) return;
    setRecognizing(true);
    try {
      // 从 objectURL 找回文件：缓存 file 引用
      const blob = await fetch(preview).then((r) => r.blob());
      const fd = new FormData();
      fd.append('image', blob, 'food.jpg');
      // 统一走 apiClient：自动携带鉴权 + 401 刷新自愈（原原生 fetch 缺这两项）
      const body = await upload.post('/api/v1/foodcalorie/ai/recognize', fd);
      // 优先用后端持久化的 image_url（/uploads/xxx），本地 dataURL 仅作回显兜底
      navigate('/camerresult', { state: { imageUrl: body.data.image_url || preview, preview, candidates: body.data.candidates, message: body.data.message } });
    } catch (e) {
      toast(e.message || '识别失败，请检查登录状态');
      setRecognizing(false);
    }
  }

  function retake() {
    setPreview(null);
  }

  return (
    <div data-name="FoodCalorie-Camera" style={{ width: 375, minHeight: 812, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden' }}>
      <StatusBar />
      <NavBar title="拍照识别" right={<i className="fas fa-bolt" style={{ fontSize: 15, color: '#fff' }} />} />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />

      {/* 取景框 */}
      <div data-name="viewfinder" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 20px', borderRadius: 20, overflow: 'hidden', background: '#1F2937' }}>
        {preview ? (
          <img src={preview} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
            <i className="fas fa-bowl-food" style={{ fontSize: 46, opacity: 0.5 }} />
            <div style={{ marginTop: 14, fontSize: 13 }}>对准食物，点击下方快门拍照</div>
          </div>
        )}
        {/* 对焦框 */}
        {!preview && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 150, height: 150, border: '1.5px dashed rgba(52,199,89,0.6)', borderRadius: 16 }} />
        )}
        {preview && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <button onClick={retake} style={{ padding: '7px 14px', borderRadius: 12, border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>重拍</button>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <div style={{ padding: '20px 20px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {preview ? (
          <button onClick={recognize} disabled={recognizing} style={{ width: '100%', height: 52, borderRadius: 18, border: 'none', background: '#34C759', color: '#fff', fontSize: 16, fontWeight: 700, cursor: recognizing ? 'wait' : 'pointer' }}>
            {recognizing ? '识别中…' : '开始识别'}
          </button>
        ) : (
          <div data-name="shutter" onClick={() => pickFile(true)} style={{ width: 76, height: 76, borderRadius: 38, border: '4px solid #fff', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <div style={{ width: 58, height: 58, borderRadius: 29, background: '#fff' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 32 }}>
          <div onClick={() => pickFile(false)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <i className="fas fa-images" style={{ fontSize: 18, color: '#fff' }} />
            <span style={{ fontSize: 10, color: '#D1D5DB' }}>相册</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <i className="fas fa-camera" style={{ fontSize: 18, color: '#fff' }} />
            <span style={{ fontSize: 10, color: '#D1D5DB' }}>拍照</span>
          </div>
        </div>
      </div>
    </div>
  );
}
