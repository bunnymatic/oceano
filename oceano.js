var MAPS = window.MAPS = window.MAPS || {};

//  'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.500.TIME.e_pac.gif'.
//  'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.850.TIME.e_pac.gif

var cssUrl = function(url) {
  return 'url("' + url +'")';
};

MAPS = {
  currentMode: 'divs', /* modes are 'divs', 'imgs', or 'iframes' */
  currentHour: 0,
  cycleDuration: 500, /* milliseconds between cycle */
  hourMarkers: ['000','006','012','018','024','030','036','042','048'],
  prodRegex: /\|\|PROD\|\|/,
  timeRegex: /\|\|TIME\|\|/,
  pageTemplate: 'https://www.fnmoc.navy.mil/wxmap_cgi/cgi-bin/wxmap_loop.cgi?area=27km_epac&prod=||PROD||&dtg=2012121900&set=SeaState',
  imageTemplate: 'https://www.fnmoc.navy.mil/wxmap_cgi/dynamic/27KM_COAMPS_E_PAC/2012121900//27km_coamps_e_pac10.||PROD||.||TIME||.e_pac.gif',
  prods: [ '500','850','u70','u92','slpw','tas','thk','prp','evap','wav','sgwvht','swlwvht','wndwvht','swlwvdir', 'wndwvdir', 'pkwvdir', 'whitecap'],
  getHour: function() {
    return this.hourMarkers[(this.currentHour || 0) % this.hourMarkers.length];
  },
  getImage: function(prod) {
    hr = this.getHour();
    return this.imageTemplate.replace(this.prodRegex,prod).replace(this.timeRegex, hr);
  },
  getUrl: function(prod) {
    return this.pageTemplate.replace(this.prodRegex,prod);
  },
  getImageId: function(prod) {
    return 'image_' + prod;
  },
  addTimer: function() {
    var $timer = $('<div>', {id:'timer'});
    $('body').prepend($timer);
    this.updateTimer();
  },
  updateTimer: function() {
    $('#timer').html(this.getHour());
  },
  addStartStop: function() {
    var $startButton = $('<div>', {id:'start-btn'});
    $startButton.append($('<a>', { href:"#"}).html('start'));
    var $stopButton = $('<div>', {id:'stop-btn'});
    $stopButton.append($('<a>', {href:"#"}).html('stop'));
    $startButton.bind('click', function() { MAPS.startCycle(); });
    $stopButton.bind('click', function() { MAPS.stopCycle(); });
    var $ctrls = $('<div>', {'class':'controls'}).append($startButton).append($stopButton);
    $('body').prepend($ctrls);
  },
  addIframes:function() {
    this.currentMode = 'iframes';
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
    this.currentMode = 'imgs';
    var that = this;
    var $listOfImages = $('<ul>', {'class':'images'});
    $.each(this.prods, function(idx, prod) {
      var url = that.getImage(prod);
      var $img = that.constructImage(prod,url);
      var $container = $('<li>');
      $container.append($img);
      $listOfImages.append($container);
    });
    $('body').append($listOfImages);

  },
  addDivsWithBGImages:function() {
    this.currentMode = 'divs';
    var that = this;
    var $listOfImages = $('<div>', {'class':'divs'});
    $.each(this.prods, function(idx, prod) {
      var url = that.getImage(prod);
      var $img = that.constructDiv(prod, url);
      $listOfImages.append($img);
    });
    $('body').append($listOfImages);
  },
  constructImage: function(prod, url) {
    return $('<img>', {id: this.getImageId(prod), src: url});
  },
  constructDiv: function(prod, url) {
    return $('<div>', {
      'class': 'img',
      id: this.getImageId(prod)}).css({
      'background-image': cssUrl(url),
      'background-position': '-96px -40px',
      'background-repeat': 'no-repeat',
      height: 545,
      width: 664});  
  },
  cycleDivs: function() {
    var that = this;
    $.each(this.prods, function(idx, prod) {
      var _id = that.getImageId(prod);
      $('#' + _id).css('background-image', cssUrl(that.getImage(prod)));
    });
  },
  cycleImages: function() {
    var that = this;
    $.each(this.prods, function(idx, prod) {
      var _id = that.getImageId(prod);
      $('#' + _id).attr('src', that.getImage(prod));
    });
  },
  incrementTime: function() {
    this.currentHour++;
    this.updateTimer();
  },
  next:function() {
    var that = this;
    // range is 0 - 48 by 6
    this.incrementTime();
    
    switch(this.currentMode) {
    case 'divs':
      this.cycleDivs();
      break;
    case 'imgs':
      this.cycleImages();
      break;
    case 'iframes':
      break;
    default:
      console.log('unknown mode');
    }
  },
  startCycle:function() {
    this.stopCycle();
    this.cycling = setInterval(function(){MAPS.next();}, this.cycleDuration);
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
  MAPS.addTimer();
  MAPS.addDivsWithBGImages();
});
