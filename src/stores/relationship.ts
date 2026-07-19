import { defineStore } from 'pinia'
import api from '@/services/api'

interface RelationshipState {
  partnerName: string
  startDate: string | null // ISO string, la conversion en Date se fait à la consommation
  accentColor: string
  isLoaded: boolean
}

export const useRelationshipStore = defineStore('relationship', {
  state: (): RelationshipState => ({
    partnerName: '',
    startDate: null,
    accentColor: '#FF4D8D',
    isLoaded: false,
  }),

  actions: {
    async fetch() {
      const { data } = await api.get('/relationship')
      this.partnerName = data.partner_name
      this.startDate = data.relationship_start_date
      this.accentColor = data.accent_color
      this.isLoaded = true
    },

    async update(payload: Partial<{ partner_name: string; relationship_start_date: string; accent_color: string }>) {
      const { data } = await api.put('/relationship', payload)
      this.partnerName = data.partner_name
      this.startDate = data.relationship_start_date
      this.accentColor = data.accent_color
    },
  },
})
