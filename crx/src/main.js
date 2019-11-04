const { dispatch } = require("./dispatcher");
const { capture } = require("./capture");

const run = async (options = {}) => {
  if (typeof options.output === "undefined") {
    options.output = "plugin";
  }
  switch (options.output) {
    case "plugin":
      const plugin = await dispatch();
      if (plugin) {
        try {
          await plugin.ready(); // TODO: need timeout?
          const code = await capture();
          await plugin.submit(code);
        } catch (e) {
          console.log("Abort by plugin");
        }
      }
      break;
    case "clipboard":
      const code = await capture();
      navigator.clipboard.writeText(code);
      // TODO: show "copied" message for feedback
      break;
    default:
      console.error(`Unsupported output: ${options.output}`);
  }
};

run();

chrome.runtime.onMessage.addListener(msg => {
  run({ output: msg.output }).then();
});
