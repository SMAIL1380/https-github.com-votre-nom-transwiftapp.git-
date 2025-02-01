'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (signatureRef.current) {
        const canvas = signatureRef.current.getCanvas();
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      const signatureData = signatureRef.current.toDataURL();
      onSave(signatureData);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Signature du client</h2>
        
        <div className="border-2 border-gray-300 rounded-lg mb-4">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-64 cursor-crosshair',
            }}
            onBegin={handleBegin}
            backgroundColor="white"
          />
        </div>

        <div className="flex justify-between">
          <div className="space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Effacer
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className={`px-4 py-2 rounded-md text-white ${
              isEmpty
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            Confirmer la signature
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          En signant, vous confirmez avoir reçu votre colis en bon état.
        </p>
      </div>
    </div>
  );
}
