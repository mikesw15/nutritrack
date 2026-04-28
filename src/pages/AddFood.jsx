import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ScanBarcode, Sparkles, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getDateString } from '@/lib/dateUtils';
import FoodSearchResults from '@/components/food/FoodSearchResults';
import AIFoodInput from '@/components/food/AIFoodInput';
import BarcodeScanner from '@/components/food/BarcodeScanner';

export default function AddFood() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mealType = urlParams.get('meal') || 'breakfast';
  const date = urlParams.get('date') || getDateString();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [showScanner, setShowScanner] = useState(false);

  const { data: foodItems = [], isLoading: searching } = useQuery({
    queryKey: ['foodSearch', searchQuery],
    queryFn: () => base44.entities.FoodItem.filter({ name: { $regex: searchQuery, $options: 'i' } }),
    enabled: searchQuery.length >= 2,
  });

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['recentFoods'],
    queryFn: () => base44.entities.DiaryEntry.list('-created_date', 20),
  });

  const addEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success('Food added to diary');
      navigate('/');
    },
  });

  const handleAddFood = (food, quantity = 1) => {
    addEntryMutation.mutate({
      date,
      meal_type: mealType,
      food_name: food.name || food.food_name,
      brand: food.brand,
      quantity,
      serving_size: food.serving_size,
      calories: Math.round((food.calories || 0) * quantity),
      protein: Math.round((food.protein || 0) * quantity * 10) / 10,
      carbs: Math.round((food.carbs || 0) * quantity * 10) / 10,
      fat: Math.round((food.fat || 0) * quantity * 10) / 10,
      sugar: Math.round((food.sugar || 0) * quantity * 10) / 10,
      fibre: Math.round((food.fibre || 0) * quantity * 10) / 10,
      salt: Math.round((food.salt || 0) * quantity * 10) / 10,
      food_item_id: food.id,
      image_url: food.image_url,
    });
  };

  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };

  // Get unique recent foods by name
  const uniqueRecent = recentEntries.reduce((acc, entry) => {
    if (!acc.find(e => e.food_name === entry.food_name)) acc.push(entry);
    return acc;
  }, []).slice(0, 10);

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold font-heading">Add Food</h1>
          <p className="text-xs text-muted-foreground">{mealLabels[mealType]} · {date}</p>
        </div>
      </div>

      {/* Barcode Scanner (inline) */}
      {showScanner && (
        <BarcodeScanner
          onFoodFound={(food) => { handleAddFood(food); setShowScanner(false); }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
          <TabsTrigger value="search" className="rounded-lg text-xs">
            <Search className="w-3.5 h-3.5 mr-1.5" />Search
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />AI
          </TabsTrigger>
          <TabsTrigger value="recent" className="rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-muted border-0 h-11"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              onClick={() => setShowScanner(v => !v)}
              title="Scan barcode"
            >
              <ScanBarcode className="w-5 h-5" />
            </Button>
          </div>
          <FoodSearchResults
            results={foodItems}
            searching={searching && searchQuery.length >= 2}
            onSelect={handleAddFood}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-3">
          <AIFoodInput
            onFoodDetected={handleAddFood}
            isAdding={addEntryMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="recent" className="mt-3 space-y-2">
          {uniqueRecent.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No recent foods yet</p>
          )}
          {uniqueRecent.map((entry) => (
            <button
              key={entry.id}
              className="w-full flex items-center justify-between p-3 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors text-left"
              onClick={() => handleAddFood(entry)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{entry.food_name}</p>
                <p className="text-xs text-muted-foreground">{entry.serving_size || '1 serving'}</p>
              </div>
              <span className="text-sm font-semibold ml-3">{entry.calories} kcal</span>
            </button>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}