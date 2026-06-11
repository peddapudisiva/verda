// 1 tree absorbs ~21 kg CO2/year; 1 km driving ~0.192 kg; 1 phone charge ~0.005 kg
export function getEquivalencies(kg) {
  if (!kg || kg <= 0) return []
  return [
    {
      emoji: '🌳',
      label: `${(kg / 21).toFixed(1)} trees absorbing for a year`,
    },
    {
      emoji: '🚗',
      label: `${Math.round(kg / 0.192)} km driving`,
    },
    {
      emoji: '📱',
      label: `${Math.round(kg / 0.005).toLocaleString()} phone charges`,
    },
  ]
}
