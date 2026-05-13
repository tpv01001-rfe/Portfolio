import type { RefObject } from "react";
import { createCurve } from "../math/curveFactory";
import { buildCurveConfig } from "../math/curveConfig";
import type { CurveType } from "../model/curveTypes";
import { drawRollingCircle } from "./canvasPrimitives";


type CycloidWorldGeometryArgs = {
  curveType: "cycloid" | "epicycloid" | "hypocycloid";
  radius: number;
  radiusMin: number;
  radiusMax: number;
};

export function getCycloidWorldGeometry(args: CycloidWorldGeometryArgs) {
  const { curveType, radius, radiusMin, radiusMax } = args;

  const isCycloid = curveType === "cycloid";
  const isEpicycloid = curveType === "epicycloid";
  const isHypocycloid = curveType === "hypocycloid";

  const h = isCycloid ? 100 : 0;
  const margin = 0;

  let r = radius;
  let R = 80;

  if (isEpicycloid) {
    const availableRadius = 110;
    const minFixedRadius = 20;

    const maxRollingRadius = Math.max(
      0,
      (availableRadius - minFixedRadius) / 2
    );

    //skala stor och liten radie gentemot varandra
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
    R = 100;
    r = Math.min(radius, R);
  }

  return {
    h,
    margin,
    O: { X: 0, Y: 0 },
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
  geometry: ReturnType<typeof getCycloidWorldGeometry>;
  cycloidSpeedRef: RefObject<number>;
  positionRef: RefObject<number>;
  tRef: RefObject<number>;
};

//TODO: Rensa bort rester efter flytt från screen- till world-koordinater
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
  const { O, r, R } = geometry;
  const isCycloid = curveType === "cycloid";
  const smoothingValue = 20;

  const cycloidWorld = {
    groundY: 75,
    startX: -300,
    endX: 300,
    translate: 200
  };

  const config = buildCurveConfig({
    curveType,
    radius: r,
    R,
  });

  const curve = createCurve(config);

  if (isCycloid) {
    //setupCycloid(ctx, groundInWorld, width - translateCycloid, -translateCycloid);
    setupCycloid(ctx, cycloidWorld.groundY, cycloidWorld.startX, cycloidWorld.endX);
  } else {
    //setupEpiAndHypoCycloid(ctx, 0, width-cycloidWorld.translate, O, R, cycloidWorld.translate);
    setupEpiAndHypoCycloid(ctx, R);
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
    ctx.moveTo(firstPoint.x - cycloidWorld.translate, cycloidWorld.groundY - firstPoint.y);
  } else {
    ctx.moveTo(O.X + firstPoint.x, O.Y + firstPoint.y);
  }

  for (let i = start; dir > 0 ? i < end : i > end; i += dir) {
    const td = i / smoothingValue;
    const p = curve.getPoint(td);

    if (isCycloid) {
      ctx.lineTo(p.x - cycloidWorld.translate, cycloidWorld.groundY - p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  const finalP = curve.getPoint(end / smoothingValue);
  const xstop = isCycloid ? finalP.x - cycloidWorld.translate : O.X + finalP.x;
  const ystop = isCycloid ? cycloidWorld.groundY - finalP.y : O.Y + finalP.y;

  ctx.lineTo(xstop, ystop);
  ctx.stroke();

  let rX: number;
  let rY: number;

  if (isCycloid) {
    rX = r * (positionRef.current / smoothingValue) - cycloidWorld.translate;
    rY = cycloidWorld.groundY - r;//rY h - r;
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
  groundY: number,
  startX: number,
  endX: number
) {
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.moveTo(startX, groundY);
  ctx.lineTo(endX, groundY);
  ctx.stroke();
}

//setupEpiAndHypoCycloid(ctx, cycloidWorld.startX, R, cycloidWorld.translate);
function setupEpiAndHypoCycloid(
  ctx: CanvasRenderingContext2D,
  //h: number,
  // w: number,
  //O: { X: number; Y: number },
  R: number,
  // translate: number
) {

  //Axlarna
  ctx.beginPath();
  ctx.strokeStyle = "#413d3d";
  ctx.moveTo(-130, 0);
  ctx.lineTo(130, 0);

  ctx.moveTo(0, -130);
  ctx.lineTo(0, 130);
  ctx.stroke();

  //storcirkeln
  ctx.beginPath();
  ctx.strokeStyle = "#c3c3c3";
  ctx.arc(0, 0, R, 0, 2 * Math.PI);
  //ctx.arc(O.X, O.Y, R, 0, 2 * Math.PI);
  ctx.stroke();
}


