/**
 * ✅ Blogger OAuth 2.0 Token Generator (Apps Script)
 * Otomatis menghasilkan access token untuk integrasi GitHub Actions.
 * NOTE: Client ID / Client Secret harus diganti dengan credential milikmu.
 * DO NOT COMMIT real client secret to a public repo. This file uses placeholders.
 *
 * Cara pakai singkat:
 * - Buat Google Cloud OAuth credentials (Client ID & Secret) untuk "Web application".
 * - Ganti REPLACE_WITH_CLIENT_ID / REPLACE_WITH_CLIENT_SECRET di bawah dengan nilai milikmu (tetap jangan commit ke repo publik).
 * - Tambahkan library OAuth2 (Apps Script) sesuai dokumentasi: https://github.com/googleworkspace/apps-script-oauth2
 * - Deploy / jalankan getBloggerAccessToken() dari Editor Apps Script untuk mendapatkan URL otorisasi.
 */

function getBloggerAccessToken() {
  const service = getService_();
  if (!service.hasAccess()) {
    const authorizationUrl = service.getAuthorizationUrl();
    Logger.log("🔗 Buka URL ini di browser untuk memberi izin:");
    Logger.log(authorizationUrl);
  } else {
    const accessToken = service.getAccessToken();
    Logger.log("✅ ACCESS TOKEN (salin ini ke GitHub Secrets):");
    Logger.log(accessToken);
  }
}

/**
 * Callback setelah kamu izinkan akses di browser.
 */
function authCallback(request) {
  const service = getService_();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput("✅ Izin berhasil! Silakan kembali ke Editor dan jalankan lagi getBloggerAccessToken()");
  } else {
    return HtmlService.createHtmlOutput("❌ Akses ditolak.");
  }
}

/**
 * Konfigurasi OAuth 2.0
 */
function getService_() {
  // Requires the OAuth2 library for Apps Script (see README)
  return OAuth2.createService("blogger")
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
    .setTokenUrl("https://oauth2.googleapis.com/token")
    .setClientId("REPLACE_WITH_CLIENT_ID") // Ganti dengan Client ID milikmu
    .setClientSecret("REPLACE_WITH_CLIENT_SECRET") // Ganti dengan Client Secret milikmu
    .setCallbackFunction("authCallback")
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope("https://www.googleapis.com/auth/blogger")
    .setParam("access_type", "offline")
    .setParam("prompt", "consent");
}

/**
 * (Opsional) Hapus semua token tersimpan
 */
function resetOAuth() {
  getService_().reset();
  Logger.log("🔄 Token OAuth dihapus. Jalankan ulang getBloggerAccessToken()");
}