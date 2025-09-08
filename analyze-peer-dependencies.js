#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const exlcudedPackages = ["medusa-test-utils", "admin"]
/**
 * Recursively finds all package.json files in the packages directory
 * @param {string} dir - Directory to search
 * @param {string[]} results - Array to store results
 * @returns {string[]} Array of package.json file paths
 */
function findPackageJsonFiles(dir, results = []) {
  try {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (exlcudedPackages.includes(file)) {
        continue
      }

      if (stat.isDirectory() && file !== "node_modules") {
        findPackageJsonFiles(fullPath, results)
      } else if (file === "package.json") {
        results.push(fullPath)
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`)
  }

  return results
}

/**
 * Reads and parses a package.json file
 * @param {string} filePath - Path to package.json
 * @returns {Object|null} Parsed package.json or null if error
 */
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return JSON.parse(content)
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}: ${error.message}`)
    return null
  }
}

/**
 * Analyzes peer dependencies across all packages
 */
function analyzePeerDependencies() {
  const packagesDir = path.join(process.cwd(), "packages")

  if (!fs.existsSync(packagesDir)) {
    console.error(
      "Error: packages directory not found in current working directory"
    )
    process.exit(1)
  }

  console.log("🔍 Analyzing peer dependencies across monorepo packages...\n")

  // Find all package.json files
  const packageJsonFiles = findPackageJsonFiles(packagesDir)
  console.log(`Found ${packageJsonFiles.length} package.json files\n`)

  // Data structures to store analysis results
  const peerDepsAnalysis = {}
  const packagesWithPeerDeps = []
  const packagesWithoutPeerDeps = []

  // Analyze each package.json
  for (const filePath of packageJsonFiles) {
    const packageJson = readPackageJson(filePath)
    if (!packageJson) continue

    const relativePath = path.relative(process.cwd(), filePath)
    const packageName = packageJson.name || path.dirname(relativePath)

    if (
      packageJson.peerDependencies &&
      Object.keys(packageJson.peerDependencies).length > 0
    ) {
      packagesWithPeerDeps.push({
        name: packageName,
        path: relativePath,
        peerDependencies: packageJson.peerDependencies,
        peerDependenciesMeta: packageJson.peerDependenciesMeta || {},
      })

      // Group peer dependencies by name
      for (const [depName, version] of Object.entries(
        packageJson.peerDependencies
      )) {
        if (!peerDepsAnalysis[depName]) {
          peerDepsAnalysis[depName] = {
            totalCount: 0,
            packages: [],
            versions: new Set(),
            isOptionalSomewhere: false,
          }
        }

        peerDepsAnalysis[depName].totalCount++
        peerDepsAnalysis[depName].packages.push({
          name: packageName,
          path: relativePath,
          version: version,
          isOptional:
            packageJson.peerDependenciesMeta?.[depName]?.optional || false,
        })
        peerDepsAnalysis[depName].versions.add(version)

        if (packageJson.peerDependenciesMeta?.[depName]?.optional) {
          peerDepsAnalysis[depName].isOptionalSomewhere = true
        }
      }
    } else {
      packagesWithoutPeerDeps.push({
        name: packageName,
        path: relativePath,
      })
    }
  }

  // Generate report
  console.log("📊 PEER DEPENDENCIES ANALYSIS REPORT")
  console.log("=====================================\n")

  // Summary statistics
  console.log("📈 SUMMARY STATISTICS")
  console.log("--------------------")
  console.log(`Total packages analyzed: ${packageJsonFiles.length}`)
  console.log(`Packages with peer dependencies: ${packagesWithPeerDeps.length}`)
  console.log(
    `Packages without peer dependencies: ${packagesWithoutPeerDeps.length}`
  )
  console.log(
    `Unique peer dependencies found: ${Object.keys(peerDepsAnalysis).length}`
  )

  const totalPeerDepDeclarations = Object.values(peerDepsAnalysis).reduce(
    (sum, dep) => sum + dep.totalCount,
    0
  )
  console.log(
    `Total peer dependency declarations: ${totalPeerDepDeclarations}\n`
  )

  // Peer dependencies breakdown
  if (Object.keys(peerDepsAnalysis).length > 0) {
    console.log("🔗 PEER DEPENDENCIES BREAKDOWN")
    console.log("-------------------------------")

    // Sort by usage count (most used first)
    const sortedPeerDeps = Object.entries(peerDepsAnalysis).sort(
      ([, a], [, b]) => b.totalCount - a.totalCount
    )

    for (const [depName, info] of sortedPeerDeps) {
      if (info.totalCount <= 2) continue

      console.log(`\n📦 ${depName}`)
      console.log(`   Used by: ${info.totalCount} package(s)`)
      console.log(`   Version ranges: ${Array.from(info.versions).join(", ")}`)

      if (info.isOptionalSomewhere) {
        console.log(`   ⚠️  Optional in some packages`)
      }

      console.log(`   Packages using this dependency:`)
      for (const pkg of info.packages) {
        const optionalFlag = pkg.isOptional ? " (optional)" : ""
        console.log(`   • ${pkg.name} (${pkg.version})${optionalFlag}`)
        console.log(`     Path: ${pkg.path}`)
      }
    }
  }

  // Packages with peer dependencies
  if (packagesWithPeerDeps.length > 0) {
    console.log("\n\n📋 PACKAGES WITH PEER DEPENDENCIES")
    console.log("-----------------------------------")

    for (const pkg of packagesWithPeerDeps) {
      console.log(`\n📦 ${pkg.name}`)
      console.log(`   Path: ${pkg.path}`)
      console.log(
        `   Peer dependencies (${Object.keys(pkg.peerDependencies).length}):`
      )

      for (const [depName, version] of Object.entries(pkg.peerDependencies)) {
        const isOptional = pkg.peerDependenciesMeta[depName]?.optional || false
        const optionalFlag = isOptional ? " (optional)" : ""
        console.log(`   • ${depName}: ${version}${optionalFlag}`)
      }
    }
  }

  // Packages without peer dependencies
  if (packagesWithoutPeerDeps.length > 0) {
    console.log("\n\n📄 PACKAGES WITHOUT PEER DEPENDENCIES")
    console.log("--------------------------------------")

    for (const pkg of packagesWithoutPeerDeps) {
      console.log(`• ${pkg.name} (${pkg.path})`)
    }
  }

  // Version consistency analysis
  console.log("\n\n🔍 VERSION CONSISTENCY ANALYSIS")
  console.log("--------------------------------")

  const inconsistentDeps = Object.entries(peerDepsAnalysis)
    .filter(([, info]) => info.versions.size > 1)
    .sort(([, a], [, b]) => b.totalCount - a.totalCount)

  if (inconsistentDeps.length > 0) {
    console.log("⚠️  Dependencies with version inconsistencies:")
    for (const [depName, info] of inconsistentDeps) {
      console.log(
        `\n• ${depName} (${info.totalCount} packages, ${info.versions.size} different versions):`
      )
      const versionGroups = {}

      for (const pkg of info.packages) {
        if (!versionGroups[pkg.version]) {
          versionGroups[pkg.version] = []
        }
        versionGroups[pkg.version].push(pkg.name)
      }

      for (const [version, packages] of Object.entries(versionGroups)) {
        console.log(`  ${version}: ${packages.join(", ")}`)
      }
    }
  } else {
    console.log(
      "✅ All peer dependencies have consistent version ranges across packages"
    )
  }

  // Recommendations
  console.log("\n\n💡 RECOMMENDATIONS")
  console.log("------------------")

  if (inconsistentDeps.length > 0) {
    console.log(
      "• Consider standardizing version ranges for dependencies with inconsistencies"
    )
  }

  const highUsageDeps = Object.entries(peerDepsAnalysis)
    .filter(
      ([, info]) =>
        info.totalCount >= Math.ceil(packagesWithPeerDeps.length * 0.5)
    )
    .map(([name]) => name)

  if (highUsageDeps.length > 0) {
    console.log(
      `• Consider creating shared peer dependency configurations for frequently used deps: ${highUsageDeps.join(
        ", "
      )}`
    )
  }

  console.log(
    "• Review optional peer dependencies to ensure they are truly optional"
  )
  console.log(
    "• Consider documenting peer dependency requirements in your monorepo guidelines"
  )

  console.log("\n✅ Analysis complete!")
}

// Run the analysis
if (require.main === module) {
  analyzePeerDependencies()
}

module.exports = {
  analyzePeerDependencies,
  findPackageJsonFiles,
  readPackageJson,
}
