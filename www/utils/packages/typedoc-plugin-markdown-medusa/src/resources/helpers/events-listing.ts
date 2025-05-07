import Handlebars from "handlebars"
import pkg from "slugify"
import { DeclarationReflection, ReflectionKind } from "typedoc"
import { pascalToWords } from "utils"

const slugify = pkg.default

export default function () {
  Handlebars.registerHelper(
    "eventsListing",
    function (this: DeclarationReflection) {
      const content: string[] = []

      const subtitleLevel = (this.children?.length ?? 0) > 1 ? 3 : 2
      const showHeader = (this.children?.length ?? 0) > 1

      function parseChildren(children: DeclarationReflection[]) {
        children?.forEach((child, index) => {
          content.push(
            formatEventsType(child as DeclarationReflection, {
              subtitleLevel,
              showHeader,
            })
          )
          if (index < children!.length - 1) {
            content.push("")
            content.push("---")
            content.push("")
          }
        })
      }

      if (this.kind === ReflectionKind.Module) {
        this.children?.forEach((child, index) => {
          parseChildren(child.children || [])
          if (index < this.children!.length - 1) {
            content.push("")
            content.push("---")
            content.push("")
          }
        })
      } else {
        parseChildren(this.children || [])
      }

      return content.join("\n")
    }
  )
}

function formatEventsType(
  eventVariable: DeclarationReflection,
  {
    subtitleLevel = 3,
    showHeader = true,
  }: {
    subtitleLevel?: number
    showHeader?: boolean
  }
) {
  if (eventVariable.type?.type !== "reflection") {
    return ""
  }
  const content: string[] = []
  const subHeaderPrefix = "#".repeat(subtitleLevel)
  const header = pascalToWords(
    eventVariable.name.replaceAll("WorkflowEvents", "")
  )
  if (showHeader) {
    content.push(`## ${header} Events`)
  }
  content.push("")

  const eventProperties = eventVariable.type.declaration.children || []

  content.push(`${subHeaderPrefix} Summary`)
  content.push("")
  // table start
  content.push(`<Table>`)
  // table header start
  content.push(`  <Table.Header>`)
  content.push(`    <Table.Row>`)
  content.push(`      <Table.HeaderCell>\nEvent\n</Table.HeaderCell>`)
  content.push(`      <Table.HeaderCell>\nDescription\n</Table.HeaderCell>`)
  // table header end
  content.push(`    </Table.Row>`)
  content.push(`  </Table.Header>`)
  // table body start
  content.push(`  <Table.Body>`)
  eventProperties.forEach((event) => {
    let eventName =
      event.comment?.blockTags
        .find((tag) => tag.tag === "@eventName")
        ?.content.map((content) => content.text)
        .join("") || ""
    eventName = `[${eventName}](#${slugify(eventName.replace(".", ""), {
      lower: true,
    })})`
    const eventDescription = event.comment?.summary
      .map((content) => content.text)
      .join("")
    const deprecationTag = event.comment?.blockTags.find(
      (tag) => tag.tag === "@deprecated"
    )

    if (deprecationTag) {
      eventName += `\n`
      const deprecationText = deprecationTag.content
        .map((content) => content.text)
        .join("")
        .trim()
      if (deprecationText.length) {
        eventName += `<Tooltip text="${deprecationText}">`
      }
      eventName += `<Badge variant="orange">Deprecated</Badge>`
      if (deprecationText.length) {
        eventName += `</Tooltip>`
      }
    }

    content.push(`    <Table.Row>`)
    content.push(`      <Table.Cell>\n${eventName}\n</Table.Cell>`)
    content.push(`      <Table.Cell>\n${eventDescription}\n</Table.Cell>`)
    content.push(`    </Table.Row>`)
  })
  // table body end
  content.push(`  </Table.Body>`)
  // table end
  content.push(`</Table>`)
  content.push("")

  eventProperties.forEach((event, index) => {
    const eventName = event.comment?.blockTags
      .find((tag) => tag.tag === "@eventName")
      ?.content.map((content) => content.text)
      .join("")
    const eventDescription = event.comment?.summary
      .map((content) => content.text)
      .join("")
    const eventPayload = event.comment?.blockTags
      .find((tag) => tag.tag === "@eventPayload")
      ?.content.map((content) => content.text)
      .join("")
    const workflows = event.comment?.blockTags
      .find((tag) => tag.tag === "@workflows")
      ?.content.map((content) => content.text)
      .join("")
      .split(", ")
    const deprecatedTag = event.comment?.blockTags.find(
      (tag) => tag.tag === "@deprecated"
    )

    content.push(`${subHeaderPrefix} \`${eventName}\``)
    content.push("")
    if (deprecatedTag) {
      const deprecationText = deprecatedTag.content
        .map((content) => content.text)
        .join("")
        .trim()
      if (deprecationText.length) {
        content.push(`<Tooltip text="${deprecationText}">`)
      }

      content.push(`<Badge variant="orange">Deprecated</Badge>`)

      if (deprecationText.length) {
        content.push(`</Tooltip>`)
      }
      content.push("")
    }
    content.push(eventDescription || "")
    content.push("")
    content.push(`${subHeaderPrefix}# Payload`)
    content.push("")
    content.push(eventPayload || "")
    content.push("")
    content.push(`${subHeaderPrefix}# Workflows Emitting this Event`)
    content.push("")
    workflows?.forEach((workflow) => {
      content.push(`- [${workflow}](/references/medusa-workflows/${workflow})`)
    })
    content.push("")
    if (index < eventProperties.length - 1) {
      content.push("---")
      content.push("")
    }
  })

  return content.join("\n")
}
