import { calcKg } from './emissionFactors.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function buildSampleActivities() {
  return [
    { id: uid(), category: 'transport', activity: 'car_petrol', label: 'Car (petrol)',      quantity: 24,  unit: 'km',      kg: calcKg('transport','car_petrol', 24),  date: daysAgo(6) },
    { id: uid(), category: 'food',      activity: 'beef',        label: 'Beef meal',          quantity: 1,   unit: 'meal',    kg: calcKg('food','beef', 1),              date: daysAgo(6) },
    { id: uid(), category: 'home',      activity: 'electricity', label: 'Electricity',        quantity: 14,  unit: 'kWh',     kg: calcKg('home','electricity', 14),      date: daysAgo(5) },
    { id: uid(), category: 'transport', activity: 'bus',         label: 'Bus',                quantity: 8,   unit: 'km',      kg: calcKg('transport','bus', 8),          date: daysAgo(5) },
    { id: uid(), category: 'food',      activity: 'chicken',     label: 'Chicken meal',       quantity: 2,   unit: 'meals',   kg: calcKg('food','chicken', 2),           date: daysAgo(4) },
    { id: uid(), category: 'things',    activity: 'coffee',      label: 'Takeaway coffee',    quantity: 3,   unit: 'cups',    kg: calcKg('things','coffee', 3),          date: daysAgo(4) },
    { id: uid(), category: 'food',      activity: 'vegetarian',  label: 'Vegetarian meal',    quantity: 1,   unit: 'meal',    kg: calcKg('food','vegetarian', 1),        date: daysAgo(3) },
    { id: uid(), category: 'transport', activity: 'car_petrol',  label: 'Car (petrol)',        quantity: 18,  unit: 'km',      kg: calcKg('transport','car_petrol', 18), date: daysAgo(3) },
    { id: uid(), category: 'home',      activity: 'natural_gas', label: 'Natural gas',         quantity: 8,   unit: 'kWh',     kg: calcKg('home','natural_gas', 8),      date: daysAgo(2) },
    { id: uid(), category: 'things',    activity: 'streaming',   label: 'Streaming video',     quantity: 3,   unit: 'hrs',     kg: calcKg('things','streaming', 3),      date: daysAgo(2) },
    { id: uid(), category: 'food',      activity: 'vegan',       label: 'Vegan meal',          quantity: 1,   unit: 'meal',    kg: calcKg('food','vegan', 1),             date: daysAgo(1) },
    { id: uid(), category: 'transport', activity: 'train',       label: 'Train',               quantity: 30,  unit: 'km',      kg: calcKg('transport','train', 30),      date: daysAgo(1) },
  ]
}

export function buildSampleHistory(goal) {
  return [
    { week: daysAgo(42), total: 52, goal },
    { week: daysAgo(35), total: 44, goal },
    { week: daysAgo(28), total: 47, goal },
    { week: daysAgo(21), total: 39, goal },
    { week: daysAgo(14), total: 35, goal },
    { week: daysAgo(7),  total: 41, goal },
  ]
}
