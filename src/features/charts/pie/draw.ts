
// import type { PieSlice} from "./types";

//  type DrawSeries = {
//    id: string;
//    label: string;
//    color: string;
//    data: PieSlice[];
// };

// type PieSliceRenderModel = PieSlice & {
//   color: string;
//   startAngle: number;
//   endAngle: number;
//   percentage: number;
// };


// export function drawChart(args: {
//   ctx: CanvasRenderingContext2D;
//   width: number;
//   height: number;
// //   geometry: ChartGeometry;
//   series: PieSlice[];
// //   markerSize: number;
// //   markerStyle?: MarkerStyleConfig;
//   hoveredSeriesId?: string | null;
// }) {
//   const {
//     ctx,
//     width,
//     height,
//     // geometry,
//     //series,
//     // markerSize,
//     // markerStyle,
//     //hoveredSeriesId,
//   } = args;


//   clearCanvas(ctx, width, height);
//   drawChartSurface(ctx, width, height);

//   //const safeSeries = Array.isArray(series) ? series : [];

//   //const totSum = safeSeries.reduce((add, obj) => add + obj, 0);



//   /*


//   function plotChart(dataSet) { //, imageMap){

//     let radianPiePice = 0;
//     const totSum = dataSet.reduce((add, obj) => add + obj.SUM, 0); 
    
//     var centerX = c.clientWidth/2;
//     var centerY = c.clientHeight/2;

//     var r = 170*(reponsiveX+reponsiveY)/2; //ungefärligt
//     let colorCount = 0;

//     dataSet.forEach((obj, index) => {
       
//         var ii1 = radianPiePice;
//         var XY1 = (() => ({X: r*Math.cos(ii1)+centerX, Y: r*Math.sin(ii1)+centerY}))(ii1); 

//         radianPiePice += (obj.SUM/totSum)*2*Math.PI;

//         var ii2 = radianPiePice;
//         var XY2 = (() => ({X: r*Math.cos(ii2)+centerX, Y: r*Math.sin(ii2)+centerY}))(ii2); 

//         ctx.beginPath();
//         ctx.moveTo(centerX, centerY); 
//         ctx.arc(centerX, centerY, r, ii1, ii2); 
//         ctx.closePath(); // Connect back to center    
//         ctx.fillStyle = PieColor[colorCount++];    // Fill color "rgba(195, 55, 55, 0.7)";
//         ctx.fill();
//         ctx.strokeStyle = "rgba(155, 155, 155)";
//         ctx.stroke();


//     });
// }

//   for (const currentSeries of safeSeries) {
//     const isDimmed =
//       hoveredSeriesId !== null &&
//       hoveredSeriesId !== currentSeries.id;
  
//     const alpha = isDimmed ? 0.25 : 1;
  
//     ctx.save();
//     ctx.globalAlpha = alpha;
  
//     drawSeriesLine(ctx, currentSeries.data, scale, currentSeries.color);
  
//     for (const point of currentSeries.data) {
//       const x = scale.xToPx(point.X);
//       const y = scale.yToPx(point.Y);
//       const markerColor = getMarkerFill(point.Y, markerStyle);
  
//       drawMarker(
//         ctx,
//         x,
//         y,
//         markerSize,
//         markerColor,
//         currentSeries.markerShape
//       );
//     }
  
//     ctx.restore();
//   }
//   */

// }

// function clearCanvas(
//   ctx: CanvasRenderingContext2D,
//   width: number,
//   height: number
// ) {
//   ctx.clearRect(0, 0, width, height);
// }

// function drawChartSurface(
//   ctx: CanvasRenderingContext2D,
//   width: number,
//   height: number
// ) {
//   ctx.fillStyle = "rgb(243, 243, 243)";
//   ctx.fillRect(0, 0, width, height);
// }

// const PIE_COLORS = [
//   "#60a5fa",
//   "#f59e0b",
//   "#34d399",
//   "#f87171",
//   "#a78bfa",
//   "#f472b6",
//   "#22d3ee",
// ];
// /*
// function buildPieSlices(
//   slices: PieSlice[]
// ): PieSliceRenderModel[] {
//   const total = slices.reduce((sum, slice) => sum + slice.value, 0);

//   let currentAngle = -Math.PI / 2;

//   return slices.map((slice, index) => {
//     const startAngle = currentAngle;
//     const angleSize =
//       total > 0 ? (slice.value / total) * Math.PI * 2 : 0;

//     const endAngle = startAngle + angleSize;
//     currentAngle = endAngle;

//     return {
//       ...slice,
//       color: PIE_COLORS[index % PIE_COLORS.length],
//       startAngle,
//       endAngle,
//       percentage: total > 0 ? slice.value / total : 0,
//     };
//   });
// }
// */