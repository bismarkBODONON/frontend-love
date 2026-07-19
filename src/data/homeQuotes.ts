export const homeQuotes: string[] = [
  "L'amour ne se voit pas avec les yeux, mais avec le cœur.",
  "Chaque jour à tes côtés est un cadeau.",
  "Tu es mon aujourd'hui et tous mes lendemains.",
  "Avec toi, même les silences sont doux.",
  "Notre histoire est mon histoire préférée.",
]

/**
 * Retourne une citation au hasard dans la liste.
 */
export function getRandomQuote(): string {
  const index = Math.floor(Math.random() * homeQuotes.length)
  return homeQuotes[index]
}