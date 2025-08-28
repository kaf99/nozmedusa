import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export type SetActiveViewConfigurationStepInput = {
  id: string
  entity: string
  user_id: string
}

export const setActiveViewConfigurationStepId = "set-active-view-configuration"

/**
 * @ignore
 * 
 * @privateRemarks
 * Remove the `ignore` tag once the feature is ready. Otherwise,
 * it will be generated in the documentation.
 */
export const setActiveViewConfigurationStep = createStep(
  setActiveViewConfigurationStepId,
  async (input: SetActiveViewConfigurationStepInput, { container }) => {
    const service = container.resolve(Modules.SETTINGS)

    // Get the currently active view configuration for rollback
    const currentActiveView = await service.getActiveViewConfiguration(
      input.entity,
      input.user_id
    )

    // Set the new view as active
    await service.setActiveViewConfiguration(
      input.entity,
      input.user_id,
      input.id
    )

    return new StepResponse(input.id, {
      entity: input.entity,
      user_id: input.user_id,
      previousActiveViewId: currentActiveView?.id || null,
    })
  },
  async (compensateInput, { container }) => {
    if (!compensateInput) {
      return
    }

    const service = container.resolve(Modules.SETTINGS)

    if (compensateInput.previousActiveViewId) {
      // Restore the previous active view
      await service.setActiveViewConfiguration(
        compensateInput.entity,
        compensateInput.user_id,
        compensateInput.previousActiveViewId
      )
    } else {
      // If there was no previous active view, clear the active view
      await service.clearActiveViewConfiguration(
        compensateInput.entity,
        compensateInput.user_id
      )
    }
  }
)
