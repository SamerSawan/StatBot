const puppeteer = require('puppeteer')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getleaguestats')
        .setDescription(`provides information about the user's league of legends stats, including rank and winrate.`)
        .addStringOption(option =>
            option.setName('username')
                .setDescription('the username to look up')
                .setRequired(true)),
    async execute(interaction) {
        // puppeteer paramets to begin webscraping
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // defer reply due to time taken for puppeteer to hit the update button on OP.GG
        await interaction.deferReply({ ephemeral: false });

        // variable declarations
        const username = interaction.options.getString('username');
        let rank = 'N/A';
        let winlose = 'N/A N/A';
        let ratio = 'N/A';
        let profileicon = null;


        // push the update button for updated stats
        try {
            await page.goto(`https://www.op.gg/summoners/na/${username}`);
            await page.$eval(".css-4e9tnt.eapd0am1", elem => elem.click());
        } catch {
            await interaction.editReply("User does not exist or update button on cooldown");
            return;
        }
        


        
        // try to find the rank of the player
        try {
            rank = await page.$eval('.tier', elem => elem.textContent);
            rank = rank.charAt(0).toUpperCase() + rank.slice(1);
        } catch {
            console.log("Failed to retrieve rank");
        }

        // try to find the winloss of the player
        try {
            const winlosecontainer = await page.$('.win-lose-container');
            winlose = await winlosecontainer.$eval('.win-lose', elem => elem.textContent);
            ratio = await winlosecontainer.$eval('.ratio', elem => elem.textContent);
        } catch {
            console.log("Failed to retrieve win-lose");
        }

        // try to find the profile icon of the player
        try {
            const icondiv = await page.$('.profile-icon');
            profileicon = await icondiv.$eval('img', elem => elem.getAttribute('src'));
        } catch {
            await interaction.reply("User not found");
            return;
        }

        // build the embed to send in chat
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`League Stats for ${username}`)
            .setURL(`https://www.op.gg/summoners/na/${username}`)
            .addFields(
                { name: 'Rank', value: rank },
                //{ name: '\u200B', value: '\u200B' },
                { name: 'Wins', value: winlose.split(" ")[0], inline: true },
                { name: 'Losses', value: winlose.split(" ")[1], inline: true },
                { name: 'Win Rate', value: ratio, inline: true }
                )
            .setThumbnail(profileicon)
            .setTimestamp()
            .setFooter({ text: 'Bot by Penitent#0001; Reach out to report bugs'});

        
        await interaction.editReply({embeds: [embed]});
    }
}