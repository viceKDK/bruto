/**
 * Ghost Names Pool - Story 9.3
 * 
 * Pool of 100+ unique names for AI-generated ghost brutos.
 * Inspired by classic El Bruto naming style.
 */

export const GHOST_NAMES_POOL: string[] = [
  // Classic warrior names
  'Brutus', 'Magnus', 'Rex', 'Maximus', 'Goliath',
  'Thor', 'Odin', 'Zeus', 'Ares', 'Hercules',
  'Atlas', 'Titan', 'Spartan', 'Gladiator', 'Warrior',
  
  // Aggressive names
  'Crusher', 'Smasher', 'Destroyer', 'Annihilator', 'Terminator',
  'Punisher', 'Executioner', 'Slayer', 'Hunter', 'Predator',
  'Beast', 'Savage', 'Rampage', 'Fury', 'Rage',
  
  // Tough names
  'Tank', 'Boulder', 'Steel', 'Iron', 'Hammer',
  'Anvil', 'Forge', 'Stone', 'Rock', 'Mountain',
  'Granite', 'Fortress', 'Bastion', 'Citadel', 'Stronghold',
  
  // Speed/Agility names
  'Lightning', 'Thunder', 'Storm', 'Tempest', 'Hurricane',
  'Viper', 'Cobra', 'Python', 'Serpent', 'Shadow',
  'Phantom', 'Ghost', 'Shade', 'Spectre', 'Wraith',
  
  // Animal-inspired
  'Bear', 'Wolf', 'Tiger', 'Lion', 'Panther',
  'Rhino', 'Bull', 'Ram', 'Boar', 'Gorilla',
  'Eagle', 'Hawk', 'Falcon', 'Raven', 'Vulture',
  
  // Elemental
  'Inferno', 'Blaze', 'Flame', 'Ember', 'Volcano',
  'Frost', 'Glacier', 'Iceberg', 'Blizzard', 'Avalanche',
  'Quake', 'Tremor', 'Seismic', 'Crater', 'Meteor',
  
  // Legendary/Mythical
  'Dragon', 'Phoenix', 'Hydra', 'Kraken', 'Leviathan',
  'Chimera', 'Minotaur', 'Cyclops', 'Cerberus', 'Medusa',
  'Valkyrie', 'Berserker', 'Viking', 'Samurai', 'Ninja',
  
  // Dark/Evil
  'Reaper', 'Demon', 'Devil', 'Hellfire', 'Infernal',
  'Doom', 'Death', 'Skull', 'Bones', 'Grave',
  
  // Unique/Creative
  'Chaos', 'Havoc', 'Mayhem', 'Carnage', 'Rampage',
  'Venom', 'Toxin', 'Plague', 'Virus', 'Epidemic',
  'Nova', 'Supernova', 'Pulsar', 'Quasar', 'Nebula',
  'Apex', 'Omega', 'Alpha', 'Prime', 'Ultimate',
];

/**
 * Validate that pool has enough unique names
 */
export function validateGhostNamesPool(): boolean {
  const uniqueNames = new Set(GHOST_NAMES_POOL);
  const hasEnough = uniqueNames.size >= 100;
  const noEmpty = GHOST_NAMES_POOL.every(name => name.length > 0);
  
  return hasEnough && noEmpty;
}
