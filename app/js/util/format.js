/*
  consistent formatting function for dollar values
*/

module.exports = {
  wages : d3.format('$,.0f'),
  employment : function(d) {
    return (d / 10).toString().slice(0,4) + '%';
  }
};
