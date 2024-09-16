import {Interaction} from "@interactions/interaction";
import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder} from "discord.js";
import {Cache, getCachedOrFetchedSalon, getCachedOrFetchedTreatments} from "@utils/cache.util";
import {SalonDetails} from "@models/response/salon-details";
import {SalonTreatmentCategory} from "@models/response/salon-treatment";
import {createEmbed, createErrorEmbed} from "@utils/messaging.util";
import {fetchSalonTreatmentEmployees, fetchSalonTreatmentSlots} from "@utils/api.util";
import {UserSelection} from "@models/user-selection";
import {formatMinutes, formatNumber, formatVisitSlotLine} from "@utils/format.util";
import {Gender} from "@enums/gender";
import {GENERIC_EMPLOYEE_ID} from "@constants/api.constant";
import {normalizeSalonTreatmentSlots} from "../../normalizers/salon-treatment-slots.normalizer";
import {SELECT_SALON_TREATMENT_EMPLOYEE} from "@constants/interactions.constant";

export class SelectSalonTreatmentInteraction extends Interaction<StringSelectMenuInteraction> {

    private readonly userSelectionCache: Cache<UserSelection>;
    private readonly salonsCache: Cache<SalonDetails>;
    private readonly treatmentsCache: Cache<SalonTreatmentCategory[]>;

    constructor(userSelectionCache: Cache<UserSelection>, salonsCache: Cache<SalonDetails>, treatmentsCache: Cache<SalonTreatmentCategory[]>) {
        super();
        this.userSelectionCache = userSelectionCache;
        this.salonsCache = salonsCache;
        this.treatmentsCache = treatmentsCache;
    }

    async execute(interaction: StringSelectMenuInteraction) {
        await interaction.deferUpdate();

        const [_, salonId] = interaction.customId.split(":");
        const selectedTreatmentId = interaction.values[0];

        const salon = await getCachedOrFetchedSalon(interaction, salonId, this.salonsCache);
        if (!salon) {
            return;
        }

        const treatments = await getCachedOrFetchedTreatments(interaction, salonId, this.treatmentsCache);
        if (!treatments) {
            return;
        }

        const selectedTreatment = treatments
            .flatMap(c => c.treatments)
            .find(treatment => treatment.id === selectedTreatmentId);

        if (!selectedTreatment) {
            await interaction.followUp({
                embeds: [createErrorEmbed('Treatment not found', 'The selected treatment was not found.')]
            });
            return;
        }

        this.userSelectionCache.set(interaction.user.id, new UserSelection(interaction.user.id)
            .selectSalon(salonId)
            .selectSalonName(salon.alias)
            .selectCity(salon.city)
            .selectTreatment(selectedTreatmentId)
        );

        const {data: employees} = await fetchSalonTreatmentEmployees(salonId, selectedTreatmentId);
        // startDate is now (utc time)
        // endDate is now + 7 days (utc time)
        const {data: slots} = await fetchSalonTreatmentSlots(
            salonId,
            new Date(),
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            [selectedTreatmentId],
            employees && employees.length !== 0 ? employees.map(employee => employee.id) : [GENERIC_EMPLOYEE_ID],
        );

        const normalizedSlots = normalizeSalonTreatmentSlots(slots);

        await interaction.followUp({
            embeds: [
                createEmbed({
                    title: `Selected "${selectedTreatment.name}" at ${salon.name}`,
                    description: `Select an employee to track their availability for this treatment. You can select multiple or select "No preference".`,
                    fields: [
                        {
                            name: `Duration`,
                            value: formatMinutes(selectedTreatment.durationInMinutes),
                            inline: true
                        },
                        {
                            name: 'Price',
                            value: selectedTreatment.isPriceVisibleForOnlineBooking ? `€${formatNumber(Number.parseInt(selectedTreatment.price, 2))}` : 'Not available',
                            inline: true
                        },
                        {
                            name: 'Employees',
                            value: !employees || employees.length === 0 ? 'No employees found' : employees.map(employee => `- **${employee.displayName}** (${Gender[employee.gender].toLowerCase()})`).join('\n')
                        },
                        {
                            name: 'Availability',
                            value: formatVisitSlotLine(normalizedSlots),
                        }
                    ]
                })
            ],
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`${SELECT_SALON_TREATMENT_EMPLOYEE}:${salonId}:${selectedTreatmentId}`)
                        .setPlaceholder('Select employees')
                        .setMinValues(1)
                        .setMaxValues(employees.length)
                        .addOptions(new StringSelectMenuOptionBuilder()
                            .setLabel('No preference')
                            .setValue(GENERIC_EMPLOYEE_ID)
                            .setDescription('Select this option if you have no preference for a specific employee')
                            .setEmoji('🤷‍♂️')
                        )
                        .addOptions(employees.map(employee => new StringSelectMenuOptionBuilder()
                            .setLabel(employee.displayName)
                            .setValue(employee.id)
                            .setEmoji(employee.gender === Gender.FEMALE ? '💇‍♀️' : '💇‍♂️')
                        ))
                )
            ]
        })
    }
}