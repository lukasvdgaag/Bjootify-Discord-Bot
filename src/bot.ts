import {ChatInputCommandInteraction, Client, GatewayIntentBits, MessageComponentInteraction} from 'discord.js';
import * as dotenv from 'dotenv';
import {Cache} from "./utils/cache.util";
import {UserSelection} from "./models/user-selection";
import {SalonDetails} from "./models/response/salon-details";
import {Command} from "./interactions/commands/command";
import {SearchCommand} from "./interactions/commands/hairsalon/search.command";
import {applicationCommands} from "./constants/commands.constant";
import {Interaction} from "./interactions/interaction";
import {SelectSalonInteraction} from "./interactions/buttons/select-salon.interaction";
import {SELECT_SALON_INTERACTION_ID} from "./constants/interactions.constant";

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

const regularInteractions = new Cache<Interaction<any>>();
const commandInteractions = new Cache<Command[]>();

const salonsCache = new Cache<SalonDetails>();
const userSelectionsCache = new Cache<UserSelection>();

client.on('ready', () => {
    client.application?.commands.set(applicationCommands).catch(console.error);

    commandInteractions.set('hairsalon', [
        new SearchCommand(),
    ]);
    regularInteractions.set(SELECT_SALON_INTERACTION_ID, new SelectSalonInteraction(salonsCache, userSelectionsCache))

    console.log('Bjootify Bot is online!');
});

client.on('interactionCreate', (interaction) => {
    if (interaction instanceof ChatInputCommandInteraction) {
        const commandList = commandInteractions.get(interaction.commandName);
        if (!commandList) {
            return;
        }

        const commandGroup = interaction.options.getSubcommandGroup();
        const subCommand = interaction.options.getSubcommand();

        const command: Command | undefined = commandList.find(
            (c: Command) => c.group === commandGroup && c.name === subCommand
        );

        if (command) {
            command.execute(interaction);
        }
    } else if (interaction instanceof MessageComponentInteraction) {
        const regularInteraction = regularInteractions.get(interaction.customId);

        if (regularInteraction) {
            regularInteraction.execute(interaction);
        }
    }
})

client.login(process.env.BOT_TOKEN);