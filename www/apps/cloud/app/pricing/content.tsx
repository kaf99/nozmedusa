"use server"

import { sanityClient } from "../../utils/sanity-client"
import { PricingQueryResult } from "../../utils/types"
import HeroPricing from "../../components/Pricing/HeroPricing"
import { notFound } from "next/navigation"
import FeatureSections from "../../components/Pricing/FeatureSections"
import { H2, Hr, Loading } from "docs-ui"
import { cache, Suspense } from "react"

export default async function PricingPage() {
  if (process.env.NEXT_PUBLIC_ENV === "CI") {
    return <div>Pricing page is not available in the CI environment.</div>
  }
  const data = await loadPricingData()

  const heroPricingData = data.find((item) => item._type === "heroPricing")
  const featureTableData = data.find((item) => item._type === "featureTable")

  // Ensure both data pieces are present
  if (
    !featureTableData?.featureTableFields ||
    !heroPricingData?.heroPricingFields
  ) {
    return notFound()
  }

  return (
    <Suspense fallback={<Loading />}>
      <H2 id="cloud-plans">Cloud Plans</H2>
      <HeroPricing data={heroPricingData.heroPricingFields} />
      <Hr />
      <H2 id="plans-features">Plans Features</H2>
      <FeatureSections
        featureSections={featureTableData.featureTableFields.featureSections}
        columnCount={featureTableData.featureTableFields.columnHeaders.length}
        columns={featureTableData.featureTableFields.columnHeaders}
      />
    </Suspense>
  )
}

const loadPricingData = cache(async () => {
  const data: PricingQueryResult = await sanityClient.fetch(
    `*[
      (_type == "featureTable" && _id == "9cb4e359-786a-4cdb-9334-88ad4ce44f05") ||
      (_type == "heroPricing" && _id == "8d8f33e1-7f18-4b2f-8686-5bc57da697db")
    ]{
      _type,
      _id,
      // For featureTable
      "featureTableFields": select(
        _type == "featureTable" => {
          columnHeaders,
          featureSections,
          links
        }
      ),
      // For heroPricing
      "heroPricingFields": select(
        _type == "heroPricing" => {
          options
        }
      )
    }`
  )
  return data
})
