"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[var(--cookd-green)]" />,
        info: <InfoIcon className="size-4 text-[var(--cookd-orange)]" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[var(--cookd-orange)]" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-white border-[var(--border-light)] shadow-lg rounded-xl",
          title: "text-[var(--text-primary)] font-bold",
          description: "text-[var(--text-secondary)]",
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-light)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
