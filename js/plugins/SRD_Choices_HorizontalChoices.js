//Horizontal Choices
//SumRndmDde's Choices Upgrade series
//by SumRndmDde
//Version 1.00

/*:
@plugindesc This allows you to have horizontal choices
for your RPG Maker MV "Show Choices" Event.

@author SumRndmDde

@param Max Columns
@desc This is the maximum amount of columns your "Show Choice"
window will have before going to the next row.
@default 1

@param Extra Width
@desc This value is added onto the width of all the 
"Show Choice" windows.
@default 0

@help
Horizontal Choices
SumRndmDde's Choices Upgrade series
by SumRndmDde
Version 1.00

This Plugin allows you to make certain choices shown using the
"Show Choice" event appear horizontally as opposed to listed 
from top to bottom (or vertically).

================
---Parameters---
================

 - Max Columns
This is the maximum amount of columns your "Show Choice"
window will have before going to the next row.
The default is 1.

 - Extra Width
This value is added onto the width of all the 
"Show Choice" windows.
The default is 0.

=====================
---Plugin Commands---
=====================

 - ChangeChoiceMaxColumns x
Set x to be the new Max Columns used.
The Max Columns can be changed at any time.
View the "Max Columns" Parameter for more details.

 - ChangeChoiceExtraWidth x
Set x to be the new Extra Width used.
The Extra Width can be changed at any time.
View the "Extra Width" Parameter for more details.

 - ChangeChoiceMaxColumns default
The Max Columns is set to the original value in the Parameters.

 - ChangeChoiceExtraWidth default
The Extra Width is set to the original value in the Parameters.
*/

var SumRndmDde = SumRndmDde || {};
SumRndmDde.Choices = SumRndmDde.Choices || {};

SumRndmDde.Choices.horizontalChoicesParameters = PluginManager.parameters('SRD_Choices_HorizontalChoices');

SumRndmDde.Choices.defaultMaxColumns = Number(SumRndmDde.Choices.horizontalChoicesParameters['Max Columns']);
SumRndmDde.Choices.defaultExtraWidth = Number(SumRndmDde.Choices.horizontalChoicesParameters['Extra Width']);

SumRndmDde.Choices.maxColumns = SumRndmDde.Choices.defaultMaxColumns;
SumRndmDde.Choices.extraWidth = SumRndmDde.Choices.defaultExtraWidth;

Window_ChoiceList.prototype.numVisibleRows = function() {
    var messageY = this._messageWindow.y;
    var messageHeight = this._messageWindow.height;
    var centerY = Graphics.boxHeight / 2;
    var choices = $gameMessage.choices();
    var numLines = choices.length;
    var maxLines = 8;
    if (messageY < centerY && messageY + messageHeight > centerY) {
        maxLines = 4;
    }
    if (numLines > maxLines) {
        numLines = maxLines;
    }
    return Math.ceil(numLines / SumRndmDde.Choices.maxColumns);
};

Window_ChoiceList.prototype.maxChoiceWidth = function() {
    var maxWidth = 96;
    var choices = $gameMessage.choices();
    for (var i = 0; i < choices.length; i++) {
        var choiceWidth = this.textWidthEx(choices[i]) + this.textPadding() * 2;
        if (maxWidth < choiceWidth) {
            maxWidth = choiceWidth;
        }
    }
    return (maxWidth * this.maxCols()) + SumRndmDde.Choices.extraWidth;
};

Window_ChoiceList.prototype.maxCols = function() {
 	if($gameMessage.choices().length == 0)
 	{
 		return 4;
 	}
 	else if($gameMessage.choices().length >= SumRndmDde.Choices.maxColumns)
 	{
 		return SumRndmDde.Choices.maxColumns;
 	}
 	else
 	{
 		return $gameMessage.choices().length;
 	}
};

SumRndmDde.Choices.horizontalChoicesPluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {
   SumRndmDde.Choices.horizontalChoicesPluginCommand.call(this, command, args);
   
   if (command.toLowerCase() === 'changechoicemaxcolumns') {
        if(args.length == 1)
        {
            if(args[0].toLowerCase() == 'default')
            {
                SumRndmDde.Choices.maxColumns = SumRndmDde.Choices.defaultMaxColumns;
            }
            else
            {
                SumRndmDde.Choices.maxColumns = Number(args[0]);
            }
        }
        else
        {
            $gameMessage.add('The ChangeChoiceMaxColumns Command has');
            $gameMessage.add('the wrong number of arguments.');
            $gameMessage.add('It\'s requries one Number as a argument.');
        }
   }
   if (command.toLowerCase() === 'changechoiceextrawidth')
   {
        if(args.length == 1)
        {
            if(args[0].toLowerCase() == 'default')
            {
                SumRndmDde.Choices.extraWidth = SumRndmDde.Choices.defaultExtraWidth;
            }
            else
            {
                SumRndmDde.Choices.extraWidth = Number(args[0]);
            }
        }
        else
        {
            $gameMessage.add('The ChangeChoiceExtraWidth Command has');
            $gameMessage.add('the wrong number of arguments.');
            $gameMessage.add('It\'s requries one Number as a argument.');
        }
   }
}