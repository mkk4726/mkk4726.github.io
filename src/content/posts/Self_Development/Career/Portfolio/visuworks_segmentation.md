---
title: "[Visuworks] Segmentation Model"
date: ""
excerpt: "출혈관련 병변 탐지 모델 개발"
category: "Career"
tags: ["Computer Vision", "Segmentation"]
---

- 기간 : 2024.04 ~ 2024.06 (3개월)
- 역할 : 출혈 관련 병변 탐지를 위한 segmentation model 개발 및 모델 서빙, 모델 추론 관련 API 개발

---

# 프로젝트 개요

## 배경 및 목표

안저사진(fundus image)은 눈의 내부를 촬영한 이미지로, 당뇨병성 망막병증, 고혈압성 망막병증 등 다양한 안과 질환을 진단하는 데 사용됩니다. 의사들은 안저사진에서 출혈, 삼출물, 미세동맥류 등의 병변을 육안으로 확인하여 질병을 진단하는데, 이 과정은 시간이 많이 소요되고 숙련도에 따라 판독 결과가 달라질 수 있습니다.

이 프로젝트는 취업 전 현재 소속 기업과 진행했던 [기업연계 프로젝트](/posts/Self_Development/Career/Portfolio/aiffel_segmentation/)를 고도화한 것입니다. 당시 U-Net 기반 segmentation 모델, CLAHE 전처리, Multi-Task Learning 등을 적용해 기본적인 성능을 확보했습니다. 입사 후에는 이를 바탕으로 출혈 관련 병변 탐지 모델을 더욱 고도화하고, 실제 서비스 환경에 배포하는 것이 목표였습니다.

## 기술적 접근

가장 큰 기술적 도전은 labeled data의 부족이었습니다. Annotation된 데이터가 1,500장에 불과했고, unlabeled 안저사진은 1만 장 이상이었습니다. 이를 해결하기 위해 unsupervised learning과 semi-supervised learning 기법을 적용했습니다. MoCo를 활용한 contrastive learning으로 unlabeled data에서 feature representation을 학습하고, Multi-Task Learning으로 reconstruction task를 추가해 encoder의 표현력을 강화했습니다.

모델 개발 후에는 온프레미스 GPU 서버에 Triton Inference Server를 구축하고, ONNX/TensorRT 최적화를 적용했습니다. REST API를 개발해 실시간으로 안저사진을 분석하고 병변 위치를 반환하는 시스템을 완성했습니다.

## 성과 및 한계

기술적으로는 성공적인 프로젝트였습니다. Contrastive learning을 통해 모델 성능이 향상되었고, distributed training과 production-level model serving 경험을 쌓을 수 있었습니다. 하지만 프로젝트는 결국 중단되었습니다. 의료기기 규제의 벽과 실제 사용자의 낮은 니즈로 인해 비즈니스적으로 지속 가능하지 않다는 판단이 내려졌기 때문입니다. 이 경험은 기술적 우수성만으로는 충분하지 않으며, 시장과 사용자의 실제 pain point를 정확히 이해하는 것이 얼마나 중요한지 깨닫게 해준 계기가 되었습니다.

---

# 문제해결과정

프로젝트를 진행하면서 두 가지 핵심 과제에 집중했습니다.

**첫 번째는 labeled data가 부족한 상황에서 모델 성능을 최대화하는 것**이었습니다. 1,500장의 annotation된 데이터와 1만 장 이상의 unlabeled data라는 불균형한 데이터 환경에서, unsupervised pretraining과 Multi-Task Learning을 통해 unlabeled data를 효과적으로 활용하는 방법을 모색했습니다.

**두 번째는 개발된 모델을 실제 서비스 환경에 안정적으로 배포하는 것**이었습니다. 연구 환경에서 학습한 PyTorch 모델을 production 환경에 최적화하고, 온프레미스 GPU 서버에 Triton Inference Server를 구축하며, REST API를 통해 실시간 추론을 제공하는 전체 인프라를 설계했습니다.

각 과제를 어떻게 해결했는지, 그리고 프로젝트를 통해 마주한 한계와 교훈은 무엇이었는지 아래에 정리했습니다.

---

# 모델 성능을 올리기 위해서 시도했던 것들

이 프로젝트에서 가장 큰 제약은 labeled data의 부족이었습니다. Segmentation을 위한 annotation이 완료된 데이터는 약 1,500장이었고, 그마저도 80%의 이미지에만 병변이 존재했으며 병변이 이미지에서 차지하는 비율은 매우 작았습니다. Supervised learning만으로는 모델이 충분한 representational power를 학습하기 어려운 상황이었습니다.

하지만 unlabeled data는 풍부했습니다. Annotation이 없는 안저사진은 1만 장 이상 확보되어 있었고, 이를 활용하면 모델의 성능을 향상시킬 수 있을 것이라 판단했습니다. 핵심 아이디어는 unlabeled data로 먼저 일반적인 안저사진의 패턴을 학습시킨 후, labeled data로 fine-tuning하는 것이었습니다.

이를 위해 두 가지 접근을 시도했습니다. 첫째, MoCo를 활용한 unsupervised learning으로 encoder를 pretraining했습니다. 둘째, Multi-Task Learning을 통해 segmentation 외에 reconstruction task를 함께 학습시켜 encoder가 더 풍부한 feature representation을 학습하도록 유도했습니다.

결과적으로 성능 향상을 확인할 수 있었습니다. 1년이 지난 시점이라 구체적인 수치는 기억나지 않지만, random initialization, ImageNet pretrained weights, contrastive learning pretrained weights를 비교했을 때 contrastive learning 기반 pretraining이 가장 좋은 성능을 보였습니다. 논문을 읽고 직접 구현하는 과정에서 많은 시행착오가 있었지만, 이 경험은 실력 향상에 큰 도움이 되었습니다.

---

## 모델 선택: U-Net 기반 Architecture

모델 architecture는 이전 Aiffel 프로젝트에서 수행한 실험 결과를 바탕으로 U-Net을 선택했습니다. U-Net은 encoder에서 학습한 high-level feature와 decoder의 low-level spatial information을 skip connection으로 결합하여, 작은 병변도 정확히 localize할 수 있다는 장점이 있습니다. 특히 출혈 병변은 크기가 작고 경계가 불분명한 경우가 많아서 U-Net의 이러한 특성이 유용했습니다.

전략은 U-Net의 encoder를 최대한 풍부하게 학습시키는 것이었습니다. Encoder가 안저사진의 다양한 패턴을 잘 표현할 수 있다면, decoder는 그 정보를 바탕으로 정확한 segmentation을 수행할 수 있기 때문입니다. Labeled data가 부족한 상황에서 encoder를 강화하기 위해 MoCo를 활용한 unsupervised pretraining과 Multi-Task Learning을 적용했습니다.

---

## MoCo를 활용한 Unsupervised Pretraining

Unlabeled data를 활용하기 위해 contrastive learning 기반의 unsupervised pretraining을 적용했습니다. 처음에는 ImageNet pretrained weights를 사용해봤지만, 안저사진과 ImageNet의 자연 이미지는 domain 특성이 너무 달라서 성능 향상이 제한적이었습니다. 안저사진은 독특한 circular field of view와 혈관 구조를 가지고 있어서, 일반적인 자연 이미지로 학습된 feature가 효과적이지 않았습니다.

따라서 1만 장 이상의 unlabeled 안저사진으로 직접 pretraining을 진행했습니다. 이때 MoCo(Momentum Contrast)를 활용했는데, MoCo는 SimCLR보다 메모리 효율적이면서도 large batch size의 효과를 얻을 수 있는 방법입니다. Contrastive learning의 핵심은 같은 이미지의 augmented view들은 유사한 representation을 갖도록, 다른 이미지들은 구별되는 representation을 갖도록 학습하는 것입니다. 이를 통해 label 없이도 의미 있는 feature를 학습할 수 있습니다.

병변 탐지에 contrastive learning을 적용한 선행 연구들이 있었지만 구체적인 구현 코드는 공개되지 않았기 때문에, 논문을 읽고 직접 구현했습니다. 가장 어려웠던 부분은 높은 해상도와 large batch size를 유지하는 것이었습니다. Contrastive learning은 batch 내에서 negative sample을 구성하기 때문에 batch size가 성능에 큰 영향을 미칩니다. 실험 환경에 NVIDIA 4090 4대가 있었고, 이를 모두 활용해 distributed training을 구현했습니다.

Multi-GPU 분산 학습을 처음 시도하다 보니 여러 시행착오가 있었습니다. GPU 간 동기화 문제, gradient accumulation 설정, 그리고 무엇보다 GPU 사용률을 높이기 위해 data loading pipeline을 최적화하는 작업이 필요했습니다. Augmentation과 같은 CPU-bound 작업이 병목이 되지 않도록 prefetching과 multi-processing을 활용했습니다.

---

## Multi-Task Learning으로 Encoder 강화

MoCo pretraining 외에도 Multi-Task Learning을 통해 encoder의 표현력을 높이고자 했습니다. MTL의 아이디어는 여러 task를 동시에 학습시켜 각 task가 서로 다른 관점에서 유용한 feature를 학습하도록 유도하는 것입니다. 특히 reconstruction task를 추가하면 unlabeled data도 활용할 수 있다는 장점이 있습니다.

구체적으로 U-Net의 encoder에 두 개의 decoder branch를 연결했습니다. 하나는 segmentation을 위한 decoder이고, 다른 하나는 입력 이미지를 복원하는 reconstruction decoder입니다. Reconstruction task는 $p(X)$를 모델링하는 작업으로, encoder가 병변의 위치뿐만 아니라 안저사진 전반의 구조적 패턴(혈관의 분포, 시신경 유두의 형태 등)을 학습하도록 강제합니다. 이렇게 학습된 encoder는 segmentation에 필요한 low-level feature와 high-level semantic feature를 모두 풍부하게 표현할 수 있게 됩니다.

Reconstruction task는 label이 필요 없기 때문에 1만 장의 unlabeled data를 모두 활용할 수 있었습니다. Training 과정에서는 labeled data로 두 task를 모두 학습하고, unlabeled data로는 reconstruction만 학습하는 방식으로 진행했습니다. 결과적으로 encoder는 더 일반화된 representation을 학습할 수 있었고, 작은 병변도 더 잘 탐지할 수 있게 되었습니다.

---

# 모델 서빙 및 API 개발

모델 개발이 완료된 후에는 온프레미스 GPU 서버에 모델을 배포하고, 추론 API를 개발하는 작업을 진행했습니다. 이 과정에서 모델 최적화, 서빙 인프라 구축, API 설계 등 프로덕션 환경에서의 ML 시스템 구축 전반을 경험할 수 있었습니다.

## 모델 최적화 및 변환

PyTorch로 학습된 모델을 프로덕션 환경에서 사용하기 위해서는 추론 성능 최적화가 필요했습니다. 먼저 모델을 ONNX 형식으로 변환하여 추론 그래프를 최적화했습니다. ONNX는 연산 그래프를 단순화하고 불필요한 노드를 제거하여 추론 속도를 개선할 수 있습니다. 추가로 TensorRT를 활용해 NVIDIA GPU에 특화된 최적화를 적용했습니다. TensorRT는 layer fusion, precision calibration (FP16) 등을 통해 latency를 크게 줄일 수 있었습니다.

## Triton Inference Server 도입

모델 서빙을 위해 NVIDIA Triton Inference Server를 선택했습니다. Triton Server는 여러 장점이 있었는데, 첫째로 dynamic batching을 지원하여 여러 요청을 자동으로 묶어서 처리할 수 있어 GPU 활용률을 높일 수 있었습니다. 둘째로 ONNX, TensorRT, PyTorch 등 다양한 backend를 지원하여 모델 형식에 유연하게 대응할 수 있었습니다. 셋째로 model versioning과 A/B testing을 쉽게 구현할 수 있어 향후 모델 업데이트에 유리했습니다.

하지만 온프레미스 환경에 Triton Server를 구축하는 과정은 쉽지 않았습니다. CUDA, cuDNN, TensorRT, Triton Server의 버전 호환성을 맞추는 작업에서 많은 시행착오가 있었습니다. 특히 드라이버 버전과 CUDA 버전, 그리고 PyTorch와 TensorRT의 호환성 문제로 인해 여러 번 환경을 재구성해야 했습니다. Docker를 활용해 의존성을 격리하고 재현 가능한 환경을 구축하는 것이 큰 도움이 되었습니다.

## API 설계 및 성능 평가

모델 추론을 위한 REST API를 개발했습니다. API는 안저사진 이미지를 입력받아 병변의 segmentation mask를 반환하는 구조였습니다. 전처리(CLAHE 등)와 후처리(mask post-processing) 로직도 API 단에서 처리하도록 구현했습니다. 또한 batch inference를 지원하여 여러 이미지를 한 번에 처리할 수 있도록 했습니다.

성능 요구사항은 10장의 이미지를 1초 이내에 처리하는 것이었습니다. Triton Server의 dynamic batching과 TensorRT 최적화를 통해 이 요구사항을 충분히 만족시킬 수 있었습니다. 부하 테스트를 통해 동시 요청 상황에서도 안정적으로 동작하는지 검증했습니다.

돌이켜보면 요구사항 자체가 까다롭지 않았기 때문에 단순히 PyTorch 모델을 FastAPI로 서빙해도 충분했을 것입니다. 하지만 Triton Server를 도입하면서 production-grade ML serving infrastructure에 대한 이해를 깊게 쌓을 수 있었고, 이는 이후 프로젝트에서도 유용한 경험이 되었습니다.

---

# 프로젝트의 한계점

이 프로젝트는 기술적으로는 성공했지만, 비즈니스적으로는 실패로 끝났습니다. 모델 성능이 부족해서가 아니라 실제 시장에서 요구되는 가치를 제공하지 못했기 때문입니다. 이 경험을 통해 의료 AI의 현실적인 어려움과 제품 개발의 본질에 대해 많은 것을 배울 수 있었습니다.

## 의료기기 규제의 벽

소프트웨어 의료기기(Software as a Medical Device)를 출시하기 위해서는 식약처의 의료기기 허가를 받아야 하며, 이 과정은 통상 2~4년이 소요됩니다. 임상 시험 데이터 확보, 안전성 및 유효성 검증, 서류 작업 등 상당한 시간과 비용이 투입되어야 합니다.

따라서 허가 전에 시장 반응을 테스트하기 위해서는 법적으로 "진단"을 제공할 수 없고, "진단 보조" 기능만 제공할 수 있습니다. 이는 의사의 의사결정을 돕는 참고 정보만 제공할 수 있다는 의미입니다. 결과적으로 제품의 가치 제안이 상당히 제한적일 수밖에 없었습니다.

## 사용자 니즈의 불일치

더 근본적인 문제는 실제 사용자의 니즈와 맞지 않았다는 점입니다. 안과 전문의들과의 인터뷰를 통해 다음과 같은 피드백을 받았습니다.

첫째, 숙련된 의사에게 출혈 병변을 찾는 것은 그리 어려운 작업이 아니었습니다. 오히려 병변의 크기, 위치, 패턴을 종합적으로 판단하여 질병의 진행 정도를 평가하는 것이 더 중요한 의사결정이었습니다. 단순히 병변의 위치를 표시해주는 것은 실질적인 가치가 제한적이었습니다.

둘째, 기존 workflow를 바꾸는 것에 대한 저항이 컸습니다. 새로운 소프트웨어를 사용하려면 이미지를 업로드하고, 결과를 기다리고, 다시 확인하는 추가적인 절차가 필요했습니다. 익숙한 방식을 바꾸면서까지 사용할 만큼의 compelling한 가치를 제공하지 못했습니다.

셋째, 비용 대비 효용이 낮았습니다. "보조" 기능만 제공할 수 있는 상황에서 병원이 추가 비용을 지불할 명확한 이유가 없었습니다. 진단 정확도를 크게 향상시키거나, 진료 시간을 획기적으로 단축시키거나, 의료 사고 위험을 줄이는 등의 명확한 ROI를 보여주지 못했습니다.

## 얻은 교훈

이 프로젝트를 통해 기술 개발과 제품 개발의 차이를 뼈저리게 느꼈습니다. 좋은 모델을 만드는 것과 사용자가 원하는 제품을 만드는 것은 완전히 다른 문제였습니다. 

가장 중요한 교훈은 문제 정의의 중요성입니다. "병변을 잘 찾는 모델"이 아니라 "의사의 어떤 pain point를 해결할 것인가"에서 시작했어야 했습니다. 기술 중심이 아닌 사용자 중심으로 접근했다면, 다른 형태의 솔루션을 고민할 수 있었을 것입니다.

또한 의료 AI 분야의 현실적인 어려움을 이해하게 되었습니다. 규제 장벽, 보수적인 시장, 높은 검증 요구사항 등은 기술만으로 극복할 수 없는 구조적 문제들이었습니다. 이 경험은 이후 커리어 방향을 결정하는 데 중요한 영향을 미쳤고, 시장과 사용자에 대한 깊은 이해 없이는 어떤 기술도 의미가 없다는 것을 깨닫게 해주었습니다.

