var LastChannel =
{
	filename			: curWidget.id + '/lastchannel.cache',
	version				: "v4.3.0",

	lastBouquetId		: "",
	lastChannelId		: "",
};

LastChannel.findLastBouquet = function()
{
	var i;
	for(i=0;i<Data.getBouquetIDs().length;i++)
	{
		Logger.logDebug("Checking [" + Data.getBouquetIDs()[i] + "] for match with [" + LastChannel.lastBouquetId + "]");
		if(Data.getBouquetIDs()[i] == LastChannel.lastBouquetId)
		{
			Logger.logDebug("Found match!");
			return i;
		}
	}
	//Can't find it, return -1 to ignore
	Logger.log(Logger.WARN,"Can't find last active bouquet");
	return -1;
};

LastChannel.findLastChannel = function()
{
	var i;
	for(i=0;i<Data.getAllVideoIDs().length;i++)
	{
		if(Data.getAllVideoIDs()[i] == LastChannel.lastChannelId)
		{
			return i;
		}
	}
	//Can't find it, return -1 to ignore
	return -1;
};

LastChannel.put = function(bouquetId,channelId)
{
	LastChannel.save(bouquetId, channelId);
};

LastChannel.save = function(lastBouquetId,lastChannelId)
{
	LastChannel.lastBouquetId=lastBouquetId;
	LastChannel.lastChannelId=lastChannelId;
	Logger.log(Logger.INFO, "Saving Last Channel Cache");
	Logger.log(Logger.DEBUG, "Bouquet [" + lastBouquetId + "]");
	Logger.log(Logger.DEBUG, "Channel [" + lastChannelId + "]");
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(this.filename, 'w');
	
	if(!fileObj)
	{
		var bValid = fileSystemObj.isValidCommonPath(curWidget.id); 
		if (!bValid) 
		{ 
	        fileSystemObj.createCommonDir(curWidget.id);    
		}
	}
	fileObj = fileSystemObj.openCommonFile(this.filename, 'w');
	fileObj.writeLine(Settings.version);
	fileObj.writeLine(lastBouquetId);
	fileObj.writeLine(lastChannelId);
	fileSystemObj.closeCommonFile(fileObj);
	
	Logger.log(Logger.INFO, "Saved Last Channel Cache");
};


LastChannel.clear = function()
{
	var fileSystemObj = new FileSystem();
	var bResult = fileSystemObj.deleteCommonFile(this.filename);
	Logger.log(Logger.WARN, "Cleared Last Channel Cache");
	return bResult;
};

LastChannel.load = function()
{
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(this.filename, 'r');
	
	if(!fileObj)
	{
		Logger.log(Logger.WARN,"Unable to open Last Channel Cache [" + this.filename + "]");
		return;
	}
	var vers = fileObj.readLine();
	if(vers!=LastChannel.version)
	{
		fileSystemObj.closeCommonFile(fileObj);
		LastChannel.clear();
		Logger.log(Logger.WARN,"Old cache file format - therefore cleared!");
		//return false;
	}
	
	var bouquetId = fileObj.readLine();
	var channelId = fileObj.readLine();
	
		
	Logger.log(Logger.INFO,"Loaded Channel Cache");
	Logger.logDebug("Bouquet Id:" + bouquetId);
	Logger.logDebug("Channel Id: " + channelId);
	
	LastChannel.lastBouquetId = bouquetId;
	LastChannel.lastChannelId = channelId;
	fileSystemObj.closeCommonFile(fileObj);
	
	return true;
};