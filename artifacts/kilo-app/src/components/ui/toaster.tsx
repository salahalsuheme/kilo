import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

function readDocumentRtl(): boolean {
  if (typeof document === "undefined") return true
  return document.documentElement.getAttribute("dir") === "rtl"
}

export function Toaster() {
  const { toasts } = useToast()
  const [isRTL, setIsRTL] = useState(readDocumentRtl)

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setIsRTL(readDocumentRtl())
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ["dir"] })
    return () => observer.disconnect()
  }, [])

  return (
    <ToastProvider duration={2000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport dir={isRTL ? "rtl" : "ltr"} />
    </ToastProvider>
  )
}
