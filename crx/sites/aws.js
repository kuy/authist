const ready = async () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("input_account")) {
      const config = { attributes: false, childList: true, subtree: true };
      const observer = new MutationObserver(() => {
        if (document.getElementById("mfacode")) {
          observer.disconnect();
          resolve();
        }
        // TODO: need timeout? or retry limit?
      });
      observer.observe(document.body, config);
    } else {
      reject();
    }
  });
};

const submit = code => {
  const input = document.getElementById("mfacode");
  if (input) {
    input.value = code;

    // NOTE: Trigger Angular app
    input.dispatchEvent(new Event("input"));

    const button = document.getElementById("submitMfa_button");
    button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
