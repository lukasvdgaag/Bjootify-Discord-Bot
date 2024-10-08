import {Interaction} from "../interaction";
import {StringSelectMenuInteraction} from "discord.js";
import {Cache} from "@utils/cache.util";
import {UserSelection} from "@models/user-selection";
import {SalonDetails} from "@models/response/salon-details";
import {fetchSalonDetailsByCityAndSlug} from "@utils/api.util";
import {createErrorEmbed, sendSalonDetailsEmbed} from "@utils/messaging.util";

export class SelectSalonInteraction extends Interaction<StringSelectMenuInteraction> {

    salonsCache: Cache<SalonDetails>;
    userSelectionCache: Cache<UserSelection>;

    constructor(salonsCache: Cache<SalonDetails>, userSelectionCache: Cache<UserSelection>) {
        super();
        this.salonsCache = salonsCache;
        this.userSelectionCache = userSelectionCache;
    }

    async execute(interaction: StringSelectMenuInteraction) {
        const selectedSalon = interaction.values[0];
        const [city, salonNameAlias] = selectedSalon.split('/');

        let salon = this.salonsCache.values().find((salon) => salon.city.toLowerCase() === city.toLowerCase() && salon.alias.toLowerCase() === salonNameAlias.toLowerCase());
        if (!salon) {
            try {
                const {data} = await fetchSalonDetailsByCityAndSlug(city, salonNameAlias);

                if (!data) {
                    await interaction.reply({
                        embeds: [createErrorEmbed('Salon not found', 'No salon found with the provided details.')]
                    })
                    return;
                }
                this.salonsCache.set(data.id, data);
                salon = data;
            } catch (e) {
                console.error(e);
                await interaction.reply({
                    embeds: [createErrorEmbed('Something went wrong', 'An error occurred while fetching the salon details.')]
                })
                return;
            }
        }

        const userSelection: UserSelection = new UserSelection(interaction.user.id)
            .selectCity(city)
            .selectSalon(salon.id)
            .selectSalonName(salon.alias);

        this.userSelectionCache.set(interaction.user.id, userSelection);

        await sendSalonDetailsEmbed(interaction, salon, `Selected ${salon.name} in ${city}`);
    }

}