require('dotenv').config()

let obj = require("fs").readdirSync(require("path").join(__dirname, "lib")).reduce(( obj, file ) => Object.assign({}, obj, require("./lib/" + file)), {})

module.exports = class Core {
  constructor(config) {
    if(!config){
      config = Object.assign({}, process.env)
    }
    this.config = config
    this.kunjBlnIni = []
    for( let func in obj) {
      if(func.includes('_')) {
        this[func.split('_').join('')] = async (...args) => await obj[func](Object.assign({}, ...args, {that: this }))
      } else {
        this[func] = obj[func]
      }
    }
  }

  async close(isPM2){
    this.poolClose && await this.poolClose()
    if(this.browser){
      !isPM2 && await this.browser.close()
      isPM2 && this.browser.isConnected() && await this.browser.disconnect()
    } 
    this.spinner.stop()
    this.spinner.succeed(`closed apps: ${new Date()}`)
  }

  

}