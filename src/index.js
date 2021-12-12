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
  ActionManager,
  Mesh,
  MeshBuilder,
  StateCondition,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/Grid";
import "./styles.scss";
// import { rotate } from "./actions";
import { createSuperEllipsoid } from "./superEllipsoid";

const ellipsoidData = [
  {
    position: [-2.5, 0, 0],
    rotation: [0, 13.27, 0],
    diffuseColor: [0, 0, 1],
    ambientColor: [0, 0, 0.2],
  },

  {
    position: [0, 0, 5],
    rotation: [0, 21.7, 0],
    diffuseColor: [0, 1, 0],
    ambientColor: [0, 0.1, 0],
  },
  {
    position: [2.5, 0, 0],
    rotation: [0, -28.29, 0],
    diffuseColor: [1, 0, 0],
    ambientColor: [0.2, 0, 0],
  },
];
const createEllipsoidData = {
  samples: 48,
  n1: 0.2,
  n2: 0.2,
  scalex: 0.45,
  scaley: 0.45,
  scalez: 0.45,
};

// Get canvas
const canvas = document.querySelector("canvas");

// Init Babylon
const engine = new Engine(canvas, true);
const scene = new Scene(engine);
// scene.actionManager = new ActionManager(scene); // TODO: move to actions?
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
const lineColor = new Color3(0.98, 0.98, 0.98);

// Sphere
var whiteMat = new StandardMaterial("mat-white", scene);
whiteMat.diffuseColor = new Color3(0.95, 0.95, 0.95);
whiteMat.ambientColor = new Color3(0.35, 0.35, 0.35);
const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
sphere.material = whiteMat;
sphere.position = new Vector3(0, 0, -1);

// Create ellipsoids
// Not sure if there are performance implications about putting these into an array? (I'm new to Babylonjs)
const ellipsoids = ellipsoidData.map(
  ({ position, rotation, diffuseColor, ambientColor }, i) => {
    const ellipsoid = createSuperEllipsoid({
      ...createEllipsoidData,
      scene,
    });
    const mat = new StandardMaterial(`mat-ellipsoid-${i}`, scene);
    mat.diffuseColor = new Color3(...diffuseColor);
    mat.ambientColor = new Color3(...ambientColor);
    mat.backFaceCulling = false;
    ellipsoid.material = mat;
    ellipsoid.rotation = new Vector3(...rotation);
    ellipsoid.position = new Vector3(...position);
    ellipsoid.state = "default";
    // ellipsoid.state = "default"; // 'white' or 'rotate'
    // Conditions
    // ellipsoid.actionManager = new ActionManager(scene);
    // const conditionDefault = new StateCondition(
    //   ellipsoid.actionManager,
    //   whiteMat,
    //   "default"
    // );
    // const conditionHit = new StateCondition(
    //   ellipsoid.actionManager,
    //   light1,
    //   "white"
    // );
    // const conditionHover = new StateCondition(
    //   ellipsoid.actionManager,
    //   rotate(scene, ellipsoid),
    //   "rotate"
    // );
    return ellipsoid;
  }
);

// Ground
const ground = Mesh.CreateGround("ground", 100, 100, 2, scene);
ground.position = new Vector3(0, -1, 0);
const gridMat = new GridMaterial("gridMat", scene);
gridMat.mainColor = bg;
gridMat.lineColor = lineColor;
ground.material = gridMat;
ground.material.majorUnitFrequency = 1;
ground.material.minorUnitVisibility = 0;
ground.material.gridOffset = new Vector3(0.5, 0, 0);

const boxes = document.getElementsByClassName("box");
for (let i = 0, len = boxes.length; i < len; i++) {
  // boxes[i].addEventListener("pointerenter", (e) => {
  //   const state = ellipsoids[i].state;
  //   if (state === "default") {
  //     ellipsoids[i].state = "rotate";
  //     rotate(scene, ellipsoids[i]);
  //   }
  // });
  // boxes[i].addEventListener("pointerleave", (e) => {
  //   const state = ellipsoids[i].state;
  //   if (state === "rotate") {
  //     ellipsoids[i].state = "default";
  //     scene.actionManager.actions.pop(); // For now assuming that it is the last action in the list
  //   }
  // });
}

// Hide/show the Inspector
// Shift+Ctrl+Alt+I
window.addEventListener("keydown", (e) => {
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
let firstRender = false;
engine.runRenderLoop(() => {
  scene.render();
  if (!firstRender) {
    console.log("first render");
    firstRender = true;
    document.querySelector(".toolbar").classList.add("enter");
  }
});
