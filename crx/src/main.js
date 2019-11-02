if (document.getElementById("input_account")) {
  const config = { attributes: false, childList: true, subtree: true };
  const observer = new MutationObserver((list, observer) => {
    if (document.getElementById("mfacode")) {
      observer.disconnect();
      setupCaptureFrame();
    }
  });
  observer.observe(document.body, config);
} else {
  window.addEventListener("load", () => setupCaptureFrame(), false);
}

const strip = dataUrl => {
  // Remove "data:image/png;base64,"
  return dataUrl.slice(22);
};

const setupCaptureFrame = () => {
  var frame = document.createElement("div");
  frame.setAttribute(
    "style",
    "position: fixed; width: 320px; height: 240px; right: 0; bottom: 0;"
  );
  document.body.appendChild(frame);

  var video = document.createElement("video");
  video.setAttribute("style", "width: 320px; height: 240px;");
  frame.appendChild(video);

  let stopStream;
  var constraints = { audio: false, video: { width: 640, height: 480 } };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
      video.srcObject = stream;
      video.onloadedmetadata = function(e) {
        video.play();
      };
      stopStream = () => {
        for (let track of stream.getTracks()) {
          track.stop();
        }
        frame.remove();
      };
    })
    .catch(function(err) {
      console.error(err.name + ": " + err.message);
    });

  var canvas = document.createElement("canvas");
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
    return history.length === THRESHOLD && history.filter(unique).length === 1;
  };

  const capture = () => {
    var ctx = canvas.getContext("2d");
    var width = (canvas.width = constraints.video.width);
    var height = (canvas.height = constraints.video.height);
    ctx.drawImage(video, 0, 0, width, height);

    var data = strip(canvas.toDataURL());
    chrome.runtime.sendMessage(
      "hojhgepgambmlkgingfmmjghlagmkjoj",
      { payload: data },
      res => {
        if (res.payload && !res.error) {
          const code = res.payload;
          if (stabilized(code)) {
            console.log("Stabilized: " + code);
            stopStream();

            const input = document.getElementById("mfacode");
            input.value = code;
            input.dispatchEvent(new Event("input")); // for Angular
            const submit = document.getElementById("submitMfa_button");
            submit.click();
          } else {
            console.log("Not stabilized: " + JSON.stringify(history));
            capture();
          }
        } else {
          console.log("Not detected: " + JSON.stringify(res));
          capture();
        }
      }
    );
  };

  capture();
};
