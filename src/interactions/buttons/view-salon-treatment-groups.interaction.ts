import {ButtonInteraction} from "discord.js";
import {Interaction} from "../interaction";
import {SalonDetails} from "@models/response/salon-details";
import {Cache, getCachedOrFetchedSalon} from "@utils/cache.util";
import {sendTreatmentCategoriesMessage} from "../commands/hairsalon/treatment/list.treatment.command";
import {SalonTreatmentCategory} from "@models/response/salon-treatment";

export class ViewSalonTreatmentGroupsInteraction extends Interaction<ButtonInteraction> {

    salonsCache: Cache<SalonDetails>;
    treatmentsCache: Cache<SalonTreatmentCategory[]>;

    constructor(salonsCache: Cache<SalonDetails>, treatmentsCache: Cache<SalonTreatmentCategory[]>) {
        super();
        this.salonsCache = salonsCache;
        this.treatmentsCache = treatmentsCache;
    }

    async execute(interaction: ButtonInteraction) {
        const [_, salonId] = interaction.customId.split(':');

        let salon = await getCachedOrFetchedSalon(interaction, salonId, this.salonsCache);
        if (!salon) {
            return;
        }

        await sendTreatmentCategoriesMessage(interaction, salon, this.treatmentsCache);
    }

}