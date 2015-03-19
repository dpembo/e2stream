var ParentalSettings =
{
    pin1: "p1",
    pin2: "p2",
    pin3: "p3",
    pin4: "p4",
    
    lockSettingsY: "p5",
    lockSettingsN: "p6",
    
    lockBouquetY: "p7",
    lockBouquetN: "p8",
    
    p1Val: "-",
	p2Val: "-",
	p3Val: "-",
	p4Val: "-",
	
	lockSettingsVal: "N",
	lockBouquetVal: "N"
      
};

/**
 * Validate the pin
 */
ParentalSettings.settingsToUI = function()
{
	Display.setField(ParentalSettings.pin1,ParentalSettings.p1Val);
	Display.setField(ParentalSettings.pin2,ParentalSettings.p2Val);
	Display.setField(ParentalSettings.pin3,ParentalSettings.p3Val);
	Display.setField(ParentalSettings.pin4,ParentalSettings.p4Val);
	
	var onfield = ParentalSettings.lockSettingsN;
	if(ParentalSettings.lockSettingsVal=="Y")onfield=ParentalSettings.lockSettingsY;
	Display.presetToggle(ParentalSettings.lockSettingsY, ParentalSettings.lockSettingsN, onfield);
	
	onfield = ParentalSettings.lockBouquetN;
	if(ParentalSettings.lockBouquetVal=="Y")onfield=ParentalSettings.lockBouquetY;
	Display.presetToggle(ParentalSettings.lockBouquetY, ParentalSettings.lockBouquetN, onfield);
};

ParentalSettings.setData = function()
{
	ParentalSettings.p1Val = Display.getField(ParentalSettings.pin1);
	ParentalSettings.p2Val = Display.getField(ParentalSettings.pin2);
	ParentalSettings.p3Val = Display.getField(ParentalSettings.pin3);
	ParentalSettings.p4Val = Display.getField(ParentalSettings.pin4);
	
	var lockSettings = Display.getToggle(ParentalSettings.lockSettingsY,ParentalSettings.lockSettingsN);
	if(lockSettings==1) ParentalSettings.lockSettingsVal="Y";
	else ParentalSettings.lockSettingsVal="N";
	
	var lockBouquet = Display.getToggle(ParentalSettings.lockBouquetY,ParentalSettings.lockBouquetN);
	if(lockBouquet==1)ParentalSettings.lockBouquetVal = "Y";
	else ParentalSettings.lockBouquetVal="N";
};

ParentalSettings.isValid = function()
{
	if(ParentalSettings.lockSettingsVal=="Y" || ParentalSettings.lockBouquetVal== "Y")
	{
		//Must be a pin
		if(ParentalSettings.p1Val !=null && ParentalSettings.p1Val.length==1 
		&& ParentalSettings.p2Val!=null && ParentalSettings.p2Val.length==1 
		&& ParentalSettings.p3Val!=null && ParentalSettings.p3Val.length==1 
		&& ParentalSettings.p4Val!=null && ParentalSettings.p4Val.length==1)
		{
			//Logger.logDebug("Parental Settings are valid");
			
			if(ParentalSettings.p1Val!='-' && ParentalSettings.p2Val!='-' && ParentalSettings.p3Val!='-' && ParentalSettings.p4Val!='-')return true;
			else
			{
				Logger.logDebug("Parental Settings are invalid - pin not entered");
				return false;
			}
		}
		else
		{
			Logger.logDebug("Parental Settings are invalid");
			return false;
		}
	}
	else
	{
		Logger.logDebug("Parental Settings are valid");
		return true;
	}
	
};

ParentalSettings.dismissDialog = function()
{
	Alert.hideDialog(false);
	Alert.pinInputReset();
};


ParentalSettings.isBouquetLockEnabled = function()
{
	if(ParentalSettings.lockBouquetVal=="Y")
	{
		Logger.logDebug("Parental Lock Enabled");
		return true;
	}
	else 
	{
		Logger.logDebug("Parental Lock Not Enabled");
		return false;
	}
	
};

ParentalSettings.isSettingsLockEnabled = function()
{
	if(ParentalSettings.lockSettingsVal=="Y")return true;
	else return false;
};

/** if the pin matches move to the settings screen **/
ParentalSettings.pinEntryCheckCallback = function()
{
	if(Alert.pinInput[0] == ParentalSettings.p1Val &&
	   Alert.pinInput[1] == ParentalSettings.p2Val &&
	   Alert.pinInput[2] == ParentalSettings.p3Val &&
	   Alert.pinInput[3] == ParentalSettings.p4Val)
	{
			//Pin OK
			Main.showSettingsRunning();
	}
	else
	{
		Logger.log(Logger.WARN,"Invalid PIN Attempt");
	}
};

ParentalSettings.showPinEntryDialog = function()
{
	Alert.pinInputReset();
	Audio.playSoundWarning();
	Alert.setDialog("PIN Required",
			"Please Enter your user PIN to continue<br><br>PIN: <span id='pinEntry'></span><br>", 
			"Cancel", 
			"OK", null, null, ParentalSettings.dismissDialog, ParentalSettings.pinEntryCheckCallback, null, null);
	Alert.showDialog();
};
