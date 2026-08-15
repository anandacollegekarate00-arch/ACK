# Supabase CLI Installation Script for Windows
# Run this in PowerShell: .\install-supabase.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Supabase CLI Installation" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
Write-Host "Checking for npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm found (version: $npmVersion)" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Installing Supabase CLI via npm..." -ForegroundColor Yellow
    npm install -g supabase
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Supabase CLI installed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Verify installation
        Write-Host "Verifying installation..." -ForegroundColor Yellow
        $supabaseVersion = supabase --version 2>$null
        if ($supabaseVersion) {
            Write-Host "✓ Supabase CLI version: $supabaseVersion" -ForegroundColor Green
        } else {
            Write-Host "⚠ Installation complete but command not found in PATH" -ForegroundColor Yellow
            Write-Host "  Try closing and reopening PowerShell" -ForegroundColor Yellow
        }
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host "✗ npm installation failed or npm not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method: Scoop..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check if Scoop is available
    try {
        $scoopVersion = scoop --version 2>$null
        Write-Host "✓ Scoop found" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Adding Supabase bucket..." -ForegroundColor Yellow
        scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
        
        Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
        scoop install supabase
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Supabase CLI installed successfully via Scoop!" -ForegroundColor Green
        } else {
            throw "Scoop installation failed"
        }
    } catch {
        Write-Host "✗ Scoop not found or installation failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "==================================" -ForegroundColor Yellow
        Write-Host "  Manual Installation Required" -ForegroundColor Yellow
        Write-Host "==================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please choose one of these methods:" -ForegroundColor White
        Write-Host ""
        Write-Host "Option 1: Install Scoop first, then Supabase CLI" -ForegroundColor Cyan
        Write-Host "  Run these commands in PowerShell:" -ForegroundColor White
        Write-Host '  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser' -ForegroundColor Gray
        Write-Host '  Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression' -ForegroundColor Gray
        Write-Host '  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git' -ForegroundColor Gray
        Write-Host '  scoop install supabase' -ForegroundColor Gray
        Write-Host ""
        Write-Host "Option 2: Direct Download" -ForegroundColor Cyan
        Write-Host "  1. Go to: https://github.com/supabase/cli/releases/latest" -ForegroundColor White
        Write-Host "  2. Download: supabase_windows_amd64.tar.gz" -ForegroundColor White
        Write-Host "  3. Extract and add to PATH" -ForegroundColor White
        Write-Host ""
        Write-Host "See INSTALL-SUPABASE-CLI.md for detailed instructions" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify: supabase --version" -ForegroundColor White
Write-Host "2. Login: supabase login" -ForegroundColor White
Write-Host "3. Init: supabase init" -ForegroundColor White
Write-Host "4. Link: supabase link" -ForegroundColor White
Write-Host ""
Write-Host "See INSTALL-SUPABASE-CLI.md for complete guide" -ForegroundColor Yellow
Write-Host ""
