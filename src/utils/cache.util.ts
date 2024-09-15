import {UserSelection} from "../models/user-selection";
import {SalonDetails} from "../models/response/salon-details";
import {fetchSalonDetailsById, fetchSalonTreatments} from "./api.util";
import {createErrorEmbed} from "./messaging.util";
import {CommandInteraction, MessageComponentInteraction} from "discord.js";
import {SalonTreatmentCategory} from "../models/response/salon-treatment";

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

export const getCachedOrFetchedSalon = async (
    interaction: CommandInteraction | MessageComponentInteraction,
    salonId: string,
    salonsCache: Cache<SalonDetails>
): Promise<SalonDetails | undefined> => {
    let salon = salonsCache.get(salonId);
    if (!salon) {
        try {
            const {data} = await fetchSalonDetailsById(salonId);

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

export const getCachedOrFetchedTreatments = async (
    interaction: CommandInteraction | MessageComponentInteraction,
    salonId: string,
    treatmentsCache: Cache<SalonTreatmentCategory[]>
): Promise<SalonTreatmentCategory[] | undefined> => {
    let categories = treatmentsCache.get(salonId);
    if (!categories) {
        try {
            const {data} = await fetchSalonTreatments(salonId);

            if (data.length === 0) {
                await interaction.reply({
                    embeds: [createErrorEmbed('No treatments found', 'This salon does not have any treatments available.')]
                });
                return undefined;
            }

            treatmentsCache.set(salonId, data);
            categories = data;
        } catch (e) {
            console.error(e);
            await interaction.reply({
                embeds: [createErrorEmbed('Something went wrong', 'Failed to fetch treatments for this salon.')]
            });
            return undefined;
        }
    }
    return categories;
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

    return getCachedOrFetchedSalon(interaction, userSelection.selectedSalonId, salonsCache);
}