import './index.css'
import { LazyBrush } from 'lazy-brush'
import { useRef, useEffect, useMemo, useState } from 'react';

function App() {
  const LAZY_RADIUS = 60;
  const BRUSH_RADIUS = 10;
  const isDrawingRef = useRef(false);

  const canvasRef = useRef();

  
  const lazy = useMemo(() => {
    return new LazyBrush({
      enabled: true,
      radius: LAZY_RADIUS,
      initialPoint: {
        x: 0,
        y: 0
      }
    })
  },[LAZY_RADIUS]) 
  
  const lazyFriction = useMemo(() => {
    return new LazyBrush({
      enabled: true,
      radius: LAZY_RADIUS,
      initialPoint: {
        x: 0,
        y: 0
      }
    });
  }, [LAZY_RADIUS]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');

    const handleMouseDown = (event) => {
      isDrawingRef.current = true;
      const x = event.clientX;
      const y = event.clientY;

      lazyFriction.update({ x, y }, {both: true});
      
        offscreenCtx.beginPath()
        offscreenCtx.moveTo(x, y);
    }
    
    const handleMouseMove = (event) => {

      const x = event.clientX;
      const y = event.clientY;
      
      lazy.update({ x, y });
      lazyFriction.update({ x, y }, {friction: 0.5});
      
      const brush = lazy.getBrushCoordinates()
      const brushFriction = lazyFriction.getBrushCoordinates()

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0);
        // Draw brush point
        if(isDrawingRef.current){
          offscreenCtx.beginPath()
          offscreenCtx.fillStyle = 'blue'
          offscreenCtx.arc(brushFriction.x, brushFriction.y, BRUSH_RADIUS, 0, Math.PI * 2, true)
          offscreenCtx.lineTo(brushFriction.x, brushFriction.y);
          offscreenCtx.fill()
        }

        ctx.beginPath()
        ctx.fillStyle = 'blue'
        ctx.arc(brushFriction.x, brushFriction.y, BRUSH_RADIUS, 0, Math.PI * 2, true)
        ctx.fill()

        //Draw the lazy radius.
        ctx.beginPath()
        ctx.strokeStyle = '#ccc'
        ctx.arc(brush.x, brush.y, LAZY_RADIUS, 0, Math.PI * 2, true)
        ctx.stroke()
      }
    const handleMouseUp = () => {
      isDrawingRef.current = false;
      console.log("Up")
      offscreenCtx.closePath();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);  // Capture mouse up globally



  return () => {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);  // Capture mouse up globally

  };
   
  },[lazy, lazyFriction])


 
  return (
    <>
     <div className='bg-black w-full h-screen p-4'>
        <canvas ref={canvasRef} className='bg-white w-full h-full rounded-lg'>
        </canvas>
    </div>
    </>
  )
}

export default App
