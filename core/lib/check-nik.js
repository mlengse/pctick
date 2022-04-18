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

    that.spinner.start(`${kontak.id}: ${kontak.nik}${etiket? `, etiket: ${etiket}`: ''}${pesan?`, pesan: ${pesan}`: ''}`)

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
    if(pesan.includes('PERHATIAN') || pesan.toLowerCase().includes('1 menit')){
      await that.wait({time: 10000})
      return await that.checkNIK({kontak})
    }
    if(pesan.includes('sudah dipergunakan')){
      etiket = 'NIK etiket sudah digunakan'
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
  
  that.spinner.start(`${kontak.id}: ${kontak.nik}${etiket? `, etiket: ${etiket}`: ''}`)
          
  // await that.wait({time: 1550})

  return etiket

}