var Server =
{
    /* Callback function to be set by client */
    dataReceivedCallback : null,
    descReceivedCallback : null,
    
    XHRObj : null,
    CheckXHRObj : null,
    DescXHRObj: null,
    NowXHRObj: null,
    NextXHRObj: null,
    statXHRObj: null,
    zapXHRObj: null,
    sbXHRObj: null,
    
    url : "/web/getallservices",
    descUrl : "/web/epgservice?sRef=",
    locUrl: "/web/getlocations",
    moviesUrl: "/web/movielist?dirname=",
    configPath: "XML/settings.xml",
    checkPath: "/web/servicelistplayable?sRef=",
  	zapPath: "/web/zap?sRef=",
  	standbyUrl: "/web/powerstate?newstate=",
};

Server.standby= function(deep)
{
	var state=5;
	if(deep)state=1;
	var url = "http://" + Data.getIPAddress() + Server.standbyUrl + state.toString();
	Logger.logDebug("Standby URL [" + url + "]");
	if(deep==true)
	Logger.log(Logger.INFO,"Setting standby to: " + state);
	if (Server.sbXHRObj== null)
    {
        Server.sbXHRObj = new XMLHttpRequest();
    }
    if (Server.sbXHRObj)
    {
    	Server.sbXHRObj.open("GET", url, false);
        
    	try
    	{
    		Server.sbXHRObj.send(null);
    	}
    	catch(err)
    	{
    		Logger.log(Logger.ERROR, "ERROR!!! " + err.message + " ---- name --- " + err.name);
    		//Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
    		//Main.setScreenMode(Main.ERROR);
    		return;
    	}
        if (Server.sbXHRObj.status != 200)
        {
        	Logger.log(Logger.ERROR,"ERROR!!! Status code is not 200");
        	//Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
        	//Main.setScreenMode(Main.ERROR);
    		return;
        }
        else
        {
        	Logger.log(Logger.INFO,"Successfully Issued power call: " + state);
        }

    
    }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR");
    } 
};

Server.init = function()
{
    var success = true;
    if (this.XHRObj)
    {
        this.XHRObj.destroy();  // Save memory
        this.XHRObj = null;
    }
    
    return success;
};

Server.zapToChannel= function(sref)
{
	if(Main.RECORDINGS_LIST==true)return;
	//sref = sref.replace(/\s/g,"%20");
	var url = "http://" + Data.getIPAddress() + Server.zapPath + sref;
	Logger.log(Logger.INFO,"Zapping to: " + sref);
	if (Server.zapXHRObj== null)
    {
        Server.zapXHRObj = new XMLHttpRequest();
    }
    if (Server.zapXHRObj)
    {
    	Server.zapXHRObj.open("GET", url, false);
        
    	try
    	{
    		Server.zapXHRObj.send(null);
    	}
    	catch(err)
    	{
    		Logger.log(Logger.ERROR, "ERROR!!! " + err.message + " ---- name --- " + err.name);
    		Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
    		Main.setScreenMode(Main.ERROR);
    		return;
    	}
        if (Server.zapXHRObj.status != 200)
        {
        	Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
        	Main.setScreenMode(Main.ERROR);
    		return;
        }
        else
        {
        	Logger.log(Logger.INFO,"Successfully Zapped to channel: " + sref);
        }

    
    }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR");
    } 
};



Server.channelStatusReceivedCallback = function()
{
	Logger.log(Logger.WARN, "Channel Status done callback: " + Server.CheckXHRObj.status);
};

Server.updatePlayableChannels = function()
{
	Logger.logDebug("Update Playable Channels");
	if(Main.RECORDINGS_LIST==true)return;
	if (Server.CheckXHRObj.status != 200)
    {
    	Logger.log(Logger.WARN, "Unable to check channel status: " + Server.CheckXHRObj.status);
        //Display.status("XML Server Error " + Server.XHRObj.status);
    }
    else
    {
    	Logger.log(Logger.DEBUG, "RESPXML: " + Server.CheckXHRObj.responseXML);
    	if(Server.CheckXHRObj == null || !Server.CheckXHRObj.responseXML)
    	{
    		Logger.log(Logger.WARN, "Error Getting Channel Status");
    		return;
    	}
    	
    	var xmlElement = Server.CheckXHRObj.responseXML.documentElement;
        
        if (!xmlElement)
        {
            Logger.log(Logger.WARN,"Failed to get valid XML for channel status");
        }
        else
        {
        	//Sort out the data
        	var playableList = xmlElement.getElementsByTagName("e2serviceplayable");
        	for (var index = 0; index < playableList.length; index++)
            {
        		var srefElement = playableList[index].getElementsByTagName("e2servicereference")[0];
        		var isPlayableElem = playableList[index].getElementsByTagName("e2isplayable")[0];
        		Logger.log(Logger.DEBUG, "Elem: " + srefElement.firstChild.data + " playable: " +isPlayableElem.firstChild.data);
        		Data.PlayableSID[index] = srefElement.firstChild.data;
        		if(isPlayableElem.firstChild.data == 'True') Data.PlayableRes[index] = true;
        		else Data.PlayableRes[index] = false;
        		
        		
            }
        	
        	if (Server.channelStatusReceivedCallback)
            {
                Server.channelStatusReceivedCallback();    /* Notify all data is received and stored */
            }
        }
    }

};

Server.CheckChannelList = function(sref)
{
	if(Main.RECORDINGS_LIST==true)return;
	//sref = sref.replace(/\s/g,"%20");
	var url = "http://" + Data.getIPAddress() + Server.checkPath + sref;
	Logger.logDebug("Check Channel: " + url);
	if (Server.CheckXHRObj == null)
    {
        Server.CheckXHRObj = new XMLHttpRequest();
    }
    if (Server.CheckXHRObj)
    {
        Server.CheckXHRObj.onreadystatechange = function()
        {
        	//Logger.logDebug("readystate change: " + Server.XHRObj.readyState);
        	if (Server.CheckXHRObj.readyState == 4 && Server.CheckXHRObj.status==200)
            {
            	Logger.logDebug("UPDTE Playable channels");
                Server.updatePlayableChannels();                
            }
        };
        Server.CheckXHRObj.open("GET", url, true);
        Server.CheckXHRObj.send(null);
    }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR");
    } 
};

Server.fetchDescription = function( selectedVideo)
{
	if(Main.RECORDINGS_LIST == true)
	{
		Logger.log(Logger.DEBUG,"Skip EPG Retrieve in recordings view");
		return;
	}
	
	var nowUrl = "http://" + Data.getIPAddress() + "/web/epgservicenow?sRef=";
	var nextUrl = "http://" + Data.getIPAddress() + "/web/epgservicenext?sRef=";

	/** NOW **/
	if (Server.NowXHRObj== null)Server.NowXHRObj = new XMLHttpRequest();
	if (Server.NowXHRObj)
    {
        Server.NowXHRObj.onreadystatechange = function()
        {
            if (Server.NowXHRObj.readyState == 4)
            {
            	Server.getDynamicDescriptionNow();
            }
        };
        Server.NowXHRObj.open("GET", nowUrl + Data.getVideoID(selectedVideo)  , true);
        Server.NowXHRObj.send(null);
     }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR For Now Request");
    }

	/** NEXT **/
	if (Server.NextXHRObj== null)Server.NextXHRObj = new XMLHttpRequest();
	if (Server.NextXHRObj)
    {
        Server.NextXHRObj.onreadystatechange = function()
        {
            if (Server.NextXHRObj.readyState == 4)
            {
            	Server.getDynamicDescriptionNext();
            }
        };
        Server.NextXHRObj.open("GET", nextUrl + Data.getVideoID(selectedVideo)  , true);
        Server.NextXHRObj.send(null);
     }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR For Next Request");
    }
};

Server.checkStatusCode = function(url)
{
	
	surl = "http://" + Data.getIPAddress()  + url;
	
	if (this.statXHRObj == null)
    {
	    this.statXHRObj = new XMLHttpRequest();
    }
	
    if (Server.statXHRObj)
    {
    	try
    	{
    		Server.statXHRObj.open("GET", surl, false);
    		Server.statXHRObj.send(null);
    	}
    	catch(err)
    	{
    		Logger.log(Logger.ERROR, "ERROR!!! " + err.message + " ---- name --- " + err.name);
    		Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
    		Main.setScreenMode(Main.ERROR);
    		return -1;
    	}
        
        retCode = Server.statXHRObj.status;
        return retCode;
    }
    else
    {
    	return -1;
    }
};


Server.swapAlternativeId = function(inPos)
{
	if (this.XHRObj.status != 200)
    {
        Display.status("XML Server Error " + this.XHRObj.status);
    }
    else
    {
        var xmlElement = this.XHRObj.responseXML.documentElement;
        
        if (!xmlElement)
        {
            Logger.log(Logger.ERROR,"Failed to get valid XML");
        }
        else
        {
        
        	//Found the response
        	var idElement = xmlElement.getElementsByTagName("e2servicereference")[0];
        	if(idElement)
        	{
        		var ref = idElement.firstChild.data;
        		Data.allVideoIDs[inPos]=ref;
        	}
        }
    }
};

Server.fetchAlternateVideo = function(inID,inPos)
{
	
	surl = "http://" + Data.getIPAddress()  +"/web/getservices?sRef=" + inID;
	if (this.XHRObj == null)
    {
        this.XHRObj = new XMLHttpRequest();
    }
    if (this.XHRObj)
    {
        this.XHRObj.open("GET", surl, false);
        this.XHRObj.send(null);
        Server.swapAlternativeId(inPos);
    }
    else
    {
        Logger.log(Logger.FATAL, "Failed to create XHR");
    }
};

Server.fetchLocationList = function()
{
	sUrl = "http://" + Data.getIPAddress() + this.locUrl;
	if (this.XHRObj == null)
    {
        this.XHRObj = new XMLHttpRequest();
    }
    
    if (this.XHRObj)
    {
     	this.XHRObj.open("GET", sUrl, false);
    	//this.XHRObj.timeout = 20000;
    	//this.XHRObj.ontimeout = function () { Logger.logDebug("Timed out!!!"); };
        
    	try
    	{
    		this.XHRObj.send(null);
    	}
    	catch(err)
    	{
    		Logger.Log(Logger.ERROR,"Error fetching location list " + err.message + " ---- name --- " + err.name);
    		Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
    		Main.setScreenMode(Main.ERROR);
    		return;
    	}
        if (this.XHRObj.status != 200)
        {
        	Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
        	Main.setScreenMode(Main.ERROR);
    		return;
        }
        else
        {
        	Logger.log(Logger.INFO,"Creating Location List");
        	Server.createLocationList();
        	
	    	if (this.dataReceivedCallback)
	        {
	            this.dataReceivedCallback();    // Notify all data is received and stored 
	        }
        }
    }
    else
    {
    	Logger.log(Logger.FATAL, "Failed to create XHR");
    }
};

Server.fetchVideoList = function()
{
	Server.fetchVideoListWithUrl("http://" + Data.getIPAddress() + this.url);	
	//Server.fetchVideoListAsync("http://" + Data.getIPAddress() + this.url);	
};

Server.showTimeout = function()
{
	Logger.log(Logger.ERROR,"Timeout Error: " + err.message + " ---- name --- " + err.name);
	Display.setErrorDetails("I timed out trying to contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
	Main.setScreenMode(Main.ERROR);
};

/** Experimental async retreival of video list **/
Server.fetchVideoListAsync = function (surl)
{

	if (Server.XHRObj == null)
    {
		Server.XHRObj = new XMLHttpRequest();
    }
    
    if (Server.XHRObj)
    {
    	this.XHRObj.onreadystatechange = function()
        {
            if (Server.XHRObj.readyState == 4)
            {
            	if(Server.XHRObj.status==200)
            	{
        	        Server.createBouquetAndVideoList();
        	    	Data.scanForAlternatives();
        	    	Data.populateVideoListForDisplay(0);
            	}
            	else //(Server.XHRObj.status)!=200
            	{
            		Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
                	Main.setScreenMode(Main.ERROR);
            	}
            }
        };

    	Server.XHRObj.open("GET", surl, true);
    	Server.XHRObj.send(null);

    }
};


Server.fetchVideoListWithUrl = function(surl)
{

    
	if (Server.XHRObj == null)
    {
		Server.XHRObj = new XMLHttpRequest();
    }
    
    if (Server.XHRObj)
    {
    	Server.XHRObj.open("GET", surl, false);
        
    	try
    	{
    		Server.XHRObj.send(null);
    	}
    	catch(err)
    	{
    		Logger.log(Logger.ERROR, "ERROR!!! " + err.message + " ---- name --- " + err.name);
    		Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
    		Main.setScreenMode(Main.ERROR);
    		return;
    	}
        if (Server.XHRObj.status != 200)
        {
        	Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
        	Main.setScreenMode(Main.ERROR);
    		return;
        	//Display.status("XML Server Error " + this.XHRObj.status);
        }
        else
        {
	        Server.createBouquetAndVideoList();
	    	Data.scanForAlternatives();
	    	Data.populateVideoListForDisplay(0);
        }
    }
    else
    {
    	Logger.log(Logger.FATAL, "Failed to create XHR");
    }
};

Server.getDynamicDescriptionNow = function()
{
	//if(Main.RECORDINGS_LIST==true)return;
	
	if (Server.NowXHRObj.status != 200)
	{
		Logger.log(Logger.ERROR, "Error Getting EPG Data, Status: " + Server.NowXHRObj.status);
		Display.status("XML Server Error " + Server.NowXHRObj.status);
		return;
	}
	else
	{
		if(Server.NowXHRObj == null || !Server.NowXHRObj.responseXML)
		{
			Logger.log(Logger.ERROR, "Error Getting NOW EPG Data");
			return;
		}
	}
		
	var xmlElement = Server.NowXHRObj.responseXML.documentElement;
	
	if (!xmlElement)
	{
	    Logger.log(Logger.FATAL,"Failed to get valid XML");
	}
	else
	{
		var titleTxt = "";
		var descTxt = "";
		var titleElement = xmlElement.getElementsByTagName("e2eventtitle")[0];
		var descElement = xmlElement.getElementsByTagName("e2eventdescriptionextended")[0];
		var start = xmlElement.getElementsByTagName("e2eventstart")[0];
		var duration= xmlElement.getElementsByTagName("e2eventduration")[0];
		var end = null;
		if(start!=null)end = parseInt(start.firstChild.data) + parseInt(duration.firstChild.data);
		var startStr = "";
		if(start!=null)startStr= Data.timeToHuman(start.firstChild.data);
		var endStr = "";
		if(end!=null)endStr= Data.timeToHuman(end);
		if(titleElement!=null)titleTxt = titleElement.firstChild.data;
		//Logger.log(Logger.DEBUG, "EPG TITLE: " + titleTxt);
		if(descElement==null)descTxt="";
		else
		{
			if(descElement.firstChild && descElement.firstChild.data)
			{
				descTxt=descElement.firstChild.data;
			}
		}
		
		if(titleTxt==null)titleTxt = "Unable to retrieve EPG for Channel";
		//if(descElement == null)descTxt = "";
		
		Data.setDynamicDescription(descTxt);
		Data.setNowTime(startStr + " - " + endStr);
		Data.setNowTitle(titleTxt);
		Display.setNow(titleTxt, startStr + " - " + endStr, descTxt);
	}
};


Server.getDynamicDescriptionNext = function()
{
	//if(Main.RECORDINGS_LIST==true)return;
	
	if (Server.NextXHRObj.status != 200)
	{
		Logger.log(Logger.ERROR, "Error Getting EPG Data, Status: " + Server.DescNextObj.status);
		Display.status("XML Server Error " + Server.NextXHRObj.status);
	}
	else
	{
		if(Server.NextXHRObj == null || !Server.NextXHRObj.responseXML)
		{
			Logger.log(Logger.ERROR, "Error Getting NEXT EPG Data");
			return;
		}
	}
		
	var xmlElement = Server.NextXHRObj.responseXML.documentElement;
	
	if (!xmlElement)
	{
	    Logger.log(Logger.FATAL,"Failed to get valid XML");
	}
	else
	{
		var titleTxt = "";
		var descTxt = "";
		var titleElement = xmlElement.getElementsByTagName("e2eventtitle")[0];
		var descElement = xmlElement.getElementsByTagName("e2eventdescriptionextended")[0];
		var start = xmlElement.getElementsByTagName("e2eventstart")[0];
		var duration= xmlElement.getElementsByTagName("e2eventduration")[0];
		var end = null;
		if(start!=null)end = parseInt(start.firstChild.data) + parseInt(duration.firstChild.data);
		var startStr = "";
		if(start!=null)startStr= Data.timeToHuman(start.firstChild.data);
		var endStr = "";
		if(end!=null)endStr= Data.timeToHuman(end);
		if(titleElement!=null)titleTxt = titleElement.firstChild.data;
		//Logger.log(Logger.DEBUG, "EPG TITLE: " + titleTxt);
		if(descElement==null)descTxt="";
		else
		{
			if(descElement.firstChild && descElement.firstChild.data)
			{
				descTxt=descElement.firstChild.data;
			}
		}
		
		if(titleTxt==null)titleTxt = "Unable to retrieve EPG for Channel";
		//if(descElement == null)descTxt = "";
		
		Data.setNextDescription(descTxt);
    	Data.setNextTime(startStr + " - " + endStr );
    	Data.setNextTitle(titleTxt);
    	Display.setNext(titleTxt, startStr + " - " + endStr, descTxt);	
	}
};

Server.createBouquetAndVideoList = function()
{
	if (Server.XHRObj.status != 200)
    {
        Display.status("XML Server Error " + this.XHRObj.status);
    }
    else
    {
    	if(Server.XHRObj==null || !Server.XHRObj.responseXML)
    	{
    		Logger.log(Logger.FATAL,"no response from E2 box");
    		Display.setErrorDetails("I did not get a response from your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","No response");
    		Main.setScreenMode(Main.ERROR);
    	}
        var xmlElement = Server.XHRObj.responseXML.documentElement;
        
        if (!xmlElement)
        {
            Logger.log(Logger.ERROR,"Failed to get valid XML");
        }
        else
        {
        	var bouquets = xmlElement.getElementsByTagName("e2bouquet");
        	//for each bouquet
        	var bouquetNames = [ ];
        	var bouquetIDs   = [ ];
        	var videoNames = [ ];
            var videoURLs = [ ];
            var videoDescriptions = [ ];
            var videoIDs = [ ];
            var videoBouquetIDs = [ ];
            
        	var onCount = 0;
        	var bouquetCount = 0;
            for (var index = 0; index < bouquets.length; index++)
            {
            	//Within the bouquet get the service name - which is the name
            	//of the bouquet
            	var bouquetNameElem = bouquets[index].getElementsByTagName('e2servicename')[0];
            	var bouquetIdElem   = bouquets[index].getElementsByTagName('e2servicereference')[0];
            	
            	//Now for each of the bouquets, find the videos.
            	var items = bouquets[index].getElementsByTagName("e2service");
            	
            	//bouquetNames[index]=bouquetNameElem.firstChild.data;
            	var onBouquetName = bouquetNameElem.firstChild.data;
            	var onBouquetId = bouquetIdElem.firstChild.data;
            	Logger.log(Logger.INFO,">> Found Bouquet");
            	Logger.log(Logger.DEBUG,"[" + index + "] Name [" + onBouquetName + "]");
            	//Logger.log(Logger.DEBUG,"[" + index + "] Name [" + onBouquetId + "]");            	
            	var foundVids = 0;
            	for (var vidindex = 0; vidindex < items.length; vidindex++)
                {
            		var titleElement = items[vidindex].getElementsByTagName("e2servicename")[0];
            		var descriptionElement = items[vidindex].getElementsByTagName("e2servicename")[0];
            		var linkElement = items[vidindex].getElementsByTagName("e2servicereference")[0];
 
            		//Is it a category?
            		var isCategory = false;
            		var isSeparator = false;
                    
            		if (linkElement.firstChild.data.indexOf("1:64:")==0)isCategory = true;
                    if (linkElement.firstChild.data.indexOf("1:519:")==0)isSeparator = true;

                    
                    //If found the elements, and its not a category
                    if (titleElement && descriptionElement && linkElement && !isCategory &&!isSeparator)
                    {
                    	foundVids++;
                    	//If remove numbers from the channel list
                        if(Data.getRemoveNumbers()=='Y')
                        {
                        	var title = titleElement.firstChild.data;
                        	var pos = title.indexOf("- ");
                        	
                        	if(pos>0)title = title.substring(pos+2);
                        	videoNames[onCount] = title;
                        }
                        else
                        {
                        	videoNames[onCount] = titleElement.firstChild.data;
                        }
                        
                        var port = "*PORT*";

                        //Port will be replaced at play time
                        videoURLs[onCount] = "http://" + Data.getIPAddress()  +":" + port + "/" + encodeURIComponent(linkElement.firstChild.data);
                        videoIDs[onCount] = linkElement.firstChild.data;
                        videoDescriptions[onCount] = descriptionElement.firstChild.data;
                        videoBouquetIDs[onCount] = bouquetCount;
                        onCount++;
                    };//End if found elemens and not a category
                };//end for items
                Logger.log(Logger.DEBUG,"Number Channels: " + foundVids);
                if(foundVids>0)
                {
                	bouquetNames[bouquetCount]=onBouquetName;
                	bouquetIDs[bouquetCount]  = onBouquetId;
                	bouquetCount++;
                }
            }//end for bouquets
            
            Data.setAllVideoNames(videoNames);
            Data.setAllVideoURLS(videoURLs);
            Data.setAllVideoDescriptions(videoDescriptions);
            Data.setAllVideoIDs(videoIDs);
            Data.setAllVideoBouquetNos(videoBouquetIDs);
            Data.setBouquetDescriptions(bouquetNames);
            Data.setBouquetIDs(bouquetIDs);
        };//end else found a valid elem
    };//end else did return http200
};

Server.createLocationAndMovieList = function()
{
	sUrl = "http://" + Data.getIPAddress() + this.locUrl;
	if (this.XHRObj == null)
	{
		this.XHRObj = new XMLHttpRequest();
	}

	if (this.XHRObj)
	{
		this.XHRObj.open("GET", sUrl, false);

		try
		{
			this.XHRObj.send(null);
		}
		catch(err)
		{
			Logger.log(Logger.ERROR,"Error creating location/movie list " + err.message + " ---- name --- " + err.name);
			Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
			Main.setScreenMode(Main.ERROR);
			return;
		}
		if (this.XHRObj.status != 200)
		{
			Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
			Main.setScreenMode(Main.ERROR);
			return;
		}
		else
		{
			var xmlElement = this.XHRObj.responseXML.documentElement;
			if (!xmlElement)
			{
				Logger.log(Logger.ERROR,"Failed to get valid XML");
			}
			else
			{
				var bouquets = xmlElement.getElementsByTagName("e2location");
				//for each bouquet
				var bouquetNames = [ ];
				var videoNames = [ ];
				var videoURLs = [ ];
				var videoDescriptions = [ ];
				var videoIDs = [ ];
				var videoBouquetIDs = [ ];

				var onCount = 0;
				for (var index = 0; index < bouquets.length; index++)
				{
					//Within the bouquet get the service name - which is the name
					//of the bouquet
					bouquetNames[index]=bouquets[index].firstChild.data;
					//Logger.log(Logger.INFO,"Found Location [" + bouquetNames[index] + "]");
				}
				Logger.log(Logger.INFO,"Found " + bouquetNames.length + " locations");

				for (var index = 0; index < bouquetNames.length; index++)
				{
					Logger.log(Logger.INFO,"Querying files in [" + bouquetNames[index] + "]");
					//Now for each of the bouquets, find the movies

					sUrl2 = "http://" + Data.getIPAddress() + Server.moviesUrl + encodeURIComponent(bouquetNames[index]);
					if (this.XHRObj == null)
					{
						this.XHRObj = new XMLHttpRequest();
					}

					if (this.XHRObj)
					{
						this.XHRObj.open("GET", sUrl2, false);
						try
						{
							this.XHRObj.send(null);
						}
						catch(err)
						{
							Logger.log(Logger.ERROR,"ERROR!!! " + err.message + " ---- name --- " + err.name);
							Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry",err.message);
							Main.setScreenMode(Main.ERROR);
							return;
						}
						if (this.XHRObj.status != 200)
						{
							Display.setErrorDetails("I can't contact your Enigma 2 Set top box<br><br>Please press the <font color='red'>red</font> button to clear the settings and start again, or the <font color='green'>green</font> button to retry","HTTP Response Code: " + this.XHRObj.status);
							Main.setScreenMode(Main.ERROR);
							return;
							//Display.status("XML Server Error " + this.XHRObj.status);
						}
						else
						{
							var xmlElement = this.XHRObj.responseXML.documentElement;
							var items = xmlElement.getElementsByTagName("e2movie");
							Logger.log(Logger.DEBUG, "Found [" + items.length + "] recordings in locaion");
							
							//What if there are zero videos in the location
							
							for (var vidindex = 0; vidindex < items.length; vidindex++)
							{    
								var titleElement = items[vidindex].getElementsByTagName("e2title")[0];
								var descriptionElement = items[vidindex].getElementsByTagName("e2description")[0];
								var linkElement = items[vidindex].getElementsByTagName("e2filename")[0];
								
								//Is it a category?
								var isCategory = false;
								if (linkElement.firstChild.data.indexOf("1:64:0:0:0:0:0:0:0:0")>=0)isCategory = true;

								
								//If found the elements, and its not a category
								if (titleElement && descriptionElement && linkElement && !isCategory)
								{
									//If remove numbers from the channel list
									if(Data.getRemoveNumbers()=='Y')
									{
										var title = titleElement.firstChild.data;
										var pos = title.indexOf("- ");
										if(pos>0)title = title.substring(pos+2);
										videoNames[onCount] = title;
									}
									else
									{
										if(titleElement.firstChild != null)
										{
											videoNames[onCount] = titleElement.firstChild.data;
										}
										else
										{
											var posfn = linkElement.firstChild.data.lastIndexOf("/");
											var fn = linkElement.firstChild.data.substring(posfn+1);
											videoNames[onCount]=fn;
										}	
									}

									//var port = "*PORT*";

									//Port will be replaced at play time
									videoURLs[onCount] = "http://" + Data.getIPAddress()  +":" + 80 + "/file?file=" + encodeURIComponent(linkElement.firstChild.data);
									videoIDs[onCount] = linkElement.firstChild.data;
									if(descriptionElement.firstChild!=null)
									{
										videoDescriptions[onCount] = descriptionElement.firstChild.data;
									}
									else
									{
										videoDescriptions[onCount] = " ";
									}
									videoBouquetIDs[onCount] = index;
									onCount++;
								};//End if found elemens and not a category
							};//end for items
						}
					}//end for bouquets

					Data.setAllVideoNames(videoNames);
					Data.setAllVideoURLS(videoURLs);
					Data.setAllVideoDescriptions(videoDescriptions);
					Data.setAllVideoIDs(videoIDs);
					Data.setAllVideoBouquetNos(videoBouquetIDs);
					Data.setBouquetDescriptions(bouquetNames);
				}//end else found a valid elem



				if (this.dataReceivedCallback)
				{
					this.dataReceivedCallback();    // Notify all data is received and stored 
				}
			}
		}
	}
	else
	{
		Logger.log(Logger.FATAL, "Failed to create XHR");
	}
};


Server.createVideoList = function()
{
    if (this.XHRObj.status != 200)
    {
        Display.status("XML Server Error " + this.XHRObj.status);
    }
    else
    {
        var xmlElement = this.XHRObj.responseXML.documentElement;
        
        if (!xmlElement)
        {
            Logger.log(Logger.ERROR,"Failed to get valid XML");
        }
        else
        {
            // Parse RSS
            // Get all "item" elements
            var items = xmlElement.getElementsByTagName("e2service");
            
            var videoNames = [ ];
            var videoURLs = [ ];
            var videoDescriptions = [ ];
            var videoIDs = [ ];
            
            var onCount = 0;
            for (var index = 0; index < items.length; index++)
            {
                var titleElement = items[index].getElementsByTagName("e2servicename")[0];
                var descriptionElement = items[index].getElementsByTagName("e2servicename")[0];
                var linkElement = items[index].getElementsByTagName("e2servicereference")[0];
 
                var isCategory = false;
                
                if (linkElement.firstChild.data.indexOf("::")>0)isCategory = true;
                if (titleElement && descriptionElement && linkElement && !isCategory)
                {
                    if(Data.getRemoveNumbers()=='Y')
                    {
                    	var title = titleElement.firstChild.data;
                    	var pos = title.indexOf("- ");
                    	if(pos>0)title = title.substring(pos+2);
                    	videoNames[onCount] = title;
                    }
                    else
                    {
                    	videoNames[onCount] = titleElement.firstChild.data;
                        	
                    }
                    
                    var port = 0;
                    if(Main.STREAMMODE==Main.TRANSCODE)
                    {
                    	port = Data.getTranscodePort();
                    }
                    else
                    {
                    	port = Data.getStreamPort();
                    }
                    port = "*PORT*";
                    
                    videoURLs[onCount] = "http://" + Data.getIPAddress()  +":" + port + "/" + linkElement.firstChild.data;
                    videoIDs[onCount] = linkElement.firstChild.data;
                    videoDescriptions[onCount] = descriptionElement.firstChild.data;
                    onCount++;
                };
            }
        
            Data.setVideoNames(videoNames);
            Data.setVideoURLs(videoURLs);
            Data.setVideoDescriptions(videoDescriptions);
            Data.setVideoIDs(videoIDs);
            
            if (this.dataReceivedCallback)
            {
                this.dataReceivedCallback();    /* Notify all data is received and stored */
            }
        }
    }
};
