import { Container } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { DataTable } from "../../../../../../components/data-table"
import { PAGE_SIZE } from "../constants"

export function OrderListTableLoading() {
  const { t } = useTranslation()
  
  return (
    <Container className="divide-y p-0">
      <DataTable
        data={[]}
        columns={[]}
        heading={t("orders.domain")}
        rowCount={0}
        getRowId={(row) => row.id}
        isLoading={true}
        pageSize={PAGE_SIZE}
        emptyState={{
          empty: {
            heading: "Loading columns...",
          },
        }}
      />
    </Container>
  )
}