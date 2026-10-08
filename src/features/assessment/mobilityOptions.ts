import { MOBILITY } from './schema';

// 'home_visit' -> 'Home visit'
const toLabel = (value: string) => {
  const words = value.replaceAll('_', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const mobilityOptions = MOBILITY.map((value) => ({ value, label: toLabel(value) }));
