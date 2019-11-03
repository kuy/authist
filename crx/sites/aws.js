const ready = async () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("input_account")) {
      const config = { attributes: false, childList: true, subtree: true };
      const observer = new MutationObserver(() => {
        if (document.getElementById("mfacode")) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, config);
      // TODO: need timeout?
    } else {
      reject();
    }
  });
};

const submit = code => {
  const input = document.getElementById("mfacode");
  input.value = code;
  input.dispatchEvent(new Event("input")); // for Angular
  const submit = document.getElementById("submitMfa_button");
  submit.click();
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
