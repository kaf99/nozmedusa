import { Module } from "@medusajs/framework/utils"
import { SettingsModuleService } from "@/services"

export default Module("settings", {
  service: SettingsModuleService,
})

export * from "./types"