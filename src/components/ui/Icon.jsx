import {
  Baby,
  Cake,
  Gem,
  Heart,
  Package,
  Palette,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trees,
  Truck,
} from 'lucide-react'

/**
 * Services and studio values store their icon as a name, so the set that can
 * appear is listed explicitly here rather than importing all of lucide-react.
 */
const glyphs = {
  Baby,
  Cake,
  Gem,
  Heart,
  Package,
  Palette,
  PartyPopper,
  ShieldCheck,
  Trees,
  Truck,
}

export default function Icon({ name, ...props }) {
  const Glyph = glyphs[name] ?? Sparkles
  return <Glyph {...props} />
}
