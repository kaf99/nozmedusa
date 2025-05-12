"use client"

import React, { useRef, useState } from "react"
import { useAiAssistant, useSiteConfig } from "../../providers"
import { usePathname } from "next/navigation"
import { AiAssistent, Book } from "@medusajs/icons"
import { DropdownMenu, Menu } from "../Menu"
import { MarkdownIcon } from "../Icons/Markdown"
import { useAiAssistantChat } from "../../providers/AiAssistant/Chat"
import clsx from "clsx"
import { useClickOutside } from "../.."

export const LlmDropdown = () => {
  const {
    config: { baseUrl, basePath },
  } = useSiteConfig()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { setChatOpened } = useAiAssistant()
  const { setQuestion, loading } = useAiAssistantChat()
  const ref = useRef<HTMLButtonElement | null>(null)
  useClickOutside({
    elmRef: ref,
    onClickOutside: () => {
      setOpen(false)
    },
  })

  const pageUrl = `${baseUrl}${basePath}${pathname}`

  return (
    <DropdownMenu
      open={open}
      setOpen={setOpen}
      dropdownButtonContent={<Book />}
      menuComponent={
        <Menu
          items={[
            {
              type: "link",
              title: "View as Markdown",
              link: `${pageUrl}/index.html.md`,
              icon: <MarkdownIcon width={19} height={19} />,
              openInNewTab: true,
            },
            {
              type: "action",
              title: "Ask AI Assistant",
              action: () => {
                if (loading) {
                  return
                }
                setQuestion(`Explain the page ${pageUrl}`)
                setChatOpened(true)
                setOpen(false)
              },
              icon: <AiAssistent />,
            },
          ]}
          className={clsx(
            "absolute right-0 top-[calc(100%+8px)] w-max",
            !open && "hidden"
          )}
        />
      }
      className="hidden md:block"
    />
  )
}
