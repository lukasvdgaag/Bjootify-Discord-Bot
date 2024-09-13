import {Client, GatewayIntentBits} from 'discord.js';
import * as dotenv from 'dotenv';
import {commands} from "./constants/commands.constant";

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
client.on('ready', () => {
    client.application?.commands.set(commands).catch(console.error);

    console.log('Bjootify Bot is online!');
});

client.login(process.env.BOT_TOKEN);