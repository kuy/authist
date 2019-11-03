const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById("auth-mfa-otpcode");
    return input ? resolve() : reject();
  });
};

const submit = code => {
  const input = document.getElementById("auth-mfa-otpcode");
  if (input) {
    input.value = code;
    const button = document.getElementById("auth-signin-button");
    button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
