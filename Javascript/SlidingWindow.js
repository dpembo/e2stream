var SlidingWindow =
{
		windowSize: 5,
		pointer: 0,
		noSlidePointer: 0,
		windowStartPointer: 0,
		positionInWindow: 0,
		items: null,
		numberItems: 0,
		
		pointerCache: 0,
		windowStartCache: 0,
		positionInWindowCache: 0,
		
};


SlidingWindow.cache = function()
{
	SlidingWindow.pointerCache = SlidingWindow.pointer;
	SlidingWindow.windowStartCache = SlidingWindow.windowStartPointer;
	SlidingWindow.positionInWindowCache = SlidingWindow.positionInWindow;
};

SlidingWindow.revertCache = function()
{
	SlidingWindow.pointer = SlidingWindow.pointerCache;
	SlidingWindow.windowStartPointer = SlidingWindow.windowStartCache;
	SlidingWindow.positionInWindow = SlidingWindow.positionInWindowCache;
};


SlidingWindow.init = function(innumberItems,inwindowSize,start)
{  
	SlidingWindow.numberItems = innumberItems;
	SlidingWindow.windowSize = inwindowSize;
	SlidingWindow.pointer = start;
	SlidingWindow.windowStartPointer = start;
    Logger.log(Logger.INFO,"Initialising Sliding Window - Items [" + innumberItems +"] WinSize [" + inwindowSize + "] Start [" + start + "]");
	return true;
    
};

SlidingWindow.setList = function(inList)
{
	SlidingWindow.items = inList;
	SlidingWindow.numberItems = inList.length;
};

SlidingWindow.setNumberItems = function(inNoItems)
{
	SlidingWindow.numberItems = inNoItems;
};

SlidingWindow.reset = function()
{
	SlidingWindow.pointer = 0;
	SlidingWindow.noSlidePointer = 0;
	SlidingWindow.windowStartPointer = 0;
	SlidingWindow.positionInWindow = 0;
};


/**
 * Moves an independent pointer without shifting the
 * sliding window.  Negative moves up the list, positive
 * moves down
 */
SlidingWindow.moveIndependentPointer = function(count)
{
	SlidingWindow.noSlidePointer += count;
	if(SlidingWindow.noSlidePointer<0)
	{
		SlidingWindow.noSlidePointer=SlidingWindow.numberItems-1;
	}
	
	//Check if the pointer has gone over the end
	if(SlidingWindow.noSlidePointer+1 > SlidingWindow.numberItems)
	{
		SlidingWindow.noSlidePointer = 0;
	}
	Logger.log(Logger.INFO,"Sliding Window - Items [" + SlidingWindow.numberItems +"] Indepndent Pointer [" + SlidingWindow.noSlidePointer + "]");
};

/**
 * Move up and down the sliding window by the amount provided.
 * -ve number moves back up the list, +ve number moves down
 */
SlidingWindow.move = function(count)
{
	Logger.log(Logger.INFO,"SlidingWindow::Move [" + count +"]");
	
	SlidingWindow.pointer += count;
	
	SlidingWindow.moveIndependentPointer(count);
	//Check if the pointer has gone past the start
	if(SlidingWindow.pointer<0)
	{
		//Move to the last in the list
		SlidingWindow.pointer=SlidingWindow.numberItems-1;
		// shift the window
		SlidingWindow.windowStartPointer = SlidingWindow.numberItems - SlidingWindow.windowSize;
	}
	
	//Check if the pointer has gone over the end
	if(SlidingWindow.pointer+1 > SlidingWindow.numberItems)
	{
		SlidingWindow.pointer = 0;
		SlidingWindow.windowStartPointer=0;
	}
	
	//Check if the window needs sliding down
	if(SlidingWindow.pointer>=SlidingWindow.windowStartPointer + SlidingWindow.windowSize)
	{
		//but only if the window isn't at the end
		if(SlidingWindow.windowStartPointer + 1 + SlidingWindow.windowSize > SlidingWindow.numberItems)
		{
			//Can't slide window at the else
		}
		else
		{
			//slide the window
			SlidingWindow.windowStartPointer+=count;
		}
	}
	//check if the window needs sliding up
	if( SlidingWindow.pointer < SlidingWindow.windowStartPointer)
	{
		SlidingWindow.windowStartPointer+=count;
		if(SlidingWindow.windowStartPointer<0)SlidingWindow.windowStartPointer = 0;
	}
		
	SlidingWindow.positionInWindow = SlidingWindow.pointer - SlidingWindow.windowStartPointer;
	Logger.log(Logger.INFO,"Sliding Window - Items [" + SlidingWindow.numberItems +"] WinSize [" + SlidingWindow.windowSize + "] Pointer [" + SlidingWindow.pointer + "] Windows Start [" + SlidingWindow.windowStartPointer + "]");
	
};


