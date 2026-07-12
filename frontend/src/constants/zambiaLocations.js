// Shared Zambia location data used across the Create Spot form and destination browsing.

// Zambia's 10 provinces
export const ZAMBIA_PROVINCES = [
    'Central',
    'Copperbelt',
    'Eastern',
    'Luapula',
    'Lusaka',
    'Muchinga',
    'North-Western',
    'Northern',
    'Southern',
    'Western',
];

// Real neighborhoods per town, offered as suggestions for the street address field.
// Focused on Lusaka, Livingstone and the Copperbelt towns, where most early hosts/testers are based.
export const CITY_SUBURBS = {
    Lusaka: [
        'Kabulonga', 'Roma', 'Woodlands', 'Longacres', 'Rhodes Park', 'Ibex Hill',
        'Makeni', 'Kabwata', 'Chilenje', 'Avondale', 'Kalundu', 'Kamwala', 'Chelston', 'Chalala',
    ],
    Kitwe: [
        'Parklands', 'Riverside', 'Buchi', 'Chimwemwe', 'Kwacha', 'Nkana East',
        'Nkana West', 'Garneton', 'Ndeke', 'Wusakile', 'Mindolo', 'Race Course',
    ],
    Ndola: [
        'Itawa', 'Kansenshi', 'Northrise', 'Nkwazi', 'Chipulukusu', 'Hillcrest',
        'Twapia', 'Masala', 'Lubuto', 'Mushili',
    ],
    Chingola: [
        'Chingola Central', 'Nchanga North', 'Chiwempala', 'Chanyama', 'Malemba', 'Mikiloni',
    ],
    Mufulira: [
        'Mufulira Central', 'Fairview', 'Kankoyo', 'Kantanshi', 'Itimpi', 'Kawama',
    ],
    Luanshya: [
        'Central Luanshya', 'Roan', 'Mpatamatu', 'Mikomfwa',
    ],
    Livingstone: [
        'Maramba', 'Libuyu', 'Dambwa', 'Linda', 'Town Centre',
    ],
};

// Towns offered as suggestions for the city field — Lusaka, Livingstone and the Copperbelt
export const ZAMBIA_CITIES = [
    'Lusaka',
    'Livingstone',
    'Kitwe',
    'Ndola',
    'Chingola',
    'Mufulira',
    'Luanshya',
    'Kalulushi',
    'Chililabombwe',
];

// Auto-fill the province dropdown when a recognized city is typed/selected
export const CITY_TO_PROVINCE = {
    Lusaka: 'Lusaka',
    Livingstone: 'Southern',
    Kitwe: 'Copperbelt',
    Ndola: 'Copperbelt',
    Chingola: 'Copperbelt',
    Mufulira: 'Copperbelt',
    Luanshya: 'Copperbelt',
    Kalulushi: 'Copperbelt',
    Chililabombwe: 'Copperbelt',
};

// Curated destinations shown on the landing page's "Browse by city" picker,
// with a short tagline for each, mirroring Airbnb's destination-card pattern.
export const FEATURED_DESTINATIONS = [
    { city: 'Lusaka', tagline: 'The capital' },
    { city: 'Livingstone', tagline: 'Victoria Falls' },
    { city: 'Kitwe', tagline: 'Copperbelt' },
    { city: 'Ndola', tagline: 'Copperbelt' },
    { city: 'Chingola', tagline: 'Copperbelt' },
    { city: 'Mufulira', tagline: 'Copperbelt' },
    { city: 'Luanshya', tagline: 'Copperbelt' },
];
