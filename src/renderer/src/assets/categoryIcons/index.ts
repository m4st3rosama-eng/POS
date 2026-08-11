import coffee from './coffee.svg'
import drinks from './drinks.svg'
import cakes from './cakes.svg'
import cookies from './cookies.svg'
import appetizers from './appetizers.svg'
import breakfast from './breakfast.svg'
import parathas from './parathas.svg'
import main from './main.svg'
import tea from './tea.svg'
import traditional from './traditional.svg'
import bread from './bread.svg'

export const categoryIcons: Record<string, string> = {
  coffee,
  drinks,
  cakes,
  cookies,
  appetizers,
  breakfast,
  parathas,
  main,
  tea,
  traditional,
  bread
}

/** Resolves a MenuItem.imageRef to a displayable src: a custom uploaded photo (data URL) or a category icon. */
export function getItemImageSrc(imageRef: string): string {
  if (imageRef.startsWith('data:')) return imageRef
  return categoryIcons[imageRef] ?? categoryIcons.main
}
