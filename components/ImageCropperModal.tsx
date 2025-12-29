import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/imageUtils';
import GlassmorphicCard from './GlassmorphicCard';

interface ImageCropperModalProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  title?: string;
  queueCount?: number;
  totalInQueue?: number;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  image, 
  onCropComplete, 
  onCancel, 
  title = "Crop Image",
  queueCount = 1,
  totalInQueue = 1
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedBase64 = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropComplete(croppedBase64);
    } catch (e) {
      console.error(e);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <GlassmorphicCard className="w-full max-w-2xl bg-white border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden scale-in-center">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">{title}</h2>
            {totalInQueue > 1 && (
                <p className="text-[10px] font-black uppercase text-accent tracking-widest mt-1">Processing {queueCount} of {totalInQueue}</p>
            )}
          </div>
          <button onClick={onCancel} className="p-2 text-text-muted hover:text-red-500 transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Cropper Workspace */}
        <div className="relative flex-grow min-h-[350px] bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1} // Strict 1:1 for VexoKart
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="p-8 bg-white space-y-6 shrink-0">
           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 <input 
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-grow accent-accent h-1.5 bg-border rounded-full appearance-none cursor-pointer"
                 />
                 <svg className="w-6 h-6 text-text-main" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              
              <div className="flex justify-center gap-4">
                <button 
                    onClick={() => setRotation(prev => (prev - 90) % 360)}
                    className="p-3 bg-surface border border-border rounded-2xl hover:text-accent transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    Rotate L
                </button>
                <button 
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-3 bg-surface border border-border rounded-2xl hover:text-accent transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                >
                    Rotate R
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                </button>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-surface rounded-2xl transition-all"
                disabled={isProcessing}
              >
                Discard
              </button>
              <button 
                onClick={handleCropSave}
                disabled={isProcessing}
                className="flex-[2] bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Compressing...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        Crop & Add to Listing
                    </>
                )}
              </button>
           </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default ImageCropperModal;