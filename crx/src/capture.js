const strip = dataUrl => {
  // Remove "data:image/png;base64,"
  return dataUrl.slice(22);
};

const capture = () => {
  return new Promise(resolve => {
    const frame = document.createElement("div");
    frame.setAttribute(
      "style",
      "position: fixed; width: 320px; height: 240px; right: 0; bottom: 0; z-index: 1;"
    );
    document.body.appendChild(frame);

    const video = document.createElement("video");
    video.setAttribute("style", "width: 320px; height: 240px;");
    frame.appendChild(video);

    let stopStream;
    const constraints = { audio: false, video: { width: 640, height: 480 } };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
        stopStream = () => {
          for (let track of stream.getTracks()) {
            track.stop();
          }
          frame.remove();
        };
      })
      .catch(err => {
        console.error(err);
      });

    const canvas = document.createElement("canvas");
    canvas.setAttribute("style", "display: none;");
    frame.appendChild(canvas);

    const THRESHOLD = 2;
    const history = [];
    const unique = (v, i, self) => self.indexOf(v) === i;
    const stabilized = code => {
      history.push(code);
      while (history.length > THRESHOLD) {
        history.shift();
      }
      return (
        history.length === THRESHOLD && history.filter(unique).length === 1
      );
    };

    const detect = () => {
      const ctx = canvas.getContext("2d");
      const width = (canvas.width = constraints.video.width);
      const height = (canvas.height = constraints.video.height);
      ctx.drawImage(video, 0, 0, width, height);

      const data = strip(canvas.toDataURL());
      chrome.runtime.sendMessage(
        chrome.runtime.id,
        { type: "ocr", payload: data },
        res => {
          if (res.payload && !res.error) {
            const code = res.payload;
            if (stabilized(code)) {
              console.log("Stabilized: " + code);
              stopStream();
              resolve(code);
            } else {
              console.log("Not stabilized: " + JSON.stringify(history));
              detect();
            }
          } else {
            // TODO: set limit of capturing
            console.log("Not detected: " + JSON.stringify(res));
            detect();
          }
        }
      );
    };
    detect();
  });
};

module.exports = { capture };
