var Picon =
{
    UNSET: -1,
	NON: 0,
    SNAME: 1,
    SID: 2,
	
    type: -1,
    piconUrl: "/picon",
    prevType: -1
    
    
};

/**
 * Gets the picon filename
 */
Picon.getFileName =function(serviceId,serviceName)
{
	if(Picon.type == Picon.NON) return "Images/noicon.png";
	//if(Picon.type == Picon.SNAME && serviceName==null)return"Images/noicon.png";
	//if(Picon.type == Picon.SID && serviceId==null)return"Images/noicon.png";
	
	sidFile = serviceId.replace(/\:/g,"_");
    sidFile = sidFile.replace(/\s/g,"");
	sidFile = "/picon/" + sidFile.substring(0, sidFile.length-1) + ".png";
    sidFile = "http://" + Data.getIPAddress() + sidFile ;
    /*
	snameFile = serviceName.replace(/\s/g,"");
	snameFile = snameFile.replace(/\./g,"");
	snameFile = snameFile.replace(/\+/g,"plus");
	snameFile = snameFile.replace(/\&/g,"and");
	
	snameFile = snameFile.toLowerCase();
	*/
    snameFile = Picon.processChannelName(serviceName);
    
	snameFile = "/picon/" + snameFile;//+ ".png";

	snameFile = "http://" + Data.getIPAddress() + snameFile;
	
	
	if(Picon.type == Picon.SNAME)file = snameFile;
	if(Picon.type == Picon.SID) file = sidFile;
	if(Picon.type == Picon.NON) file = "Images/noicon.png";
	
	return file;
};


/**
 * Connect to a picon (service id/name supplied)
 * check the status to determine which is used
 */
Picon.setTypes = function(serviceId,serviceName)
{
	
	if(Main.RECORDINGS_LIST==true)
	{
		Picon.prevType = Picon.type;
		Picon.type=Picon.NON;
		Logger.log(Logger.INFO, "Removing Picons for recordings view");
		return;
	}
	else
	{
		if(Picon.prevType>=0)
		{
			Logger.log(Logger.INFO, "Returning Type following recordings view");
			Picon.type = Picon.prevType;
			return
		}
		else
		{
			//Only call the check if it's never been done!
			if(Picon.type!=Picon.UNSET)
			{
				Logger.log(Logger.INFO, "Picon Type already set");
				return;
			}
		}
	}
	
	//1 - check service id
	picFile = serviceId.replace(/\:/g,"_");
    picFile = picFile.replace(/\s/g,"");

    
	picFile = picFile.substring(0, picFile.length-1) + ".png";
    callurl = Picon.piconUrl + "/" + picFile;

	Logger.log(Logger.DEBUG, "Picon SID Url: " + callurl);
	idStatus = Server.checkStatusCode(callurl);
	
	//2 - check servce name
	/*
	picFile = serviceName.replace(/\s/g,"");
	picFile = picFile.toLowerCase();
	picFile = picFile .replace(/\+/g,"plus");
	picFile = picFile .replace(/\&/g,"and");
	picFile = picFile + ".png";*/
	picFile = Picon.processChannelName(serviceName);
	
	callurl = Picon.piconUrl + "/" + picFile;
	Logger.log(Logger.DEBUG, "Picon SName Url: " + callurl);
	nameStatus = Server.checkStatusCode(callurl);
	
	Logger.log(Logger.DEBUG, "SID Status: " + idStatus);
	Logger.log(Logger.DEBUG, "SName Status: " + nameStatus);
	
	Picon.type = Picon.NON;
	if(idStatus == 200) Picon.type = Picon.SID;
	if(nameStatus == 200) Picon.type = Picon.SNAME;
	
	Logger.log(Logger.DEBUG, "Picon Type: " + Picon.type);
};

Picon.processChannelName = function(inName)
{
	var picFile = "";
	picFile = inName.replace(/\s/g,"");
	picFile = picFile.replace(/\./g,"");
	picFile = picFile.replace(/\!/g,"");
	picFile = picFile.replace(/\:/g,"");
	picFile = picFile.replace(/\'/g,"");
	picFile = picFile.replace(/\//g,"");
	picFile = picFile.replace(/\>/g,"");
	picFile = picFile .replace(/\+/g,"plus");
	picFile = picFile .replace(/\*/g,"star");
	
	picFile = picFile .replace(/\&/g,"and");
	picFile = picFile + ".png";
	
	picFile = picFile.toLowerCase();
	
	return picFile;
};