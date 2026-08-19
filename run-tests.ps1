# LabMaintain Workflow Validation & Testing Pipeline
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running LabMaintain Full-Stack Workflow Validation Pipeline " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition

# 1. Backend JUnit 5 Tests
Write-Host "`n[1/2] Executing Spring Boot JUnit 5 Application & Workflow Tests..." -ForegroundColor Yellow
$mvnCmd = "C:\Users\as770\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
Push-Location "$scriptPath\Backend"
try {
    if (Test-Path $mvnCmd) {
        & $mvnCmd test
    } else {
        mvn test
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Backend JUnit Tests FAILED!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "`n✅ Backend JUnit Tests PASSED!" -ForegroundColor Green
} finally {
    Pop-Location
}

# 2. Frontend React Testing Library Tests
Write-Host "`n[2/2] Executing Frontend React Testing Library Component & Route Tests..." -ForegroundColor Yellow
Push-Location "$scriptPath\Frontend"
try {
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Frontend React Testing Library Tests FAILED!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "`n✅ Frontend React Testing Library Tests PASSED!" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " 🎉 ALL WORKFLOW VALIDATIONS & TESTS COMPLETED SUCCESSFULLY! " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
