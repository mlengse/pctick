if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const Core = require('./core')
const config = require('./config')

const app = new Core(config)

module.exports = async (isPM2) => {

  try{

    let [listKontak, listSudah ] = await Promise.all([
      app.listKontak(),
      app.listSudah(),
      app.initBrowser()
    ])

    // for ( kontak of listKontak){
    for ( kontak of app.diratain(listKontak)){
    // for ( kontak of app.shuffleArray(listKontak)){
      kontak.id = `${kontak.sheet} ${kontak.row}`
      if(
        !kontak.status
        && kontak.nik
        ){
          // if(!kontak.etiket){
            let ver = app.verifynik(kontak.nik)
            if(!ver.salah){
              let sudah = listSudah.filter( e => e.nik === kontak.nik)
              if(sudah.length){
                kontak.etiket = 'NIK etiket sudah digunakan'
                // await Promise.all([
                //   app.insertTiket({ kontak }),
                //   app.insertStatus({ kontak }),
                // ])
              } else {
                kontak.nik = ver.nik
                kontak.etiket = await app.checkNIK({ kontak })
                if(kontak.etiket.length && !kontak.etiket.toLowerCase().includes('nik')){
                  kontak.no_hp= await app.checkHP()
                }
                await app.wait({time: app.getRandomInt(1000, 3000)})
              }
            } else {
              kontak.etiket = ver.salah
            }

          await Promise.all([
            app.insertTiket({ kontak }),
            app.insertHP({ kontak }),
            app.insertStatus({ kontak }),
          ])
    
        }


    }

    await app.close(isPM2)

    console.log(`scheduled appsheet process done: ${new Date()}`)
  }catch(e){
    console.error(`process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}