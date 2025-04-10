import { IEventBusModuleService } from "@medusajs/framework/types"
import { EventEmitter } from "events"

// Allows you to wait for all subscribers to execute for a given event. Only works with the local event bus.
export const waitSubscribersExecution = (
  eventName: string,
  eventBus: IEventBusModuleService
) => {
  const eventEmitter: EventEmitter = (eventBus as any).eventEmitter_
  const subscriberPromises: Promise<any>[] = []
  const originalListeners = eventEmitter.listeners(eventName)

  // If there are no existing listeners, resolve once the event happens. Otherwise, wrap the existing subscribers in a promise and resolve once they are done.
  if (!eventEmitter.listeners(eventName).length) {
    let ok
    const promise = new Promise((resolve) => {
      ok = resolve
    })

    subscriberPromises.push(promise)
    eventEmitter.on(eventName, ok)
  } else {
    console.log({ eventName })
    eventEmitter.listeners(eventName).forEach((listener: any) => {
      eventEmitter.removeListener(eventName, listener)
      console.log({ listener })

      let ok, nok
      const promise = new Promise((resolve, reject) => {
        ok = resolve
        nok = reject
      })
      subscriberPromises.push(promise)

      const newListener = async (...args2) => {
        try {
          const response = await listener.apply(eventBus, args2)
          ok(response)
        } catch (error) {
          nok(error)
        }
      }

      eventEmitter.on(eventName, newListener)
    })
  }

  return Promise.all(subscriberPromises).finally(() => {
    eventEmitter.removeAllListeners(eventName)
    originalListeners.forEach((listener) => {
      eventEmitter.on(eventName, listener as (...args: any) => void)
    })
  })
}
