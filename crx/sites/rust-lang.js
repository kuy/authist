const find = () => {
  const tags = document.getElementsByTagName("h1");
  if (tags.length > 0 && tags[0].innerHTML === "Rust") {
    return tags[0];
  } else {
    return null;
  }
};

const ready = async () => {
  return new Promise((resolve, reject) => {
    const h1 = find();
    if (h1) {
      resolve();
    } else {
      // Set timeout for rejection
      setTimeout(() => {
        const h1 = find();
        if (h1) {
          resolve();
        } else {
          reject("Not target page");
        }
      }, 3000);
    }
  });
};

const submit = code => {
  const h1 = find();
  if (h1) {
    h1.innerHTML = code;
  }
};

window.__AUTHIST_PLUGIN_RUNTIME__({ ready, submit });
