import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Mic, Send, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AIFoodInput({ onFoodDetected, isAdding }) {
  const [voiceText, setVoiceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedFood, setDetectedFood] = useState(null);
  const fileInputRef = useRef(null);

  const analyzeWithAI = async (prompt, fileUrls = null) => {
    setLoading(true);
    setDetectedFood(null);
    const opts = {
      prompt: `You are a nutrition expert. Analyze this food and provide accurate nutritional information.
${prompt}
Return the nutritional data for a single serving.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Food name" },
          brand: { type: "string", description: "Brand if identifiable" },
          serving_size: { type: "string", description: "Serving size description" },
          calories: { type: "number" },
          protein: { type: "number" },
          carbs: { type: "number" },
          fat: { type: "number" },
          sugar: { type: "number" },
          fibre: { type: "number" },
          salt: { type: "number" },
        },
      },
    };
    if (fileUrls) opts.file_urls = fileUrls;

    const result = await base44.integrations.Core.InvokeLLM(opts);
    setDetectedFood(result);
    setLoading(false);
  };

  const handleVoiceSubmit = async () => {
    if (!voiceText.trim()) return;
    await analyzeWithAI(`The user said they ate: "${voiceText}". Estimate the nutritional values.`);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await analyzeWithAI(
      'Analyze this food image and identify the food items. Estimate nutritional values for what you see.',
      [file_url]
    );
  };

  const handleAddDetected = () => {
    if (detectedFood) {
      onFoodDetected(detectedFood);
      setDetectedFood(null);
      setVoiceText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice / text input */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold">Tell me what you ate</p>
        <p className="text-xs text-muted-foreground">
          e.g. "Chicken breast with rice and broccoli"
        </p>
        <div className="flex gap-2">
          <Input
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            placeholder="I had chicken and rice..."
            className="rounded-xl bg-muted border-0"
            onKeyDown={(e) => e.key === 'Enter' && handleVoiceSubmit()}
          />
          <Button
            onClick={handleVoiceSubmit}
            disabled={loading || !voiceText.trim()}
            className="rounded-xl shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Photo upload */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold">Snap your meal</p>
        <p className="text-xs text-muted-foreground">Upload a photo and AI will identify the food</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="outline"
          className="w-full rounded-xl h-20 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera className="w-5 h-5" />
              <span className="text-xs">Take photo or upload</span>
            </div>
          )}
        </Button>
      </div>

      {/* Detected food result */}
      {detectedFood && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-primary">AI Detected Food</p>
          <div className="space-y-2">
            <Input
              value={detectedFood.name || ''}
              onChange={(e) => setDetectedFood({ ...detectedFood, name: e.target.value })}
              placeholder="Food name"
              className="rounded-xl bg-card"
            />
            <Input
              value={detectedFood.serving_size || ''}
              onChange={(e) => setDetectedFood({ ...detectedFood, serving_size: e.target.value })}
              placeholder="Serving size"
              className="rounded-xl bg-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['calories', 'Calories'],
              ['protein', 'Protein (g)'],
              ['carbs', 'Carbs (g)'],
              ['fat', 'Fat (g)'],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <label className="text-[10px] text-muted-foreground">{label}</label>
                <Input
                  type="number"
                  value={detectedFood[field] || 0}
                  onChange={(e) => setDetectedFood({ ...detectedFood, [field]: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl bg-card"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleAddDetected}
            className="w-full rounded-xl"
            disabled={isAdding || !detectedFood.name}
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add to Diary
          </Button>
        </div>
      )}
    </div>
  );
}