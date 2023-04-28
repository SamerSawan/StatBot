const puppeteer = require('puppeteer');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getvalstats')
        .setDescription(`provides information about the user's valorant stats, including rank and winrate`)
        .addStringOption(option => 
            option.setName('username')
                    .setDescription('the username to look up')
                    .setRequired(true))
        .addStringOption(option => 
            option.setName('tagline')
                    .setDescription('the tagline associated with the username')
                    .setRequired(true)),
    async execute(interaction) {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await interaction.deferReply({ ephemeral: false });

        
        const username = interaction.options.getString('username');
        const tagline = interaction.options.getString('tagline');



        let rank = 'N/A';
        
        try {
            await page.goto(`https://tracker.gg/valorant/profile/riot/${username}%23${tagline}/overview?playlist=competitive&season=all`);
        } catch {
            await interaction.editReply("User profile is either private, or user does not exist");
            return;
        }
        

        // try to find the rank of the player
        try {
            rank = await page.$eval('.stat__value', elem => elem.textContent);
        } catch {
            console.log("failed to retrieve rank");
        }
        let stats;
        let profileicon;
        try {
            profileicon = await page.$eval('.user-avatar__image', elem => elem.getAttribute('src'));
            const giantstatscontainer = await page.$('.giant-stats')
            stats = await giantstatscontainer.$$eval('.value', elems => {
            return elems.map(elem => elem.textContent);
        });
        } catch {
            await interaction.editReply(`${username}#${tagline}'s profile is either private or does not exist. Please go to tracker.gg and make your profile public`)
        }
        
        


        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Valorant Stats for ${username}#${tagline}`)
            .setURL(`https://tracker.gg/valorant/profile/riot/${username}%23${tagline}/overview?playlist=competitive&season=all`)
            .addFields(
                { name: 'Rank', value: rank },
                { name: 'KD', value: stats[1], inline: true },
                { name: 'Headshot %', value: stats[2], inline: true },
                { name: 'Winrate', value: stats[3], inline: true}
            )
            .setTimestamp()
            .setFooter({ text: 'Bot by Penitent#0001; Reach out to report bugs'});

        await interaction.editReply({embeds: [embed]});

    }
}