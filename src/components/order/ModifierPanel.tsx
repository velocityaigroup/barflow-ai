'use client';
import { useState, useEffect } from 'react';
import { useDemoStore } from '@/store/useDemoStore';
import { ModifierOption } from '@/data/menu';
import { X, Plus, Minus, MessageSquare, Check } from 'lucide-react';

export function ModifierPanel() {
  const { modifierItem, closeModifierPanel, addToCart } = useDemoStore();
  const [selectedMods, setSelectedMods] = useState<ModifierOption[]>([]);
  const [note, setNote] = useState('');
  const [qty, setQty] = useState(1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (modifierItem) {
      setSelectedMods([]);
      setNote('');
      setQty(1);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [modifierItem]);

  if (!modifierItem) return null;

  const toggleMod = (option: ModifierOption, group: { maxSelections: number; id: string }) => {
    const isSelected = selectedMods.some((m) => m.id === option.id);
    if (isSelected) {
      setSelectedMods((prev) => prev.filter((m) => m.id !== option.id));
    } else {
      const groupSelected = selectedMods.filter((m) =>
        modifierItem.modifierGroups
          ?.find((g) => g.id === group.id)
          ?.options.some((o) => o.id === m.id),
      );
      if (groupSelected.length < group.maxSelections) {
        setSelectedMods((prev) => [...prev, option]);
      } else if (group.maxSelections === 1) {
        // Replace single-select
        const groupOptionIds = modifierItem.modifierGroups
          ?.find((g) => g.id === group.id)
          ?.options.map((o) => o.id) || [];
        setSelectedMods((prev) => [
          ...prev.filter((m) => !groupOptionIds.includes(m.id)),
          option,
        ]);
      }
    }
  };

  const modTotal = selectedMods.reduce((sum, m) => sum + m.priceAdjustment, 0);
  const totalPrice = (modifierItem.price + modTotal) * qty;

  const handleAdd = () => {
    addToCart(modifierItem, selectedMods, note);
    closeModifierPanel();
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(closeModifierPanel, 200);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
      />

      {/* Panel */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] flex flex-col
                       bg-surface rounded-t-3xl border-t border-border shadow-2xl
                       transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-border shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{modifierItem.emoji}</span>
              <div>
                <h2 className="heading-md">{modifierItem.name}</h2>
                <p className="text-secondary text-sm">{modifierItem.description}</p>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="btn-icon btn-ghost mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Modifier groups */}
          {modifierItem.modifierGroups?.map((group) => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-primary font-semibold text-sm">{group.name}</h3>
                <span className="text-xs text-tertiary">
                  {group.maxSelections > 1 ? `Pick up to ${group.maxSelections}` : 'Pick one'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => {
                  const isActive = selectedMods.some((m) => m.id === option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleMod(option, group)}
                      className={`mod-btn ${isActive ? 'active' : ''} justify-between`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {option.emoji && <span className="text-base">{option.emoji}</span>}
                        <span className="truncate">{option.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {option.priceAdjustment !== 0 && (
                          <span className={`text-xs font-bold ${option.priceAdjustment > 0 ? 'text-warning' : 'text-success'}`}>
                            {option.priceAdjustment > 0 ? '+' : ''}€{option.priceAdjustment.toFixed(2)}
                          </span>
                        )}
                        {isActive && (
                          <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                            <Check size={10} className="text-bg" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Custom note */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <MessageSquare size={14} className="text-tertiary" />
              <h3 className="text-primary font-semibold text-sm">Custom Note</h3>
            </div>
            <input
              type="text"
              className="input"
              placeholder="e.g. less ice, extra lime..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-bg/50 shrink-0">
          <div className="flex items-center gap-4">
            {/* Qty */}
            <div className="flex items-center gap-3 bg-hover rounded-xl px-3 py-2 border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-secondary hover:text-primary">
                <Minus size={16} />
              </button>
              <span className="text-primary font-black text-lg w-5 text-center tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-secondary hover:text-primary">
                <Plus size={16} />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              className="btn-primary flex-1 btn-lg font-black"
            >
              Add {qty > 1 ? `${qty}× ` : ''}— €{totalPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
