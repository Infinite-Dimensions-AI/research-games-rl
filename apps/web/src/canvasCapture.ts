/**
 * Capture actual HTML Canvas pixels, in the user's browser.
 * Screenshots never go through Playwright, a server or Python.
 */
export type PixelCapture={
  width:number;
  height:number;
  channels:1;
  values:Float32Array;
  preview:string;
  min:number;
  max:number;
  mean:number;
};

export function captureCanvasPng(canvas:HTMLCanvasElement):Promise<Blob>{
  return new Promise((resolve,reject)=>{
    try{
      canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Canvas PNG encoding failed.')),'image/png');
    }catch(error){reject(error);}
  });
}

/**
 * Convert game pixels to grayscale features for *future* vision-based NEAT.
 * Call this on the clean game frame, never diagnostic HUD/sensor overlays.
 * This function samples a browser canvas but does not yet change training inputs.
 */
export function sampleCanvasPixels(source:HTMLCanvasElement,width=64,height=36):PixelCapture{
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>65536)
    throw new RangeError('Requested sample dimensions are invalid.');
  if(!source.width||!source.height)throw new Error('No game pixels have been rendered yet.');

  const sample=document.createElement('canvas');
  sample.width=width;sample.height=height;
  const context=sample.getContext('2d',{willReadFrequently:true});
  if(!context)throw new Error('2D canvas context unavailable.');
  context.imageSmoothingEnabled=true;
  context.drawImage(source,0,0,width,height);
  const pixels=context.getImageData(0,0,width,height);
  const values=new Float32Array(width*height);
  let min=1,max=0,total=0;

  for(let i=0;i<values.length;i++){
    const offset=i*4;
    const brightness=(.2126*pixels.data[offset]+.7152*pixels.data[offset+1]+.0722*pixels.data[offset+2])/255;
    values[i]=brightness;
    min=Math.min(min,brightness);max=Math.max(max,brightness);total+=brightness;
    const gray=Math.round(brightness*255);
    pixels.data[offset]=gray;pixels.data[offset+1]=gray;pixels.data[offset+2]=gray;
  }
  context.putImageData(pixels,0,0);
  return {width,height,channels:1,values,preview:sample.toDataURL('image/png'),min,max,mean:total/values.length};
}

export function downloadBrowserBlob(blob:Blob,filename:string):void{
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=filename;
  document.body.appendChild(anchor);
  anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),2000);
}
