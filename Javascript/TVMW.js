var TVMW = 
{
	plugin: null,
	pluginAPI: null
};


TVMW.init = function()
{
    TVMW.plugin = document.getElementById("pluginObjectTVMW1");
    if(TVMW.plugin==null)return false;
    TVMW.plugin.Open('AppCommon', '1.001', 'AppCommon');
    
    pluginAPI = new Common.API.Plugin();
    return true;
};

TVMW.unregisterKeys = function()
{

    var NNaviPlugin = caph.platform.dtv.Device.plugin('NNAVI');
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);

    caph.platform.dtv.Device.unRegisterKey(caph.platform.Key.VOL_UP);
    caph.platform.dtv.Device.unRegisterKey(caph.platform.Key.VOL_DOWN);
    caph.platform.dtv.Device.unRegisterKey(caph.platform.Key.MUTE);
    //caph.platform.dtv.Device.unRegisterKey(caph.platform.Key.ENTER);
    caph.platform.dtv.Device.registerKey(caph.platform.Key.EXIT);
    //caph.platform.dtv.Device.unRegisterKey(caph.platform.Key.RETURN);

	/*sf.key.unregisterKey(sf.key.VOL_DOWN);
    sf.key.unregisterKey(sf.key.VOL_UP);
    sf.key.unregisterKey(sf.key.MUTE);
    sf.key.registerKey(sf.key.RETURN);
 */
    
	TVMW.plugin.Execute("UnregisterKey", TVMW.plugin.PL_APPCOMMON_KEY_VOLUP);
	TVMW.plugin.Execute("UnregisterKey", TVMW.plugin.PL_APPCOMMON_KEY_VOLDOWN);
	//TVMW.plugin.Execute("UnregisterKey", TVMW.plugin.PL_APPCOMMON_KEY_RETURN);
	TVMW.plugin.Execute("RegisterKey", TVMW.plugin.PL_APPCOMMON_KEY_EXIT);
	//TVMW.plugin.Execute("UnregisterKey", TVMW.plugin.PL_APPCOMMON_KEY_ENTER);
	
	
	 

	/** Show the volume osd? **/
	/*var PL_NNAVI_STATE_BANNER_NONE = 0;
	var PL_NNAVI_STATE_BANNER_VOL = 1;
	var PL_NNAVI_STATE_BANNER_VOL_CH = 2;
	var pluginAPI = new Common.API.Plugin();
	var tvKey = new Common.API.TVKeyValue();
	    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	    pluginAPI.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
	*/
};


TVMW.showTools = function()
{
	//0 = sound, 1 = tools
	pluginAPI.ShowTools(1);
};