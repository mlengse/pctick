exports.uniqEs6 = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) == pos);
exports.getRandomSubarray = (arr, size) => {
  let shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
};

exports.shuffleArray = array => array.sort(() => 0.5 - Math.random());

exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

exports._wait = async ({ that, time }) => {
  return await new Promise(resolve => {
    setTimeout(() => { resolve(); }, time);
  })
}

exports.verifynik = nik => {
  nik = nik.replace(/\D/g,'')
  let salah
  if(nik.length !== 16){
    salah = 'NIK tidak 16 digit'
  }
  if( nik.slice(-4) === '0000' ){
    salah = 'NIK akhiran 0000'
  }
  return {nik, salah }
}


exports.getStatus = etiket => {
  if(etiket.toLowerCase().includes('tidak ditemukan')){
    if(etiket.toLowerCase().includes('pada tanggal')){
      return 'Tunggu jadwal'
    }
    return 'Belum D1'
  }
  if(etiket.toLowerCase().includes('sudah')){
    if(etiket.toLowerCase().includes('gunakan')){
      return 'Sudah booster'
    }
    if(etiket.toLowerCase().includes('entry')){
      return 'Proses entry'
    }
  }
  if(etiket.toLowerCase().includes('gotong royong')){
    return 'VGR'
  }

  if(etiket.length){
    if(etiket.charAt(2)==='-'){
      return 'Belum booster'

    }
    if(etiket.charAt(1)==='-'){
      return 'Belum D2'
    }

  }
  if(etiket.includes('NIK ×')){
    return 'Lihat ket'
  }
  return ""
}


exports.diratain = arr => {
  arr = arr.filter( e => !e.status && e.nik)
  let kel = [...new Set(arr.map( e => e.kel))].sort((a,b) => arr.filter(e=>e.kel === b).length - arr.filter(e=>e.kel === a).length )
  let pkm = [...new Set(arr.map( e => e.sheet))].sort((a,b) => arr.filter(e=>e.pkm === b).length - arr.filter(e=>e.pkm === a).length )
  let obj = {
    kel: {},
    pkm: {}
  }
  for(ke of kel){
    if(ke && ke.length){
      obj.kel[ke] = arr.filter( e => e.kel === ke)
    }
  }

  for(pk of pkm){
    obj.pkm[pk] = arr.filter( e => e.sheet === pk)
  }

  let nArr = []
  let udah = false

  while (!udah && nArr.length !== arr.length){
    for(ke of kel){
      if(obj.kel[ke] && obj.kel[ke].length){
        let nu = obj.kel[ke].shift()
        nArr.push(nu)
        console.log(`${nArr.length}, ${arr.length}`)
      } 
    }
    for(pk of pkm){
      if(obj.pkm[pk].length){
        let nu = obj.pkm[pk].shift()
        if(nArr.map(e => e.nik).indexOf(nu.nik) === -1){
          nArr.push(nu)
          console.log(`${nArr.length}, ${arr.length}`)
          // that.spinner.start(`${nArr.length}, ${arr.length}`)
        } 
      } 
    }
    udah = !Object.keys(obj.pkm).map(e=>obj.pkm[e].length).filter(e => e).length
    if(udah){
      console.log(Object.keys(obj.kel).reduce((p,c) => `${p}, ${c}: ${obj.kel[c].length}`, 'obj.kel'))
      console.log(Object.keys(obj.pkm).reduce((p,c) => `${p}, ${c}: ${obj.pkm[c].length}`, 'obj.pkm'))
    }

  }

  // that.spinner.succeed()

  return nArr


}
