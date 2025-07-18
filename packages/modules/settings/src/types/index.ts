import { 
  BaseFilterable
} from "@medusajs/framework/types"

export interface ISettingsModuleService {
  // View Configuration methods
  retrieveViewConfiguration(
    id: string,
    config?: any,
    sharedContext?: any
  ): Promise<ViewConfigurationDTO>

  listViewConfigurations(
    filters?: FilterableViewConfigurationProps,
    config?: any,
    sharedContext?: any
  ): Promise<ViewConfigurationDTO[]>

  listAndCountViewConfigurations(
    filters?: FilterableViewConfigurationProps,
    config?: any,
    sharedContext?: any
  ): Promise<[ViewConfigurationDTO[], number]>

  createViewConfigurations(
    data: CreateViewConfigurationDTO | CreateViewConfigurationDTO[],
    sharedContext?: any
  ): Promise<ViewConfigurationDTO | ViewConfigurationDTO[]>

  updateViewConfigurations(
    id: string,
    data: UpdateViewConfigurationDTO,
    sharedContext?: any
  ): Promise<ViewConfigurationDTO>

  updateViewConfigurations(
    selector: FilterableViewConfigurationProps,
    data: UpdateViewConfigurationDTO,
    sharedContext?: any
  ): Promise<ViewConfigurationDTO[]>

  deleteViewConfigurations(
    ids: string | string[],
    sharedContext?: any
  ): Promise<void>

  // User Preference methods
  retrieveUserPreference(
    id: string,
    config?: any,
    sharedContext?: any
  ): Promise<UserPreferenceDTO>

  listUserPreferences(
    filters?: FilterableUserPreferenceProps,
    config?: any,
    sharedContext?: any
  ): Promise<UserPreferenceDTO[]>

  getUserPreference(
    userId: string,
    key: string,
    sharedContext?: any
  ): Promise<UserPreferenceDTO | null>

  setUserPreference(
    userId: string,
    key: string,
    value: any,
    sharedContext?: any
  ): Promise<UserPreferenceDTO>

  deleteUserPreferences(
    ids: string | string[],
    sharedContext?: any
  ): Promise<void>

  // Helper methods
  getActiveViewConfiguration(
    entity: string,
    userId: string,
    sharedContext?: any
  ): Promise<ViewConfigurationDTO | null>

  setActiveViewConfiguration(
    entity: string,
    userId: string,
    viewConfigurationId: string,
    sharedContext?: any
  ): Promise<void>
}

export interface ViewConfigurationDTO {
  id: string
  entity: string
  name: string | null
  user_id: string | null
  is_system_default: boolean
  configuration: {
    visible_columns: string[]
    column_order: string[]
    column_widths?: Record<string, number>
  }
  created_at: Date
  updated_at: Date
}

export interface CreateViewConfigurationDTO {
  entity: string
  name?: string | null
  user_id?: string | null
  is_system_default?: boolean
  configuration: {
    visible_columns: string[]
    column_order: string[]
    column_widths?: Record<string, number>
  }
}

export interface UpdateViewConfigurationDTO {
  name?: string
  configuration?: {
    visible_columns?: string[]
    column_order?: string[]
    column_widths?: Record<string, number>
  }
}

export interface FilterableViewConfigurationProps 
  extends BaseFilterable<ViewConfigurationDTO> {
  id?: string | string[]
  entity?: string | string[]
  user_id?: string | string[] | null
  is_system_default?: boolean
  name?: string | string[]
}

export interface UserPreferenceDTO {
  id: string
  user_id: string
  key: string
  value: any
  created_at: Date
  updated_at: Date
}

export interface CreateUserPreferenceDTO {
  user_id: string
  key: string
  value: any
}

export interface UpdateUserPreferenceDTO {
  value: any
}

export interface FilterableUserPreferenceProps 
  extends BaseFilterable<UserPreferenceDTO> {
  id?: string | string[]
  user_id?: string | string[]
  key?: string | string[]
}