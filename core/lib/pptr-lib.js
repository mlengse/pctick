const pptr = require('puppeteer-core')
const waitOpt = {
  waitUntil: 'networkidle2',
  timeout: 0
}

exports.waitOpt = waitOpt      
exports._waitNav = async ({ that }) => await that.page.waitForNavigation(waitOpt)

exports._loginPcare = async ({ that }) => {
  let needLogin = await that.page.$('input.form-control[placeholder="Username"]')

  if(needLogin) {
    that.spinner.start('login pcare')
    await that.page.waitForSelector('input.form-control[placeholder="Username"]')
    await that.page.type('input.form-control[placeholder="Username"]', that.config.PCARE_USR)
    await that.page.waitForSelector('input.form-control[placeholder="Password"]')
    await that.page.type('input.form-control[placeholder="Password"]', that.config.PCARE_PWD, { delay: 100 })
    // await that.page.waitForSelector('#CaptchaInputText')
    // await that.page.focus('#CaptchaInputText')
    // await that.page.click('#CaptchaInputText')
    await that.page.type('#CaptchaInputText', '')
  
    let inpVal = await that.page.evaluate(() => document.getElementById('CaptchaInputText').value)
    while(!inpVal || inpVal.length !== 5 ){
      inpVal = await that.page.evaluate(() => document.getElementById('CaptchaInputText').value)
      that.spinner.start(`input ${inpVal}`)
    }

    that.spinner.start(`input ${inpVal}`)

    await that.page.waitForTimeout(1000)
  
    // await that.page.type('#CaptchaInputText', String.fromCharCode(13))
    
    await that.page.evaluate(() =>{
      document.getElementById('btnLogin').click()
    })
    
      
    await that.page.waitForNavigation(waitOpt)
      
    that.spinner.succeed('logged in')
  
  }

}

exports._runScript = async ({ that }) => {
  await that.loginPcare()
}

exports._initBrowser = async ({ that }) => {
  if(that.init){
    await that.init()
  }
  that.Browser = await pptr.launch({
    headless: false,
    executablePath: `${that.config.CHROME_PATH}`,
    userDataDir: `${that.config.USER_DATA_PATH}`,
  })

  that.pages = await that.Browser.pages()

  that.page = that.pages[0]
  await that.page.goto(`${that.config.PCARE_URL}/Login`, waitOpt)

}