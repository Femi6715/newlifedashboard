import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      description: 'Operation completed successfully',
    })
  },
  
  error: (message: string) => {
    toast.error(message, {
      description: 'Something went wrong',
    })
  },
  
  warning: (message: string) => {
    toast.warning(message, {
      description: 'Please review and try again',
    })
  },
  
  info: (message: string) => {
    toast.info(message, {
      description: 'Information',
    })
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      description: 'Please wait...',
    })
  },
  
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  }
}

// Convenience functions for common operations
export const showSuccess = (message: string) => showToast.success(message)
export const showError = (message: string) => showToast.error(message)
export const showWarning = (message: string) => showToast.warning(message)
export const showInfo = (message: string) => showToast.info(message)
export const showLoading = (message: string) => showToast.loading(message)
export const dismissToast = (toastId: string | number) => showToast.dismiss(toastId) 