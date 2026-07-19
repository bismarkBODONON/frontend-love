import { ref, watch } from 'vue'
import api from '@/services/api'

type ThemeMode = 'light' | 'dark' | 'system'

export const themeMode = ref<ThemeMode>((localStorage.getItem('theme_mode') as ThemeMode) || 'light')
export const colorTheme = ref(localStorage.getItem('color_theme') || 'pink')
export const fontFamily = ref(localStorage.getItem('font_family') || 'default')
export const wallpaper = ref(localStorage.getItem('wallpaper') || '')

interface Palette {
  accent: string
  pinkDeep: string
  pinkPale: string
  bgLight: string
  bgDark: string
  surfaceLight: string
  surfaceDark: string
  surfaceSoftLight: string
  surfaceSoftDark: string
  textLight: string
  textDark: string
  textSoftLight: string
  textSoftDark: string
  shadow: string
}

/**
 * Palette complète par thème de couleur.
 * "pink" est la palette principale : rose profond et affirmé,
 * fonds légèrement teintés (jamais blanc pur), texte quasi-noir pour un contraste net.
 */
const palettes: { [key: string]: Palette } = {
  pink: {
    accent: '#e4117f',
    pinkDeep: '#e4117f',
    pinkPale: '#f6c9dd',
    bgLight: '#fdf3f7',
    bgDark: '#1a0a14',
    surfaceLight: '#ffffff',
    surfaceDark: '#26101d',
    surfaceSoftLight: '#fbe7f0',
    surfaceSoftDark: '#331528',
    textLight: '#241017',
    textDark: '#fbeaf2',
    textSoftLight: '#6b3550',
    textSoftDark: '#c99cb2',
    shadow: 'rgba(228, 17, 127, 0.18)',
  },
  purple: {
    accent: '#8a5cf6',
    pinkDeep: '#7c3aed',
    pinkPale: '#e4d9fb',
    bgLight: '#faf8ff',
    bgDark: '#140f24',
    surfaceLight: '#ffffff',
    surfaceDark: '#201a33',
    surfaceSoftLight: '#f0eafd',
    surfaceSoftDark: '#2b2340',
    textLight: '#1c1730',
    textDark: '#f1ecfd',
    textSoftLight: '#5b4d7a',
    textSoftDark: '#b8a9dd',
    shadow: 'rgba(124, 58, 237, 0.18)',
  },
  teal: {
    accent: '#1d9e75',
    pinkDeep: '#0f7d5c',
    pinkPale: '#c9ede0',
    bgLight: '#f4fbf8',
    bgDark: '#071a15',
    surfaceLight: '#ffffff',
    surfaceDark: '#0f2a22',
    surfaceSoftLight: '#e3f5ee',
    surfaceSoftDark: '#153a2e',
    textLight: '#0c211a',
    textDark: '#e8faf3',
    textSoftLight: '#3f6a5a',
    textSoftDark: '#93c7b3',
    shadow: 'rgba(15, 125, 92, 0.18)',
  },
  blue: {
    accent: '#378add',
    pinkDeep: '#2570c2',
    pinkPale: '#cfe4f8',
    bgLight: '#f5f9fd',
    bgDark: '#08111f',
    surfaceLight: '#ffffff',
    surfaceDark: '#122238',
    surfaceSoftLight: '#e6f0fb',
    surfaceSoftDark: '#1a2e48',
    textLight: '#0f1c2e',
    textDark: '#eaf3fc',
    textSoftLight: '#3f5972',
    textSoftDark: '#9dc0dd',
    shadow: 'rgba(37, 112, 194, 0.18)',
  },
}

const fonts: { [key: string]: string } = {
  default: "'Inter', sans-serif",
  serif: "'Merriweather', serif",
  rounded: "'Quicksand', sans-serif",
}

function resolveDarkPreference() {
  // Le mode sombre automatique ("system") est désactivé pour l'instant :
  // tant que l'écran Paramètres n'existe pas pour que l'utilisateur
  // choisisse explicitement, on force le clair, peu importe la valeur
  // stockée dans localStorage ou le thème de Windows.
  return themeMode.value === 'dark'
}

export function applyTheme() {
  const isDark = resolveDarkPreference()
  const root = document.documentElement
  const palette = palettes[colorTheme.value] ?? palettes.pink

  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)

  root.style.setProperty('--accent', palette.accent)
  root.style.setProperty('--app-bg', isDark ? palette.bgDark : palette.bgLight)
  root.style.setProperty('--font-app', fonts[fontFamily.value] ?? fonts.default)

  root.style.setProperty('--pink-deep', palette.pinkDeep)
  root.style.setProperty('--pink-pale', palette.pinkPale)
  root.style.setProperty('--pink', palette.pinkDeep)
  root.style.setProperty('--bg', isDark ? palette.bgDark : palette.bgLight)
  root.style.setProperty('--surface', isDark ? palette.surfaceDark : palette.surfaceLight)
  root.style.setProperty('--surface-soft', isDark ? palette.surfaceSoftDark : palette.surfaceSoftLight)
  root.style.setProperty('--text', isDark ? palette.textDark : palette.textLight)
  root.style.setProperty('--text-soft', isDark ? palette.textSoftDark : palette.textSoftLight)
  root.style.setProperty('--shadow-pink', palette.shadow)
  root.style.setProperty('--font-display', "'Playfair Display', serif")

  if (wallpaper.value) {
    root.style.setProperty('--wallpaper', `url(${wallpaper.value})`)
  } else {
    root.style.removeProperty('--wallpaper')
  }
}

export async function loadThemeFromServer() {
  try {
    const { data } = await api.get('/settings')
    themeMode.value = data.theme_mode
    colorTheme.value = data.color_theme
    fontFamily.value = data.font_family
    wallpaper.value = data.wallpaper ? `/storage/${data.wallpaper}` : ''
    persistLocally()
    applyTheme()
  } catch {
    applyTheme()
  }
}

function persistLocally() {
  localStorage.setItem('theme_mode', themeMode.value)
  localStorage.setItem('color_theme', colorTheme.value)
  localStorage.setItem('font_family', fontFamily.value)
  localStorage.setItem('wallpaper', wallpaper.value)
}

export async function saveTheme() {
  persistLocally()
  applyTheme()
  await api.put('/settings', {
    theme_mode: themeMode.value,
    color_theme: colorTheme.value,
    font_family: fontFamily.value,
  })
}

applyTheme()

watch(() => window.matchMedia('(prefers-color-scheme: dark)'), applyTheme)