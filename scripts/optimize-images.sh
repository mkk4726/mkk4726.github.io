#!/bin/bash

# 이미지 최적화 스크립트
# 사용법: ./scripts/optimize-images.sh

echo "🖼️  이미지 최적화 시작..."

# ImageMagick이 설치되어 있는지 확인
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick이 설치되어 있지 않습니다."
    echo "설치 방법: brew install imagemagick"
    exit 1
fi

# 이미지 폴더들
IMAGE_DIRS=(
    "assets/images/posts"
    "assets/images/common"
)

# 최적화할 이미지 확장자
EXTENSIONS=("jpg" "jpeg" "png")

for dir in "${IMAGE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "📁 $dir 폴더 처리 중..."
        
        for ext in "${EXTENSIONS[@]}"; do
            # 해당 확장자의 모든 이미지 찾기
            find "$dir" -name "*.$ext" -o -name "*.${ext^^}" | while read -r file; do
                echo "  🔧 최적화 중: $file"
                
                # 백업 파일 생성
                backup_file="${file}.backup"
                cp "$file" "$backup_file"
                
                # 이미지 최적화
                if [[ "$ext" == "jpg" || "$ext" == "jpeg" ]]; then
                    # JPEG 최적화
                    convert "$file" -strip -quality 85 "$file"
                elif [[ "$ext" == "png" ]]; then
                    # PNG 최적화
                    convert "$file" -strip -define png:compression-level=9 "$file"
                fi
                
                # 파일 크기 비교
                original_size=$(stat -f%z "$backup_file")
                optimized_size=$(stat -f%z "$file")
                saved=$((original_size - optimized_size))
                saved_percent=$((saved * 100 / original_size))
                
                echo "    ✅ 최적화 완료: ${saved_percent}% 절약 (${saved} bytes)"
                
                # 백업 파일 삭제 (성공한 경우)
                rm "$backup_file"
            done
        done
    fi
done

echo "🎉 이미지 최적화 완료!" 