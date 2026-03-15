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
    popup.querySelector('.md-snap-btn-preview').addEventListener('click', () => {
      // 发送消息给 background 处理
      try {
        chrome.runtime.sendMessage({ 
          action: 'openPreview', 
          markdown: mdContent 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Markdown Snap:', chrome.runtime.lastError);
            // 降级方案：尝试直接打开
            alert('请刷新页面后重试');
          }
        });
      } catch (e) {
        console.error('Markdown Snap error:', e);
        alert('插件需要刷新页面才能使用');
      }
      popup.remove();
    });

    popup.querySelector('.md-snap-btn-cancel').addEventListener('click', () => {
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
        console.log('Markdown Snap: 无法读取剪贴板', err.message);
      });
    }, 100);
  });

  console.log('Markdown Snap Extension loaded');
})();