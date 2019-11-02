require("./sites/aws");
require("./sites/rust-lang");

const SERVICES = [
  { name: "aws", url: /^https:\/\/\w+\.signin\.aws\.amazon\.com\// },
  { name: "rust-lang", url: /^https:\/\/www\.rust-lang\.org/ }
];

const load_service = name => {
  try {
    const service = require(`./sites/${name}`);
    return service;
  } catch (e) {
    return null;
  }
};

const dispatch = async () => {
  const url = window.location.href;
  for (let entry of SERVICES) {
    if (entry.url.test(url)) {
      const service = load_service(entry.name);
      if (service) {
        return service;
      } else {
        console.error(`Failed to load: ${entry.name}`);
      }
    }
  }
  return null;
};

module.exports = { dispatch };
