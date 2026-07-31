Write-Host "Starting offline APK build process..."

# 1. Backup next.config.ts and capacitor.config.ts
Copy-Item next.config.ts next.config.ts.bak
Copy-Item capacitor.config.ts capacitor.config.ts.bak
if (Test-Path src/middleware.ts) { Rename-Item src/middleware.ts middleware.ts.bak }

# 2. Rewrite next.config.ts to support output: 'export'
$exportConfig = @"
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  pageExtensions: ['tsx'], // Ignores .ts files (like route.ts) so APIs are skipped during export!
};

export default nextConfig;
"@
Set-Content -Path next.config.ts -Value $exportConfig

# 3. Rename route files temporarily to skip API compilation
Write-Host "Temporarily renaming API route files..."
Get-ChildItem -Path src/app/api -Filter "route.ts" -Recurse | Rename-Item -NewName "route.ts.bak" -ErrorAction SilentlyContinue
Get-ChildItem -Path src/app/api -Filter "route.js" -Recurse | Rename-Item -NewName "route.js.bak" -ErrorAction SilentlyContinue

# 4. Build the app using Next.js
Write-Host "Building Next.js frontend statically..."
$env:NEXT_PUBLIC_API_URL = "https://backstage-app-git-main-naveenpagadekalla-3177s-projects.vercel.app"
$env:CAPACITOR_BUILD = "true"
npm run build

# 5. Restore API route files and next.config.ts
Write-Host "Restoring files..."
Get-ChildItem -Path src/app/api -Filter "route.ts.bak" -Recurse | Rename-Item -NewName "route.ts" -ErrorAction SilentlyContinue
Get-ChildItem -Path src/app/api -Filter "route.js.bak" -Recurse | Rename-Item -NewName "route.js" -ErrorAction SilentlyContinue

Copy-Item next.config.ts.bak next.config.ts -Force
Remove-Item next.config.ts.bak
if (Test-Path src/middleware.ts.bak) { Rename-Item src/middleware.ts.bak middleware.ts }

# 6. Configure Capacitor to use local 'out' folder
Write-Host "Configuring Capacitor..."
$capConfig = @"
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Backstage',
  webDir: 'out',
  server: {
    errorPath: 'index.html'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "785362046928-cqn0aq549nljsk7d5hndlla62i81t090.apps.googleusercontent.com"
    }
  }
};

export default config;
"@
Set-Content -Path capacitor.config.ts -Value $capConfig

# 6. Sync with Capacitor
Write-Host "Syncing with Capacitor..."
npx cap sync

# 7. Run standard build-apks.ps1
Write-Host "Building APKs..."
./build-apks.ps1

Write-Host "Done! The APKs have been generated locally inside the project."
