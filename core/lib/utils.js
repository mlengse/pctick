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
    return 'Belum lengkap'
  }
}


exports.diratain = arr => {
  arr = arr.filter( e => !e.status && e.nik)
  let pkm = [...new Set(arr.map( e => e.sheet))]
  // console.log(pkm)
  let obj = {}
  for(pk of pkm){
    obj[pk] = arr.filter( e => e.sheet === pk)
  }

  let nArr = []

  while (nArr.length !== arr.length){
    for(pk of pkm){
      if(obj[pk].length){
        let nu = obj[pk].shift()
        nArr.push(nu)
      }
    }
  }

  return nArr


}
