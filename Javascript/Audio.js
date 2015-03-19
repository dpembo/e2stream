var Audio =
{
    plugin : null,
    volume: 0,
    muteStatus: 0,
    enabled: true
    
};

Audio.init = function()
{
    var success = true;
    
    /*this.plugin = document.getElementById("pluginAudio1");
    //this.plugin.Open("Audio",1.0,"Audio");
    if (!this.plugin)
    {
        success = false;
    }*/
    if(deviceapis && deviceapis.audiocontrol && deviceapis.audiocontrol.playSound)
    {
    	Logger.logDebug("Enabled Audio control");
    	Audio.enabled=true;
    	Audio.plugin = deviceapis.audiocontrol;
        Audio.getVolume();
    }
    else
    {
    	Logger.log(Logger.WARN, "Audio control not available");
    	Audio.enabled=false;
    }
    
    return success;
};

Audio.playSoundKeypad= function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_KEYPAD);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};


Audio.playSoundDown = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_KEYPAD);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundUp = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_KEYPAD);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};


Audio.playSoundVolDown = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_KEYPAD);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundVolUp = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_KEYPAD);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundEnter = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_SELECT);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundWarning = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_WARNING);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};


Audio.playSoundBack = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_BACK);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};


Audio.playSoundPageLeft = function()
{
	if(Audio.enabled==false)return;
	try
	{	
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_PAGE_LEFT);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};


Audio.playSoundPageRight = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_PAGE_RIGHT);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundLeft = function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_LEFT);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};

Audio.playSoundRight= function()
{
	if(Audio.enabled==false)return;
	try
	{
		Audio.plugin.playSound(Audio.plugin.AUDIO_SOUND_TYPE_RIGHT);
	}
	catch(e)
	{
		Logger.log(Logger.WARN, "Audio unavailale");
		Audio.enabled=false;
	}
};



Audio.increaseVolume = function()
{
	if(Audio.enabled==false)return;
	if(Audio.muteStatus>0)
	{
		Audio.mute();
		return;
	}
	
	Audio.getVolume();
	Audio.volume = Audio.volume + 2;
	if(Audio.volume>100)Audio.volume=100;
	Audio.plugin.setVolume(Audio.volume);
	Display.showVolume();
	Audio.playSoundVolUp();
	//Audio.plugin.playSound(deviceapis.audiocontrol.AUDIO_SOUND_TYPE_UP);	
};

Audio.decreaseVolume = function()
{
	if(Audio.enabled==false)return;
	if(Audio.muteStatus>0)
	{
		Audio.mute();
		return;
	}
	
	Audio.getVolume();
	Audio.volume = Audio.volume - 2;
	if(Audio.volume<0)Audio.volume=0;
	Audio.plugin.setVolume(Audio.volume);
	Display.showVolume();
	Audio.playSoundVolDown();
	//Audio.plugin.playSound(deviceapis.audiocontrol.AUDIO_SOUND_TYPE_DOWN);	
};

Audio.setRelativeVolume = function(delta)
{
	if(Audio.enabled==false)return;
	Audio.volume = Audio.plugin.getVolume();
	if(delta>0)Audio.volume = Audio.volume + 2;
	else Audio.volume = Audio.volume-2;
	if(Audio.volume<0)Audio.volume=0;
	if(Audio.volume>100)Audio.volume=100;
	Audio.plugin.setVolume(Audio.volume);
};

Audio.mute = function()
{
	if(Audio.enabled==false)return;
	if(Audio.muteStatus==0)Audio.muteStatus=1;
	else Audio.muteStatus=0;

	if(Audio.muteStatus > 0)
	{
		Audio.plugin.setMute(true);
		Display.showMute();
	}
	else 
	{
		Audio.plugin.setMute(false);
		Display.muteOff();
	}
	//this.plugin.Execute("SetUserMute", Audio.muteOn);
};


Audio.getVolume = function()
{
	if(Audio.enabled==false)return 0;
    Audio.volume = Audio.plugin.getVolume();
    return Audio.plugin.getVolume();
};

