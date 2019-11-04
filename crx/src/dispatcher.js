const dispatch = async () => {
  const current = window.location.href;
  for (let entry of PLUGINS) {
    let urls = entry.url;
    if (!(typeof urls === "object" && typeof urls.length !== "undefined")) {
      urls = [urls];
    }
    for (let url of urls) {
      if (url.test(current)) {
        const plugin = await load_plugin(entry.name);
        if (plugin) {
          return plugin;
        } else {
          console.warn(`Failed to load: ${entry.name}`);
        }
      }
    }
  }
  return null;
};

const PLUGINS = [
  {
    name: "aws",
    url: /^https:\/\/[\w-]+\.signin\.aws\.amazon\.com\//
  },
  {
    name: "github",
    url: /^https:\/\/github\.com\/sessions\/two-factor/
  },
  {
    name: "twitter",
    url: /^https:\/\/twitter\.com\/account\/login_verification/
  },
  {
    name: "google",
    url: [
      /^https:\/\/accounts\.google\.com\/ServiceLogin/,
      /^https:\/\/accounts\.google\.com\/signin\/v2\/challenge\/totp/
    ]
  },
  {
    name: "amazon-co-jp",
    url: /^https:\/\/www\.amazon\.co\.jp\/ap\/mfa/
  },
  {
    name: "bitflyer",
    url: /^https:\/\/bitflyer\.com\/[\w-]+\/ex\/twofactorauth/
  },
  {
    name: "coincheck",
    url: [
      /^https:\/\/coincheck.com\/\w+\/sessions\/two_factor_auth/,
      /^https:\/\/coincheck.com\/sessions\/two_factor_auth/
    ]
  },
  {
    name: "rust-lang",
    url: /^https:\/\/www\.rust-lang\.org/
  }
];

const load_plugin = async name => {
  return new Promise(resolve => {
    console.log(`dispatcher.load: req=${name}`);
    chrome.runtime.sendMessage(
      chrome.runtime.id,
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

module.exports = { dispatch };
