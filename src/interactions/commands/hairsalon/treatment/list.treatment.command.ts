import {Command} from "@interactions/commands/command";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    CommandInteraction,
    MessageComponentInteraction,
    StringSelectMenuBuilder
} from "discord.js";
import {Cache, getCachedOrFetchedTreatments, getUserSelectedSalon} from "@utils/cache.util";
import {SalonDetails} from "@models/response/salon-details";
import {UserSelection} from "@models/user-selection";
import {SalonTreatment, SalonTreatmentCategory} from "@models/response/salon-treatment";
import {createEmbed, createErrorEmbed} from "@utils/messaging.util";
import {formatTreatmentsLine} from "@utils/format.util";
import {SELECT_SALON_TREATMENT, VIEW_SALON_TREATMENT_CATEGORY} from "@constants/interactions.constant";

export class ListTreatmentCommand extends Command {

    group = 'treatment'
    name = 'list';

    salonsCache: Cache<SalonDetails>;
    userSelectionCache: Cache<UserSelection>;
    treatmentsCache: Cache<SalonTreatmentCategory[]>;

    constructor(salonsCache: Cache<SalonDetails>, userSelectionCache: Cache<UserSelection>, treatmentsCache: Cache<SalonTreatmentCategory[]>) {
        super();
        this.salonsCache = salonsCache;
        this.userSelectionCache = userSelectionCache;
        this.treatmentsCache = treatmentsCache;
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const salon = await getUserSelectedSalon(interaction, this.salonsCache, this.userSelectionCache);
        if (!salon) {
            return;
        }

        const selectedCategory = interaction.options.getString('category', false);
        const query = interaction.options.getString('query', false);

        if (selectedCategory || query) {
            await sendCategoryTreatmentsMessage(interaction, salon, selectedCategory, query, this.treatmentsCache);
        } else {
            await sendTreatmentCategoriesMessage(interaction, salon, this.treatmentsCache);
        }
    }

}

export const sendCategoryTreatmentsMessage = async (
    interaction: CommandInteraction | MessageComponentInteraction,
    salon: SalonDetails,
    category: string | null,
    query: string | null,
    treatmentsCache: Cache<SalonTreatmentCategory[]>
) => {
    let categories = await getCachedOrFetchedTreatments(interaction, salon.id, treatmentsCache);
    if (!categories) {
        return;
    }

    let treatments: SalonTreatment[] = [];
    if (category) {
        const selectedCategory = categories.find(c => c.name.toLowerCase().includes(category.toLowerCase()));
        if (!selectedCategory) {
            await interaction.reply({
                embeds: [
                    createErrorEmbed('Category not found', `No category found with the name ${category}`)
                ]
            });
            return;
        }

        treatments = selectedCategory.treatments;
    }
    if (query) {
        if (treatments.length === 0) {
            treatments = categories.flatMap(c => c.treatments)
        }
        treatments = treatments.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    }
    treatments = treatments.slice(0, 25);

    const embedTitle = query ? `Treatment results for "${query}" at ${salon.name}` : `"${category}" treatments at ${salon.name}`;
    const embedDescription = `A total of ${treatments.length} treatments are available${category ? ` in the ${category} category` : ''}${query ? ` for the search term "${query}"` : ''}. Select a treatment from the dropdown below for more details.`;

    await interaction.reply({
        embeds: [
            createEmbed({
                title: embedTitle,
                description: embedDescription,
                fields: [
                    {
                        name: 'Treatments',
                        value: formatTreatmentsLine(treatments, query),
                    }
                ],
                footer: {
                    text: 'Select a treatment to view more details.'
                }
            })
        ],
        components: [
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setPlaceholder('Select a treatment')
                    .setMinValues(1)
                    .setCustomId(`${SELECT_SALON_TREATMENT}:${salon.id}}`)
                    .setOptions(treatments.map(treatment => ({
                        label: treatment.name,
                        value: treatment.id
                    })))
            )
        ]
    });

}

export const sendTreatmentCategoriesMessage = async (
    interaction: CommandInteraction | MessageComponentInteraction,
    salon: SalonDetails,
    treatmentsCache: Cache<SalonTreatmentCategory[]>
) => {
    let categories = await getCachedOrFetchedTreatments(interaction, salon.id, treatmentsCache);
    if (!categories) {
        return;
    }

    const totalOptions = categories.reduce((acc, category) => acc + category.treatments.length, 0);

    await interaction.reply({
        embeds: [
            createEmbed({
                title: `${totalOptions} treatments available at ${salon.name}`,
                description: `A total of ${totalOptions} treatments are available across ${categories.length} categories. Select a category from the dropdown below to view the associated treatments.`,
                fields: categories.map(category => ({
                    name: category.name,
                    value: `${category.treatments.length} treatments`,
                    inline: true
                })),
                footer: {
                    text: 'Select a category to view the treatments available.'
                }
            })
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                categories.map(category => (new ButtonBuilder()
                        .setCustomId(`${VIEW_SALON_TREATMENT_CATEGORY}:${salon.id}:${category.name}`)
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(`View ${category.name}`)
                ))
            )
        ]
    });
}