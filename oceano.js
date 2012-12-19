var MAPS = window.MAPS = window.MAPS || {};

//  'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.500.TIME.e_pac.gif'.
//  'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.850.TIME.e_pac.gif

MAPS = {
  currentHour: 0,
  hourMarkers: ['000','006','012','018','024','030','036','042','048'],
  prodRegex: /\|\|PROD\|\|/,
  timeRegex: /\|\|TIME\|\|/,
  pageTemplate: 'https://www.fnmoc.navy.mil/wxmap_cgi/cgi-bin/wxmap_loop.cgi?area=27km_epac&prod=||PROD||&dtg=2012121900&set=SeaState',
  imageTemplate: 'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.||PROD||.||TIME||.e_pac.gif',
  prods: [ '500','850','u70','u92','slpw','tas','thk','prp','evap','wav','sgwvht','swlwvht','wndwvht','swlwvdir', 'wndwvdir', 'pkwvdir', 'whitecap'],
  getImage: function(prod) {
    hr = this.hourMarkers[(this.currentHour || 0) % this.hourMarkers.length];
    return this.imageTemplate.replace(this.prodRegex,prod).replace(this.timeRegex, hr);
  },
  getUrl: function(prod) {
    return this.pageTemplate.replace(this.prodRegex,prod);
  },
  getImageId: function(prod) {
    return 'image_' + prod;
  },
  addStartStop: function() {
    var $startButton = $('<a>', { href:"#"}).html('start loop');
    var $stopButton = $('<a>', {href:"#"}).html('stop loop');
    $startButton.bind('click', function() { MAPS.startCycle(); });
    $stopButton.bind('click', function() { MAPS.stopCycle(); });
    var $ctrls = $('<div>', {'class':'controls'}).append($startButton).append($stopButton);
    $('body').prepend($ctrls);
  },
  addIframes:function() {
    var that = this;
    var $listOfFrames = $('<ul>', {'class':'frames'});
    $.each(this.prods, function(idx, prod) {
      var url = that.getUrl(prod);
      var $frame = $('<iframe>', {src: url});
      var $caption = $('<div>').append($('<a>', {href:url}).html(url));
      var $container = $('<li>');
      $container.append($frame).append($caption);
      listOfFrames.append($container);
    });
    $('body').append($listOfFrames);

  },
  addImages:function() {
    var that = this;
    var $listOfImages = $('<ul>', {'class':'images'});
    $.each(this.prods, function(idx, prod) {
      var url = that.getImage(prod);
      var $img = $('<img>', {id: that.getImageId(prod), src: url});
      var $container = $('<li>');
      $container.append($img);
      $listOfImages.append($container);
    });
    $('body').append($listOfImages);

  },
  next:function() {
    var that = this;
    // range is 0 - 48 by 6
    this.currentHour++;
    $.each(this.prods, function(idx, prod) {
      var _id = that.getImageId(prod);
      $('#' + _id).attr('src', that.getImage(prod));
    });
  },
  startCycle:function() {
    this.cycling = setInterval(function(){MAPS.next();}, 500);
    return false;
  },
  stopCycle:function() {
    if (this.cycling) {
      clearInterval(this.cycling);
      this.cycling = null;
    } 
    return false;
  }

};

$(function() {
  //addIframes();
  MAPS.addStartStop();
  MAPS.addImages();
});
