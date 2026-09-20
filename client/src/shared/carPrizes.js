// TODO: מערך זמני - להחליף את הרשימה בפרסים האמיתיים של משחק המכוניות.
// כל פרס: { label, icon, value: { color, emoji } }. אפשר להוסיף kind ו-recommendedLevel.
// CAR_OFFERS_SKIP: האם פרס "דילוג לשלב הבא" מוצג תמיד לצד הפרסים.

export const CAR_OFFERS_SKIP = true;

const CAR_PRIZE_LIST = [
  { label: 'מכונית אדומה', icon: '🚗', value: { color: '#ef4444', emoji: '🚗' } },
  { label: 'מכונית כחולה', icon: '🚙', value: { color: '#3b82f6', emoji: '🚙' } },
  { label: 'מכונית ירוקה', icon: '🚗', value: { color: '#22c55e', emoji: '🚗' } },
  { label: 'מכונית סגולה', icon: '🚙', value: { color: '#a855f7', emoji: '🚙' } },
  { label: 'מכונית ורודה', icon: '🚕', value: { color: '#ec4899', emoji: '🚕' } },
  { label: 'מכונית תכולה', icon: '🚗', value: { color: '#06b6d4', emoji: '🚗' } },
  { label: 'מכונית כתומה', icon: '🏎️', value: { color: '#f97316', emoji: '🏎️' } },
  { label: 'מכונית צהובה', icon: '🚕', value: { color: '#eab308', emoji: '🚕' } },
];

export const CAR_PRIZES = CAR_PRIZE_LIST.map((prize, index) => ({
  id: `car-prize-${index + 1}`,
  kind: 'color',
  appliesTo: 'car',
  recommendedLevel: 1,
  ...prize,
}));
