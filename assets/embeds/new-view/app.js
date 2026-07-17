(function () {
  "use strict";

  var MODEL_URL = "models/Config_ID00005.jt";
  var MODEL_NAME = "Config_ID00005.jt";
  var LICENSE_KEY = "jDtHeJ6P5hHT572SGTPTFDz9NKxVdPXUSVCW83c5sO9UDDsZEqXxJg8UZED3eYQ0VZk3DnEed7o0vCnxRpt8zZsSsLqA8HtjsfWRez7Sgi/iCbamQML7rANxA0ehEc+9";

  var host = document.getElementById("viewer-host");
  var loadingPanel = document.getElementById("loading-panel");
  var loadingLabel = document.getElementById("loading-label");
  var statusState = document.getElementById("status-state");
  var statusMessage = document.getElementById("status-message");
  var fitButton = document.getElementById("fit-view");
  var frontButton = document.getElementById("front-view");
  var isoButton = document.getElementById("iso-view");
  var edgeButton = document.getElementById("edge-view");

  var control = null;
  var viewer = null;
  var rootModelId = null;
  var edgesVisible = false;

  function setStatus(state, label, message) {
    statusState.dataset.state = state;
    statusState.textContent = label;
    statusMessage.textContent = message;
    loadingLabel.textContent = message;
  }

  function setCameraButton(activeButton) {
    [frontButton, isoButton].forEach(function (button) {
      button.classList.toggle("is-active", button === activeButton);
    });
  }

  function safely(action) {
    if (!viewer) return;
    try {
      action();
    } catch (error) {
      console.warn("[NewView] Viewer command failed", error);
    }
  }

  function fitModel() {
    safely(function () { viewer.fitToModel(); });
  }

  function showFront() {
    safely(function () {
      viewer.setStandardView(PLMVisWeb.StandardView.FRONT);
      setCameraButton(frontButton);
    });
  }

  function showIso() {
    safely(function () {
      viewer.setStandardView(PLMVisWeb.StandardView.ISOMETRIC);
      setCameraButton(isoButton);
    });
  }

  function toggleEdges() {
    if (!viewer || !rootModelId) return;
    edgesVisible = !edgesVisible;
    safely(function () {
      viewer.setFaceWireframeVisibilityByPsId(rootModelId, edgesVisible, 0x47d8cd);
      edgeButton.setAttribute("aria-pressed", String(edgesVisible));
    });
  }

  async function bundledModelFile() {
    var response = await fetch(MODEL_URL);
    if (!response.ok) {
      throw new Error("Model request returned " + response.status);
    }
    var blob = await response.blob();
    return new File([blob], MODEL_NAME, { type: "application/octet-stream" });
  }

  function openModel(file) {
    setStatus("loading", "Loading", "Parsing JT geometry…");

    viewer.open({ modelName: MODEL_NAME, url: file }, function (success, rootPartId) {
      if (!success) {
        setStatus("error", "Error", "JT geometry could not be opened");
        loadingPanel.classList.add("is-hidden");
        return;
      }

      rootModelId = rootPartId;
      try {
        viewer.setVisibilityByPsId(rootPartId, true, function () {
          showIso();
          window.setTimeout(fitModel, 120);
        });
      } catch (error) {
        console.warn("[NewView] Visibility update failed", error);
        showIso();
        window.setTimeout(fitModel, 120);
      }

      setStatus("ready", "Ready", "Real JT geometry · drag to orbit");
      loadingPanel.classList.add("is-hidden");
      document.documentElement.dataset.viewerReady = "true";
    });
  }

  async function initialize() {
    try {
      if (typeof PLMVisWeb === "undefined" || typeof JTReader === "undefined") {
        throw new Error("Viewer libraries are unavailable");
      }

      PLMVisWeb.setLicenseKey(LICENSE_KEY);
      control = new PLMVisWeb.Control({
        host: host,
        showNavigationCube: true,
        showCoordinateSystem: true,
        loader: new JTReader.PlmVisLoader()
      });
      viewer = control.viewer;

      setStatus("loading", "Loading", "Reading bundled JT model…");
      openModel(await bundledModelFile());
    } catch (error) {
      console.error("[NewView] Initialization failed", error);
      setStatus("error", "Error", error.message || "Viewer initialization failed");
      loadingLabel.textContent = "Unable to initialize the JT viewer";
      document.documentElement.dataset.viewerReady = "error";
    }
  }

  fitButton.addEventListener("click", fitModel);
  frontButton.addEventListener("click", showFront);
  isoButton.addEventListener("click", showIso);
  edgeButton.addEventListener("click", toggleEdges);

  initialize();
})();
