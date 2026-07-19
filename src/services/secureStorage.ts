import { Capacitor } from '@capacitor/core'
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'

/**
 * Couche d'abstraction au-dessus du stockage sécurisé natif.
 *
 * capacitor-secure-storage-plugin ne fonctionne que sur un appareil
 * natif (Android/iOS). En développement web (npm run dev dans le
 * navigateur), on retombe sur localStorage pour ne pas bloquer le
 * travail quotidien. Sur le téléphone réel, tout passe par le
 * Keystore Android (chiffré), de façon totalement transparente pour
 * le reste du code.
 */

const isNative = Capacitor.isNativePlatform()

export async function secureGet(key: string): Promise<string | null> {
  if (!isNative) {
    return localStorage.getItem(key)
  }
  try {
    const result = await SecureStoragePlugin.get({ key })
    return result.value
  } catch {
    // Le plugin lève une erreur si la clé n'existe pas encore (pas de session).
    return null
  }
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (!isNative) {
    localStorage.setItem(key, value)
    return
  }
  await SecureStoragePlugin.set({ key, value })
}

export async function secureRemove(key: string): Promise<void> {
  if (!isNative) {
    localStorage.removeItem(key)
    return
  }
  try {
    await SecureStoragePlugin.remove({ key })
  } catch {
    // Rien à supprimer, on ignore l'erreur.
  }
}