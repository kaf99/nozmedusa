import { HttpTypes } from "@medusajs/types"
import { Container, Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { _DataTable } from "../../../../../components/table/data-table"
import { useShippingOptions } from "../../../../../hooks/api"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useShippingOptionTableFilters } from "../../../../../hooks/table/filters"
import { useShippingOptionTableQuery } from "../../../../../hooks/table/query"
import { useShippingOptionTableColumns } from "../../../../../hooks/table/columns/use-shipping-option-table-columns.tsx"

type ShippingOptionTypeProductSectionProps = {
  shippingOptionType: HttpTypes.AdminShippingOptionType
}

const PAGE_SIZE = 10

export const ShippingOptionTypeShippingOptionSection = ({
  shippingOptionType,
}: ShippingOptionTypeProductSectionProps) => {
  const { t } = useTranslation()

  const { searchParams, raw } = useShippingOptionTableQuery({
    regionId: "*",
    pageSize: PAGE_SIZE,
  })
  const { shipping_options, count, isPending, isError, error } =
    useShippingOptions({
      ...searchParams,
      shipping_option_type_id: [shippingOptionType.id],
    })

  const filters = useShippingOptionTableFilters()
  const columns = useShippingOptionTableColumns()

  const { table } = useDataTable({
    columns,
    data: shipping_options,
    count: count || 0,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">
          {t("stockLocations.shippingOptions.domain")}
        </Heading>
      </div>
      <_DataTable
        table={table}
        filters={filters}
        isLoading={isPending}
        columns={columns}
        count={count}
        pageSize={PAGE_SIZE}
        orderBy={[
          { key: "name", label: t("fields.name") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        queryObject={raw}
        search
        pagination
      />
    </Container>
  )
}
