/** 检查当前依赖包的依赖是否已经添加到依赖列表中 */
const { existsSync, readFileSync, writeFileSync } = require("fs")
const { join } = require("path")

const listNotInstalledDependencies = () => {
    const newDependencies = {}
    const pkgdata = JSON.parse(readFileSync('package.json', 'utf-8'))
    const denpends = pkgdata.dependencies
    for (const pkg in denpends) {
        const pkgPath = join('node_modules', pkg, 'package.json')
        if (!existsSync(pkgPath)) {
            console.log(
                `[ERROR] ${pkg} is in dependencies of package.json, but not in node_modules, please install it firstly!`
            )
            return -1
        }

        const denpends2 = JSON.parse(readFileSync(pkgPath, 'utf-8')).dependencies
        for (const k in denpends2) {
            if (denpends[k] === undefined) {
                newDependencies[k] = denpends2[k]
            } else if (denpends[k] !== denpends2[k]) {
                console.log(
                    `[WARNING] Declared version "${denpends[k]}" in package.json, but ${pkg} requires "${denpends2[k]}"`
                )
            }
        }
    }

    if (Object.keys(newDependencies).length > 0) {
        const s = JSON.stringify(newDependencies, null, 2)
        console.log(`[INFO] Expected new dependencies:\n${s}`)
        pkgdata.dependencies = { ...denpends, ...newDependencies }
        console.log(`[INFO] New dependencies have been appended to package.json`)
        writeFileSync('package.json', JSON.stringify(pkgdata, null, 2))
    } else {
        console.log(`[INFO] No new dependencies found!`)
    }
}

listNotInstalledDependencies()

