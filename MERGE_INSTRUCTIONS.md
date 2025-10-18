# Hướng dẫn Merge Git History vào Monorepo

## Phương pháp: Git Subtree Merge

### Bước 1: Add remote từ apps/web
```bash
git remote add web-origin ./apps/web/.git
git fetch web-origin
```

### Bước 2: Merge lịch sử web vào monorepo
```bash
git merge -s ours --no-commit --allow-unrelated-histories web-origin/main
git read-tree --prefix=apps/web/ -u web-origin/main
git commit -m "chore: merge apps/web history into monorepo"
```

### Bước 3: Add remote từ apps/mobile
```bash
git remote add mobile-origin ./apps/mobile/.git
git fetch mobile-origin
```

### Bước 4: Merge lịch sử mobile vào monorepo
```bash
git merge -s ours --no-commit --allow-unrelated-histories mobile-origin/master
git read-tree --prefix=apps/mobile/ -u mobile-origin/master
git commit -m "chore: merge apps/mobile history into monorepo"
```

### Bước 5: Cleanup - Xóa thư mục .git trong subprojects
```powershell
Remove-Item -Path ./apps/web/.git -Recurse -Force
Remove-Item -Path ./apps/mobile/.git -Recurse -Force
git add .
git commit -m "chore: remove .git folders from subprojects"
```

### Bước 6: Cleanup remotes
```bash
git remote remove web-origin
git remote remove mobile-origin
```

### Bước 7: Kiểm tra kết quả
```bash
# Xem toàn bộ lịch sử
git log --oneline --graph --all

# Xem lịch sử của apps/web
git log --oneline -- apps/web

# Xem lịch sử của apps/mobile  
git log --oneline -- apps/mobile
```

### Bước 8: Push lên remote (nếu cần)
```bash
git push origin main
```

## Lưu ý quan trọng

1. **Backup trước khi thực hiện**
2. Branch mặc định của web là `main`, mobile là `master`
3. Sau khi merge, lịch sử commit sẽ được giữ nguyên với prefix path
4. Có thể sử dụng `git log --follow` để theo dõi file history qua các lần rename

## Kết quả mong đợi

Sau khi hoàn tất, bạn sẽ có:
- Monorepo với lịch sử commit đầy đủ từ cả 3 repos
- Tất cả commits từ apps/web sẽ có prefix `apps/web/`
- Tất cả commits từ apps/mobile sẽ có prefix `apps/mobile/`
- Không còn thư mục .git riêng trong apps/web và apps/mobile
