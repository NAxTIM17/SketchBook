import "./index.css";
import { LazyBrush } from "lazy-brush";
import { Pencil, Eraser, PenLine, Hand } from "lucide-react";

import { useRef, useEffect, useMemo, useState } from "react";

function App() {
  const LAZY_RADIUS = 60;
  const BRUSH_RADIUS = 5;
  const isDrawingRef = useRef(false);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const canvasContainerRef = useRef();

  const canvasRef = useRef();

  const lazy = useMemo(() => {
    return new LazyBrush({
      enabled: true,
      radius: LAZY_RADIUS,
      initialPoint: {
        x: 0,
        y: 0,
      },
    });
  }, [LAZY_RADIUS]);

  const lazyFriction = useMemo(() => {
    return new LazyBrush({
      enabled: true,
      radius: LAZY_RADIUS,
      initialPoint: {
        x: 0,
        y: 0,
      },
    });
  }, [LAZY_RADIUS]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    const { width, height } = window.getComputedStyle(canvasContainer);

    canvas.width = parseInt(width.split("p")[0]);
    canvas.height = parseInt(height.split("p")[0]);

    const ctx = canvas.getContext("2d");
    const points = [];

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    const handleMouseDown = (event) => {
      isDrawingRef.current = true;
      console.log("Press", event);
    };
    const midPointBtw = (p1, p2) => {
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };
    };
    const handlePointerMove = (newX, newY) => {
      const rect = canvas.getBoundingClientRect();
      xRef.current = newX - rect.left;
      yRef.current = newY - rect.top;
    };
    const handleDraw = (pressure) => {
      lazy.update({ x: xRef.current, y: yRef.current });
      lazyFriction.update(
        { x: xRef.current, y: yRef.current },
        { friction: 0.5 }
      );

      //this make lazy the stroke
      const brush = lazy.getBrushCoordinates();
      // const brushFriction = lazyFriction.getBrushCoordinates();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);
      // Draw brush point IF
      if (isDrawingRef.current) {

        //here is when style of the draw most change.
        points.push({ x: xRef.current, y: yRef.current, pressure: pressure });

        let p1 = points[0];
        let p2 = points[1];

        if (p2 === undefined) return;

        for (let i = 1, len = points.length; i < len; i++) {
          // we pick the point between pi+1 & pi+2 as the
          // end point and p1 as our control point
          const midPoint = midPointBtw(p1, p2);

          offscreenCtx.moveTo(p2.x, p2.y);
          offscreenCtx.beginPath();

          offscreenCtx.lineWidth = Math.max(points[i].pressure * 10, 1);
          offscreenCtx.strokeStyle = "#000000";
          offscreenCtx.lineCap = "round";

          offscreenCtx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          offscreenCtx.lineTo(p1.x, p1.y);
          offscreenCtx.stroke();

          p1 = points[i];
          p2 = points[i + 1];
        }
        //style the stoke
      }

      //stroke preview
      ctx.beginPath();
      ctx.fillStyle = "blue";
      ctx.arc(xRef.current, yRef.current, BRUSH_RADIUS, 0, Math.PI * 2, true);
      ctx.fill();
    };
    const handleMove = (event) => {
      handlePointerMove(event.clientX, event.clientY);
      handleDraw(event.pressure);
    };
    const handleMouseUp = () => {
      isDrawingRef.current = false;
      console.log("Up");
      offscreenCtx.closePath();
      points.length = 0;
    };
    const touchMove = (event) => {
      handlePointerMove(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      );
      handleDraw(event.changedTouches[0].force);
    };

    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("touchend", handleMouseUp);
    window.addEventListener("pointerup", handleMouseUp);

    return () => {
      canvas.addEventListener("pointermove", handleMove);
      canvas.addEventListener("touchmove", touchMove);
      canvas.addEventListener("pointerdown", handleMouseDown);
      window.addEventListener("touchend", handleMouseUp);
      window.addEventListener("pointerup", handleMouseUp);

    };
  }, [lazy, lazyFriction]);

  return (
    <>
      <div
        className="bg-black w-full h-screen flex flex-col justify-center items-center
      gap-4 p-4 box-border"
      >
        <div className="bg-white h-10 rounded-lg flex justify-center gap-1 items-center p-1">
          <Hand
            size={30}
            className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
          />
          <Pencil
            size={30}
            className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
          />
          <PenLine
            size={30}
            className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
          />
          <Eraser
            size={30}
            className="hover:bg-zinc-200 rounded-md p-1 cursor-pointer transition-all active:bg-zinc-300 active:scale-[.9] text-zinc-700"
          />
        </div>
        <div
          ref={canvasContainerRef}
          className="w-[700px] h-full hover:cursor-none"
        >
          <canvas
            ref={canvasRef}
            className="bg-white rounded-lg w-full h-full"
          ></canvas>
        </div>
      </div>
    </>
  );
}

export default App;
