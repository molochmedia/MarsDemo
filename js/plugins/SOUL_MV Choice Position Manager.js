// ------------------------------------------------------
// SOUL_MV Choice Position Manager.js
// ------------------------------------------------------

/*:
* @plugindesc 1.0 - This plugin allows you to reposition your choice window. (あなたの選択ウィンドウの位置を変更。)
* @author Soulpour777 - soulxregalia.wordpress.com
*
* @help

SOUL_MV Choice Position Manager
Author: Soulpour777

Plugin Commands

----

choice_position x y     Position your choice via x and y axis.

Example:

choice_position 300 100

----

choice_windows width height     Adjust your choice window width and height.

choice_windows 300 120

---


* @param Reposition Switch
* @desc Switch ID to use the repositioning feature.
* @default 1
*
* @param Repositioned Window X
* @desc This is the default x axis of the repositioned choice window. (Changable in Plugin Commands)
* @default 0
*
* @param Repositioned Window Y
* @desc This is the default y axis of the repositioned choice window. (Changable in Plugin Commands)
* @default 0
*
* @param Repositioned Window Width
* @desc This is the default width of the repositioned choice window. (Changable in Plugin Commands)
* @default 300
*
* @param Repositioned Window Height
* @desc This is the default height of the repositioned choice window. (Changable in Plugin Commands)
* @default 120
*
*/

var SOUL_MV = SOUL_MV || {};
SOUL_MV.ChoiceManager = {};

SOUL_MV.ChoiceManager.initialize = Game_System.prototype.initialize;
SOUL_MV.ChoiceManager.repositionChoiceSwitch = Number(PluginManager.parameters('SOUL_MV Choice Position Manager')['Reposition Switch'] || 1);
SOUL_MV.ChoiceManager.repositionWidth = Number(PluginManager.parameters('SOUL_MV Choice Position Manager')['Repositioned Window Width'] || 300);
SOUL_MV.ChoiceManager.repositionHeight = Number(PluginManager.parameters('SOUL_MV Choice Position Manager')['Repositioned Window Height'] || 120);
SOUL_MV.ChoiceManager.repositionX = Number(PluginManager.parameters('SOUL_MV Choice Position Manager')['Repositioned Window X'] || 0);
SOUL_MV.ChoiceManager.repositionY = Number(PluginManager.parameters('SOUL_MV Choice Position Manager')['Repositioned Window Y'] || 0);

Game_System.prototype.initialize = function() {
    SOUL_MV.ChoiceManager.initialize.call(this);
    this._choiceX = SOUL_MV.ChoiceManager.repositionX;
    this._choiceY = SOUL_MV.ChoiceManager.repositionY;
    this._choiceWidth = SOUL_MV.ChoiceManager.repositionWidth;
    this._choiceHeight = SOUL_MV.ChoiceManager.repositionHeight;
}

SOUL_MV.ChoiceManager.updatePlacement = Window_ChoiceList.prototype.updatePlacement;
Window_ChoiceList.prototype.updatePlacement = function() {
    SOUL_MV.ChoiceManager.updatePlacement.call(this);
    if ($gameSwitches.value(SOUL_MV.ChoiceManager.repositionChoiceSwitch)) {
        this.x = $gameSystem._choiceX;
        this.y = $gameSystem._choiceY;
        this.width = $gameSystem._choiceWidth;
        this.height = $gameSystem._choiceHeight;
    }
};

SOUL_MV.ChoiceManager.pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    SOUL_MV.ChoiceManager.pluginCommand.call(this);
    if (command === 'choice_position') {
        $gameSystem._choiceX = args[0];
        $gameSystem._choiceY = args[1];
    }
    if (command === 'choice_windows') {
        $gameSystem._choiceWidth = args[0];
        $gameSystem._choiceHeight = args[1];
    }
};