import {
  IFeatureFlagProvider,
  ProviderRetrieveFeatureFlagDTO,
  ProviderFeatureFlagDTO,
} from "@medusajs/types"

/**
 * ### constructor
 *
 * The constructor allows you to access resources from the module's container using the first parameter,
 * and the module's options using the second parameter.
 *
 * If you're creating a client or establishing a connection with a third-party service, do it in the constructor.
 *
 * #### Example
 *
 * ```ts
 * import { Logger } from "@medusajs/framework/types"
 * import { AbstractFeatureFlagProviderService } from "@medusajs/framework/utils"
 *
 * type InjectedDependencies = {
 *   logger: Logger
 * }
 *
 * type Options = {
 *   apiKey: string
 * }
 *
 * class MyFeatureFlagProviderService extends AbstractFeatureFlagProviderService {
 *   protected logger_: Logger
 *   protected options_: Options
 *   static identifier = "my-feature-flag"
 *   // assuming you're initializing a client
 *   protected client
 *
 *   constructor (
 *     { logger }: InjectedDependencies,
 *     options: Options
 *   ) {
 *     super()
 *
 *     this.logger_ = logger
 *     this.options_ = options
 *
 *     // assuming you're initializing a client
 *     this.client = new Client(options)
 *   }
 * }
 *
 * export default MyFeatureFlagProviderService
 * ```
 */
export class AbstractFeatureFlagProviderService
  implements IFeatureFlagProvider
{
  /**
   * Each feature flag provider has a unique ID used to identify it. The provider's ID
   * will be stored as `ftrflg_{identifier}_{id}`, where `{id}` is the provider's `id`
   * property in the `medusa-config.ts`.
   *
   * @example
   * class MyFeatureFlagProviderService extends AbstractFeatureFlagProviderService {
   *   static identifier = "my-feature-flag"
   *   // ...
   * }
   */
  static identifier: string

  /**
   * @ignore
   */
  getIdentifier() {
    return (this.constructor as any).identifier
  }

  /**
   * This method tracks an event using your provider's semantics
   *
   * This method will be used when tracking events to third-party providers.
   *
   * @param {ProviderRetrieveFeatureFlagDTO} data - The data for the event.
   * @returns {Promise<ProviderFeatureFlagDTO>} Resolves with the feature flag information when the feature flag is retrieved successfully.
   *
   * @example
   * class MyFeatureFlagProviderService extends AbstractFeatureFlagProviderService {
   *   // ...
   *   async retrieveFeatureFlag(
   *     data: ProviderRetrieveFeatureFlagDTO
   *   ): Promise<ProviderFeatureFlagDTO> {
   *     // retrieve feature flag from third-party provider
   *     // or using custom logic
   *     // for example:
   *     this.client.retrieveFeatureFlag(data)
   *   }
   * }
   */
  async retrieveFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO> {
    throw Error("retrieveFeatureFlag must be overridden by the child class")
  }
}
