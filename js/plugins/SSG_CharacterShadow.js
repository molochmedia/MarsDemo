/*:
 * @plugindesc Add shadow to characters (actors, vehicles, and events)
 * <SSG_CharacterShadow>
 * @author Heartbreak61
 * 
 * @help
 * =============================================================================
 *                  [Simple Stupid Gaming] Character Shadow
 *
 *                                 ver 1.0.0
 *                              by Heartbreak61
 * ============================================================================
 *                                INTRODUCTION
 * ----------------------------------------------------------------------------
 * Add shadow to characters! Thats it!
 *
 * ============================================================================
 *                                 TERM OF USE
 * ----------------------------------------------------------------------------
 *
 * Free to use on both commercial or non-commercial project as long as you
 * give credits to me. ;)
 *
 * ============================================================================
 *                                 CHANGELOG
 * ----------------------------------------------------------------------------
 * 2015.12.15 ver 1.0.0
 *   - First release
 *
 * 2015.12.15 ver 0.9.0
 *   - Started and finished the script
 * ============================================================================
 *                                 END OF HELP
 * ============================================================================
 */

/**
 * "Register" this plugin on a variable called Imported, which is the way
 * many scripter check for other's script existence.
 */
var Imported = Imported || {};
Imported['Character Shadow'] = '1.0.0';

(function() {
	'use strict';
	var _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters
	Spriteset_Map.prototype.createCharacters = function() {
		_Spriteset_Map_createCharacters.call(this);
		this._characterShadow = [];
		for (var i = 0; i < this._characterSprites.length; i++) {
			this._characterShadow[i] = new Sprite();
			this._characterShadow[i].bitmap = ImageManager.loadSystem('Shadow1');
			this._characterShadow[i].anchor.x = 0.5;
			this._characterShadow[i].anchor.y = 0.9;
			this._characterShadow[i].z = 2;
			this._tilemap.addChild(this._characterShadow[i]);
		}
	};

	var _Spriteset_Map_updateShadow = Spriteset_Map.prototype.updateShadow;
	Spriteset_Map.prototype.updateShadow = function() {
		_Spriteset_Map_updateShadow.call(this);
		var _party = function() {
			var list = []
			list.push($gamePlayer);
			$gamePlayer.followers()._data.forEach(function(follower) {
				list.push(follower);
			});
			return list;
		}
		var characters = this._characterSprites;
		for (var i = 0; i < characters.length; i++) {
			if (!this._characterShadow[i]) {continue;}
			var chara = characters[i]._character;
			if (chara.characterName() == "") {
				this._characterShadow[i].visible = false;
				continue;
			}
			if ($gamePlayer.isInVehicle()) {
				if (chara.constructor === Game_Vehicle) {
					this._characterShadow[i].visible = false;
					continue;
				}
				if (_party().contains(chara)){
					this._characterShadow[i].visible = false;
					continue;
				}
			};
			this._characterShadow[i].x = chara.screenX();
			this._characterShadow[i].y = chara.screenY();
			this._characterShadow[i].z = chara.screenZ()-1;
			this._characterShadow[i].opacity = characters[i].opacity;
			this._characterShadow[i].visible = characters[i].visible;
		}
	};
})();