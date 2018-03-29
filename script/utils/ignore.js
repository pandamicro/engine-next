const emptyFile = 'export default ';

module.exports = ( map ) => {
  let list = Object.keys(map);
  return {
    transform ( code, id ) {
      for (let key in map) {
        if (id.indexOf(key) !== -1) {
          // console.log(id);
          return emptyFile + map[key] + ';';
        }
      }
    }
  };
};