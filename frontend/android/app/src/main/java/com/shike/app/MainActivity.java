package com.shike.app;

import android.os.Bundle;
import android.webkit.CookieManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // APK 页面源为 https://localhost（capacitor scheme），业务 API 在 https://foodcalorie.gakiwoo.com，
    // 属于跨源请求：显式允许第三方 Cookie，确保登录态（httpOnly Cookie）在 WebView 中可持久。
    // CapacitorHttp 插件启用时走原生 CookieJar；此处兜底 WebView 直连场景。
    getBridge().getWebView().post(() -> {
      try {
        CookieManager.getInstance().setAcceptThirdPartyCookies(getBridge().getWebView(), true);
      } catch (Exception ignored) {
        // WebView 尚未就绪时静默，CapacitorHttp 路径不受影响
      }
    });
  }
}
