import type { RefObject } from "react";
import { createCurve } from "../math/curveFactory";
import { buildCurveConfig } from "../math/curveConfig";
import type { CurveType } from "../model/curveTypes";
import { drawRollingCircle } from "./canvasPrimitives";

type CycloidGeometryArgs = {
  curveType: CurveType;
  width: number;
  height: number;
  initialWidth: number;
  initialHeight: number;
  radius: number;
  lineMargin: number;
  radiusMin: number;
  radiusMax: number;
};

export function getResponsiveCycloidGeometry(args: CycloidGeometryArgs) {
  const {
    curveType,
    width,
    height,
    initialWidth,
    initialHeight,
    radius,
    lineMargin,
    radiusMin,
    radiusMax,
  } = args;

  const isCycloid = curveType === "cycloid";
  const isEpicycloid = curveType === "epicycloid";
  const isHypocycloid = curveType === "hypocycloid";

  const h = isCycloid ? height - lineMargin : height / 2;
  const margin = isCycloid ? 0 : isEpicycloid ? 20 : 15;

  const scaleX = width / initialWidth;
  const scaleY = height / initialHeight;
  const uniformScale = Math.min(scaleX, scaleY);

  let r = radius * uniformScale;
  let R = h - margin;

  if (isEpicycloid) {
    const availableRadius = h - margin;
    const minFixedRadius = 10;

    const maxRollingRadius = Math.max(
      0,
      (availableRadius - minFixedRadius) / 2
    );

    const radiusRange = radiusMax - radiusMin;
    const radiusRatio =
      radiusRange > 0
        ? Math.min(1, Math.max(0, (radius - radiusMin) / radiusRange))
        : 0;

    r = radiusRatio * maxRollingRadius;
    R = availableRadius - 2 * r;

    if (R < minFixedRadius) {
      R = minFixedRadius;
    }
  }

  if (isHypocycloid) {
    const availableRadius = h - margin;
    R = Math.min(R, availableRadius);
    r = Math.min(r, R);
  }

  return {
    h,
    margin,
    O: { X: width / 2, Y: h },
    r,
    R,
  };
}

export type CycloidSceneArgs = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  deltaTime: number;
  curveType: CurveType;
  geometry: ReturnType<typeof getResponsiveCycloidGeometry>;
  cycloidSpeedRef: RefObject<number>;
  positionRef: RefObject<number>;
  tRef: RefObject<number>;
};

export function drawCycloidScene({
  ctx,
  width,
  deltaTime,
  curveType,
  geometry,
  cycloidSpeedRef,
  positionRef,
  tRef,
}: CycloidSceneArgs) {
  const { h, O, r, R } = geometry;
  const isCycloid = curveType === "cycloid";
  const smoothingValue = 20;

  const config = buildCurveConfig({
    curveType,
    radius: r,
    R,
  });

  const curve = createCurve(config);

  if (isCycloid) {
    setupCycloid(ctx, h, width);
  } else {
    setupEpiAndHypoCycloid(ctx, h, width, O, R);
  }

  const moveStep = cycloidSpeedRef.current * deltaTime * 60;

  if (isCycloid) {
    positionRef.current += moveStep;
  } else {
    tRef.current -= moveStep;
  }

  ctx.beginPath();
  ctx.strokeStyle = "#e398ff";

  const start = 0;
  const end = isCycloid ? positionRef.current : tRef.current;
  const dir = end >= start ? 1 : -1;

  const firstT = start / smoothingValue;
  const firstPoint = curve.getPoint(firstT);

  if (isCycloid) {
    ctx.moveTo(firstPoint.x, h - firstPoint.y);
  } else {
    ctx.moveTo(O.X + firstPoint.x, O.Y + firstPoint.y);
  }

  for (let i = start; dir > 0 ? i < end : i > end; i += dir) {
    const td = i / smoothingValue;
    const p = curve.getPoint(td);

    if (isCycloid) {
      ctx.lineTo(p.x, h - p.y);
    } else {
      ctx.lineTo(O.X + p.x, O.Y + p.y);
    }
  }

  const finalP = curve.getPoint(end / smoothingValue);
  const xstop = isCycloid ? finalP.x : O.X + finalP.x;
  const ystop = isCycloid ? h - finalP.y : O.Y + finalP.y;

  ctx.lineTo(xstop, ystop);
  ctx.stroke();

  let rX: number;
  let rY: number;

  if (isCycloid) {
    rX = r * (positionRef.current / smoothingValue);
    rY = h - r;
  } else {
    const centerP = curve.getCenter(end / smoothingValue);
    rX = O.X + centerP.x;
    rY = O.Y + centerP.y;
  }

  drawRollingCircle(ctx, xstop, ystop, rX, rY, r);

  if (isCycloid && r * (positionRef.current / smoothingValue) > width + r) {
    positionRef.current = 0;
  }
}

function setupCycloid(
  ctx: CanvasRenderingContext2D,
  h: number,
  w: number
) {
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.stroke();
}

function setupEpiAndHypoCycloid(
  ctx: CanvasRenderingContext2D,
  h: number,
  w: number,
  O: { X: number; Y: number },
  R: number
) {
  ctx.beginPath();
  ctx.strokeStyle = "#413d3d";;
  ctx.moveTo(0, h);
  ctx.lineTo(w, h);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#c3c3c3";
  ctx.arc(O.X, O.Y, R, 0, 2 * Math.PI);
  ctx.stroke();
}


