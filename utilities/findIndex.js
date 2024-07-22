function findIndexOfObject(array, target) {
    console.log(target);
    for(let i = 0; i < array.length; i++)
    {
        if(array[i].id == target[0].id) {
            return i;
        }
    }
  }
  
  module.exports = findIndexOfObject;
  