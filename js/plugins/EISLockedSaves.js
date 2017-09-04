//=============================================================================
// EISLockedSaves.js                                                             
//=============================================================================

/*:
*
* @author Kino
* @plugindesc This allows you to have locked saves in your game.
* 
*
* @help
* Version: 1.00
* This plugin allows you to have a player locked into a save upon loading.
*
* Functions:
*
* KR.Helpers.addSaveSlot()
* - Increase the number of save slots on the load/save screen.
* KR.Helpers.saveGame()
* - Lets you save the game at the last locked file id.
* 
*
* Contact me via twitter: EISKino, or on the rpg maker forums.
* Username on forums: Kino.
* Hope this plugin helps, and enjoy!
*/

var KR =  KR || {};
KR.Plugins = KR.Plugins || {};
KR.Helpers = KR.Helpers || {};
(function($) {
//=============================================================================
// Plugin Variables                                                             
//=============================================================================
  var parameters = PluginManager.parameters("EISLockedSaves");

  $.Plugins.EISLockedSaves = function() {
//=============================================================================
// DataManager                                                             
//=============================================================================
    DataManager.numSlots = 1;
    DataManager.locked = false;
    DataManager.lockedId = 1;
    
    DataManager.addSlot = function() {
      this.numSlots++;
    };

    DataManager.lockFileID = function(value) {
      this.lockedId = value;
      this.locked = true;
    };

    DataManager.getlockedFileId = function() {
      return this.lockedId;
    };

    DataManager.unlockFileId = function() {
      this.locked = false;
    };

    DataManager.isLocked = function() {
      return this.locked;
    };

    DataManager.maxSavefiles = function () {
      return this.numSlots;
    };

    DataManager.allGameFilesFilled = function() {
      var globalInfo = this.loadGlobalInfo();
      var count = 0;
      if(globalInfo) {
        for(var i =0; i < this.numSlots + 1; i++) {
          if(this.isThisGameFile(i))
            count++;
        }
        console.log(count);
        if(count >= this.numSlots)
          return true;
        else
          return false;
      }
    };

    DataManager.getAvailableSlot = function() {
      var globalInfo = this.loadGlobalInfo();
      var count = 0;
      if(globalInfo) {
        for(var i = 0; i < this.numSlots + 1; i++) {
          if(this.isThisGameFile(i)) {
            count++;
          }
        }
        return count + 1;
      }
    };

    DataManager.prepareExtraSaveFile = function() {
      if(this.allGameFilesFilled()) {
        this.addSlot();
        this.lockFileID(this.numSlots);
      }
      else
        this.lockFileID(this.getAvailableSlot());
    };

    DataManager.setupNewGame = function() {
      this.createGameObjects();
      this.prepareExtraSaveFile();
      this.selectSavefileForNewGame();
      $gameParty.setupStartingMembers();
      $gamePlayer.reserveTransfer($dataSystem.startMapId,
          $dataSystem.startX, $dataSystem.startY);
      Graphics.frameCount = 0;
    };

//=============================================================================
// Scene_Title                                                            
//=============================================================================
    Scene_Title.prototype.initialize = function() {
      Scene_Base.prototype.initialize.call(this);
      DataManager.unlockFileId();
    };

//=============================================================================
// Scene_Save                                                            
//=============================================================================
    Scene_Save.prototype.firstSavefileIndex = function() {
      return DataManager.getlockedFileId() -1;
    };

//=============================================================================
// Scene_Load                                                             
//=============================================================================
    Scene_Load.prototype.onLoadSuccess = function() {
      SoundManager.playLoad();
      this.fadeOutAll();
      this.reloadMapIfUpdated();
      SceneManager.goto(Scene_Map);
      this._loadSuccess = true;
      DataManager.lockFileID(this.savefileId());
    };
//=============================================================================
// Window_SaveFileList                                                            
//=============================================================================
    Window_SavefileList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
      this.activate();
      this._mode = null;
    };

    Window_SavefileList.prototype.update = function() {
      Window_Selectable.prototype.update.call(this);
      this.refresh();
    };

    Window_SavefileList.prototype.refresh = function() {
      Window_Selectable.prototype.refresh.call(this);
      if(DataManager.isLocked())
        this.setCursorFixed(true);
      else
        this.setCursorFixed(false);
    };

//=============================================================================
// Helpers                                                              
//=============================================================================
    $.Helpers.addSaveSlot = function() {
      DataManager.addSlot();
    };

    $.Helpers.saveGame = function() {
      DataManager.saveGame(DataManager.getlockedFileId());
    };
  };

  $.Plugins.EISLockedSaves();
})(KR);
