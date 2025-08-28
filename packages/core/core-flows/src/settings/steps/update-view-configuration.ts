import {
  UpdateViewConfigurationDTO,
  ViewConfigurationDTO,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk"

export type UpdateViewConfigurationStepInput = {
  id: string
  data: UpdateViewConfigurationDTO
}

export const updateViewConfigurationStepId = "update-view-configuration"

/**
 * @ignore
 * 
 * @privateRemarks
 * Remove the `ignore` tag once the feature is ready. Otherwise,
 * it will be generated in the documentation.
 */
export const updateViewConfigurationStep = createStep(
  updateViewConfigurationStepId,
  async (input: UpdateViewConfigurationStepInput, { container }) => {
    const service = container.resolve(Modules.SETTINGS)

    const currentState = await service.retrieveViewConfiguration(input.id)

    const updated = await service.updateViewConfigurations(input.id, input.data)

    return new StepResponse(updated, {
      id: input.id,
      previousState: currentState,
    })
  },
  async (compensateInput, { container }) => {
    if (!compensateInput?.id || !compensateInput?.previousState) {
      return
    }

    const service = container.resolve(Modules.SETTINGS)

    const { id, created_at, updated_at, ...restoreData } =
      compensateInput.previousState as ViewConfigurationDTO
    await service.updateViewConfigurations(compensateInput.id, restoreData)
  }
)
