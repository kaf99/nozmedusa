import React, { useEffect, useState } from "react"
import { Card } from "../../Card"
import { useIsBrowser, useSiteConfig } from "../../../providers"
import clsx from "clsx"

const LOCAL_STORAGE_KEY = "last-version"

export const ContentMenuVersion = () => {
  const {
    config: { version },
  } = useSiteConfig()
  const [showNewVersion, setShowNewVersion] = useState(false)
  const { isBrowser } = useIsBrowser()

  useEffect(() => {
    if (!isBrowser) {
      return
    }

    const storedVersion = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (storedVersion !== version.number) {
      setShowNewVersion(true)
    }
  }, [isBrowser])

  const handleClose = () => {
    if (!showNewVersion) {
      return
    }

    setShowNewVersion(false)
    localStorage.setItem(LOCAL_STORAGE_KEY, version.number)
  }

  return (
    <Card
      type="mini"
      title={`New version`}
      text={`v${version.number} details`}
      closeable
      onClose={handleClose}
      href={version.releaseUrl}
      hrefProps={{
        target: "_blank",
        rel: "noopener noreferrer",
      }}
      themeImage={version.bannerImage}
      imageDimensions={{
        width: 64,
        height: 40,
      }}
      className={clsx(
        "!border-0",
        (!showNewVersion || version.hide) && "invisible"
      )}
    />
  )
}
