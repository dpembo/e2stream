var Settings =
{
	filename 			: curWidget.id + '/settings.config',
	version				: "v4.3.0"
};


Settings.save = function()
{
	Display.setScreenValuesToData();
	ParentalSettings.setData();
	
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
	fileObj.writeLine(Data.getIPAddress());
	fileObj.writeLine(Data.getStreamPort());
	fileObj.writeLine(Data.getTranscodePort());
	fileObj.writeLine(Data.getRemoveNumbers());
	fileObj.writeLine(Data.getStartBouquetForSettings());
	fileObj.writeLine(Data.getZap());
	fileObj.writeLine(Data.getPlayerName());
	fileObj.writeLine(ParentalSettings.p1Val);
	fileObj.writeLine(ParentalSettings.p2Val);
	fileObj.writeLine(ParentalSettings.p3Val);
	fileObj.writeLine(ParentalSettings.p4Val);
	
	fileObj.writeLine(ParentalSettings.lockSettingsVal);
	fileObj.writeLine(ParentalSettings.lockBouquetVal);
	
	fileObj.writeLine(Data.getMtEnabled());
	fileObj.writeLine(Data.getMtBitrate());
	fileObj.writeLine(Data.getMtWidth());
	fileObj.writeLine(Data.getMtHeight());
	fileObj.writeLine(Data.getMtAspectRatio());
	fileObj.writeLine(Data.getMtInterlaced());
	
	fileObj.writeLine(Data.getStreamMode().toString());
	
	fileSystemObj.closeCommonFile(fileObj);
	
	Logger.log(Logger.INFO, "Saved Settings");
	Logger.logDebug("IP:" + Data.getIPAddress());
	Logger.logDebug("Port: " + Data.getStreamPort());
	Logger.logDebug("Transcode Port: " + Data.getTranscodePort());
	Logger.logDebug("Remove Num Prefix: " + Data.getRemoveNumbers());
	Logger.logDebug("Starting Bouquet: " + Data.getStartBouquet());
	Logger.logDebug("Zap: " + Data.getZap());
	Logger.logDebug("Player: " + Data.getPlayerName());
	Logger.logDebug("PC/lockSettings: " + ParentalSettings.lockSettingsVal);
	Logger.logDebug("PC/Lock Bouquet: " + ParentalSettings.lockBouquetVal);
	
	Logger.logDebug("Multi-transcode Enabled: " + Data.getMtEnabled());
	Logger.logDebug("MT/Bit rate: " + Data.getMtBitrate());
	Logger.logDebug("MT/Width   : " + Data.getMtWidth());
	Logger.logDebug("MT/Height  : " + Data.getMtHeight());
	Logger.logDebug("MT/Aspect  : " + Data.getMtAspectRatio());
	Logger.logDebug("MT/Intrlcd : " + Data.getMtInterlaced());
	Logger.logDebug("Stream Mode: [" + Data.getStreamMode() + "] " +Data.getStreamModeDesc());
};

Settings.clear = function()
{
	var fileSystemObj = new FileSystem();
	var bResult = fileSystemObj.deleteCommonFile(this.filename);
	Logger.log(Logger.WARN, "Cleared Settings");
	return bResult;
};

Settings.load = function()
{
	var fileSystemObj = new FileSystem();
	var fileObj = fileSystemObj.openCommonFile(this.filename, 'r');
	
	if(!fileObj)
	{
		Logger.log(Logger.WARN,"Unable to open settings file [" + this.filename + "]");
		return false;
	}
	var vers = fileObj.readLine();
	if(vers!=Settings.version)
	{
		fileSystemObj.closeCommonFile(fileObj);
		Settings.clear();
		Logger.log(Logger.WARN,"Old settings file - please set settings again!");
		return false;
	}
	
	var ip = fileObj.readLine();
	var port = fileObj.readLine();
	var tport = fileObj.readLine();
	var remNum = fileObj.readLine();
	var startb = fileObj.readLine();
	var zapm = fileObj.readLine();
	var playerNme = fileObj.readLine();
	var p1 = fileObj.readLine();
	var p2 = fileObj.readLine();
	var p3 = fileObj.readLine();
	var p4 = fileObj.readLine();
	var sLock = fileObj.readLine();
	var bLock = fileObj.readLine();

	var mtEnabled = fileObj.readLine();
	var mtBr = fileObj.readLine();
	var mtW = fileObj.readLine();;
	var mtH = fileObj.readLine();
	var mtAR = fileObj.readLine();;
	var mtIn = fileObj.readLine();
	var streamMode = fileObj.readLine();
	
	
	Data.setStreamMode(0);
	if(streamMode==null)Data.setStreamMode(0);
	if(streamMode=='0')Data.setStreamMode(0);
	else Data.setStreamMode(1);
	
	if(mtEnabled==null)mtEnabled="N";
	if(zapm==null)zapm="N";
	if(playerNme==null)playerNme="Default";
	
	if(sLock==null)slock="N";
	if(bLock==null)bLock="N";
	
	if(p1==null)p1=" ";
	if(p2==null)p2=" ";
	if(p3==null)p3=" ";
	if(p4==null)p4=" ";
	
	if(mtBr==null)mtBr="3000000";
	if(mtW==null)mtW="720";
	if(mtH==null)mtH="480";
	if(mtAR==null)mtAR="2";
	if(mtIn==null)mtIn="0";
	
	Logger.log(Logger.INFO,"Loaded Settings");
	Logger.logDebug("IP:" + ip);
	Logger.logDebug("Port: " + port);
	Logger.logDebug("Transcode Port: " + tport);
	Logger.logDebug("Remove Num Prefix: " + remNum);
	Logger.logDebug("Starting Bouqeut: " + startb);
	Logger.logDebug("ZapMode: " + zapm);
	Logger.logDebug("Player: " + playerNme);
	Logger.logDebug("PC/Settings Lock: " + sLock);
	Logger.logDebug("PC/Bouquet Lock : " + bLock);

	Logger.logDebug("Multi-transcode Enabled: " + mtEnabled);
	Logger.logDebug("MT/Bit rate: " + mtBr);
	Logger.logDebug("MT/Width   : " + mtW);
	Logger.logDebug("MT/Height  : " + mtH);
	Logger.logDebug("MT/Aspect  : " + mtAR);
	Logger.logDebug("MT/Intrlcd : " + mtIn);
	
	Logger.logDebug("Stream Mode: [" + streamMode + "] " + Data.getStreamModeDesc());
	
	Data.setIPAddress(ip);
	Data.setPort(port);
	Data.setTranscodePort(tport);
	Data.setRemoveNumbers(remNum);
	Data.setStartBouquet(startb);
	Data.setZap(zapm);
	Data.setPlayerName(playerNme);
	

	ParentalSettings.p1Val = p1;
	ParentalSettings.p2Val = p2;
	ParentalSettings.p3Val = p3;
	ParentalSettings.p4Val = p4;

	ParentalSettings.lockBouquetVal = bLock;
	ParentalSettings.lockSettingsVal = sLock;
	
	Data.setMtEnabled(mtEnabled);
	Data.setMtBitrate(mtBr);
	Data.setMtWidth(mtW);
	Data.setMtHeight(mtH);
	Data.setMtAspectRatio(mtAR);
	Data.setMtInterlaced(mtIn);
	/*
	Logger.logDebug("Creating Player Instance");
	
	if(Data.getPlayerName()=="Legacy"){Main.playerObj = PlayerLegacy.instance();}
	else {Main.playerObj = Player.instance();};
	Logger.logDebug("Using Player Implementation: " + Main.playerObj.name() );
*/
	
	fileSystemObj.closeCommonFile(fileObj);
	
	Display.setSettingsScreenValues();
	
	return true;
};