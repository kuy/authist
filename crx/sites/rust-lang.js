const findTarget = () => {
  const tags = document.getElementsByTagName("h1");
  if (tags.length > 0) {
    const h1 = tags[0];
    if (h1.innerHTML === "Rust") {
      return h1;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const ready = async () => {
  return new Promise((resolve, reject) => {
    const h1 = findTarget();
    if (h1) {
      resolve();
    } else {
      setTimeout(() => {
        const h1 = findTarget();
        if (h1) {
          resolve(h1);
        } else {
          reject("Not target page");
        }
      }, 3000);
    }
  });
};

const submit = code => {
  console.log(`rust-lang: code=${code}`);
  const h1 = findTarget();
  if (h1) {
    h1.innerHTML = code;
  }
};

window.addEventListener(
  "message",
  ev => {
    const msg = ev.data;
    if (msg.from === "dispatcher") {
      console.log(`rust-lang received MSG: ${JSON.stringify(msg)}`);
      switch (msg.action) {
        case "ready":
          console.log(`rust-lang: run ready`);
          ready()
            .then(() => {
              console.log(`rust-lang: done ready`);
              window.postMessage(
                { from: "plugin", action: "ready", payload: "done" },
                "*"
              );
            })
            .catch(err => {
              console.log(`rust-lang: failed ready`);
              window.postMessage(
                { from: "plugin", action: "ready", error: err },
                "*"
              );
            });
          break;
        case "submit":
          console.log(`rust-lang: run submit`);
          const ret = submit(msg.payload);
          if (
            typeof ret === "undefined" ||
            (ret && ret.error && ret.error === false)
          ) {
            console.log(`rust-lang: done submit`);
            window.postMessage(
              { from: "plugin", action: "submit", payload: "done" },
              "*"
            );
          } else {
            console.log(`rust-lang: failed submit`);
            window.postMessage(
              { from: "plugin", action: "submit", error: "failed" },
              "*"
            );
          }
          break;
      }
    }
  },
  false
);
