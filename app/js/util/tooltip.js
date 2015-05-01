
function tooltip() {

  var tt = d3.select('#tooltip');

  var self = {
    position: position,
    text : text
  };

  var $win = $(window);

  // center tooltip above svg node
  function position(node, no_transition) {

    var x, y, scrollTop, width,
        tt_bb, node_bb,
        node_width, node_heigth;

    if (node) {

      scrollTop = $win.scrollTop();
      node_bb = node.getBoundingClientRect();
      tt_bb = tt.node().getBoundingClientRect();

      x = (
        node_bb.left
        + node_bb.width/2
        - tt_bb.width/2
      );

      y = (
        node_bb.top
        - tt_bb.height
        + scrollTop
        - 10 // extra 10 pixels to padd for tooltip arrow
      );


    } else {
      // move off screen otherwise
      x = y = -9999;
    }

    // absolutely position tooltip
    var pos = {
      'top' : y + 'px',
      'left' : x + 'px'
    };

    // if hiding / showing transition must
    // come before / after style
    if (no_transition) {
      tt.style(pos).style('opacity', node ? 1 : 0);
    } else {
      if (node) {
        tt.style(pos)
          .style('opacity', 0)
          .transition()
          .duration(100)
          .style('opacity', 1);
      } else {
        tt.transition()
          .duration(100)
          .style('opacity', 0)
          .each('end', function(d, i) {
            if (!i) tt.style(pos);
          });
      }
    }


    return this;
  }

  function text(data) {
    tt.select('span.title').text(data.title);
    tt.select('span.value').text(data.value);
    return this;
  }

  return self;
}

module.exports = tooltip;