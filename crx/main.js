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
    "position: fixed; width: 320px; height: 280px; right: 0; bottom: 0;"
  );
  document.body.appendChild(frame);

  var video = document.createElement("video");
  video.setAttribute("style", "width: 320px; height: 240px;");

  var constraints = { audio: false, video: { width: 640, height: 480 } };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(mediaStream) {
      video.srcObject = mediaStream;
      video.onloadedmetadata = function(e) {
        video.play();
      };
    })
    .catch(function(err) {
      console.error(err.name + ": " + err.message);
    });

  var canvas = document.createElement("canvas");
  canvas.setAttribute("style", "display: none;");

  var button = document.createElement("input");
  button.setAttribute("type", "button");
  button.setAttribute("value", "Capture");
  button.addEventListener(
    "click",
    () => {
      var ctx = canvas.getContext("2d");
      var width = (canvas.width = constraints.video.width);
      var height = (canvas.height = constraints.video.height);
      ctx.drawImage(video, 0, 0, width, height);

      var data = strip(canvas.toDataURL());
      console.log("LEN: " + data.length);
      chrome.runtime.sendMessage(
        "hojhgepgambmlkgingfmmjghlagmkjoj",
        { payload: data },
        res => {
          console.log("RES: " + JSON.stringify(res));
          if (res.payload && !res.error) {
            const input = document.getElementById("mfacode");
            input.value = res.payload;
            // Trigger for Angular
            input.dispatchEvent(new Event("input"));
            const submit = document.getElementById("submitMfa_button");
            submit.click();
          }
        }
      );
    },
    false
  );

  frame.appendChild(button);
  frame.appendChild(video);
  frame.appendChild(canvas);
};
