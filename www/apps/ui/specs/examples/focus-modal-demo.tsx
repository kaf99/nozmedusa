import { Button, FocusModal, Heading, Input, Label, Text } from "@medusajs/ui"

export default function FocusModalDemo() {
  return (
    <FocusModal>
      <FocusModal.Trigger asChild>
        <Button>Edit Variant</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>Edit Variant</FocusModal.Title>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div className="flex flex-col gap-y-1">
              <Heading>Create API key</Heading>
              <Text className="text-ui-fg-subtle">
                Create and manage API keys. You can create multiple keys to
                organize your applications.
              </Text>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="key_name" className="text-ui-fg-subtle">
                Key name
              </Label>
              <Input id="key_name" placeholder="my_app" />
            </div>
          </div>
        </FocusModal.Body>
        <FocusModal.Footer>
          <Button>Save</Button>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
