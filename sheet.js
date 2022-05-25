if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}
const Core = require('./core')
const config = require('./config')

const app = new Core(config)

module.exports = async (isPM2) => {

  try{

    await Promise.all([
      app.listFiles(),
      app.initBrowser()
    ])

    let diratain = app.diratain(app.listKontak)

    // for ( kontak of listKontak){
    for ( kontak of diratain){
    // for ( kontak of app.shuffleArray(listKontak)){
      kontak.id = `${kontak.kel ? `kel-${kontak.kel}` : kontak.kec ? `kec-${kontak.kec}` : `sheet-${kontak.sheet}`} ${kontak.row}`
      if(
        (!kontak.status
          // || kontak.status.includes("Belum")
          // || kontak.status.includes("entry")
          )
        && kontak.nik
        ){
          // if(!kontak.etiket){
            let ver = app.verifynik(kontak.nik)
            if(!ver.salah){
              let sudah = app.listSudah.filter( e => e.nik === kontak.nik)
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