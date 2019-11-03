window.__AUTHIST_PLUGIN_RUNTIME__ = ({ ready, submit }) => {
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
};
