export const BADGE_DEFINITIONS = [
  {
    id: 'first_week_under',
    name: 'First Week Under Budget',
    description: 'Stay under your weekly carbon budget',
    emoji: '🏆',
    condition: (d) => d.netTotal < d.goal && d.goal > 0,
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Log activities for 7 days in a row',
    emoji: '🔥',
    condition: (d) => d.streakCount >= 7,
  },
  {
    id: 'plant_powered',
    name: 'Plant-Powered',
    description: 'Log 5 vegetarian or vegan meals',
    emoji: '🌱',
    condition: (d) => d.vegMealCount >= 5,
  },
  {
    id: 'grounded',
    name: 'Grounded',
    description: 'Go a full week with no flights logged',
    emoji: '🌍',
    condition: (d) => d.weekNoFlight && d.activitiesLogged >= 3,
  },
  {
    id: 'challenger',
    name: 'Challenger',
    description: 'Complete 3 or more weekly challenges',
    emoji: '⚡',
    condition: (d) => d.challengesCompleted >= 3,
  },
]
