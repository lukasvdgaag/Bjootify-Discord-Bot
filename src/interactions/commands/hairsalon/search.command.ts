import {Command} from "../command";
import {ActionRowBuilder, APIEmbedField, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder} from "discord.js";
import {fetchSalonsInCity} from "../../../utils/api.util";
import {THEME_COLOR} from "../../../constants/colors.constant";
import {getLocationLine, getReviewLine} from "../../../utils/format.util";
import {SalonSearchResult} from "../../../models/response/salon-search-result";
import {SELECT_SALON_INTERACTION_ID} from "../../../constants/interactions.constant";

export class SearchCommand extends Command {

    name = 'search';

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
            }).slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle(`Salons in ${city}`)
                .setDescription(`Here are the top ${salons.length} salons in ${city}. `)
                .setColor(THEME_COLOR)
                .addFields(
                    salons.map((salon, index) => (
                        {
                            name: `#${index + 1} - ${salon.salonName}${salon.allowsGifts ? ' 🎁' : ''}`,
                            value: `${getReviewLine(salon)}\n\n${getLocationLine(salon)}\n*\`${salon.salonNameAlias}\`*`,
                        } as APIEmbedField
                    ))
                );

            const actionRows = [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(SELECT_SALON_INTERACTION_ID)
                        .setMinValues(1)
                        .setPlaceholder('Select a salon')
                        .addOptions(
                            salons.map((salon, index) => (
                                {
                                    label: `#${index + 1} - ${salon.salonName}`,
                                    value: `${salon.salonCity}/${salon.salonNameAlias}`,
                                }
                            ))
                        )
                )
            ];

            await interaction.reply({
                embeds: [embed],
                components: actionRows,
            })
        } catch (e) {
            console.error(e);
            await interaction.reply('An error occurred while fetching salons');
        }
    }

}