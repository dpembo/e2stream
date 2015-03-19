var Display =
{
    statusDiv : null,
    FIRSTIDX : 0,
    LASTIDX : 4,
    currentWindow : 0,

    SELECTOR : 0,
    LIST : 1,
    
    videoList : new Array(),
    idList    : new Array(),
    
    popup	  : false,
    
    LEFT: -1,
    RIGHT: 1,
    UP:    2,
    DOWN: -2,
    ENTER: 0,
    IGNORE: -99,
    
    spinnerIndex: 0

    
    
};

var iconHTMLleft = "<img";
var iconSize ="	height='30' width='50'";
var infobarIconSize ="	height='57' width='95'";
var largeIconSize ="	height='110' width='195'";
var timeOnDisplay = 0;
var leaveOnScreen = 3000;

//var iconSpanleft = "<div";
//var iconSpanSize =" style=\"width:50px;height:30px;float: left;margin-right: 4px;\"><div style=\"background-size: 100%;height:31px;background-image: url('";
//var iconSpanRight = "')\" ";

var iconid =" id='picon_";
var iconsrc = "' src='";
var iconLargeHTMLleft = "<img";
var iconHTMLright = "'/>&nbsp;";
//var iconSpanEnd = "'>&nbsp;</div></div>";

Display.init = function()
{
    var success = true;
    
    this.statusDiv = document.getElementById("status");

    if (!this.statusDiv)
    {
        success = false;
    }
    
    return success;
};

Display.setTotalTime = function(total)
{
    this.totalTime = total;
};


Display.togglePopup = function()
{
	if(popup)
	{
		//sf.scene.hide('popup');	
	}
	else
	{
		//sf.scene.show('popup');	
	}
	this.popup = !popup;
};

Display.setRecMode = function(inMode)
{
	widgetAPI.putInnerHTML(document.getElementById("recMode"),inMode);
};

Display.setStreamMode = function(inStreamMode)
{
	widgetAPI.putInnerHTML(document.getElementById("streamMode"),inStreamMode);
};

Display.setBouquetDesc = function()
{
	//Logger.logDebug("Set bouquet Description");
	var desc = Data.getBouquetDescription(Data.getOnBouquet());
	widgetAPI.putInnerHTML(document.getElementById("bouquetDesc"),desc);
};

Display.setBouquetDescFromId = function(bid)
{
	var desc = Data.getBouquetDescription(bid);
	widgetAPI.putInnerHTML(document.getElementById("bouquetDesc"),desc);
};

Display.blankVideoList = function()
{
	for (var i=0;i<5;i++)
    {
    	var textElem= document.getElementById("desc_"+i);
    	var piconElem  = document.getElementById("picon_" + i);
    	widgetAPI.putInnerHTML(textElem, "");
    	piconElem.style.display="none";
    	divElem = document.getElementById("video" + i).style.backgroundImage="";
    }	
};

Display.updateVideoList = function()
{
	Display.setVideoList(Data.getVideoNames(), Data.getVideoIDs());
};

Display.setVideoList = function(nameList,idList)
{
	Logger.logDebug("Setting video list - length" + nameList.length);
    var i=0;
    var picUrl;

    //blank off the videos first
    Display.blankVideoList();
    
    i=0;
    for (i=0;i<5;i++)
    {
        descElem = document.getElementById("desc_" +i);
        piconElem = document.getElementById("picon_" + +i);
        
        if(SlidingWindow.windowStartPointer+i<SlidingWindow.numberItems)
        {
	        picUrl = Picon.getFileName(idList[(SlidingWindow.windowStartPointer+i)], nameList[(SlidingWindow.windowStartPointer+i)]);
	        this.idList[(SlidingWindow.windowStartPointer+i)] = picUrl;

	        var className = "listText";
	        if(Main.RECORDINGS_LIST==true)className = "recsText";
	            
	        widgetAPI.putInnerHTML(descElem,nameList[SlidingWindow.windowStartPointer+i]);
	        descElem.className=className;
	        piconElem.src=picUrl;
	        piconElem.style.display="inline";
	        //widgetAPI.putInnerHTML(this.videoList[i], iconHTML + "<span class=\"" + className + "\">" + listHTML +"</span>" );
	        //widgetAPI.putInnerHTML(document.getElementById("piconlist"),iconLargeHTML);
	        //i++;
	    }
    }
    divElem = document.getElementById("video" + SlidingWindow.positionInWindow);
    divElem.style.backgroundImage= "url(Images/listBox/selector.png)";
    //this.videoList[this.FIRSTIDX].style.backgroundImage= "url(Images/listBox/selector.png)";
    
    if(SlidingWindow.numberItems > SlidingWindow.windowSize + SlidingWindow.windowStartPointer)
    {
    	document.getElementById("next").style.opacity = '1.0';
    }
    else
    {
    	document.getElementById("next").style.opacity = '0.2';
    }
    
    if(SlidingWindow.windowStartPointer > 0)
    {
    	document.getElementById("previous").style.opacity = '1.0';
    }
    else
    {
    	document.getElementById("previous").style.opacity = '0.2';
    }
    
    listHTML = (SlidingWindow.pointer + 1) + " / " + nameList.length;
    widgetAPI.putInnerHTML(document.getElementById("videoCount"), listHTML);
    Display.setBouquetDesc();
};

Display.resetSelectors = function()
{
	this.currentWindow=0;
	for(var i=0;i<5;i++)
	{
		var divElem = document.getElementById("video" + i);
		divElem.style.backgroundImage= "";
	}
	divElem = document.getElementById("video" + 0);
	divElem.style.backgroundImage= "url(Images/listBox/selector.png)";
};

Display.setVideoCounter = function(position)
{
	var listHTML = "";
    listHTML = (position ) + " / " + Data.getVideoCount();
    widgetAPI.putInnerHTML(document.getElementById("videoCount"), listHTML);

};



Display.setVideoListPosition = function(count)
{
	//if(move = Display.UP)count = 0-count;
	SlidingWindow.move(count);
};


Display.emptyPiconLarge = function()
{
    widgetAPI.putInnerHTML(document.getElementById("piconlarge"),"");
};

Display.setPiconList = function(id,name)
{
	var picUrl = Picon.getFileName(id, name);//id.substring(0, id.length-1) + ".png";
    var iconLargeHTML = iconHTMLleft+ largeIconSize + iconid + iconsrc + picUrl + iconHTMLright;
    widgetAPI.putInnerHTML(document.getElementById("piconlist"),iconLargeHTML);
    
    if(Main.RECORDINGS_LIST == true)Display.hidePicons();
    else Display.showPicons();
    
};

Display.setPiconLarge = function(id,name)
{
    id = id.replace(/\:/g,"_");
    var picUrl = Picon.getFileName(id, name);//id.substring(0, id.length-1) + ".png";
    var iconLargeHTML = iconLargeHTMLleft + infobarIconSize + iconid + iconsrc + picUrl + iconHTMLright;
    widgetAPI.putInnerHTML(document.getElementById("infobar-piconlarge"),iconLargeHTML);
};

Display.setChannelDesc = function(desc)
{
	var elem ;
	elem = document.getElementById("infobar-channel");
	widgetAPI.putInnerHTML(elem,desc); 
};

Display.setClock = function()
{
	var elem;
	if(Main.RECORDINGS_LIST == false)
		elem = document.getElementById("infobar-time");
	else
		elem = document.getElementById("recbar-time");
	
	mainelem = document.getElementById("mainClock");
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	
	var hs = h.toString();
	var ms = m.toString();
	var ss = s.toString();
	if(hs.length==1)hs = "0" + hs;
	if(ms.length==1)ms = "0" + ms;
	if(ss.length==1)ss = "0" + ss;
	
	timestring = hs + ":" + ms ;
	maintimestring = hs + ":" + ms + ":" +ss;
	
	widgetAPI.putInnerHTML(elem,timestring);	
	widgetAPI.putInnerHTML(mainelem,maintimestring);	
};

Display.showAudioBar = function()
{
	document.getElementById('audiobar').style.display="block";
};

Display.showAlertBar = function(inMessage)
{
	//set the message
	var msgElem = document.getElementById('alertbar-text');
	widgetAPI.putInnerHTML(msgElem,inMessage);
	//show the bar
	document.getElementById('alertbar').style.display="block";
	
};


Display.hideAlertBar = function()
{
	document.getElementById('alertbar').style.display="none";
};


Display.hideAudioStreamsOnInfoBar = function()
{
	document.getElementById('infobar-audiostreams').style.display="none";
	document.getElementById('recbar-audiostreams').style.display="none";
};

Display.showAudioStreamsOnInfoBar = function(numberOfStreams)
{
	
	if(numberOfStreams > 1)
	{	
		if(Main.RECORDINGS_LIST == true)
		{
			document.getElementById('recbar-audiostreams').style.display="block";
			widgetAPI.putInnerHTML(document.getElementById('recbar-audiostreams-text'),numberOfStreams.toString());
		}
		else
		{
			document.getElementById('infobar-audiostreams').style.display="block";
			widgetAPI.putInnerHTML(document.getElementById('infobar-audiostreams-text'),numberOfStreams.toString());
		}
	}
};

Display.hideAudioBar = function()
{
	document.getElementById('audiobar').style.display="none";
};

Display.showInfoBar = function()
{
	if(Main.RECORDINGS_LIST == true)Display.showRecBar();
	else Display.showChnlBar();
};

Display.hideInfoBar = function()
{
	Display.hideDetailedInfoBar();
	if(Main.RECORDINGS_LIST == true) Display.hideRecBar();
	else Display.hideChnlBar();
	VideoOverlay.infoBarActive=false;
};

Display.setAudioStream = function(onAudio,ofTotalAudio)
{
	 if(ofTotalAudio<=0)return;
	var elem = document.getElementById('audiobar-text');
	var text = onAudio + " / " + ofTotalAudio ;
	widgetAPI.putInnerHTML(elem, text);
	
};

Display.updateChannelInfomation = function()
{
	var desc = Data.getVideoDescription(SlidingWindow.pointer);
	if(Data.getRemoveNumbers()=='Y')
    {
    	var pos = desc.indexOf("- ");
    	if(pos>0)desc= desc.substring(pos+2);
    }
	var id   = Data.getVideoID(SlidingWindow.pointer);
	var name = Data.getVideoName(SlidingWindow.pointer);
	Display.setPiconLarge(id,name);
	Display.setChannelDesc(desc);
};

Display.hideDetailedInfoBar = function()
{
	Logger.log(Logger.INFO,"Hiding Detail INFO Bar");
	document.getElementById("infobarDetail").style.display="none";
	VideoOverlay.infoDetailBarActive=false;
};

Display.showDetailedInfoBar = function()
{
	Logger.log(Logger.INFO,"Showing Detail INFO Bar");
	document.getElementById("infobarDetail").style.display="block";
	
	//if recording then hide the next...
	if(Main.RECORDINGS_LIST==true)
	{
		document.getElementById("nextHeader").style.display="none";
		document.getElementById("nextDetail").style.display="none";
	}
	else
	{
		document.getElementById("nextHeader").style.display="block";
		document.getElementById("nextDetail").style.display="block";
	}
	
};

Display.showChnlBar= function()
{
	Logger.log(Logger.INFO,"Showing Channel INFO Bar");
	document.getElementById("infobar").style.display="block";
	document.getElementById("recbar").style.display="none";
};

Display.hideChnlBar = function()
{
	Logger.log(Logger.INFO,"Hiding the INFO Bar");
	document.getElementById("infobar").style.display="none";
	document.getElementById("recbar").style.display="none";
	document.getElementById("infobar-audiostreams").style.display="none";
};

Display.showRecBar = function()
{
	Logger.log(Logger.INFO,"Showing Recording INFO Bar");
	document.getElementById("recbar").style.display="block";
	document.getElementById("infobar").style.display="none";
};

Display.hideRecBar = function()
{
	Logger.log(Logger.INFO,"Hiding the INFO Bar");
	document.getElementById("recbar").style.display="none";
	document.getElementById("infobar").style.display="none";
	document.getElementById("infobar-audiostreams").style.display="none";
};

Display.setNow = function (title,time,desc)
{
	var titleElement = document.getElementById("nowprog");
    var descElement = document.getElementById("nowdesc");
    var timeElement = document.getElementById("nowtime");
    var infoNowElement  = document.getElementById("infobar-nowDesc");
    var recNowElement  = document.getElementById("recbar-desc");
    var infoNowTimeElement = document.getElementById("infobar-nowTime");
    var detailTitleElem= document.getElementById("nowDetail-title");
    var detailDescElem = document.getElementById("nowDetail-extended");
    widgetAPI.putInnerHTML(titleElement, title);
    widgetAPI.putInnerHTML(descElement, desc);
    widgetAPI.putInnerHTML(timeElement , time);  
    widgetAPI.putInnerHTML(infoNowElement , title);
    widgetAPI.putInnerHTML(detailTitleElem , title);
    widgetAPI.putInnerHTML(detailDescElem , desc);
    widgetAPI.putInnerHTML(recNowElement , title);
    widgetAPI.putInnerHTML(infoNowTimeElement , time);
};

Display.setNext = function (title,time,desc)
{
	var titleElement = document.getElementById("nextprog");
    var descElement = document.getElementById("nextdesc");
    var timeElement = document.getElementById("nexttime");

    var infoNextElement  = document.getElementById("infobar-nextDesc");
    var infoNextTimeElement = document.getElementById("infobar-nextTime");
    
    var detailTitleElem= document.getElementById("nextDetail-title");
    var detailDescElem = document.getElementById("nextDetail-extended");
    
    widgetAPI.putInnerHTML(titleElement, title);
    widgetAPI.putInnerHTML(descElement, desc);
    widgetAPI.putInnerHTML(timeElement , time);  
    widgetAPI.putInnerHTML(infoNextElement , title);
    widgetAPI.putInnerHTML(infoNextTimeElement , time);
    
    widgetAPI.putInnerHTML(detailTitleElem , title);
    widgetAPI.putInnerHTML(detailDescElem, desc);
};



Display.setNoEPG = function()
{
	var description = "Searching for EPG data...";
    var descriptionElement = document.getElementById("nowprog");
    var nxtElem = document.getElementById("nextprog");
    var descElement = document.getElementById("nowdesc");
    var timeElement = document.getElementById("nowtime");
    widgetAPI.putInnerHTML(descElement, "");
    widgetAPI.putInnerHTML(timeElement, "");
    descElement = document.getElementById("nextdesc");
    timeElement = document.getElementById("nexttime");
    widgetAPI.putInnerHTML(descElement, "");
    widgetAPI.putInnerHTML(timeElement, "");
    widgetAPI.putInnerHTML(descriptionElement, description);
    widgetAPI.putInnerHTML(nxtElem, description);
};

Display.setNowNext = function()
{
	var nowprog,nowtime,nowdesc = "";
	nowprog = Data.getNowTitle();
	nowtime = Data.getNowTime();
	nowdesc = Data.getDynamicVideoDescription();
	var nextprog,nexttime,nextdesc = "";
	nextprog = Data.getNextTitle();
	nexttime = Data.getNextTime();
	nextdesc = Data.getNextDescription();
	this.setNow(nowprog, nowtime, nowdesc);
	this.setNext(nextprog, nexttime, nextdesc);
};
/*
Display.hide = function()
{
    document.getElementById("main").style.display="none";
};*/

/*Display.show = function()
{
    document.getElementById("main").style.display="block";
};*/

Display.showError= function()
{
	document.getElementById("errorPopup").style.display="block";
	Main.enableKeys();
	widgetAPI.sendReadyEvent();
};

Display.hideError = function()
{
	document.getElementById("errorPopup").style.display="none";
};

Display.showStreamError= function()
{
	document.getElementById("streamErrorPopup").style.display="block";
	Main.enableKeys();
	widgetAPI.sendReadyEvent();
};

Display.hideStreamError = function()
{
	document.getElementById("streamErrorPopup").style.display="none";
};

Display.showInfo = function()
{
	document.getElementById("aboutPanel").style.display="block";
	Main.enableKeys();
	widgetAPI.sendReadyEvent();
};

Display.hideInfo = function()
{
	document.getElementById("aboutPanel").style.display="none";
};

Display.setStreamErrorDetails = function(description,message)
{
	widgetAPI.putInnerHTML(document.getElementById('streamerrorText'),description);
	widgetAPI.putInnerHTML(document.getElementById('streamerrorDetailMessage'),message);
};

Display.setErrorDetails = function(description,message)
{
	widgetAPI.putInnerHTML(document.getElementById('errorText'),description);
	widgetAPI.putInnerHTML(document.getElementById('errorDetailMessage'),message);
};

Display.showQuestion2 = function()
{
	document.getElementById("question2Popup").style.display="block";
};
Display.hideQuestion2 = function()
{
	document.getElementById("question2Popup").style.display="none";
};

Display.loadingHide = function()
{
    document.getElementById("loading").style.display="none";
};
Display.loadingShow = function()
{
	document.getElementById("loading").style.display="block";
};

Display.setLoadingTxt = function(txt)
{
	Logger.log(Logger.INFO, 'Startup: ' + txt);
	var elem = document.getElementById("loadingtxt");
	widgetAPI.putInnerHTML(elem, txt);
	
};

Display.settingsShow = function()
{
	document.getElementById("settingsPanel").style.display="block";
};

Display.settingsHide = function()
{
	document.getElementById("settingsPanel").style.display="none";
};

Display.showWelcome = function()
{
	document.getElementById("welcomePanel").style.display="block";
};

Display.hideWelcome = function()
{
	document.getElementById("welcomePanel").style.display="none";
};

Display.showQuestion = function()
{
	document.getElementById("questionPopup").style.display="block";
};

Display.hideQuestion = function()
{
	document.getElementById("questionPopup").style.display="none";
};
Display.setSettingsScreenValues = function()
{
	var iparr = Data.getIPAddress().split(".");
	if(iparr[0])Display.setField('f1', iparr[0]);
	if(iparr[1])Display.setField('f2', iparr[1]);
	if(iparr[2])Display.setField('f3', iparr[2]);
	if(iparr[3])Display.setField('f4', iparr[3]);
	
	Display.setField('f5', Data.getStreamPort());
	Display.setField('f6', Data.getTranscodePort());
	
	if(Data.getRemoveNumbers()=='Y') Display.presetToggle('f11', 'f12', 'f11');
	else Display.presetToggle('f11', 'f12', 'f12');

	if(Data.getZap()=='Y') Display.presetToggle('f7', 'f8', 'f7');
	else Display.presetToggle('f7', 'f8', 'f8');
	
	if(Data.getStreamMode()==1) Display.presetToggle('f9', 'f10', 'f9');
	else Display.presetToggle('f9', 'f10', 'f10');
	
	//LEGACY PLAYER CODE
	if(Data.getPlayerName()=='Legacy') Display.presetToggle('a1', 'a2', 'a2');
	else Display.presetToggle('a1', 'a2', 'a1');
	
	//MT settings
	if(Data.getMtEnabled()=='Y')Display.presetToggle('a3', 'a4', 'a3');
	else Display.presetToggle('a3', 'a4', 'a4');
	
	Display.setField("a5", Data.getMtBitrate());
	Display.setField("a6", Data.getMtWidth());
	Display.setField("a7", Data.getMtHeight());
	Display.setField("a8", Data.getMtAspectRatio());
	Display.setField("a9", Data.getMtInterlaced());
	
		
	Display.initSpinField('f13', Data.getBouquetDescriptionsPlusLast(), Data.getStartBouquetForSettings());
	
	ParentalSettings.settingsToUI();
};

Display.setScreenValuesToData = function()
{
	var ip = "";
	var o1,o2,o3,o4 = "";
	o1 = Display.getField("f1");
	o2 = Display.getField("f2");
	o3 = Display.getField("f3");
	o4 = Display.getField("f4");
	ip=o1 + "." + o2 + "." + o3 + "." + o4;
	var sport, tport = "";
	sport = Display.getField("f5");
	tport = Display.getField("f6");
		
	Data.setIPAddress(ip);
	Data.setStreamPort(sport);
	Data.setTranscodePort(tport);
	
	val = Display.getToggle("f7", "f8");
	if(val==1)Data.setZap("Y");
	else Data.setZap("N");
	
	val = Display.getToggle("f9", "f10");
	if(val==1)Data.setStreamMode(1);
	else Data.setStreamMode(0);
	
	val2= Display.getToggle("a1", "a2");
	if(val2==1)Data.setPlayerName("Default");
	else Data.setPlayerName("Legacy");
	
	var mtEnabled = Display.getToggle("a3", "a4");
	if(mtEnabled==2)Data.setMtEnabled("N");
	else(Data.setMtEnabled("Y"));
	
	var a5,a6,a7,a8,a9 = "";
	a5 = Display.getField("a5");
	a6 = Display.getField("a6");
	a7 = Display.getField("a7");
	a8 = Display.getField("a8");
	a9 = Display.getField("a9");
	
	Data.setMtBitrate(a5);
	Data.setMtWidth(a6);
	Data.setMtHeight(a7);
	Data.setMtAspectRatio(a8);
	Data.setMtInterlaced(a9);
	
	
};

Display.setClassName = function(id,classname)
{
	document.getElementById(id).className = classname;	
};


Display.changeAdvancedSettingField = function(direction)
{
	
	var NUMBER_FIELDS=9;
	var prefix = "a";
	
	//Play a sound
	if(direction==Display.LEFT)Audio.playSoundLeft();
	if(direction==Display.RIGHT)Audio.playSoundRight();
	if(direction==Display.UP)Audio.playSoundUp();
	if(direction==Display.DOWN)Audio.playSoundDown();
	if(direction==Display.ENTER)Audio.playSoundEnter();

	//find out which field is active focus
	for(var i=1;i<=NUMBER_FIELDS;i++)
	{
		var cname = document.getElementById(prefix + i.toString()).className;
		if(cname=='inputTxtfocus' || cname=='inputRadiofocus')
		{
			onfieldNo = i;
		}
	}
	Logger.log(Logger.DEBUG, "On advanced Field No: " + onfieldNo);
	
	
	if(onfieldNo==1)
	{
		if(direction==Display.DOWN)onfieldNo=3;
		if(direction==Display.RIGHT)onfieldNo=2;
		if(direction==Display.ENTER)Display.setToggle('a1', 'a2');
	}
	else if(onfieldNo==2)
	{
		if(direction==Display.UP)onfieldNo=2;
		if(direction==Display.DOWN)onfieldNo=4;
		if(direction==Display.LEFT)onfieldNo=1;
		if(direction==Display.ENTER)Display.setToggle('a1', 'a2');
	}
	else if(onfieldNo==3)
	{
		if(direction==Display.UP)onfieldNo=1;
		if(direction==Display.DOWN && Display.getToggle('a3', 'a4')==1)onfieldNo=5;
		if(direction==Display.RIGHT)onfieldNo=4;
		if(direction==Display.ENTER)Display.setToggle('a3', 'a4');
		if(Display.getToggle('a3', 'a4')==1)
		{
			Logger.logDebug("Multi-Transcode turned on");
			Utilities.getElement("disabledBack").style.display="none";
			
			//Set transcoding to false in the settings screen
			if(Display.getToggle('f9','f10')==1) Display.setToggle('f9', 'f10');
		}
		else
		{
			Utilities.getElement("disabledBack").style.display="";
			if(Display.getToggle('f9','f10')==1) Display.setToggle('f9', 'f10');
		}

	}
	else if(onfieldNo==4)
	{
		if(direction==Display.UP)onfieldNo=2;
		if(direction==Display.DOWN && Display.getToggle('a3', 'a4')==1)onfieldNo=5;
		if(direction==Display.LEFT)onfieldNo=3;
		if(direction==Display.ENTER)Display.setToggle('a3', 'a4');
		if(Display.getToggle('a3', 'a4')==1)
		{
			Logger.logDebug("Multi-Transcode turned on");
			Utilities.getElement("disabledBack").style.display="none";
		}
		else
		{
			Utilities.getElement("disabledBack").style.display="";
		}
	}
	else if(onfieldNo==5)
	{
		if(direction==Display.UP)onfieldNo=3;
		if(direction==Display.DOWN)onfieldNo=6;
	}
	else if(onfieldNo==6)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.DOWN) onfieldNo=8;
		if(direction==Display.RIGHT)onfieldNo=7;
	}

	else if(onfieldNo==7)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.DOWN) onfieldNo=9;
		if(direction==Display.LEFT)onfieldNo=6;
	}
	else if(onfieldNo==8)
	{
		if(direction==Display.UP)onfieldNo=6;
		if(direction==Display.RIGHT)onfieldNo=9;
	}

	else if(onfieldNo==9)
	{
		if(direction==Display.UP)onfieldNo=7;
		if(direction==Display.LEFT)onfieldNo=8;
	}
	
	
	for(var i=1;i<=NUMBER_FIELDS;i++)
	{
		suffix="Txt";
		if(document.getElementById("a" + i).className.indexOf('Radio')>0)suffix="Radio";
		document.getElementById("a" + i).className = 'input' + suffix;
		if(i==onfieldNo)document.getElementById("a" + i.toString()).className = 'input' + suffix +'focus';
	}
	Data.setOnField("a" + onfieldNo);
	Data.setOnFieldNo(onfieldNo);

};

Display.changeParentalSettingField = function(direction)
{
	var NUMBER_FIELDS=8;
	var prefix = "p";
	
	//Play a sound
	if(direction==Display.LEFT)Audio.playSoundLeft();
	if(direction==Display.RIGHT)Audio.playSoundRight();
	if(direction==Display.UP)Audio.playSoundUp();
	if(direction==Display.DOWN)Audio.playSoundDown();
	if(direction==Display.ENTER)Audio.playSoundEnter();
	
	//find out which field is active focus
	for(var i=1;i<=NUMBER_FIELDS;i++)
	{
		var cname = document.getElementById(prefix + i.toString()).className;
		if(cname=='inputTxtfocus' || cname=='inputRadiofocus')
		{
			onfieldNo = i;
		}
	}	
	
	//If on field 1,2,3 pressing right works and adds1
	//If on field 2,3,4 pressing left works and adds1
	if(onfieldNo >=1 && onfieldNo <=4 )
	{
		if(direction == Display.RIGHT)onfieldNo++;
		if(direction == Display.LEFT)onfieldNo--;
		if(onfieldNo<1)onfieldNo=1;
		if(onfieldNo>4)onfieldNo=4;
	
		if(direction == Display.DOWN)onfieldNo=5;
		if(direction == Display.UP)onfieldNo=1;
	}
	//if on field 5 right adds 1
	else if(onfieldNo==5)
	{
		if(direction==Display.UP)onfieldNo=1;
		if(direction==Display.DOWN)onfieldNo=7;
		if(direction==Display.RIGHT)onfieldNo=6;
		if(direction==Display.ENTER)Display.setToggle('p5', 'p6');
	}
	
	else if(onfieldNo==6)
	{
		if(direction==Display.UP)onfieldNo=1;
		if(direction==Display.DOWN)onfieldNo=7;
		if(direction==Display.LEFT)onfieldNo=5;
		if(direction==Display.ENTER)Display.setToggle('p5', 'p6');
	}
	
	else if(onfieldNo==7)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.RIGHT)onfieldNo=8;
		if(direction==Display.ENTER)Display.setToggle('p7', 'p8');
	}
	else if(onfieldNo==8)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.LEFT)onfieldNo=7;
		if(direction==Display.ENTER)Display.setToggle('p7', 'p8');
	}
	
	Logger.log(Logger.DEBUG, "On Field No: " + onfieldNo);
	
	document.getElementById(prefix + "1").className = 'inputTxt';
	document.getElementById(prefix + "2").className = 'inputTxt';
	document.getElementById(prefix + "3").className = 'inputTxt';
	document.getElementById(prefix + "4").className = 'inputTxt';
	
	document.getElementById(prefix + "5").className = 'inputRadio';
	document.getElementById(prefix + "6").className = 'inputRadio';
	
	document.getElementById(prefix + "7").className = 'inputRadio';
	document.getElementById(prefix + "8").className = 'inputRadio';
	
	var select = "inputTxtfocus";
	if(onfieldNo>4) select="inputRadiofocus";
	document.getElementById(prefix +onfieldNo.toString()).className= select;
	Data.setOnFieldNo(onfieldNo);
};

Display.changeField = function(direction)
{
	//First find which has the className with the show
	var NUMBER_FIELDS=Data.getNumberFields();
	//var onfield = Data.getOnField();
	var onfieldNo = 0;
	
	if(direction==Display.LEFT)Audio.playSoundLeft();
	if(direction==Display.RIGHT)Audio.playSoundRight();
	if(direction==Display.UP)Audio.playSoundUp();
	if(direction==Display.DOWN)Audio.playSoundDown();
	if(direction==Display.ENTER)Audio.playSoundEnter();

	
	for(var i=Data.getStartFieldNo();i<=NUMBER_FIELDS;i++)
	{
		var cname = document.getElementById("f" + i.toString()).className;
		if(cname=='inputTxtfocus' || cname=='inputRadiofocus')
		{
			onfieldNo = i;
		}
	}
	if(onfieldNo==0)onfiledNo=1;
	
	//If on field 1,2,3 pressing right works and adds1
	//If on field 2,3,4 pressing left works and adds1
	if(onfieldNo >=1 && onfieldNo <=4 )
	{
		if(direction == Display.RIGHT)onfieldNo++;
		if(direction == Display.LEFT)onfieldNo--;
		if(onfieldNo<1)onfieldNo=1;
		if(onfieldNo>4)onfieldNo=4;
	
		if(direction == Display.DOWN)onfieldNo=5;
		if(direction == Display.UP)onfieldNo=1;
	}
	else if(onfieldNo==5)
	{
		if(direction==Display.UP)onfieldNo=1;
		if(direction==Display.DOWN)onfieldNo=7;
		if(direction==Display.RIGHT && Display.getToggle('a3', 'a4')!=1)onfieldNo=6;
	}
	
	else if(onfieldNo==6)
	{
		if(direction==Display.UP)onfieldNo=1;
		if(direction==Display.DOWN)onfieldNo=7;
		if(direction==Display.LEFT)onfieldNo=5;
	}
	else if(onfieldNo==7)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.DOWN)onfieldNo=9;
		if(direction==Display.RIGHT)onfieldNo=8;
		if(direction==Display.DOWN && Display.getToggle('a3', 'a4')==1)onfieldNo=11;
		if(direction==Display.ENTER)Display.setToggle('f7', 'f8');
	}
	else if(onfieldNo==8)
	{
		if(direction==Display.UP)onfieldNo=5;
		if(direction==Display.DOWN)onfieldNo=10;
		if(direction==Display.LEFT)onfieldNo=7;
		if(direction==Display.DOWN && Display.getToggle('a3', 'a4')==1)onfieldNo=11;		
		if(direction==Display.ENTER)Display.setToggle('f7', 'f8');
	}
	
	else if(onfieldNo==9)
	{
		if(direction==Display.UP)onfieldNo=7;
		if(direction==Display.DOWN  && Main.SCREENMODE!=Main.SETTING)onfieldNo=11;
		if(direction==Display.RIGHT)onfieldNo=10;
		if(direction==Display.ENTER)Display.setToggle('f9', 'f10');
	}
	else if(onfieldNo==10)
	{
		if(direction==Display.UP)onfieldNo=8;
		if(direction==Display.DOWN && Main.SCREENMODE!=Main.SETTING)onfieldNo=11;
		if(direction==Display.LEFT)onfieldNo=9;
		
		if(direction==Display.ENTER)Display.setToggle('f9', 'f10');
	}
	
	
	else if(onfieldNo==11)
	{
		if(direction==Display.UP)onfieldNo=9;
		if(direction==Display.DOWN )onfieldNo=13;
		if(direction==Display.RIGHT)onfieldNo=12;
		if(direction==Display.UP && Display.getToggle('a3', 'a4')==1)onfieldNo=7;
		if(direction==Display.ENTER)Display.setToggle('f11', 'f12');
	}
	else if(onfieldNo==12)
	{
		if(direction==Display.UP)onfieldNo=10;
		if(direction==Display.DOWN)onfieldNo=13;
		if(direction==Display.LEFT)onfieldNo=11;
		if(direction==Display.UP && Display.getToggle('a3', 'a4')==1)onfieldNo=7;
		if(direction==Display.ENTER)Display.setToggle('f11', 'f12');
	}
	else if(onfieldNo==13)
	{
		if(direction==Display.UP)onfieldNo=11;
		if(direction==Display.LEFT || direction == Display.RIGHT)
		{
			Display.spinField('f13', Data.getBouquetDescriptionsPlusLast(), direction);
		}
	}
	
	
	Logger.log(Logger.DEBUG, "On Field No: " + onfieldNo);
	
	/**
	 * Code to switch the debug from right to left so you can partly
	 * see what you're doing in the debug build -------------------------
	 */
	if(onfieldNo ==3 || onfieldNo==4 || onfieldNo==6)
	{
		document.getElementById("debug").style.left="10px";
	}
	else 
	{
		document.getElementById("debug").style.left="440px";
	};
	/**
	 * ------------------------------------------------------------------
	 */
	
	for(var i=1;i<=NUMBER_FIELDS;i++)
	{
		suffix="Txt";
		if(document.getElementById("f" + i).className.indexOf('Radio')>0)suffix="Radio";
		
		document.getElementById("f" + i).className = 'input' + suffix;
		if(i==onfieldNo)document.getElementById("f" + i.toString()).className = 'input' + suffix +'focus';
	}
	Data.setOnField("f" + onfieldNo);
};

Display.getField = function(fieldName)
{
	var elem = document.getElementById(fieldName);
	return elem.innerHTML;
};

Display.setField = function(fieldName,value)
{
	var elem = document.getElementById(fieldName);
	widgetAPI.putInnerHTML(elem, value);
};

Display.setToggle = function(fieldName1,fieldName2)
{
	var elem1 = document.getElementById(fieldName1 +'val');
	var elem2 = document.getElementById(fieldName2 +'val');
	
	if(elem1.className=="radioSelected")
	{
		elem2.className="radioSelected";
		elem1.className="radio";
	}
	else
	{
		elem2.className="radio";
		elem1.className="radioSelected";
	}
};

Display.getToggle = function(fieldName1,fieldName2)
{
	Logger.logDebug("Getting Toggle for [" + fieldName1 + "]");
	var elem1 = document.getElementById(fieldName1 +'val');
	if(elem1.className=="radioSelected") return 1;
	else return 2;
};


Display.presetToggle = function(fieldName1,fieldName2,onfield)
{
	//Logger.log(Logger.DEBUG, "Preset Toggle: " + fieldName1 + " - " + fieldName2 + " - " + onfield);
	var elem1 = document.getElementById(fieldName1 +'val');
	var elem2 = document.getElementById(fieldName2 +'val');
	
	if(fieldName1==onfield)
	{
		elem1.className="radioSelected";
		elem2.className="radio";
	}
	if(fieldName2==onfield)
	{
		elem2.className="radioSelected";
		elem1.className="radio";
	}		
};

Display.initSpinField = function(fieldName, inlist,value)
{
	if(!inlist || inlist == null || inlist.length==0)
	{
		Logger.log(Logger.WARN, "No List provided for spinfield");
		return;
	}
	
	
	//Data.setStartBouquet(inlist[0]);
	for(var i=0;i<inlist.length;i++)
	{
		if(inlist[i]==value)
		{
			Display.spinnerIndex=i;
			Data.setStartBouquet(inlist[this.spinnerIndex]);
			Display.spinField(fieldName,inlist,Display.IGNORE);
			return;
		}
	}
};

Display.spinField = function(fieldName, inlist, direction)
{
	//0 - A
	//1 - B
	//2 - C
	if(!inlist)
	{
		return;
	}
	if(direction == Display.RIGHT)
	{
		this.spinnerIndex++;
		if(inlist.length==this.spinnerIndex)this.spinnerIndex=0;
	}
	else if (direction == Display.LEFT)
	{
		this.spinnerIndex--;
		if(this.spinnerIndex<0)this.spinnerIndex=inlist.length - 1;
	}
	Display.setField(fieldName, inlist[this.spinnerIndex]);
	Data.setStartBouquet(inlist[this.spinnerIndex]);
};

Display.getSpinFieldValue = function()
{
	if(this.spinnerIndex==0)
	{
		return "### Last Active Bouquet";
	}
	else
	{
		return Data.getBouquetDescription(this.spinnerIndex-1);	
	}
	
};

//Changes for updated video player

Display.setTotalTime = function(total)
{
	// Sets the total time in millsecs
    this.totalTime = total;
    console.log(total);
};

Display.setTime = function(time)
{
	time = time.millisecond;
    var timePercent = (100 * time) / this.totalTime;
    var timeElement = document.getElementById("timeInfo");
    var timeHTML = "";
    var timeHour = 0; var timeMinute = 0; var timeSecond = 0;
    var totalTimeHour = 0; var totalTimeMinute = 0; 
    //var totalTimesecond = 0;
    
    document.getElementById("progressBar").style.width = timePercent + "%";
    
    if(Main.playerObj.state == Main.playerObj.PLAYING)
    {
        totalTimeHour = Math.floor(this.totalTime/3600000);
        timeHour = Math.floor(time/3600000);
        
        totalTimeMinute = Math.floor((this.totalTime%3600000)/60000);
        timeMinute = Math.floor((time%3600000)/60000);
        
        totalTimeSecond = Math.floor((this.totalTime%60000)/1000);
        timeSecond = Math.floor((time%60000)/1000);
        
        timeHTML = timeHour + ":";
        
        if(timeMinute == 0)
            timeHTML += "00:";
        else if(timeMinute <10)
            timeHTML += "0" + timeMinute + ":";
        else
            timeHTML += timeMinute + ":";
            
        if(timeSecond == 0)
            timeHTML += "00/";
        else if(timeSecond <10)
            timeHTML += "0" + timeSecond + "/";
        else
            timeHTML += timeSecond + "/";
            
        //timeHTML = time + "/";
        timeHTML += totalTimeHour + ":";
        
        if(totalTimeMinute == 0)
            timeHTML += "00";
        else if(totalTimeMinute <10)
            timeHTML += "0" + totalTimeMinute;
        else
            timeHTML += totalTimeMinute;
            
        timeHTML += ":";
        if(totalTimeSecond == 0)
            timeHTML += "00";
        else if(totalTimeSecond <10)
            timeHTML += "0" + totalTimeSecond;
        else
            timeHTML += totalTimeSecond;
    }
    else
        timeHTML = "";     
    
    widgetAPI.putInnerHTML(timeElement, timeHTML);
    
};

Display.status = function(status)
{
   // widgetAPI.putInnerHTML(this.statusDiv, status);
};


Display.hide = function(id,zIndex)
{
	document.getElementById(id).style.display="none";
    if(zIndex!=null && zIndex>=0)document.getElementById(id).style.zIndex=zIndex;
};

Display.show = function (id,zIndex)
{
	document.getElementById(id).style.display="block";
    if(zIndex!=null && zIndex>=0)document.getElementById(id).style.zIndex=zIndex;
};

Display.hideMain = function() 
{ 
    document.getElementById("main").style.display="none";
    document.getElementById("main").style.zIndex="300";
}; 
 
 
Display.showMain = function() 
{ 
    document.getElementById("main").style.display="block";
    document.getElementById("main").style.zIndex="410"; 
}; 


Display.hidePicons = function()
{
//hide now text
	document.getElementById("nowtext").style.display="none";
};

Display.showPicons = function()
{
//Show now text
	document.getElementById("nowtext").style.display="block";
};


Display.showMute = function()
{
	document.getElementById("muteoff").style.display="none";
	document.getElementById("muteon").style.display="block";
};

Display.muteOff= function()
{
	document.getElementById("muteon").style.display="none";
	document.getElementById("muteoff").style.display="block";
	Main.callFunctionWithDelay(1000, Display.hideMute);
};

Display.hideMute = function()
{
	document.getElementById("muteon").style.display="none";
	document.getElementById("muteoff").style.display="none";
};

Display.hideVolume = function()
{
	var now = new Date();
	curtime = now.getTime();
	var diff = curtime-timeOnScreen;
	if(diff>leaveOnScreen)
	{
		document.getElementById("volumeSlider").style.display="none";
		document.getElementById("volumeSliderVal").style.display="none";
		document.getElementById("muteoff").style.display="none";
	}
};

Display.showVolume = function()
{
	document.getElementById("muteon").style.display="none";
	document.getElementById("muteoff").style.display="block";
	document.getElementById("volumeSlider").style.display="block";
	var vol = Audio.getVolume();
	var topBase = 97;
	vol = vol * 2;
	var height = vol;;
	var top = topBase + (200-vol);
	Logger.log(Logger.INFO,"Volume [" + vol + "] top [" + top + "]");
	document.getElementById("volumeSliderVal").style.top=top+"px";
	document.getElementById("volumeSliderVal").style.height=height+"px";
	document.getElementById("volumeSliderVal").style.display="block";
	var d = new Date();
	timeOnScreen = d.getTime();
	Main.callFunctionWithDelay(leaveOnScreen+500, Display.hideVolume);
};



