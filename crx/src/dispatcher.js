const SITES = [
  { name: "aws", url: /^https:\/\/\w+\.signin\.aws\.amazon\.com\// },
  { name: "rust-lang", url: /^https:\/\/www\.rust-lang\.org/ }
];

const load_site_plugin = async name => {
  return new Promise(resolve => {
    console.log(`dispatcher.load: req=${name}`);
    chrome.runtime.sendMessage(
      "hojhgepgambmlkgingfmmjghlagmkjoj",
      { type: "load", payload: name },
      res => {
        console.log(`dispatcher.load: res=${JSON.stringify(res)}`);
        resolve(new Plugin(name, res.tab));
      }
    );
  });
};

class Plugin {
  constructor(name, tab) {
    this.name = name;
    this.tab = tab;
    this.slot = {};

    window.addEventListener(
      "message",
      ev => {
        const msg = ev.data;
        if (msg.from === "plugin") {
          this.log(`msg=${JSON.stringify(msg)}`);
          const callback = this.slot[msg.action];
          callback && callback(msg);
        }
      },
      false
    );
  }

  async ready() {
    this.log(`call ready`);
    return new Promise((resolve, reject) => {
      window.postMessage({ from: "dispatcher", action: "ready" }, "*");
      this.slot.ready = msg => {
        if (msg.payload && !msg.error) {
          resolve(msg.payload);
        } else {
          reject(msg.error);
        }
      };
    });
  }

  async submit(code) {
    this.log(`call submit: ${code}`);
    return new Promise((resolve, reject) => {
      window.postMessage(
        { from: "dispatcher", action: "submit", payload: code },
        "*"
      );
      this.slot.submit = msg => {
        if (msg.payload && !msg.error) {
          resolve(msg.payload);
        } else {
          reject(msg.error);
        }
      };
    });
  }

  log(text) {
    console.log(
      `dispatcher.plugin [name=${this.name}, tab=${this.tab}]: ${text}`
    );
  }
}

const dispatch = async () => {
  const url = window.location.href;
  for (let site of SITES) {
    if (site.url.test(url)) {
      const plugin = await load_site_plugin(site.name);
      if (plugin) {
        return plugin;
      } else {
        console.warn(`Failed to load: ${site.name}`);
      }
    }
  }
  return null;
};

module.exports = { dispatch };
