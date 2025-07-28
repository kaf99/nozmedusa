import { keepPreviousData } from "@tanstack/react-query"
import { useOrders } from "../../../../../../hooks/api/orders"
import { useOrderColumns } from "../../../../../../hooks/api/views"
import { useOrderTableQuery } from "../../../../../../hooks/table/query/use-order-table-query"
import { PAGE_SIZE, QUERY_PREFIX } from "../constants"

interface UseOrderListDataReturn {
  orders: any[]
  count: number
  isLoading: boolean
  isLoadingColumns: boolean
  isError: boolean
  error: any
  columns: any[]
  searchParams: any
  raw: any
}

export function useOrderListData(requiredFields: string): UseOrderListDataReturn {
  const { searchParams, raw } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
    prefix: QUERY_PREFIX,
  })

  const { columns: apiColumns, isLoading: isLoadingColumns } = useOrderColumns()

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: requiredFields,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  return {
    orders: orders || [],
    count: count || 0,
    isLoading,
    isLoadingColumns,
    isError,
    error,
    columns: apiColumns || [],
    searchParams,
    raw,
  }
}