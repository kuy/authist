const ready = async () => {
  return new Promise(resolve => {
    window.addEventListener("load", () => resolve(), false);
  });
};

const submit = code => {
  console.log(`rust-lang: code=${code}`);
  for (let tag of document.getElementsByTagName("h1")) {
    tag.innerHTML = code;
  }
};

module.exports.ready = ready;
module.exports.submit = submit;
