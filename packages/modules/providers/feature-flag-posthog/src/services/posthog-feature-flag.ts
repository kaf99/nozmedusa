import {
  PosthogFeatureFlagServiceOptions,
  Logger,
  ProviderRetrieveFeatureFlagDTO,
  ProviderFeatureFlagDTO,
} from "@medusajs/framework/types"
import { PostHog } from "posthog-node"
import { AbstractFeatureFlagProviderService } from "@medusajs/framework/utils"

type InjectedDependencies = {
  logger: Logger
}

export class PosthogFeatureFlagService extends AbstractFeatureFlagProviderService {
  static identifier = "feature-flag-posthog"
  protected config_: PosthogFeatureFlagServiceOptions
  protected logger_: Logger
  protected client_: PostHog

  constructor(
    { logger }: InjectedDependencies,
    options: PosthogFeatureFlagServiceOptions
  ) {
    super()
    this.config_ = options
    this.logger_ = logger

    if (!options.posthogEventsKey) {
      throw new Error("Posthog API key is not set, but is required")
    }

    this.client_ = new PostHog(options.posthogEventsKey, {
      host: options.posthogHost || "https://eu.i.posthog.com",
    })
  }

  async getFeatureFlag(
    data: ProviderRetrieveFeatureFlagDTO
  ): Promise<ProviderFeatureFlagDTO> {
    const typedContext = data.context as {
      actor_id: string
      group: { id: string; type: string }
      personProperties: Record<string, any>
      groupProperties: Record<string, any>
    }
    if (!typedContext.actor_id) {
      throw new Error("actor_id is required to get a feature flag")
    }

    const ff = await this.client_.getFeatureFlag(
      data.feature_flag,
      typedContext.actor_id,
      {
        groups: typedContext.group
          ? {
              [typedContext.group.type]: typedContext.group.id,
            }
          : {},
        personProperties: typedContext.personProperties,
        groupProperties: typedContext.groupProperties,
      }
    )

    if (!ff) {
      return {
        is_enabled: false,
      }
    }

    return {
      is_enabled: true,
      value: ff.toString(),
    }
  }

  async shutdown() {
    await this.client_.shutdown()
  }
}
