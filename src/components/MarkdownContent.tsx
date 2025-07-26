'use client';

import React, { useEffect, useState } from 'react';
import { parseMarkdown } from '../lib/markdown';
import '../styles/vocabulary.css';
import '../styles/audio-player.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const [parsedContent, setParsedContent] = useState<string>('');
  const [isContentReady, setIsContentReady] = useState<boolean>(false);

  useEffect(() => {
    const processContent = async () => {
      try {
        console.log('Processing markdown content...');
        const result = await parseMarkdown(content);
        console.log('Parsed content:', result);
        
        // Check if @audio pattern exists in the parsed content
        const audioRegex = /@audio\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        let processedContent = result;
        
        while ((match = audioRegex.exec(result)) !== null) {
          console.log('Found @audio pattern in parsed content:', match);
          const [, title, src] = match;
          const audioWrapper = `<div class="audio-player-wrapper" data-audio-src="${src.trim()}" data-audio-title="${title.trim()}"></div>`;
          processedContent = processedContent.replace(match[0], audioWrapper);
        }
        
        setParsedContent(processedContent);
        setIsContentReady(true);
      } catch (error) {
        console.error('Error processing markdown:', error);
        setParsedContent(content);
        setIsContentReady(true);
      }
    };

    if (content) {
      processContent();
    }
  }, [content]);

  // 콘텐츠가 렌더링된 후 목차 업데이트를 위한 이벤트 발생
  useEffect(() => {
    if (isContentReady && parsedContent) {
      // DOM 업데이트 후 목차가 헤딩을 다시 감지할 수 있도록 이벤트 발생
      const timer = setTimeout(() => {
        const event = new CustomEvent('contentReady');
        window.dispatchEvent(event);
        console.log('Content ready event dispatched');
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

  // 외부 링크와 내부 문서 링크가 새 탭에서 열리도록 설정
  useEffect(() => {
    if (isContentReady && parsedContent) {
      const timer = setTimeout(() => {
        const contentDiv = document.querySelector('.prose');
        if (contentDiv) {
          // 모든 링크 선택 (앵커 링크 제외)
          const allLinks = contentDiv.querySelectorAll('a[href]');
          allLinks.forEach((link) => {
            const anchorElement = link as HTMLAnchorElement;
            const href = anchorElement.getAttribute('href') || '';
            
            // 앵커 링크(#으로 시작)가 아닌 모든 링크를 새 탭에서 열기
            if (!href.startsWith('#') && href.trim() !== '') {
              anchorElement.setAttribute('target', '_blank');
              anchorElement.setAttribute('rel', 'noopener noreferrer');
            }
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

  // 토글 기능 추가
  useEffect(() => {
    if (isContentReady && parsedContent) {
      const timer = setTimeout(() => {
        // 토글 버튼에 이벤트 리스너 추가
        const toggleButtons = document.querySelectorAll('.toggle-button');
        toggleButtons.forEach((button) => {
          button.addEventListener('click', function(this: HTMLElement) {
            const type = this.getAttribute('data-type');
            const container = document.querySelector(`.${type}-content`);
            
            if (container) {
              // answer 타입인지 확인 (정답 및 해설)
              if (type?.startsWith('answer')) {
                // 정답 content의 경우 전체 container를 토글
                const containerElement = container as HTMLElement;
                const isVisible = containerElement.style.display !== 'none' && containerElement.style.display !== '';
                
                containerElement.style.display = !isVisible ? 'block' : 'none';
              } else {
                // 기존 로직 (meaning, translation)
                const meanings = container.querySelectorAll('.meaning');
                const translations = container.querySelectorAll('.translation');
                
                // 현재 상태 확인 (안전하게)
                let isVisible = false;
                if (meanings.length > 0) {
                  const firstMeaning = meanings[0] as HTMLElement;
                  isVisible = firstMeaning.style.display !== 'none' && firstMeaning.style.display !== '';
                } else if (translations.length > 0) {
                  const firstTranslation = translations[0] as HTMLElement;
                  isVisible = firstTranslation.style.display !== 'none' && firstTranslation.style.display !== '';
                }
                
                const displayValue = !isVisible ? 'inline' : 'none';
                const translationDisplayValue = !isVisible ? 'block' : 'none';
                
                meanings.forEach((meaning) => {
                  (meaning as HTMLElement).style.display = displayValue;
                });
                
                translations.forEach((translation) => {
                  (translation as HTMLElement).style.display = translationDisplayValue;
                });
              }
              
              // 버튼 텍스트 업데이트
              const buttonText = this.textContent || '';
              if (buttonText.includes('보이기')) {
                this.textContent = buttonText.replace('보이기', '가리기');
              } else {
                this.textContent = buttonText.replace('가리기', '보이기');
              }
            }
          });
        });
        
        // 초기 상태에서 모든 meaning, translation, answer content 요소를 숨김
        const meanings = document.querySelectorAll('.meaning');
        const translations = document.querySelectorAll('.translation');
        const answerContents = document.querySelectorAll('[class*="answer"][class*="-content"]');
        
        meanings.forEach((meaning) => {
          (meaning as HTMLElement).style.display = 'none';
        });
        
        translations.forEach((translation) => {
          (translation as HTMLElement).style.display = 'none';
        });
        
        answerContents.forEach((answerContent) => {
          (answerContent as HTMLElement).style.display = 'none';
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

  // 오디오 플레이어 렌더링
  useEffect(() => {
    if (isContentReady && parsedContent) {
      const timer = setTimeout(() => {
        const audioWrappers = document.querySelectorAll('.audio-player-wrapper');
        audioWrappers.forEach((wrapper) => {
          const src = wrapper.getAttribute('data-audio-src');
          const title = wrapper.getAttribute('data-audio-title');
          
          if (src && !wrapper.querySelector('.custom-audio-player')) {
            // Create custom audio player HTML
            const audioHTML = `
              <div class="custom-audio-player bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <audio src="${src}" preload="metadata" style="display: none;"></audio>
                ${title ? `<div class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">${title}</div>` : ''}
                <div class="flex items-center space-x-4 mb-3">
                  <button class="play-pause-btn w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors">
                    <svg class="play-icon w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                    </svg>
                    <svg class="pause-icon w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                  <div class="flex-1">
                    <div class="time-display text-xs text-gray-500 dark:text-gray-400">0:00 / 0:00</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="mute-btn text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-2.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    <input type="range" min="0" max="1" step="0.1" value="1" class="volume-slider w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer">
                  </div>
                </div>
                <div class="w-full">
                  <input type="range" min="0" max="0" value="0" class="progress-slider w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer">
                </div>
              </div>
            `;
            wrapper.innerHTML = audioHTML;
            
            // Add event listeners
            const audioElement = wrapper.querySelector('audio') as HTMLAudioElement;
            const playPauseBtn = wrapper.querySelector('.play-pause-btn') as HTMLButtonElement;
            const playIcon = wrapper.querySelector('.play-icon') as HTMLElement;
            const pauseIcon = wrapper.querySelector('.pause-icon') as HTMLElement;
            const timeDisplay = wrapper.querySelector('.time-display') as HTMLElement;
            const progressSlider = wrapper.querySelector('.progress-slider') as HTMLInputElement;
            const volumeSlider = wrapper.querySelector('.volume-slider') as HTMLInputElement;
            const muteBtn = wrapper.querySelector('.mute-btn') as HTMLButtonElement;
            
            if (audioElement && playPauseBtn) {
              // Play/Pause functionality
              playPauseBtn.addEventListener('click', () => {
                if (audioElement.paused) {
                  audioElement.play();
                } else {
                  audioElement.pause();
                }
              });
              
              // Update play/pause button
              audioElement.addEventListener('play', () => {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
              });
              
              audioElement.addEventListener('pause', () => {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
              });
              
              // Update time display
              audioElement.addEventListener('timeupdate', () => {
                const currentTime = audioElement.currentTime;
                const duration = audioElement.duration;
                timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
                progressSlider.value = currentTime.toString();
              });
              
              audioElement.addEventListener('loadedmetadata', () => {
                progressSlider.max = audioElement.duration.toString();
              });
              
              // Progress slider
              progressSlider.addEventListener('input', (e) => {
                const time = parseFloat((e.target as HTMLInputElement).value);
                audioElement.currentTime = time;
              });
              
              // Volume control
              volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat((e.target as HTMLInputElement).value);
                audioElement.volume = volume;
              });
              
              // Mute button
              muteBtn.addEventListener('click', () => {
                audioElement.muted = !audioElement.muted;
              });
            }
          }
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isContentReady, parsedContent]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:marker:text-gray-700 ${className}`}
      style={{
        '--tw-prose-bullets': '#374151',
        '--tw-prose-counters': '#374151',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
} 