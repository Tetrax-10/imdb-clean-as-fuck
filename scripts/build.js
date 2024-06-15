import * as css from "@adobe/css-tools"
import * as sass from "sass"
import fs from "fs"

const themeCss = sass.compile("./theme/theme.scss", { style: "compressed" }).css

const parsedThemeCss = css.parse(themeCss)

let imdbCleanAsFuck = ""
let imdbCleanAsFuckWithBetterStyles = ""
let imdbCleanAsFuckWithBetterStylesPersonal = ""

for (const rule of parsedThemeCss.stylesheet.rules) {
    let allSelectors = ""
    let isMobile = false
    let isDesktop = false
    let isPersonal = false
    let isFirstSelector = true
    for (const selector of rule.selectors) {
        if (selector.includes('#ublock[domain="m.imdb.com"]')) {
            allSelectors += `${isFirstSelector ? "" : ","}${selector.replaceAll('#ublock[domain="m.imdb.com"]', "")}`
            isMobile = true
        } else if (selector.includes('#ublock[domain="www.imdb.com"]')) {
            allSelectors += `${isFirstSelector ? "" : ","}${selector.replaceAll('#ublock[domain="www.imdb.com"]', "")}`
            isDesktop = true
        } else if (selector.includes("#ublock[personal]")) {
            allSelectors += `${isFirstSelector ? "" : ","}${selector.replaceAll("#ublock[personal]", "")}`
            isPersonal = true
        } else {
            allSelectors += `${isFirstSelector ? "" : ","}${selector}`
        }

        isFirstSelector = false
    }

    let allDeclarations = ""
    let isHide = false
    let isBetterStyles = false
    for (const declaration of rule.declarations) {
        if (`${declaration.property}:${declaration.value}`.includes("display:none")) {
            isHide = true
            if (declaration.value.includes("!important")) {
                isBetterStyles = true
            }
            break
        } else {
            if (!declaration.value.includes("!important")) {
                isBetterStyles = true
            }
            allDeclarations += `${declaration.property}:${declaration.value}${declaration.value.includes("!important") ? "" : " !important"};`
        }
    }

    const filter = `${isMobile ? "m." : isDesktop ? "www." : ""}imdb.com#${isHide ? "" : "$"}#${allSelectors}${isHide ? "" : `{${allDeclarations}}`}\n`

    if (!isPersonal) {
        if (!isBetterStyles) imdbCleanAsFuck += filter
        imdbCleanAsFuckWithBetterStyles += filter
    }
    imdbCleanAsFuckWithBetterStylesPersonal += filter
}

if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist")
}

fs.writeFileSync("./dist/imdb-clean-as-fuck.txt", imdbCleanAsFuck)
fs.writeFileSync("./dist/imdb-clean-as-fuck-with-better-styles.txt", imdbCleanAsFuckWithBetterStyles)
if (process.argv.includes("--personal")) fs.writeFileSync("./dist/imdb-clean-as-fuck-with-better-styles-personal.txt", imdbCleanAsFuckWithBetterStylesPersonal)
