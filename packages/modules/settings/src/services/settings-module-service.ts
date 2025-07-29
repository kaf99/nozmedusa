import {
  Context,
  DAL,
  FindConfig,
  InferEntityType,
  InternalModuleDeclaration,
  ModuleJoinerConfig,
  ModulesSdkTypes,
} from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaError,
  MedusaService,
} from "@medusajs/framework/utils"
import { ViewConfiguration, UserPreference } from "@/models"
import {
  CreateViewConfigurationDTO,
  UpdateViewConfigurationDTO,
  FilterableViewConfigurationProps,
  ViewConfigurationDTO,
  UserPreferenceDTO,
  FilterableUserPreferenceProps,
  ISettingsModuleService,
} from "@/types"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  viewConfigurationService: ModulesSdkTypes.IMedusaInternalService<any>
  userPreferenceService: ModulesSdkTypes.IMedusaInternalService<any>
}

export class SettingsModuleService
  extends MedusaService<{
    ViewConfiguration: { dto: ViewConfigurationDTO }
    UserPreference: { dto: UserPreferenceDTO }
  }>({ ViewConfiguration, UserPreference })
  implements ISettingsModuleService
{
  protected baseRepository_: DAL.RepositoryService
  protected readonly viewConfigurationService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ViewConfiguration>
  >
  protected readonly userPreferenceService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof UserPreference>
  >

  constructor(
    { 
      baseRepository, 
      viewConfigurationService,
      userPreferenceService 
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    // @ts-ignore
    super(...arguments)
    this.baseRepository_ = baseRepository
    this.viewConfigurationService_ = viewConfigurationService
    this.userPreferenceService_ = userPreferenceService
  }

  __joinerConfig(): ModuleJoinerConfig {
    return {
      serviceName: "settings",
      primaryKeys: ["id"],
      linkableKeys: {
        view_configuration_id: "ViewConfiguration",
        user_preference_id: "UserPreference",
      },
      alias: [
        {
          name: ["view_configuration", "view_configurations"],
          entity: "ViewConfiguration",
          args: {
            methodSuffix: "ViewConfigurations",
          }
        },
        {
          name: ["user_preference", "user_preferences"],
          entity: "UserPreference",
          args: {
            methodSuffix: "UserPreferences",
          }
        },
      ],
    }
  }

  // View Configuration methods

  @InjectManager()
  // @ts-expect-error
  async retrieveViewConfiguration(
    id: string,
    config?: FindConfig<InferEntityType<typeof ViewConfiguration>>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO> {
    const viewConfig = await this.viewConfigurationService_.retrieve(
      id,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<ViewConfigurationDTO>(
      viewConfig,
      { populate: true }
    )
  }

  @InjectManager()
  // @ts-expect-error
  async listViewConfigurations(
    filters: FilterableViewConfigurationProps = {},
    config?: FindConfig<InferEntityType<typeof ViewConfiguration>>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO[]> {
    const viewConfigs = await this.viewConfigurationService_.list(
      filters,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<ViewConfigurationDTO[]>(
      viewConfigs,
      { populate: true }
    )
  }

  @InjectManager()
  // @ts-expect-error
  async listAndCountViewConfigurations(
    filters: FilterableViewConfigurationProps = {},
    config?: FindConfig<InferEntityType<typeof ViewConfiguration>>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[ViewConfigurationDTO[], number]> {
    const [viewConfigs, count] = await this.viewConfigurationService_.listAndCount(
      filters,
      config,
      sharedContext
    )

    const serialized = await this.baseRepository_.serialize<ViewConfigurationDTO[]>(
      viewConfigs,
      { populate: true }
    )

    return [serialized, count]
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async createViewConfigurations(
    data: CreateViewConfigurationDTO | CreateViewConfigurationDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO | ViewConfigurationDTO[]> {
    const input = Array.isArray(data) ? data : [data]

    // Validate system defaults
    for (const config of input) {
      if (config.is_system_default && config.user_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "System default view configurations cannot have a user_id"
        )
      }

      if (config.is_system_default) {
        // Check if a system default already exists for this entity
        const existingDefault = await this.viewConfigurationService_.list(
          {
            entity: config.entity,
            is_system_default: true,
          },
          { select: ["id"] },
          sharedContext
        )

        if (existingDefault.length > 0) {
          throw new MedusaError(
            MedusaError.Types.DUPLICATE_ERROR,
            `A system default view configuration already exists for entity: ${config.entity}`
          )
        }
      }
    }

    const created = await this.viewConfigurationService_.create(
      input,
      sharedContext
    )

    const serialized = await this.baseRepository_.serialize<ViewConfigurationDTO[]>(
      created,
      { populate: true }
    )

    return Array.isArray(data) ? serialized : serialized[0]
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async updateViewConfigurations(
    idOrSelector: string | FilterableViewConfigurationProps,
    data: UpdateViewConfigurationDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO | ViewConfigurationDTO[]> {
    let selector: FilterableViewConfigurationProps = {}
    
    if (typeof idOrSelector === "string") {
      selector = { id: idOrSelector }
    } else {
      selector = idOrSelector
    }

    const updated = await this.viewConfigurationService_.update(
      [{ ...selector, ...data }],
      sharedContext
    )

    const serialized = await this.baseRepository_.serialize<ViewConfigurationDTO[]>(
      updated,
      { populate: true }
    )

    return typeof idOrSelector === "string" ? serialized[0] : serialized
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async deleteViewConfigurations(
    ids: string | string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids : [ids]
    await this.viewConfigurationService_.delete(idsArray, sharedContext)
  }

  // User Preference methods

  @InjectManager()
  // @ts-expect-error
  async retrieveUserPreference(
    id: string,
    config?: FindConfig<InferEntityType<typeof UserPreference>>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<UserPreferenceDTO> {
    const pref = await this.userPreferenceService_.retrieve(
      id,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<UserPreferenceDTO>(
      pref,
      { populate: true }
    )
  }

  @InjectManager()
  // @ts-expect-error
  async listUserPreferences(
    filters: FilterableUserPreferenceProps = {},
    config?: FindConfig<InferEntityType<typeof UserPreference>>,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<UserPreferenceDTO[]> {
    const prefs = await this.userPreferenceService_.list(
      filters,
      config,
      sharedContext
    )

    return await this.baseRepository_.serialize<UserPreferenceDTO[]>(
      prefs,
      { populate: true }
    )
  }

  @InjectManager()
  async getUserPreference(
    userId: string,
    key: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<UserPreferenceDTO | null> {
    const prefs = await this.userPreferenceService_.list(
      { user_id: userId, key },
      {},
      sharedContext
    )

    if (prefs.length === 0) {
      return null
    }

    return await this.baseRepository_.serialize<UserPreferenceDTO>(
      prefs[0],
      { populate: true }
    )
  }

  @InjectTransactionManager()
  async setUserPreference(
    userId: string,
    key: string,
    value: any,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<UserPreferenceDTO> {
    const existing = await this.userPreferenceService_.list(
      { user_id: userId, key },
      { select: ["id"] },
      sharedContext
    )

    let result: InferEntityType<typeof UserPreference>

    if (existing.length > 0) {
      const updated = await this.userPreferenceService_.update(
        [{ id: existing[0].id, value }],
        sharedContext
      )
      result = updated[0]
    } else {
      const created = await this.userPreferenceService_.create(
        { user_id: userId, key, value },
        sharedContext
      )
      result = created[0]
    }

    return await this.baseRepository_.serialize<UserPreferenceDTO>(
      result,
      { populate: true }
    )
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async deleteUserPreferences(
    ids: string | string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids : [ids]
    await this.userPreferenceService_.delete(idsArray, sharedContext)
  }

  // Helper methods

  @InjectManager()
  async getActiveViewConfiguration(
    entity: string,
    userId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO | null> {
    // Check if user has an active view preference
    const activeViewPref = await this.getUserPreference(
      userId,
      `active_view.${entity}`,
      sharedContext
    )

    // Check if we have a preference with a view configuration ID (not explicitly null)
    if (activeViewPref && activeViewPref.value?.viewConfigurationId && activeViewPref.value.viewConfigurationId !== null) {
      try {
        return await this.retrieveViewConfiguration(
          activeViewPref.value.viewConfigurationId,
          {},
          sharedContext
        )
      } catch (error) {
        // View configuration might have been deleted
      }
    }

    // If we have an explicit null preference, or no preference, or a deleted view
    // We should check for defaults in this order:
    
    // Check if user has any personal views (only if no explicit null preference)
    if (!activeViewPref || activeViewPref.value?.viewConfigurationId !== null) {
      const personalViews = await this.listViewConfigurations(
        { entity, user_id: userId },
        { order: { created_at: "ASC" } },
        sharedContext
      )

      if (personalViews.length > 0) {
        return personalViews[0]
      }
    }

    // Fall back to system default
    const systemDefaults = await this.listViewConfigurations(
      { entity, is_system_default: true },
      {},
      sharedContext
    )

    return systemDefaults.length > 0 ? systemDefaults[0] : null
  }

  @InjectTransactionManager()
  async setActiveViewConfiguration(
    entity: string,
    userId: string,
    viewConfigurationId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    // Verify the view configuration exists and user has access
    const viewConfig = await this.retrieveViewConfiguration(
      viewConfigurationId,
      {},
      sharedContext
    )

    if (viewConfig.entity !== entity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `View configuration ${viewConfigurationId} is not for entity ${entity}`
      )
    }

    if (viewConfig.user_id && viewConfig.user_id !== userId) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `User ${userId} does not have access to view configuration ${viewConfigurationId}`
      )
    }

    await this.setUserPreference(
      userId,
      `active_view.${entity}`,
      { viewConfigurationId },
      sharedContext
    )
  }

  @InjectManager()
  async getSystemDefaultViewConfiguration(
    entity: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ViewConfigurationDTO | null> {
    const systemDefaults = await this.listViewConfigurations(
      { entity, is_system_default: true },
      {},
      sharedContext
    )

    return systemDefaults.length > 0 ? systemDefaults[0] : null
  }

  @InjectTransactionManager()
  async clearActiveViewConfiguration(
    entity: string,
    userId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    // Instead of deleting, set the preference to null
    // This ensures we're using the same transaction pattern as setActiveViewConfiguration
    await this.setUserPreference(
      userId,
      `active_view.${entity}`,
      { viewConfigurationId: null },
      sharedContext
    )
  }
}