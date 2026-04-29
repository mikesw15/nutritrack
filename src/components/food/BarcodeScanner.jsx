import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Loader2, ScanLine, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function BarcodeScanner({ onFoodFound, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const animFrameRef = useRef(null);

  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState('starting'); // 'starting' | 'scanning' | 'looking_up' | 'found' | 'not_found' | 'no_support'
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  const lookupBarcode = async (code) => {
    setStatus('looking_up');
    stopCamera();

    // 1. Check local DB first
    const local = await base44.entities.FoodItem.filter({ barcode: code });
    if (local.length > 0) {
      setResult(local[0]);
      setQuantity(1);
      setStatus('found');
      return;
    }

    // 2. Fetch from Open Food Facts
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
    const data = await res.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const n = p.nutriments || {};
      const food = {
        name: p.product_name || p.abbreviated_product_name || 'Unknown Product',
        brand: p.brands || '',
        calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
        protein: Math.round((n.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((n.fat_100g || 0) * 10) / 10,
        sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
        fibre: Math.round((n.fiber_100g || 0) * 10) / 10,
        salt: Math.round((n.salt_100g || 0) * 10) / 10,
        serving_size: p.serving_size || '100g',
        serving_grams: parseFloat(p.serving_quantity) || 100,
        barcode: code,
        image_url: p.image_front_small_url || p.image_url || '',
        category: 'other',
        is_custom: false,
      };
      // Save to local DB for next time
      base44.entities.FoodItem.create(food).catch(() => {});
      setResult(food);
      setQuantity(1);
      setStatus('found');
    } else {
      setStatus('not_found');
    }
  };

  const startCamera = async () => {
    if (!('BarcodeDetector' in window)) {
      setStatus('no_support');
      return;
    }
    detectorRef.current = new window.BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    setStatus('scanning');

    const scan = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(scan);
        return;
      }
      const barcodes = await detectorRef.current.detect(videoRef.current).catch(() => []);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        await lookupBarcode(code);
      } else {
        animFrameRef.current = requestAnimationFrame(scan);
      }
    };
    animFrameRef.current = requestAnimationFrame(scan);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera().catch(() => setStatus('no_support'));
    }
    return () => stopCamera();
  }, [mode]);

  const handleManualLookup = () => {
    if (manualCode.trim().length >= 8) lookupBarcode(manualCode.trim());
  };

  const handleAdd = () => {
    if (result) onFoodFound(result, quantity);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Barcode Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${mode === 'camera' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { setMode('camera'); setStatus('starting'); setResult(null); }}
          >Camera</button>
          <button
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => { stopCamera(); setMode('manual'); setResult(null); setStatus('idle'); }}
          >Manual</button>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={() => { stopCamera(); onClose(); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Camera view */}
      {mode === 'camera' && (
        <div className="relative bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />

          {/* Scanning overlay */}
          {status === 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-56 h-32 border-2 border-primary rounded-xl relative">
                <motion.div
                  className="absolute inset-x-0 h-0.5 bg-primary/80"
                  animate={{ top: ['10%', '85%', '10%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg -translate-x-px -translate-y-px" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg translate-x-px -translate-y-px" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg -translate-x-px translate-y-px" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg translate-x-px translate-y-px" />
              </div>
              <p className="text-white/80 text-xs mt-3 bg-black/40 px-3 py-1 rounded-full">
                Point at a barcode
              </p>
            </div>
          )}

          {status === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          {status === 'looking_up' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-white text-sm">Looking up product...</p>
            </div>
          )}

          {status === 'no_support' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3 px-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <p className="text-white text-sm">Camera barcode scanning isn't supported on this browser. Use manual entry instead.</p>
            </div>
          )}
        </div>
      )}

      {/* Manual input */}
      {mode === 'manual' && (
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Enter the barcode number from the product packaging.</p>
          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 5000168166409"
              className="rounded-xl font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
              maxLength={14}
            />
            <Button
              onClick={handleManualLookup}
              disabled={manualCode.length < 8 || status === 'looking_up'}
              className="rounded-xl shrink-0"
            >
              {status === 'looking_up' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {status === 'found' && result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                {result.image_url ? (
                  <img src={result.image_url} alt={result.name} className="w-14 h-14 rounded-xl object-contain bg-muted" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🛒</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs text-primary font-medium">Product found</span>
                  </div>
                  <p className="font-semibold text-sm leading-tight">{result.name}</p>
                  {result.brand && <p className="text-xs text-muted-foreground">{result.brand}</p>}
                  <p className="text-xs text-muted-foreground">{result.serving_size}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Portion / servings</label>
                <Input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.25, parseFloat(e.target.value) || 1))}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'kcal', value: Math.round((result.calories || 0) * quantity) },
                  { label: 'protein', value: `${Math.round((result.protein || 0) * quantity * 10) / 10}g` },
                  { label: 'carbs', value: `${Math.round((result.carbs || 0) * quantity * 10) / 10}g` },
                  { label: 'fat', value: `${Math.round((result.fat || 0) * quantity * 10) / 10}g` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl p-2">
                    <p className="text-sm font-bold">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full rounded-xl" onClick={handleAdd}>
                Add to Diary
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'not_found' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-border p-4 text-center"
          >
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">Product not found</p>
            <p className="text-xs text-muted-foreground mt-1">Try again or enter the food manually.</p>
            <div className="flex gap-2 justify-center mt-3">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { setStatus('scanning'); setResult(null); if (mode === 'camera') startCamera(); }}>
                Scan Again
              </Button>
              <Button size="sm" className="rounded-xl" onClick={onClose}>
                Manual Entry
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}