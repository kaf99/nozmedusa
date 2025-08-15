import {
  Context,
  DAL,
  InferEntityType,
  InternalModuleDeclaration,
  ModulesSdkTypes,
  SettingsTypes,
} from "@medusajs/framework/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  MedusaError,
  MedusaService,
} from "@medusajs/framework/utils"
import { ViewConfiguration, UserPreference } from "@/models"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  viewConfigurationService: ModulesSdkTypes.IMedusaInternalService<any>
  userPreferenceService: ModulesSdkTypes.IMedusaInternalService<any>
}

export default class SettingsModuleService
  extends MedusaService<{
    ViewConfiguration: { dto: SettingsTypes.ViewConfigurationDTO }
    UserPreference: { dto: SettingsTypes.UserPreferenceDTO }
  }>({ ViewConfiguration, UserPreference })
  implements SettingsTypes.ISettingsModuleService
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
      userPreferenceService,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    super(...arguments)
    this.baseRepository_ = baseRepository
    this.viewConfigurationService_ = viewConfigurationService
    this.userPreferenceService_ = userPreferenceService
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async createViewConfigurations(
    data:
      | SettingsTypes.CreateViewConfigurationDTO
      | SettingsTypes.CreateViewConfigurationDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    SettingsTypes.ViewConfigurationDTO | SettingsTypes.ViewConfigurationDTO[]
  > {
    // Convert to array for validation only
    const isArrayInput = Array.isArray(data)
    const dataArray = isArrayInput ? data : [data]

    // Validate system defaults
    for (const config of dataArray) {
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

    const result = await super.createViewConfigurations(
      dataArray,
      sharedContext
    )
    return isArrayInput ? result : result[0]
  }

  @InjectTransactionManager()
  // @ts-expect-error
  async updateViewConfigurations(
    idOrSelector: string | SettingsTypes.FilterableViewConfigurationProps,
    data: SettingsTypes.UpdateViewConfigurationDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    SettingsTypes.ViewConfigurationDTO | SettingsTypes.ViewConfigurationDTO[]
  > {
    let selector: SettingsTypes.FilterableViewConfigurationProps = {}

    if (typeof idOrSelector === "string") {
      selector = { id: idOrSelector }
    } else {
      selector = idOrSelector
    }

    // Special handling for configuration updates to ensure replacement instead of merge
    if (data.configuration) {
      // First, get the entities to update
      const entities = await this.viewConfigurationService_.list(
        selector,
        {},
        sharedContext
      )

      if (entities.length === 0) {
        return typeof idOrSelector === "string" ? [] : []
      }

      // Use upsertWithReplace to update the configuration field without merging
      const updateDataArray = entities.map((entity) => ({
        id: entity.id,
        ...data,
        configuration: {
          visible_columns: data.configuration?.visible_columns ?? [],
          column_order: data.configuration?.column_order ?? [],
          column_widths:
            data.configuration?.column_widths !== undefined
              ? data.configuration.column_widths
              : {},
          filters:
            data.configuration?.filters !== undefined
              ? data.configuration.filters
              : {},
          sorting:
            data.configuration?.sorting !== undefined
              ? data.configuration.sorting
              : null,
          search:
            data.configuration?.search !== undefined
              ? data.configuration.search
              : "",
        },
      }))

      // Use upsertWithReplace which uses nativeUpdateMany internally and doesn't merge JSON fields
      const { entities: updatedEntities } =
        await this.viewConfigurationService_.upsertWithReplace(
          updateDataArray,
          { relations: [] },
          sharedContext
        )

      const serialized = await this.baseRepository_.serialize<
        SettingsTypes.ViewConfigurationDTO[]
      >(updatedEntities, { populate: true })

      return typeof idOrSelector === "string" ? serialized[0] : serialized
    }

    // For non-configuration updates, use the standard update method
    const updated = await this.viewConfigurationService_.update(
      { selector, data },
      sharedContext
    )

    const serialized = await this.baseRepository_.serialize<
      SettingsTypes.ViewConfigurationDTO[]
    >(updated, { populate: true })

    return typeof idOrSelector === "string" ? serialized[0] : serialized
  }

  @InjectManager()
  async getUserPreference(
    userId: string,
    key: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<SettingsTypes.UserPreferenceDTO | null> {
    const prefs = await this.userPreferenceService_.list(
      { user_id: userId, key },
      {},
      sharedContext
    )

    if (prefs.length === 0) {
      return null
    }

    return await this.baseRepository_.serialize<SettingsTypes.UserPreferenceDTO>(
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
  ): Promise<SettingsTypes.UserPreferenceDTO> {
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

    return await this.baseRepository_.serialize<SettingsTypes.UserPreferenceDTO>(
      result,
      { populate: true }
    )
  }

  @InjectManager()
  async getActiveViewConfiguration(
    entity: string,
    userId: string,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<SettingsTypes.ViewConfigurationDTO | null> {
    // Check if user has an active view preference
    const activeViewPref = await this.getUserPreference(
      userId,
      `active_view.${entity}`,
      sharedContext
    )

    // Check if we have a preference with a view configuration ID (not explicitly null)
    if (
      activeViewPref &&
      activeViewPref.value?.viewConfigurationId &&
      activeViewPref.value.viewConfigurationId !== null
    ) {
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
      const [personalView] = await this.listViewConfigurations(
        { entity, user_id: userId },
        { take: 1, order: { created_at: "ASC" } },
        sharedContext
      )

      if (personalView) {
        return personalView
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
  ): Promise<SettingsTypes.ViewConfigurationDTO | null> {
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
