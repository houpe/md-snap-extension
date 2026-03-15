// Markdown Snap Extension - Popup Script

document.getElementById('previewBtn').addEventListener('click', () => {
  const mdContent = document.getElementById('mdInput').value.trim();
  
  if (!mdContent) {
    alert('请输入 Markdown 内容');
    return;
  }

  openPreview(mdContent);
});

function openPreview(mdContent) {
  const encoded = encodeURIComponent(mdContent);
  const previewUrl = chrome.runtime.getURL('src/preview/index.html') + '#' + encoded;
  chrome.tabs.create({ url: previewUrl });
}

// 自动聚焦输入框
document.getElementById('mdInput').focus();

// 监听粘贴事件，自动打开预览
document.getElementById('mdInput').addEventListener('paste', (e) => {
  setTimeout(() => {
    const content = document.getElementById('mdInput').value.trim();
    if (content) {
      openPreview(content);
    }
  }, 100);
});