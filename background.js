// Markdown Snap Extension - Background Script

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openPreview' && message.markdown) {
    // 将内容存储到 storage，然后打开预览页
    chrome.storage.local.set({ 'mdSnapContent': message.markdown }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('src/preview/index.html')
      });
    });
    sendResponse({ success: true });
  }
  return true; // 保持消息通道开放
});

// 添加右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'md-snap-preview',
    title: '📸 用 Markdown Snap 预览',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'md-snap-preview' && info.selectionText) {
    chrome.storage.local.set({ 'mdSnapContent': info.selectionText }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('src/preview/index.html')
      });
    });
  }
});