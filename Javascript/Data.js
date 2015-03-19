var Data =
{
	videoNames 			: [ ],
    videoURLs  			: [ ],
    videoIDs   			: [ ],
    videoDescriptions 	: [ ],
    videoBouquetNos     : [ ],    
    
    allVideoNames 			: [ ],
    allVideoURLs  			: [ ],
    allVideoIDs   			: [ ],
    allVideoDescriptions 	: [ ],
    allVideoBouquetNos      : [ ],
    
    bouquetDescription  : [ ],
    bouquetIDs			: [ ],
    dynamicDescription 	: "UNSET",
    nextDescription     : "UNSET",
    nowTitle            : "UNSET",
    nowTime             : "UNSET",
    nextTitle           : "UNSET",
    nextTime            : "UNSET",
    ipAddress 			: "...",
    removeNumbers		: "N",
    streamport			: "8001",
	transcodeport		: "8002",
    streamMode			: 0,
    onBouquet			: 0,
    zap					: "N",
    playerName			: "Default",
    
    NUMBER_FIELDS		: 13,
    START_FIELD			: 1,
    onField				: 'f1',
    octet1				: '',
	octet2				: '',
	octet3				: '',
	octet4				: '',
	port				: '8001',
	startBouquet		: '',
	
	STREAM				: 0,
	TRANSCODE			: 1,
	
	PlayableSID			: [ ],
	PlayableRes			: [ ],
	playerList			: ["Default","Legacy"],
	onFieldNo			: 1,
	
	mtEnabled			: "N",
	mtBitrate			: "3000000",
	mtWidth				: "720",
	mtHeight			: "480",
	mtAspectRatio		: "2",
	mtInterlaced		: "0"
   
};

/* Settings */

Data.setOctet1 = function(inp){this.octet1=inp;};
Data.setOctet2 = function(inp){this.octet2=inp;};
Data.setOctet3 = function(inp){this.octet3=inp;};
Data.setOctet4 = function(inp){this.octet4=inp;};
Data.setPort = function(inp){this.port=inp;};
Data.setOnField = function(inp){this.onField = inp;};
Data.setZap = function(inp){this.zap = inp;};
Data.setPlayerName = function(inp){this.playerName = inp;};
Data.setMtEnabled = function(inp){Data.mtEnabled = inp;};
Data.setMtBitrate = function(inp){Data.mtBitrate = inp;};
Data.setMtWidth = function(inp){Data.mtWidth = inp;};
Data.setMtHeight = function(inp){Data.mtHeight = inp;};
Data.setMtAspectRatio = function(inp){Data.mtAspectRatio= inp;};
Data.setMtInterlaced = function(inp){Data.mtInterlaced = inp;};


Data.getMtEnabled = function(){return this.mtEnabled;};
Data.isMtEnabled = function(){if(this.mtEnabled=='Y')ret=true;else return false;};
Data.getMtBitrate = function(){return this.mtBitrate;};
Data.getMtWidth = function(){return this.mtWidth;};
Data.getMtHeight = function(){return this.mtHeight;};
Data.getMtAspectRatio = function(){return this.mtAspectRatio;};
Data.getMtInterlaced = function(){return this.mtInterlaced;};
Data.getPlayerName = function(){return this.playerName;};
Data.getZap = function(){return this.zap;};
Data.getOnField = function(){return this.onField;};
Data.getStartFieldNo = function(){return this.START_FIELD;};
Data.getNumberFields = function(){return this.NUMBER_FIELDS;};

Data.getStartBouquetForSettings = function()
{
	return this.startBouquet;
};

Data.getStartBouquet = function()
{
	var bouquet = this.startBouquet;
	
	if(this.startBouquet=="### Last Active Bouquet")
	{
		//Find the start bouquet number from the cache
		//Logger.log(Logger.WARN,"Starting Bouquet - Finding last active bouquet");
		var i = LastChannel.findLastBouquet();
		bouquet =  Data.bouquetDescription[i];
	}
	else
	{
		//Logger.log(Logger.WARN,"Starting Bouquet - Static");
	}
	//Logger.logDebug("Starting bouquet [" + bouquet + "]");
	return bouquet;

};

Data.setStartBouquet = function(sb)
{
	//Logger.log(Logger.INFO,"Seting start b: " + sb);
	//Logger.logDebug("caller is " + arguments.callee.caller.toString());  
	this.startBouquet = sb;
};

Data.setOnFieldNo = function(inFieldNo){Data.onFieldNo=inFieldNo;};
Data.getOnFieldNo = function(){return Data.onFieldNo;};

/* All video lists */
Data.setAllVideoNames = function(list){this.allVideoNames = list;};
Data.setAllVideoURLS = function(list){this.allVideoURLs = list;};
Data.setAllVideoIDs = function(list){this.allVideoIDs = list;};
Data.getAllVideoIDs = function(){return this.allVideoIDs;};

Data.setAllVideoID = function(id,index){this.allVideoIDs[index] = id;};

Data.setAllVideoDescriptions = function(list){this.allVideoDescriptions = list;};
Data.setAllVideoBouquetNos = function(list){this.allVideoBouquetNos = list;};


Data.scanForAlternatives = function()
{
		Logger.log(Logger.INFO,"Scanning for alternatives");
		var onId = "";
		for(var i=0;i<Data.getAllVideoIDs().length;i++)
		{
			onId = Data.getAllVideoIDs()[i];
			if(onId.indexOf("1:134:1:0:0:0:0:0:0:0")>=0)
			{
				Logger.log(Logger.DEBUG,"Found an alternative [" + i + "] ID [" + onId + "]");
				Server.fetchAlternateVideo(onId, i);
				Logger.log(Logger.DEBUG,"Switched id from [" + onId + "] to [" + Data.getAllVideoIDs()[i] + "]");
			}
		}
};

Data.timeToHuman = function(inTime)
{
    var theDate = new Date(inTime*1000);
    dateString = theDate.toGMTString();
	
    var hour = theDate.getHours();
    var minute  = ""; minute = theDate.getMinutes();
    var second  = theDate.getSeconds();
    
    if(hour.toString().length == 1) {
        hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        second = '0'+second;
    }   
    return hour + ":" + minute;
};

Data.populateVideoListForDisplay = function(bqId)
{
	Logger.logDebug("Populate Video List for Display");
	var lvideoNames = [ ];
	var lvideoUrls = [ ];
	var lvideoIDs = [ ];
	var lvideoDescs = [ ];
	var lvideoBids = [ ];
	
	//For the selected bouquet no, set the values from the all vids into the vid arrays
	//var onBid = this.getOnBouquet();
	var onCount = 0;
	
	for (var index = 0; index < this.allVideoBouquetNos.length; index++)
	{
		if(bqId==this.allVideoBouquetNos[index])
		{
			lvideoNames[onCount] = this.allVideoNames[index];
			lvideoUrls[onCount] = this.allVideoURLs[index];
			lvideoIDs[onCount] = this.allVideoIDs[index];
			lvideoDescs[onCount] = this.allVideoDescriptions[index];
			lvideoBids[onCount] = this.allVideoBouquetNos[index];
			onCount++;
		}
	}
	
	Data.setVideoNames(lvideoNames);
	Data.setVideoURLs(lvideoUrls);
	Data.setVideoIDs (lvideoIDs);
	Data.setVideoDescriptions(lvideoDescs);
	Data.setVideoBouquetNos(lvideoBids);
};

// --------------------------
Data.setBouquetDescriptions = function(list)
{
	this.bouquetDescription=list;
};

Data.getBouquetDescriptionsPlusLast = function()
{
	//var size = this.bouquetDescription.length+1;
	var list = [];
	list[0]="### Last Active Bouquet";
	var i=0;
	//for(i=0;i<Data.bou)
	//;
	for(i=0;i<Data.bouquetDescription.length;i++)
	{
		list[i+1] = Data.bouquetDescription[i];
	}
	return list;
};

Data.getBouquetDescriptions = function()
{
	return this.bouquetDescription;
};

Data.setBouquetIDs = function(list)
{
	this.bouquetIDs = list;
};

Data.getBouquetIDs = function()
{
	return this.bouquetIDs;
};

Data.getOnBouquet = function()
{
	return this.onBouquet;
};

Data.setOnBouquet = function (bid)
{
	
	LastChannel.put(Data.getBouquetId(bid), "");
	this.onBouquet = bid;
};

Data.getBouquetDescription = function(idx)
{
	return this.bouquetDescription[idx];
};

Data.getBouquetId = function(idx)
{
	Logger.log(Logger.DEBUG,"Geting bouquet ID for index: " + idx);
	Logger.log(Logger.DEBUG,this.bouquetIDs[idx]);
	return this.bouquetIDs[idx];
};

Data.getNumberOfBouquets = function()
{
	return this.bouquetDescription.length;
};

Data.getStreamMode = function()
{
	return this.streamMode;
};

Data.setStreamMode = function(inStreamMode)
{
	this.streamMode=inStreamMode;
};

Data.switchStreamMode = function()
{
	if(this.streamMode==0)this.streamMode=1;
	else this.streamMode = 0;
};

Data.getStreamModeDesc = function()
{
	if(this.streamMode ==1)return "Transcode";
	else return "Stream";
};

Data.getOppositeStreamModeDesc = function()
{
	if(this.streamMode ==1) return "Stream";
	else return "Transcode";
};

Data.setStreamPort = function(inStreamPort)
{
	this.streamport = inStreamPort;
};

Data.getStreamPort = function()
{
	return this.streamport;
};

Data.setTranscodePort = function(inTranscodePort)
{
	this.transcodeport = inTranscodePort;
};

Data.getTranscodePort = function()
{
	return this.transcodeport;
};

Data.setIPAddress = function(inIpAddress)
{
	this.ipAddress = inIpAddress;
};

Data.getIPAddress = function()
{
	return this.ipAddress;
};

Data.setRemoveNumbers = function(setting)
{
	this.removeNumbers = setting;
};

Data.getRemoveNumbers = function()
{
	return this.removeNumbers;
};

Data.setVideoNames = function(list)
{
    this.videoNames = list;
};

Data.setVideoBouquetNos = function(list)
{
	this.videoBouquetNos=list;
};

Data.setVideoIDs = function(list)
{
	this.videoIDs = list;
};

Data.setVideoURLs = function(list)
{
    this.videoURLs = list;
};

//description
Data.setVideoDescriptions = function(list)
{
    this.videoDescriptions = list;
};

Data.setDynamicDescription = function(desc)
{
	this.dynamicDescription = desc;
};

Data.setNextDescription = function(desc)
{
	this.nextDescription = desc;
};

Data.getNextDescription = function()
{
	return this.nextDescription;
};

//time
Data.setNextTime= function(desc)
{
	this.nextTime = desc;
};

Data.getNextTime= function()
{
	return this.nextTime;
};
Data.setNowTime= function(desc)
{
	this.nowTime = desc;
};
Data.getNowTime= function()
{
	return this.nowTime;
};

//title
Data.setNextTitle= function(desc)
{
	this.nextTitle = desc;
};

Data.getNextTitle= function()
{
	return this.nextTitle;
};
Data.setNowTitle= function(desc)
{
	this.nowTitle = desc;
};
Data.getNowTitle= function()
{
	return this.nowTitle;
};

Data.getVideoURL = function(index)
{
    var url = this.videoURLs[index];
    
    if (url)    // Check for undefined entry (outside of valid array)
    {
        return url;
    }
    else
    {
        return null;
    }
};

Data.getVideoID = function(index)
{
    var id = this.videoIDs[index];
    
    if (id)    // Check for undefined entry (outside of valid array)
    {
        return id;
    }
    else
    {
        return null;
    }
};

Data.getVideoCount = function()
{
    return this.videoURLs.length;
};

Data.getVideoNames = function()
{
    return this.videoNames;
};

Data.getVideoName = function(id)
{
	return this.videoNames[id];
};

Data.getVideoIDs = function()
{
	return this.videoIDs;
};

Data.getVideoDescription = function(index)
{
    var description = this.videoDescriptions[index];
    
    if (description)    // Check for undefined entry (outside of valid array)
    {
        return description;
    }
    else
    {
        return "No description";
    }
};

Data.getDynamicVideoDescription = function()
{
	return this.dynamicDescription;
};

Data.getBouquetIndexFromDescription = function(desc)
{
	for(var i=0;i<this.bouquetDescription.length;i++)
	{
		if(this.bouquetDescription[i]==desc) return i;
	}
	return 0;
};

Data.getPlayableForSid = function(sid)
{
	var i;
	for(i=0;i<Data.PlayableSID.length;i++)
	{
		if(Data.PlayableSID[i]==sid)
		{
			return Data.PlayableRes;
		}
	}
};
