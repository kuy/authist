let port = null;
let send = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("INSTALLED");
  port = chrome.runtime.connectNative("net.endflow.authist");
  port.onMessage.addListener(data => {
    console.log("MSG [native]: " + JSON.stringify(data));
    if (send) {
      send(data);
      send = null;
    }
  });
  port.onDisconnect.addListener(() => {
    console.log("DISCONNECTED");
    port = null;
  });
});

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, { type: "capture", output: "clipboard" });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const id = sender.tab.id;
  console.log(`MSG [tab=${id}]: len=${JSON.stringify(msg).length}`);
  switch (msg.type) {
    case "ocr":
      if (port) {
        port.postMessage(msg);
        if (!send) {
          send = sendResponse;
        } else {
          console.error(`Task overflow. Waiting for a response.`);
          sendResponse({ type: "ocr", error: true });
        }
        return true;
      } else {
        console.error("Not ready to communicate with native client.");
      }
      break;
    case "load":
      chrome.tabs.executeScript(id, { file: `plugin-runtime.js` }, () => {
        chrome.tabs.executeScript(
          id,
          { file: `sites/${msg.payload}.js` },
          () => {
            console.log(`MSG [tab=${id}]: loaded=${msg.payload}`);
            sendResponse({ type: "load", payload: "OK", tab: id });
          }
        );
      });
      return true;
    default:
      console.error(`Unknown message type: ${msg.type}`);
  }
});
