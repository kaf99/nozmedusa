import type { Logger } from "@medusajs/types"
import { ContainerRegistrationKeys } from "@medusajs/utils"

import { StepResponse } from "./helpers"
import { createStep } from "./create-step"

const createLoggerStep = (
  method: "info" | "error" | "warn" | "debug",
  message: any
) => {
  const step = createStep(
    {
      name: "logger-step-" + Date.now(),
      noCompensation: true,
    },
    async (input: any, { container }) => {
      const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
      const toLog = JSON.stringify(input, null, 2)
      logger[method](toLog)
      return new StepResponse(void 0)
    }
  )
  return step(message)
}

export const log = {
  info: (message: any) => createLoggerStep("info", message),
  error: (message: any) => createLoggerStep("error", message),
  warn: (message: any) => createLoggerStep("warn", message),
  debug: (message: any) => createLoggerStep("debug", message),
}
