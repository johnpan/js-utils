var utools = {

    utils: {
        version: 0.6,

        say: (...args) => {
            args.forEach((el) => {
                console.log(el);
                document.querySelector("#logs").innerText = el;
            });
        },

        urlOK: () => {
            return window.location.href.includes("/watch?");
        },

        beep: () => {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
                oscillator = audioCtx.createOscillator(),
                gainNode = audioCtx.createGain();
            oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
            gainNode.gain.value = .10;  // volume 0-1
            oscillator.frequency.value = 696; // frequency 40-6000
            oscillator.type = 'sine'; // type sine, square, sawtooth, triangle
            oscillator.start();
            setTimeout(function () { oscillator.stop(); }, 150); // duration ms
        },

        getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        createClass: (name, rules) => {
            let style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            if (!(style.sheet || {}).insertRule)
                (style.styleSheet || style.sheet).addRule(name, rules);
            else
                style.sheet.insertRule(name + "{" + rules + "}", 0);
        },

        evalFromTo: (str) => {
            /* returns array with nums from a string template like
            "1,2,[4-14],15, 17-28, 30", with or without '[]' */
            var zipArr = [],
                arr = str.split(",");
            arr.map(function (item) {
                var newItem = item.trim();
                if (isNaN(Number(newItem))) {
                    // not a number, check if equals'[min-max]'
                    if (newItem.indexOf("-") > 0) {
                        // get min & max numbers
                        var boundariesArr = newItem.split("-");
                        var min = boundariesArr[0];
                        var max = boundariesArr[1];
                        if (isNaN(Number(min))) {
                            // not a number because string is '[min'
                            min = min.substr(1);
                            max = max.substr(0, max.length - 1);
                        }
                    }
                    zipArr = zipArr.concat(utools.utils.populateIds(Number(min), Number(max)));
                } else {
                    // number, just push it
                    zipArr.push(Number(newItem));
                }
            });
            return zipArr;
        },

        populateIds: (lowEnd, highEnd) => {
            let list = [], i;
            for (i = lowEnd; i <= highEnd; i++) {
                list.push(i);
            }
            return list;
        },

        uiPrep: () => {
            document.querySelector("#interstitial").outerHTML += `<div id="uTools"><button onclick="utools.ytRealRandom.toggle()" id="btn_rr">RealRandom</button> | <button onclick="utools.antiFreezer.toggle()" id="btn_af">AntiFreeze</button> | <button onclick="utools.ytRealRandom.stickToggle()" id="btn_st">Stick</button> | <button onclick="utools.overlay.show()" id="btn_ov">Dark</button> | <span id="logs">YouTubeTools ready, ${utools.utils.version}</span></div>`;

            utools.overlay.init();
        },

        switchOnBtn: (elemId) => {
            document.querySelector("#" + elemId).style.backgroundColor = "yellowgreen";
        },

        switchOffBtn: (elemId) => {
            // console.log('switchOffBtn ' + elemId, document.querySelector("#" + elemId));
            document.querySelector("#" + elemId).style.backgroundColor = "";
        },

        findObjects: (arr, prop, val) => {
            // function returns an array with the found object(s) or an empty array
            // needs optimization. Add a parameter for exact match OR indexOf
            if (!arr || !arr[0])
                return [];
            if (!arr[0][prop]) {
                console.log("no such property");
                return [];
            }
            return arr.filter(function (pairItem) {
                if (pairItem[prop] == val)
                    return true;
                if (String(pairItem[prop]).indexOf(val) > -1)
                    return true;
            });
        },
    },

    overlay: {
        ewrap: null, // wrapper elemet

        init: function () {
            utools.overlay.ewrap = document.createElement("div");
            utools.overlay.ewrap.id = "owrap";
            utools.overlay.ewrap.style = "display:none; position:fixed; width:100%; height:100%; top:0; left:0; right:0; bottom:0; background-color:rgba(0, 0, 0, 0.8); z-index:999999999; cursor:po";
            utools.overlay.ewrap.addEventListener("click", utools.overlay.hide);
            document.body.appendChild(utools.overlay.ewrap);
        },

        show: function () {
            utools.overlay.ewrap.style.display = "block";
            utools.utils.switchOnBtn('btn_ov');
        },

        hide: function () {
            console.log('hey');
            utools.overlay.ewrap.style.display = "none";
            utools.utils.switchOffBtn('btn_ov');
        }
    },

    ytRealRandom: {
        runs: false,
        isStuck: false,
        songsPlayed: [],
        songClass: {
            divIndex: 0,
            songNumber: 1,
            songTitle: '',
            duration: 0
        },
        shouldPlayNextIn: 0,
        goRandomTimer: 0,
        watchdogSetter: 0,
        songsList: [],
        customSongList: null,

        toggle: () => {
            if (utools.ytRealRandom.runs) {
                utools.ytRealRandom.stop();
                utools.ytRealRandom.runs = false;
                utools.utils.switchOffBtn('btn_rr');
                return;
            }
            if (utools.ytRealRandom.start() === true) {
                utools.ytRealRandom.runs = true;
                utools.utils.switchOnBtn('btn_rr');
            }
        },

        stickToggle: () => {
            if (!utools.ytRealRandom.isStuck) {
                utools.ytRealRandom.isStuck = true;
                utools.utils.say('song stick: feature not ready yet');
                utools.utils.switchOnBtn('btn_st');
                // todo
                // stop all timers
                // find the current song, 
                // restart song
                // set interval timer 
                return;
            }
            utools.ytRealRandom.isStuck = false;
            utools.utils.say('song is unstick');

            utools.utils.switchOffBtn('btn_st');

            // todo
            // stop stickTimer
            // start()
        },

        song: () => {
            // create a song object
            return JSON.parse(JSON.stringify(utools.ytRealRandom.songClass));
        },

        setCustomSongList: (fromToStr) => {
            if (fromToStr === '') {
                // go back to using full song list
                utools.ytRealRandom.customSongList = null;
                return;
            }
            let customSongListNumbers = utools.utils.evalFromTo(fromToStr);
            // get songs by number, reading the songList
            utools.ytRealRandom.customSongList = utools.ytRealRandom.songsList.filter(song => {
                return customSongListNumbers.includes(song.songNumber);
            });
            utools.utils.say('songs you want: ', utools.ytRealRandom.customSongList);
            utools.ytRealRandom.stop();
            utools.ytRealRandom.clearSongsPlayed();
            utools.ytRealRandom.start();
        },

        stop: () => {
            clearTimeout(utools.ytRealRandom.watchdogSetter);
            clearTimeout(utools.ytRealRandom.goRandomTimer);
            utools.utils.say('realRandom timer stopped');
        },

        clearSongsPlayed: () => {
            utools.ytRealRandom.songsPlayed = [];
            // clear all red backgrounds
            let divs = document.getElementsByClassName("redified");
            while (divs.length) {
                divs[0].classList.remove("redified");
            }
        },

        chooseAnotherSong: () => {
            // will clear songs-played list if has to     
            let totalSongs = Number(document.querySelector('#publisher-container').innerText.split('/')[1]),
                customList = utools.ytRealRandom.customSongList;
            if ((utools.ytRealRandom.songsPlayed.length > 0.9 * totalSongs) ||
                (customList && utools.ytRealRandom.songsPlayed.length > 0.9 * customList.length)) {
                utools.ytRealRandom.clearSongsPlayed();
                utools.utils.say('more than 90% of songs played, reseting array');
            }
            // ensure not played before
            let nextNum = 2; let divFound, nextDivIndex;
            do {
                nextDivIndex = customList ?
                    customList[utools.utils.getRandomInt(0, customList.length - 1)].divIndex
                    :
                    utools.utils.getRandomInt(0, totalSongs - 1);
                try {
                    divFound = true;
                    let parent = document.querySelectorAll('#byline')[nextDivIndex].parentElement.parentElement.parentElement;
                    nextNum = Number(parent.querySelector("#index").innerText);
                } catch (err) {
                    divFound = false;
                }
            } while (
                utools.ytRealRandom.songsPlayed.includes(nextNum) ||
                !divFound ||
                isNaN(nextNum)
            );
            let nextSong = utools.utils.findObjects(utools.ytRealRandom.songsList, 'songNumber', nextNum)[0];
            return nextSong;
        },

        setCountdown: () => {
            utools.ytRealRandom.stop();
            // set countdown for next song
            const nextSongObj = utools.ytRealRandom.chooseAnotherSong();
            utools.utils.say('Next song: ' + nextSongObj.songNumber + ': ' + nextSongObj.songTitle + ' in (sec)' + (utools.ytRealRandom.shouldPlayNextIn - 1));
            utools.ytRealRandom.goRandomTimer = setTimeout(function () {
                utools.ytRealRandom.playSong(nextSongObj.songNumber);
                utools.ytRealRandom.shouldPlayNextIn = nextSongObj.duration;
                utools.ytRealRandom.setCountdown();
            }, ((utools.ytRealRandom.shouldPlayNextIn - 1) * 1000));
            // set a small interval to calc and correct next timeout
            utools.ytRealRandom.watchdogSetter = setInterval(function () {
                utools.ytRealRandom.updateSongsList();
            }, 10 * 1000);
        },

        playSong: (songNumber) => {
            const songObj = utools.utils.findObjects(utools.ytRealRandom.songsList, 'songNumber', songNumber)[0];
            if (!songObj) return;
            utools.utils.say('playSong: ' + songObj.songNumber + ', ' + songObj.songTitle);
            utools.ytRealRandom.songsPlayed.push(songObj.songNumber);
            // click the song to play
            let songDiv = document.querySelectorAll('#byline')[songObj.divIndex];
            songDiv.click();
            let coloredDiv = songDiv.parentElement.parentElement.parentElement;
            // add a class, to easily find and clear color when reset
            coloredDiv.classList.add("redified");
            // coloredDiv.style.backgroundColor = '#ffa3a2';
        },

        updateSongsList: () => {
            let totalSongs = Number(document.querySelector('#publisher-container').innerText.split('/')[1]);
            utools.ytRealRandom.songsList = [];
            let prevSongNumber = 1;

            for (let i = 0; i < totalSongs; i++) {
                try {
                    divFound = true;
                    let parent = document.querySelectorAll('#byline')[i].parentElement.parentElement.parentElement;
                    let thisSong = utools.ytRealRandom.song();
                    thisSong.songNumber = Number(parent.querySelector("#index").innerText);
                    if (isNaN(thisSong.songNumber)) {
                        // this song is playing right now!
                        thisSong.songNumber = prevSongNumber;
                    }
                    prevSongNumber = thisSong.songNumber;
                    thisSong.divIndex = i;
                    thisSong.songTitle = parent.querySelector('#video-title').innerText;
                    let durationText = parent.querySelectorAll('.ytd-thumbnail-overlay-time-status-renderer')[1].innerText.split(':');
                    thisSong.duration = durationText[0] * 60 + Number(durationText[1]);
                    utools.ytRealRandom.songsList.push(thisSong);
                } catch (err) {
                    // ignore this catch. Not all songs are in the loaded list.
                    divFound = false;
                }
            }
        },

        start: () => {
            if (!utools.utils.urlOK()) { return utools.utils.say("not proper web page"); }
            // create css
            utools.utils.createClass('.redified', "background-color: #ffa3a2;");
            // start
            utools.ytRealRandom.updateSongsList();
            console.log('songs list ', utools.ytRealRandom.songsList);
            if (utools.ytRealRandom.songsList.length == 0) {
                return utools.utils.say("no playlist found");
            }
            const firstSongObj = utools.ytRealRandom.chooseAnotherSong();
            utools.ytRealRandom.playSong(firstSongObj.songNumber);
            utools.ytRealRandom.shouldPlayNextIn = firstSongObj.duration;
            utools.ytRealRandom.setCountdown();
            return true;
        },

    },

    antiFreezer: {
        runs: false,
        log: true,  // toggle check logs
        freq: 2000, // set check freq
        notifyBeep: true,

        toggle: () => {
            if (utools.antiFreezer.runs) {
                utools.antiFreezer.stop();
                utools.antiFreezer.runs = false;
                utools.utils.switchOffBtn('btn_af');
                return;
            }
            if (utools.antiFreezer.start() === true) {
                utools.antiFreezer.runs = true;
                utools.utils.switchOnBtn('btn_af');
            }
        },

        stop: () => {
            clearInterval(window.antiFreezerTimer);
            utools.utils.say('antiFreeze timer stopped');
        },

        start: () => {
            if (!utools.utils.urlOK()) { return utools.utils.say("not proper web page"); }
            utools.utils.beep();
            window.antiFreezerTimer = setInterval(function () {
                let nodes = document.querySelectorAll("paper-dialog") || [], len = nodes.length;
                if (len == 0) return;
                nodes.forEach(dialog => {
                    if (dialog.style.zIndex > 2000) {
                        dialog.querySelector("paper-button").click();
                        if (utools.antiFreezer.notifyBeep) utools.utils.beep();
                        if (utools.antiFreezer.log) console.log("I have you covered! " + new Date().toLocaleTimeString());
                    }
                })
            }, utools.antiFreezer.freq);
            utools.utils.say('antiFreeze timer started');
            return true;
        },


    }

}

utools.utils.uiPrep(); 