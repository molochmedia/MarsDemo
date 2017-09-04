//=============================================================================
// Resolution Option v1.1.js
//=============================================================================

/*:
 * CHANGELOG:
 * v1.1
 * [] Added different resizing options for Title Screen, Battler Placement and Battle Background. Not all optiones are implemented yet.
 * [] Changed the name of some parameter.
 * v1.0
 * [] initial release
 *
 * @plugindesc v1.1
 * Adds options to change the resolution.
 * @author http://steamcommunity.com/id/Yoshi72
 *
 * @param Resolutions Width
 * @desc Array of supported resolutions (Width). Default: 800,1600,1920
 * @default 800,1200,1920
 *
 * @param Resolutions Height
 * @desc Array of supported resolutions (Height). Default: 600,900,1080
 * @default 600,900,1080
 *
 * @param Cycle Through Selection
 * @desc Selection will start back at the lowest resolution if you exceed the array (and vise versa). Default: 0
 * @default 0
 *
 * @param Force Window Size
 * @desc Forces the window size to the spezified resolution. You won't be able to resize it anymore. Default: 1
 * @default 1
 *
 * @param Auto Window Resize
 * @desc Automatically sets window size at leaving the options. Only used if "Force Window Size" is set to 0. Default: 1
 * @default 1
 *
 * @param Stretch Title Screen
 * @desc Stretches the Title Screen. See Notes for further details.
 * @default 1
 *
 * @param Stretch Battlefield
 * @desc Stretches the Battlefield/Battler placement during battles. See Notes for further details.
 * @default 1
 *
 * @param Stretch Battle Background
 * @desc Stretches the Battle Background. See notes for further details.
 * @default 1
 *
 * @help You can change the resolution in the options menu (both ingame and at the title screen). There is no command you have to execute during the game whatsoever, all you need to do is set the parameters and you are good to go.
 * Some more details about the parameters:
 * There are different resize options for different cases. I'll explain the options for each case down below. Also note: Any value that isn't explained there (like 0) will simply turn off my resizing code and will fall back to vanilla code. I recommend to use a value of 0 in order to turn it off in order to maintain readability.
 *
 * Stretch Title Screen
 * 1 = Keep aspect ratio; It will resizes the Title Screen Background to fit the whole screen, but will maintain it's aspect ratio. This means it will cut out a bit either vertically or horizontally if the resolution isn't the same aspect ratio than the background image.
 * 2 = Stretch to fit; It will stretch the Title Screen Background in order to fit the selected resolution. This way there will be no part of the background cut out, but it will look cramped if the aspect ratio does differ too much.
 *
 * Stretch Battlefield
 * 1 = Scales the position of all Battlers during fights to fill out the whole screen instead of just in the top left corner.
 * 2 = TODO; I plan to add an option to center the Battler placement into the middle without rescaling the field (so it will simply move to the center). THIS OPTION IS NOT IMPLEMENTED YET!
 *
 * Stretch Battle Background
 * 1 = TODO; Vanilla keep aspect ratio; It will behave similiar to vanilla rendering, but with the ability to resize to different resolutions while maintaining the aspect ratio. THIS OPTION IS NOT IMPLEMENTED YET!
 * 2 = TODO; Same as above, but without keeping the aspect ratio but instead being stretch to fit.
 * 3 = Keep aspect ratio; Same as option 1 of Title Screen Resizing. Tries to fit the screen while maintaining the aspect ratio. Battler placement might be off on different resolutions thought.
 * 4 = Stretch to fit; Same as option 2 of Title Screen Resizing. The image will fit onto the screen and being stretched on different aspect ratios. Like with option 3 Battler placement might be off on different resolutions.
 *
 *
 *
 * Upcoming features:
 * [] Despite the options mentioned at the "Stretch Battle Background"-option I will add a feature to lock resolution selection to width and height, so you can't choose them independently anymore (I.E. you can only choose between 800x600, 1200x900 and the like). This will help developers to add different resolutions while maintaining aspect ratios (which might fix some possible bugs and/or makes it easier to create assets).
 * [] A resizing option for the "Show Picture"-command used in events. You will be able to define a "Base Resolution" so the picture will scale accordingly to the difference of base and current resolution. This way you need to configure the picture showing only for the base resolution during event creation and it will behave the same way on different resolutions.
 */
(function()
{
	//////////////////////////////////////////////////
	//					Parameters
	//////////////////////////////////////////////////
	
	var parameters		= PluginManager.parameters('Resolution Option v1.1');
	var val_width		= parameters['Resolutions Width'].split(',').map(function(value) { return parseInt(value); }, this).sort(function(a, b){return a-b}) || [800, 1200, 1920];
	var val_height		= parameters['Resolutions Height'].split(',').map(function(value) { return parseInt(value); }, this).sort(function(a, b){return a-b}) || [600, 900, 1080];
	var cycleSelect		= Number(parameters['Cycle Through Selection']) || false;
	var forceResize		= Number(parameters['Force Window Size']) || true;
	var autoResize		= Number(parameters['Auto Window Resize']) || true;
	var stretch_title	= Number(parameters['Stretch Title Screen']) || 0;
	var stretch_bField	= Number(parameters['Stretch Battlefield']) || 0;
	var stretch_bBack	= Number(parameters['Stretch Battle Background']) || 0;
	
	
	
	
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
	
	
	
	//////////////////////////////////////////////////
	//					Resizing
	//////////////////////////////////////////////////
	
	//Check which Title Screen resize option is set to execute.
	switch(stretch_title)
	{
		//Keep aspect ratio.
		case 1:
			_Scene_Title_prototype_centerSprite = Scene_Title.prototype.centerSprite;
			Scene_Title.prototype.centerSprite = function(sprite)
			{
				_Scene_Title_prototype_centerSprite.call(this, sprite);
				scale1 = Graphics._width / sprite.width;
				scale2 = Graphics._height / sprite.height;
				sprite.scale.x = sprite.scale.y = scale1 > scale2 ? scale1 : scale2;
			};
			break;
		//Stretch to fit.
		case 2:
			_Scene_Title_prototype_centerSprite = Scene_Title.prototype.centerSprite;
			Scene_Title.prototype.centerSprite = function(sprite)
			{
				_Scene_Title_prototype_centerSprite.call(this, sprite);
				sprite.scale.x = Graphics._width / sprite.width;
				sprite.scale.y = Graphics._height / sprite.height;
			};
			break;
	}
	
	//Check which battlebackground resize option is on.
	if(stretch_bField == 1)
	{
		//Scales the position of the actors on the battlefield depending on the resolution.
		Sprite_Actor.prototype.setActorHome = function(index)
		{
			var x = 600 * (Graphics._width / 800) + (index * 32) * (Graphics._width / 800);
			var y = 280 * (Graphics._height / 600) + (index * 48) * (Graphics._height / 600);
			this.setHome(x, y);
		};
		
		_Sprite_Enemy_prototype_setBattler = Sprite_Enemy.prototype.setBattler;
		Sprite_Enemy.prototype.setBattler = function(battler)
		{
			_Sprite_Enemy_prototype_setBattler.call(this, battler);
			this.setHome(battler.screenX() * (Graphics._width / 800), battler.screenY() * (Graphics._height / 600));
		};
	}
	
	//Check which battlebackground resize option is set to execute.
	switch(stretch_bBack)
	{
		//Stretched vanilla.
		case 1:
			//TODO
			break;
		//Vanilla keep aspect ratio.
		case 2:
			//TODO
			break;
		//Keep aspect ratio.
		case 3:
			Spriteset_Battle.prototype.locateBattleback = function()
			{
				var width	= Graphics._width;
				var height	= Graphics._height;
				
				var width1	= this._back1Sprite._bitmap._baseTexture.width;
				var height1	= this._back1Sprite._bitmap._baseTexture.height;
				var width2	= this._back2Sprite._bitmap._baseTexture.width;
				var height2	= this._back2Sprite._bitmap._baseTexture.height;
				
				var scale1	= (width / width1) > (height / height1) ? (width / width1) : (height / height1);
				var scale2	= (width / width2) > (height / height2) ? (width / width2) : (height / height2);
				
				this._back1Sprite.scale.x = this._back1Sprite.scale.y = scale1;
				this._back2Sprite.scale.x = this._back2Sprite.scale.y = scale2;
				
				var x1 = 0;
				var y1 = 0;
				var x2 = 0;
				var y2 = 0;
				
				x1 -= (width1 * scale1 - width) / 2;
				y1 -= (height1 * scale1 - height) / 2;
				x2 -= (width2 * scale2 - width) / 2;
				y2 -= (height2 * scale2 - height) / 2;
				
				this._back1Sprite.move(x1, y1, width1, height1);
				this._back2Sprite.move(x2, y2, width2, height2);
			};
			break;
		//Stretch to fit.
		case 4:
			Spriteset_Battle.prototype.locateBattleback = function()
			{
				
				this._back1Sprite.scale.x = Graphics._width / this._back1Sprite._bitmap._baseTexture.width;
				this._back1Sprite.scale.y = Graphics._height / this._back1Sprite._bitmap._baseTexture.height;
				this._back2Sprite.scale.x = Graphics._width / this._back2Sprite._bitmap._baseTexture.width;
				this._back2Sprite.scale.y = Graphics._height / this._back2Sprite._bitmap._baseTexture.height;
				this._back1Sprite.move(0, 0, this._back1Sprite._bitmap._baseTexture.width, this._back1Sprite._bitmap._baseTexture.height);
				this._back2Sprite.move(0, 0, this._back2Sprite._bitmap._baseTexture.width, this._back2Sprite._bitmap._baseTexture.height);
			};
			break;
	}
})();