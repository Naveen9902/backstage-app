$ErrorActionPreference = "Stop"

Write-Host "Parsing .env file and pushing to Vercel..."

$envPath = "d:\back stage\.env"
if (-Not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

$envLines = Get-Content $envPath
foreach ($line in $envLines) {
    $line = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        continue
    }

    $splitIndex = $line.IndexOf("=")
    if ($splitIndex -gt 0) {
        $name = $line.Substring(0, $splitIndex).Trim()
        $value = $line.Substring($splitIndex + 1).Trim()
        
        # Remove surrounding quotes if they exist
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        Write-Host "Adding $name to Vercel..." -ForegroundColor Cyan
        # Pipe the value directly into the Vercel CLI. Using --yes if available, or just standard input.
        # Since we are not running interactively, piping usually skips the prompt for the value.
        $value | npx vercel env add $name production,preview,development
    }
}

Write-Host "Finished pushing variables to Vercel!" -ForegroundColor Green
Write-Host "Please check your Vercel Dashboard to confirm." -ForegroundColor Yellow
