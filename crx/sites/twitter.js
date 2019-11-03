const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById("challenge_response");
    return input ? resolve() : reject();
  });
};

const submit = code => {
  const input = document.getElementById("challenge_response");
  if (input) {
    input.value = code;
    const button = document.getElementById("email_challenge_submit");
    button.click();
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
