const { Client, Util } = require('discord.js')
const ytdl = require('ytdl-core')
var PREFIX = '-'
var version = '0.4.0'
const TOKEN = 'NzUzNjA1NDcxNDIzODIzOTY0.X1onyQ.fc-vQnaXY0Wh3ahia8rLTGFAC4I'
const YouTube = require('simple-youtube-api')
const covid = require('novelcovid')
const Discord = require('discord.js')
const moment = require('moment')
var apiKey = 'AIzaSyDhKK_Kcwl5Rjf0xJpDOc_NnERS15S7k80'

const client = new Client({ disableEveryone: true })

const youtube = new YouTube(apiKey)

const queue = new Map()

// Functions below

function rng(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso 
}

// End

client.on('ready', () => {
    console.log('Bot online\nBot creato con amore da x_derx_it e con l\'aiuto formidabile di CoachYT\nVersione: ' + version)
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(!message.content.startsWith(PREFIX)) return;

    const args = message.content.substring(PREFIX.length).split(" ")
    const searchString = args.slice(1).join(' ')
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : ''
    const serverQueue = queue.get(message.guild.id)
    const mentionedMember = message.channel.members.first()

    if(message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("Devi essere in un canale vocale!")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("Non ho il permesso per connettermi al canale!")
        if(!permissions.has('SPEAK')) return message.channel.send("Non ho il permesso per parlare nel canale!")

        try {
            var video = await youtube.getVideoByID(url)
        } catch {
            try{
                var videos = await youtube.searchVideos(searchString, 1)
                var video = await youtube.getVideoByID(videos[0].id)
            } catch {
                return message.channel.send("Non sono riuscito a trovare nessun video!")
            }
        }
        const song = {
            id: video.id,
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`
        }

        if(!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            }
            queue.set(message.guild.id, queueConstruct)

            queueConstruct.songs.push(song)

            try {
                var connection = await voiceChannel.join()
                queueConstruct.connection = connection
                play(message.guild, queueConstruct.songs[0])
            } catch (error) {
                console.log(`C'e' stato un errore mentre mi connettevo al canale vocale: ${error}`)
                queue.delete(message.guild.id)
                message.channel.send(`C'e' stato un errore mentre mi connettevo al canale vocale: ${error}`)
            }
        } else {
            serverQueue.songs.push(song)
            return message.channel.send(`**${song.title}** è stata aggiunta alla coda!`)
        }
        return undefined
    } else if (message.content.startsWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!")
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        message.channel.send("Ho fermato la musica!")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!")
        if(!serverQueue) return message.channel.send("Non c'e' niente in coda!")
        serverQueue.connection.dispatcher.end()
        message.channel.send("Ho skippato la canzone!")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}volume`)) {
        if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!")
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        if(!args[1]) return message.channel.send(`Il volume è: **${serverQueue.volume}**`)
        if(isNaN(args[1])) return message.channel.send("Quello non è un numero valido!")
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5)
        message.channel.send(`Ho cambiato il volume a: **${args[1]}**`)
        return undefined
    } else if (message.content.startsWith(`${PREFIX}np` || 'nowplaying')) {
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        message.channel.send(`In riproduzione: **${serverQueue.songs[0].title}**`)
        return undefined
    } else if (message.content.startsWith(`${PREFIX}queue`)) {
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        message.channel.send(`
__**Canzoni in coda:**__
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}

**Ora in Riproduzione:** ${serverQueue.songs[0].title}
        `, { split: true })
        return undefined
    } else if (message.content.startsWith(`${PREFIX}pause`)) {
        if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale")
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        if(!serverQueue.playing) return message.channel.send("La riproduzione è già in pausa!")
        serverQueue.playing = false
        serverQueue.connection.dispatcher.pause()
        message.channel.send("Ho messo in pausa la riproduzione!")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}resume`)) {
        if(!message.member.voice.channel) return message.channel.send("Devi essere in un canale vocale!")
        if(!serverQueue) return message.channel.send("Non c'e' niente in riproduzione!")
        if(serverQueue.playing) return message.channel.send("La riproduzione non è in pausa!")
        serverQueue.playing = true
        serverQueue.connection.dispatcher.resume()
        message.channel.send("Ho ricominciato la riproduzione!")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}ping`)) {

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
        }
    )} else if (message.content.startsWith(`${PREFIX}delete`)) {
        // sleep function for waiting time 
        function sleep(milliseconds) {
            const date = Date.now();
            let currentDate = null;
            do {
              currentDate = Date.now();
            } while (currentDate - date < milliseconds);
          }
        // end

        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.reply('Non hai il permesso!');
        if(!args[0]) return message.reply('Errore! Uso: -delete <messaggi> (max 100)');
        if(parseInt(args[0]) > 99) return message.reply('Non puoi eliminare più di 100 messaggi!');

        message.channel.bulkDelete(parseInt(args[0]) + 1)
            message.channel.send(`Ho cancellato ${args[0]} messaggi!`);
            sleep(3000);
            message.channel.bulkDelete(1);
    } else if (message.content.startsWith(`${PREFIX}covid`)) {
        const covidStats = await covid.all()

        return message.channel.send(new Discord.MessageEmbed()
            .setTitle('Statistiche COVID-19')
            .setColor("RED")
            .addFields(
                { name: `Casi`, value: covidStats.cases.toLocaleString(), inline: true},
                { name: `Casi oggi`, value: covidStats.todayCases.toLocaleString(), inline: true},
                { name: `Morti`, value: covidStats.deaths.toLocaleString(), inline: true},
                { name: `Morti oggi`, value: covidStats.todayDeaths.toLocaleString(), inline: true},
                { name: `Ricoverati`, value: covidStats.recovered.toLocaleString(), inline: true},
                { name: `Ricoverati oggi`, value: covidStats.todayRecovered.toLocaleString(), inline: true},
                { name: `Infettati adesso`, value: covidStats.active.toLocaleString(), inline: true},
                { name: `Condizione critica`, value: covidStats.critical.toLocaleString(), inline: true},
                { name: `Testati totali`, value: covidStats.tests.toLocaleString(), inline:true},
            )
            .setThumbnail('https://cdn4.telesco.pe/file/TNcTIdRrxhTQCEGqYOWDWKHW8XUlDlcLPrHy6MP2d3BK-ogLAs3JYVURkV-uV_4gZqsmMNoxe66LNF-fJaqBcSOWeCyTa9F5eYF4vLODM9cTfe9E6awOb7qbBj_k8IjK2tdcos6_IHuH8bDUdGfc-lGlW-btVAcPBYgAly1k1ujxMRsPO16nKwoWeq-aQFQSEv2YsjAvZvjfyEG_a3oSGwgaOfwTNP0toVrf7bU9DaXFE-ER0eJs88mP09ZqRm3MCYyv5cZflefjnQe2Ig9LG25pxIEADvWVX3aByeYMuprMi41LyQG6eIoIxhH_GIIzU-vxcblKTgpZ-MZmDzekgw.jpg')
            .setFooter('Bot creato con amore da x_derx_it')
        )
    } else if (message.content.startsWith(`${PREFIX}kick`)) {
        const reason = args.slice(2).join(" ")
        if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send("Non hai il permesso!")
        if (!message.guild.me.hasPermission('KICK_MEMBERS')) return message.channel.send("Non ho il permesso di kickare!")
        if(!args[1]) return message.channel.send("Devi taggare un membro!")
        if(!mentionedMember) return message.channel.send("Non posso trovare quel membro!")
        if(mentionedMember.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.owner.id) {
            return message.channel.send("Non puoi kickare quell'utente perché il tuo ruolo è più basso del loro.")
        }
        if(mentionedMember.id === message.author.id) return message.channel.send("Non puoi kickare te stesso!")
        if(mentionedMember.kickable) {
            var embed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username} - (${message.author.id})`, message.author.displayAvatarURL())
            .setThumbnail(mentionedMember.user.displayAvatarURL())
            .setColor('#ebb734')
            .setDescription(`
**Membro:** ${mentionedMember.user.username} - (${mentionedMember.user.id})
**Azione:** Kick
**Motivo:** ${reason || "Non definita"}
**Channel:** ${message.channel}
**Data:** ${moment().format('llll')}
            `)
            message.channel.send(embed)
            mentionedMember.kick()
        } else {
            return message.channel.send("Non posso kickare quell'utente, controlla che io abbia i permessi!")
        }
        return undefined
    } else if (message.content.startsWith(`${PREFIX}ban`)) {
        const reason = args.slice(2).join(" ")
        if(!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Non hai il permesso!")
        if(!message.guild.me.hasPermission('BAN_MEMBERS')) return message.channel.send("Non ho il permesso di bannare!")
        if(!args[1]) return message.channel.send("Devi taggare un membro!")
        if(!mentionedMember) return message.channel.send("Non posso strovare quel membro!")
        if(mentionedMember.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.owner.id) {
            return message.channel.send("Non puoi bannare quel membro perché il tuo ruolo è più basso del loro!")
        }
        if(mentionedMember.id === message.author.id) return message.channel.send("Non puoi bannare te stesso!")
        if(mentionedMember.bannable) {
            var embed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username} - (${message.author.id})`, message.author.displayAvatarURL())
            .setThumbnail(mentionedMember.user.displayAvatarURL())
            .setColor('RED')
            .setDescription(`
**Membro:** ${mentionedMember.user.username} - (${mentionedMember.user.id})
**Azione:** Ban
**Motivo:** ${reason || "Non definita"}
**Channel:** ${message.channel}
**Data:** ${moment().format('llll')}            
            `)
            message.channel.send(embed)
            mentionedMember.ban()
        } else {
            return message.channel.send("Non ho il permesso per bannare questo membro, controlla che io abbia i permessi!")
        }
    } else if (message.content.startsWith(`${PREFIX}settings`)) {
        if(!args[1]) {
                var embed = new Discord.MessageEmbed()
                    .setTitle('Bot Settings')
                    .addField('Sezione Musica', '`-settings music`')
                    .addField('Sezione Moderazione', '`-settings moderation`')
                    .addField('Sezione Varie', '`-settings varies`')
                    .addField('Sezione Prefix', '`-settings prefix`')
                message.channel.send(embed)        
        } else if(args[1] === 'music') {
            var embed2 = new Discord.MessageEmbed()
                .setTitle('Sezione Musica')
                .addField('-play', '`Avvia la riproduzione inserendo una canzone`')
                .addField('-stop', '`Ferma la riproduzione e fa uscire il bot`')
                .addField('-pause', '`Mette in pausa la riproduzione`')
                .addField('-resume', '`Fa ripartire la riproduzione`')
                .addField('-volume', '`Regola il volume, range consigliato 1.0 - 5.0`')
                .addField('-np', '`Informazioni sulla riproduzione attuale`')
                .addField('-queue', '`Informazioni sulla coda`')
            message.channel.send(embed2)
        } else if(args[1] === 'moderation') {
            var embed3 = new Discord.MessageEmbed()
                .setTitle('Sezione Musica')
                .addField('-kick', '`Kicka un membro con o senza motivazione`')
                .addField('-ban', '`Banna un membro con o senza motivazione`')
            message.channel.send(embed3)
        } else if(args[1] === 'varies') {
            var embed4 = new Discord.MessageEmbed()
                .setTitle('Sezione Varie')
                .addField('-delete <messaggi>', '`Elimina messaggi`')
                .addField('-ping', '`Ricevi la Latenza del Bot e dell\'API`')
            message.channel.send(embed4)
        } else if(!args[3] && !args[2] && args[1] === 'prefix') {
            var embed5 = new Discord.MessageEmbed()
                .setTitle('Sezione Prefix')
                .addField('-settings prefix change/reset', '`Resetta o cambia il prefix`')
            message.channel.send(embed5)
        } else if(!args[3] && args[2] === 'reset' && args[1] === 'prefix') {
            message.channel.send("Prefisso resettato con -")
            PREFIX = '-'
        } else if(!args[3] && args[2] === 'change' && args[1] === 'prefix') {
            message.channel.send("Uso: -settings prefix change <prefisso>")
        } else if(args[3] && args[2] === 'change' && args[1] === 'prefix') {
            message.channel.send(`Prefisso cambiato con ${args[3]}`)
            PREFIX = args[3]
        }
    } else if (message.content.startsWith(`${PREFIX}rng`)) {
        if(!args[1]) {
        message.channel.send(`Uso: ${PREFIX}rng n1 n2`)
        } else if(args[1] && args[2]) {
            var embed6 = new Discord.MessageEmbed()
            .setTitle('Random Number Generator')
            .addField(`Da ${args[1]} a ${args[2]}`, 'L')
            .addField(`Risulato`, rng(args[1], args[2]))
            .setFooter('Bot creato con amore da x_derx_it')
            .setTimestamp()
            message.channel.send(embed6)
            return undefined
        }
    } else if (message.content.startsWith(`${PREFIX}dado`)) {
        if(!args[1]) {
            var dado = new Discord.MessageEmbed()
                .setTitle('Il dado è atterrato!')
                .addField('Risultato', rng(1,6))
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
            message.channel.send(dado)
        } else if (args[1]) {
            var dado = new Discord.MessageEmbed()
                .setTitle('Il dado è atterrato!')
                .addField('Risultato', rng(1,args[1]))
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
            message.channel.send(dado)
        }
        /*
        } else if(args[1] === 'spicy') {
            var dado1 = new Discord.MessageEmbed()
                .setTitle('Il dado è atterrato!')
                .addField('Risultato', rng(15,20))
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
            message.channel.send(dado1)
        } else if(message.author.id === '727491422009163826') {
            var dado2 = new Discord.MessageEmbed()
                .setTitle('Il dado è atterrato!')
                .addField('Risultato', rng(15,20))
                .setFooter('Bot creato con amore da x_derx_it')
                .setTimestamp()
            message.channel.send(dado2)
        } */
    }
})


function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if(!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        return
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
    .on('finish', () => {
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
    })
    .on('error', error => {
        console.log(error)
    })
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)

    serverQueue.textChannel.send(`Inizio a riprodurre: **${song.title}**`)
}

client.login(TOKEN)