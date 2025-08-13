// import { useParams } from "react-router-dom"
// import { MetadataForm } from "../../../components/forms/metadata-form/metadata-form"
// import { useShippingOptionType, useUpdateShippingOptionType } from "../../../hooks/api"
//
// export const ShippingOptionTypeMetadata = () => {
//   const { id } = useParams()
//
//   const { shipping_option_type, isPending, isError, error } = useShippingOptionType(id!)
//
//   const { mutateAsync, isPending: isMutating } = useUpdateShippingOptionType(
//     shipping_option_type?.id!
//   )
//
//   if (isError) {
//     throw error
//   }
//
//   return (
//     <MetadataForm
//       metadata={shipping_option_type?.metadata}
//       hook={mutateAsync}
//       isPending={isPending}
//       isMutating={isMutating}
//     />
//   )
// }
