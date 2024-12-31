const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

// Self-bot tokeni ve ses kanalı ID'sini buraya ekleyin
const selfbotToken = 'token'; // Self-bot tokeninizi buraya ekleyin
const channelId = 'channel'; // Bağlanılacak ana ses kanalı ID'si
const checkChannelId = 'id'; // Kullanıcının girip çıkması kontrol edilecek kanal ID'si

const selfbot = new Client();

selfbot.once('ready', async () => {
    await joinChannel(); // Ses kanalına bağlan
});

// Ses kanalına bağlanma fonksiyonu
async function joinChannel() {
    const guild = selfbot.guilds.cache.find(g => g.channels.cache.has(channelId)); // Kanala göre sunucuyu bul
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    if (channel.type === 'GUILD_VOICE') {
        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false,
            });

            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                await joinChannel(); // Yeniden bağlan
            });
        } catch (error) {
            // Hata yakalama
        }
    }
}

// Kullanıcının ses kanalına giriş/çıkış durumunu kontrol et
selfbot.on('voiceStateUpdate', async (oldState, newState) => {
    // Kullanıcı checkChannelId kanalına girerse, belirtilen channelId'ye dön
    if (newState.channelId === checkChannelId) {
        await joinChannel(); // Ana kanala geri dön
    }
});

// Self-botu başlat
selfbot.login(selfbotToken).catch(() => {});
