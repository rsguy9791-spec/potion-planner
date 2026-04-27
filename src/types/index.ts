export type IngredientId = string

/** Named alias for recipe group keys (e.g. 'vuln_bomb'). Kept as string for simplicity. */
export type RecipeGroup = string

export type PotionDose = 1 | 2 | 3 | 4 | 6

export type IngredientKind =
  | 'herb'
  | 'unfinished_potion'
  | 'secondary'
  | 'potion'
  | 'vial'
  | 'misc'

export type PotionCategory =
  | 'unfinished'
  | 'regular'
  | 'super'
  | 'extreme'
  | 'renewals'
  | 'combination'
  | 'overload'
  | 'bombs'
  | 'powerbursts'

export type SecondaryMode = 'default' | 'use_available' | 'skip'

export interface PerksConfiguration {
  scrollOfCleansing: boolean
  factoryOutfit: boolean
  modifiedBotanistMask: boolean
  portableWell: boolean
  broochOfTheGods: boolean
  /** 0–6 — additive XP % from clan fealty rank. */
  clanFealtyPercent: number
  /** 0–6 — additive XP % from botanist's outfit pieces (1% per piece, 6% at full 5-piece set). */
  botanistXpPercent: number
  perfectJujuPotion: boolean
  /** 0–∞ — additive XP % from other sources. */
  customXpPercent: number
}

export const DEFAULT_CONFIG: PerksConfiguration = {
  scrollOfCleansing: false,
  factoryOutfit: false,
  modifiedBotanistMask: false,
  portableWell: false,
  broochOfTheGods: false,
  clanFealtyPercent: 0,
  botanistXpPercent: 0,
  perfectJujuPotion: false,
  customXpPercent: 0,
}

export interface RecipeIngredient {
  id: IngredientId
  kind: IngredientKind
  qty: number
  dose?: PotionDose // only when kind === 'potion'
  /** When explicitly false, scroll of cleansing saving is suppressed for this input. */
  cleansingSaveable?: false
}

export interface Recipe {
  id: IngredientId
  name: string
  levelRequired: number
  inputs: RecipeIngredient[]
  outputDose: PotionDose
  /** Groups level-variant recipes under a shared key (e.g. 'vuln_bomb') */
  recipeGroup?: RecipeGroup
  /** Short label shown in the tier selector when level alone doesn't distinguish variants */
  variantLabel?: string
  category: PotionCategory
  /** Whether the output potion can be bought on the Grand Exchange. Defaults to true. */
  tradeable?: boolean
  /** XP gained per craft execution. 0 for unfinished-potion recipes. */
  xpPerCraft: number
}

export interface IngredientDef {
  id: IngredientId
  name: string
  kind: IngredientKind
  /** For herbs: the paired herb id (clean ↔ grimy). For unfinished potions: the herb id that produces this unf. */
  pairedHerbId?: IngredientId
  /** Whether this ingredient can be bought on the Grand Exchange. Defaults to true. */
  tradeable?: boolean
}

export interface HerbSupply {
  cleanQty: number
  grimyQty: number
  unfQty: number
}

export interface PotionSupply {
  threeDose: number
  fourDose: number
  sixDose: number
}

export interface CalculatorInputs {
  herbloreLevel: number
  /** Keyed by clean herb id (canonical). Grimy herbs of same type are merged here. */
  herbSupply: Map<IngredientId, HerbSupply>
  /** Non-herb, non-potion ingredients (secondaries, misc) */
  itemSupply: Map<IngredientId, number>
  /** Intermediate potions already in inventory */
  potionSupply: Map<IngredientId, PotionSupply>
  /** Per-secondary gathering mode. Absent key = 'default'. */
  secondaryModes: Map<IngredientId, SecondaryMode>
  /** Recipe IDs (or recipeGroup keys) the user has disabled. Calculator treats them as required purchases. */
  disabledRecipes: Set<IngredientId>
  /**
   * Preferred recipe tier per group key.
   * Maps recipeGroup → chosen recipe id.
   * When absent the calculator uses the highest unlocked tier as before.
   */
  preferredRecipeTier: Map<RecipeGroup, IngredientId>
  perks: PerksConfiguration
}

export interface TargetPotion {
  potionId: IngredientId
  qty: number
}

export interface IngredientResult {
  id: IngredientId
  name: string
  kind: IngredientKind
  totalNeeded: number
  /** Unmodified quantity as if scroll of cleansing were inactive. Equals totalNeeded when scroll is off or ingredient is not saveable. */
  rawQty: number
  currentlyHave: number
  stillNeeded: number
  /** Whether this ingredient can be purchased on the Grand Exchange. */
  tradeable: boolean
}

export interface CraftStep {
  potionId: IngredientId
  name: string
  category: PotionCategory
  /** Whether this is an unfinished-potion step or a regular finishing step. */
  stepKind: 'potion' | 'unfinished'
  /** Number of recipe executions (= number of output potions produced) */
  crafts: number
  outputDose: PotionDose
  inputs: Array<{
    id: IngredientId
    name: string
    kind: IngredientKind
    /** Quantity required after scroll of cleansing savings. */
    qty: number
    /** Quantity required without scroll of cleansing. Equal to qty when scroll is inactive or ingredient is not saveable. */
    rawQty: number
    dose?: PotionDose
    /**
     * When this potion input must be decanted from its crafted dose before use.
     * `fromDose` = the dose the potion was crafted at; `fromCount` = how many of those to decant.
     */
    decantFrom?: { fromDose: PotionDose; fromCount: number }
  }>
  /** XP gained in this step (post-boost). 0 for unfinished-potion steps. */
  xpGained: number
}

export interface ShortfallItem {
  id: IngredientId
  name: string
  /** How many are needed that cannot be obtained (untradeable + not craftable). */
  qty: number
}

export interface TargetAchievability {
  potionId: IngredientId
  name: string
  requested: number
  /** Maximum actually achievable given untradeable constraints. */
  possible: number
}

export interface CalculationResult {
  targets: Array<{ name: string; qty: number }>
  ingredients: IngredientResult[]
  steps: CraftStep[]
  /** Items needed but impossible to purchase (untradeable + not craftable in chain). */
  shortfalls: ShortfallItem[]
  /** Per-target achievability when shortfalls are present. */
  achievability: TargetAchievability[]
}
