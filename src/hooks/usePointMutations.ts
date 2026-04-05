import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useI18n } from '../i18n/useI18n'
import {
  createPoint,
  deletePoint,
  updatePoint,
} from '../services/points.service'
import { queryKeys } from '../services/queryKeys'
import { getErrorMessage } from '../services/error.service'
import { toastService } from '../services/toast.service'
import type { MapPoint } from '../types/map'

export function usePointMutations(token: string | null) {
  const queryClient = useQueryClient()
  const { copy } = useI18n()

  const createPointMutation = useMutation({
    mutationFn: (point: MapPoint) => {
      if (!token) throw new Error(copy.auth.invalidSession)
      return createPoint(point, token)
    },
    onSuccess: async () => {
      toastService.success(copy.points.created)
      await queryClient.invalidateQueries({ queryKey: queryKeys.points })
    },
    onError: (error) => {
      toastService.error(getErrorMessage(error, copy.points.createError))
    },
  })

  const updatePointMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<MapPoint> }) => {
      if (!token) throw new Error(copy.auth.invalidSession)
      return updatePoint(id, patch, token)
    },
    onSuccess: async () => {
      toastService.success(copy.points.updated)
      await queryClient.invalidateQueries({ queryKey: queryKeys.points })
    },
    onError: (error) => {
      toastService.error(getErrorMessage(error, copy.points.updateError))
    },
  })

  const deletePointMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error(copy.auth.invalidSession)
      return deletePoint(id, token)
    },
    onSuccess: async () => {
      toastService.success(copy.points.deleted)
      await queryClient.invalidateQueries({ queryKey: queryKeys.points })
    },
    onError: (error) => {
      toastService.error(getErrorMessage(error, copy.points.deleteError))
    },
  })

  return {
    createPointMutation,
    updatePointMutation,
    deletePointMutation,
  }
}