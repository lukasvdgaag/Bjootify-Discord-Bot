import {Command} from "../command";
import {ActionRowBuilder, APIEmbedField, ChatInputCommandInteraction, StringSelectMenuBuilder} from "discord.js";
import {fetchSalonsInCity} from "../../../utils/api.util";
import {getAddressLine, getReviewLine} from "../../../utils/format.util";
import {SalonSearchResult} from "../../../models/response/salon-search-result";
import {SELECT_SALON_INTERACTION_ID} from "../../../constants/interactions.constant";
import {createEmbed, createErrorEmbed} from "../../../utils/messaging.util";

export class SearchCommand extends Command {

    name = 'search';

    async execute(interaction: ChatInputCommandInteraction) {
        const city = interaction.options.getString('city', true);
        const query = interaction.options.getString('query', false);

        try {
            const {data} = await fetchSalonsInCity(city);

            if (data.length === 0) {
                await interaction.reply({
                    embeds: [createErrorEmbed('No salons found', `No salons found in ${city}`)]
                });
                return;
            }

            let salons = data.sort((a: SalonSearchResult, b: SalonSearchResult) => {
                const roundedRatingA = Math.round(a.averageRating * 10) / 10;
                const roundedRatingB = Math.round(b.averageRating * 10) / 10;

                if (roundedRatingA === roundedRatingB) {
                    return b.reviewsCount - a.reviewsCount;
                }
                return roundedRatingB - roundedRatingA;
            });

            if (query) {
                salons = salons.filter((salon) => salon.salonName.toLowerCase().includes(query.toLowerCase()));
            }
            salons = salons.slice(0, 5);

            const embed = createEmbed({
                title: `Salons in ${city} (${data.length} results)`,
                description: `Here are the top ${salons.length} salons in ${city}${query ? ` for search query "${query}"` : ''}.`,
                fields: salons.map((salon, index) => {
                    let highlightedName = salon.salonName;
                    if (query) {
                        const regex = new RegExp(`(${query})`, 'gi');
                        highlightedName = salon.salonName.replace(regex, '__$1__');
                    }
                    return {
                        name: `#${index + 1} - ${highlightedName}${salon.allowsGifts ? ' 🎁' : ''}`,
                        value: `${getReviewLine(salon)}\n\n${getAddressLine(salon)}\n*\`${salon.salonNameAlias}\`*`,
                    } as APIEmbedField;
                }),
                footer: {
                    text: 'Select your salon from the dropdown below. Is your salon not listed? Try a different search query. Only the top 5 salons are shown.',
                }
            });

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
            await interaction.reply({
                embeds: [createErrorEmbed('Something went wrong', 'An error occurred while fetching salons')]
            })
        }
    }

}