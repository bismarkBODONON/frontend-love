import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface Track {
  id: number
  title: string
  artist: string | null
  cover_path: string | null
  audio_path: string
  lyrics: string | null
  duration: number | null
  is_favorite: boolean
}

const storageBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export function fileUrl(path: string | null) {
  if (!path) return ''
  return `${storageBaseUrl}/storage/${path}`
}

export const useMusicStore = defineStore('music', () => {
  const tracks = ref<Track[]>([])
  const currentIndex = ref<number | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const audio = new Audio()

  const currentTrack = computed(() =>
    currentIndex.value !== null ? tracks.value[currentIndex.value] : null
  )

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
  })
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio.duration
  })
  audio.addEventListener('ended', () => {
    next()
  })

  async function loadTracks() {
    const { data } = await api.get<Track[]>('/musics')
    tracks.value = data
  }

  function playTrackAt(index: number) {
    currentIndex.value = index
    const track = tracks.value[index]
    if (!track) return
    audio.src = fileUrl(track.audio_path)
    audio.play()
    isPlaying.value = true
  }

  function togglePlay() {
    if (!currentTrack.value) return
    if (isPlaying.value) {
      audio.pause()
      isPlaying.value = false
    } else {
      audio.play()
      isPlaying.value = true
    }
  }

  function next() {
    if (currentIndex.value === null || tracks.value.length === 0) return
    playTrackAt((currentIndex.value + 1) % tracks.value.length)
  }

  function prev() {
    if (currentIndex.value === null || tracks.value.length === 0) return
    playTrackAt((currentIndex.value - 1 + tracks.value.length) % tracks.value.length)
  }

  function seek(time: number) {
    audio.currentTime = time
  }

  async function toggleFavorite(track: Track) {
    track.is_favorite = !track.is_favorite
    await api.put(`/musics/${track.id}`, { is_favorite: track.is_favorite })
  }

  return {
    tracks, currentIndex, isPlaying, currentTime, duration,
    currentTrack, loadTracks, playTrackAt, togglePlay,
    next, prev, seek, toggleFavorite,
  }
})