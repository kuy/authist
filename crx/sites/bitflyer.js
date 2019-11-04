const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById("otpCode");
    return input ? resolve() : reject();
  });
};

const submit = code => {
  const input = document.getElementById("otpCode");
  if (input) {
    input.value = code;
    const button = document.querySelector(`.tfa-confirm-btn input.btn`);
    button && button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
