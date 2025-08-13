import { HttpTypes } from "@medusajs/types"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { DateCell } from "../../../components/table/table-cells/common/date-cell"
import { TextCell } from "../../../components/table/table-cells/common/text-cell"

const columnHelper = createColumnHelper<HttpTypes.AdminShippingOption>()

export const useShippingOptionTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => t("fields.name"),
        cell: ({ getValue }) => <TextCell text={getValue()} />,
      }),
      columnHelper.accessor("created_at", {
        header: () => t("fields.createdAt"),

        cell: ({ getValue }) => {
          return <DateCell date={getValue()} />
        },
      }),
      columnHelper.accessor("updated_at", {
        header: () => t("fields.updatedAt"),
        cell: ({ getValue }) => {
          return <DateCell date={getValue()} />
        },
      }),
    ],
    [t]
  )
}
