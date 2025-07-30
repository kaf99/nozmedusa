import { Tooltip } from "@medusajs/ui"
import ReactCountryFlag from "react-country-flag"

export const CountryCell = ({
  display_name,
  iso_2,
}: {
  display_name: string
  iso_2: string
}) => {
  return (
    <div className="flex !min-w-[32px] items-center justify-center">
      <Tooltip content={display_name}>
        <div className="flex items-center justify-center overflow-hidden rounded-sm">
          <ReactCountryFlag
            countryCode={iso_2!.toUpperCase()}
            svg
            style={{
              width: "16px",
              height: "16px",
            }}
            aria-label={display_name}
          />
        </div>
      </Tooltip>
    </div>
  )
}
