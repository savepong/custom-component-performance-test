const fs = require('fs')
const signale = require('signale')
const nameSpaces = ['lit-element', 'stenciljs', 'vanilla', 'vanilla-shadow-dom', 'vuejs']
const log_file = fs.createWriteStream(__dirname + '/debug-iteration.log', { flags: 'a+' })
const puppeteer = require('puppeteer')

const express = require("express")
const app = express()
const path = require("path")

const jsAssests = {
    'lit-element': [{ path: './lit-element/github-profile-badge.js', module: true }],
    'stenciljs': [{ path: './stenciljs/github-profile-badge.js', module: false }],
    'vanilla': [{ path: './vanilla/github-profile-badge.js', module: false }],
    'vanilla-shadow-dom': [{ path: './vanilla-shadow-dom/github-profile-badge.js', module: false }],
    'vuejs': [{ path: './vuejs/vue.js', module: false }, { path: './vuejs/github-profile-badge.js', module: false }]
}

const jsPlaceHolder = '<!-- SCRIPT here -->'

const elementPlaceHolder = '<!-- ELEMENT here -->'

const htmlPlaceHolder = '<!-- STYLE here -->'

const cssAssests = {
    'lit-element': ['./lit-element/main.css'],
    'stenciljs': ['./stenciljs/main.css'],
    'vanilla': ['./vanilla/main.css'],
    'vanilla-shadow-dom': ['./vanilla-shadow-dom/main.css'],
    'vuejs': ['./vuejs/main.css']
}

function getTemplateFile() {
    return getFileContent('./index-iteration.src.html')
}

function getFileContent(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function read(err, data) {
            if (err) {
                reject(err)
            }
            resolve(data.toString())
        })
    })
}

function getCssTemplate(nameSpace) {
    return Promise.all(cssAssests[nameSpace].map(async asset => {
        return cssContent = await getFileContent(asset)
    }))
}

function getJsTemplate(nameSpace) {
    return new Promise((resolve, _) => {
        resolve(jsAssests[nameSpace].map(asset => `<script ${asset.module ? 'type="module"' : ''} src="${asset.path}"></script>`))
    })
}

function mergeTemplate(html, css, js, element) {
    return html.replace(jsPlaceHolder, js.join('\n')).replace(htmlPlaceHolder, `<style>${css.join('\n')}</style>`).replace(elementPlaceHolder, element.join('\n'))
}

function getElementTemplate(iteration) {
    
    return new Promise((resolve, _) => {
        let template = []

        for (i = 1; i <= iteration; i++) {
            template.push('<github-profile-badge username="thangman22"></github-profile-badge>')
        }

        resolve(template)
    })
}

function genarateTemplate(nameSpace, iteration) {
    return new Promise(async (resolve, reject) => {
        let htmlTemplate = await getTemplateFile()
        let cssTemplate = await getCssTemplate(nameSpace)
        let jsTemplate = await getJsTemplate(nameSpace)
        let ElementTemplate = await getElementTemplate(iteration)
        let completeTemplate = await mergeTemplate(htmlTemplate, cssTemplate, jsTemplate, ElementTemplate)
        fs.writeFile("index.iteration.html", completeTemplate, function (err) {
            if (err) {
                reject(err)
            }

            resolve(true)
        });
    })
}

(async () => {

    app.get('/', function (_, res) {
        res.sendFile(path.join(__dirname + '/index.iteration.html'))
    })

    app.use(express.static('./'))
    app.listen(3000)
    let result = {}
    for (nameSpace of nameSpaces) {
        result[nameSpace] = []
        for (let i = 1; i <= 1000; i++) {
            signale.debug(`Start testing for ${nameSpace} ${i} Loop...`)
            signale.complete(`Genrated Template ${nameSpace} ${i} Loop`)
            await genarateTemplate(nameSpace, i)
            signale.watch(`Serving file for ${nameSpace} ${i} Loop...`)

            let performanceObject = {
                iteration: i,
                firstPaint: 0.0,
                firstContentfulPaint: 0.0,
                domContentLoad: 0.0,
                domContentComplete: 0.0,
                lib: nameSpace
            }

            let browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            let page = await browser.newPage()
            let firstCreate = true
            
            page.on('console', msg => {
                let consoleText = msg.text()

                if (consoleText.indexOf('first-paint ') !== -1) {
                    performanceObject.firstPaint = parseFloat(consoleText.replace('first-paint ', ''))
                    signale.debug('First paint ' + consoleText.replace('first-paint ', '') + ' ms')
                }

                if (consoleText.indexOf('first-contentful-paint ') !== -1) {
                    performanceObject.firstContentfulPaint = parseFloat(consoleText.replace('first-contentful-paint ', ''))
                    signale.debug('First Contentful paint ' + consoleText.replace('first-contentful-paint ', '') + ' ms')
                }

                if (consoleText.indexOf('dcl ') !== -1) {
                    performanceObject.domContentLoad = parseFloat(consoleText.replace('dcl ', ''))
                    signale.debug('Dom Content load ' + consoleText.replace('dcl ', '') + ' ms')
                }

                if (consoleText.indexOf('dom load completed ') !== -1) {
                    performanceObject.domContentComplete = parseFloat(consoleText.replace('dom load completed ', ''))
                    signale.debug('Dom Content load completed ' + consoleText.replace('dom load completed ', '') + ' ms')
                }
            })

            signale.complete('Open URL http://localhost:3000/')
            await page.goto('http://localhost:3000/')
            await page.waitFor(5000)
            await page.screenshot({ path: 'screen.png', fullPage: true })
            await browser.close()
            result[nameSpace].push(performanceObject)
            signale.complete(`Prformance Information for ${nameSpace} ${JSON.stringify(performanceObject)}`)
            log_file.write(JSON.stringify(performanceObject) + '\n')
            signale.success('Close browser')
        }
    }

})()



