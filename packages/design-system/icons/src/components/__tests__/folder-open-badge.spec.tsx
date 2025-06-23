  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import FolderOpenBadge from "../folder-open-badge"

  describe("FolderOpenBadge", () => {
    it("should render the icon without errors", async () => {
      render(<FolderOpenBadge data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })