
var Alert =
{

	callBackA: null,
	callBackB: null,
	callBackC: null,
	callBackD: null,
	title: "",
	question: "",
	optionA: "A",
	optionB: "B",
	optionC: "C",
	optionD: "D",
	numberOpts: 4,
	
	dialogActive: false,
	initialised: false,
	
	onPinKey: 1,
	pinInput: [4]
	
};

Alert.registerCallbacks = function(a,b,c,d)
{
	Alert.callBackA = a;
	Alert.callBackB = b;
	Alert.callBackC = c;
	Alert.callBackD = d;
};

Alert.setDialog = function(title,question,a,b,c,d,callbackA,callbackB,callbackC,callbackD)
{
	Logger.logDebug("Setting Dialog: " + title);
	Alert.registerCallbacks(callbackA, callbackB, callbackC, callbackD);
	
	Utilities.getElement("exitPopup-o2").style.display="block";
	Utilities.getElement("exitPopup-o3").style.display="block";
	Utilities.getElement("exitPopup-o4").style.display="block";
	
	Alert.numberOpts = 4;
	if(d==null)
	{
		Utilities.getElement("exitPopup-o4").style.display="none";
		Alert.numberOpts=3;
	}
	if(c==null)
	{
		Utilities.getElement("exitPopup-o3").style.display="none";
		Alert.numberOpts=2;
	}
	if(b==null)
	{
		Utilities.getElement("exitPopup-o2").style.display="none";
		Alert.numberOpts=1;
	}
	
	Alert.title = title;
	Alert.question = question;
	Alert.optionA = a;
	Alert.optionB = b;
	Alert.optionC = c;
	Alert.optionD = d;
	Alert.initialised = true;

};

/**
 * shows the dialog on screen
 */
Alert.showDialog = function()
{
	
	if(Alert.initialised==false)
	{
		Logger.log(Logger.WARN, "Show dialog called when it hasn't been initialised");
		return;
	}
	else
	{
		Logger.log(Logger.INFO,"Showing [" + Alert.title + "] alert");
		Logger.logDebug("number options: " + Alert.numberOpts);
	}
	titleElemId = "exitPopup-Header";
	questionElemId = "exitPopup-Text";
	opts1ElemId="o1-text";
	opts2ElemId="o2-text";
	opts3ElemId="o3-text";
	opts4ElemId="o4-text";
	
	dialogElem = "exitPopup";
	dialogBackElem = "exitPopup-fadeout";
	
	document.getElementById(dialogBackElem).style.display='block';
	document.getElementById(dialogElem).style.display='block';
	
	widgetAPI.putInnerHTML(document.getElementById(titleElemId),Alert.title);
	widgetAPI.putInnerHTML(document.getElementById(questionElemId),Alert.question);
	widgetAPI.putInnerHTML(document.getElementById(opts1ElemId),Alert.optionA);
	if(Alert.numberOpts>1) widgetAPI.putInnerHTML(document.getElementById(opts2ElemId),Alert.optionB);
	if(Alert.numberOpts>2) widgetAPI.putInnerHTML(document.getElementById(opts3ElemId),Alert.optionC);
	if(Alert.numberOpts>3) widgetAPI.putInnerHTML(document.getElementById(opts4ElemId),Alert.optionD);
	
	Alert.dialogActive=true;
};

Alert.pinInputReset = function()
{
	Alert.onPinKey=1;
	Alert.pinInput[0]="";
	Alert.pinInput[1]="";
	Alert.pinInput[2]="";
	Alert.pinInput[3]="";
	
};

/**
 * Receives input keycode and responds as needed
 */
Alert.receiveInput = function(inKeyCode)
{
	//Logger.log(Logger.DEBUG,"Alert Dialog Processing Keycode: " + inKeyCode);
	if(Alert.dialogActive==false)return;
	
	
	switch(inKeyCode)
    {
		case tvKey.KEY_RED:
			Logger.logDebug("Alert Option - RED");
			Audio.playSoundEnter();
			Alert.hideDialog(false);
			if(Alert.callBackA)Alert.callBackA();
			break;
		case tvKey.KEY_GREEN:
			Logger.logDebug("Alert Option - GREEN");
			Audio.playSoundEnter();
			Alert.hideDialog(false);
			if(Alert.callBackB)Alert.callBackB();
			break;
		case tvKey.KEY_YELLOW:
			Logger.logDebug("Alert Option - YELLOW");
			Audio.playSoundEnter();
			Alert.hideDialog(false);
			if(Alert.callBackC)Alert.callBackC();
			break;
		case tvKey.KEY_BLUE:
			Logger.logDebug("Alert Option - BLUE");
			Audio.playSoundEnter();
			Alert.hideDialog(false);
			if(Alert.callBackD)Alert.callBackD();
			break;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:	
			Audio.playSoundBack();
			Logger.logDebug("Alert Option - RETURN");
			widgetAPI.sendReturnEvent();
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
			if(Alert.title=="PIN Required")
			{
				var key = Main.receiveSingleDigitInput(inKeyCode);
				if(Alert.onPinKey==1)
				{
					Alert.pinInput[0]="";
					Alert.pinInput[1]="";
					Alert.pinInput[2]="";
					Alert.pinInput[3]="";
				}
				Alert.pinInput[Alert.onPinKey-1] = key;
				Alert.onPinKey++;
				

				var text="";
				if(Alert.onPinKey==2) text="*";
				if(Alert.onPinKey==3) text="**";
				if(Alert.onPinKey==4) text="***";
				if(Alert.onPinKey==5) text="****";
				
				if(Alert.onPinKey==5)Alert.onPinKey =1;
				Display.setField("pinEntry", text);
				
			}
			break; 
		default:
			Logger.logDebug("Alert Option - Unknown; Ignore");
			break;
    }
};

Alert.hideDialog = function(leaveBlocked)
{
	if(leaveBlocked!=true)document.getElementById(dialogBackElem).style.display='none';
	document.getElementById(dialogElem).style.display='none';
	Alert.dialogActive=false;
};

Alert.isActive = function()
{
	return Alert.dialogActive;
};

Alert.showBackgroundBlock = function()
{
	dialogBackElem = "exitPopup-fadeout";
	document.getElementById(dialogBackElem).style.display='block';
};