// Zambia-specific "utility-first" and safety badges, shown on listings and
// used as searchable filters — off-grid power and water reliability and
// on-site security are common, specific concerns for guests here.
export const SPOT_AMENITIES = [
    {
        key: 'solarPower',
        label: 'Solar Power',
        icon: '☀️',
        formHint: 'Backup solar power on site',
    },
    {
        key: 'boreholeWater',
        label: 'Borehole Water',
        icon: '💧',
        formHint: 'Own borehole, not reliant on municipal water only',
    },
    {
        key: 'backupPower',
        label: 'Backup Power',
        icon: '🔌',
        formHint: 'Inverter or generator for load-shedding',
    },
    {
        key: 'securityVerified',
        label: 'Security Verified',
        icon: '🔒',
        formHint: 'High walls/electric fencing and/or 24/7 guard',
    },
];
