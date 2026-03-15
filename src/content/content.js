// Markdown Snap Extension - Content Script
// 监听复制事件，检测 Markdown 内容

(function() {
  'use strict';

  // 检测是否为 Markdown 内容
  function isMarkdown(text) {
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
  function createPopup(mdContent) {
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
    const previewBtn = popup.querySelector('.md-snap-btn-preview');
    const cancelBtn = popup.querySelector('.md-snap-btn-cancel');

    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ 
              action: 'openPreview', 
              markdown: mdContent 
            });
          }
        } catch (e) {
          // 静默处理
        }
        popup.remove();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        popup.remove();
      });
    }

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    // 5秒后自动关闭
    setTimeout(() => {
      if (document.getElementById('md-snap-popup')) {
        popup.classList.add('md-snap-fade-out');
        setTimeout(() => popup.remove(), 300);
      }
    }, 5000);
  }

  // 尝试读取剪贴板
  async function tryReadClipboard() {
    try {
      // 检查是否有剪贴板 API
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        return;
      }
      
      const text = await navigator.clipboard.readText();
      if (text && isMarkdown(text)) {
        createPopup(text);
      }
    } catch (e) {
      // 权限被拒绝或其他错误，静默处理
      // 这在某些网站（如 AI 对话网站）是正常的
    }
  }

  // 监听复制事件
  document.addEventListener('copy', () => {
    setTimeout(() => {
      tryReadClipboard();
    }, 100);
  });

})();