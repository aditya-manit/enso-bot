const Discord = require('discord.js')
const Levels = require('discord-xp')
const {Client} = require('discord.js');
const canvacord = require("canvacord");
const {MessageEmbed} = require("discord.js");
require("dotenv").config();




Levels.setURL("mongodb://127.0.0.1:27017")

const bot = new Client();
const THRESHOLD_LEVEL = 1;
const LEVEL_NEW = 1;
const LEVEL_OLD = 0;
const PREFIX = "!";

bot.on("ready", () => {
    console.log(`${bot.user.tag} has logged in.`);
})


bot.on('message', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    const randomXp = Math.floor(Math.random() * 10) + 1; //Random amont of XP until the number you want + 1
    console.log("randomXp", randomXp)
    // console.log(message.content.length)

    const prorataXp = parseInt(Math.sqrt(parseInt(message.content.length)))
    console.log("prorataXp", prorataXp)
    let totalXp = 0
    if (prorataXp > randomXp) {
        totalXp = randomXp + prorataXp
    } else {
        totalXp = randomXp
    }
    const user = await Levels.fetch(message.author.id, message.guild.id);
    let prevLevel = parseInt(user.level)

    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, totalXp);
    console.log("user xp",user.xp)


    //
    // const neededXp1 = await Levels.xpFor(1)
    // const neededXp2 = await Levels.xpFor(2)
    // const neededXp3 = await Levels.xpFor(3)
    // const neededXp4 = await Levels.xpFor(4)
    // const neededXp5 = await Levels.xpFor(5)

    if (hasLeveledUp) {

        let avatar = message.author.displayAvatarURL({dynamic: false, format: 'png'});

        const user = await Levels.fetch(message.author.id, message.guild.id);

        const embed = new MessageEmbed()
            .setColor('#00D8D5')
            .setTitle(`You have leveled up to  ${user.level} !`)
            .setThumbnail(avatar)
            .setDescription("Keep up the good work \n We are glad to have you \n among us :hearts:")

        message.reply("Congrats !!", embed)


        if (prevLevel === LEVEL_OLD && parseInt(user.level) === LEVEL_NEW) {
            try {
                let channel = bot.channels.fetch(process.env.DISCORD_VERIFICATION_CHANNEL_ID).then(channel => {
                    channel.send(`${message.author} ` + "you can now run the `!join` command here to unlock the private channels")
                }).catch(err => {
                    console.log(err)
                })
            } catch (error) {
                console.error(error);
            }
        }
    }


    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        //Rank
        if (CMD_NAME.toLowerCase() === 'rank') {
            if (message.channel.id !== process.env.DISCORD_VERIFICATION_CHANNEL_ID) return;
            const user = await Levels.fetch(message.author.id, message.guild.id);
            let avatar = message.author.displayAvatarURL({dynamic: false, format: 'png'});
            let nextLevel = (parseInt(user.level) + 1)
            const neededXp = await Levels.xpFor(parseInt(user.level) + 1)


            const embed = new MessageEmbed()
                .setColor('#00D8D5')
                .setTitle(`You are at level ${user.level} !!`)
                .setThumbnail(avatar)
                .setDescription(`We are glad that you are a part of Enso family :sweat_smile: \n Thanks for your contribution to the community`)


            message.reply("You are doing great !!", embed)


            // const rank = new canvacord.Rank()
            //     .setAvatar(avatar)
            //     .setCurrentXP(user.xp)
            //     // .setRequiredXP(neededXp)
            //     .setRank(1, "RANK", false)
            //     .setLevel(parseInt(user.level), "LEVEL", true)
            //     .setStatus(message.author.presence.status)
            //     // .setProgressBar("#FFFFFF", "COLOR")
            //     .setUsername(message.author.username)
            //     .setDiscriminator(message.author.discriminator);
            //
            //
            // rank.build()
            //     .then(data => {
            //         const attachment = new Discord.MessageAttachment(data, "RankCard.png");
            //     });

        }

        //Leaderboard
        else if (CMD_NAME.toLowerCase() === 'leaderboard') {
            if (message.channel.id !== process.env.DISCORD_VERIFICATION_CHANNEL_ID) return;
            const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 10);
            if (rawLeaderboard.length < 1) return reply("Nobody's in leaderboard yet.");

            const leaderboard = await Levels.computeLeaderboard(bot, rawLeaderboard);
            console.log(leaderboard)

            const embed = new MessageEmbed()
                .setColor('#00D8D5')
                .setTitle(`Top Most Active Community Members`)
                .setThumbnail("https://s3.gifyu.com/images/enso.gif");

            let i = 1;
            for (const user of leaderboard) {
                embed.addField("Rank", `${i++}`, true)
                embed.addField("Username", `<@${user.userID}>`, true)
                // embed.addField("XP", `${user.xp}`, true)
                embed.addField("Level", `${user.level}`, true)
                // embed.addField('\u200b', '\u200b')
            }
            message.channel.send(embed)
        }

        else if (CMD_NAME.toLowerCase() === 'join') {
            if (message.channel.id !== process.env.DISCORD_VERIFICATION_CHANNEL_ID) return;
            var role = message.guild.roles.cache.find(role => role.name === process.env.ROLE_NAME);
            if (!role) {
                console.log("No role found")
                return;
            }
            const user = await Levels.fetch(message.author.id, message.guild.id);
            // console.log(user)

            if (parseInt(user.level) > THRESHOLD_LEVEL) {
                message.member.roles.add(role).catch(console.error);
            }
        }
        else {
            return;
        }
    }
})

bot.login(process.env.DISCORDJS_BOT_TOKEN);
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

