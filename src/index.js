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
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import "./styles.scss";
import { rotate } from "./actions";
import { createSuperEllipsoid } from "./superEllipsoid";
import { ellipsoidData, createEllipsoidData } from "./constants";

// TODO
// - Add shadows
// - Wrap in app or anonymous function possibly
// - On window resize without distortion
// - Look into whether or not to use state on meshes or just to create another object to track

// Get canvas
const canvas = document.querySelector("canvas");

// Init Babylon
const engine = new Engine(canvas, true);

// Scene
const scene = new Scene(engine);
scene.actionManager = new ActionManager(scene);
scene.ambientColor = new Color3(1, 1, 1);
scene.clearColor = new Color3(0.93, 0.93, 0.93);

// Camera
const camera = new FreeCamera("camera1", new Vector3(0, 1.36, -7), scene);
camera.rotation = new Vector3(9.3, 0.5, 0);
camera.target = new Vector3(0, 1.2, -6);
camera.attachControl(canvas, true);
camera.invertRotation = true; // More natural for novices like me :)

// Light
const light = new HemisphericLight("light1", new Vector3(3, 5, 1), scene);
light.intensity = 0.6;
light.groundColor = new Color3(0.25, 0.25, 0.25);

// Gridded Ground
const ground = Mesh.CreateGround("ground", 100, 100, 2, scene);
ground.position = new Vector3(0, -1, 0);
const gridMat = new GridMaterial("gridMat", scene);
gridMat.mainColor = new Color3(0.93, 0.93, 0.93);
gridMat.lineColor = new Color3(0.96, 0.96, 0.96);
ground.material = gridMat;
ground.material.majorUnitFrequency = 1;
ground.material.minorUnitVisibility = 0;
ground.material.gridOffset = new Vector3(0.5, 0, 0);

// White material (sphere + cubes after hitting)
var whiteMat = new StandardMaterial("mat-white", scene);
whiteMat.diffuseColor = new Color3(0.95, 0.95, 0.95);
whiteMat.ambientColor = new Color3(0.35, 0.35, 0.35);
whiteMat.backFaceCulling = false;

// Sphere
const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
sphere.material = whiteMat;
sphere.position = new Vector3(0, 0, -1);
sphere.state = null; // Indicating not moving, either null, 0, 1, 2

// Ellipsoids
// *Not sure if there are performance implications by putting these into an array? ie Garbage Collection etc
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
    ellipsoid.state = "default"; // Using this as just a prop... "default", "rotate", "active", "done"
    return ellipsoid;
  }
);

// Toolbar events
// TODO: double check perf with putting elems into a var... another way to add less event listeners
let angle; // Need this for later... angle towards next ellipsoid
const boxes = document.getElementsByClassName("box");
const toolbarBoxesLength = boxes.length;
for (let i = 0; i < toolbarBoxesLength; i++) {
  // Hover rotate
  boxes[i].addEventListener("pointerenter", (e) => {
    const state = ellipsoids[i].state;
    if (state === "default") {
      ellipsoids[i].state = "rotate";
      rotate(scene, ellipsoids[i]);
    }
  });
  // Stop rotate (hover off)
  boxes[i].addEventListener("pointerleave", (e) => {
    const state = ellipsoids[i].state;
    if (state === "rotate") {
      // only stop rotate if from rotate state... not from "active" state
      ellipsoids[i].state = "default";
      scene.actionManager.actions.pop(); // For now assuming last action
    }
  });
  // Click to move to ellipsoid
  boxes[i].addEventListener("click", (e) => {
    ellipsoids[i].state = "active";
    sphere.state = i; // moving towards this box, otherwise null
    const diffX = ellipsoids[i].position.x - sphere.position.x;
    const diffZ = ellipsoids[i].position.z - sphere.position.z;
    angle = Math.atan2(diffX, diffZ);
    for (let j = 0; j < toolbarBoxesLength; j++) {
      if (i === j) boxes[i].classList.add("active");
      else boxes[j].classList.add("inactive");
    }
    canvas.classList.add("pointer-events-none");
  });
}

// Quick and dirty way to reset... probably better to remove classes and reset positions.
document.querySelector(".reset").addEventListener("click", () => {
  window.location.reload();
});
document.querySelector(".restart").addEventListener("click", () => {
  window.location.reload();
});

scene.registerBeforeRender(function () {
  const ellipIndex = sphere.state;
  if (ellipIndex !== null) {
    // Collided
    if (sphere.intersectsMesh(ellipsoids[ellipIndex], true)) {
      // Change to white
      ellipsoids[ellipIndex].material = whiteMat;
      ellipsoids[ellipIndex].state = "done";
      sphere.state = null;
      // Stop movement
      scene.actionManager.actions.pop(); // For now assuming last action
      // Allow for canvas interactions
      canvas.classList.remove("pointer-events-none");
      // Remove toolbar active/inactive classes
      for (let i = 0; i < toolbarBoxesLength; i++) {
        boxes[i].classList.remove("active");
        boxes[i].classList.remove("inactive");
      }
      // Show restart button if all boxes have been hit or "done"
      boxes[ellipIndex].classList.add("done");
      if (ellipsoids.every(({ state }) => state === "done")) {
        document.querySelector(".restart").classList.add("enter");
      }
      return; // Don't move sphere any further
    }
    // Move toward the correct sphere
    sphere.position.x += 0.023 * Math.sin(angle);
    sphere.position.z += 0.023 * Math.cos(angle);
  }
});

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

// Run the main render loop
let firstRender = false;
engine.runRenderLoop(() => {
  scene.render();
  // Animate-in toolbar after canvas is painted for the first time
  if (!firstRender) {
    firstRender = true;
    document.querySelector(".toolbar").classList.add("enter");
    document.querySelector(".reset").classList.add("enter");
  }
});
