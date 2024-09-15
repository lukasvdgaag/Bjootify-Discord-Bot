import {UserSelection} from "../models/user-selection";
import {SalonDetails} from "../models/response/salon-details";
import {fetchSalonDetailsById} from "./api.util";
import {createErrorEmbed} from "./messaging.util";
import {CommandInteraction} from "discord.js";

export class Cache<T> {
    private cache: Map<string, T>;

    constructor() {
        this.cache = new Map<string, T>();
    }

    set(key: string, value: T): void {
        this.cache.set(key, value);
    }

    get(key: string): T | undefined {
        return this.cache.get(key);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    values(): T[] {
        return Array.from(this.cache.values());
    }

    clear(): void {
        this.cache.clear();
    }
}

export const getUserSelectedSalon = async (
    interaction: CommandInteraction,
    salonsCache: Cache<SalonDetails>,
    userSelectionCache: Cache<UserSelection>
): Promise<SalonDetails | undefined> => {
    const userId = interaction.user.id;
    const userSelection = userSelectionCache.get(userId);
    if (!userSelection || !userSelection.selectedSalonId) {
        await interaction.reply({
            embeds: [createErrorEmbed('No salon selected', 'You have not selected a salon yet. Use `/salon search` to find a salon.')]
        });
        return;
    }

    let salon = salonsCache.get(userSelection.selectedSalonId);
    if (!salon) {
        try {
            const {data} = await fetchSalonDetailsById(userSelection.selectedSalonId);

            if (!data) {
                await interaction.reply({
                    embeds: [createErrorEmbed('Salon not found', 'No salon found with the provided details.')]
                })
                return undefined;
            }
            salonsCache.set(data.id, data);
            salon = data;
        } catch (e) {
            console.error(e);
            await interaction.reply({
                embeds: [createErrorEmbed('Something went wrong', 'An error occurred while fetching the salon details.')]
            })
            return undefined;
        }
    }
    return salon;
}