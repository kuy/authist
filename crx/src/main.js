const { dispatch } = require("./dispatcher");
const { capture } = require("./capture");

const run = async () => {
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
};

run();
