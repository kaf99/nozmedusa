import {
  createPaymentSessionsWorkflow,
  createPaymentSessionsWorkflowId,
} from "@medusajs/core-flows"
import { ICartModuleService, IPaymentModuleService, IRegionModuleService } from "@medusajs/types"
import { Modules } from "@medusajs/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(50000)

const env = { MEDUSA_FF_MEDUSA_V2: true }

medusaIntegrationTestRunner({
  env,
  testSuite: ({ dbConnection, getContainer, api }) => {
    describe("Carts workflows", () => {
      let appContainer
      let paymentModule: IPaymentModuleService
      let regionModule: IRegionModuleService
      let cartModule: ICartModuleService
      let remoteLink

      beforeAll(async () => {
        appContainer = getContainer()
        paymentModule = appContainer.resolve(Modules.PAYMENT)
        regionModule = appContainer.resolve(Modules.REGION)
        cartModule = appContainer.resolve(Modules.CART)
        remoteLink = appContainer.resolve("remoteLink")
      })

      describe("createPaymentSessionsWorkflow", () => {
        let region
        let paymentCollection
        let cart

        beforeEach(async () => {
          region = await regionModule.createRegions({
            currency_code: "usd",
            name: "US",
          })

          cart = await cartModule.createCarts({
            region_id: region.id,
            currency_code: "usd",
            items: [
              {
                quantity: 1,
                unit_price: 1000,
                title: "Test Item",
              }
            ]
          })

          paymentCollection = await paymentModule.createPaymentCollections({
            currency_code: "usd",
            amount: 1000,
          })

          remoteLink.create({
            [Modules.CART]: {
              cart_id: cart.id,
            },
            [Modules.PAYMENT]: {
              payment_collection_id: paymentCollection.id,
            },
          })
        })

        it("should create payment sessions", async () => {
          await createPaymentSessionsWorkflow(appContainer).run({
            input: {
              payment_collection_id: paymentCollection.id,
              provider_id: "pp_system_default",
              context: {},
              data: {},
            },
          })

          paymentCollection = await paymentModule.retrievePaymentCollection(
            paymentCollection.id,
            {
              relations: ["payment_sessions"],
            }
          )

          expect(paymentCollection).toEqual(
            expect.objectContaining({
              id: paymentCollection.id,
              currency_code: "usd",
              amount: 1000,
              payment_sessions: expect.arrayContaining([
                expect.objectContaining({
                  amount: 1000,
                  currency_code: "usd",
                  provider_id: "pp_system_default",
                  context: expect.objectContaining({
                    cart: expect.objectContaining({
                      id: cart.id,
                      currency_code: "usd",
                      items: expect.arrayContaining([
                        expect.objectContaining({
                          id: expect.any(String),
                          tax_lines: expect.arrayContaining([]),
                        })
                      ]),
                      total: expect.any(Number),
                      subtotal: expect.any(Number),
                      tax_total: expect.any(Number),
                      discount_total: expect.any(Number),
                      discount_tax_total: expect.any(Number),
                      shipping_total: expect.any(Number),
                      shipping_subtotal: expect.any(Number),
                      shipping_tax_total: expect.any(Number), 
                      item_total: expect.any(Number),
                      item_subtotal: expect.any(Number),
                    }),
                  }),
                }),
              ]),
            })
          )
        })

        it("should delete existing sessions when create payment sessions", async () => {
          await createPaymentSessionsWorkflow(appContainer).run({
            input: {
              payment_collection_id: paymentCollection.id,
              provider_id: "pp_system_default",
              context: {},
              data: {},
            },
          })

          await createPaymentSessionsWorkflow(appContainer).run({
            input: {
              payment_collection_id: paymentCollection.id,
              provider_id: "pp_system_default",
              context: {},
              data: {},
            },
          })

          paymentCollection = await paymentModule.retrievePaymentCollection(
            paymentCollection.id,
            { relations: ["payment_sessions"] }
          )

          expect(paymentCollection).toEqual(
            expect.objectContaining({
              id: paymentCollection.id,
              currency_code: "usd",
              amount: 1000,
              payment_sessions: [
                expect.objectContaining({
                  amount: 1000,
                  currency_code: "usd",
                  provider_id: "pp_system_default",
                }),
              ],
            })
          )
        })

        describe("compensation", () => {
          it("should delete created payment collection if a subsequent step fails", async () => {
            const workflow = createPaymentSessionsWorkflow(appContainer)

            workflow.appendAction("throw", createPaymentSessionsWorkflowId, {
              invoke: async function failStep() {
                throw new Error(
                  `Failed to do something after creating payment sessions`
                )
              },
            })

            const region = await regionModule.createRegions({
              currency_code: "usd",
              name: "US",
            })

            let paymentCollection =
              await paymentModule.createPaymentCollections({
                currency_code: "usd",
                amount: 1000,
              })

            const { errors } = await workflow.run({
              input: {
                payment_collection_id: paymentCollection.id,
                provider_id: "pp_system_default",
                context: {},
                data: {},
              },
              throwOnError: false,
            })

            expect(errors).toEqual([
              {
                action: "throw",
                handlerType: "invoke",
                error: expect.objectContaining({
                  message: `Failed to do something after creating payment sessions`,
                }),
              },
            ])

            const sessions = await paymentModule.listPaymentSessions({
              payment_collection_id: paymentCollection.id,
            })

            expect(sessions).toHaveLength(0)
          })
        })
      })
    })
  },
})
