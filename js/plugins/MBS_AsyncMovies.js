//=============================================================================
// MBS - Asynchronous Movies (v1.0.2)
//-----------------------------------------------------------------------------
// by Masked
//=============================================================================
//-----------------------------------------------------------------------------
// Especificações do plugin (Não modifique!)
// Plugin specifications (Do not modify!)
/*:
	@author Masked 
	@plugindesc Allows you to play videos asynchronously in-game.
	<MBS AsyncMovies>

	@help
===========================================================================
Introduction
===========================================================================
This plugin makes it possible to play videos in-game and still run events,
this way you can still control the game behavior while the player watches 
the video.

===========================================================================
How to Use
===========================================================================
To play a movie asynchronously, put a comment like this immediattely above
the "Play Movie" command in an event:
	<AsyncVideo>

If you want the video to activate a switch when it's finished, change the
comment to something like this:
	<AsyncVideo: id>

This way, the switch with ID 'id' will be turned off when the movie starts 
and on by its end.
To stop the movie, just call the Play Movie command and choose 'None'.

===========================================================================
Functions
===========================================================================

MBS.AsyncMovies.play(filename)   : Plays a movie from the file 
                                 : 'movies/filename.ext', being 'ext' the
                                 : supported video extension.
 
MBS.AsyncMovies.stop			 : Stops the current video from running

===========================================================================
Credits
===========================================================================
- Masked, for creating

*/
/*:pt
	@author Masked 
	@plugindesc Permite a execução de vídeos de modo paralelo ao resto do jogo.
	<MBS AsyncMovies>

	@help
===========================================================================
Introdução
===========================================================================
Esse plugin permite que você rode vídeos de forma que eles não impeçam o 
resto do jogo de rodar.

===========================================================================
Como Usar
===========================================================================
Para rodar um vídeo paralelamente, coloque exatamente acima do comando de
vídeo um comentário com o seguinte texto:
	<AsyncVideo>

Dessa forma, o vídeo será automaticamente executado em paralelo.

Caso queira que o vídeo acione uma switch ao terminar, basta adicionar o
ID da switch como parâmetro para o comentário:
	<AsyncVideo: 42>

(Aciona a switch 42 ao terminar o vídeo)
Para interromper a execução do vídeo atual, chame o comando de mostrar 
vídeo e selecione "(Nenhum)".

===========================================================================
Funções
===========================================================================

MBS.AsyncMovies.play(filename)   : Roda um vídeo do arquivo 'filename' em
                                 : paralelo
 
MBS.AsyncMovies.stop			 : Para a execução do vídeo atual

===========================================================================
Créditos e agradecimentos
===========================================================================
- Masked, por criar

*/

var Imported = Imported || {};
var MBS = MBS || {};

MBS.AsyncMovies = {};

"use strict";

//=============================================================================
// ** MBS > AsyncMovies
//-----------------------------------------------------------------------------
// Video control module
//=============================================================================
(function ($) {

	$._video = null;
	$._switch = null;

	$._createVideo = function() {
		this._video = document.createElement('video');
	    this._video.id = 'AsyncVideo';
	    this._video.style.opacity = 0;
	    this._video.width = Graphics.width;
        this._video.height = Graphics.height;
	    this._video.style.zIndex = 100;
	    Graphics._centerElement(this._video);
	    this._video.onended = $.stop.bind(this);
        this._video.onerror = function() { throw new Error('Erro ao abrir o vídeo;'); };
	    document.body.appendChild(this._video);
	}

	// Execução de um vídeo assíncrono
	$.play = function(filename) {
		this._createVideo();
		this._video.src = 'movies/' + filename + Game_Interpreter.prototype.videoFileExt();
		this._video.currentTime = 0;
        this._video.autoplay = true;
        this._video.style.opacity = 1;
        this._video.load();
	}

	$.stop = function(filename) {
		if (!this._video) return;
		this._video.pause();
		document.body.removeChild(this._video);
		this._video = null;
	}



})(MBS.AsyncMovies);

//=============================================================================
// ** Game_Interpreter
//=============================================================================
(function($) {

	var alias_command261 = $.prototype.command261;

	// Play Movie
	$.prototype.command261 = function() {
		if (!$gameMessage.isBusy()) {
			if (this._params[0].length > 0) {
				var lastCommand = this._index > 0 ? this._list[this._index - 1] : null;
				if (lastCommand != null && 
					(lastCommand.code == 108 || lastCommand.code == 408) && 
					(!!lastCommand.parameters[0].match(/<AsyncVideo>/i) || 
						!!lastCommand.parameters[0].match(/<AsyncVideo\s*:\s*(\d+)>/i))) {
					if (!!lastCommand.parameters[0].match(/<AsyncVideo\s*:\s*(\d+)>/i))
						MBS.AsyncMovies._switch = parseInt((/<AsyncVideo\s*:\s*(\d+)>/i).exec(lastCommand.parameters[0])[1]);
					MBS.AsyncMovies.play(this._params[0]);
					if (MBS.AsyncMovies._switch)
						$gameSwitches.setValue(MBS.AsyncMovies._switch, false);
				} else {
				    alias_command261.apply(this, arguments);
				}
			} else {
				MBS.AsyncMovies.stop();
				if (MBS.AsyncMovies._switch)
					$gameSwitches.setValue(MBS.AsyncMovies._switch, true);
				this.setWaitMode('message');
			}
			this._index++;
		}
	    return false;
	};

})(Game_Interpreter);
