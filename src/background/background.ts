chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "translate-replace",
      title: "書き換え",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "translate-copy",
      title: "コピー",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "separator",
      type: "separator",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "disable-site",
      title: "このサイトで無効化",
      contexts: ["selection"]
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case "translate-replace":
      chrome.tabs.sendMessage(tab.id, {
        action: "contextMenuAction",
        type: "translate-replace",
        selectedText: info.selectionText
      });
      break;

    case "translate-copy":
      chrome.tabs.sendMessage(tab.id, {
        action: "contextMenuAction",
        type: "translate-copy",
        selectedText: info.selectionText
      });
      break;

    case "disable-site":
      if (tab.url) {
        const hostname = new URL(tab.url).hostname;
        chrome.storage.sync.get(['disabledUrls'], (result) => {
          const disabledUrls = result.disabledUrls || [];
          if (!disabledUrls.includes(hostname)) {
            disabledUrls.push(hostname);
            chrome.storage.sync.set({ disabledUrls });
          }
        });
      }
      break;
  }
});