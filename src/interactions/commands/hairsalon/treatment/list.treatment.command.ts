import {Command} from "../../command";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, MessageComponentInteraction} from "discord.js";
import {Cache, getCachedOrFetchedTreatments, getUserSelectedSalon} from "../../../../utils/cache.util";
import {SalonDetails} from "../../../../models/response/salon-details";
import {UserSelection} from "../../../../models/user-selection";
import {SalonTreatmentCategory} from "../../../../models/response/salon-treatment";
import {createEmbed} from "../../../../utils/messaging.util";

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

        await sendListTreatmentMessage(interaction, salon, this.treatmentsCache);
    }

}

export const sendListTreatmentMessage = async (interaction: CommandInteraction | MessageComponentInteraction, salon: SalonDetails, treatmentsCache: Cache<SalonTreatmentCategory[]>) => {
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
                        .setCustomId(`select_treatment_category:${category.name}`)
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(`View ${category.name}`)
                ))
            )
        ]
    });
}