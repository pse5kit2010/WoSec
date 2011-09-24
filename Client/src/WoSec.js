
/**
 * WoSec Client-Side
 * 
MIT Licence:
Copyright (c) 2011 Justus Maier, David Rieger, Oleg Peters, Philip Lingel

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the 
"Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */


/**
 * Namespace Deklaration und ein paar praktische Funktionen
 */

var WoSec = {};



WoSec.baseObject = {
	/**
	 * Führt eine Methode später aus
	 * Weitere Argumente werden an die Methode weitergegeben
	 * @param {Number} msec Zeitspanne die gewartet werden soll in Millisekunden
	 * @param {String} method Name der Methode die ausgeführt werden soll
	 */
	later: function (msec, method) {
        var that = this, args = Array.prototype.slice.apply(arguments, [2]);
        if (typeof method === 'string') {
            method = that[method];
        }
        setTimeout(function () {
            method.apply(that, args);
        }, msec);
        return that; // Cascade
    }
};

/**
 * Erzeugt Vererbung zwischen den gegebenen Klassen
 * @param {Function} subType erbende Klasse
 * @param {Function} superType Mutterklasse
 */
WoSec.inherit = function(subType, superType) {
    var prototype = Object.create(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
};

/**
 * Erweitert ein Objekt um die Methoden und Eigenschaften eines anderen
 * @param {Objekt} destination erbendes Objekt
 * @param {Objekt} source Quelle
 */
WoSec.extend = function(destination, source) {
  for (var p in source) {
    if (source.hasOwnProperty(p)) {
      destination[p] = source[p];
    }
  }
  return destination;
};
