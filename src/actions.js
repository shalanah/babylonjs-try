import { ActionManager, IncrementValueAction } from "@babylonjs/core";

export const rotate = (scene, mesh) => {
  scene.actionManager.registerAction(
    new IncrementValueAction(
      ActionManager.OnEveryFrameTrigger,
      mesh,
      "rotation.y",
      0.01
    )
  );
};
