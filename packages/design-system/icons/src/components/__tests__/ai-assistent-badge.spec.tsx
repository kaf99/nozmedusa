  import * as React from "react"
  import { cleanup, render, screen } from "@testing-library/react"

  import AiAssistentBadge from "../ai-assistent-badge"

  describe("AiAssistentBadge", () => {
    it("should render the icon without errors", async () => {
      render(<AiAssistentBadge data-testid="icon" />)


      const svgElement = screen.getByTestId("icon")

      expect(svgElement).toBeInTheDocument()

      cleanup()
    })
  })