import type { TopicCard } from '../types'

export const TOPIC_CARDS: TopicCard[] = [
  { id: 'space',         label: 'Space & Rockets',     emoji: '🚀' },
  { id: 'dinosaurs',     label: 'Dinosaurs',           emoji: '🦖' },
  { id: 'animals',       label: 'Animals',             emoji: '🐾' },
  { id: 'ocean',         label: 'Ocean & Sea',         emoji: '🌊' },
  { id: 'robots',        label: 'Robots',              emoji: '🤖' },
  { id: 'cars',          label: 'Cars & Racing',       emoji: '🏎️' },
  { id: 'sports',        label: 'Sports',              emoji: '⚽' },
  { id: 'cooking',       label: 'Cooking & Food',      emoji: '🍳' },
  { id: 'music',         label: 'Music',               emoji: '🎵' },
  { id: 'art',           label: 'Art & Drawing',       emoji: '🎨' },
  { id: 'building',      label: 'Building Things',     emoji: '🏗️' },
  { id: 'magic',         label: 'Magic & Wizards',     emoji: '✨' },
  { id: 'superheroes',   label: 'Superheroes',         emoji: '🦸' },
  { id: 'math',          label: 'Math Puzzles',        emoji: '🔢' },
  { id: 'coding',        label: 'Coding',              emoji: '💻' },
  { id: 'nature',        label: 'Nature & Forests',    emoji: '🌳' },
  { id: 'weather',       label: 'Weather & Storms',    emoji: '⛈️' },
  { id: 'history',       label: 'Ancient History',     emoji: '🏛️' },
  { id: 'mythology',     label: 'Mythology',           emoji: '🐉' },
  { id: 'skateboarding', label: 'Skateboarding',       emoji: '🛹' },
  { id: 'pets',          label: 'Pets',                emoji: '🐶' },
  { id: 'trains',        label: 'Trains & Vehicles',   emoji: '🚂' },
  { id: 'crafts',        label: 'Crafts & Origami',    emoji: '🎎' },
  { id: 'mystery',       label: 'Mystery & Detective', emoji: '🔍' },
]

export const TOPIC_CARDS_BY_ID: Record<string, TopicCard> = Object.fromEntries(
  TOPIC_CARDS.map(c => [c.id, c]),
)
