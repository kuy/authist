const ready = async () => {
  return new Promise((resolve, reject) => {
    const input = document.querySelector(`input[name="two_factor_password"]`);
    return input ? resolve() : reject();
  });
};

const submit = code => {
  const input = document.querySelector(`input[name="two_factor_password"]`);
  if (input) {
    input.value = code;

    // NOTE: Trigger Angular app
    input.dispatchEvent(new Event("input"));
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
