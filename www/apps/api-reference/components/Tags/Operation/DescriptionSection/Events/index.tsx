"use client"

import {
  Badge,
  DetailsSummary,
  Link,
  MarkdownContent,
  Tabs,
  TabsContent,
  TabsContentWrapper,
  TabsList,
  TabsTrigger,
  Tooltip,
} from "docs-ui"
import { useMemo } from "react"
import type { OpenAPI } from "types"
import TagOperationParameters from "../../Parameters"

export type TagsOperationDescriptionSectionEventsProps = {
  events: OpenAPI.OasEvents[]
}

const TagsOperationDescriptionSectionEvents = ({
  events,
}: TagsOperationDescriptionSectionEventsProps) => {
  return (
    <>
      <DetailsSummary
        title="Emitted Events"
        subtitle={
          <span>
            The following events are emitted by the workflow used in this API
            route. You can listen to and handle these events using a{" "}
            <Link href="https://docs.medusajs.com/learn/fundamentals/events-and-subscribers">
              Subscriber
            </Link>
          </span>
        }
        expandable={false}
        className="border-t-0"
        titleClassName="text-h3 mt-1.5"
      />
      <Tabs defaultValue={events[0].name} className="mt-1">
        <TabsList>
          {events.map((event) => (
            <TabsTrigger key={event.name} value={event.name}>
              {event.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContentWrapper>
          {events.map((event) => (
            <TagsOperationDescriptionSectionEvent
              key={event.name}
              event={event}
            />
          ))}
        </TabsContentWrapper>
      </Tabs>
    </>
  )
}

export default TagsOperationDescriptionSectionEvents

const TagsOperationDescriptionSectionEvent = ({
  event,
}: {
  event: OpenAPI.OasEvents
}) => {
  const parsedPayload: OpenAPI.SchemaObject = useMemo(() => {
    const payloadParams = event.payload.matchAll(
      /([\w_]+),? \/\/ (\(\w*\) )*(.*)/g
    )
    const payload = Array.from(payloadParams).map((match) => {
      return {
        name: match[1],
        type: match[2]?.replace(/\(|\)/g, "") || "string",
        description: match[3],
      }
    })
    return {
      type: "object",
      required: ["payload"],
      properties: {
        payload: {
          type: "object",
          description: "The payload emitted with the event",
          required: [...payload.map((param) => param.name)],
          properties: payload.reduce(
            (acc, curr) => {
              acc[curr.name] = {
                type: curr.type as OpenAPI.OpenAPIV3.NonArraySchemaObjectType,
                description: curr.description,
                properties: {},
              }
              return acc
            },
            {} as Record<string, OpenAPI.SchemaObject>
          ),
        },
      },
    }
  }, [event.payload])
  return (
    <TabsContent value={event.name}>
      <div className="my-1 flex flex-wrap gap-1">
        <MarkdownContent
          allowedElements={["code", "p", "a"]}
          className={"[&_p:last-child]:!mb-1"}
        >
          {`\`${event.name}\`: ${event.description}`}
        </MarkdownContent>
        {event.deprecated &&
          (event.deprecated_message ? (
            <Tooltip text={event.deprecated_message}>
              <Badge variant="orange">Deprecated</Badge>
            </Tooltip>
          ) : (
            <Badge variant="orange">Deprecated</Badge>
          ))}
        {event.version && (
          <Tooltip text={`This event is emitted since v${event.version}`}>
            <Badge variant="blue">v{event.version}</Badge>
          </Tooltip>
        )}
      </div>
      <TagOperationParameters
        schemaObject={parsedPayload}
        topLevel={true}
        isExpanded={true}
      />
    </TabsContent>
  )
}
