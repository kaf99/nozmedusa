import { useLoaderData, useParams } from "react-router-dom"

import { SingleColumnPage } from "../../../components/layout/pages"
import { useCustomerGroup } from "../../../hooks/api/customer-groups"
import { CustomerGroupCustomerSection } from "./components/customer-group-customer-section"
import { CustomerGroupGeneralSection } from "./components/customer-group-general-section"
import { customerGroupLoader } from "./loader"

import { SingleColumnPageSkeleton } from "../../../components/common/skeleton"
import { useExtension } from "../../../providers/extension-provider"
import { CUSTOMER_GROUP_DETAIL_FIELDS } from "./constants"
import { useCustomers } from "../../../hooks/api"

export const CustomerGroupDetail = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof customerGroupLoader>
  >

  const { id } = useParams()
  const { customer_group, isLoading, isError, error } = useCustomerGroup(
    id!,
    {
      fields: CUSTOMER_GROUP_DETAIL_FIELDS,
    },
    { initialData }
  )

  // don't fetch in loader so we don't block initial render
  const { count } = useCustomers({ groups: [id], fields: "id", limit: 1 })

  const { getWidgets } = useExtension()

  if (isLoading || !customer_group) {
    return <SingleColumnPageSkeleton sections={2} showJSON showMetadata />
  }

  if (isError) {
    throw error
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("customer_group.details.before"),
        after: getWidgets("customer_group.details.after"),
      }}
      showJSON
      showMetadata
      data={customer_group}
    >
      <CustomerGroupGeneralSection group={customer_group} count={count} />
      <CustomerGroupCustomerSection group={customer_group} />
    </SingleColumnPage>
  )
}
