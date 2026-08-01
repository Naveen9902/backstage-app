Write-Host 'Building FAN App...'
(Get-Content -Path '.env') -replace '^NEXT_PUBLIC_APP_FLAVOR=.*', 'NEXT_PUBLIC_APP_FLAVOR=USER' | Set-Content -Path '.env'
Get-ChildItem -Path "src\app" -Recurse -Include "route.ts","robots.ts","sitemap.ts" | Rename-Item -NewName { $_.Name + ".bak" } -ErrorAction SilentlyContinue
npm run build
Get-ChildItem -Path "src\app" -Recurse -Include "route.ts.bak","robots.ts.bak","sitemap.ts.bak" | Rename-Item -NewName { $_.Name -replace '\.bak$', '' } -ErrorAction SilentlyContinue
npx cap sync android
cd android
.\gradlew clean
.\gradlew assembleFanDebug
cd ..

Write-Host 'Building OPS App...'
(Get-Content -Path '.env') -replace '^NEXT_PUBLIC_APP_FLAVOR=.*', 'NEXT_PUBLIC_APP_FLAVOR=OPS' | Set-Content -Path '.env'
Get-ChildItem -Path "src\app" -Recurse -Include "route.ts","robots.ts","sitemap.ts" | Rename-Item -NewName { $_.Name + ".bak" } -ErrorAction SilentlyContinue
npm run build
Get-ChildItem -Path "src\app" -Recurse -Include "route.ts.bak","robots.ts.bak","sitemap.ts.bak" | Rename-Item -NewName { $_.Name -replace '\.bak$', '' } -ErrorAction SilentlyContinue
npx cap sync android
cd android
.\gradlew assembleOpsDebug
cd ..
Write-Host 'Done!'
