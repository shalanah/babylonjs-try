import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  FreeCamera,
  Color3,
  Vector3,
  StandardMaterial,
  HemisphericLight,
  Mesh,
  MeshBuilder,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/Grid";
import "./styles.scss";
import { createSuperEllipsoid } from "./bevelUtils";

const cubeData = [
  { position: [3, 0, 0] },
  { position: [0, 0, 5] },
  { position: [-3, 0, 0] },
];

// Get canvas
const canvas = document.querySelector("canvas");

// Init Babylon
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
scene.ambientColor = new Color3(1, 1, 1);
scene.clearColor = bg;
const camera = new FreeCamera("camera1", new Vector3(0, 1.36, -7), scene);
camera.rotation = new Vector3(9.3, 0.5, 0);
camera.target = new Vector3(0, 1.2, -6);
camera.attachControl(canvas, true);
camera.invertRotation = true; // More natural for novices like me :)
const light = new HemisphericLight("light1", new Vector3(3, 5, 1), scene);
light.intensity = 0.6;
light.groundColor = new Color3(0.25, 0.25, 0.25);

// Colors
const bg = new Color3(0.93, 0.93, 0.93);
const lineColor = new Color3(0.89, 0.89, 0.89);

// Materials
var redMat = new StandardMaterial("redMat", scene);
redMat.diffuseColor = new Color3(1, 0, 0);
redMat.ambientColor = new Color3(0.3, 0, 0);
var whiteMat = new StandardMaterial("whiteMat", scene);
whiteMat.diffuseColor = new Color3(0.95, 0.95, 0.95);
whiteMat.ambientColor = new Color3(0.35, 0.35, 0.35);

// Sphere
const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
sphere.material = whiteMat;
sphere.position = new Vector3(0, 0, -0.25);

// Do in a loop?

const cube1 = MeshBuilder.CreateBox("box-1", { size: 0.85 });
const cube2 = MeshBuilder.CreateBox("box-2", { size: 0.85 });
cube1.position = new Vector3(3, 0, 0);
cube2.position = new Vector3(0, 0, 5);
cube2.rotation = new Vector3(0, 21.7, 0);
cube1.rotation = new Vector3(0, -28.29, 0);
cube1.material = redMat;

var mat2 = new StandardMaterial("mat2", scene);
mat2.diffuseColor = Color3.Red();
mat2.ambientColor = new Color3(0.1, 0, 0);
mat2.backFaceCulling = false;
const superello = createSuperEllipsoid(48, 0.2, 0.2, 0.45, 0.45, 0.45, scene);
superello.material = mat2;
superello.rotation = new Vector3(0, 13.27, 0);
superello.position = new Vector3(-2.5, 0, 0);

// Grid
const ground = Mesh.CreateGround("ground", 100, 100, 2, scene);
ground.position = new Vector3(0, -1, 0);
const gridMat = new GridMaterial("gridMat", scene);
gridMat.mainColor = bg;
gridMat.lineColor = lineColor;
ground.material = gridMat;
ground.material.majorUnitFrequency = 1;
ground.material.minorUnitVisibility = 0;
ground.material.gridOffset = new Vector3(0.5, 0, 0);

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

// TODO: on window resize also rerender? Window gets distorted.
// Run the main render loop
engine.runRenderLoop(() => {
  scene.render();
});
