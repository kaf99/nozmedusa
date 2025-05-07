import Handlebars from "handlebars"
import { SignatureReflection } from "typedoc"

export default function () {
  Handlebars.registerHelper(
    "workflowEvents",
    function (this: SignatureReflection): string {
      if (!this.parent) {
        return ""
      }

      const workflowEventComments = this.parent.comment?.blockTags.filter(
        (tag) => tag.tag === "@workflowEvent"
      )

      if (!workflowEventComments?.length) {
        return ""
      }

      let str = `${Handlebars.helpers.titleLevel()} Emitted Events\n\nThis section lists the events that are either triggered by the \`emitEventStep\` in the workflow, or by another workflow executed within this workflow.\n\nYou can listen to these events in a subscriber, as explained in the [Subscribers](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers) documentation.\n\n`

      str += `<Table>\n`
      str += `  <Table.Header>\n`
      str += `    <Table.Row>\n`
      str += `      <Table.HeaderCell>\nEvent\n</Table.HeaderCell>\n`
      str += `      <Table.HeaderCell>\nDescription\n</Table.HeaderCell>\n`
      str += `      <Table.HeaderCell>\nPayload\n</Table.HeaderCell>\n`
      str += `    </Table.Row>\n`
      str += `  </Table.Header>\n`
      str += `  <Table.Body>\n`
      workflowEventComments.forEach((comment) => {
        const commentContent = comment.content
          .map((c) => c.text)
          .join(" ")
          .split("--")
        let eventName = `\`${commentContent[0].trim()}\``
        const eventDescription = commentContent[1]?.trim() || ""
        const eventPayload = (commentContent[2]?.trim() || "")
          .replace("```ts\n", "")
          .replace("\n```", "")
        const isDeprecated = commentContent.length >= 4

        if (isDeprecated) {
          const deprecatedText = commentContent[4]?.trim()
          eventName += `\n`
          if (deprecatedText) {
            eventName += `<Tooltip text="${deprecatedText}">`
          }
          eventName += `<Badge variant="orange">Deprecated</Badge>`
          if (deprecatedText) {
            eventName += `</Tooltip>`
          }
        }

        str += `    <Table.Row>\n`
        str += `      <Table.Cell>\n${eventName}\n</Table.Cell>\n`
        str += `      <Table.Cell>\n${eventDescription}\n</Table.Cell>\n`
        str += `      <Table.Cell>\n\`\`\`ts blockStyle="inline"\n${eventPayload}\n\`\`\`\n</Table.Cell>\n`
        str += `    </Table.Row>\n`
      })
      str += `  </Table.Body>\n`
      str += `</Table>\n\n`

      return str
    }
  )
}
