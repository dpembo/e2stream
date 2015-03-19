var Utilities =
{
		//Public attributes
};

Utilities.init = function()
{
    
    return true;
};

Utilities.getTimeInMsSinceEpoch = function()
{
	var date = new Date();
	var n = date.getTime();

	return n;
};

Utilities.loadJSFile = function(filename)
{
	var fileref=document.createElement('script');
	fileref.setAttribute("type","text/javascript");
	fileref.setAttribute("src", filename);
	document.getElementsByTagName("head")[0].appendChild(fileref);

};

Utilities.removeJSFile = function(filename)
{
	var targetelement="script";
	var targetattr="src";
	var allsuspects=document.getElementsByTagName(targetelement);
	for (var i=allsuspects.length; i>=0; i--)
	{ //search backwards within nodelist for matching elements to remove
		if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
		{
			allsuspects[i].parentNode.removeChild(allsuspects[i]); //remove element by calling parentNode.removeChild()
		}
	}
};

Utilities.getElement = function(elemName)
{
	return document.getElementById(elemName);
};
