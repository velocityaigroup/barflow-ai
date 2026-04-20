// ============================================================
// BarFlow — Mock Menu Data
// ============================================================

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  isAlcohol: boolean;
  isAvailable: boolean;
  isPopular?: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  name: string;
  maxSelections: number;
  isRequired: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
  emoji?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  destination: 'bar' | 'kitchen';
}

// ─── Categories ──────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: 'cocktails', name: 'Cocktails',   emoji: '🍹', destination: 'bar' },
  { id: 'shooters',  name: 'Shooters',    emoji: '🥃', destination: 'bar' },
  { id: 'beer',      name: 'Beer',        emoji: '🍺', destination: 'bar' },
  { id: 'spirits',   name: 'Spirits',     emoji: '🥂', destination: 'bar' },
  { id: 'soft',      name: 'Soft Drinks', emoji: '🥤', destination: 'bar' },
  { id: 'food',      name: 'Food',        emoji: '🍽️', destination: 'kitchen' },
];

// ─── Modifier Groups ─────────────────────────────────────────
const SPIRIT_MODIFIERS: ModifierGroup[] = [
  {
    id: 'alcohol',
    name: 'Alcohol Strength',
    maxSelections: 1,
    isRequired: false,
    options: [
      { id: 'single',  name: 'Single',  priceAdjustment: 0,    emoji: '🥃' },
      { id: 'double',  name: 'Double',  priceAdjustment: 3.00, emoji: '💪' },
      { id: 'virgin',  name: 'Virgin',  priceAdjustment: -2.00, emoji: '🌿' },
    ],
  },
  {
    id: 'extras',
    name: 'Add-ons',
    maxSelections: 3,
    isRequired: false,
    options: [
      { id: 'umbrella', name: 'Umbrella',   priceAdjustment: 0,   emoji: '🌂' },
      { id: 'garnish',  name: 'Garnish',    priceAdjustment: 0,   emoji: '🌿' },
      { id: 'no-sugar', name: 'No Sugar',   priceAdjustment: 0,   emoji: '🚫' },
      { id: 'extra-ice',name: 'Extra Ice',  priceAdjustment: 0,   emoji: '🧊' },
      { id: 'no-ice',   name: 'No Ice',     priceAdjustment: 0,   emoji: '☀️' },
      { id: 'extra-rum',name: 'Extra Rum',  priceAdjustment: 2.50, emoji: '🍶' },
      { id: 'premium',  name: 'Premium Spirit', priceAdjustment: 3.00, emoji: '⭐' },
    ],
  },
];

// ─── Menu Items ──────────────────────────────────────────────
export const MENU_ITEMS: MenuItem[] = [
  // COCKTAILS
  {
    id: 'mojito', categoryId: 'cocktails', name: 'Mojito',
    description: 'White rum, mint, lime, sugar, soda',
    price: 10.00, emoji: '🍃', isAlcohol: true, isAvailable: true, isPopular: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'margarita', categoryId: 'cocktails', name: 'Margarita',
    description: 'Tequila, triple sec, lime',
    price: 10.00, emoji: '🍋', isAlcohol: true, isAvailable: true, isPopular: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'negroni', categoryId: 'cocktails', name: 'Negroni',
    description: 'Gin, Campari, sweet vermouth',
    price: 11.00, emoji: '🔴', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'old-fashioned', categoryId: 'cocktails', name: 'Old Fashioned',
    description: 'Bourbon, bitters, sugar',
    price: 12.00, emoji: '🥃', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'espresso-martini', categoryId: 'cocktails', name: 'Espresso Martini',
    description: 'Vodka, coffee liqueur, espresso',
    price: 12.00, emoji: '☕', isAlcohol: true, isAvailable: true, isPopular: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'aperol-spritz', categoryId: 'cocktails', name: 'Aperol Spritz',
    description: 'Aperol, prosecco, soda',
    price: 9.00, emoji: '🍊', isAlcohol: true, isAvailable: true, isPopular: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'daiquiri', categoryId: 'cocktails', name: 'Daiquiri',
    description: 'Rum, lime juice, sugar',
    price: 9.00, emoji: '🍈', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'cosmopolitan', categoryId: 'cocktails', name: 'Cosmopolitan',
    description: 'Citrus vodka, cranberry, lime',
    price: 10.00, emoji: '🩷', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'pina-colada', categoryId: 'cocktails', name: 'Piña Colada',
    description: 'Rum, coconut cream, pineapple',
    price: 10.00, emoji: '🍍', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'long-island', categoryId: 'cocktails', name: 'Long Island',
    description: 'Vodka, rum, tequila, gin, cola',
    price: 13.00, emoji: '🧉', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'whiskey-sour', categoryId: 'cocktails', name: 'Whiskey Sour',
    description: 'Bourbon, lemon juice, sugar',
    price: 11.00, emoji: '🍋', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'martini', categoryId: 'cocktails', name: 'Dry Martini',
    description: 'Gin, dry vermouth',
    price: 11.00, emoji: '🫒', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },

  // SHOOTERS
  {
    id: 'b52', categoryId: 'shooters', name: 'B-52',
    description: 'Kahlua, Baileys, Grand Marnier',
    price: 6.00, emoji: '🔥', isAlcohol: true, isAvailable: true,
  },
  {
    id: 'kamikaze', categoryId: 'shooters', name: 'Kamikaze',
    description: 'Vodka, triple sec, lime',
    price: 5.00, emoji: '💥', isAlcohol: true, isAvailable: true,
  },
  {
    id: 'tequila-shot', categoryId: 'shooters', name: 'Tequila Shot',
    description: 'Blanco tequila + salt + lime',
    price: 5.00, emoji: '🌵', isAlcohol: true, isAvailable: true,
  },
  {
    id: 'jagerbomb', categoryId: 'shooters', name: 'Jägerbomb',
    description: 'Jägermeister + energy drink',
    price: 7.00, emoji: '💣', isAlcohol: true, isAvailable: true,
  },

  // BEER
  {
    id: 'heineken', categoryId: 'beer', name: 'Heineken 0.5L',
    description: 'Draft lager',
    price: 5.00, emoji: '🍺', isAlcohol: true, isAvailable: true, isPopular: true,
  },
  {
    id: 'corona', categoryId: 'beer', name: 'Corona',
    description: 'Bottle with lime',
    price: 5.50, emoji: '🍋', isAlcohol: true, isAvailable: true,
  },
  {
    id: 'ipa', categoryId: 'beer', name: 'Craft IPA',
    description: 'India pale ale, 0.4L',
    price: 6.50, emoji: '🌾', isAlcohol: true, isAvailable: true,
  },

  // SPIRITS
  {
    id: 'gin-tonic', categoryId: 'spirits', name: 'Gin & Tonic',
    description: '50ml gin, tonic, lime',
    price: 8.00, emoji: '🌿', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'vodka-soda', categoryId: 'spirits', name: 'Vodka Soda',
    description: '50ml vodka, soda',
    price: 7.00, emoji: '💧', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },
  {
    id: 'rum-coke', categoryId: 'spirits', name: 'Rum & Coke',
    description: '50ml rum, cola, lime',
    price: 7.00, emoji: '🥤', isAlcohol: true, isAvailable: true,
    modifierGroups: SPIRIT_MODIFIERS,
  },

  // SOFT DRINKS
  {
    id: 'coke', categoryId: 'soft', name: 'Coca-Cola',
    description: '0.33L bottle',
    price: 3.00, emoji: '🥤', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'water', categoryId: 'soft', name: 'Still Water',
    description: '0.5L',
    price: 2.50, emoji: '💧', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'sparkling', categoryId: 'soft', name: 'Sparkling Water',
    description: '0.5L',
    price: 2.50, emoji: '🫧', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'juice', categoryId: 'soft', name: 'Fresh Juice',
    description: 'Orange, apple, or watermelon',
    price: 5.00, emoji: '🍊', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'energy', categoryId: 'soft', name: 'Red Bull',
    description: '0.25L can',
    price: 5.00, emoji: '⚡', isAlcohol: false, isAvailable: true,
  },

  // FOOD
  {
    id: 'club-sandwich', categoryId: 'food', name: 'Club Sandwich',
    description: 'Toasted, served with fries',
    price: 12.00, emoji: '🥪', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'greek-salad', categoryId: 'food', name: 'Greek Salad',
    description: 'Feta, olives, tomatoes',
    price: 9.00, emoji: '🥗', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'bruschetta', categoryId: 'food', name: 'Bruschetta',
    description: '3 pieces, fresh tomato',
    price: 7.00, emoji: '🍞', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'nachos', categoryId: 'food', name: 'Nachos',
    description: 'Jalapeños, guac, sour cream',
    price: 10.00, emoji: '🌮', isAlcohol: false, isAvailable: true,
  },
  {
    id: 'burger', categoryId: 'food', name: 'Beach Burger',
    description: '200g beef patty with fries',
    price: 14.00, emoji: '🍔', isAlcohol: false, isAvailable: true, isPopular: true,
  },
];

export const getItemsByCategory = (categoryId: string) =>
  MENU_ITEMS.filter((item) => item.categoryId === categoryId);

export const getItemById = (id: string) =>
  MENU_ITEMS.find((item) => item.id === id);
