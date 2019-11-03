const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById("totpPin");
    if (input) {
      resolve();
    } else {
      const config = { attributes: false, childList: true, subtree: true };
      const observer = new MutationObserver(() => {
        if (document.getElementById("totpPin")) {
          observer.disconnect();
          resolve();
        }
        // TODO: need timeout? or retry limit?
      });
      observer.observe(document.body, config);
    }
  });
};

const submit = code => {
  const input = document.getElementById("totpPin");
  if (input) {
    input.value = code;
    const button = document.getElementById("totpNext");
    button && button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
