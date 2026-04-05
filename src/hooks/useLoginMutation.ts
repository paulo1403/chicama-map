import { useMutation } from '@tanstack/react-query'

import { useI18n } from '../i18n/useI18n'
import { login } from '../services/auth.service'
import { getErrorMessage } from '../services/error.service'
import { toastService } from '../services/toast.service'

export function useLoginMutation() {
  const { copy } = useI18n()

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: () => {
      toastService.success(copy.auth.loginSuccess)
    },
    onError: (error) => {
      toastService.error(getErrorMessage(error, copy.auth.loginError))
    },
  })
}