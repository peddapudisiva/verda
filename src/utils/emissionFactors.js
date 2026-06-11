export const EMISSION_FACTORS = {
  transport: {
    car_petrol: { label: 'Car (petrol)',  factor: 0.192,  unit: 'km',      unitLabel: 'km',      emoji: '🚗' },
    car_ev:     { label: 'Car (EV)',      factor: 0.053,  unit: 'km',      unitLabel: 'km',      emoji: '⚡' },
    bus:        { label: 'Bus',           factor: 0.105,  unit: 'km',      unitLabel: 'km',      emoji: '🚌' },
    train:      { label: 'Train',         factor: 0.041,  unit: 'km',      unitLabel: 'km',      emoji: '🚆' },
    flight:     { label: 'Flight',        factor: 0.255,  unit: 'km',      unitLabel: 'km',      emoji: '✈️' },
    bike:       { label: 'Bike / Walk',   factor: 0,      unit: 'km',      unitLabel: 'km',      emoji: '🚴' },
  },
  food: {
    beef:        { label: 'Beef meal',         factor: 6.6,  unit: 'meal',    unitLabel: 'meals',   emoji: '🥩' },
    chicken:     { label: 'Chicken meal',      factor: 1.8,  unit: 'meal',    unitLabel: 'meals',   emoji: '🍗' },
    vegetarian:  { label: 'Vegetarian meal',   factor: 0.9,  unit: 'meal',    unitLabel: 'meals',   emoji: '🥗' },
    vegan:       { label: 'Vegan meal',        factor: 0.6,  unit: 'meal',    unitLabel: 'meals',   emoji: '🌱' },
    dairy:       { label: 'Dairy serving',     factor: 1.4,  unit: 'serving', unitLabel: 'servings',emoji: '🧀' },
  },
  home: {
    electricity:  { label: 'Electricity',    factor: 0.475,  unit: 'kWh', unitLabel: 'kWh',    emoji: '💡' },
    natural_gas:  { label: 'Natural gas',    factor: 0.184,  unit: 'kWh', unitLabel: 'kWh',    emoji: '🔥' },
    hot_water:    { label: 'Hot water',      factor: 0.0011, unit: 'L',   unitLabel: 'litres', emoji: '🚿' },
  },
  things: {
    clothing: { label: 'New clothing item', factor: 12,    unit: 'item',   unitLabel: 'items',   emoji: '👕' },
    streaming:{ label: 'Streaming video',   factor: 0.055, unit: 'hr',    unitLabel: 'hours',   emoji: '📺' },
    coffee:   { label: 'Takeaway coffee',   factor: 0.21,  unit: 'cup',   unitLabel: 'cups',    emoji: '☕' },
    delivery: { label: 'Parcel delivery',   factor: 0.5,   unit: 'parcel',unitLabel: 'parcels', emoji: '📦' },
  },
}

export const CATEGORY_META = {
  transport: { label: 'Transport', emoji: '🚗', color: '#C4714A' },
  food:      { label: 'Food',      emoji: '🍽️', color: '#C8973A' },
  home:      { label: 'Home',      emoji: '🏠', color: '#6B8C5A' },
  things:    { label: 'Things',    emoji: '📦', color: '#8B6CA8' },
}

export function calcKg(category, activityKey, quantity) {
  const entry = EMISSION_FACTORS[category]?.[activityKey]
  if (!entry) return 0
  return Math.round(entry.factor * quantity * 100) / 100
}
