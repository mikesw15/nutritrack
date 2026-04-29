import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ScanBarcode, Sparkles, ArrowLeft, Clock, Camera, Star, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getDateString, getPrevDate } from '@/lib/dateUtils';
import FoodSearchResults from '@/components/food/FoodSearchResults';
import AIFoodInput from '@/components/food/AIFoodInput';
import BarcodeScanner from '@/components/food/BarcodeScanner';

const TABS = ['All', 'Recent', 'Favourites', 'Recipes'];

export default function AddFood() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const mealType = urlParams.get('meal') || 'breakfast';
  const date = urlParams.get('date') || getDateString();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState('search'); // 'search' | 'scan' | 'ai'
  const [activeTab, setActiveTab] = useState('All');

  const { data: foodItems = [], isLoading: searching } = useQuery({
    queryKey: ['foodSearch', searchQuery],
    queryFn: async () => {
      const terms = searchQuery.split(/,| and | with |\+/i).map(item => item.trim()).filter(item => item.length >= 2);
      const searches = await Promise.all(terms.map(term => base44.entities.FoodItem.filter({ name: { $regex: term, $options: 'i' } })));
      return searches.flat().filter((item, index, list) => list.findIndex(match => match.id === item.id) === index);
    },
    enabled: searchQuery.length >= 2,
  });

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['recentFoods'],
    queryFn: () => base44.entities.DiaryEntry.list('-created_date', 20),
  });

  const { data: favouriteMeals = [] } = useQuery({
    queryKey: ['favouriteMeals'],
    queryFn: () => base44.entities.FavouriteMeal.list('-created_date', 20),
  });

  const { data: yesterdayEntries = [] } = useQuery({
    queryKey: ['yesterdayEntries', mealType, date],
    queryFn: () => base44.entities.DiaryEntry.filter({ date: getPrevDate(date), meal_type: mealType }),
  });

  const addEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.DiaryEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success('Food added to diary');
      navigate('/');
    },
  });

  const copyYesterdayMutation = useMutation({
    mutationFn: () => base44.entities.DiaryEntry.bulkCreate(yesterdayEntries.map(({ id, created_date, updated_date, created_by, ...entry }) => ({ ...entry, date }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success('Yesterday copied');
      navigate('/');
    },
  });

  const saveFavouriteMutation = useMutation({
    mutationFn: () => base44.entities.FavouriteMeal.create({
      name: `${mealLabels[mealType]} favourite`,
      meal_type: mealType,
      items: yesterdayEntries,
      total_calories: yesterdayEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favouriteMeals'] });
      toast.success('Meal saved as favourite');
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

  const addFavouriteMeal = (meal) => {
    base44.entities.DiaryEntry.bulkCreate((meal.items || []).map(({ id, created_date, updated_date, created_by, ...item }) => ({ ...item, date, meal_type: mealType }))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      toast.success('Favourite meal added');
      navigate('/');
    });
  };

  const uniqueRecent = recentEntries.reduce((acc, entry) => {
    if (!acc.find(e => e.food_name === entry.food_name)) acc.push(entry);
    return acc;
  }, []).slice(0, 10);

  const naturalLanguageFoods = searchQuery
    .split(/,| and | with |\+/i)
    .map(item => item.trim())
    .filter(item => item.length > 1);

  const displayResults = activeTab === 'Recent' ? uniqueRecent : foodItems;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
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

      {/* Search bar + action buttons */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search UK foods, brands or barcode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveMode('search'); }}
              className="pl-10 rounded-xl bg-muted border-0 h-10"
            />
          </div>
          <Button
            size="sm"
            className={`rounded-xl h-10 px-3 gap-1.5 text-xs font-semibold ${activeMode === 'scan' ? 'bg-primary' : 'bg-primary/80 hover:bg-primary'}`}
            onClick={() => setActiveMode(m => m === 'scan' ? 'search' : 'scan')}
          >
            <ScanBarcode className="w-4 h-4" /> Scan
          </Button>
          <Button
            size="sm"
            variant={activeMode === 'ai' ? 'default' : 'secondary'}
            className="rounded-xl h-10 px-3 gap-1.5 text-xs font-semibold"
            onClick={() => setActiveMode(m => m === 'ai' ? 'search' : 'ai')}
          >
            <Camera className="w-4 h-4" /> AI Photo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5"
            onClick={() => copyYesterdayMutation.mutate()}
            disabled={yesterdayEntries.length === 0 || copyYesterdayMutation.isPending}
          >
            <Copy className="w-3.5 h-3.5" /> Copy Yesterday
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs gap-1.5"
            onClick={() => saveFavouriteMutation.mutate()}
            disabled={yesterdayEntries.length === 0 || saveFavouriteMutation.isPending}
          >
            <Star className="w-3.5 h-3.5" /> Save Favourite
          </Button>
        </div>

        {/* Sub-tabs */}
        {activeMode === 'search' && (
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scanner */}
      {activeMode === 'scan' && (
        <BarcodeScanner
          onFoodFound={(food) => { handleAddFood(food); setActiveMode('search'); }}
          onClose={() => setActiveMode('search')}
        />
      )}

      {/* AI input */}
      {activeMode === 'ai' && (
        <AIFoodInput
          onFoodDetected={handleAddFood}
          isAdding={addEntryMutation.isPending}
        />
      )}

      {/* Results */}
      {activeMode === 'search' && (
        activeTab === 'Recent' ? (
          <div className="space-y-2">
            {uniqueRecent.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No recent foods yet</p>
            )}
            {uniqueRecent.map((entry) => (
              <button
                key={entry.id}
                className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => handleAddFood(entry)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{entry.food_name}</p>
                  <p className="text-xs text-muted-foreground">{entry.serving_size || '1 serving'}</p>
                </div>
                <span className="text-sm font-semibold ml-3 text-primary">{entry.calories} kcal</span>
              </button>
            ))}
          </div>
        ) : activeTab === 'Favourites' ? (
          <div className="space-y-2">
            {favouriteMeals.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No favourite meals yet</p>
            )}
            {favouriteMeals.map((meal) => (
              <button
                key={meal.id}
                className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => addFavouriteMeal(meal)}
              >
                <div>
                  <p className="text-sm font-semibold">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.items?.length || 0} items</p>
                </div>
                <span className="text-sm font-semibold text-primary">{meal.total_calories || 0} kcal</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {naturalLanguageFoods.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-700 mb-3">
                Searching for: {naturalLanguageFoods.join(', ')}
              </div>
            )}
            <FoodSearchResults
              results={foodItems}
              searching={searching && searchQuery.length >= 2}
              onSelect={handleAddFood}
            />
          </>
        )
      )}
    </div>
  );
}