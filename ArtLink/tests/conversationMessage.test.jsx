import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../src/services/apiClient'
import {
  findConversationBetweenUsers,
  createConversationIfNeeded,
  getConversationById,
  listConversationsForUser,
  sendMessage,
  getMessagesByConversation,
  markConversationAsRead,
} from '../src/services/conversationService'

describe('conversationService & messageService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('findConversationBetweenUsers', () => {
    it('compara IDs usando String() e ignora el orden de participantes', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          {
            id: 'conv-123',
            participantIds: ['user-beta', 'user-alpha'],
            isDemoData: false,
          },
        ],
      })

      const found = await findConversationBetweenUsers('user-alpha', 'user-beta')
      expect(found).not.toBeNull()
      expect(found?.id).toBe('conv-123')
    })

    it('ignora conversaciones con isDemoData: true', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          {
            id: 'conv-demo',
            participantIds: ['user-1', 'user-2'],
            isDemoData: true,
          },
        ],
      })

      const found = await findConversationBetweenUsers('user-1', 'user-2')
      expect(found).toBeNull()
    })
  })

  describe('createConversationIfNeeded', () => {
    it('reutiliza conversación existente en lugar de duplicar', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          {
            id: 'conv-existente',
            participantIds: ['user-1', 'user-2'],
            isDemoData: false,
          },
        ],
      })
      const postSpy = vi.spyOn(apiClient, 'post')

      const result = await createConversationIfNeeded('user-1', 'user-2')
      expect(result.id).toBe('conv-existente')
      expect(postSpy).not.toHaveBeenCalled()
    })

    it('impide crear conversación con uno mismo', async () => {
      await expect(createConversationIfNeeded('user-same', 'user-same')).rejects.toThrow(
        'No puedes crear una conversación contigo mismo.'
      )
    })

    it('crea nueva conversación con esquema correcto si no existe', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: [] })
      vi.spyOn(apiClient, 'post').mockImplementationOnce(async (_url, data) => ({
        data,
      }))

      const convo = await createConversationIfNeeded('user-1', 'user-2', {
        artistProfileId: 'artist-99',
      })

      expect(convo.participantIds).toEqual(['user-1', 'user-2'])
      expect(convo.isDemoData).toBe(false)
      expect(convo.relatedArtistProfileId).toBe('artist-99')
      expect(convo.lastMessageId).toBeNull()
    })
  })

  describe('getConversationById', () => {
    it('valida que el usuario pertenezca a los participantes', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          id: 'conv-secret',
          participantIds: ['user-a', 'user-b'],
          isDemoData: false,
        },
      })

      await expect(getConversationById('conv-secret', 'user-intruder')).rejects.toThrow(
        'No tienes permiso para ver esta conversación.'
      )
    })
  })

  describe('listConversationsForUser', () => {
    it('lista únicamente las conversaciones del usuario sin demo data', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          { id: 'c1', participantIds: ['user-target', 'user-other'], isDemoData: false },
          { id: 'c2', participantIds: ['user-someone', 'user-else'], isDemoData: false },
          { id: 'c3', participantIds: ['user-target', 'user-demo'], isDemoData: true },
        ],
      })

      const list = await listConversationsForUser('user-target')
      expect(list).toHaveLength(1)
      expect(list[0].id).toBe('c1')
    })
  })

  describe('sendMessage', () => {
    it('valida longitud máxima y contenido no vacío', async () => {
      await expect(sendMessage('c1', 'u1', 'u2', '   ')).rejects.toThrow(
        'El mensaje no puede estar vacío.'
      )

      const longMsg = 'a'.repeat(3001)
      await expect(sendMessage('c1', 'u1', 'u2', longMsg)).rejects.toThrow(
        'El mensaje supera el límite de 3000 caracteres.'
      )
    })

    it('impide enviarse mensaje a uno mismo', async () => {
      await expect(sendMessage('c1', 'u1', 'u1', 'Hola')).rejects.toThrow(
        'No puedes enviarte un mensaje a ti mismo.'
      )
    })

    it('guarda el mensaje y actualiza lastMessageId y updatedAt en la conversación', async () => {
      const postSpy = vi.spyOn(apiClient, 'post').mockImplementationOnce(async (_url, data) => ({
        data,
      }))
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: {} })

      const msg = await sendMessage('conv-1', 'sender-1', 'receiver-2', 'Hola mundo')

      expect(msg.content).toBe('Hola mundo')
      expect(msg.isDemoData).toBe(false)
      expect(postSpy).toHaveBeenCalledWith('/messages', expect.objectContaining({
        conversationId: 'conv-1',
        senderId: 'sender-1',
        receiverId: 'receiver-2',
        content: 'Hola mundo',
      }))
      expect(patchSpy).toHaveBeenCalledWith(
        '/conversations/conv-1',
        expect.objectContaining({
          lastMessageId: msg.id,
        })
      )
    })
  })

  describe('markConversationAsRead', () => {
    it('marca como leídos únicamente los mensajes dirigidos al usuario actual', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: [
          {
            id: 'm1',
            conversationId: 'c1',
            senderId: 'user-other',
            receiverId: 'user-me',
            readAt: null,
            read: false,
          },
          {
            id: 'm2',
            conversationId: 'c1',
            senderId: 'user-me',
            receiverId: 'user-other',
            readAt: null,
            read: false,
          },
        ],
      })
      const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} })

      await markConversationAsRead('c1', 'user-me')

      expect(patchSpy).toHaveBeenCalledTimes(1)
      expect(patchSpy).toHaveBeenCalledWith('/messages/m1', expect.objectContaining({ read: true }))
    })
  })
})

