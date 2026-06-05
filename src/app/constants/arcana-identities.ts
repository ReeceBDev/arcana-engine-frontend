export const ArcanaIdentities = {
    BACK: -1,
    THE_FOOL: 0,
    THE_MAGUS: 1,
    THE_PRIESTESS: 2,
    THE_EMPRESS: 3,  
    THE_EMPEROR: 4,  
    THE_HIEROPHANT: 5, 
    THE_LOVERS: 6,   
    THE_CHARIOT: 7,  
    ADJUSTMENT: 8,   
    THE_HERMIT: 9,   
    FORTUNE: 10,     
    LUST: 11,        
    THE_HANGED_MAN: 12,
    DEATH: 13,       
    ART: 14,         
    THE_DEVIL: 15,   
    THE_TOWER: 16,   
    THE_STAR: 17,    
    THE_MOON: 18,    
    THE_SUN: 19,     
    THE_AEON: 20,    
    THE_UNIVERSE: 21,

    // Cups (offset 100)
    ACE_OF_CUPS: 101,
    LOVE: 102,
    ABUNDANCE: 103,
    LUXURY: 104,
    DISAPPOINTMENT: 105,
    PLEASURE: 106,
    DEBAUCH: 107,
    INDOLENCE: 108,
    HAPPINESS: 109,
    SATIETY: 110,
    PRINCESS_OF_CUPS: 111,
    PRINCE_OF_CUPS: 112,
    QUEEN_OF_CUPS: 113,
    KNIGHT_OF_CUPS: 114,

    // Disks (offset 200)
    ACE_OF_DISKS: 201,
    CHANGE: 202,
    WORKS: 203,
    POWER: 204,
    WORRY: 205,
    SUCCESS: 206,
    FAILURE: 207,
    PRUDENCE: 208,
    GAIN: 209,
    WEALTH: 210,
    PRINCESS_OF_DISKS: 211,
    PRINCE_OF_DISKS: 212,
    QUEEN_OF_DISKS: 213,
    KNIGHT_OF_DISKS: 214,

    // Swords (offset 300)
    ACE_OF_SWORDS: 301,
    PEACE: 302,
    SORROW: 303,
    TRUCE: 304,
    DEFEAT: 305,
    SCIENCE: 306,
    FUTILITY: 307,
    INTERFERENCE: 308,
    CRUELTY: 309,
    RUIN: 310,
    PRINCESS_OF_SWORDS: 311,
    PRINCE_OF_SWORDS: 312,
    QUEEN_OF_SWORDS: 313,
    KNIGHT_OF_SWORDS: 314,

    // Wands (offset 400)
    ACE_OF_WANDS: 401,
    DOMINION: 402,
    VIRTUE: 403,
    COMPLETION: 404,
    STRIFE: 405,
    VICTORY: 406,
    VALOUR: 407,
    SWIFTNESS: 408,
    STRENGTH: 409,
    OPPRESSION: 410,
    PRINCESS_OF_WANDS: 411,
    PRINCE_OF_WANDS: 412,
    QUEEN_OF_WANDS: 413,
    KNIGHT_OF_WANDS: 414,

    // Special
    THELEMA: 500,
} as const;

export const ArcanaIdentityNames = Object.fromEntries(
  Object.entries(ArcanaIdentities).map(([k, v]) => [v, k])
);

export type ArcanaIdentity = keyof typeof ArcanaIdentities;
export type ArcanaIdentityIndex = typeof ArcanaIdentities[keyof typeof ArcanaIdentities];