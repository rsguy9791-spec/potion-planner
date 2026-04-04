import type { PotionCategory } from '@/types'

export const CATEGORY_ORDER: readonly PotionCategory[] = [
  'overload',
  'combination',
  'bombs',
  'powerbursts',
  'extreme',
  'renewals',
  'super',
  'regular',
]

export const CATEGORY_LABELS: Record<PotionCategory, string> = {
  overload:     'Overloads',
  combination:  'Combination',
  bombs:        'Bombs',
  powerbursts:  'Powerbursts',
  extreme:      'Extreme',
  renewals:     'Renewals',
  super:        'Super',
  regular:      'Regular',
}

export const POPULAR_POTION_IDS: readonly string[] = [
  'elder_overload_salve',
  'elder_overload',
  'holy_overload',
  'aggroverload',
  'overload',
  'adrenaline_renewal_115',
  'weapon_poison_ppp',
  'super_restore',
  'saradomin_brew',
  'vuln_bomb_103',
]
