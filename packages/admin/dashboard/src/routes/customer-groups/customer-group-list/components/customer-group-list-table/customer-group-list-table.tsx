import { PencilSquare, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import {
  Container,
  createDataTableColumnHelper,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { DataTable } from "../../../../../components/data-table"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { SingleColumnPage } from "../../../../../components/layout/pages"
import {
  useCustomerGroups,
  useDeleteCustomerGroupLazy,
} from "../../../../../hooks/api"
import { useDate } from "../../../../../hooks/use-date"
import { useQueryParams } from "../../../../../hooks/use-query-params"
import { useExtension } from "../../../../../providers/extension-provider"
import { sdk } from "../../../../../lib/client"

const PAGE_SIZE = 10

export const CustomerGroupListTable = () => {
  const { t } = useTranslation()
  const { getWidgets } = useExtension()

  const [customerGroupCounts, setCustomerGroupCounts] = useState<
    Record<string, number>
  >({})

  const { q, order, offset, created_at, updated_at } = useQueryParams([
    "q",
    "order",
    "offset",
    "created_at",
    "updated_at",
  ])

  const columns = useColumns()
  const filters = useFilters()

  const { customer_groups, count, isPending, isError, error } =
    useCustomerGroups(
      {
        q,
        order,
        offset: offset ? parseInt(offset) : undefined,
        limit: PAGE_SIZE,
        created_at: created_at ? JSON.parse(created_at) : undefined,
        updated_at: updated_at ? JSON.parse(updated_at) : undefined,
        fields: "id,name,created_at,updated_at",
      },
      {
        placeholderData: keepPreviousData,
      }
    )

  useEffect(() => {
    if (!customer_groups) {
      return
    }

    const customerGroupIds = customer_groups.map((cg) => cg.id)
    const promises = customerGroupIds.map((id) =>
      sdk.admin.customer.list({
        groups: [id],
        fields: "id",
        limit: 1,
      })
    )

    Promise.all(promises)
      .then((res) =>
        res.reduce(
          (acc, r, i) => {
            acc[customerGroupIds[i]] = r.count
            return acc
          },

          {} as Record<string, number>
        )
      )
      .then((data) => {
        setCustomerGroupCounts(data)
      })
  }, [customer_groups])

  const customer_groups_data = useMemo(() => {
    return customer_groups?.map((cg) => ({
      ...cg,
      customer_count: customerGroupCounts[cg.id],
    }))
  }, [customer_groups, customerGroupCounts])

  if (isError) {
    throw error
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("customer_group.list.before"),
        after: getWidgets("customer_group.list.after"),
      }}
    >
      <Container className="overflow-hidden p-0">
        <DataTable
          data={customer_groups_data}
          columns={columns}
          filters={filters}
          heading={t("customerGroups.domain")}
          rowCount={count}
          getRowId={(row) => row.id}
          rowHref={(row) => `/customer-groups/${row.id}`}
          action={{
            label: t("actions.create"),
            to: "/customer-groups/create",
          }}
          emptyState={{
            empty: {
              heading: t("customerGroups.list.empty.heading"),
              description: t("customerGroups.list.empty.description"),
            },
            filtered: {
              heading: t("customerGroups.list.filtered.heading"),
              description: t("customerGroups.list.filtered.description"),
            },
          }}
          pageSize={PAGE_SIZE}
          isLoading={isPending}
        />
      </Container>
    </SingleColumnPage>
  )
}

const columnHelper = createDataTableColumnHelper<
  HttpTypes.AdminCustomerGroup & { customer_count?: number }
>()

const useColumns = () => {
  const { t } = useTranslation()
  const { getFullDate } = useDate()
  const navigate = useNavigate()
  const prompt = usePrompt()

  const { mutateAsync: deleteCustomerGroup } = useDeleteCustomerGroupLazy()

  const handleDeleteCustomerGroup = useCallback(
    async ({ id, name }: { id: string; name: string }) => {
      const res = await prompt({
        title: t("customerGroups.delete.title"),
        description: t("customerGroups.delete.description", {
          name,
        }),
        verificationText: name,
        verificationInstruction: t("general.typeToConfirm"),
        confirmText: t("actions.delete"),
        cancelText: t("actions.cancel"),
      })

      if (!res) {
        return
      }

      await deleteCustomerGroup(
        { id },
        {
          onSuccess: () => {
            toast.success(t("customerGroups.delete.successToast", { name }))
          },
          onError: (e) => {
            toast.error(e.message)
          },
        }
      )
    },
    [t, prompt, deleteCustomerGroup]
  )

  return useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: t("fields.name"),
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      columnHelper.accessor("customers", {
        header: t("customers.domain"),
        cell: ({ row }) => {
          return <span>{row.original.customer_count ?? "-"}</span>
        },
      }),
      columnHelper.accessor("created_at", {
        header: t("fields.createdAt"),
        cell: ({ row }) => {
          return (
            <span>
              {getFullDate({
                date: row.original.created_at,
                includeTime: true,
              })}
            </span>
          )
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc"),
      }),
      columnHelper.accessor("updated_at", {
        header: t("fields.updatedAt"),
        cell: ({ row }) => {
          return (
            <span>
              {getFullDate({
                date: row.original.updated_at,
                includeTime: true,
              })}
            </span>
          )
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc"),
      }),
      columnHelper.action({
        actions: [
          [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              onClick: (row) => {
                navigate(`/customer-groups/${row.row.original.id}/edit`)
              },
            },
          ],
          [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: (row) => {
                handleDeleteCustomerGroup({
                  id: row.row.original.id,
                  name: row.row.original.name ?? "",
                })
              },
            },
          ],
        ],
      }),
    ]
  }, [t, navigate, getFullDate, handleDeleteCustomerGroup])
}

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return dateFilters
  }, [dateFilters])
}
