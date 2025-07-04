import { playEnoPiece } from './tracks/eno';
import {Analyser} from 'tone';

document.getElementById('piano-piece')?.addEventListener('click', async () => {
   drawFeedbackCircle();
    const analyser = await playEnoPiece();
    startVisualizer(analyser);
});

function getCanvasContext(id = 'visualizer') {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const width = canvas.width;
  const height = canvas.height;

  return { canvas, ctx, width, height, centerX: width / 2, centerY: height / 2 };
}

function clearAndFillCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, color = '#000') {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number,
  strokeColor = '255, 255, 255',
  lineWidth = 4
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${strokeColor}, ${opacity.toFixed(2)})`;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}



export function startVisualizer(analyser: Analyser) {
  const context = getCanvasContext();
  if (!context) return;

  const { ctx, width, height, centerX, centerY } = context;

  const MAX_CIRCLES = 50;
  const MIN_AMPLITUDE = 0.03;
  let lastCircleTime = 0;
  const CIRCLE_INTERVAL = 200;

  type Circle = { radius: number; opacity: number; growthRate: number; fadeRate: number };
  const circles: Circle[] = [];

  function draw() {
    requestAnimationFrame(draw);
    const now = Date.now();
    const raw = analyser.getValue() as Float32Array;

    const minDb = -160;
    const maxDb = -30;

    const normalized = raw.map(val => {
      const clamped = Math.max(minDb, Math.min(maxDb, val));
      return (clamped - minDb) / (maxDb - minDb);
    });

    const avgAmplitude = normalized.reduce((acc, val) => acc + val, 0) / normalized.length;
    const scaledAmplitude = Math.min(avgAmplitude, 1);

    if (avgAmplitude > MIN_AMPLITUDE && now - lastCircleTime > CIRCLE_INTERVAL) {
      if (circles.length >= MAX_CIRCLES) {
        circles.shift();
      }

      circles.push({
        radius: 0,
        opacity: 1,
        growthRate: 1 + scaledAmplitude * 10,
        fadeRate: 0.025,
      });

      lastCircleTime = now;
    }

    clearAndFillCanvas(ctx, width, height);

    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      c.radius += c.growthRate;
      c.opacity -= c.fadeRate;

      if (c.opacity <= 0) {
        circles.splice(i, 1);
        continue;
      }

      drawCircle(ctx, centerX, centerY, c.radius, c.opacity, '255, 255, 255', 5);
    }
  }

  draw();
}

export function drawFeedbackCircle() {
  const context = getCanvasContext();
  if (!context) return;

  const { ctx, width, height, centerX, centerY } = context;
  let radius = 0;
  let opacity = 1;

  function animate() {
    clearAndFillCanvas(ctx, width, height);

    drawCircle(ctx, centerX, centerY, radius, opacity);

    radius += 2;
    opacity -= 0.02;

    if (opacity > 0) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  }

  animate();
}
