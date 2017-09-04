//=============================================================================
// ShallNotPass.js
//=============================================================================

/*:
 * @plugindesc Stop character movement on map with command or switch.
 * @author pareidolon
 * @help This plugin offers two ways to stop character movement:
 * 
 * First, by using a switch.
 * Parameter StopPlayerSwitch sets a switch that stops you.
 * Parameter StopNpcSwitch sets a switch that stops other characters.
 *    That means everything except you, even your party members.
 * You can activate or deactivate these switches in game.
 * 
 * Second, using the plugin command "ShallNotPass who value"
 * who = player or who = npcs
 * when value = true, it stops you or others.  You must undo this by command.
 * when value = false, you can move again.  It also flips off the switch.
 * Example: "ShallNotPass player true" freezes you.
 *          "ShallNotPass player false" releases you.
 * 
 * Lastly you can use the plugin command "ShallNotPass event ID value"
 * This will freeze or release this map's event # ID
 * Example: "ShallNotPass event 1 true" will stop event # 001 from moving.
 * Also "ShallNotPass event clear" releases all events.
 * 
 * Why the name? This plugin works by telling the system that all tiles
 * are impassible to certain characters on the map.
 * 
 * All new content is free to use under CC BY-SA 4.0
 * Please credit the contributor pareidolon at rpgmaker.net
 * 
 * @param StopPlayerSwitch
 * @desc Switch ID to cause stopping player. Use 0 to disable.
 * @default 1
 * 
 * @param StopNpcSwitch
 * @desc Switch ID to cause stopping NPCs. Use 0 to disable.
 * @default 2
 */

(function() {

var parameters = PluginManager.parameters('ShallNotPass');
var StopPlayerSwitchID = Number(parameters['StopPlayerSwitch']);
var StopNpcSwitchID = Number(parameters['StopNpcSwitch']);
var TurnOffPassiblePlayer = false;
var TurnOffPassibleNpcs = false;
var TurnOffPassibleEventArray = [];


// Game Command

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'ShallNotPass') {
        switch (args[0]) {
        case ('player' || 'Player' || 'PLAYER'):
            switch (args[1]) {
            case ('true' || 'TRUE' || 'True' || 'on' || 'ON' || 'yes' || 'YES' || 'Y'):
                TurnOffPassiblePlayer = true;
                break;
            default:
                TurnOffPassiblePlayer = false;
                $gameSwitches.setValue(StopPlayerSwitchID, false);
                break;
            }
            break;
        case ('npcs' || 'Npcs' || 'NPCS'):
            switch (args[1]) {
            case ('true' || 'TRUE' || 'True' || 'on' || 'ON' || 'yes' || 'YES' || 'Y'):
                TurnOffPassibleNpcs = true;
                break;
            default:
                TurnOffPassibleNpcs = false;
                $gameSwitches.setValue(StopNpcSwitchID, false);
                break;
            }
            break;
        case ('event' || 'Event' || 'EVENT'):
            if (args[1] == 'clear' || 'Clear' || 'CLEAR'){
                TurnOffPassibleEventArray = []
            };
            switch (args[2]) {
            case ('true' || 'TRUE' || 'True' || 'on' || 'ON' || 'yes' || 'YES' || 'Y'):
                TurnOffPassibleEventArray.push(Number(args[1]))
                break;
            default:
                var index = TurnOffPassibleEventArray.indexOf(Number(args[1]))
                TurnOffPassibleEventArray.splice(index, 1);
                break;
            }
            break;
        }
    }
};


// Mark impassible

var _Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
Game_CharacterBase.prototype.canPass = function(x, y, d) {
    if (this === $gamePlayer && StopPlayerSwitchID > 0 && $gameSwitches.value(StopPlayerSwitchID) === true) {
        return false;
    }
    if (this === $gamePlayer && TurnOffPassiblePlayer === true) {
        return false;
    }
    if (this !== $gamePlayer && StopNpcSwitchID > 0 && $gameSwitches.value(StopNpcSwitchID) === true) {
        return false;
    }
    if (this !== $gamePlayer && TurnOffPassibleNpcs === true) {
        return false;
    }
    for (i = 0; i < TurnOffPassibleEventArray.length; i++){
        if (this === $gameMap.event(TurnOffPassibleEventArray[i])) {
            return false;
        }
    }

    return _Game_CharacterBase_canPass.call(this, x, y, d);
};


})();
