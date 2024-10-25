import "./index.css";
import { LazyBrush } from "lazy-brush";
import { Pencil, Eraser, PenLine, Hand } from "lucide-react";

import { useRef, useEffect, useMemo, useState } from "react";

function App() {
  const LAZY_RADIUS = 60;
  const BRUSH_RADIUS = 5;
  const isDrawingRef = useRef(false);
  const canvasContainerRef = useRef();
  // const lastPosRef = useRef({ x: 0, y: 0 }); // Ref for tracking the last position

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
      console.log("press")
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = event.x - rect.left;
      const y = event.y - rect.top;

      offscreenCtx.beginPath();
      offscreenCtx.strokeStyle = "#000000";
      offscreenCtx.lineWidth = 7;
      offscreenCtx.lineCap = "round";
      offscreenCtx.lineTo(x, y);
      offscreenCtx.stroke();
    };
    const midPointBtw = (p1, p2) => {
      return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };
    }
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      // console.log(event.pageX, event.clientX)
      const x = event.x - rect.left;
      const y = event.y - rect.top;
      // console.log({x, y}, event)

      lazy.update({ x, y });
      lazyFriction.update({ x, y }, { friction: 0.5 });

      //this make lazy the stroke
      const brush = lazy.getBrushCoordinates();
      // const brushFriction = lazyFriction.getBrushCoordinates();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      // Draw brush point IF
      if (isDrawingRef.current) {
        //this is for draw intermedial points in the stroke.

        //here is when style of the draw most change.
        points.push({ x, y });

        let p1 = points[0];
        let p2 = points[1];

        if (p2 === undefined) return;

        offscreenCtx.moveTo(p2.x, p2.y);
        offscreenCtx.beginPath();

        for (let i = 1, len = points.length; i < len; i++) {
          // we pick the point between pi+1 & pi+2 as the
          // end point and p1 as our control point
          const midPoint = midPointBtw(p1, p2);
          offscreenCtx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
          p1 = points[i];
          p2 = points[i + 1];
        }
        //style the stoke
        offscreenCtx.strokeStyle = "#000000";
        offscreenCtx.lineWidth = 5;
        offscreenCtx.lineCap = "round";
        offscreenCtx.lineTo(p1.x, p1.y);
        offscreenCtx.stroke();
      }
      //stroke preview
      ctx.beginPath();
      ctx.fillStyle = "blue";
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2, true);
      ctx.fill();

      //Draw the lazy radius.
      // ctx.beginPath();
      // ctx.strokeStyle = "#ccc";
      // ctx.arc(brush.x, brush.y, LAZY_RADIUS, 0, Math.PI * 2, true);
      // ctx.stroke();
    };
    const handleMouseUp = () => {
      isDrawingRef.current = false;
      console.log("Up");
      offscreenCtx.closePath();
      points.length = 0;
    };

    canvas.addEventListener("pointerdown", handleMouseDown);
    canvas.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp); // Capture mouse up globally
    // requestAnimationFrame(handleMouseMove);

    return () => {
      canvas.addEventListener("pointerdown", handleMouseDown);
      canvas.removeEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp); // Capture mouse up globally
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
