import {Interaction} from "@interactions/interaction";
import {ButtonInteraction} from "discord.js";
import {sendCategoryTreatmentsMessage} from "@interactions/commands/hairsalon/treatment/list.treatment.command";
import {getCachedOrFetchedSalon} from "@utils/cache.util";
import {SalonDetails} from "@models/response/salon-details";
import {Cache} from "@utils/cache.util";
import {SalonTreatmentCategory} from "@models/response/salon-treatment";

export class ViewSalonTreatmentsInteraction extends Interaction<ButtonInteraction> {

    private readonly salonsCache: Cache<SalonDetails>;
    private readonly treatmentsCache: Cache<SalonTreatmentCategory[]>;

    constructor(salonsCache: Cache<SalonDetails>, treatmentsCache: Cache<SalonTreatmentCategory[]>) {
        super();
        this.salonsCache = salonsCache;
        this.treatmentsCache = treatmentsCache;
    }

    async execute(interaction: ButtonInteraction) {
        const [_, salonId, categoryName] = interaction.customId.split(':');

        const salon = await getCachedOrFetchedSalon(interaction, salonId, this.salonsCache);
        if (!salon) {
            return;
        }

        await sendCategoryTreatmentsMessage(interaction, salon, categoryName, null, this.treatmentsCache);
    }

}