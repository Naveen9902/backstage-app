$ErrorActionPreference = "Stop"

try {
    # Ensure 'out' directory exists for Capacitor sync
    if (-not (Test-Path "out")) { New-Item -ItemType Directory -Path "out" }
    
    # We do NOT need to build Next.js locally because the Capacitor app points to the Vercel URL
    # Just sync Capacitor to copy the config
    cmd.exe /c "npx cap sync android"
    if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed!" }

    # ==========================
    # BUILD FAN APK
    # ==========================
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "🚀 Building FAN APK..." -ForegroundColor Cyan
    $env:NEXT_PUBLIC_APP_FLAVOR="FAN"
    
    # Run Capacitor copy to update the app flavor in android files
    cmd.exe /c "npx cap copy android"
    if ($LASTEXITCODE -ne 0) { throw "Capacitor copy failed for FAN!" }
    
    cd android
    .\gradlew clean assembleFanDebug
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed for FAN!" }
    cd ..
    
    Copy-Item "android\app\build\outputs\apk\fan\debug\app-fan-debug.apk" -Destination "fan-app.apk" -Force
    Write-Host "✅ fan-app.apk generated successfully!" -ForegroundColor Green

    # ==========================
    # BUILD OPS APK
    # ==========================
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host "🚀 Building OPS APK..." -ForegroundColor Cyan
    $env:NEXT_PUBLIC_APP_FLAVOR="OPS"
    
    # Run Capacitor copy to update the app flavor in android files
    cmd.exe /c "npx cap copy android"
    if ($LASTEXITCODE -ne 0) { throw "Capacitor copy failed for OPS!" }
    
    cd android
    .\gradlew clean assembleOpsDebug
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed for OPS!" }
    cd ..
    
    Copy-Item "android\app\build\outputs\apk\ops\debug\app-ops-debug.apk" -Destination "ops-app.apk" -Force
    Write-Host "✅ ops-app.apk generated successfully!" -ForegroundColor Green

} finally {
    Write-Host "🎉 Done building both APKs!" -ForegroundColor Green
}
