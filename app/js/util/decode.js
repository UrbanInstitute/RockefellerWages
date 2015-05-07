/*
  Decode base-86 csv in list-of-obj form
*/

function decode(csv) {

  // alphabet
  var a = ('0123456789abcdefghijkl' +
           'mnopqrstuvwxyzABCDEFGH' +
           'IJKLMNOPQRSTUVWXYZ&()*' +
           '+./:;<=%?@[]^_`{|}~>'),
      b = a.length,
      df = {},
      min = Infinity,
      max = -Infinity;

  // decode all strings in each row
  csv.forEach(function(row) {
    var id = parse(row.id);
    df[id] = {'selected' : true};
    for (var e in row) {
      if (e != "id") {
        var v = parse(row[e]);
        df[id][e] = v;
        if (v > max) max = v;
        if (v < min) min = v;
      }
    }
  });

  // store the data extent
  df.extent = [min, max];

  // convert the base of a string
  function parse(str) {
    var l = str.length,
        num = 0,
        idx = 0,
        power;
    for (var i=0; i<l; i++) {
      num += a.indexOf(str[i]) * Math.pow(b, l - (idx + 1));
      idx += 1;
    }
    return Math.round(num);
  }

  return df;

}

module.exports = decode;
