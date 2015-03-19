var VideoOverlay =
{
    infoBarTimeout: 8000,
	infoBarOnTime : 0,
	infoBarActive : false,
	
	audioBarTimeout: 6000,
	audioBarOnTime : 0,
	audioBarActive : false,

	alertBarTimeout: 6000,
	alertBarOnTime : 0,
	alertBarActive : false,
	
	infoDetailBarActive: false,
	
	remainingTime  : ""
};

VideoOverlay.init = function()
{
    
    return true;
};

VideoOverlay.setTotalTime = function(total)
{
	// Sets the total time in millsecs
    this.totalTime = total;
    console.log(total);
};

VideoOverlay.setBuffering = function(bufferpct)
{
	var timeElement = document.getElementById("timeInfo");
    timeHTML = "buffering... " + bufferpct + "%";  
    widgetAPI.putInnerHTML(timeElement, timeHTML);
    
};

VideoOverlay.setTime = function(time)
{
    var timeElement = document.getElementById("timeInfo");

    if (time instanceof PlayTime) {
			
		time = time.millisecond;
		var remainingTime = this.totalTime - time;
		if(Main.RECORDINGS_LIST==true)
		{
	    
			var timePercent = (100 * time) / this.totalTime;
		    var timeHTML = "";
		    //var timeHour = 0; var timeMinute = 0; var timeSecond = 0;
		    //var totalTimeHour = 0; var totalTimeMinute = 0; var totalTimesecond = 0;
		    
		    document.getElementById("progressBar").style.width = timePercent + "%";
		    //Logger.logDebug("Setting Percent:" + timePercent);
		
		
		    remTimeHour = Math.floor(remainingTime/3600000);
		    remTimeMinute = Math.floor((remainingTime%3600000)/60000);
		    remTimeSecond = Math.floor((remainingTime%60000)/1000);
		    
		    
		    var timeStr = remTimeHour;
		    timeStr = timeStr + ":";
		    
		    if(remTimeMinute == 0)
	            timeStr += "00:";
	        else if(remTimeMinute <10)
	            timeStr += "0" + remTimeMinute+ ":";
	        else
	            timeStr += remTimeMinute + ":";
		    
		    if(remTimeSecond == 0)
	            timeStr += "00";
	        else if(remTimeSecond <10)
	            timeStr += "0" + remTimeSecond;
	        else
	            timeStr += remTimeSecond;
	        
		    timeStr = "Remaining: " + timeStr;
		    VideoOverlay.remainingTime = timeStr;
		    //Logger.logMessage(timeStr);
		}
		       
	    timeHTML = "";
	    
	} else {
		// Not a date object
		if(Main.playerObj!=null && Main.playerObj.name()=='Default')timeHTML = "buffering... please wait!";
		else timeHTML="";
	}
    
    widgetAPI.putInnerHTML(timeElement, timeHTML);
    
};
 
VideoOverlay.updateRemainingTime = function()
{
	//Main.playerObj.setTotalTime();
	if(Main.RECORDINGS_LIST==false)return;
	if(VideoOverlay.infoBarActive==true)
	{
		remTimeElem = document.getElementById('recbar-remain');
		widgetAPI.putInnerHTML(remTimeElem, VideoOverlay.remainingTime);
	}
};

VideoOverlay.hide = function()
{
    document.getElementById("video_overlay").style.display="none";
};

VideoOverlay.show = function()
{
    document.getElementById("video_overlay").style.display="block";
    document.getElementById("video_overlay").style.opacity = '0.8';

};

VideoOverlay.showPauseText = function()
{
	var elem = document.getElementById("recbar-channel");
	widgetAPI.putInnerHTML(elem,"<img src='Images/navi/pause.png'><span id='recbctext'>Recording Paused</span>");
};

VideoOverlay.showRecordingPlaybackText = function()
{
	var elem = document.getElementById("recbar-channel");
	widgetAPI.putInnerHTML(elem,"Recording Playback");
};

VideoOverlay.showInfoBarNoTimer = function()
{
	VideoOverlay.showInfoBarOnScreen(false);
};

VideoOverlay.showInfoBarNoTimerNoToggle = function()
{
	VideoOverlay.showInfoBarOnScreen(true);
};

VideoOverlay.showInfoBarToggleDetail = function()
{
	VideoOverlay.resetTimer();
	VideoOverlay.showInfoBarOnScreen(false);
};

VideoOverlay.showInfoBar = function()
{
	VideoOverlay.resetTimer();
	VideoOverlay.showInfoBarOnScreen(true);
};

VideoOverlay.showAudioBarOnScreen = function()
{
	VideoOverlay.audioBarActive = true;
	VideoOverlay.audioBarOnTime = Utilities.getTimeInMsSinceEpoch();
	Display.showAudioBar();
};

VideoOverlay.hideAudioBar = function()
{
	VideoOverlay.audioBarActive = false;
	VideoOverlay.audioBarOnTime=0;
	Display.hideAudioBar();
};

VideoOverlay.checkAudioOSD = function(tick)
{
	if(VideoOverlay.audioBarActive==false || VideoOverlay.audioBarOnTime<0)
	{
		return;
	}
	else
	{
		//Logger.logDebug("Info bar is active - check to turn off");
	}
	
	var currTime = tick;
	var diff = currTime - VideoOverlay.audioBarOnTime;
	//Logger.logDebug("Checking for INFO Bar turn off: " + diff);
	if(diff>=VideoOverlay.audioBarTimeout)
	{
		VideoOverlay.hideAudioBar();
	}
};

VideoOverlay.resetTimer = function()
{
	VideoOverlay.infoBarOnTime = Utilities.getTimeInMsSinceEpoch();
};

VideoOverlay.showInfoBarOnScreen = function(toggleDisabled)
{
	//If detailed bar is showing close them all
	if(VideoOverlay.infoBarActive==true && VideoOverlay.infoDetailBarActive==true)
	{
		//SlidingWindow.revertCache();
		//Display.hideInfoBar();
		//VideoOverlay.infoDetailBarActive=false;
		//VideoOverlay.infoBarActive=false;
		VideoOverlay.hideInfoBar();
	}
	//If the info bar is showing, show the detailed bar
	else if(VideoOverlay.infoBarActive==true && VideoOverlay.infoDetailBarActive==false && toggleDisabled==false)
	{
		//Show the detailed info bar and cancel the infobar timer
		VideoOverlay.infoBarOnTime=-1;
		VideoOverlay.infoDetailBarActive=true;
		Display.showDetailedInfoBar();
	}
	//Nothing is showing, show the infobar
	else
	{
		 
		VideoOverlay.infoBarActive = true;
		VideoOverlay.infoDetailBarActive = false;
		//if(withTimer)
		//{
		VideoOverlay.infoBarOnTime = Utilities.getTimeInMsSinceEpoch();
		//}
		//else
		//{
		//	VideoOverlay.infoBarOnTime = -1;
		//}
		
		if(Data.getPlayerName()=="Default")
		{
			VideoOverlay.updateRemainingTime();
			//Display.hideInfoBar();
			Display.showInfoBar();
			Display.showAudioStreamsOnInfoBar(Player.AVPlayer.totalNumOfAudio);
		}
	}
};

VideoOverlay.hideInfoBar = function()
{
	VideoOverlay.infoBarActive = false;
	VideoOverlay.infoDetailBarActive = false;
	VideoOverlay.infoBarOnTime=0;
	Main.resetVideoList();
	Display.hideInfoBar();
};

VideoOverlay.checkOSD = function(tick)
{
	if(VideoOverlay.infoBarActive==false || VideoOverlay.infoBarOnTime<0)
	{
		return;
	}
	else
	{
		//Logger.logDebug("Info bar is active - check to turn off");
	}
	
	var currTime = tick;
	var diff = currTime - VideoOverlay.infoBarOnTime;
	//Logger.logDebug("Checking for INFO Bar turn off: " + diff);
	if(diff>=VideoOverlay.infoBarTimeout)
	{
		VideoOverlay.hideInfoBar();
	}
};

VideoOverlay.showAlertBarOnScreen = function(inMessage)
{
	VideoOverlay.alertBarActive = true;
	VideoOverlay.alertBarOnTime = Utilities.getTimeInMsSinceEpoch();
	Display.showAlertBar(inMessage);
};

VideoOverlay.hideAlertBar = function()
{
	VideoOverlay.alertBarActive = false;
	VideoOverlay.alertBarOnTime=0;
	Display.hideAlertBar();
};

VideoOverlay.checkAlertOSD = function(tick)
{
	if(VideoOverlay.alertBarActive==false || VideoOverlay.alertBarOnTime<0)
	{
		return;
	}
	else
	{
		//Logger.logDebug("Info bar is active - check to turn off");
	}
	
	var currTime = tick;
	var diff = currTime - VideoOverlay.alertBarOnTime;
	//Logger.logDebug("Checking for INFO Bar turn off: " + diff);
	if(diff>=VideoOverlay.alertBarTimeout)
	{
		VideoOverlay.hideAlertBar();
	}
};
