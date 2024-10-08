import {
    ActionRowBuilder,
    APIEmbedField,
    ButtonBuilder,
    ButtonStyle,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    EmbedFooterOptions,
    MessageComponentInteraction
} from "discord.js";
import {ERROR_COLOR, THEME_COLOR} from "@constants/colors.constant";
import {SalonDetails} from "@models/response/salon-details";
import {getAddressLine, getReviewLine, getScheduleLine} from "@utils/format.util";
import {VIEW_SALON_TREATMENT_GROUPS} from "@constants/interactions.constant";

export const createEmbed = ({title, description = null, color = THEME_COLOR, fields = [], imageUrl = null, thumbnailUrl = null, footer = null}: {
    title: string,
    description?: string | null,
    color?: ColorResolvable,
    fields?: APIEmbedField[],
    imageUrl?: string | null,
    thumbnailUrl?: string | null,
    footer?: EmbedFooterOptions | null,
}) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setImage(imageUrl)
        .setThumbnail(thumbnailUrl)
        .setFooter(footer)
        .addFields(fields);
}

export const createErrorEmbed = (title: string, description: string) => {
    return createEmbed({
        title,
        description,
        color: ERROR_COLOR,
    });
}

export const createSuccessEmbed = (title: string, description: string) => {
    return createEmbed({
        title,
        description,
        color: THEME_COLOR,
    });
}

export const sendSalonDetailsEmbed = async (interaction: CommandInteraction | MessageComponentInteraction, salon: SalonDetails, titleOverride?: string, descriptionOverride?: string) => {
    await interaction.reply({
        embeds: [
            createEmbed({
                title: titleOverride ?? `${salon.name}${salon.allowsGifts ? ' 🎁' : ''}`,
                description: descriptionOverride ?? salon.description ? `*"${salon.description}"*` : null,
                thumbnailUrl: salon.logoUrl,
                imageUrl: salon.photoUrl,
                fields: [
                    {
                        name: 'Reviews',
                        value: getReviewLine(salon),
                        inline: true,
                    },
                    {
                        name: 'Address',
                        value: getAddressLine(salon),
                        inline: true,
                    },
                    {
                        name: 'Online Payments',
                        value: salon.allowsOnlinePayments ? '✅ This salon allows you to pay online!' : '❌ This salon does not allow online payments.',
                        inline: true,
                    },
                    {
                        name: 'Schedule',
                        value: getScheduleLine(salon.schedule),
                        inline: false,
                    },
                    {
                        name: 'Contact',
                        value: `Phone: ${salon.phoneNumber}\nEmail: ${salon.email}\nWebsite: ${salon.website}`,
                        inline: false,
                    },
                ]
            })
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`${VIEW_SALON_TREATMENT_GROUPS}:${salon.id}`)
                    .setLabel('View Treatments')
                    .setStyle(ButtonStyle.Primary)
            )
        ]
    });
}