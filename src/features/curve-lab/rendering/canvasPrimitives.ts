import { hexToRgba } from "../../../shared/math/mathHelpers";

export function drawRollingCircle(
  ctx: CanvasRenderingContext2D,
  xstop: number,
  ystop: number,
  rX: number,
  rY: number,
  r: number
) {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(xstop, ystop, 2, 0, 2 * Math.PI);
  ctx.arc(rX, rY, 2, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#14ad4e";
  ctx.arc(rX, rY, r, 0, 2 * Math.PI);
  ctx.moveTo(xstop, ystop);
  ctx.lineTo(rX, rY);
  ctx.stroke();
}



export function drawProbe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accentColor: string
) {
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = hexToRgba(accentColor, 0.22);
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = accentColor;
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#f8fdff";
  ctx.arc(x, y, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}