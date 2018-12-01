"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var dotenv = require("dotenv");
var Discord = require("discord.js");
var config_1 = require("./config");
var simple_youtube_api_1 = require("simple-youtube-api");
var ytdl = require("ytdl-core");
(function () { return __awaiter(_this, void 0, void 0, function () {
    function handlePlaylist(url) {
        return __awaiter(this, void 0, void 0, function () {
            var match, playlist, videos, _i, _a, video, fetchedVideo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // if the URL does not include playlist
                        // (in format similar to https://www.youtube.com/watch?v=VIDEO_ID&list=LIST_ID)
                        if (!url.match(/playlist/)) {
                            match = url.match(/^https?:\/\/(www.)?youtube.com\/.+(list=|playlist=)(.*)$/);
                            if (!match || match.length < 3) {
                                return [2 /*return*/, msg.channel.send("🆘 Could not parse playlist.")];
                            }
                            url = "https://www.youtube.com/playlist?list=" + match[3];
                        }
                        return [4 /*yield*/, youtube.getPlaylist(url)];
                    case 1:
                        playlist = _b.sent();
                        if (!playlist)
                            return [2 /*return*/, msg.channel.send("Could not parse playlist.")];
                        return [4 /*yield*/, playlist.getVideos(10, {})];
                    case 2:
                        videos = _b.sent();
                        console.log(videos);
                        _i = 0, _a = Object.keys(videos).map(function (key) { return videos[Number(key)]; });
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        video = _a[_i];
                        return [4 /*yield*/, youtube.getVideoByID(video.id)];
                    case 4:
                        fetchedVideo = _b.sent();
                        if (!fetchedVideo) return [3 /*break*/, 6];
                        return [4 /*yield*/, handleVideo(fetchedVideo, true)];
                    case 5:
                        _b.sent(); // eslint-disable-line no-await-in-loop
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 3];
                    case 7: return [2 /*return*/, msg.channel.send("\u2705 Playlist: **" + playlist.title + "** has been added to the queue!")];
                }
            });
        });
    }
    function handleSingleString(searchString) {
        return __awaiter(this, void 0, void 0, function () {
            var videos, response, err_1, videoIndex, video, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, youtube.searchVideos(searchString, 10)];
                    case 1:
                        videos = _a.sent();
                        msg.channel.send("\n__**Song selection:**__\n\n" + videos.map(function (video2, index) { return "**" + ++index + " -** " + video2.title; }).join("\n") + "\n\nPlease provide a value to select one of the search results ranging from 1-10.\n      ");
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, msg.channel.awaitMessages(function (msg2) { return msg2.content > 0 && msg2.content < 11; }, {
                                maxMatches: 1,
                                time: 10000,
                                errors: ["time"]
                            })];
                    case 3:
                        response = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [2 /*return*/, msg.channel.send("No or invalid value entered, cancelling video selection.")];
                    case 5:
                        videoIndex = parseInt(response.first().content);
                        return [4 /*yield*/, youtube.getVideoByID(videos[videoIndex - 1].id)];
                    case 6:
                        video = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [2 /*return*/, msg.channel.send("🆘 I could not obtain any search results.")];
                    case 8:
                        if (!video)
                            return [2 /*return*/, msg.channel.send("🆘 I could not obtain any search results.")];
                        return [2 /*return*/, handleVideo(video)];
                }
            });
        });
    }
    function handleSingleUrl(url) {
        return __awaiter(this, void 0, void 0, function () {
            var video;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, youtube.getVideo(url)];
                    case 1:
                        video = _a.sent();
                        if (!video)
                            return [2 /*return*/, msg.channel.send("🆘 I could not obtain any search results.")];
                        return [2 /*return*/, handleVideo(video)];
                }
            });
        });
    }
    function handleVideo(video, playlist) {
        if (playlist === void 0) { playlist = false; }
        return __awaiter(this, void 0, void 0, function () {
            var voiceChannel, serverQueue, song, queueConstruct, connection, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        voiceChannel = msg.member.voiceChannel;
                        serverQueue = queue.get(msg.guild.id);
                        console.log(video);
                        song = {
                            id: video.id,
                            title: Discord.Util.escapeMarkdown(video.title),
                            url: "https://www.youtube.com/watch?v=" + video.id
                        };
                        if (!!serverQueue) return [3 /*break*/, 5];
                        queueConstruct = {
                            textChannel: msg.channel,
                            voiceChannel: voiceChannel,
                            connection: undefined,
                            songs: [],
                            volume: 5,
                            playing: true
                        };
                        queue.set(msg.guild.id, queueConstruct);
                        queueConstruct.songs.push(song);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, voiceChannel.join()];
                    case 2:
                        connection = _a.sent();
                        queueConstruct.connection = connection;
                        play(msg.guild, queueConstruct.songs[0]);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("I could not join the voice channel: " + error_1);
                        queue["delete"](msg.guild.id);
                        return [2 /*return*/, msg.channel.send("I could not join the voice channel: " + error_1)];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        serverQueue.songs.push(song);
                        console.log(serverQueue.songs);
                        if (playlist)
                            return [2 /*return*/, undefined];
                        else
                            return [2 /*return*/, msg.channel.send("\u2705 **" + song.title + "** has been added to the queue!")];
                        _a.label = 6;
                    case 6: return [2 /*return*/, undefined];
                }
            });
        });
    }
    function play(guild, song) {
        var serverQueue = queue.get(guild.id);
        if (!serverQueue.connection)
            return msg.channel.send("Somethig unexpected happened");
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue["delete"](guild.id);
            return;
        }
        console.log(serverQueue.songs);
        var dispatcher = serverQueue.connection
            .playStream(ytdl(song.url))
            .on("end", function (reason) {
            if (reason === "Stream is not generating quickly enough.")
                console.log("Song ended.");
            else
                console.log(reason);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
            .on("error", function (error) { return console.error(error); });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send("\uD83C\uDFB6 Start playing: **" + song.title + "**");
    }
    var client, youtube, queue, msg;
    var _this = this;
    return __generator(this, function (_a) {
        dotenv.config();
        if (!config_1.TOKEN)
            return [2 /*return*/, console.log("TOKEN is not set.")];
        if (!config_1.GOOGLE_API_KEY)
            return [2 /*return*/, console.log("GOOGLE_API_KEY is not set.")];
        client = new Discord.Client({ disableEveryone: true });
        youtube = new simple_youtube_api_1.YouTube(config_1.GOOGLE_API_KEY);
        queue = new Map();
        client.on("warn", console.warn);
        client.on("error", console.error);
        client.on("ready", function () { return console.log("Yo this ready!"); });
        client.on("disconnect", function () { return console.log("I just disconnected, making sure you know, I will reconnect now..."); });
        client.on("reconnecting", function () { return console.log("I am reconnecting now!"); });
        client.on("message", function (message) { return __awaiter(_this, void 0, void 0, function () {
            var args, searchString, url, serverQueue, command, voiceChannel, permissions;
            return __generator(this, function (_a) {
                msg = message;
                // eslint-disable-line
                if (msg.author.bot)
                    return [2 /*return*/, undefined];
                if (!msg.content.startsWith(config_1.PREFIX))
                    return [2 /*return*/, undefined];
                args = msg.content.split(" ");
                searchString = args.slice(1).join(" ");
                url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
                serverQueue = queue.get(msg.guild.id);
                if (!serverQueue || !serverQueue.connection)
                    return [2 /*return*/, msg.channel.send("Something unexpected happened")];
                command = msg.content.toLowerCase().split(" ")[0];
                command = command.slice(config_1.PREFIX.length);
                if (command === "play") {
                    voiceChannel = msg.member.voiceChannel;
                    if (!voiceChannel)
                        return [2 /*return*/, msg.channel.send("I'm sorry but you need to be in a voice channel to play music!")];
                    permissions = voiceChannel.permissionsFor(msg.client.user);
                    if (!permissions || !permissions.has("CONNECT")) {
                        return [2 /*return*/, msg.channel.send("I cannot connect to your voice channel, make sure I have the proper permissions!")];
                    }
                    if (!permissions.has("SPEAK")) {
                        return [2 /*return*/, msg.channel.send("I cannot speak in this voice channel, make sure I have the proper permissions!")];
                    }
                    if (url.match(/^https?:\/\/(www.)?youtube.com\/.+(list=|playlist=)(.*)$/)) {
                        handlePlaylist(url);
                    }
                    else if (url.match(/^https?:\/\/(www.)?youtube.com\/.+(.*)$/)) {
                        handleSingleUrl(url);
                    }
                    else {
                        handleSingleString(searchString);
                    }
                }
                else if (command === "skip") {
                    if (!msg.member.voiceChannel)
                        return [2 /*return*/, msg.channel.send("You are not in a voice channel!")];
                    if (!serverQueue)
                        return [2 /*return*/, msg.channel.send("There is nothing playing that I could skip for you.")];
                    serverQueue.connection.dispatcher.end("Skip command has been used!");
                    return [2 /*return*/, undefined];
                }
                else if (command === "stop") {
                    if (!msg.member.voiceChannel)
                        return [2 /*return*/, msg.channel.send("You are not in a voice channel!")];
                    if (!serverQueue)
                        return [2 /*return*/, msg.channel.send("There is nothing playing that I could stop for you.")];
                    serverQueue.songs = [];
                    serverQueue.connection.dispatcher.end("Stop command has been used!");
                    return [2 /*return*/, undefined];
                }
                else if (command === "volume") {
                    if (!msg.member.voiceChannel)
                        return [2 /*return*/, msg.channel.send("You are not in a voice channel!")];
                    if (!serverQueue)
                        return [2 /*return*/, msg.channel.send("There is nothing playing.")];
                    if (!args[1])
                        return [2 /*return*/, msg.channel.send("The current volume is: **" + serverQueue.volume + "**")];
                    serverQueue.volume = Number(args[1]);
                    serverQueue.connection.dispatcher.setVolumeLogarithmic(Number(args[1]) / 5);
                    return [2 /*return*/, msg.channel.send("I set the volume to: **" + args[1] + "**")];
                }
                else if (command === "np") {
                    if (!serverQueue)
                        return [2 /*return*/, msg.channel.send("There is nothing playing.")];
                    return [2 /*return*/, msg.channel.send("\uD83C\uDFB6 Now playing: **" + serverQueue.songs[0].title + "**")];
                }
                else if (command === "queue") {
                    if (!serverQueue)
                        return [2 /*return*/, msg.channel.send("There is nothing playing.")];
                    return [2 /*return*/, msg.channel.send("\n__**Song queue:**__\n\n" + serverQueue.songs.map(function (song) { return "**-** " + song.title; }).join("\n") + "\n\n**Now playing:** " + serverQueue.songs[0].title + "\n\t\t")];
                }
                else if (command === "pause") {
                    if (serverQueue && serverQueue.playing) {
                        serverQueue.playing = false;
                        serverQueue.connection.dispatcher.pause();
                        return [2 /*return*/, msg.channel.send("⏸ Paused the music for you!")];
                    }
                    return [2 /*return*/, msg.channel.send("There is nothing playing.")];
                }
                else if (command === "resume") {
                    if (serverQueue && !serverQueue.playing) {
                        serverQueue.playing = true;
                        serverQueue.connection.dispatcher.resume();
                        return [2 /*return*/, msg.channel.send("▶ Resumed the music for you!")];
                    }
                    return [2 /*return*/, msg.channel.send("There is nothing playing.")];
                }
                return [2 /*return*/, undefined];
            });
        }); });
        client.login(config_1.TOKEN);
        return [2 /*return*/];
    });
}); });
