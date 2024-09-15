import {Command} from "../command";
import {APIEmbedField, ChatInputCommandInteraction, EmbedBuilder} from "discord.js";
import {fetchSalonsInCity} from "../../utils/api.util";
import {THEME_COLOR} from "../../constants/colors.constant";
import {formatNumber, formatRating, getLocationLine, getReviewLine} from "../../utils/format.util";
import {SalonSearchResult} from "../../models/response/salon-search-result";

export default class SearchCommand extends Command {

    constructor() {
        super('search');
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const city = interaction.options.getString('city', true);

        try {
            const {data} = await fetchSalonsInCity(city);

            if (data.length === 0) {
                await interaction.reply(`No salons found in ${city}`);
                return;
            }

            const salons = data.sort((a: SalonSearchResult, b: SalonSearchResult) => {
                const roundedRatingA = Math.round(a.averageRating * 10) / 10;
                const roundedRatingB = Math.round(b.averageRating * 10) / 10;

                if (roundedRatingA === roundedRatingB) {
                    return b.reviewsCount - a.reviewsCount;
                }
                return roundedRatingB - roundedRatingA;
            });

            const embed = new EmbedBuilder()
                .setTitle(`Salons in ${city}`)
                .setDescription(`Here are the top ${Math.min(5, salons.length)} salons in ${city}. `)
                .setColor(THEME_COLOR)
                .addFields(
                    salons.slice(0, 5).map((salon, index) => (
                        {
                            name: `#${index + 1} - ${salon.salonName}${salon.allowsGifts ? ' 🎁' : ''}`,
                            value: `${getReviewLine(salon)}\n\n${getLocationLine(salon)}\n*\`${salon.salonNameAlias}\`*`,
                        } as APIEmbedField
                    ))
                );

            await interaction.reply({
                embeds: [embed]
            })
        } catch (e) {
            console.error(e);
            await interaction.reply('An error occurred while fetching salons');
        }
    }

}