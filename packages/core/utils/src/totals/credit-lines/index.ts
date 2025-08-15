import { BigNumberInput } from "@medusajs/types"
import { isDefined } from "../../common"
import { BigNumber } from "../big-number"
import { MathBN, MEDUSA_EPSILON } from "../math"

export function calculateCreditLinesTotal({
  creditLines,
  includesTax,
  taxRate,
}: {
  creditLines: { amount: BigNumberInput }[]
  includesTax?: boolean
  taxRate?: BigNumberInput
}) {
  // the sum of all creditLine amounts excluding tax
  let creditLinesSubtotal = MathBN.convert(0)
  // the sum of all creditLine amounts including tax
  let creditLinesTotal = MathBN.convert(0)
  // the sum of all taxes on subtotals
  let creditLinesTaxTotal = MathBN.convert(0)

  for (const cl of creditLines) {
    if (!isDefined(cl.amount)) {
      continue
    }

    const creditLineAmount = MathBN.convert(cl.amount)
    creditLinesSubtotal = MathBN.add(creditLinesSubtotal, creditLineAmount)

    if (isDefined(taxRate)) {
      const creditLineSubtotal = includesTax
        ? MathBN.div(creditLineAmount, MathBN.add(1, taxRate))
        : creditLineAmount

      const creditLineTaxTotal = MathBN.mult(creditLineSubtotal, taxRate)
      const creditLineTotal = MathBN.add(creditLineSubtotal, creditLineTaxTotal)

      cl["subtotal"] = new BigNumber(creditLineSubtotal)
      cl["total"] = new BigNumber(creditLineTotal)

      creditLinesTotal = MathBN.add(creditLinesTotal, creditLineTotal)
      creditLinesTaxTotal = MathBN.add(creditLinesTaxTotal, creditLineTaxTotal)
    } else {
      cl["subtotal"] = new BigNumber(creditLineAmount)
      creditLinesTotal = MathBN.add(creditLinesTotal, creditLineAmount)
    }
  }

  const isZero = MathBN.lte(creditLinesTotal, MEDUSA_EPSILON)
  return {
    creditLinesTotal: isZero ? MathBN.convert(0) : creditLinesTotal,
    creditLinesSubtotal: isZero ? MathBN.convert(0) : creditLinesSubtotal,
    creditLinesTaxTotal: isZero ? MathBN.convert(0) : creditLinesTaxTotal,
  }
}
