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
} as const;

export const ArcanaIdentityNames = Object.fromEntries(
  Object.entries(ArcanaIdentities).map(([k, v]) => [v, k])
);

export type ArcanaIdentity = keyof typeof ArcanaIdentities;
export type ArcanaIdentityIndex = typeof ArcanaIdentities[keyof typeof ArcanaIdentities];