//=============================================================================
// Resolution Option.js
//=============================================================================

/*:
 * @plugindesc v1.0
 * Adds options to change the resolution.
 * @author http://steamcommunity.com/id/Yoshi72
 *
 * @param Resolutions Width
 * @desc Array of supported resolutions (Width). Default: 800,1600,1920
 * @default 800,1600,1920
 *
 * @param Resolutions Height
 * @desc Array of supported resolutions (Height). Default: 600,900,1080
 * @default 600,900,1080
 *
 * @param Cycle Selection
 * @desc Selection will start back at the lowest resolution if you exceed the array (and vise versa). Default: 0
 * @default 0
 *
 * @param Force Window Size
 * @desc Forces the window size to the spezified resolution. You won't be able to resize it anymore. Default: 1
 * @default 1
 *
 * @param Auto Resize
 * @desc Automatically resizes the game's window at leaving the options menu. Only used if "Force Window Size" is set to 0. Default: 1
 * @default 1
 *
 * @help You can change the resolution in the options menu (both ingame and at the title screen).
 */
(function()
{
	//////////////////////////////////////////////////
	//					Parameters
	//////////////////////////////////////////////////
	
	var parameters		= PluginManager.parameters('Resolution Option');
	var val_width		= parameters['Resolutions Width'].split(',').map(function(value) { return parseInt(value); }, this).sort(function(a, b){return a-b}) || [800, 1600, 1920];
	var val_height		= parameters['Resolutions Height'].split(',').map(function(value) { return parseInt(value); }, this).sort(function(a, b){return a-b}) || [600, 900, 1080];
	var cycleSelect		= Number(parameters['Cycle Selection'] || false);
	var forceResize		= Number(parameters['Force Window Size'] || true);
	var autoResize		= Number(parameters['Auto Resize'] || true);
	
	
	
	
	
	//////////////////////////////////////////////////
	//				Config Manager
	//////////////////////////////////////////////////
	
	//We need to add new variables to the ConfigManager.
	ConfigManager.resolutionWidth = val_width[0];
	ConfigManager.resolutionHeight = val_height[0];
	
	_ConfigManager_makeData = ConfigManager.makeData;
	ConfigManager.makeData = function()
	{
		var config = _ConfigManager_makeData.call(this);
		config.resolutionWidth = this.resolutionWidth;
		config.resolutionHeight = this.resolutionHeight;
		return config;
		
	};
	
	_ConfigManager_applyData = ConfigManager.applyData;
	ConfigManager.applyData = function(config)
	{
		_ConfigManager_applyData.call(this, config);
		this.resolutionWidth = this.readRes(config, 'resolutionWidth');
		this.resolutionHeight = this.readRes(config, 'resolutionHeight');
	};
	
	//New function in order to read the values. If none are set, it will take the smallest value of the array.
	ConfigManager.readRes = function(config, name)
	{
		var min;
		var max;
		if (name === 'resolutionWidth')
		{
			min = val_width[0];
			max = val_width[val_width.length-1];
		}
		else if (name === 'resolutionHeight')
		{
			min = val_height[0];
			max = val_height[val_height.length-1];
		} else
		{
			return 0;
		}
		var value = config[name];
		if (value !== undefined)
		{
			return Number(value).clamp(min, max);
		} else
		{
			return min;
		}
	};
	
	
	
	//////////////////////////////////////////////////
	//				Options Screen
	//////////////////////////////////////////////////
	
	//Add new commands to change the resolution.
	_Window_Options_prototype_makeCommandList = Window_Options.prototype.makeCommandList;
	Window_Options.prototype.makeCommandList = function()
	{
		this.addCommand("Resolution X", 'resolutionWidth');
		this.addCommand("Resolution Y", 'resolutionHeight');
		_Window_Options_prototype_makeCommandList.call(this);
	};
	
	//Check if selected option is a resolution.
	Window_Options.prototype.isResolutionSymbol = function(symbol)
	{
		return symbol.contains('resolution');
	};
	
	//Changes the display of options.
	_Window_Options_prototype_statusText = Window_Options.prototype.statusText;
	Window_Options.prototype.statusText = function(index)
	{
		var symbol = this.commandSymbol(index);
		if (this.isResolutionSymbol(symbol))
		{
			return this.getConfigValue(symbol);
		} else
		{
			return _Window_Options_prototype_statusText.call(this, index);
		}
	};
	
	//Changes how it handles option when pressing enter
	_Window_Options_prototype_processOk = Window_Options.prototype.processOk;
	Window_Options.prototype.processOk = function()
	{
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (this.isResolutionSymbol(symbol))
		{
			this.changeRes(symbol, true);
		} else
		{
			_Window_Options_prototype_processOk.call(this);
		}
	};
	
	//Changes how it handles option when pressing right
	_Window_Options_prototype_cursorRight = Window_Options.prototype.cursorRight;
	Window_Options.prototype.cursorRight = function(wrap)
	{
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (this.isResolutionSymbol(symbol))
		{
			this.changeRes(symbol, true);
		} else
		{
			_Window_Options_prototype_cursorRight.call(this, wrap);
		}
	};
	
	//Changes how it handles option when pressing left
	_Window_Options_prototype_cursorLeft = Window_Options.prototype.cursorLeft;
	Window_Options.prototype.cursorLeft = function(wrap)
	{
		var index = this.index();
		var symbol = this.commandSymbol(index);
		var value = this.getConfigValue(symbol);
		if (this.isResolutionSymbol(symbol))
		{
			this.changeRes(symbol, false);
		} else
		{
			_Window_Options_prototype_cursorLeft.call(this, wrap);
		}
	};
	
	//Changes the resolution selection. However resolution will be changed only at closing the options menu.
	Window_Options.prototype.changeRes = function(symbol, direction)
	{
		var last_value = this.getConfigValue(symbol);
		var resolution;
		if (symbol === 'resolutionWidth')
		{
			resolution = val_width;
		} else if (symbol === 'resolutionHeight')
		{
			resolution = val_height;
		} else
		{
			return;
		}
		var index = resolution.indexOf(this.getConfigValue(symbol));
		index += direction ? 1 : - 1;
		if (index < 0)
		{
			index = cycleSelect ? resolution.length-1 : 0;
		} else if (index >= resolution.length)
		{
			index = cycleSelect ? 0 : resolution.length-1;
		}
		if (last_value !== resolution[index])
		{
			this.setConfigValue(symbol, resolution[index]);
			this.redrawItem(this.findSymbol(symbol));
			SoundManager.playCursor();
		}
	}
	
	//Changes resolution at closing the option screen. Also changes window size if "Auto Resize" is set to true.
	_Scene_Options_prototype_terminate = Scene_Options.prototype.terminate;
	Scene_Options.prototype.terminate = function()
	{
		if (forceResize || autoResize)
		{
			window.resizeTo(ConfigManager['resolutionWidth'] + window.outerWidth-window.innerWidth, ConfigManager['resolutionHeight'] + window.outerHeight-window.innerHeight);
		}
		Graphics.boxWidth = Graphics._width = ConfigManager['resolutionWidth'];
		Graphics.boxHeight = Graphics._height = ConfigManager['resolutionHeight'];
		//If a map is loaded, center the screen onto the player.
		if (SceneManager._stack.indexOf(Scene_Map) !== -1)
		{
			$gamePlayer.center($gamePlayer._realX, $gamePlayer._realY);
		}
		Graphics._updateAllElements();
		_Scene_Options_prototype_terminate.call(this);
	};
	
	
	
	//////////////////////////////////////////////////
	//				Window Resizing
	//////////////////////////////////////////////////
	
	//Force automatic window resize if "Force Window Size" is set to true.
	if (forceResize)
	{
		_Graphics__onWindowResize = Graphics._onWindowResize;
		Graphics._onWindowResize = function()
		{
			window.resizeTo(ConfigManager['resolutionWidth'] + window.outerWidth-window.innerWidth, ConfigManager['resolutionHeight'] + window.outerHeight-window.innerHeight);
			_Graphics__onWindowResize.call(this);
		};
	}
	
	//Resizes window and render resolution at startup if "Auto Resize" is set to true.
	if (forceResize || autoResize)
	{
		_Scene_Boot_prototype_create = Scene_Boot.prototype.create;
		Scene_Boot.prototype.create = function()
		{
			_Scene_Boot_prototype_create.call(this);
			window.resizeTo(ConfigManager['resolutionWidth'] + window.outerWidth-window.innerWidth, ConfigManager['resolutionHeight'] + window.outerHeight-window.innerHeight);
			Graphics.boxWidth = Graphics._width = ConfigManager['resolutionWidth'];
			Graphics.boxHeight = Graphics._height = ConfigManager['resolutionHeight'];
			Graphics._updateAllElements();
		};
	}
})();
     