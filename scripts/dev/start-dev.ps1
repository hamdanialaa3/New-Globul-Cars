#!/usr/bin/env pwsh
# 🚀 سكريبت تشغيل Koli One
# Script to start Koli One development server with flexible port options

param(
    [ValidateSet("5173", "3000", "3001", "3002", "8080", "8000")]
    [string]$Port = "5173",
    
    [switch]$SkipPortCheck = $false
)

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Koli One - Development Server" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# التحقق من استخدام البورت
if (-not $SkipPortCheck) {
    Write-Host "🔍 فحص البورت $Port..." -ForegroundColor Yellow
    
    $netstat = netstat -ano 2>$null | Select-String ":$Port"
    
    if ($netstat) {
        Write-Host "⚠️  البورت $Port مشغول بالفعل" -ForegroundColor Red
        Write-Host ""
        Write-Host "الخيارات المتاحة:" -ForegroundColor Cyan
        Write-Host "  5173 - البورت الافتراضي (Vite)" -ForegroundColor Green
        Write-Host "  3000 - البورت القديم" -ForegroundColor Yellow
        Write-Host "  3001, 3002, 8080, 8000 - بدائل أخرى" -ForegroundColor Yellow
        Write-Host ""
        
        $newPort = Read-Host "اختر بورت آخر [5173]"
        if ($newPort) {
            $Port = $newPort
        }
    }
}

Write-Host "✅ البورت: $Port" -ForegroundColor Green
Write-Host ""

# الذهاب للمجلد web
Write-Host "📂 الذهاب للمجلد web..." -ForegroundColor Cyan
cd ".\web"

# التحقق من package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ لم يتم العثور على package.json" -ForegroundColor Red
    exit 1
}

# بدء السيرفر
Write-Host "🌐 بدء السيرفر على البورت $Port..." -ForegroundColor Green
Write-Host ""
Write-Host "الرابط: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
Write-Host "اضغط Ctrl+C لإيقاف السيرفر" -ForegroundColor Yellow
Write-Host ""

$env:PORT = $Port
npm run dev -- --port $Port

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ السيرفر توقف" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
