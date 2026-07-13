// Categories for "Experience Bookings" — safaris, tours, transport and other
// local add-ons hosts/providers can sell alongside (or independent of) a stay.
export const EXPERIENCE_CATEGORIES = [
    { key: 'safari', label: 'Safari', icon: '🦁' },
    { key: 'water', label: 'Water & River', icon: '🚣' },
    { key: 'culture', label: 'Culture & Tours', icon: '🎭' },
    { key: 'transport', label: 'Transport', icon: '🚐' },
    { key: 'chef', label: 'Private Chef', icon: '🍲' },
];

export const getCategoryMeta = (key) =>
    EXPERIENCE_CATEGORIES.find((c) => c.key === key) || { key, label: key, icon: '✨' };
