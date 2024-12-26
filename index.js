const express = require('express');
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = 3000; // Dinlenecek port

// Client'ı başlatıyoruz
const client = new Client({ checkUpdate: false });

// Değişkenleri .env dosyasından alıyoruz
const token = process.env.TOKEN;
const guildID = process.env.GUILD_ID;
const channelID = process.env.CHANNEL_ID;
const interval = 30000; // 30 saniye

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    await joinVC(client, token, guildID, channelID); // Ses kanalına bağlan
});

app.get('/hello', (req, res) => {
  res.send('Merhaba, dünya!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const oldVoice = oldState.channelId;
    const newVoice = newState.channelId;

    if (oldVoice !== newVoice) {
        if (!oldVoice) {
            // eski ses kanalından çıkmışsa
        } else if (!newVoice) {
            if (oldState.member.id !== client.user.id) return;
            await joinVC(client, token, guildID, channelID); // Ses kanalına yeniden bağlan
        } else {
            if (oldState.member.id !== client.user.id) return;
            if (newVoice !== channelID) {
                await joinVC(client, token, guildID, channelID); // Hedef ses kanalına bağlan
            }
        }
    }
});

// Ses kanalına bağlanma fonksiyonu
async function joinVC(client, token, guildID, channelID) {
    const guild = client.guilds.cache.get(guildID);
    const voiceChannel = guild.channels.cache.get(channelID);

    if (!voiceChannel || !voiceChannel.isVoice()) {
        console.log('Geçerli bir ses kanalı bulunamadı!');
        return;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
    });

    console.log('Ses kanalına bağlanıldı!');
}

async function visitLink(link) {
  try {
    const response = await axios.get(link);
    console.log(`Link ${link} başarıyla ziyaret edildi.`);
  } catch (error) {
    console.error(`Hata oluştu: ${error.message}`);
  }
}

setInterval(() => visitLink(process.env.LINK), interval);

client.login(token);
