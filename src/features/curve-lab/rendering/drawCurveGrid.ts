export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;

  const spacing = 40;
  const worldXStop = width/2;
  const worldXStart = -worldXStop;
  const worldYStop = height/2;
  const worldYStart = -worldYStop;

  for (let x = worldXStart; x <= worldXStop; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, worldYStart);
    ctx.lineTo(x, worldYStop);
    ctx.stroke();
  }

  for (let y = worldYStart; y <= worldYStop; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(worldXStart, y);
    ctx.lineTo(worldXStop, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";

  ctx.beginPath();
  ctx.moveTo(worldXStop, worldYStart);
  ctx.lineTo(worldXStop, worldYStop);
  ctx.stroke();

  /* verkar inte behövas */
  // ctx.beginPath();
  // ctx.moveTo(0, height / 2);
  // ctx.lineTo(width, height / 2);
  // ctx.stroke();

  ctx.restore();
}
