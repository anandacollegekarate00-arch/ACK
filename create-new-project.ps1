# 🚀 Create New Optimized Karate App Project
# Run this script to create the modern version

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Karate App - Modern Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✓ npm found (version: $npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "  Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Creating new project..." -ForegroundColor Yellow
Write-Host ""

# Create the new project with Vite
npm create vite@latest ack-karate-v2 -- --template react

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create project" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Project created successfully!" -ForegroundColor Green
Write-Host ""

# Navigate to project
cd ack-karate-v2

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Installing additional packages..." -ForegroundColor Yellow

# Install core dependencies
npm install `
    @supabase/supabase-js `
    @tanstack/react-query `
    framer-motion `
    zustand `
    date-fns `
    react-hook-form `
    zod `
    lucide-react `
    react-router-dom

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  ✓ Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd ack-karate-v2" -ForegroundColor White
Write-Host "  2. Follow the migration guide in MIGRATION-GUIDE.md" -ForegroundColor White
Write-Host "  3. npm run dev (to start development server)" -ForegroundColor White
Write-Host ""
Write-Host "Your new project is ready at:" -ForegroundColor Cyan
Write-Host "  $(Get-Location)\ack-karate-v2" -ForegroundColor White
Write-Host ""
