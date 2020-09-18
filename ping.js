const Discord = require('discord.js');
const { Client, Util } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'get bot and api ping',
    execute(message, args) {
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
    },
};