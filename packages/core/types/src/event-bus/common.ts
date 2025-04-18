import { AddressDTO } from "../address"
import { CartLineItemDTO } from "../cart"
import { StoreCartAddress, StoreCartLineItem } from "../http"
import { Context } from "../shared-context"

export type Subscriber<TData = unknown> = (data: Event<TData>) => Promise<void>

export type SubscriberContext = {
  /**
   * The ID of the subscriber. Useful when retrying failed subscribers.
   */
  subscriberId: string
}

export type SubscriberDescriptor = {
  id: string
  subscriber: Subscriber
}

export type EventMetadata = Record<string, unknown> & {
  /**
   * The ID of the event's group. Grouped events are useful when you have distributed transactions
   * where you need to explicitly group, release and clear events upon lifecycle events of a transaction.
   *
   * When set, you must release the grouped events using the Event Module's `releaseGroupedEvents` method to emit the events.
   */
  eventGroupId?: string
}

export type Event<TData = unknown> = {
  /**
   * The event's name.
   *
   * @example
   * user.created
   */
  name: string
  /**
   * Additional meadata to pass with the event.
   */
  metadata?: EventMetadata
  /**
   * The data payload that subscribers receive. For example, the ID of the created user.
   */
  data: TData
}

/**
 * The details of an event to emit.
 */
export type Message<TData = unknown> = Event<TData> & {
  options?: Record<string, unknown>
}

export type RawMessageFormat<TData = any> = {
  eventName: string
  data: TData
  source: string
  object: string
  action?: string
  context?: Pick<Context, "eventGroupId">
  options?: Record<string, any>
}

export enum ChangeAction {
  ADDED = "added",
  UPDATED = "updated",
  DELETED = "deleted",
}

type Change<T> = {
  action: ChangeAction
  value: T
}

export type CartWorkflowEventPayload = {
  id: string // Cart ID
  changes: {
    line_items?: Change<Partial<StoreCartLineItem | CartLineItemDTO>>[]
    promo_codes?: Change<string>[]
    region_id?: Change<string>
    customer_id?: Change<string>
    sales_channel_id?: Change<string>
    email?: Change<string>
    currency_code?: Change<string>
    metadata?: Change<Record<string, unknown>>
    shipping_address?: Change<Partial<StoreCartAddress | AddressDTO>>
    billing_address?: Change<Partial<StoreCartAddress | AddressDTO>>
  }
}
