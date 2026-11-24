
import type { Camera3D } from "./camera";
import type { CameraController } from
  "../controllers/CameraController";

import {
  multiplyQuaternion,
  normalizeQuaternion,
  quaternionFromAxisAngle,
} from "../math/quaternion";

export type OrbitControllerOptions = {
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;

  minDistance?: number;
  maxDistance?: number;

  enableInertia?: boolean;
  rotationDamping?: number;
  panDamping?: number;
};

type Velocity2D = {
  x: number;
  y: number;
};

export function createOrbitController(
  canvas: HTMLCanvasElement,
  camera: Camera3D,
  options: OrbitControllerOptions = {}
): CameraController {
  const {
    rotateSpeed = 0.005,
    zoomSpeed = 0.001,
    panSpeed = 1,

    minDistance = 50,
    maxDistance = 2000,

    enableInertia = true,
    rotationDamping = 7,
    panDamping = 9,
  } = options;

  let activePointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let isPanning = false;

  // Hastigheter uttryckta i radianer/sekund
  // respektive världskoordinater/sekund.
  const rotationVelocity: Velocity2D = { x: 0, y: 0 };
  const panVelocity: Velocity2D = { x: 0, y: 0 };

  const previousTouchAction = canvas.style.touchAction;
  canvas.style.touchAction = "none";

  function stopInertia() {
    rotationVelocity.x = 0;
    rotationVelocity.y = 0;
    panVelocity.x = 0;
    panVelocity.y = 0;
  }

  function applyRotation(
    angleX: number,
    angleY: number
  ) {
    const qY = quaternionFromAxisAngle(
      { x: 0, y: 1, z: 0 },
      angleX
    );

    const qX = quaternionFromAxisAngle(
      { x: 1, y: 0, z: 0 },
      angleY
    );

    if (!qX || !qY) return;

    const delta = multiplyQuaternion(qY, qX);

    camera.rotation =
      normalizeQuaternion(
        multiplyQuaternion(delta, camera.rotation)
      ) ?? camera.rotation;
  }

  function getWorldUnitsPerPixel() {
    const height = Math.max(1, canvas.clientHeight);

    return (
      2 *
      camera.distance *
      Math.tan(camera.fov / 2) /
      height
    );
  }

  function applyPan(dx: number, dy: number) {
    camera.target = {
      ...camera.target,
      // Kamerans vy förskjuts motsatt target.
      x: camera.target.x - dx,
      y: camera.target.y + dy,
    };
  }

  function onPointerDown(event: PointerEvent) {
    if (activePointerId !== null) return;

    if (
      event.pointerType === "mouse" &&
      ![0, 1, 2].includes(event.button)
    ) {
      return;
    }

    activePointerId = event.pointerId;

    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;

    isPanning =
      event.button === 1 ||
      event.button === 2 ||
      event.shiftKey;

    stopInertia();

    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;

    const elapsedMs = event.timeStamp - lastTime;

    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;

    if (dx === 0 && dy === 0) return;

    // Använd endast rimliga tidsintervall för
    // hastighetsberäkningen.
    const validSample =
      elapsedMs > 0 && elapsedMs <= 100;

    const dt = validSample
      ? Math.max(elapsedMs / 1000, 0.008)
      : 0;

    if (isPanning) {
      const scale =
        getWorldUnitsPerPixel() * panSpeed;

      const worldDx = dx * scale;
      const worldDy = dy * scale;

      applyPan(worldDx, worldDy);

      if (enableInertia) {
        panVelocity.x = dt ? worldDx / dt : 0;
        panVelocity.y = dt ? worldDy / dt : 0;
      }

      return;
    }

    const angleX = dx * rotateSpeed;
    const angleY = dy * rotateSpeed;

    applyRotation(angleX, angleY);

    if (enableInertia) {
      rotationVelocity.x = dt ? angleX / dt : 0;
      rotationVelocity.y = dt ? angleY / dt : 0;
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;

    // Undvik fortsatt rotation efter att
    // användaren har hållit musen stilla.
    if (event.timeStamp - lastTime > 80) {
      stopInertia();
    }

    activePointerId = null;
    isPanning = false;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function onPointerCancel(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return;

    stopInertia();
    onPointerUp(event);
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();

    const delta =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * canvas.clientHeight
          : event.deltaY;

    const zoomFactor = Math.exp(
      Math.max(-50, Math.min(50, delta)) *
      zoomSpeed
    );

    camera.distance = Math.max(
      minDistance,
      Math.min(
        maxDistance,
        camera.distance * zoomFactor
      )
    );
  }

  function onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  canvas.addEventListener(
    "pointerdown", onPointerDown
  );
  canvas.addEventListener(
    "pointermove", onPointerMove
  );
  canvas.addEventListener(
    "pointerup", onPointerUp
  );
  canvas.addEventListener(
    "pointercancel", onPointerCancel
  );
  canvas.addEventListener("wheel", onWheel, {
    passive: false,
  });
  canvas.addEventListener(
    "contextmenu", onContextMenu
  );

  return {
    update(deltaTime: number) {
      if (!enableInertia || activePointerId !== null) {
        return;
      }

      const dt = Math.max(0, Math.min(deltaTime, 0.05));

      // Exakt integrering av exponentiellt
      // avtagande hastighet under bildrutan.
      const rotationDecay = Math.exp(
        -rotationDamping * dt
      );

      const panDecay = Math.exp(
        -panDamping * dt
      );

      const rotationFactor =
        rotationDamping > 0
          ? (1 - rotationDecay) / rotationDamping
          : dt;

      const panFactor =
        panDamping > 0
          ? (1 - panDecay) / panDamping
          : dt;

      const angleX =
        rotationVelocity.x * rotationFactor;
      const angleY =
        rotationVelocity.y * rotationFactor;

      if (angleX !== 0 || angleY !== 0) {
        applyRotation(angleX, angleY);
      }

      const panDx = panVelocity.x * panFactor;
      const panDy = panVelocity.y * panFactor;

      if (panDx !== 0 || panDy !== 0) {
        applyPan(panDx, panDy);
      }

      rotationVelocity.x *= rotationDecay;
      rotationVelocity.y *= rotationDecay;

      panVelocity.x *= panDecay;
      panVelocity.y *= panDecay;

      // Stoppa mycket små hastigheter.
      if (
        Math.hypot(
          rotationVelocity.x,
          rotationVelocity.y
        ) < 0.001
      ) {
        rotationVelocity.x = 0;
        rotationVelocity.y = 0;
      }

      if (
        Math.hypot(
          panVelocity.x,
          panVelocity.y
        ) < 0.01
      ) {
        panVelocity.x = 0;
        panVelocity.y = 0;
      }
    },

    dispose() {
      stopInertia();

      canvas.removeEventListener(
        "pointerdown", onPointerDown
      );
      canvas.removeEventListener(
        "pointermove", onPointerMove
      );
      canvas.removeEventListener(
        "pointerup", onPointerUp
      );
      canvas.removeEventListener(
        "pointercancel", onPointerCancel
      );
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener(
        "contextmenu", onContextMenu
      );

      if (
        activePointerId !== null &&
        canvas.hasPointerCapture(activePointerId)
      ) {
        canvas.releasePointerCapture(activePointerId);
      }

      canvas.style.touchAction = previousTouchAction;
    },
  };
}
