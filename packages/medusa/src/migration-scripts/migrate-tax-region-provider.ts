import { updateTaxRegionsStep, useQueryGraphStep } from "@medusajs/core-flows"
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"

const assignSystemProviderToTaxRegionsWorkflow = createWorkflow(
  "assign-system-provider-to-tax-regions",
  () => {
    const { data: taxRegions } = useQueryGraphStep({
      entity: "tax_region",
      fields: ["id", "provider_id", "province_code"],
    })

    const updateData = transform({ taxRegions }, ({ taxRegions }) => {
      /**
       * Update only parent regions that don't have a provider set.
       */
      return taxRegions
        .filter(
          (taxRegion) => !taxRegion.province_code && !taxRegion.provider_id
        )
        .map((taxRegion) => ({
          id: taxRegion.id,
          provider_id: "tp_system_system",
        }))
    })

    updateTaxRegionsStep(updateData)

    return new WorkflowResponse(void 0)
  }
)

export default async function assignTaxSystemProviderToTaxRegions({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Assigning tax system provider to tax regions")

  try {
    await assignSystemProviderToTaxRegionsWorkflow(container).run()
    logger.info("System provider assigned to tax regions")
  } catch (e) {
    logger.error(e)
    throw e
  }
}
