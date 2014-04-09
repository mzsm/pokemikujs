"use strict";
var zeroPudding, formatDatetime, logger;
window.addEventListener("DOMContentLoaded", function(){
    zeroPudding = function(num, len){
        return ('0000'+num).slice(-len);
    };

    formatDatetime = function(date){
        return date.getFullYear() + '-' +
            zeroPudding(date.getMonth()+1, 2) + '-' +
            zeroPudding(date.getDate(), 2) + ' ' +
            zeroPudding(date.getHours(), 2) + ':' +
            zeroPudding(date.getMinutes(), 2) + '.' +
            zeroPudding(date.getSeconds(), 2) + '.' +
            zeroPudding(date.getMilliseconds(), 3)
    };

    var statusArea = document.getElementById('status');
    logger = function(logText){
        var newRow = document.createElement('DIV');
        newRow.innerText = formatDatetime(new Date()) + ': ' + logText;
        statusArea.insertBefore(newRow, statusArea.children[0]);
    };
}, false);