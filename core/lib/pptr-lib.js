const pptr = require('puppeteer-core')
const waitOpt = {
  waitUntil: 'networkidle2',
  timeout: 0
}

exports.waitOpt = waitOpt      
exports._waitNav = async ({ that }) => await that.page.waitForNavigation(waitOpt)

let eti = ''

exports._checkNIK = async ({ that, kontak }) => {

  await that.page.evaluate(() => {
    let radio = document.querySelector('#rbJenisIdentitas_NIK');
    radio.click();
  });

  await that.page.evaluate( nik => document.getElementById("txtnokartu").value = nik, kontak.nik)

  // await that.page.type('#txtnokartu', kontak.nik)

  await that.page.evaluate(() => {
    let cari = document.querySelector('#btnCariPeserta');
    cari.click();
  })

  let etiket = await that.page.evaluate(() => {
    let etiket = document.querySelector('#lblnokartu_noregister')
    return etiket.value
  })

  let t = 0

  while((!etiket || etiket === eti) && t < 2000){
    etiket = await that.page.evaluate(() => {
      let etiket = document.getElementById('lblnokartu_noregister').textContent
      return etiket
    })
    t++
  
  }

  if(etiket){
    eti = etiket

    let ok = await that.page.$('body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-footer > button')
    while(!ok){
      ok = await that.page.$('body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-footer > button')
    }
  
    await ok.click()
  
  }



  // if(modal){
  //   console.log('ada')
  //   await modal.click()
  // }
  etiket && that.spinner.start(`${kontak.nik}, ${etiket}`)

  return etiket

  // console.log(kontak.nik, etiket)

}

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