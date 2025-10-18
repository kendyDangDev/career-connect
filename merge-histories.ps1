# Script để merge lịch sử commit từ apps/web và apps/mobile vào monorepo
# Giữ nguyên tất cả commit history

Write-Host "=== Merging Git Histories into Monorepo ===" -ForegroundColor Green

# Quay về thư mục root của monorepo
Set-Location C:\Users\KendyDang\Documents\career-connect

# Bước 1: Add remote từ apps/web
Write-Host "`n[1/6] Adding remote for apps/web..." -ForegroundColor Yellow
git remote add web-origin ./apps/web/.git
git fetch web-origin

# Bước 2: Merge lịch sử của web với prefix apps/web
Write-Host "`n[2/6] Merging web history into monorepo..." -ForegroundColor Yellow
git merge -s ours --no-commit --allow-unrelated-histories web-origin/main
git read-tree --prefix=apps/web/ -u web-origin/main
git commit -m "chore: merge apps/web history into monorepo"

# Bước 3: Add remote từ apps/mobile  
Write-Host "`n[3/6] Adding remote for apps/mobile..." -ForegroundColor Yellow
git remote add mobile-origin ./apps/mobile/.git
git fetch mobile-origin

# Bước 4: Merge lịch sử của mobile với prefix apps/mobile
Write-Host "`n[4/6] Merging mobile history into monorepo..." -ForegroundColor Yellow
git merge -s ours --no-commit --allow-unrelated-histories mobile-origin/master
git read-tree --prefix=apps/mobile/ -u mobile-origin/master
git commit -m "chore: merge apps/mobile history into monorepo"

# Bước 5: Xóa các thư mục .git trong apps/web và apps/mobile
Write-Host "`n[5/6] Removing .git directories from subprojects..." -ForegroundColor Yellow
Remove-Item -Path ./apps/web/.git -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ./apps/mobile/.git -Recurse -Force -ErrorAction SilentlyContinue

# Bước 6: Commit việc xóa .git folders
Write-Host "`n[6/6] Committing cleanup..." -ForegroundColor Yellow
git add .
git commit -m "chore: remove .git folders from apps/web and apps/mobile"

# Cleanup remotes
git remote remove web-origin
git remote remove mobile-origin

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Lịch sử commit đã được merge thành công!" -ForegroundColor Green
Write-Host "`nKiểm tra lịch sử:" -ForegroundColor Cyan
Write-Host "  git log --oneline --graph --all" -ForegroundColor White
Write-Host "  git log --oneline -- apps/web" -ForegroundColor White
Write-Host "  git log --oneline -- apps/mobile" -ForegroundColor White
