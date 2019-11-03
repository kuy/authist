const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById("otp");
    return input ? resolve() : reject();
  });
};

const submit = code => {
  const input = document.getElementById("otp");
  if (input) {
    input.value = code;
    const button = document.querySelector(`#login form button[type="submit"]`);
    button && button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
