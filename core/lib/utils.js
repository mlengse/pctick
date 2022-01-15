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
  if(nik.length === 16 && nik.slice(-4) !== '0000'){
    return nik
  }
  return false
}
