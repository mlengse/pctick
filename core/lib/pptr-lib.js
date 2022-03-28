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

  let etiket
  let pesan 
  let t = 0

  while((!etiket || etiket === eti || !pesan) && t < 2000){
    etiket = await that.page.evaluate(() => {
      let etiket = document.getElementById('lblnokartu_noregister').textContent
      return etiket
    })
    pesan = await that.page.evaluate(() => {
      let pesans = [...document.querySelectorAll('body > div[data-notify="container"][role="alert"]')]
      pesans = pesans.map( pesan => pesan.textContent).filter( e => e.length)
      return pesans[pesans.length-1]
    })

    t++

    that.spinner.start(`${kontak.id+2}: ${kontak.nik}${etiket? `, etiket: ${etiket}`: ''}${pesan?`, pesan: ${pesan}`: ''}`)
  }

  if(etiket){
    eti = etiket
    
    let ok = await that.page.$('body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-footer > button')
    t = 0

    while(!ok && t < 2000){
      ok = await that.page.$('body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-footer > button')
      t++
    }

    ok && await ok.click() 
    
    ok && await that.page.evaluate(()=>{
      let ok = document.querySelector('body > div.bootbox.modal.fade.bootbox-alert.in > div > div > div.modal-footer > button')

      ok.click()
    })
  } 

  if(!etiket && pesan){
    if(pesan.includes('sudah dipergunakan')){
      etiket = 'NIK etiket sudah digunakan'
    } else if( pesan.includes('PERHATIAN')) {
      await that.wait({time: 1550})
      return await that.checkNIK({kontak})
    } else if ( !pesan.includes('KPCPEN')){
      etiket = 'NIK '+pesan
    }
  }

  if(!etiket) {
    let tidak = await that.page.$('body > div.bootbox > div.modal-dialog > div.modal-content > div.modal-footer > button.btn.btn-danger.bootbox-cancel')

    if(tidak){
      let psn = await that.page.evaluate(() => {
        return document.querySelector('body > div.bootbox > div.modal-dialog > div.modal-content > div.modal-body').textContent
      })

      if(psn && psn.includes('DATA TIDAK DITEMUKAN') && psn.includes(kontak.nik)){
        etiket = 'NIK tidak ditemukan'
      }
    }

    tidak && await tidak.click() 
    
    tidak && await that.page.evaluate(()=>{
      let ok = document.querySelector('body > div.bootbox > div.modal-dialog > div.modal-content > div.modal-footer > button.btn.btn-danger.bootbox-cancel')
      ok.click()
    })

  }
  
  that.spinner.start(`${kontak.id+2}: ${kontak.nik}${etiket? `, etiket: ${etiket}`: ''}`)
          
  await that.wait({time: 1550})

  return etiket

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