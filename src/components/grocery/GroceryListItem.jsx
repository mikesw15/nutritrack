import React from 'react';
import { ShoppingBasket } from 'lucide-react';

export default function GroceryListItem({ item }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-muted" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingBasket className="w-5 h-5 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {item.brand ? `${item.brand} · ` : ''}{item.serving_size || 'serving'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-primary">{item.quantity}x</p>
        <p className="text-[10px] text-muted-foreground">{item.entries} entries</p>
      </div>
    </div>
  );
}