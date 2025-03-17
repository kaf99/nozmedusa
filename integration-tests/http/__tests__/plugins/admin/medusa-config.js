const medusaConfig = require("../../../medusa-config.js")
const path = require("path")

module.exports = {
  ...(medusaConfig ?? {}),
  plugins: ["medusa-plugin-navigation"],
}
