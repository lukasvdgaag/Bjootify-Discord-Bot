import {ChatInputCommandInteraction, Client, GatewayIntentBits} from 'discord.js';
import * as dotenv from 'dotenv';
import {Cache} from "./utils/cache.util";
import {UserSelection} from "./models/user-selection";
import {SalonDetails} from "./models/response/salon-details";
import {Command} from "./commands/command";
import SearchCommand from "./commands/hairsalon/search.command";
import {applicationCommands} from "./constants/commands.constant";

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

const commands = new Cache<Command[]>();

const salonsCache = new Cache<SalonDetails>();
const userSelectionsCache = new Cache<UserSelection>();

client.on('ready', () => {
    client.application?.commands.set(applicationCommands).catch(console.error);

    const hairSalonCommands = [
        new SearchCommand(),
    ];
    commands.set('hairsalon', hairSalonCommands);

    console.log('Bjootify Bot is online!');
});

client.on('interactionCreate', (interaction) => {
    console.log('received interaction')
    if (!(interaction instanceof ChatInputCommandInteraction)) {
        return;
    }
    console.log('received chat input command interaction')

    const commandList = commands.get(interaction.commandName);
    if (!commandList) {
        console.log(`Command ${interaction.commandName} not found`);
        return;
    }
    console.log(`Command ${interaction.commandName} found`);

    const commandGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();
    console.log(`Command group: ${commandGroup}, subcommand: ${subCommand}`);

    const command: Command | undefined = commandList.find(
        (c: Command) => c.group === commandGroup && c.name === subCommand
    );

    if (command) {
        console.log('Executing command');
        command.execute(interaction);
    } else {
        console.log(`Command ${subCommand} not found`);
    }
})

client.login(process.env.BOT_TOKEN);