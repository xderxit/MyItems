const Discord = require('discord.js');

const ytdl = require("ytdl-core");

const client = new Discord.Client();

var {prefix, token} = require("./config.json");

var queue = new Map();

client.once('ready', () => {
    console.log('MyItems Bot online!\nBot made with love by x_derx_it!');
})

client.on('message', async message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    let serverQueue = queue.get(message.guild.id);

    const args = message.content.slice(prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();

    switch (command) {
        case 'ping':
            message.channel.send('Calcolando il ping...').then((resultMessage) => {
                const ping = resultMessage.createdTimestamp - message.createdTimestamp;
    
                const messageEmbed = new Discord.MessageEmbed()
                    .setColor('#30e3ff')
                    .addField('Latenza Bot', `${ping}ms`)
                    .addField('Latenza API', `${client.ws.ping}ms`)
                    .setThumbnail('https://cdn4.telesco.pe/file/TNcTIdRrxhTQCEGqYOWDWKHW8XUlDlcLPrHy6MP2d3BK-ogLAs3JYVURkV-uV_4gZqsmMNoxe66LNF-fJaqBcSOWeCyTa9F5eYF4vLODM9cTfe9E6awOb7qbBj_k8IjK2tdcos6_IHuH8bDUdGfc-lGlW-btVAcPBYgAly1k1ujxMRsPO16nKwoWeq-aQFQSEv2YsjAvZvjfyEG_a3oSGwgaOfwTNP0toVrf7bU9DaXFE-ER0eJs88mP09ZqRm3MCYyv5cZflefjnQe2Ig9LG25pxIEADvWVX3aByeYMuprMi41LyQG6eIoIxhH_GIIzU-vxcblKTgpZ-MZmDzekgw.jpg')
                    .setFooter('Bot creato con amore da x_derx_it')
                    .setTimestamp()
                message.channel.send(messageEmbed);
            });
            break;
        case 'play':
            if(!args[0]) return;
            let url = args.join(" ")
            if(!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) return message.channel.send('Questo non è un link di **Youtube!**');


            let vc = message.member.voice;

            if(!vc) return message.channel.send('Non sei in un canale vocale!')

            if(!vc.channel.permissionsFor(client.user).has('CONNECT') || !vc.channel.permissionsFor(client.user).has('CONNECT')) return message.channel.send('Non ho il permesso!');

            let songinfo = await ytdl.getInfo(url);
            let song = {
                title: songinfo.title,
                url: songinfo.video_url
            }

            if(!serverQueue) {
                let queueConst = {
                    textChannel: message.channel,
                    voiceChannel: vc.channel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };

                queue.set(message.guild.id, queueConst);
                queueConst.songs.push(song);

                try {
                    let connection = await vc.channel.join();
                    queueConst.connection = connection
                    playSong(message.guild, queueConst.songs[0])
                } catch (error) {
                    console.log(error)
                    queue.delete(message.guild.id);
                    var errore = new Discord.MessageEmbed()
                    .setColor('#30e3ff')
                    .addField('Ho avuto un errore!', 'Durante la connessione ad un canale vocale')
                    .addField('Errore', error)
                    .setThumbnail('https://cdn4.telesco.pe/file/TNcTIdRrxhTQCEGqYOWDWKHW8XUlDlcLPrHy6MP2d3BK-ogLAs3JYVURkV-uV_4gZqsmMNoxe66LNF-fJaqBcSOWeCyTa9F5eYF4vLODM9cTfe9E6awOb7qbBj_k8IjK2tdcos6_IHuH8bDUdGfc-lGlW-btVAcPBYgAly1k1ujxMRsPO16nKwoWeq-aQFQSEv2YsjAvZvjfyEG_a3oSGwgaOfwTNP0toVrf7bU9DaXFE-ER0eJs88mP09ZqRm3MCYyv5cZflefjnQe2Ig9LG25pxIEADvWVX3aByeYMuprMi41LyQG6eIoIxhH_GIIzU-vxcblKTgpZ-MZmDzekgw.jpg')
                    .setFooter('Bot creato con amore da x_derx_it')
                    .setTimestamp()
                    return message.channel.send(errore);
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(`${song.title} è stata aggiunta alla coda!`);
            }
            break;
            case 'stop':
                if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!");
                if(!serverQueue) return message.channel.send("Non c'e' il bot nel canale vocale!");
                serverQueue.songs = [0];
                serverQueue.connection.dispatcher.end();
                message.channel.send("Ho fermato la musica!");
            break;
            case 'skip':
                if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!");
                if(!serverQueue) return message.channel.send("Non c'e' nessuna canzone in coda!");
                queueConst.connection.dispatcher.end();
                var canzone = new Discord.MessageEmbed()
                .setColor('#30e3ff')
                .addField('Ho skippato la canzone!')
                .addField('Canzone skippata:', song.title)
                .setThumbnail('https://cdn4.telesco.pe/file/TNcTIdRrxhTQCEGqYOWDWKHW8XUlDlcLPrHy6MP2d3BK-ogLAs3JYVURkV-uV_4gZqsmMNoxe66LNF-fJaqBcSOWeCyTa9F5eYF4vLODM9cTfe9E6awOb7qbBj_k8IjK2tdcos6_IHuH8bDUdGfc-lGlW-btVAcPBYgAly1k1ujxMRsPO16nKwoWeq-aQFQSEv2YsjAvZvjfyEG_a3oSGwgaOfwTNP0toVrf7bU9DaXFE-ER0eJs88mP09ZqRm3MCYyv5cZflefjnQe2Ig9LG25pxIEADvWVX3aByeYMuprMi41LyQG6eIoIxhH_GIIzU-vxcblKTgpZ-MZmDzekgw.jpg')
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
                message.channel.send(canzone);
            break;
            case 'volume':
                if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!");
                if(!serverQueue) return message.channel.send("Non c'e' il bot nel canale vocale!");
                if(!args[0]) return message.channel.send(`Volume attuale: **${serverQueue.volume}**`);
                if(isNaN(args[0])) return message.channel.send("Quello non è un numero valido!");
                serverQueue.volume = args[1];
                serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5);
                message.channel.send(`Ho cambiato il volume a: **${args[0]}**`);
            break;
            case 'np' || 'nowplaying':
                if(!serverQueue) return message.channel.send("Non c'e' niente in ascolto!");
                var nowPlaying = new Discord.MessageEmbed()
                .setColor('#30e3ff')
                .addField('Canzone attuale', song.title)
                .setThumbnail('https://cdn4.telesco.pe/file/TNcTIdRrxhTQCEGqYOWDWKHW8XUlDlcLPrHy6MP2d3BK-ogLAs3JYVURkV-uV_4gZqsmMNoxe66LNF-fJaqBcSOWeCyTa9F5eYF4vLODM9cTfe9E6awOb7qbBj_k8IjK2tdcos6_IHuH8bDUdGfc-lGlW-btVAcPBYgAly1k1ujxMRsPO16nKwoWeq-aQFQSEv2YsjAvZvjfyEG_a3oSGwgaOfwTNP0toVrf7bU9DaXFE-ER0eJs88mP09ZqRm3MCYyv5cZflefjnQe2Ig9LG25pxIEADvWVX3aByeYMuprMi41LyQG6eIoIxhH_GIIzU-vxcblKTgpZ-MZmDzekgw.jpg')
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
                message.channel.send(nowPlaying);
            break;
            case 'queue':
                if(!serverQueue) return message.channel.send("Non c'e' niente in coda!");
                message.channel.send(`
__**Canzoni in coda:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}

**In ascolto adesso:** ${serverQueue.songs[0].title}
        `, { split: true });
            break;
            case 'pause':
                if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale per metteree in pausa!");
                if(!serverQueue) return message.channel.send("Non c'e' niente in ascolto!");
                if(!serverQueue.playing) return message.channel.send("La canzone è già in pausa!");
                serverQueue.playing = false;
                serverQueue.connection.dispatcher.pause();
                message.channel.send("Ho messo in pausa la musica!");
            break;
            case 'resume':
                if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale per far ripartire la musica!");
                if(!serverQueue) return message.channel.send("Non c'e' niente in ascolto");
                if(serverQueue.playing) return message.channel.send("La musica è già in ascolto!");
                serverQueue.playing = true;
                serverQueue.connection.dispatcher.resume();
                message.channel.send("Ho fatto ripartire la musica!");
            break;
    }
});

/**
 * |
 * @param {Discord.Guild} guild |
 * @param {Object} song
 * 
 */ 
async function playSong(guild, song) {
    let serverQueue = queue.get(guild.id);

    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url)).on('end', () => {
        serverQueue.songs.shift();
        playSong(guild, serverQueue.songs[0])
    })
    .on('error', () => {
        console.log(error)
    })

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(token);