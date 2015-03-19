var Logger =
{
		DEBUG: 0,
		INFO: 1,
		WARN: 2,
		ERROR: 3,
		FATAL: 4,
		
		numberLines: 33,
		lines: [28],
		onLine: 0
};

Logger.init = function()
{
	if(Main.DEBUG)document.getElementById("debug").style.display="block";
	else document.getElementById("debug").style.display="none";

		
	return true;
};

Logger.logDebug = function (message)
{
	Logger.log(Logger.DEBUG, message);
};
Logger.log = function(level,message)
{
	if(Main.DEBUG)
	{
		var levelStr = "DEBUG";
		if(level==1)levelStr = "INFO";
		else if(level==2)levelStr = "WARN";
		else if(level==3)levelStr = "ERROR";
		else if(level==4)levelStr = "FATAL";
		else levelStr = "DEBUG";
		
		var date = new Date();
		var n = date.getTime();

		
		message = n+"," + levelStr+", " + message;
		
		Logger.consoleLog(message);
		var uiMessage = "<span class='debug-" + levelStr + "'>" + message + "</span>";
		Logger.uiLog(uiMessage);
	}
};

Logger.logMessage = function(message)
{
	Logger.log(Logger.INFO,message);
};

Logger.uiLog = function(str)
{
	var debugElement = document.getElementById("debug");
	var lines = Logger.addToLines(str);
	widgetAPI.putInnerHTML(debugElement, lines);
};

Logger.consoleLog = function(str)
{
	alert(str);
};

Logger.addToLines = function(message)
{
	var i=0;
	if(Logger.onLine==Logger.numberLines)
	{
		//shuffle down array
		//and put in 9
		for(i=0;i<Logger.lines.length-1;i++)
		{
			Logger.lines[i] = Logger.lines[i+1];
		}
		Logger.lines[Logger.numberLines-1] = message;
	}
	else
	{
		Logger.lines[Logger.onLine]=message;
		Logger.onLine++;
	}
	
	return Logger.getLines();
};

Logger.getLines = function()
{
	var i=0;
	var returnText = "";
	for(i=0;i<Logger.lines.length;i++)
	{
		returnText = returnText + Logger.lines[i] + "<br>";
	}
	return returnText;
};