var video_width=1280;
var video_height=720;
var ui_width=960;
var ui_height=540;

var is_buffering = false;

var Player =
{

	AVPlayer : null,
	bufferingComplete: false,
	state : -1,
    skipState : -1,
    stopCallback : null,    /* Callback function to be set by client */
    originalSource : null,
    numAudioStreams: 0,
    onAudioStream: 0,
    
    STOPPED : 0,
    PLAYING : 1,
    PAUSED : 2,  
    FORWARD : 3,
    REWIND : 4,
    
    playerInstance: null,
    remainingTime: 0

};



var bufferingCB = {
	onbufferingstart : function () {
		//console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! buffering started");
		Logger.log(Logger.INFO,"Bufering Started");
		is_buffering = true;
		Player.bufferingComplete=false;
		//Player.onAudioStream = 0;
		Player.setTotalTime();
		Logger.log(Logger.INFO, "Subtitle Count: " + Player.AVPlayer.totalNumOfSubtitle);
		Logger.log(Logger.INFO, "Audio Stream Count: " + Player.AVPlayer.totalNumOfAudio);
		if(Player.AVPlayer.totalNumOfAudio>1)
		{
			//Player.onAudioStream = 1;
			//Player.AVPlayer.setAudioStreamID(1);
			Display.showAudioStreamsOnInfoBar(Player.AVPlayer.totalNumOfAudio);
		}
		Player.onBufferingStart();
		VideoOverlay.showInfoBar();
    },
    onbufferingprogress: function (percent) {
        //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! buffering : " + percent);
        //Logger.log(Logger.DEBUG,"Buffering: " + percent);
    	Player.onBufferingProgress(percent);
    },
    onbufferingcomplete: function () {
        //console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! buffering complete");
        Logger.log(Logger.INFO,"Buffering Complete");
        is_buffering = false;
        Player.onBufferingComplete();
    }
};

var playCB = {
    oncurrentplaytime: function (time) {
        //console.log("playing time : " + time);
        //if(time == "00:00:06")
        //{
        //	if(Main.RECORDINGS_LIST==false)Display.hideInfoBar();
        //	else Display.hideRecBar();
        //}
        	
        Player.setCurTime(time);
        //Player.onAudioStream=0;
        //Display.setClock();
        //Player.setTotalTime();
        VideoOverlay.setTime(time);
        
        //console.log("updated time");

    },
    onresolutionchanged: function (width, height) {
        console.log("resolution changed : " + width + ", " + height);
    },
    onstreamcompleted: function () {
        //console.log("streaming completed");
        Logger.log(Logger.DEBUG, "Streaming completed");
    	Player.stopVideo();
    },
    onerror: function (error) {
        //console.log(error.name);
        //Player.stopVideo();
    	Logger.log(Logger.ERROR, "Player Error Name: " + error.name);
    	Logger.log(Logger.ERROR, "Player Error Mesg: " + error.message);
    	Player.cancelStream(error.name,error.message);
    	
    }
};

Player.cancelStream= function(inName,inMsg)
{
	Logger.log(Logger.WARN, "Cancelling the stream playback");
	Player.stopVideo();
	if(inName==null||inName.length ==0)inName = "Stream Communication Problem"; 
	if(inMsg==null||inMsg.length ==0)inMsg="Failed to start the channel stream <br>Are all your tuners in use?";
	Display.setStreamErrorDetails("<br><br>" + inMsg,inName);
	Main.setScreenMode(Main.STREAMERROR);
};

Player.nextAudioStream = function()
{
	//Logger.log(Logger.DEBUG,Player.onAudioStream + " - " + Player.AVPlayer.totalNumOfAudio );
	if(Player.AVPlayer.totalNumOfAudio<=1)
	{
		Display.setAudioStream( "1" , "1");
		return;
	}
	Player.onAudioStream = Player.onAudioStream + 1;
	if((Player.onAudioStream + 1) > (Player.AVPlayer.totalNumOfAudio + 0))
	{
		//Logger.logDebug("On Audio > number available streams - back around to 0");
		Player.onAudioStream=0;
	}
	Logger.log(Logger.DEBUG,"Switching to Audio Stream [" + (Player.onAudioStream + 1) + "] of [" + Player.AVPlayer.totalNumOfAudio +"]");
	onAudio = Player.onAudioStream + 1;
	//Logger.log(Logger.DEBUG,"On Audio: " + onAudio);
	ofAudio = Player.AVPlayer.totalNumOfAudio;
	//Logger.log(Logger.DEBUG,"Of Audio: " + ofAudio);
	
	Display.setAudioStream( onAudio.toString() , ofAudio.toString());
	Player.AVPlayer.setAudioStreamID(Player.onAudioStream);
	
};

Player.init = function()
{
	//Logger.logDebug("caller is " + arguments.callee.caller.toString());    
	var success = true;
	Logger.logDebug("Player is Configured as: " + Data.getPlayerName());
	this.state = this.STOPPED;
	if(Data.getPlayerName()=="Default")
	{
		Utilities.removeJSFile("Javascript/PlayerLegacy.js");
	    try
	    {
			webapis.avplay.getAVPlay(Player.onAVPlayObtained, Player.onGetAVPlayError);
		}
	    catch(e)
	    {
			Logger.log(Logger.FATAL, "getAVplay Exception :[" +e.code + "] " + e.message);
		}
	    Main.playerObj = Player.instance();
	}
	else
	{
		Utilities.removeJSFile("Javascript/PlayerNew.js");
    	
    	success = PlayerLegacy.init();
    	Main.playerObj = PlayerLegacy.instance();
	}
	
	return success;
};

Player.onAVPlayObtained = function(avplay) {
	
	Player.AVPlayer = avplay;
	Player.AVPlayer.init({
		//containerID : 'player_container',
		zIndex: 10,
		bufferingCallback : bufferingCB, 
		playCallback : playCB,
		displayRect: {
		  /*top: 0,
		  left: 0,
	        width: ui_width,
	        height: ui_height*/
			top: 54,
			left: 470,
			width: 420,
			height: 200
		},
		autoRatio: false, 
	});
	
	
	/**
	 * Resolution Guide
	 * http://www.samsungdforum.com/Guide/?FolderName=c07&FileName=index.html
	 * 
	 * Aspect ratio SD thread
	 * http://www.samsungdforum.com/SamsungDForum/ForumView/f0cd8ea6961d50c3?forumID=88555f42acdd3243&currentPage=1&searchText=avplayer&selectcontents=1&selectPageSize=20&sorting_target=CreateDate&sorting_type=desc
	 */

	Logger.log(Logger.DEBUG,"Player initialised");
};


Player.onGetAVPlayError = function() {
	Logger.log(Logger.WARN,'onGetAVPlayError: ' + error.message);
};

Player.onError = function(){
	Logger.log(Logger.WARN,'Player.onError');
};

Player.onSuccess = function(){
	Logger.log(Logger.DEBUG,'Player.onSuccess');
};

Player.deinit = function()
{
	Logger.log(Logger.INFO,"Deinitializing Player");
};

Player.setWindow = function()
{
	Player.AVPlayer.setDisplayRect({
		top: 54,
		left: 470,
		width: 420,
		height: 200
	});
	//Player.AVPlayer.setZIndex(150);
	
	Player.AVPlayer.setDisplayArea({
		top: 54,
		left: 470,
		width: 420,
		height: 200
	});

	/*left: 477,
    top: 64,
    width: 450,
    height: 253,*/
	
	Player.AVPlayer.show();
};

Player.setFullscreen = function()
{
	//this.plugin.Execute("SetDisplayArea",0, 0, 960, 540);
	Player.AVPlayer.setDisplayRect({
		top: 0,
		left: 0,
        width: video_width,
        height: video_height
	});
	
	Player.AVPlayer.setDisplayArea({
        top: 0,
        left: 0,
        width: video_width,
        height: video_height
	});

};

Player.setVideoURL = function(url)
{
    this.url = url;
};

Player.playVideo = function()
{
	Logger.log(Logger.INFO, "Player.playVideo");
    if (this.url == null)
    {
        Logger.log(Logger.WARN,"No videos to play");
    }
    else
    {
    	Logger.logMessage("Playing Video [" + this.url +"]");
        this.state = this.PLAYING;

        Player.onAudioStream = 0;
        try{
        	Player.AVPlayer.open(this.url);
        	Player.AVPlayer.play(Player.onSuccess, Player.onError);
			// For some reason, I need to call this again, otherwise PIP doesnt show video
        	//this.setWindow();

		}catch(e){
			Logger.log(Logger.ERROR,e.message);
		}
        
        //Audio.plugin.Execute("SetSystemMute",false);
    }
};

Player.pauseVideo = function()
{
	Logger.log(Logger.INFO, "Player pause requesed");
	VideoOverlay.showPauseText();
	VideoOverlay.showInfoBarNoTimerNoToggle();
    this.state = this.PAUSED;
    Player.AVPlayer.pause();
};

Player.stopVideo = function()
{
	Logger.log(Logger.INFO, "Player stop requesed");
    //Logger.logDebug("caller is " + arguments.callee.caller.toString());
	if (this.state != this.STOPPED)
    {
        this.state = this.STOPPED;
        Display.status("Stop");
        Player.AVPlayer.stop();
        Display.setTime(0);
        
        
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

Player.resumeVideo = function()
{
	VideoOverlay.showInfoBar();
    this.state = this.PLAYING;
    Display.status("Playing");
    Player.AVPlayer.resume();
    Logger.logDebug("Resumed");
};


/**
 * http://www.samsungdforum.com/Guide/?FolderName=tec00118&FileName=index.html
 * 
 * Avoiding potential problems with FF and REW operations on video content
Some of the multimedia containers can not handle the JumpForward function correctly, 

if the jump target is bigger than the contents length. For that reason it is recommended to
 check if the operation will not reach beyond the available range in the FF and REW keyhandling functions.
 
For instance, if the total video length is A, current playback time: B and jump parameter: C,
 before calling the jump function, please check if (A-B) <= C. If this condition is met, it is 
 recommended to block the jump operation, to avoid potential player errors.
 
Please also note that the FF and REW functions may not work properly during the video buffering. 
In order to eliminate any potential player errors related to that issue, we strongly recommend to 
block any FF and REW operations in the OnBufferingStart callback and activate them back in OnBufferingComplete.

 */

Player.skipForwardVideo = function(secs) 
{ 
	if (is_buffering) 
	{ 
		Logger.logDebug("Currently buffering! Blocking FF"); 
		VideoOverlay.showAlertBarOnScreen("Cannot Skip whilst buffering");
		return; 
	} 
	VideoOverlay.showInfoBar(); 
    this.skipState = this.FORWARD;   
    Player.AVPlayer.jumpForward(secs); 
     
    // Show the overlay for 5 secs 
    //VideoOverlay.show(); 
}; 

 
Player.skipBackwardVideo = function(secs) 
{ 
	if (is_buffering) 
	{ 
		Logger.logDebug("Currently buffering! Blocking RW"); 
		VideoOverlay.showAlertBarOnScreen("Cannot Skip whilst buffering");
		return; 
	} 
	VideoOverlay.showInfoBar(); 
    this.skipState = this.REWIND; 
    Player.AVPlayer.jumpBackward(secs); 
     
    // Show the overlay for 5 secs 
    //VideoOverlay.show(5); 
}; 



Player.getState = function()
{
    return this.state;
};

// Global functions called directly by the player 

Player.onBufferingStart = function()
{
    Display.status("Buffering...");
    switch(this.skipState)
    {
        case this.FORWARD:
            document.getElementById("forward").style.opacity = '0.2';
            break;
        
        case this.REWIND:
            document.getElementById("rewind").style.opacity = '0.2';
            break;
    }
};

Player.onBufferingProgress = function(percent)
{
    Display.status("Buffering:" + percent + "%");
    VideoOverlay.setBuffering(percent);
};

Player.onBufferingComplete = function()
{
	//VideoOverlay.showInfoBar(true);
	Display.status("Playing");
    Player.bufferingComplete = true;
    //Main.callFunctionWithDelay(5000, Display.hideInfoBar);

	Logger.log(Logger.INFO, "Subtitle Count: " + Player.AVPlayer.totalNumOfSubtitle);
	Logger.log(Logger.INFO, "Audio Stream Count: " + Player.AVPlayer.totalNumOfAudio);
	if(Player.AVPlayer.totalNumOfAudio>1)
	{
		//Player.AVPlayer.setAudioStreamID(1);
		//Player.onAudioStream = 1;
		Display.showAudioStreamsOnInfoBar(Player.AVPlayer.totalNumOfAudio);
	}
	Player.numAudioStreams = Player.AVPlayer.totalNumOfAudio;
};

Player.setCurTime = function(time)
{
	VideoOverlay.setTime(time);
};

Player.setTotalTime = function()
{
	VideoOverlay.setTotalTime(Player.AVPlayer.getDuration());
};

onServerError = function()
{
    Display.status("Server Error!");
};

OnNetworkDisconnected = function()
{
    Display.status("Network Error!");
};

getBandwidth = function(bandwidth) { Logger.logDebug("getBandwidth " + bandwidth); };
onDecoderReady = function() { Logger.logDebug("onDecoderReady"); };
onRenderError = function() { Logger.logDebug("onRenderError"); };

stopPlayer = function()
{
	Logger.logDebug("stopPlayer called");
    Player.stopVideo();
};

setTottalBuffer = function(buffer) { Logger.logDebug("setTottalBuffer " + buffer); };

setCurBuffer = function(buffer) { Logger.logDebug("setCurBuffer " + buffer); };


Player.instance = function()
{
	return this;
};

Player.name = function()
{
	return "Default";
};