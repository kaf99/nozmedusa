import React, { useEffect, useState, useRef } from "react"
import {
  Badge,
  usePrompt,
  toast,
  DropdownMenu,
} from "@medusajs/ui"
import {
  Trash,
  PencilSquare,
  ArrowUturnLeft,
} from "@medusajs/icons"
import { useViewConfiguration } from "../../../providers/view-configuration-provider"
import { ViewConfiguration } from "../../../providers/view-configuration-provider"
import { SaveViewDialog } from "../save-view-dialog"

interface ViewPillsProps {
  entity: string
  onViewChange?: (view: ViewConfiguration | null) => void
  currentColumns?: {
    visible: string[]
    order: string[]
  }
  currentConfiguration?: {
    filters?: Record<string, unknown>
    sorting?: { id: string; desc: boolean } | null
    search?: string
  }
}

export const ViewPills: React.FC<ViewPillsProps> = ({
  entity,
  onViewChange,
  currentColumns,
  currentConfiguration,
}) => {
  const {
    viewConfigurations,
    activeViews,
    defaultActiveEntities,
    activeViewMetadata,
    getViewConfigurations,
    getActiveView,
    setActiveView,
    deleteViewConfiguration,
  } = useViewConfiguration()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [editingView, setEditingView] = useState<ViewConfiguration | null>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState<string | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const prompt = usePrompt()

  // Get views from the cache or trigger initial load
  const views = viewConfigurations.get(entity) || []
  const activeView = activeViews.get(entity) || null

  // Track if we've notified parent of initial view
  const hasNotifiedInitialView = useRef(false)

  // Load views on mount if not cached
  useEffect(() => {
    const loadData = async () => {
      // This will either return cached data or fetch new data
      const [viewsList, active] = await Promise.all([
        getViewConfigurations(entity),
        getActiveView(entity),
      ])

      // Only notify parent of active view once on mount
      if (!hasNotifiedInitialView.current) {
        hasNotifiedInitialView.current = true
        // Use setTimeout to ensure this happens after render
        setTimeout(() => {
          if (onViewChange) {
            if (active) {
              onViewChange(active)
            } else {
              onViewChange(null)
            }
          }
        }, 0)
      }
    }
    loadData()
  }, [entity, getViewConfigurations, getActiveView]) // Remove onViewChange from dependencies

  const handleViewSelect = async (viewId: string | null) => {
    if (viewId === null) {
      // Select default view - clear the active view
      await setActiveView(entity, null)

      // After clearing, check if there's a system default
      const updatedActiveView = await getActiveView(entity)
      if (onViewChange) {
        onViewChange(updatedActiveView)
      }
      toast.success("Switched to default view")
      return
    }

    const view = views.find(v => v.id === viewId)
    if (view) {
      await setActiveView(entity, viewId)
      if (onViewChange) {
        onViewChange(view)
      }
      toast.success(`Switched to view: ${view.name}`)
    }
  }

  const handleDeleteView = async (view: ViewConfiguration) => {
    const result = await prompt({
      title: "Delete view",
      description: `Are you sure you want to delete "${view.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (result) {
      try {
        await deleteViewConfiguration(view.id)
        if (activeView?.id === view.id) {
          if (onViewChange) {
            onViewChange(null)
          }
        }
        toast.success("View deleted successfully")
      } catch (error) {
        toast.error("Failed to delete view")
      }
    }
  }


  const handleEditView = (view: ViewConfiguration) => {
    setEditingView(view)
    setSaveDialogOpen(true)
  }

  const handleResetSystemDefault = async (systemDefaultView: ViewConfiguration) => {
    const result = await prompt({
      title: "Reset system default",
      description: "This will delete the saved system default and revert to the original code-level defaults. All users will be affected. Are you sure?",
      confirmText: "Reset",
      cancelText: "Cancel",
    })

    if (result) {
      try {
        await deleteViewConfiguration(systemDefaultView.id)
        if (activeView?.id === systemDefaultView.id) {
          if (onViewChange) {
            onViewChange(null)
          }
        }
        toast.success("System default reset to code-level defaults")
      } catch (error) {
        toast.error("Failed to reset system default")
      }
    }
  }

  const systemDefaultView = views.find(v => v.is_system_default)
  const personalViews = views.filter(v => !v.is_system_default)

  // Determine if we're showing default or system default
  // Check both defaultActiveEntities and metadata to be sure
  const metadata = activeViewMetadata.get(entity)
  const isDefaultActive = defaultActiveEntities.has(entity) ||
    (metadata && metadata.is_default_active) ||
    (!activeView && !metadata) ||
    (systemDefaultView && activeView?.id === systemDefaultView.id)
  const defaultLabel = "Default"

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Default view badge (either code-level or system default) */}
        <div className="relative inline-block">
          <Badge
            rounded="full"
            color={isDefaultActive ? "blue" : "grey"}
            size="xsmall"
            className="cursor-pointer"
            onClick={() => handleViewSelect(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              if (systemDefaultView) {
                setContextMenuPosition({ x: e.clientX, y: e.clientY })
                setContextMenuOpen('default')
              }
            }}
          >
            {defaultLabel}
          </Badge>
          {systemDefaultView && contextMenuOpen === 'default' && (
            <DropdownMenu
              open={true}
              onOpenChange={(open) => {
                if (!open) setContextMenuOpen(null)
              }}
            >
              <DropdownMenu.Trigger asChild>
                <div
                  style={{
                    position: 'fixed',
                    left: contextMenuPosition.x,
                    top: contextMenuPosition.y,
                    width: 0,
                    height: 0
                  }}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start" sideOffset={0}>
                <DropdownMenu.Item
                  onClick={() => {
                    handleResetSystemDefault(systemDefaultView)
                    setContextMenuOpen(null)
                  }}
                  className="flex items-center gap-x-2"
                >
                  <ArrowUturnLeft className="text-ui-fg-subtle" />
                  <span>Reset to code defaults</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </div>

        {/* Separator */}
        {personalViews.length > 0 && <div className="text-ui-fg-muted">|</div>}

        {/* Personal view badges */}
        {personalViews.map((view) => (
          <div key={view.id} className="relative inline-block">
            <Badge
              color={activeView?.id === view.id ? "blue" : "grey"}
              size="xsmall"
              rounded="full"
              className="cursor-pointer"
              onClick={() => handleViewSelect(view.id)}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenuPosition({ x: e.clientX, y: e.clientY })
                setContextMenuOpen(view.id)
              }}
            >
              {view.name}
            </Badge>
            {contextMenuOpen === view.id && (
              <DropdownMenu
                open={true}
                onOpenChange={(open) => {
                  if (!open) setContextMenuOpen(null)
                }}
              >
                <DropdownMenu.Trigger asChild>
                  <div
                    style={{
                      position: 'fixed',
                      left: contextMenuPosition.x,
                      top: contextMenuPosition.y,
                      width: 0,
                      height: 0
                    }}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="start" sideOffset={0}>
                  <DropdownMenu.Item
                    onClick={() => {
                      handleEditView(view)
                      setContextMenuOpen(null)
                    }}
                    className="flex items-center gap-x-2"
                  >
                    <PencilSquare className="text-ui-fg-subtle" />
                    <span>Edit name</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => {
                      handleDeleteView(view)
                      setContextMenuOpen(null)
                    }}
                    className="flex items-center gap-x-2 text-ui-fg-error"
                  >
                    <Trash />
                    <span>Delete</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
            )}
          </div>
        ))}

      </div>

      {saveDialogOpen && (
        <SaveViewDialog
          entity={entity}
          currentColumns={currentColumns}
          currentConfiguration={currentConfiguration}
          editingView={editingView}
          onClose={() => {
            setSaveDialogOpen(false)
            setEditingView(null)
          }}
          onSaved={async (newView) => {
            setSaveDialogOpen(false)
            setEditingView(null)
            toast.success(`View "${newView.name}" saved successfully`)
            // The view is already set as active in SaveViewDialog
            // Notify parent of the new active view
            if (onViewChange) {
              onViewChange(newView)
            }
          }}
        />
      )}
    </>
  )
}
