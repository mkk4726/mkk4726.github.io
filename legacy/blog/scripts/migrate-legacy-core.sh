#!/usr/bin/env bash
# Migrate posts/Core/Legacy/AI/* → appropriate Core locations
set -euo pipefail

ROOT="/Users/visuworks/Desktop/mkk4726.github.io"
CORE="$ROOT/posts/Core"
LEGACY="$CORE/Legacy/AI"

cd "$ROOT"

safe_mv() {
  local src="$1"
  local dest="$2"
  if [[ ! -e "$src" ]]; then
    echo "SKIP (missing): $src"
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  if [[ -e "$dest" ]]; then
    echo "CONFLICT: $dest already exists (skipping $src)"
    return 0
  fi
  if git ls-files --error-unmatch "$src" &>/dev/null; then
    git mv "$src" "$dest"
  else
    mv "$src" "$dest"
  fi
}

move_tree() {
  local src_dir="$1"
  local dest_dir="$2"
  if [[ ! -d "$src_dir" ]]; then
    echo "SKIP dir: $src_dir"
    return 0
  fi
  mkdir -p "$dest_dir"
  # move contents preserving structure
  shopt -s dotglob nullglob
  for item in "$src_dir"/*; do
    local base
    base="$(basename "$item")"
    safe_mv "$item" "$dest_dir/$base"
  done
  shopt -u dotglob
  rmdir "$src_dir" 2>/dev/null || true
}

echo "=== Causal Inference ==="
CI="$CORE/Foundations/CausalInference"
move_tree "$LEGACY/Causal Inference/실무로 통하는 인과추론" "$CI/Applied_Practical"
move_tree "$LEGACY/Causal Inference/인과관계 추론과 발견 with python" "$CI/Causal_Discovery_with_Python"
move_tree "$LEGACY/Causal Inference/Causal Discovery" "$CI/Concepts/Causal_Discovery"
move_tree "$LEGACY/Causal Inference/R-learner" "$CI/Concepts/Advanced_Continuous_Treatment/R_learner_notes"
move_tree "$LEGACY/Causal Inference/논문작성" "$CI/Paper_Review/Writing_Notes"
move_tree "$LEGACY/Causal Inference/images" "$CI/Concepts/images_legacy"

# Brave and True: only legacy summary note
if [[ -f "$LEGACY/Causal Inference/Causal Inference for The Brave and True/내용정리.md" ]]; then
  safe_mv "$LEGACY/Causal Inference/Causal Inference for The Brave and True/내용정리.md" \
    "$CI/Causal_Inference_for_The_Brave_and_True/legacy-내용정리.md"
fi
rmdir "$LEGACY/Causal Inference/Causal Inference for The Brave and True" 2>/dev/null || true

# Root causal files → Concepts by topic
safe_mv "$LEGACY/Causal Inference/인과추론이란_.md" "$CI/Concepts/Basics/legacy-인과추론이란.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/인과추론-추천.md" "$CI/Concepts/Basics/legacy-인과추론-추천.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/통계적 편향이란_.md" "$CI/Concepts/Key_Assumptions/legacy-통계적-편향.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/FWL(Frisch-Waugh-Lovell) 정리란_.md" "$CI/Concepts/Estimation_Methods/legacy-fwl-정리.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/Meta learner.md" "$CI/Concepts/Estimation_Methods/legacy-meta-learner.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/X learner.md" "$CI/Concepts/Estimation_Methods/legacy-x-learner.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/GPS (Generalized Propensity Score).md" "$CI/Concepts/Estimation_Methods/legacy-gps.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/CATE 예측 평가하기.md" "$CI/Concepts/Industry_Application/legacy-cate-evaluation.md" 2>/dev/null || true
safe_mv "$LEGACY/Causal Inference/Effect heterogeneity.md" "$CI/Concepts/Advanced_Continuous_Treatment/legacy-effect-heterogeneity.md" 2>/dev/null || true

echo "=== Statistics ==="
ST="$CORE/Foundations/Statistics"
move_tree "$LEGACY/Stats/기초지식" "$ST/Basic/Legacy"
move_tree "$LEGACY/Stats/분포들 정리" "$ST/Basic/Distributions_Legacy"
move_tree "$LEGACY/Stats/T-test" "$ST/HypothesisTesting/T_test"
move_tree "$LEGACY/Stats/ANOVA" "$ST/HypothesisTesting/ANOVA"
move_tree "$LEGACY/Stats/chi-square test" "$ST/HypothesisTesting/Chi_square"
move_tree "$LEGACY/Stats/MIT" "$ST/Courses/MIT"
move_tree "$LEGACY/Stats/AI 연구자를 위한 통계적 학습론 강의노트" "$ST/Courses/Statistical_Learning_for_AI_Researchers"
move_tree "$LEGACY/Stats/images" "$ST/Basic/images_legacy"

safe_mv "$LEGACY/Stats/정규성 (Normality).md" "$ST/Basic/legacy-normality.md" 2>/dev/null || true
safe_mv "$LEGACY/Stats/Box plot.md" "$ST/Basic/legacy-box-plot.md" 2>/dev/null || true
safe_mv "$LEGACY/Stats/Likelihood.md" "$ST/Basic/legacy-likelihood.md" 2>/dev/null || true
safe_mv "$LEGACY/Stats/Model mis-specification.md" "$ST/Basic/legacy-model-mis-specification.md" 2>/dev/null || true
safe_mv "$LEGACY/Stats/Post hoc (사후검정).md" "$ST/HypothesisTesting/legacy-post-hoc.md" 2>/dev/null || true

echo "=== Math / Linear Algebra ==="
MLA="$CORE/Foundations/Math_LinearAlgebra"
move_tree "$LEGACY/LinearAlgebra" "$MLA/Legacy"
move_tree "$LEGACY/Math" "$MLA/Optimization"

echo "=== ML / DL / NLP / LLM / GenAI / CV / XAI ==="
MLAI="$CORE/Models/ML_AI"
move_tree "$LEGACY/ML" "$MLAI/Machine_Learning"
move_tree "$LEGACY/DL" "$MLAI/Deep_Learning"
move_tree "$LEGACY/NLP" "$MLAI/NLP"
move_tree "$LEGACY/LLM" "$MLAI/LLM"
move_tree "$LEGACY/Gen AI" "$MLAI/Generative_AI"
move_tree "$LEGACY/CV" "$MLAI/Computer_Vision"
move_tree "$LEGACY/XAI" "$MLAI/Explainability"

echo "=== Recommendation System ==="
IR="$CORE/Models/IR_Rec"
move_tree "$LEGACY/Recommendation System/Metric" "$IR/Concepts/Metrics"
move_tree "$LEGACY/Recommendation System/Netflix" "$IR/Movie/Legacy"
move_tree "$LEGACY/Recommendation System/쩝쩝" "$IR/Thoughts/Legacy"
move_tree "$LEGACY/Recommendation System/images" "$IR/Models/images_legacy"

# Root rec files → Models/
for f in "$LEGACY/Recommendation System"/*; do
  [[ -e "$f" ]] || continue
  base="$(basename "$f")"
  [[ "$base" == "Metric" || "$base" == "Netflix" || "$base" == "쩝쩝" || "$base" == "images" ]] && continue
  safe_mv "$f" "$IR/Models/$base"
done

echo "=== Engineering / Industry / Meta ==="
move_tree "$LEGACY/MLOps" "$CORE/Engineering/MLOps"
move_tree "$LEGACY/CS" "$CORE/Engineering/Programming"
move_tree "$LEGACY/DX, AX" "$MLAI/Industry_Practice"
move_tree "$LEGACY/Domain Knowledge" "$MLAI/Domain_Knowledge"
move_tree "$LEGACY/논문리뷰" "$MLAI/Generative_AI/Paper_Sketches"
move_tree "$LEGACY/논문 작성 가이드" "$MLAI/Academic_Writing"

echo "=== Cleanup empty Legacy ==="
find "$CORE/Legacy" -type d -empty -delete 2>/dev/null || true

echo "=== Done ==="
remaining=$(find "$CORE/Legacy" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Remaining files in Legacy: $remaining"
find "$CORE/Legacy" -type f 2>/dev/null | head -20
