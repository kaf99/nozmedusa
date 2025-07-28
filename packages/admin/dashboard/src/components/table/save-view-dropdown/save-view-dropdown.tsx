import React, { useState } from "react"
import { Button, DropdownMenu, usePrompt } from "@medusajs/ui"
import { ChevronDownMini } from "@medusajs/icons"
import { ViewConfiguration } from "../../../providers/view-configuration-provider"
import { SaveViewDialog } from "../save-view-dialog"

interface SaveViewDropdownProps {
  activeView: ViewConfiguration | null
  isDefaultView: boolean
  currentColumns?: {
    visible: string[]
    order: string[]
  }
  currentConfiguration?: {
    filters?: Record<string, unknown>
    sorting?: { id: string; desc: boolean } | null
    search?: string
  }
  entity: string
  onSaveAsDefault: () => Promise<void>
  onUpdateExisting: () => Promise<void>
  onSaveAsNew: () => void
}

export const SaveViewDropdown: React.FC<SaveViewDropdownProps> = ({
  activeView,
  isDefaultView,
  currentColumns,
  currentConfiguration,
  entity,
  onSaveAsDefault,
  onUpdateExisting,
  onSaveAsNew,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const prompt = usePrompt()

  const handleSaveAsDefault = async () => {
    const result = await prompt({
      title: "Save as default view",
      description: "This will update the default view for all users. Are you sure?",
      confirmText: "Save as default",
      cancelText: "Cancel",
    })

    if (result) {
      await onSaveAsDefault()
      setDropdownOpen(false)
    }
  }

  const handleUpdateExisting = async () => {
    const result = await prompt({
      title: "Update view",
      description: `Are you sure you want to update "${activeView?.name}"?`,
      confirmText: "Update",
      cancelText: "Cancel",
    })

    if (result) {
      await onUpdateExisting()
      setDropdownOpen(false)
    }
  }

  const handleSaveAsNew = () => {
    setSaveDialogOpen(true)
    setDropdownOpen(false)
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" size="small">
            Save
            <ChevronDownMini />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {isDefaultView ? (
            <>
              <DropdownMenu.Item onClick={handleSaveAsDefault}>
                Save as default for everyone
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handleSaveAsNew}>
                Save as new view
              </DropdownMenu.Item>
            </>
          ) : (
            <>
              <DropdownMenu.Item onClick={handleUpdateExisting}>
                Update "{activeView?.name}"
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handleSaveAsNew}>
                Save as new view
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>

      {saveDialogOpen && (
        <SaveViewDialog
          entity={entity}
          currentColumns={currentColumns}
          currentConfiguration={currentConfiguration}
          onClose={() => setSaveDialogOpen(false)}
          onSaved={async (newView) => {
            setSaveDialogOpen(false)
            // Call the parent's callback to trigger view reload
            await onSaveAsNew()
          }}
        />
      )}
    </>
  )
}