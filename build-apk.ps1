$ErrorActionPreference = 'Stop'

Write-Host "🚀 Starting Capacitor APK Build Process..." -ForegroundColor Cyan

# 1. Temporarily move backend-only files out of the Next.js app directory
# This prevents Next.js from trying to statically generate dynamic server routes
Write-Host "📦 Hiding server-side routes..." -ForegroundColor Yellow
if (Test-Path "src\app\api") { Move-Item "src\app\api" "src\api_temp" }
if (Test-Path "src\app\robots.ts") { Move-Item "src\app\robots.ts" "src\robots.temp.ts" }
if (Test-Path "src\app\sitemap.ts") { Move-Item "src\app\sitemap.ts" "src\sitemap.temp.ts" }

try {
    # 2. Tell next.config.ts to export static HTML
    $env:CAPACITOR_BUILD="true"

    # 3. Build the frontend
    Write-Host "🔨 Building Next.js Static Export..." -ForegroundColor Green
    npm run build

    # 4. Sync the files into the Android project
    Write-Host "📱 Syncing with Android..." -ForegroundColor Green
    npx cap sync android

    Write-Host "✅ Build and Sync Complete! Opening Android Studio..." -ForegroundColor Cyan
    npx cap open android
}
finally {
    # 5. ALWAYS restore the backend files, even if the build fails
    Write-Host "♻️ Restoring server-side routes..." -ForegroundColor Yellow
    if (Test-Path "src\api_temp") { Move-Item "src\api_temp" "src\app\api" }
    if (Test-Path "src\robots.temp.ts") { Move-Item "src\robots.temp.ts" "src\app\robots.ts" }
    if (Test-Path "src\sitemap.temp.ts") { Move-Item "src\sitemap.temp.ts" "src\app\sitemap.ts" }
}
