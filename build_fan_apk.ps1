Write-Host "Setting APP_FLAVOR to USER in .env..."
(Get-Content -Path '.env') -replace '^NEXT_PUBLIC_APP_FLAVOR=.*', 'NEXT_PUBLIC_APP_FLAVOR=USER' | Set-Content -Path '.env'

Write-Host "Building Next.js for FAN..."
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Syncing Capacitor..."
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building Android APK..."
cd android
.\gradlew assembleDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

cd ..
Write-Host "Copying to fan-app.apk..."
Copy-Item -Path "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "fan-app.apk" -Force

Write-Host "Restoring APP_FLAVOR to OPS in .env..."
(Get-Content -Path '.env') -replace '^NEXT_PUBLIC_APP_FLAVOR=.*', 'NEXT_PUBLIC_APP_FLAVOR=OPS' | Set-Content -Path '.env'

Write-Host "All done! fan-app.apk is ready."
