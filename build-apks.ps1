$ErrorActionPreference = "Stop"

Write-Host "📦 Hiding server-side routes..." -ForegroundColor Yellow
if (Test-Path "src\app\api") { Move-Item "src\app\api" "src\api_temp" }
if (Test-Path "src\app\robots.ts") { Move-Item "src\app\robots.ts" "src\robots.temp.ts" }
if (Test-Path "src\app\sitemap.ts") { Move-Item "src\app\sitemap.ts" "src\sitemap.temp.ts" }

try {
    # Set this so Next.js does a static export
    $env:CAPACITOR_BUILD="true"

    # ==========================
    # BUILD FAN APK
    # ==========================
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "🚀 Building FAN APK..." -ForegroundColor Cyan
    $env:NEXT_PUBLIC_APP_FLAVOR="FAN"
    
    # 1. Compile Next.js with FAN variables
    npm run build
    
    # 2. Sync into Android folder
    npx cap sync android
    
    # 3. Build APK using Gradle (Only Fan Flavor)
    cd android
    .\gradlew clean assembleFanDebug
    cd ..
    
    # 4. Save APK
    Copy-Item "android\app\build\outputs\apk\fan\debug\app-fan-debug.apk" -Destination "fan-app.apk" -Force
    Write-Host "✅ fan-app.apk generated successfully! (App ID: com.backstage.fan)" -ForegroundColor Green


    # ==========================
    # BUILD OPS APK
    # ==========================
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "🚀 Building OPS APK..." -ForegroundColor Cyan
    $env:NEXT_PUBLIC_APP_FLAVOR="OPS"
    
    # 1. Compile Next.js with OPS variables
    npm run build
    
    # 2. Sync into Android folder
    npx cap sync android
    
    # 3. Build APK using Gradle (Only Ops Flavor)
    cd android
    .\gradlew clean assembleOpsDebug
    cd ..
    
    # 4. Save APK
    Copy-Item "android\app\build\outputs\apk\ops\debug\app-ops-debug.apk" -Destination "ops-app.apk" -Force
    Write-Host "✅ ops-app.apk generated successfully! (App ID: com.backstage.ops)" -ForegroundColor Green

} finally {
    Write-Host "♻️ Restoring server-side routes..." -ForegroundColor Yellow
    if (Test-Path "src\api_temp") { Move-Item "src\api_temp" "src\app\api" }
    if (Test-Path "src\robots.temp.ts") { Move-Item "src\robots.temp.ts" "src\app\robots.ts" }
    if (Test-Path "src\sitemap.temp.ts") { Move-Item "src\sitemap.temp.ts" "src\app\sitemap.ts" }
}

Write-Host "🎉 Done building both APKs!" -ForegroundColor Green
