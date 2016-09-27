/**
 * TODO: Infobar close reverts sliding window cache
 * 
 */
var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();

var Main =
{
	//CLEAR THE SETTINGS?
	CLEAR: false,
	DEBUG: true,
		
	selectedVideo : 0,
    mode : 0,
    mute : 0,

    UP : 0,
    DOWN : 1,
    START : 2,

    WINDOW : 0,
    FULLSCREEN : 1,

    NMUTE : 0,
    YMUTE : 1,

    STREAMMODE: 1,
    STREAM : 0,
    TRANSCODE: 1,
    
    SCREENMODE: 0,
	STARTING: 0,
	SETTING: 1,
	MAIN: 2,
	SETTING_RUNNING: 3,
	WELCOME: 4,
	QUESTION: 5,
	QUESTION2: 6,
	ERROR: 7,
	INFO: 8,
	STREAMERROR: 9,
	ADVANCED_SETTING: 10,
	PARENTAL_CONTROL: 11,
	
	
	RECORDINGS_LIST: false,
	
	FIRST_RUN: true,
	infobarState: 0,
	playingIndex: 0,
	
	deviceId: "",
	
	waitTimer: 0,
	
	playerObj: null,
	
	
	
};


Main.setScreenMode = function(inMode)
{
	Logger.log(Logger.DEBUG, 'Setting screen mode: ' +inMode );
	//Logger.logDebug("caller is " + arguments.callee.caller.toString());  
	
	Main.SCREENMODE = inMode;
	
	//Hide all
	Display.hide("main",300);
	Display.hideQuestion();
	Display.hideWelcome();
	Display.settingsHide();
	Display.loadingHide();
	Display.hideQuestion2();
	Display.hideError();
	Display.hideInfo();
	Display.hideStreamError();
	Display.hide("advancedSettingsPanel",null);
	Display.hide("parentalControlPanel",null);
	
	if(inMode==Main.INFO)
	{
		Display.showInfo();
	}
	if(inMode==Main.ERROR)
	{
		Audio.playSoundWarning();
		Display.showError();
	}
	if(inMode==Main.STREAMERROR)
	{
		Audio.playSoundWarning();
		Display.showStreamError();
	}
	if(inMode==Main.STARTING)
	{
		Display.loadingShow();
	}
	
	if(inMode == Main.SETTING || inMode == Main.SETTING_RUNNING)
	{
		Display.settingsShow();
		if(inMode == Main.SETTING_RUNNING)
		{
			//Show the extra options
			
		}
		
		//If multi-transcoder is on, set the disabled transcode view 
		if(Display.getToggle('a3', 'a4')==1)
		{
			Logger.logDebug("Multi-transcoder enabled");
			Utilities.getElement("disableTranscodeInput").className="transcodeDisabled";
			//Utilities.getElement("disableTranscode2Input").className="transcode2Disabled";
		}
		else
		{
			Logger.logDebug("Multi-transcoder not enabled");
			Utilities.getElement("disableTranscodeInput").className="transcodeNoDisabled";
			//Utilities.getElement("disableTranscode2Input").className="transcode2NoDisabled";		
		}
	}
	
	if(inMode == Main.MAIN)
	{
		Display.show("main",410);
	}

	
	if(inMode == Main.WELCOME)
	{
		Display.showWelcome();
	}
	
	if(inMode == Main.QUESTION)
	{
		Main.enableKeys();
		Data.setOnField("f18");
		Display.showQuestion();
	}
	
	if(inMode == Main.QUESTION2)
	{
		Display.showQuestion2();
	}
	if(inMode == Main.ADVANCED_SETTING)
	{
		//Data.setOnField("f12");
		Display.show("advancedSettingsPanel",null);
		if(Display.getToggle('a3', 'a4')==1)
		{
			Logger.logDebug("Multi-Transcode turned on");
			Utilities.getElement("disabledBack").style.display="none";
		}
		else Utilities.getElement("disabledBack").style.display="";
	}
	
	if(inMode == Main.PARENTAL_CONTROL)
	{
		//Data.setOnField("f12");
		Display.show("parentalControlPanel",null);
	}
};


Main.getScreenMode = function()
{
	return Main.SCREENMODE;
};


Main.initialOnLoad = function()
{
	Logger.init();
	if(Main.CLEAR==true)Settings.clear();
	
	Display.hide("main",300);
	var foundSettings = false;
	
	Main.setScreenMode(Main.STARTING);
	Data.setStreamMode(Data.STREAM);
	Display.setLoadingTxt("Initialising Player");
	
	
	/* ------------------------------------ */
	if (deviceapis)
	{
	    // ermagad
	    deviceId = 
	        //deviceapis.platform + '; ' +
	        deviceapis.tv.info.getDeviceID() + ',' +
	        deviceapis.tv.info.getModel() + ';';
	        //deviceapis.tv.info.getFirmware() + '; ' +
	        //deviceapis.tv.info.getCountry() + '; ' +
	        //deviceapis.tv.info.getLanguage() + '; ' +
	        //deviceapis.tv.info.getVersion() + '; ';
	}
	else
	{
		deviceId = "Unknown";
	}
	Logger.log(Logger.DEBUG, "DeviceID: " + deviceId);
	Display.setField("idno",deviceId);
	Display.setField("deviceId",deviceId);
	
	if( Audio.init() && VideoOverlay.init() && Display.init() && TVMW.init() )
	{
		  VideoOverlay.setTime(0);
	      VideoOverlay.hide();
	}
	else
	{
		Display.setLoadingTxt("Unknown Error Initialising Player");
	}
	
	Display.setLoadingTxt("Retrieving settings");

	foundSettings = Settings.load();
	

	
	if(foundSettings)
	{
		Main.FIRST_RUN = false;
		
		Main.onLoadMain();
		
		//Display.setSettingsScreenValues();
	}
	else
	{
		Logger.log(Logger.WARN, "No settings found");
		Display.setSettingsScreenValues();
		
		//Main.setScreenMode(Main.SETTING);
        //document.getElementById("f1").className="inputTxtfocus";
        Main.setScreenMode(Main.WELCOME);
		this.enableKeys();        
	}
};


Main.onLoadMain = function()
{
	Main.setScreenMode(Main.STARTING);
	Display.setLoadingTxt("Starting");
	
	Logger.logDebug(">>>>>>>>>>>>>>>About to call the init player from onLoadMain");
	Main.callFunctionWithDelay(500,Main.initPlayer);
};

Main.processChannelList = function()
{
	//Display.setLoadingTxt("Processing " + Data.getVideoIDs().length + " Channels");
	Logger.log(Logger.DEBUG, "Start Bouquet is: " + Data.getStartBouquet() + " index [" + Data.getBouquetIndexFromDescription(Data.getStartBouquet()) + "]");
	
	Logger.log(Logger.DEBUG, "Populating Video List for Display"); 
	Data.populateVideoListForDisplay(Data.getBouquetIndexFromDescription(Data.getStartBouquet()));
	Logger.log(Logger.DEBUG, "Setting on Bouquet");
	Data.setOnBouquet(Data.getBouquetIndexFromDescription(Data.getStartBouquet()));
	Logger.log(Logger.DEBUG, "Checking Channel List");
	
	firstname = Data.getVideoNames()[0];
	firstid   = Data.getVideoIDs()[0];
	Logger.log(Logger.DEBUG,"Size:  " + Data.getVideoNames().length);
	Logger.log(Logger.DEBUG,"First Channel: " + firstname);
	Logger.log(Logger.DEBUG,"First ID: " + firstid);
	
	Picon.setTypes(firstid,firstname); 
	if(Picon.type == Picon.NON)Display.setField("piconmode"," None Found");
	if(Picon.type == Picon.SID )Display.setField("piconmode"," Service ID");
	if(Picon.type == Picon.SNAME )Display.setField("piconmode"," Service Name");

	SlidingWindow.init(Data.getVideoNames().length,5,0);
	Display.setVideoList( Data.getVideoNames(), Data.getVideoIDs() );
	
	Main.updateCurrentVideo(2,0);

	//var firstVid = Data.getVideoNames()[0];
    
/*
	var matchexp = /[0-9]{1,}\s\-\s.+/g;
    var res = firstVid.match(matchexp);
    Logger.logDebug("matched res: " + res);
    if(Main.FIRST_RUN == true && res && res !=null && res.length > 0)
    {
    	//Here ask the question about filtering channel numbers;
    	//switch to a second settings tab to ask the question...
    	Display.setField("exampleChannel", " " + firstVid + ", " + Data.getVideoNames()[1] + ", " + Data.getVideoNames()[2]);
    	Main.setScreenMode(Main.QUESTION);
    	document.getElementById("f7").className="inputTxtfocus";
    	Main.FIRST_RUN = false;
    }*/
    if(Main.FIRST_RUN==true)
    {
    	//Settings.save();
       	Main.enableKeys();      
   	 
    	Display.initSpinField("f19",Data.getBouquetDescriptionsPlusLast(),Data.getBouquetDescriptionsPlusLast()[0]);
    	Main.setScreenMode(Main.QUESTION2);
    	Main.FIRST_RUN = false;
    }
    else
    {
    	Display.setLoadingTxt("Complete!");
    	Main.callFunctionWithDelay(1000, Main.initialisationComplete);
    }
    
    widgetAPI.sendReadyEvent();
    //sf.key.unregisterKey(sf.key.VOL_DOWN);
    //sf.key.unregisterKey(sf.key.VOL_UP);
    //sf.key.registerKey(sf.key.RETURN);
    //sf.key.unregisterKey(sf.key.EXIT);
};

Main.initialisationComplete = function()
{
    
	Main.startClock();
	
	//show settings help and options
	document.getElementById("runsettings").style.display="block";
	document.getElementById("advbutton").style.display="inline";
	
	Main.setScreenMode(Main.MAIN);
	Main.enableKeys();
	

    TVMW.unregisterKeys();

    /** 2014-12-15 - Check if the channels are playable **/
	//Server.CheckChannelList(Data.getBouquetId(Data.getOnBouquet()));

};

Main.retrieveChannelList = function()
{
	Server.fetchVideoList(); /* Request video information from server */
	//Display.setLoadingTxt("Processing channel list");
	Display.setLoadingTxt("Processing " + Data.getAllVideoIDs().length + " Channels");
    
	//If there's an error, stop!
    if(Main.SCREENMODE == Main.ERROR)return;
    /*
     * Look for alternatives in the video list and fetch the first one...
     */
    //Data.scanForAlternatives();
    LastChannel.load();
    Main.callFunctionWithDelay(500,Main.processChannelList);
	
};

Main.fechVideoListDone = function()
{
	
};

Main.initPlayer = function()
{
	Display.setLoadingTxt("Initialising Player: " + Data.getPlayerName());
	Player.init();
    //Main.playerObj.init();
    Main.playerObj.stopCallback = function()
    {
        Logger.logDebug("Stop Callback - initPlayer");
  	  	Main.setWindowMode();
        Display.show("main",410);
        VideoOverlay.hide();
    };
    
    Main.callFunctionWithDelay(500, Main.startup);
    
};
Main.startup= function()
{
	Main.disableKeys();
	
	

	if ( Server.init() )
    {
		Display.setLoadingTxt("Retrieving channel list from " + Data.getIPAddress());
        Main.callFunctionWithDelay(500, Main.retrieveChannelList);
    
		// Start retrieving data from server
        /*Server.dataReceivedCallback = function()
        {
        	Display.setLoadingTxt("Processing channel list");
        	
        };*/

        Server.descReceivedCallback = function()
        {
        	Display.setNowNext();
        };

        
        
    } 
	else
	{
		Logger.log(Logger.Fatal, "Not able to initialise server class");
		Display.setErrorDetails("Unable to initialise Server class<br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
		Main.setScreenMode(Main.ERROR);
	}
};

Main.onLoad = function()
{
	Main.initialOnLoad();
};

Main.receiveSingleDigitInput = function(inKeyCode)
{
	Audio.playSoundKeypad();
	var keyPressed = '';
	switch(inKeyCode)
    {
		case tvKey.KEY_0:
			keyPressed = '0';
			break;
		case tvKey.KEY_1:
			keyPressed = '1';
			break;
		case tvKey.KEY_2:
			keyPressed = '2';
			break;
		case tvKey.KEY_3:
			keyPressed = '3';
			break;
		case tvKey.KEY_4:
			keyPressed = '4';
			break;
		case tvKey.KEY_5:
			keyPressed = '5';
			break;
		case tvKey.KEY_6:
			keyPressed = '6';
			break;
		case tvKey.KEY_7:
			keyPressed = '7';
			break;
		case tvKey.KEY_8:
			keyPressed = '8';
			break;
		case tvKey.KEY_9:
			keyPressed = '9';
			break;			
    }
	return keyPressed;
};


Main.deleteChar = function()
{
	var onField = Data.getOnField();
	if(onField == "f1" || onField=="f2" || onField =="f3" || onField=="f4" || onField=="f5" || onField=="f6" ||onField=="a5" || onField=="a6" || onField=="a7" ||onField=="a8" || onField=="a9")
	{
		var elem = document.getElementById(onField);
		var onFieldVal = elem.innerHTML;
		Logger.logDebug("on Field Val [" +onFieldVal + "]");
		//var maxSize = 1;
		var size = onFieldVal.length;
		if(size>0)
		{
			onFieldVal = onFieldVal.substr(0,size-1);
			Logger.logDebug("on Field Val [" +onFieldVal + "]");
			//elem.InnerHTML=onFieldVal;
			widgetAPI.putInnerHTML(elem, onFieldVal);
		}
			
	}
};

Main.receiveInput = function(inKeyCode)
{
	Audio.playSoundKeypad();
	var keyPressed = '';
	switch(inKeyCode)
    {
		case tvKey.KEY_0:
			keyPressed = '0';
			break;
		case tvKey.KEY_1:
			keyPressed = '1';
			break;
		case tvKey.KEY_2:
			keyPressed = '2';
			break;
		case tvKey.KEY_3:
			keyPressed = '3';
			break;
		case tvKey.KEY_4:
			keyPressed = '4';
			break;
		case tvKey.KEY_5:
			keyPressed = '5';
			break;
		case tvKey.KEY_6:
			keyPressed = '6';
			break;
		case tvKey.KEY_7:
			keyPressed = '7';
			break;
		case tvKey.KEY_8:
			keyPressed = '8';
			break;
		case tvKey.KEY_9:
			keyPressed = '9';
			break;			
    }
	
	
	var onField = Data.getOnField();
	var elem = document.getElementById(onField);
	var onFieldVal = elem.innerHTML;
	var maxSize = 1;
	var size = onFieldVal.length;
	if(onField == "f1" || onField=="f2" || onField =="f3" || onField=="f4")
	{
		maxSize = 3;
	}
	else if(onField=="a5")maxSize=7;
	else if(onField=="a6" || onField=="a7")maxSize=4;
	else if(onField=="a8" || onField=="a9")maxSize=1;
	
	else 
	{
		maxSize = 5;
	}
	
	//Logger.log(Logger.DEBUG,"Onfield [" + onField + "] value [" + onFieldVal + "] size [" + size + " of " + maxSize +"]");
	
	if (size<maxSize) onFieldVal = onFieldVal + keyPressed;
	if (size==maxSize) onFieldVal = keyPressed;
	
	//elem.value = onFieldVal;
	Display.setField(onField, onFieldVal);
	
	
};

Main.onUnload = function()
{
	Main.playerObj.deinit();
};

Main.updateCurrentVideo = function(move,count)
{
	if(move == 2)
	{
		SlidingWindow.reset();
		Display.resetSelectors();
	}
	else
	{
		Display.setVideoListPosition(count);
		Logger.logDebug("Set video list position: " + SlidingWindow.pointer );
		
	}
	//Logger.logDebug("Updating current video:" + move);
    var vidUrl = Data.getVideoURL(SlidingWindow.pointer);
    
    //And add in the multi-transcode fix here if mt is enabled
    //?bitrate=3000000?width=720?height=480?aspectratio=2?interlaced=0
    
    
    
    var extraParams="";
    if(Data.getMtEnabled()=='Y')
    {
    	Logger.logDebug("MT is Enabled");
    	vidUrl = vidUrl.replace("*PORT*",Data.getStreamPort());
    	extraParams += "?bitrate=";
    	extraParams += Data.getMtBitrate();
    	extraParams += "?width=";
    	extraParams += Data.getMtWidth();
    	extraParams += "?height=";
    	extraParams += Data.getMtHeight();
    	extraParams += "?aspectratio=";
    	extraParams += Data.getMtAspectRatio();
    	extraParams += "?interlaced=";
    	extraParams += Data.getMtInterlaced();
    }
    else 
    {
    	extraParams="";
        if(vidUrl==null)vidUrl="";
    	if(Data.getStreamMode() == this.TRANSCODE)
        {
        	vidUrl = vidUrl.replace("*PORT*",Data.getTranscodePort());
        }
        else
        {
			if(Main.RECORDINGS_LIST == true)
				vidUrl = vidUrl.replace("*PORT*",Data.getDefaultPort());
			else
				vidUrl = vidUrl.replace("*PORT*",Data.getStreamPort());
        }

    }
    	
    
    Main.playerObj.setVideoURL( vidUrl + extraParams );
	
    
    Logger.logDebug("VidURL: " + vidUrl);
    
    
    //Display.setDescription( Data.getVideoDescription(this.selectedVideo));
    Display.setNoEPG();
    //Logger.logDebug('selectedVideo' + this.selectedVideo);
    if (!SlidingWindow.pointer) SlidingWindow.pointer = 0;
    
    if(Main.RECORDINGS_LIST == false)
    {
    	Server.fetchDescription(SlidingWindow.pointer);
    	Display.updateChannelInfomation();
    }
    else
    {
    	Display.setNow(Data.getVideoName(SlidingWindow.pointer), "", Data.getVideoDescription(SlidingWindow.pointer));
	}
    Display.setPiconList(Data.getVideoID(SlidingWindow.pointer),Data.getVideoName(SlidingWindow.pointer));
};


Main.updateDescription = function()
{
	Display.setDescription();
};



Main.enableKeys = function()
{
    document.getElementById("anchor").focus();
};

Main.disableKeys = function()
{
	document.getElementById("stopkeys").focus();
};


Main.initPlayerToChannelList = function()
{
	Display.setLoadingTxt("Initialising Player: " + Data.getPlayerName());
	Player.init();
    //Main.playerObj.init();
    Main.playerObj.stopCallback = function()
    {
        Logger.logDebug("Stop Callback - initPlayerTochL");
  	  	Main.setWindowMode();
        Display.show("main",410);
        VideoOverlay.hide();
    };
    Display.setLoadingTxt("Retrieving Channel List from " + Data.getIPAddress());
	Main.callFunctionWithDelay(500, Main.getChannelListAfterRecordings);
};

Main.initPlayerToRecordingsList = function()
{
	Display.setLoadingTxt("Initialising Player: " + Data.getPlayerName());
	Player.init();
	//if(Main.playerObj.name()!="Default")Main.playerObj.init();
	
    Main.playerObj.stopCallback = function()
    {
    	Logger.logDebug("Stop CallbackToRecord");
  	  	Main.setWindowMode();
        Display.show("main",410);
        VideoOverlay.hide();
    };
    Display.setLoadingTxt("Retrieving Channel List from " + Data.getIPAddress());
	Main.callFunctionWithDelay(500, Main.getRecordings);
};

Main.SaveSettings = function()
{
	Settings.save();
	if(Main.RECORDINGS_LIST==false)
	{
		Display.setLoadingTxt("Initialising Player: " + Data.getPlayerName());
       	Main.setScreenMode(Main.STARTING);
       	Main.callFunctionWithDelay(500, Main.initPlayerToChannelList);
	}
	else
	{
		Display.setLoadingTxt("Initialising Player: " + Data.getPlayerName());
       	Main.setScreenMode(Main.STARTING);
       	Main.callFunctionWithDelay(500, Main.initPlayerToRecordingsList());
	}
};

Main.showSettingsRunning = function()
{
	Audio.playSoundEnter();
	if(Main.RECORDINGS_LIST!=true)
	{
		Display.initSpinField('f13',Data.getBouquetDescriptionsPlusLast(),Data.getStartBouquetForSettings());
		Main.setScreenMode(Main.SETTING_RUNNING);
	}
};

Main.mtIsValid = function()
{
	if(Display.getToggle("a3", "a4")==2)return true;
	//Check data values
	var errors="";
	br = Display.getField('a5');
	ar = Display.getField('a8');
	il = Display.getField('a9');
	
	if(br==null || br.length<=2)
	{
		errors+="<li>Bitrate Invalid. Min 100Kbits, Max 10Mbits, Step 100Kbits<br>";
	}

	if(ar==null || ar.length<=0)
	{
		errors+="<li>Aspect ratio must be specified<br>";
	}
	else
	{
		if(ar=='0' || ar=='1' || ar=='2')
		{
		}
		else
		{
			errors+="<li>Aspect ratio needs to be between 0 and 2<br>";
		}
	}
	
	if(il!=null && il.length>0)
	{
		if(il=='0' || il=='1')
		{
		}
		else
		{
			errors += "<li>Interlaced must be set to 0 or 1<br>";
		}
	}
	else
	{
		errors += "<li>Interlaced must be specified<br>";
	}
	
	if(errors.length > 0)
	{
		Alert.setDialog("Invalid Settings", errors, "OK", null, null, null, ParentalSettings.dismissDialog, null, null, null);
		Alert.showDialog();
		return false;
	}
	return true;
};

Main.keyDown = function()
{
    var keyCode = event.keyCode;
    if(!Alert.isActive())Logger.logDebug("Key pressed: " + keyCode + "- Screen Mode: " + Main.SCREENMODE);

    if(Alert.isActive())
    {
    	Alert.receiveInput(keyCode);
    	return;
    }

    if(Main.SCREENMODE == Main.PARENTAL_CONTROL)
    {
    	switch(keyCode)
    	{
			case tvKey.KEY_RED:
				Audio.playSoundBack();
				Settings.load();
		    	Main.setScreenMode(3);
		    	return;
				break;
				
			case tvKey.KEY_GREEN:
				Audio.playSoundEnter();
				
				/** Check whether any of the toggles are yes, if so a pin must be entered **/
				ParentalSettings.setData();
				if(ParentalSettings.isValid())
				{
					Logger.logDebug("PC/Valid setings................ Now save");
		  			Settings.save();
	    			Main.setScreenMode(3);
				}
				else
				{
					Alert.setDialog("Invalid Settings", "The parental settings PIN needs to be set before any options can be enabled", "OK", null, null, null, ParentalSettings.dismissDialog, null, null, null);
					Alert.showDialog();
				}
				return;
    			break;
    		
			 case tvKey.KEY_UP:
				 Audio.playSoundKeypad();
				 Display.changeParentalSettingField(Display.UP);
				 break;
				 
			 case tvKey.KEY_DOWN:
				 Audio.playSoundKeypad();
				 Display.changeParentalSettingField(Display.DOWN);
				 break;
				 
			 case tvKey.KEY_LEFT:
				 Audio.playSoundKeypad();
				 Display.changeParentalSettingField(Display.LEFT);
				 break;
				 
			 case tvKey.KEY_RIGHT:
				 Audio.playSoundKeypad();
				 Display.changeParentalSettingField(Display.RIGHT);
				 break;
				 
			 case tvKey.KEY_ENTER:
			 case tvKey.KEY_PLAY:	 
				 Audio.playSoundEnter();
				 Display.changeParentalSettingField(Display.ENTER);
				 break;
				 
			 case tvKey.KEY_1:
			 case tvKey.KEY_2:
			 case tvKey.KEY_3:
			 case tvKey.KEY_4:
			 case tvKey.KEY_5:
			 case tvKey.KEY_6:
			 case tvKey.KEY_7:
			 case tvKey.KEY_8:
			 case tvKey.KEY_9:
			 case tvKey.KEY_0:
			 case 69:
				 Logger.logDebug("ON PARENTAL FIELD: " + Data.getOnFieldNo());
				 if(Data.getOnFieldNo()>=1 && Data.getOnFieldNo()<=4)
				 {
					if(keyCode==69)
					{
						//Logger.logDebug(">> Deleting char in Field: " + Data.getOnFieldNo());
						//Main.deleteChar();
					}
					else
					{
						inVal = Main.receiveSingleDigitInput(keyCode);
						Logger.logDebug(">> Input a " + inVal);
				 		Logger.logDebug(">> Setting Field: " + Data.getOnFieldNo());
				 		Display.setField("p" + Data.getOnFieldNo().toString(), inVal);
					}
				 }
				 break;	 
    	}
				
    }
    if(Main.SCREENMODE == Main.ADVANCED_SETTING)
    {
    	switch(keyCode)
    	{
    		case tvKey.KEY_RED:
    			Audio.playSoundBack();
    			Settings.load();
    			Main.setScreenMode(3);
    			return;
    			break;
    			
    		case tvKey.KEY_GREEN:
    			Audio.playSoundEnter();
    			//Main.SaveSettings();
    			
    			//Validate the mt settings
    			if(Main.mtIsValid()==true)
    			{
    				Settings.save();
    				Main.setScreenMode(3);
    			}
    			return;
    			break;
    			
		    case tvKey.KEY_LEFT:
		    	Display.changeAdvancedSettingField(Display.LEFT);
		    	break;
		    	
		    case tvKey.KEY_RIGHT:
		    	Display.changeAdvancedSettingField(Display.RIGHT);
		    	break;
		    	
		    case tvKey.KEY_UP:
		    	Display.changeAdvancedSettingField(Display.UP);
		    	break;
		    	
		    case tvKey.KEY_DOWN:
		    	Display.changeAdvancedSettingField(Display.DOWN);
		    	break;

		    case tvKey.KEY_ENTER:
		    case tvKey.KEY_PLAY:
		    	Display.changeAdvancedSettingField(Display.ENTER);
		    	break;
		    	
		     case tvKey.KEY_1:
			 case tvKey.KEY_2:
			 case tvKey.KEY_3:
			 case tvKey.KEY_4:
			 case tvKey.KEY_5:
			 case tvKey.KEY_6:
			 case tvKey.KEY_7:
			 case tvKey.KEY_8:
			 case tvKey.KEY_9:
			 case tvKey.KEY_0:
			 case 69:
				 Logger.logDebug("Numeric Key Pressed on field: " + Data.getOnFieldNo());
				 if(Data.getOnFieldNo()>=5 && Data.getOnFieldNo()<=9)
				 {
					if(keyCode==69)
					{
							Logger.logDebug(">> Deleting char in Field: " + Data.getOnFieldNo());
							Main.deleteChar();
					}
					else
					{
							Main.receiveInput(keyCode);
					}
				 }
				 break;
			
    	}
    	
    }
    else if(Main.SCREENMODE == Main.QUESTION2)
    {
    	switch(keyCode)
	    {
	    	case tvKey.KEY_GREEN:
	    		//Logger.logDebugt('Save');
	    		//Logger.logDebug("Spinner set: " + Display.getSpinFieldValue());
	    		Audio.playSoundEnter();
	    		Data.setStartBouquet(Display.getSpinFieldValue());
	    		Settings.save();
	    		Main.callFunctionWithDelay(500,Main.processChannelList);
	    		
	        	Main.enableKeys();      
	        	widgetAPI.sendReadyEvent();
	    		break;	
	    		
		    case tvKey.KEY_LEFT:
		    	//Logger.logDebug("left");
		    	Audio.playSoundLeft();
		    	Display.spinField("f19",Data.getBouquetDescriptionsPlusLast(), Display.LEFT);
		    	break;
		    	
		    case tvKey.KEY_RIGHT:
		    	//Logger.logDebug("right");
		    	Audio.playSoundRight();
		    	Display.spinField("f19",Data.getBouquetDescriptionsPlusLast(), Display.RIGHT);
		    	break;
	    }
    }

    else if(Main.SCREENMODE == Main.STREAMERROR)
    {
    	Main.playerObj.bufferingComplete=false;
    	switch(keyCode)
	    {
		    case tvKey.KEY_RED:
		    	Main.CLEAR = true;
		    	//Main.onLoadMain();
		    	Main.setScreenMode(Main.MAIN);
		    	break;
		    case tvKey.KEY_GREEN:
		    	Display.hideStreamError();
		    	Main.setScreenMode(Main.MAIN);
		    	Main.streamVideo();
		    	break;
	    }
    }
    else if(Main.SCREENMODE == Main.ERROR)
    {
    	switch(keyCode)
	    {
		    case tvKey.KEY_RED:
		    	Main.CLEAR = true;
		    	//Main.onLoadMain();
		    	Main.initialOnLoad();
		    	break;
		    case tvKey.KEY_GREEN:
		    	Main.onLoadMain();
		    	break;
	    }
    }
    
    else if(Main.SCREENMODE == Main.QUESTION)
    {
    	switch(keyCode)
	    {
		    case tvKey.KEY_GREEN:
		    	Audio.playSoundEnter();
		    	var yesNo = Display.getToggle("f17","f18");
		    	Data.setRemoveNumbers("N");
		    	if(yesNo == 1)
		    	{
		    		Data.setRemoveNumbers("Y");
		    	}
		    	else
		    	{
		    		Logger.logDebug("Didn't match toggle field!!!!!!");
		    	}
		    	Settings.save();
		    	Display.initSpinField("f19",Data.getBouquetDescriptionsPlusLast(),Data.getBouquetDescriptionsPlusLast()[0]);
		    	Main.setScreenMode(Main.QUESTION2);
		    	break;
		    	
		    case tvKey.KEY_LEFT:
		    	//Data.setOnField("f18");
		    	//Data.setOn
		    	Audio.playSoundLeft();
		    	Display.setClassName("f17", "inputTxtfocus");
		    	Display.setClassName("f18", "inputTxt");
		    	Display.setToggle("f17","f18");
		    	//Display.changeField(Display.LEFT);
		    	break;

		    case tvKey.KEY_RIGHT:
		    	Audio.playSoundRight();
		    	Display.setClassName("f18", "inputTxtfocus");
		    	Display.setClassName("f17", "inputTxt");
		    	Display.setToggle("f17","f18");
		    	//Display.changeField(Display.RIGHT);
		    	break;
		    	
		    case tvKey.KEY_ENTER:
		    case tvKey.KEY_PLAY:
		    	Display.changeField(Display.ENTER);
			    break;
	    }
    }
    else if(Main.SCREENMODE == Main.SETTING  || Main.SCREENMODE == Main.SETTING_RUNNING)
    {
    	switch(keyCode)
	    {
		    case tvKey.KEY_RED:
		    	Audio.playSoundBack();
		    	Settings.load();
		    	//Main.selectFirstVideo(this.START);
		    	Main.setScreenMode(Main.MAIN);
		    	break;
		    
		    case tvKey.KEY_YELLOW:
		    	if(Main.SCREENMODE == Main.SETTING_RUNNING)
			    {	
		    		Audio.playSoundEnter();
		    		Main.setScreenMode(Main.PARENTAL_CONTROL);
			    }
		    	break;
		    
		    case tvKey.KEY_BLUE:
		    	if(Main.SCREENMODE == Main.SETTING_RUNNING)
			    {	
		    		Audio.playSoundEnter();
		    		Main.setScreenMode(Main.ADVANCED_SETTING);
			    }
		    	break;
		    case tvKey.KEY_GREEN:
		    	Audio.playSoundEnter();
		    	Data.setRemoveNumbers('N');
		    	if(Main.SCREENMODE == Main.SETTING_RUNNING)
		    	{
		    		if(Display.getToggle("f11", "f12")==1) Data.setRemoveNumbers('Y');	
		    		else Data.setRemoveNumbers('N');					
		    	}
		    	document.getElementById("debug").style.left="440px";
		    	
		    	Main.SaveSettings(); 
		    	break;
		    
		    case tvKey.KEY_UP:
		    	Display.changeField(Display.UP);
		    	break;
		    case tvKey.KEY_DOWN:
		    	Display.changeField(Display.DOWN);
		    	break;
		    case tvKey.KEY_LEFT:
		    	Display.changeField(Display.LEFT);
		    	break;

		    case tvKey.KEY_RIGHT:
		    	Display.changeField(Display.RIGHT);
		    	break;
		    	
		    case tvKey.KEY_ENTER:
		    case tvKey.KEY_PLAY:
		    	Display.changeField(Display.ENTER);
			    break;
			    
		    case tvKey.KEY_0:
		    case tvKey.KEY_1:
		    case tvKey.KEY_2:
		    case tvKey.KEY_3:
		    case tvKey.KEY_4:
		    case tvKey.KEY_5:
		    case tvKey.KEY_6:
		    case tvKey.KEY_7:
		    case tvKey.KEY_8:
		    case tvKey.KEY_9:
		    case 69:
		    	if(keyCode==69)
				{
					Logger.logDebug(">> Deleting char in Field: " + Data.getOnFieldNo());
					Main.deleteChar();
				}
				else
				{
					Main.receiveInput(keyCode);
				}
		    	break;
	    }
    }
    else if(Main.SCREENMODE == Main.INFO)
    {
    	switch(keyCode)
	    {
	    	case tvKey.KEY_RED:
	    		Main.setScreenMode(Main.MAIN);
	    		break;
	    }
    }
    else if(Main.SCREENMODE == Main.MAIN)
    {
	    switch(keyCode)
	    {
	    	case tvKey.KEY_BLUE:
	            if(this.mode != this.FULLSCREEN)
	            {
	            	Audio.playSoundEnter();
	            	Main.setScreenMode(Main.INFO);
	            }
	            break;
		    
	    	//AD-SUB Button to switch audio
	    	case 652:
	    		if(this.mode == this.FULLSCREEN)
	    		{
	    			Audio.playSoundEnter();
	    			Main.playerObj.nextAudioStream();
	    			VideoOverlay.showAudioBarOnScreen();
	    			//Display.showAudioBar();
	    			//VideoOverlay.showInfoBar();
	    		}
	    		break;
	    	case tvKey.KEY_RED:
	    		
	    		if(this.mode == this.FULLSCREEN)
	    		{ 
	    			Audio.playSoundEnter();
	    			Main.playerObj.nextAudioStream();
	    			VideoOverlay.showAudioBarOnScreen();
	    			//Display.showAudioBar();
	    			//VideoOverlay.showInfoBar();
	    		}
	    		else
	    		{

	    			if(ParentalSettings.isSettingsLockEnabled()==true)
	    			{
	    				ParentalSettings.showPinEntryDialog();
	    			}
	    			else
	    			{
	    				Main.showSettingsRunning();
	    			}
			    	
	    		}
		    	break;
	
	        case tvKey.KEY_PLAY:
	            Main.streamVideo();
	            break;
	
	        case tvKey.KEY_STOP:
	        	Audio.playSoundBack();
	        	Display.emptyPiconLarge();
	            Main.playerObj.stopVideo();
	            break;
	
	        case tvKey.KEY_PAUSE:
	            this.handlePauseKey();
	            break;
	
	        case tvKey.KEY_1:
	        	if(this.mode != this.FULLSCREEN)return;
	            Logger.logDebug("Rew30s");
	        	if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	        		Main.playerObj.skipBackwardVideo(30);
	        	break;

	        case tvKey.KEY_2:
	        	sref ="";
	        	var id   = Data.getVideoID(SlidingWindow.pointer);
	        	Audio.playSoundEnter();
	        	Server.zapToChannel(id);
	        	break;
	        case tvKey.KEY_3:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Logger.logDebug("FFwd30s");
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipForwardVideo(30);
	        	break;
	        case tvKey.KEY_4:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Logger.logDebug("Rew60s");
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipBackwardVideo(60);
	        	break;
	        case tvKey.KEY_6:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Logger.logDebug("FFWs60s");
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipForwardVideo(60);
	        	break;
	        case tvKey.KEY_7:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Logger.logDebug("Rew120s");
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipBackwardVideo(120);
	        	break;
	        case tvKey.KEY_9:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Logger.logDebug("FFwd120s");
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipForwardVideo(120);
	        	break;
		      
	        case tvKey.KEY_FF:
	        	if(this.mode != this.FULLSCREEN)return;
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST == true)
	            	Main.playerObj.skipForwardVideo(30);
	            break;
	
	        case tvKey.KEY_RW:
	        	if(this.mode != this.FULLSCREEN)return;
	            if(Main.playerObj.getState() != Main.playerObj.PAUSED && Main.RECORDINGS_LIST==true)
	            	Main.playerObj.skipBackwardVideo(30);
	            break;
	            
	        case tvKey.KEY_VOL_UP:
	        case tvKey.KEY_PANEL_VOL_UP:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Audio.increaseVolume();
	        	break;
	        	
	        case tvKey.KEY_VOL_DOWN:
	        case tvKey.KEY_PANEL_VOL_DOWN:
	        	if(this.mode != this.FULLSCREEN)return;
	        	Audio.decreaseVolume();
	        	break; 
	        
	        case tvKey.KEY_DOWN:
	        	Audio.playSoundKeypad();
	        	if(this.mode == this.FULLSCREEN)
	        	{
	        		//Invert up/down in full screen mode
	        		if(VideoOverlay.infoBarActive==false)VideoOverlay.showInfoBarToggleDetail(false);
	        		else
	        		{
	        			VideoOverlay.infoBarOnTime = Utilities.getTimeInMsSinceEpoch();
	        			//Inverted controls full-screen
	        			this.selectPreviousVideo(this.UP);
		        		
	        		}
	        	}
	        	else
	        	{	
	        		this.selectNextVideo(this.DOWN);
	        	}
	            break;
	
	        case tvKey.KEY_UP:
        		Audio.playSoundKeypad();
	        	if(this.mode == this.FULLSCREEN)
	        	{
	        		if(VideoOverlay.infoBarActive==false)VideoOverlay.showInfoBarToggleDetail(false);
	        		else
	        		{
	        			VideoOverlay.infoBarOnTime = Utilities.getTimeInMsSinceEpoch();
	        			//Inverted controls full-screen
	        			this.selectNextVideo(this.DOWN);
	        		}
	        	}
	        	else
	        	{
	        		this.selectPreviousVideo(this.UP);
	        	}
	            break;
	
	        case tvKey.KEY_LEFT:
	        	Logger.logDebug("Left");
	        	if(this.mode == this.FULLSCREEN)break;
    			if(ParentalSettings.isBouquetLockEnabled()==true)
    			{
    				Audio.playSoundWarning();
    				Logger.log(Logger.INFO, "ALERT: Bouquet Change Attemped when locked");
    				break;
    			}
    			
	        	Audio.playSoundPageLeft();
	        	onbid = Data.getOnBouquet();
	        	nbids = Data.getNumberOfBouquets();
	        	onbid--;
	        	if(onbid <0 )onbid=nbids-1; 
	        	Logger.logDebug("On Bouquet [" + onbid +"]");
	        	Data.setOnBouquet(onbid);
	        	
	        	Data.populateVideoListForDisplay(Data.getOnBouquet());
	        	SlidingWindow.init(Data.getVideoNames().length, 5, 0);
	        	Display.setBouquetDesc();
	        	Display.setVideoList( Data.getVideoNames(), Data.getVideoIDs() );
	        	this.selectFirstVideo();
	        	Logger.logDebug("New Video Size: " + Data.getVideoNames().length);
	    		//Display.resetSelectors();
	        	//Main.updateCurrentVideo(2,0);
	        	Display.updateVideoList();
	        	break;
	        
	        case tvKey.KEY_RIGHT:
	        	Logger.logDebug("Right");
	        	if(this.mode == this.FULLSCREEN)break;
	        	if(ParentalSettings.isBouquetLockEnabled()==true)
    			{
    				Audio.playSoundWarning();
    				Logger.log(Logger.INFO, "ALERT: Bouquet Change Attemped when locked");
    				break;
    			}
	        	Audio.playSoundPageRight();
	        	onbid = Data.getOnBouquet();
	        	nbids = Data.getNumberOfBouquets();
	        	onbid++;
	        	if(onbid == nbids )onbid=0; 
	        	Logger.logDebug("On Bouquet [" + onbid +"]");
	        	
	        	Data.setOnBouquet(onbid);
	        	Data.populateVideoListForDisplay(Data.getOnBouquet());
	        	SlidingWindow.init(Data.getVideoNames().length, 5, 0);
	        	Display.setBouquetDesc();
	        	Display.setVideoList( Data.getVideoNames(), Data.getVideoIDs() );
	        	this.selectFirstVideo(this.START);
	        	//SlidingWindow.reset();
	        	Logger.logDebug("New Video Size: " + Data.getVideoNames().length);
	        	//Display.resetSelectors();
	        	//Main.updateCurrentVideo(2,0);
	        	Display.updateVideoList();
	        	break;
	        	
	        case tvKey.KEY_PANEL_ENTER:
	        case tvKey.KEY_ENTER:
	        case 29443:
	        	Main.streamVideo();
	            break;
	
	        case tvKey.KEY_MUTE:
	        	if(this.mode != this.FULLSCREEN)return;
	            Main.muteMode();
	            break;
	            
	        /*case tvKey.KEY_GREEN:
	        	if(this.mode == this.FULLSCREEN)break;
	        	Audio.playSoundEnter();
	        	Data.switchStreamMode();
	        	Logger.log(Logger.INFO, "StreamMode: " + Data.getStreamModeDesc());        	
	        	Display.setStreamMode(Data.getOppositeStreamModeDesc());
	        	Main.updateCurrentVideo(2,0);
	        	break;
			*/
	        case 65://channel down
	        	if(Main.playerObj.getState()==Main.playerObj.PLAYING)
	        	{
	        		SlidingWindow.revertCache();
	        		this.selectPreviousVideo(this.UP);
	        		SlidingWindow.cache();
	        		VideoOverlay.showInfoBar();
	        		this.handlePlayKey();
	        		this.setFullScreenMode();
	        	}
	        	else
	        	{
	        		//this.selectPreviousVideo(this.UP);
	        		Audio.playSoundKeypad();
	        		Main.selectNext5Video(Main.DOWN);
	        	}
	        	break;
	        case 68://channel up
	        	if(Main.playerObj.getState()==Main.playerObj.PLAYING)
	        	{
	        		SlidingWindow.revertCache();
		        	this.selectNextVideo(this.DOWN);
	        		SlidingWindow.cache();
		        	VideoOverlay.showInfoBar();
	        		this.handlePlayKey();
	        		this.setFullScreenMode();
	        	}
	        	else
	        	{
		        	//this.selectNextVideo(this.DOWN);
	               	Audio.playSoundKeypad();
	        		Main.selectPrevious5Video(Main.UP);
	        	}
	        	break;
	        
	        case 31://info button
	        	{
	        		if(this.mode == this.FULLSCREEN)
	        		{
	    	        	Audio.playSoundEnter();
	    	        	VideoOverlay.showInfoBarToggleDetail(false);
	    	        	/*if(this.infobarState==0)
	        			{
	        				VideoOverlay.showInfoBarNoTimer();
	        				this.infobarState = 1;
	        			}
	        			else
	        			{
	        				VideoOverlay.hideInfoBar();
	        				this.infobarState = 0;
	        			}*/
	        		}
	        	}
	        	break;
	        	
	        case tvKey.KEY_YELLOW:
	        case tvKey.KEY_REC:
        		if(this.mode == this.FULLSCREEN)
        		{
        			return;
        		}
	        	Audio.playSoundEnter();
	        	if(Main.RECORDINGS_LIST==false)
	        	{
	               	Logger.log(Logger.INFO, "Switching to recordings mode");
	        		Main.selectFirstVideo(this.START);
	        		Main.RECORDINGS_LIST = true;
	               	Display.setLoadingTxt("Retrieving recordings List from " + Data.getIPAddress());
	               	Main.setScreenMode(Main.STARTING);
	               	Main.callFunctionWithDelay(500, Main.getRecordings);
	        	}
	        	else
	        	{
	        		Logger.log(Logger.INFO, "Switching to Channel mode");
	        		Main.selectFirstVideo(this.START);
	               	//Display.setLoadingTxt("Retrieving Channel List");
	               	Main.RECORDINGS_LIST = false;
	               	Display.setLoadingTxt("Retrieving Channel List from " + Data.getIPAddress());
	               	Main.setScreenMode(Main.STARTING);
	               	Main.callFunctionWithDelay(500, Main.getChannelListAfterRecordings);
	        	}
	        	break;
	        	
	        case 84: //Channel List
	        	if(this.mode == this.FULLSCREEN)
        		{
        			return;
        		}
	        	Audio.playSoundEnter();
	        	Logger.log(Logger.INFO, "Switching to Channel mode");
	        	Main.selectFirstVideo(this.START);
               	Main.RECORDINGS_LIST = false;
               	Display.setLoadingTxt("Retrieving Channel List from " + Data.getIPAddress());
               	Main.setScreenMode(Main.STARTING);
               	
               	Main.callFunctionWithDelay(500, Main.getChannelListAfterRecordings);
	        	break;
	        default:
	            //Logger.logDebug("Unhandled key");
	            break;
	    }  
	}
    else if(Main.SCREENMODE == Main.WELCOME)
    {
	    switch(keyCode)
	    {
		    case tvKey.KEY_GREEN:
		    	Main.setScreenMode(Main.SETTING);
		    break;
	    }
    }
    
    //Now handle any common keys across all screens
    switch(keyCode)
    {
	 	case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:	
			Audio.playSoundBack();
			Logger.logDebug("RETURN Key Pressed");
			
			widgetAPI.blockNavigation(event);
		    if(this.mode == this.FULLSCREEN)
		    {
		    	
		    	if(VideoOverlay.infoBarActive==true)
		    	{
		    		VideoOverlay.hideInfoBar();
		    	}
		    	else
		    	{
		    		this.toggleMode();
		    	}
		    }
		    else
		    {
		    	  
		    	//widgetAPI.blockNavigation(event);
		    	Main.playerObj.stopVideo();
		    	Alert.setDialog("Exit?", "Are you sure you want to leave E2Stream?<br>Please confirm using one of the options below", 
		    			"Return to E2Stream", 
		    			"Quit E2Stream", 
		    			"Quit E2Stream and Standby E2 box", 
		    			"Quit E2Stream and Deep Standby E2 box", 
		    			Main.ReturnCancel, 
		    			Main.ReturnExit, 
		    			Main.ReturnStandby, 
		    			Main.ReturnDeepStandby);
		    	Alert.showDialog();
		    	//widgetAPI.sendReturnEvent();
		    	//widgetAPI.blockNavigation(event);
		    }
			break;
			
    	case tvKey.KEY_EXIT:
    	case 45: //exit
    		Audio.playSoundBack();
    		Logger.logDebug("Exit Key Pressed");
    		widgetAPI.sendExitEvent();
        	//widgetAPI.sendReturnEvent();
        	break;
        	
    	case tvKey.KEY_MENU:
    		Audio.playSoundEnter();
    		TVMW.showTools();
    		break;
    	
    	case 75: //tools
        	Audio.playSoundWarning();
    		if(Main.DEBUG==false)
    		{
    			Main.DEBUG = true;
    			Logger.init();
    			Logger.logDebug("Enabling Debug");
    		}
    		else
    		{
    			Logger.logDebug("Disabling Debug");
    			Main.DEBUG = false;
    			Logger.init();
    		}

	   
    }
};

/**
 * Call back functions for exit dialog --------------------------------------------------------------------
 */
Main.ReturnCancel = function()
{
	Logger.logDebug("Return cancel");
};

Main.ReturnExit = function()
{
	Logger.logDebug("Return exit");
	widgetAPI.sendReturnEvent();
   
};

Main.normalStandBy = function()
{
	Server.standby(false);
	Main.callFunctionWithDelay(1500, Main.exitReturn);
};

Main.deepStandBy = function()
{
	Server.standby(true);
	Main.callFunctionWithDelay(1500, Main.exitReturn);
};

Main.ReturnStandby = function()
{
	Logger.logDebug("Return and Standby");
	Display.setLoadingTxt("Suspending your E2 box before exiting");
	Main.setScreenMode(Main.STARTING);
	Main.callFunctionWithDelay(500, Main.normalStandBy);
};

Main.ReturnDeepStandby = function()
{
	Logger.logDebug("Return and deep standby");
	Display.setLoadingTxt("Deep suspending your E2 box before exiting");
	Main.setScreenMode(Main.STARTING);
	Main.callFunctionWithDelay(Main.deepStandBy());
};

Main.exitReturn = function()
{
	Logger.logDebug("Now exiting the app");
	widgetAPI.sendReturnEvent();
	Display.setLoadingTxt("Terminated");
};

/**
 * ---------------------------------------------------------------------------------------------------------------
 */

Main.muteMode = function()
{
	Audio.mute();
};

Main.getChannelListAfterRecordings = function()
{
	Server.fetchVideoList();
	Display.setRecMode("Recordings");
	Display.showPicons();
	document.getElementById("reddesc").className="style_navi";
	document.getElementById("redimg").src="Images/navi/help_red.png";
	document.getElementById("nowbox").style.height ="150px";
	document.getElementById("nextbox").style.height ="150px";
	document.getElementById("nowdesc").style.height ="95px";
	document.getElementById("nexttext").style.display = "block";
	document.getElementById("nextprog").style.display = "block";
	Display.setLoadingTxt("Processing " + Data.getAllVideoIDs().length + " Channels");
	Main.callFunctionWithDelay(500, Main.processChannelList);
};

Main.getRecordings = function()
{
	Server.createLocationAndMovieList();
   	Main.RECORDINGS_LIST=true;
   	Display.setRecMode("TV");
	Display.hidePicons();
	document.getElementById("reddesc").className="style_navi_disabled";
	document.getElementById("redimg").src="Images/navi/help_red_disabled.png";
	document.getElementById("nowbox").style.height ="315px";
	document.getElementById("nextbox").style.height ="0px";
	document.getElementById("nowdesc").style.height ="250px";
	document.getElementById("nexttext").style.display = "none";
	document.getElementById("nextprog").style.display = "none";
	Main.selectFirstVideo();
	Display.setLoadingTxt("Processing " + Data.getAllVideoIDs().length + " Recordings");
	Main.callFunctionWithDelay(500, Main.processChannelList);
};

Main.handlePlayKey = function()
{
	Audio.playSoundEnter();
	Logger.log(Logger.INFO, "Stream playback requested");
	Display.hideAudioStreamsOnInfoBar();
	Display.setClock();
	var id   = Data.getVideoID(SlidingWindow.pointer);
	var name = Data.getVideoName(SlidingWindow.pointer);
	var bid= Data.getBouquetId(Data.getOnBouquet());
	playingIndex = id;
	Logger.log(Logger.DEBUG,"Channel ID [" + id + "]");
	Logger.log(Logger.DEBUG,"Bouquet ID [" + bid + "]");

	LastChannel.put(bid,id);
	
	var desc = Data.getVideoDescription(SlidingWindow.pointer);
	
	if(Data.getRemoveNumbers()=='Y')
    {
    	var pos = desc.indexOf("- ");
    	if(pos>0)desc= desc.substring(pos+2);
    }
	
	Display.setPiconLarge(id,name);
	Display.setChannelDesc(desc);
	
    switch ( Main.playerObj.getState() )
    {
        case Main.playerObj.STOPPED:
        	Logger.logDebug("Player is stopped - starting to play");
        	Main.playerObj.bufferingComplete=false;
        	if(Data.getZap()=='Y')Server.zapToChannel(Data.getVideoID(SlidingWindow.pointer));
        	Main.playerObj.playVideo();
    		break;

        case Main.playerObj.PAUSED:
        	Logger.logDebug("Player is paused - resuming");
        	VideoOverlay.showRecordingPlaybackText();
        	Main.playerObj.resumeVideo();
            break;
            
        case Main.playerObj.PLAYING:
        	Logger.logDebug("Player is playing - restart stream");
        	Main.playerObj.stopVideo();
        	Main.playerObj.bufferingComplete=false;
        	if(Data.getZap()=='Y')Server.zapToChannel(Data.getVideoID(SlidingWindow.pointer));
        	Main.playerObj.playVideo();
        	this.setFullScreenMode();
            break;

        default:
            Logger.logDebug("Ignoring play key, not in correct state");
            break;
    }
};

Main.handlePauseKey = function()
{
    switch ( Main.playerObj.getState() )
    {
        case Main.playerObj.PLAYING:
        	Audio.playSoundEnter();
        	Main.playerObj.pauseVideo();
            //sf.service.setScreenSaver(true);
            break;

        default:
            Logger.logDebug("Ignoring pause key, not in correct state");
            break;
    }
};


Main.selectNext5Video = function(down)
{
	Logger.logDebug("Selected video: " + SlidingWindow.pointer);
	//this.selectedVideo = (this.selectedVideo + 5);
	//if(this.selectedVideo >= Data.getVideoCount())this.selectedVideo=Data.getVideoCount()-1;
	Logger.logDebug("Selected video: " + SlidingWindow.pointer);
	this.updateCurrentVideo(down,5);
    Display.updateVideoList();	
};

Main.selectPrevious5Video = function(up)
{
	//this.selectedVideo = this.selectedVideo - 5;
	//if(this.selectedVideo<0)this.selectedVideo=0;
	this.updateCurrentVideo(up,-5);
    Display.updateVideoList();
};

Main.selectFirstVideo = function()
{
	Logger.logDebug("Video Count: " + Data.getVideoCount());
	if(Data.getVideoCount()<=0)
	{
		Logger.logDebug("selectFirstVideo: No videos in list");
		return;
	}
	SlidingWindow.reset();
    this.updateCurrentVideo(this.START,0);
    Display.updateVideoList();
};


Main.selectNextChanelDesc = function(down)
{
	
};

Main.selectNextVideo = function(down)
{
    this.updateCurrentVideo(down,1);
    Display.updateVideoList();
    
};

Main.selectPreviousVideo = function(up)
{
    this.updateCurrentVideo(up,-1);
    Display.updateVideoList();
};

Main.setFullScreenMode = function()
{
    if (this.mode != this.FULLSCREEN)
    {
    	Display.hide("main",300);
    	VideoOverlay.show();
        VideoOverlay.setTime(0);
        Main.playerObj.setFullscreen();
        
        //Display.showInfoBar();
        this.mode = this.FULLSCREEN;
    }
};

Main.setWindowMode = function()
{
	Logger.logDebug("setWindowMode");
	//Logger.log(Logger.WARN,"caller is " + arguments.callee.caller.toString());
    if (this.mode != this.WINDOW)
    {
        Display.show("main",410);
        VideoOverlay.hide();
        Main.playerObj.stopVideo();
        Main.playerObj.setWindow();
        this.mode = this.WINDOW;
    }
};

Main.toggleMode = function()
{
	Logger.logDebug("Main.toggleMode");
	//Logger.logDebug("caller is " + arguments.callee.caller.toString());
    Logger.logDebug("Player state is: " + Main.playerObj.getState());
	/*if(Main.playerObj.getState() == Main.playerObj.PAUSED)
    {
		Main.playerObj.resumeVideo();	
    }
	else
	{*/
	    switch (this.mode)
	    {
	        case this.WINDOW:
	            this.setFullScreenMode();
	            break;
	            
	        case this.FULLSCREEN:
	            this.setWindowMode();
	            break;
	            
	        default:
	            //Logger.logDebug("ERROR: unexpected mode in toggleMode");
	            break;
	    }
	/*}*/
};

Main.callFunctionWithDelay = function(delay,func)
{
	setTimeout(func,delay);
};

Main.updateClock = function()
{
	Display.setClock();
};

Main.startClock = function()
{
	setInterval(Main.tick,1000);
};

Main.resetVideoList = function()
{
	SlidingWindow.revertCache();
	this.updateCurrentVideo(Main.UP,0);
    Display.updateVideoList();

};

Main.streamVideo = function()
{
	
    if((Main.playerObj.getState()==Main.playerObj.PLAYING && VideoOverlay.infoBarActive==false) /*&& (playingIndex == Data.getVideoID(SlidingWindow.pointer))*/)
    {
		Main.resetVideoList();
		Main.toggleMode();
		Display.hideInfoBar();
    }
    else
    {
    	var isPaused = false;
    	if(Main.playerObj.state == Main.playerObj.PAUSED)isPaused=true;
    	if(VideoOverlay.infoBarActive==true)isPaused=true;
    	
    	SlidingWindow.cache();
    	Main.handlePlayKey();
    	if(isPaused==false)
    	{
    		Logger.log(Logger.DEBUG,"Player not paused, toggle");
    		Main.toggleMode();
    	}
    	else
    	{
    		Logger.log(Logger.DEBUG,"Player Paused or infobar active - just restart stream");
    	}
    	
    }
};

/** 
 * Ticks over every second for timer events
 */
Main.tick = function()
{
	var tickTime = Utilities.getTimeInMsSinceEpoch();

	Main.updateClock();
	VideoOverlay.checkOSD(tickTime);
	VideoOverlay.checkAudioOSD(tickTime);
	VideoOverlay.checkAlertOSD(tickTime);
	VideoOverlay.updateRemainingTime();
	
	
};

