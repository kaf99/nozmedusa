"use client"

import React, { useEffect } from "react"
import { ToCItem, ToCItemUi } from "types"
import {
  ActiveOnScrollItem,
  useActiveOnScroll,
  useScrollController,
} from "../../../hooks"
import clsx from "clsx"
import Link from "next/link"
import { useSiteConfig } from "../../../providers"
import { Loading } from "../../Loading"

export const ContentMenuToc = () => {
  const { toc: items, frontmatter, setToc } = useSiteConfig()
  const { items: generatedItems, activeItemId } = useActiveOnScroll({
    maxLevel: 4,
  })

  const formatHeadingContent = (content: string | null): string => {
    return content?.replaceAll(/#$/g, "") || ""
  }

  const formatHeadingObject = ({
    heading,
    children,
  }: ActiveOnScrollItem): ToCItemUi => {
    const level = parseInt(heading.tagName.replace("H", ""))
    return {
      title: formatHeadingContent(heading.textContent),
      id: heading.id,
      level,
      children: children?.map(formatHeadingObject),
      associatedHeading: heading as HTMLHeadingElement,
    }
  }

  useEffect(() => {
    if (
      frontmatter.generate_toc &&
      generatedItems &&
      items?.length !== generatedItems.length
    ) {
      const tocItems: ToCItem[] = generatedItems.map(formatHeadingObject)
      setToc(tocItems)
    }
  }, [frontmatter, generatedItems])

  useEffect(() => {
    const activeElement = document.querySelector(
      ".toc-item a[href='#" + activeItemId + "']"
    ) as HTMLAnchorElement
    if (!activeElement) {
      return
    }

    activeElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    })
  }, [activeItemId])

  if (items && !items.length) {
    return <></>
  }

  return (
    <div className="h-max max-h-full overflow-y-hidden flex relative flex-col">
      <div className="absolute -left-px top-0 h-full w-[1.5px] bg-medusa-border-base" />
      {items !== null && (
        <TocList
          items={items}
          activeItemId={activeItemId}
          className="relative overflow-y-auto"
        />
      )}
      {items === null && <EmptyTocItems />}
    </div>
  )
}

type TocListProps = {
  items: ToCItem[]
  activeItemId: string
  className?: string
}

const TocList = ({ items, activeItemId, className }: TocListProps) => {
  return (
    <ul className={className}>
      {items.map((item) => (
        <TocItem item={item} key={item.id} activeItemId={activeItemId} />
      ))}
    </ul>
  )
}

type TocItemProps = {
  item: ToCItem
  activeItemId: string
}

const TocItem = ({ item, activeItemId }: TocItemProps) => {
  const { scrollToElement } = useScrollController()
  return (
    <li className="w-full pt-docs_0.5 toc-item">
      <Link
        href={`#${item.id}`}
        className={clsx(
          "text-x-small-plus block w-full border-l-[1.5px]",
          item.id === activeItemId &&
            "border-medusa-fg-base text-medusa-fg-base",
          item.id !== activeItemId &&
            "text-medusa-fg-muted hover:text-medusa-fg-base border-transparent"
        )}
        style={{
          paddingLeft: `${(item.level - 1) * 12}px`,
        }}
        onClick={(e) => {
          e.preventDefault()
          history.pushState({}, "", `#${item.id}`)
          const elm = document.getElementById(item.id) as HTMLElement
          scrollToElement(elm)
        }}
      >
        {item.title}
      </Link>
      {(item.children?.length ?? 0) > 0 && (
        <TocList items={item.children!} activeItemId={activeItemId} />
      )}
    </li>
  )
}

const EmptyTocItems = () => {
  return (
    <div className="animate-pulse">
      <Loading count={5} className="pt-docs_0.5 px-docs_0.75 !my-0" />
    </div>
  )
}
