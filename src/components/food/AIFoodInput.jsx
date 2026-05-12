import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Mic, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MealAnalysisReview from '@/components/food/MealAnalysisReview';

export default function AIFoodInput({ onFoodDetected, isAdding }) {
  const [voiceText, setVoiceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [detectedFood, setDetectedFood] = useState(null);
  const fileInputRef = useRef(null);

  const analyzeWithAI = async (prompt, fileUrls = null) => {
    setLoading(true);
    setDetectedFood(null);
    const opts = {
      prompt: `You are a nutrition expert for UK food tracking. Analyze this meal photo or description.
${prompt}
Identify each visible food item, estimate realistic portion sizes, and calculate nutrition per item. Return itemised estimates plus meal totals.`,
      response_json_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dish_name: { type: "string", description: "Best guess for the overall dish name" },
                name: { type: "string", description: "Food item name" },
                portion_size: { type: "string", description: "Estimated portion size, e.g. 150g, 1 slice, 1 tbsp" },
                calories: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
              },
            },
          },
          total_calories: { type: "number" },
          total_protein: { type: "number" },
          total_carbs: { type: "number" },
          total_fat: { type: "number" },
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
    await analyzeWithAI(`The user said they ate: "${voiceText}". Estimate UK nutrition values and infer a complete meal when appropriate.`);
  };

  const handleVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice logging is not supported on this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setVoiceText(transcript);
    };
    recognition.start();
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

  const handleAddDetected = (food) => {
    onFoodDetected(food);
    setDetectedFood(null);
    setVoiceText('');
  };

  return (
    <div className="space-y-4">
      {/* Voice / text input */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <p className="text-sm font-semibold">Tell me what you ate</p>
        <p className="text-xs text-muted-foreground">
          e.g. “I had a bacon sandwich and coffee”
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
            type="button"
            variant="outline"
            onClick={handleVoiceCapture}
            disabled={loading || listening}
            className="rounded-xl shrink-0"
          >
            {listening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
          </Button>
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
        <MealAnalysisReview
          analysis={detectedFood}
          onConfirm={handleAddDetected}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}