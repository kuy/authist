const ready = async () => {
  return new Promise(resolve => {
    const config = { attributes: false, childList: true, subtree: true };
    const observer = new MutationObserver(() => {
      if (document.querySelector('input[name="verificationCode"]')) {
        observer.disconnect();
        resolve();
      }
      // TODO: need timeout? or retry limit?
    });
    observer.observe(document.body, config);
  });
};

const submit = code => {
  const input = document.querySelector('input[name="verificationCode"]');
  if (input) {
    var setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    setter.call(input, code);
    var ev = new Event("input", { bubbles: true });
    input.dispatchEvent(ev);

    const button = document.querySelector('button[type="button"]');
    button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
