var PlayerLegacy =
{
    plugin : null,
    state : -1,
    skipState : -1,
    stopCallback : null,    /* Callback function to be set by client */
    originalSource : null,
    
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,  
    FORWARD : 3,
    REWIND : 4,
    
    FULLSCREEN: false
};

PlayerLegacy.init = function()
{
	var success = true;
    this.state = this.STOPPED;
    
    sf.service.VideoPlayer.init({
		onstatechange: function (state) {
	        Logger.logDebug('Current State : ' + state);
	    },
	    onend: function(){
	        Logger.logDebug('Video ended.');
	    },
	    onerror: function (error) {
	        Logger.logDebug('Error : ' + error);
	    }
    	});
	      
    this.setWindow();
   return success;
};

PlayerLegacy.deinit = function()
{

};


PlayerLegacy.setWindow = function()
{
	FULLSCREEN = false; 
	sf.service.VideoPlayer.setPosition( {
	       left: 477,
	       top: 64,
	       width: 450,
	       height: 253,
	});
	
	//sf.service.VideoPlayer.setFullScreen(false);
	
	sf.service.VideoPlayer.setKeyHandler(sf.key.ENTER, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		sf.service.VideoPlayer.setZIndex(150);
		//sf.service.VideoPlayer.stop();
		Main.toggleMode();
		Main.enableKeys();
	});
	sf.service.VideoPlayer.setKeyHandler(sf.key.BACK, function () {
		sf.service.VideoPlayer.setFullScreen(false);
		sf.service.VideoPlayer.setZIndex(150);
		//sf.service.VideoPlayer.stop();
		Main.toggleMode();
		Main.enableKeys();
	});
	
	sf.service.VideoPlayer.setZIndex(111);
	 
};


PlayerLegacy.setFullscreen = function()
{
	FULLSCREEN = true;
	var videoLeft =parseInt($('#videoPlayer').css('left'));
	var videoTop = parseInt($('#videoPlayer').css('top'));
	var videoWidth = sf.env.getScreenSize().width; //just use this API function to get the width of the device in pixels and set that as the video width
	sf.service.VideoPlayer.setFullScreen(true);
	sf.service.VideoPlayer.setPosition({
	left:videoLeft,
	top:videoTop,
	width:videoWidth
	});
	
	sf.service.VideoPlayer.setKeyHelp('TOOLS', null);
	sf.service.VideoPlayer.setKeyHelp('RETURN', null);
	 
	 sf.service.VideoPlayer.setZIndex(350);
	 /*sf.service.VideoPlayer.setKeyHandler(sf.key.ENTER, function () {
		    // If user press RETURN key during the Fullscreen view, convert to partial screen.
		    sf.service.VideoPlayer.setFullScreen(false);
	});*/
};

PlayerLegacy.setVideoURL = function(url)
{
	Logger.logDebug("Playing: " + url);
    this.url = url;
};

PlayerLegacy.playVideo = function()
{
	Logger.logDebug("Playing: " + url);
	if (this.url == null)
    {
        Logger.log(Logger.WARN,"No video to play");
    }
    else
    {
        this.state = this.PLAYING;
        this.setWindow();
        sf.service.VideoPlayer.play({
 	       url: this.url,
 	       title: 'Enigma2 Stream',
 	       fullScreen: true
 	       
        });
    }
};

PlayerLegacy.pauseVideo = function()
{
    this.state = this.PAUSED;
    sf.service.VideoPlayer.pause();
};

PlayerLegacy.stopVideo = function()
{
    if (this.state != this.STOPPED)
    {
        this.state = this.STOPPED;
        sf.service.VideoPlayer.stop();
        
        if (this.stopCallback)
        {
            this.stopCallback();
        }
    }
    else
    {
        //Logger.logDebug("Ignoring stop request, not in correct state");
    }
};

PlayerLegacy.resumeVideo = function()
{
    this.state = this.PLAYING;
    sf.service.VideoPlayer.resume();
};


PlayerLegacy.getState = function()
{
    return this.state;
};


PlayerLegacy.stopPlayer = function()
{
	PlayerLegacy.stopVideo();
};

PlayerLegacy.instance = function()
{
	Logger.log(Logger.INFO, "**** LEGACY PLAYER ****");
	return this;
};


PlayerLegacy.cancelStream= function()  
{
	Logger.log(Logger.WARN,"Cancel Stream not supported in Legacy Player");
};

PlayerLegacy.nextAudioStream = function() 
{
	Logger.log(Logger.WARN,"Audio Stram not supported in Legacy Player");
};

PlayerLegacy.onError = function()
{
	Logger.log(Logger.WARN,"Not supported in Legacy Player");
};
PlayerLegacy.onSuccess = function()
{
	Logger.log(Logger.WARN,"Not supported in Legacy Player");
};
PlayerLegacy.skipForwardVideo = function(secs)   
{
	Logger.log(Logger.WARN,"Skip not supported in Legacy Player");
};
PlayerLegacy.skipBackwardVideo = function(secs)   
{
	Logger.log(Logger.WARN,"Skip not supported in Legacy Player");
};

PlayerLegacy.name = function()
{
	return "Legacy";
};