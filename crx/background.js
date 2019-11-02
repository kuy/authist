let port = null;
let send = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log("installed");
  port = chrome.runtime.connectNative("net.endflow.authist");
  port.onMessage.addListener(data => {
    console.log("MSG [native]: " + JSON.stringify(data));
    if (send) {
      send(data);
      send = null;
    }
  });
  port.onDisconnect.addListener(() => {
    console.log("DISCONNECT");
    port = null;
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("MSG [content]: len=" + JSON.stringify(msg).length);
  if (port) {
    port.postMessage(msg);
    if (!send) {
      send = sendResponse;
    } else {
      console.error("Task overflow. Waiting for a response.");
      sendResponse({ error: true });
    }
    return true;
  } else {
    console.error("Not ready to communicate with native client.");
  }
});
