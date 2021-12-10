import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder
} from "@babylonjs/core";
import "./styles.css";

class App {
  constructor() {
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    document.body.appendChild(canvas);

    // Initialize babylon scene and engine
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      Vector3.Zero(),
      scene
    );

    camera.attachControl(canvas, true);
    const light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

    // Hide/show the Inspector
    window.addEventListener("keydown", (e) => {
      // Shift+Ctrl+Alt+I
      if (e.shiftKey && e.ctrlKey && e.altKey && e.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
