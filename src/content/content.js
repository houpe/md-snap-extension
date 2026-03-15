// Markdown Snap Extension - Content Script
// 监听复制事件，检测 Markdown 内容

(function() {
  'use strict';

  // 排除的网站列表（这些网站不触发弹窗）
  const EXCLUDED_HOSTS = [
    'doubao.com',
    'kimi.moonshot.cn',
    'chat.openai.com',
    'claude.ai',
    'gemini.google.com',
    'chat.deepseek.com'
  ];

  // 检查当前网站是否在排除列表中
  function isExcludedHost(): boolean {
    const hostname = window.location.hostname;
    return EXCLUDED_HOSTS.some(host => hostname.includes(host));
  }

  // 如果在排除列表中，只记录日志，不监听
  if (isExcludedHost()) {
    console.log('Markdown Snap: 该网站已排除，不启用监听');
    return;
  }

  // 检测是否为 Markdown 内容
  function isMarkdown(text: string): boolean {
    if (!text || text.length < 10) return false;

    const mdPatterns = [
      /^#{1,6}\s+/m,
      /\*\*.*?\*\*/,
      /\*[^*]+?\*/,
      /`[^`]+`/,
      /^>\s+/m,
      /^[-*+]\s+/m,
      /^\d+\.\s+/m,
      /\[.+?\]\(.+?\)/,
      /!\[.*?\]\(.+?\)/,
      /^---+$/m,
      /\|.+\|/,
    ];

    let matchCount = 0;
    for (const pattern of mdPatterns) {
      if (pattern.test(text)) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return false;
  }

  // 创建弹窗
  function createPopup(mdContent: string): void {
    const existingPopup = document.getElementById('md-snap-popup');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.id = 'md-snap-popup';
    popup.innerHTML = `
      <div class="md-snap-content">
        <div class="md-snap-icon">📸</div>
        <div class="md-snap-text">
          <div class="md-snap-title">检测到 Markdown 内容</div>
          <div class="md-snap-desc">是否预览并导出精美图片？</div>
        </div>
        <div class="md-snap-actions">
          <button class="md-snap-btn md-snap-btn-preview">预览</button>
          <button class="md-snap-btn md-snap-btn-cancel">关闭</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // 绑定事件
    popup.querySelector('.md-snap-btn-preview')?.addEventListener('click', () => {
      try {
        chrome.runtime.sendMessage({ 
          action: 'openPreview', 
          markdown: mdContent 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Markdown Snap:', chrome.runtime.lastError);
          }
        });
      } catch (e) {
        console.error('Markdown Snap error:', e);
      }
      popup.remove();
    });

    popup.querySelector('.md-snap-btn-cancel')?.addEventListener('click', () => {
      popup.remove();
    });

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    setTimeout(() => {
      if (document.getElementById('md-snap-popup')) {
        popup.classList.add('md-snap-fade-out');
        setTimeout(() => popup.remove(), 300);
      }
    }, 5000);
  }

  // 监听复制事件
  document.addEventListener('copy', () => {
    setTimeout(() => {
      navigator.clipboard.readText().then(text => {
        if (isMarkdown(text)) {
          createPopup(text);
        }
      }).catch(err => {
        // 静默处理，不输出错误
      });
    }, 100);
  });

  console.log('Markdown Snap Extension loaded');
})();