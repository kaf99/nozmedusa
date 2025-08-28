import {
  CreateOrderCreditLineDTO,
  OrderDTO,
  OrderCreditLineDTO,
} from "@medusajs/framework/types"
import {
  ChangeActionType,
  MathBN,
  MedusaError,
  OrderChangeStatus,
  OrderChangeType,
} from "@medusajs/framework/utils"
import {
  WorkflowResponse,
  createHook,
  createStep,
  createWorkflow,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "../../common"
import { confirmOrderChanges } from "../steps/confirm-order-changes"
import { createOrderChangeStep } from "../steps/create-order-change"
import { createOrderChangeActionsWorkflow } from "./create-order-change-actions"
import {
  createOrderCreditLinesWorkflowInputSchema,
  createOrderCreditLinesWorkflowOutputSchema,
  type CreateOrderCreditLinesWorkflowInput as SchemaInput,
  type CreateOrderCreditLinesWorkflowOutput as SchemaOutput,
} from "../utils/schemas"
export {
  type CreateOrderCreditLinesWorkflowInput,
  type CreateOrderCreditLinesWorkflowOutput,
} from "../utils/schemas"

export const validateOrderCreditLinesStep = createStep(
  "validate-order-credit-lines",
  async function ({
    order,
    creditLines,
  }: {
    order: OrderDTO
    creditLines: Omit<CreateOrderCreditLineDTO, "order_id">[]
  }) {
    const pendingDifference = MathBN.convert(order.summary?.pending_difference!)
    const creditLinesAmount = creditLines.reduce((acc, creditLine) => {
      return MathBN.add(acc, MathBN.convert(creditLine.amount))
    }, MathBN.convert(0))

    if (MathBN.eq(pendingDifference, 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Can only create credit lines if the order has a positive or negative pending difference`
      )
    }

    if (MathBN.gt(pendingDifference, 0) && MathBN.lt(creditLinesAmount, 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Can only create positive credit lines if the order has a positive pending difference`
      )
    }

    if (MathBN.lt(pendingDifference, 0) && MathBN.gt(creditLinesAmount, 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Can only create negative credit lines if the order has a negative pending difference`
      )
    }

    if (MathBN.lt(pendingDifference, 0)) {
      if (
        MathBN.gt(
          creditLinesAmount.multipliedBy(-1),
          pendingDifference.multipliedBy(-1)
        )
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Cannot create more negative credit lines with amount more than the pending difference`
        )
      }
    }

    if (MathBN.gt(pendingDifference, 0)) {
      if (MathBN.gt(creditLinesAmount, pendingDifference)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Cannot create more positive credit lines with amount more than the pending difference`
        )
      }
    }
  }
)

// Type verification
type OldInput = {
  id: string
  credit_lines: Omit<CreateOrderCreditLineDTO, "order_id">[]
}

const schemaInput = {} as SchemaInput
const schemaOutput = {} as SchemaOutput
const existingInput: OldInput = schemaInput
const existingOutput: OrderCreditLineDTO[] = schemaOutput

// Check reverse too
const oldInput = {} as OldInput
const oldOutput = {} as OrderCreditLineDTO[]
const newInput: SchemaInput = oldInput
const newOutput: SchemaOutput = oldOutput

console.log(existingInput, existingOutput, newInput, newOutput)

export const createOrderCreditLinesWorkflowId = "create-order-credit-lines"
export const createOrderCreditLinesWorkflow = createWorkflow(
  {
    name: createOrderCreditLinesWorkflowId,
    inputSchema: createOrderCreditLinesWorkflowInputSchema,
    outputSchema: createOrderCreditLinesWorkflowOutputSchema,
  },
  (input) => {
    const orderQuery = useQueryGraphStep({
      entity: "orders",
      fields: ["id", "status", "summary"],
      filters: { id: input.id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "get-order" })

    const order = transform(
      { orderQuery },
      ({ orderQuery }) => orderQuery.data[0]
    )

    validateOrderCreditLinesStep({ order, creditLines: input.credit_lines })

    const orderChangeInput = transform({ input }, ({ input }) => ({
      change_type: OrderChangeType.CREDIT_LINE,
      order_id: input.id,
    }))

    const createdOrderChange = createOrderChangeStep(orderChangeInput)

    const orderChangeActionInput = transform(
      { order, orderChange: createdOrderChange, input },
      ({ order, orderChange, input }) => {
        return input.credit_lines.map((creditLine) => {
          return {
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: ChangeActionType.CREDIT_LINE_ADD,
            reference: creditLine.reference!,
            reference_id: creditLine.reference_id!,
            amount: creditLine.amount,
          }
        })
      }
    )

    createOrderChangeActionsWorkflow.runAsStep({
      input: orderChangeActionInput,
    })

    const orderChangeQuery = useQueryGraphStep({
      entity: "order_change",
      fields: [
        "id",
        "status",
        "change_type",
        "actions.id",
        "actions.order_id",
        "actions.action",
        "actions.details",
        "actions.reference",
        "actions.reference_id",
        "actions.internal_note",
      ],
      filters: {
        order_id: input.id,
        status: [OrderChangeStatus.PENDING],
      },
    }).config({ name: "order-change-query" })

    const orderChange = transform(
      { orderChangeQuery },
      ({ orderChangeQuery }) => orderChangeQuery.data[0]
    )

    const orderChanges = confirmOrderChanges({
      changes: [orderChange],
      orderId: order.id,
    })

    createHook("creditLinesCreated", {
      order_id: input.id,
      credit_lines: orderChanges.credit_lines,
    })

    return new WorkflowResponse(orderChanges.credit_lines)
  }
)
