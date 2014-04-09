/**
 * pokemiku.js v0.1.0
 *
 *    Copyright 2014 increal(mzsm)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

var PokeMiku = function(onSuccess, onFailure) {
    this.isReady = false;
    this.MIDIAccess = null;
    this.input = null;
    this.output = null;
    this.onmidimessage = function(){};
    this.onnoteon = function(){};
    this.onnoteoff = function(){};
    this.onpitchbend = function(){};
    this.currentNote = null;
    this.settings = {
        encodeRules: ["KANA", "XSAMPA", "ROMAN"],
        optimize_n: true
    };

    this.initialize(onSuccess || function(){}, onFailure || function(){});
};
PokeMiku.prototype = {
    SYSEX_PREFIX: [0x43, 0x79, 0x09, 0x11],
    SYSEX_SUFFIX: 0xF7,
    MESSAGE_TYPES: {
        NOTE_OFF: 0x80,
        NOTE_ON: 0x90,
        POLYPHONIC_AFTER_TOUCH: 0xA0,
        CONTROL_CHANGE: 0xB0,
        PROGRAM_CHANGE: 0xC0,
        CHANNEL_AFTER_TOUCH: 0xD0,
        PITCH_BEND_CHANGE: 0xE0,
        SYSEX: 0xF0
    },
    CHARACTERS_TYPE: {
        ROMAN: "ROMAN",
        XSAMPA: "XSAMPA",
        KANA: "KANA"
    },
    CHARACTERS: {
        ROMAN: [
            "a", "i", "u", "e", "o",
            "ka", "ki", "ku", "ke", "ko",
            "ga", "gi", "gu", "ge", "go",
            "kya", "kyu", "kyo",
            "gya", "gyu", "gyo",
            "sa", "si", "su", "se", "so",
            "za", "zi", "zu", "ze", "zo",
            "sha", "shi", "shu", "she", "sho",
            "jya", "ji", "ju", "je", "jo",
            "ta", "ti", "tu", "te", "to",
            "da", "di", "du", "de", "do",
            "tyu", "dyu",
            "cha", "chi", "chu", "che", "cho",
            "tsa", "tsi", "tsu", "tse", "tso",
            "na", "ni", "nu", "ne", "no",
            "nya", "nyu", "nyo",
            "ha", "hi", "hu", "he", "ho",
            "ba", "bi", "bu", "be", "bo",
            "pa", "pi", "pu", "pe", "po",
            "hya", "hyu", "hyo",
            "bya", "byu", "byo",
            "pya", "pyu", "pyo",
            "fa", "fi", "fyu", "fe", "fo",
            "ma", "mi", "mu", "me", "mo",
            "mya", "myu", "myo",
            "ya", "yu", "yo",
            "ra", "ri", "ru", "re", "ro",
            "rya", "ryu", "ryo",
            "wa", "wi", "we", "wo",
            "N\\", "m", "N", "J", "n"
        ],
        XSAMPA: [
            "a", "i", "M", "e", "o",
            "ka", "k'i", "kM", "ke", "ko",
            "ga", "g'i", "gM", "ge", "go",
            "k'a", "k'M", "k'o",
            "g'a", "g'M", "g'o",
            "sa", "si", "sM", "se", "so",
            "dza", "dZi", "dzM", "dze", "dzo",
            "Sa", "Si", "SM", "Se", "So",
            "dZa", "dZi", "dZM", "dZe", "dZo",
            "ta", "t'i", "tM", "te", "to",
            "da", "d'i", "dM", "de", "do",
            "t'M", "d'M",
            "tSa", "tSi", "tSM", "tSe", "tSo",
            "tsa", "tsi", "tsM", "tse", "tso",
            "na", "Ji", "nM", "ne", "no",
            "Ja", "JM", "Jo",
            "ha", "Ci", "p\\M", "he", "ho",
            "ba", "b'i", "bM", "be", "bo",
            "pa", "p'i", "pM", "pe", "po",
            "Ca", "CM", "Co",
            "b'a", "b'M", "b'o",
            "p'a", "p'M", "p'o",
            "p\\a", "p\\'i", "p\\'M", "p\\e", "p\\o",
            "ma", "m'i", "mM", "me", "mo",
            "m'a", "m'M", "m'o",
            "ja", "jM", "jo",
            "4a", "4'i", "4M", "4e", "4o",
            "4'a", "4'M", "4'o",
            "wa", "wi", "we", "wo",
            "N\\", "m", "N", "J", "n"
        ],
        KANA: [
            "あ", "い", "う", "え", "お",
            "か", "き", "く", "け", "こ",
            "が", "ぎ", "ぐ", "げ", "ご",
            "きゃ", "きゅ", "きょ",
            "ぎゃ", "ぎゅ", "ぎょ",
            "さ", "すぃ", "す", "せ", "そ",
            "ざ", "ずぃ", "ず", "ぜ", "ぞ",
            "しゃ", "し", "しゅ", "しぇ", "しょ",
            "じゃ", "じ", "じゅ", "じぇ", "じょ",
            "た", "てぃ", "とぅ", "て", "と",
            "だ", "でぃ", "どぅ", "で", "ど",
            "てゅ", "でゅ",
            "ちゃ", "ち", "ちゅ", "ちぇ", "ちょ",
            "つぁ", "つぃ", "つ", "つぇ", "つぉ",
            "な", "に", "ぬ", "ね", "の",
            "にゃ", "にゅ", "にょ",
            "は", "ひ", "ふ", "へ", "ほ",
            "ば", "び", "ぶ", "べ", "ぼ",
            "ぱ", "ぴ", "ぷ", "ぺ", "ぽ",
            "ひゃ", "ひゅ", "ひょ",
            "びゃ", "びゅ", "びょ",
            "ぴゃ", "ぴゅ", "ぴょ",
            "ふぁ", "ふぃ", "ふゅ", "ふぇ", "ふぉ",
            "ま", "み", "む", "め", "も",
            "みゃ", "みゅ", "みょ",
            "や", "ゆ", "よ",
            "ら", "り", "る", "れ", "ろ",
            "りゃ", "りゅ", "りょ",
            "わ", "うぃ", "うぇ", "うぉ",
            "ん", "m", "N", "J", "n"
        ]
    },
    ALIASES: {
        ROMAN: {
            M: 0x02, kM: 0x07, gM:0x12
        },
        XSAMPA: {},
        KANA: {
            'づぁ': 0x1A, 'づぃ': 0x1B, 'づ': 0x1C, 'づぇ': 0x1D, 'づぉ': 0x1E, 'ぢ': 0x25,
            'ゐ': 0x78, 'ゑ': 0x79, 'を': 0x7A
        }
    },
    N_TYPES: {
        ROMAN: [
            [/n([^aiueoymbpkgztdnr]|$)/g, 'N\\$1'],    //N\
            [/n([mbp])/g, 'm$1'],   //m
            [/n([kg])/g, 'N$1'],    //ng
            [/n(n[iy])/g, 'J$1'],  //J
            [/n([ztdnr])/g, 'n$1'],  //n
        ],
        KANA: [
            [/ん([まみむめもばびぶべぼぱぴぷぺぽ])/g, 'm$1'],   //m
            [/ん([かきくけこがぎぐげご])/g, 'N$1'],    //ng
            [/ん(に)/g, 'J$1'],   //n
            [/ん([ざじずぜぞたちつてとだぢづでどなにぬねのらりるれろ])/g, 'n$1']   //n
            //※それ以外の“ん”はN\になるので変換不要
        ]
    },
    // Methods
    initialize: function(onSuccess, onFailure){
        //ブラウザがWeb MIDI APIに対応しているか確認
        if (!navigator.requestMIDIAccess) {
            return;
        }

        var self = this;
        navigator.requestMIDIAccess({sysex: true}).then(
            function(MIDIAccess){
                self.MIDIAccess = MIDIAccess;
                self.auto_detect_device();
                onSuccess.call(self);
            },
            onFailure
        );
        return function(access) {
            _this._access = access;
            return _this.auto_detect_device();
        };
    },
    _onmidimessage: function(event){
        var d = event.data;
        var messageType = d[0] & 0xF0;    //上位4ビットがメッセージ種別
        //var channel = d[0] & 0x0F;        //下位4ビットがチャンネル
        switch(messageType){
            case this.MESSAGE_TYPES.NOTE_ON:
                this.onnoteon(d[1], d[2], this.currentNote);
                break;
            case this.MESSAGE_TYPES.NOTE_OFF:
                this.onnoteoff(d[1], d[2]);
                break;
            case this.MESSAGE_TYPES.PITCH_BEND_CHANGE:
                this.currentNote = [d[1], d[2]];
                this.onpitchbend(d[1], d[2]);
                break;
        }
        this.onmidimessage.call(self, event);
    },
    /**
     * ポケット・ミクを自動的に識別して、使用する入力・出力デバイスに設定する
     * @param device_name
     * @returns [input, output]
     */
    auto_detect_device: function(device_name) {
        var i, len, devices, device;
        this.isReady = false;
        this.input = null;
        this.output = null;

        if(!this.MIDIAccess){
            return [null, null];
        }

        if(device_name == null){
            device_name = ['NSX-39 '];
        }
        if(!device_name instanceof Array){
            device_name = [device_name];
        }

        //引数で指定されたデバイス名を持つ入力デバイスを検索
        devices = this.MIDIAccess.inputs();
        len = devices.length;
        for(i = 0; i < len; i++){
            device = devices[i];
            if(device_name.indexOf(device.name) != -1){
                this.setInput(device);
                break;
            }
        }

        //同様の手法で出力デバイスも検索
        devices = this.MIDIAccess.outputs();
        len = devices.length;
        for(i = 0; i < len; i++){
            device = devices[i];
            if(device_name.indexOf(device.name) != -1){
                this.output = device;
                break;
            }
        }

        if (this.input && this.output) {
            this.isReady = true;
        }
        return [this.input, this.output];
    },
    setInput: function(inputDevice){
        var self = this;
        if(this.input){
            this.input.onmidimessage = function(){};
        }

        this.input = inputDevice;
        this.input.onmidimessage = function(event){
            self._onmidimessage(event);
        };
    },
    noteOff: function(note, velocity, channel){
        this.send(this.MESSAGE_TYPES.NOTE_OFF, channel, [note, velocity]);
    },
    noteOn: function(note, velocity, channel){
        this.send(this.MESSAGE_TYPES.NOTE_ON, channel, [note, velocity]);
    },
    controlChange: function(data1, data2, channel){
        this.send(this.MESSAGE_TYPES.CONTROL_CHANGE, channel, [data1, data2]);
    },
    /**
     * ピッチベンド
     * @param val
     * @param channel
     */
    pitchBendChange: function(val, channel){
        if(val < -8192 || val > 8191){
            throw new RangeError('Pitch Bend value MUST be between -8192 and 8191.');
        }
        val += 8192;
        var msb = Math.floor(val / 128);
        var lsb = val % 128;
        this.send(this.MESSAGE_TYPES.PITCH_BEND_CHANGE, channel, [lsb, msb]);
    },
    /**
     * “ん”の音を自動的に最適化する
     * @param string 歌詞の文字列
     * @param encodeRules 変換に使用する文字種
     * @returns string 返還後の文字列
     */
    optimize_n: function(string, encodeRules){
        var rules;
        for(var i=0; i<encodeRules.length; i++){
            rules = this.N_TYPES[encodeRules[i]];
            if(!rules){
                continue;
            }
            rules.forEach(function(val){
                var search  = val[0];
                var replace = val[1];
                string = string.replace(search, replace);
            });
        }
        return string;
    },
    /**
     * 歌詞の文字列を、ポケット・ミクが理解できる形式のバイト列に変換する
     * @param lyric 歌詞の文字列
     * @param optimize_n “ん”の音を自動的に最適化するかどうか
     * @param encodeRules 変換に使用する文字種
     * @returns {Array}
     */
    encodeLyric: function(lyric, optimize_n, encodeRules){
        if(optimize_n == null){
            optimize_n = this.settings.optimize_n;
        }
        if(encodeRules == null){
            encodeRules = this.settings.encodeRules;
        }
        if(!(encodeRules instanceof Array)){
            encodeRules = [encodeRules];
        }

        if(optimize_n){
            lyric = this.optimize_n(lyric, encodeRules);
        }

        var i, j, strlen, chars, _chars, found, candidate;
        var len = this.ENCODE_RULES.length;
        var encoded = [];
        while(lyric.length){
            found = false;
            for(i=0; i<len; i++){
                strlen = this.ENCODE_RULES[i][0];
                chars = this.ENCODE_RULES[i][1];
                candidate = lyric.substr(0, strlen);

                for(j=0; j<encodeRules.length; j++){
                    _chars = chars[encodeRules[j]];
                    if(!_chars){
                        break;
                    }
                    if(candidate in _chars){
                        encoded.push(_chars[candidate]);
                        lyric = lyric.substr(strlen);
                        found = true;
                        break;
                    }
                    if(found){
                        break;
                    }
                }
                if(found){
                    break;
                }
            }
            if(!found){
                //見つからなかったらその文字は無視する
                lyric = lyric.substr(1);
            }
        }
        return encoded;
    },
    decodeLyric: function(encoded, decodeRule){
        var self = this;
        if(decodeRule == null){
            decodeRule = this.settings.encodeRules[0];
        }
        return encoded.map(function(val){
            return self.CHARACTERS[decodeRule][val];
        });
    },
    /**
     * 歌詞データを送信
     * @param lyric
     */
    setLyric: function(lyric){

        var command = [0x0A, 0x00].concat(lyric);
        this.sendSysEx(command, 0);
    },
    /**
     * 出力デバイスにSysExを送信数
     * @param command コマンド配列
     * @param channel チャンネル
     */
    sendSysEx: function(command, channel){
        command = this.SYSEX_PREFIX.concat(command).concat(this.SYSEX_SUFFIX);
        this.send(this.MESSAGE_TYPES.SYSEX, channel, command);
    },
    /**
     * 出力デバイスにMIDIメッセージを送信する
     * @param messageType メッセージ種別
     * @param channel チャンネル
     * @param command コマンド配列
     */
    send: function(messageType, channel, command){
        if(channel == null){
            channel = 0;
        }else if(channel < 0 || channel > 0xF){
            throw new RangeError('Channel number MUST be between 0 and 15.');
        }
        command = [(messageType | channel)].concat(command);
        this._send(command);
    },
    /**
     * 出力デバイスへのMIDIメッセージ送信の薄いラッパー
     * @param command
     * @private
     */
    _send: function(command){
        if(!this.output){
            throw new Error('Output port is not found');
        }
        this.output.send(command);
    }
};
PokeMiku.prototype.ENCODE_RULES = (function(){
    var self = PokeMiku.prototype;
    var charsType, index, chars, len, char, key;
    var keys = [];
    var tmpTable = {};
    var convertRule = [];

    for(charsType in self.CHARACTERS){
        chars = self.CHARACTERS[charsType];
        len = chars.length;
        for(index=0; index<len; index++){
            char = chars[index];
            if(!(char.length in tmpTable)){
                keys.push(char.length);
                tmpTable[char.length] = {};
            }
            if(!(charsType in tmpTable[char.length])){
                tmpTable[char.length][charsType] = {};
            }
            tmpTable[char.length][charsType][char] = index;
        }
        for(char in self.ALIASES[charsType]){
            index = self.ALIASES[charsType][char];
            if(!(char.length in tmpTable)){
                keys.push(char.length);
                tmpTable[char.length] = {};
            }
            if(!(charsType in tmpTable[char.length])){
                tmpTable[char.length][charsType] = {};
            }
            tmpTable[char.length][charsType][char] = index;
        }
    }
    keys.sort();
    console.log(tmpTable);
    while(key = keys.pop()){
        convertRule.push([key, tmpTable[key]]);
    }
    console.log(convertRule);
    return convertRule;
})();
