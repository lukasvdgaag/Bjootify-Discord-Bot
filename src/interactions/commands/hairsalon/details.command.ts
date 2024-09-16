import {Command} from "../command";
import {ChatInputCommandInteraction} from "discord.js";
import {Cache, getUserSelectedSalon} from "@utils/cache.util";
import {SalonDetails} from "@models/response/salon-details";
import {UserSelection} from "@models/user-selection";
import {sendSalonDetailsEmbed} from "@utils/messaging.util";

export class DetailsCommand extends Command {

    name = "details";
    salonsCache: Cache<SalonDetails>;
    userSelectionCache: Cache<UserSelection>;

    constructor(salonsCache: Cache<SalonDetails>, userSelectionCache: Cache<UserSelection>) {
        super();
        this.salonsCache = salonsCache;
        this.userSelectionCache = userSelectionCache;
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const salon = await getUserSelectedSalon(interaction, this.salonsCache, this.userSelectionCache);
        if (!salon) {
            return;
        }

        await sendSalonDetailsEmbed(interaction, salon);
    }

}