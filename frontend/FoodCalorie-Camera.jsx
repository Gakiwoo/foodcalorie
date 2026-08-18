import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { upload } from './src/api/client';
import { toast } from './src/ui/toast';
import { StatusBar, NavBar } from './src/ui/common';

// 拍照识别页：选图/拍照 → 本地预览 → 上传识别 → 跳转结果页
export default function FoodCalorieCamera() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const selectedFileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [recognizing, setRecognizing] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

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
    selectedFileRef.current = file;
    setPreview(URL.createObjectURL(file));
  }

  async function recognize() {
    const file = selectedFileRef.current;
    if (!preview || !file || recognizing) return;
    setRecognizing(true);
    try {
      const fd = new FormData();
      fd.append('image', file, file.name || 'food.jpg');
      const body = await upload.post('/api/v1/foodcalorie/ai/recognize', fd);
      const resultPreview = URL.createObjectURL(file);
      navigate('/camera-result', {
        state: {
          preview: resultPreview,
          storedImageUrl: body.data.image_url || null,
          candidates: body.data.candidates,
          message: body.data.message
        }
      });
    } catch (e) {
      toast(e.message || '识别失败，请检查登录状态');
      setRecognizing(false);
    }
  }

  function retake() {
    selectedFileRef.current = null;
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div data-name="FoodCalorie-Camera" style={{ width: '100%', minHeight: '100dvh', background: '#0F0F0F', display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflow: 'hidden' }}>
      <StatusBar appearance="dark" />
      <NavBar
        appearance="dark"
        title="拍照识别"
        right={<i data-name="nav-flash" className="fas fa-bolt" style={{ fontSize: 20, color: '#fff' }} />}
      />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />

      {/* 取景框 */}
      <div
        data-name="viewfinder"
        style={{
          width: '100%',
          height: 586,
          display: 'flex',
          flex: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 28,
          background: preview ? '#000' : 'linear-gradient(167deg, #2E2E2E 0%, #0F0F0F 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
        {preview ? (
          <img src={preview} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div
              data-name="focus-frame"
              style={{
                width: 264,
                height: 264,
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 14,
                border: '3px solid #34C759',
                borderRadius: 28
              }}>
              <i data-name="focus-icon" className="fas fa-camera" style={{ fontSize: 44, color: 'rgba(255,255,255,0.81)' }} />
              <span data-name="focus-text" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: 500, lineHeight: '20px', textAlign: 'center' }}>对准食物</span>
            </div>
            <div data-name="hint" style={{ display: 'flex', alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', padding: '0 44px' }}>
              <p
                data-name="将食物放入框内，点击快门即可自动识别热量与营养"
                style={{ alignSelf: 'stretch', flexShrink: 0, color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', lineHeight: '18px', margin: 0 }}>
                将食物放入框内，点击快门即可自动识别热量与营养
              </p>
            </div>
          </>
        )}
      </div>

      {/* 底部工具栏 / 预览操作 */}
      <div
        data-name="toolbar"
        style={{
          width: '100%',
          display: 'flex',
          flex: 'none',
          justifyContent: preview ? 'center' : 'space-between',
          alignItems: 'center',
          gap: preview ? 16 : 0,
          padding: '34px 48px',
          background: '#0F0F0F'
        }}>
        {preview ? (
          <>
            <button
              onClick={retake}
              style={{
                width: 140,
                height: 48,
                borderRadius: 16,
                border: '1.5px solid #E5E7EB',
                background: 'transparent',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
              重新拍照
            </button>
            <button
              onClick={recognize}
              disabled={recognizing}
              style={{
                width: 140,
                height: 48,
                borderRadius: 16,
                border: 'none',
                background: '#34C759',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 700,
                cursor: recognizing ? 'wait' : 'pointer'
              }}>
              {recognizing ? '识别中…' : '开始识别'}
            </button>
          </>
        ) : (
          <>
            <div data-name="btn-gallery-wrap" onClick={() => pickFile(false)} style={{ padding: 12, margin: -12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i data-name="btn-gallery" className="fas fa-images" style={{ fontSize: 26, color: '#FFFFFF' }} />
            </div>
            <div data-name="shutter" onClick={() => pickFile(true)} style={{ width: 74, height: 74, display: 'flex', flex: 'none', justifyContent: 'center', alignItems: 'center', background: '#FFFFFF', borderRadius: 74, cursor: 'pointer' }}>
              <div data-name="shutter-inner" style={{ width: 62, height: 62, display: 'flex', flex: 'none', justifyContent: 'center', alignItems: 'center', background: '#34C759', borderRadius: 62 }} />
            </div>
            <div data-name="btn-flip-wrap" onClick={() => toast('切换摄像头功能开发中')} style={{ padding: 12, margin: -12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i data-name="btn-flip" className="fas fa-sync-alt" style={{ fontSize: 26, color: '#FFFFFF' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
