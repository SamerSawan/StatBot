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
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await interaction.deferReply({ ephemeral: false });
        const username = interaction.options.getString('username');
        await page.goto(`https://www.op.gg/summoners/na/${username}`)
        await page.$eval(".css-4e9tnt.eapd0am1", elem => elem.click());

        let rank = await page.$eval('.tier', elem => elem.textContent);
        rank = rank.charAt(0).toUpperCase() + rank.slice(1);
        
        const winlosecontainer = await page.$('.win-lose-container');
        const winlose = await winlosecontainer.$eval('.win-lose', elem => elem.textContent);
        const ratio = await winlosecontainer.$eval('.ratio', elem => elem.textContent);

        const icondiv = await page.$('.profile-icon');
        const profileicon = await icondiv.$eval('img', elem => elem.getAttribute('src'));
        console.log(profileicon);


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