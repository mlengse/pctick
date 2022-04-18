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
    this.spinner.stop()
    if(this.page) {
      await this.page.close()
      this.page = null
    }

    if(this.browser){
      await this.browser.close()
      this.browser = null
    }



    this.spinner.succeed(`closed apps: ${new Date()}`)
  }

  

}