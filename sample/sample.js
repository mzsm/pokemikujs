"use strict";
window.addEventListener("DOMContentLoaded", function(){

    var onSuccess = function(){
        logger('PokeMiku.js was initialized.');
    };
    var onFailure = function(){
        logger('Failure : requestMIDIAccess');
    };

    var pokemiku = new PokeMiku(onSuccess, onFailure);

    pokemiku.onmidimessage = function(event){
        var char;
        var i = 0;
        var message = [];

        while(1){
            char = event.data[i];
            if(char === undefined){
                break;
            }
            message.push('0x' + char.toString(16));
            i++;
        }
        logger('onmidimessage: [' + message.join(', ') + ']');
    };

    var LYRIC_TYPES = [
        ['KANA'],
        ['ROMAN'],
        ['XSAMPA'],
        ['KANA', 'ROMAN'],
        ['KANA', 'ROMAN', 'XSAMPA'],
        ['KANA', 'XSAMPA', 'ROMAN']
    ];
    document.getElementById('send_lyric').addEventListener('submit', function(event){
        var optimize_n = document.getElementById('optimize_n').checked;
        var lyric = document.getElementById('lyric').value;
        if(lyric.length){
            var lyricType = LYRIC_TYPES[document.getElementById('chara').value];
            var encoded = pokemiku.encodeLyric(document.getElementById('lyric').value, optimize_n, lyricType);
            pokemiku.setLyric(encoded);
            var decoded = pokemiku.decodeLyric(encoded);
            logger('Set lyric: ' + decoded.join(''));
        }
    }, false);
    document.getElementById('lyrics').addEventListener('change', function(event) {
        document.getElementById('lyric').value = event.target.value;
    }, false);

    var buttons = [].slice.call(document.getElementsByClassName('note_on_off'));
    console.log(buttons);
    buttons.forEach(function(btn){
        btn.addEventListener('click', function(event){
            var note = document.getElementById('note').value;
            var velocity = document.getElementById('velocity').value;
            if (event.target.name == 'noteon'){
                logger('Note ON: Note:' + note + ' Velocity:' + velocity);
                pokemiku.noteOn(note, velocity);

            }else{
                logger('Note OFF: Note:' + note + ' Velocity:' + velocity);
                pokemiku.noteOff(note, velocity);
            }
        }, false);
    });

    document.getElementById('control_modulation').addEventListener('click', function(event){
        var mod_level = parseInt(document.getElementById('mod_level').value);
        logger('Modulation: ' + mod_level);
        pokemiku.controlChange(0x01, mod_level);
    }, false);

    document.getElementById('control_all_sound_off').addEventListener('click', function(event){
        logger('All Sound Off');
        pokemiku.controlChange(0x78, 0x00);
    }, false);

    var forms = [].slice.call(document.getElementsByTagName('form'));
    forms.forEach(function(form){
        form.addEventListener('submit', function(event){
            event.preventDefault();
            return false;
        }, false);
    });
}, false);
