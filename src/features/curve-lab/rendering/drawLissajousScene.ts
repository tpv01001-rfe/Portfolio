import type { RefObject } from "react";
import { createCurve } from "../math/curveFactory";
import { buildCurveConfig } from "../math/curveConfig";
import { gcd } from "../../../shared/math/mathHelpers";
import type { LissajousParams } from "../model/curveParams";
import type { CurveType } from "../model/curveTypes";
import { drawGrid } from "./drawCurveGrid";

export type LissajousSceneArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  deltaTime: number;
  curveType: CurveType;
  drawFullRef: RefObject<boolean>;
  speedRef: RefObject<number>;
  paramsRef: RefObject<LissajousParams>;
  progressRef: RefObject<number>;
};

export function drawLissajousScene({
  ctx,
  width,
  height,
  deltaTime,
  curveType,
  drawFullRef,
  speedRef,
  paramsRef,
  progressRef,
}: LissajousSceneArgs) {
  const smoothingValue = 50;

  drawGrid(ctx, width, height);

  const config = buildCurveConfig({
    curveType,
    radius: 0,
    R: 0,
    lissajous: paramsRef.current,
  });

  const curve = createCurve(config);

  const divisor = gcd(paramsRef.current.a, paramsRef.current.b);
  const tMax = (2 * Math.PI) / divisor;

  let currentT = 0;

  if (drawFullRef.current) {
    currentT = tMax;
  } else {
    const moveStep = speedRef.current * deltaTime / 2;

    if (progressRef.current < tMax) {
      progressRef.current += moveStep;
    }

    if (progressRef.current > tMax) {
      progressRef.current = tMax;
    }

    currentT = progressRef.current;
  }

  const endStep = Math.ceil(currentT * smoothingValue);

const paddingX = 32;
const paddingY = 32;

const drawLeft = paddingX;
const drawTop = paddingY;
const drawWidth = Math.max(1, width - paddingX * 2);
const drawHeight = Math.max(1, height - paddingY * 2);

const maxAmplitudeX = 190;
const maxAmplitudeY = 190;

const worldMinX = -maxAmplitudeX;
const worldMaxX = maxAmplitudeX;
const worldMinY = -maxAmplitudeY;
const worldMaxY = maxAmplitudeY;

const scaleX = drawWidth / (worldMaxX - worldMinX);
const scaleY = drawHeight / (worldMaxY - worldMinY);

const offsetX = drawLeft;
const offsetY = drawTop;

  ctx.beginPath();
  ctx.strokeStyle = "#4de3c3";

  // let lastX = 0;
  // let lastY = 0;

  for (let i = 0; i <= endStep; i++) {
    const t = i / smoothingValue;
    const p = curve.getPoint(t);

    const x = offsetX + (p.x - worldMinX) * scaleX;
    const y = offsetY + (worldMaxY - p.y) * scaleY;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    // lastX = x;
    // lastY = y;
  }

  ctx.stroke();

  //drawProbe(ctx, lastX, lastY, "#4de3c3");
}
