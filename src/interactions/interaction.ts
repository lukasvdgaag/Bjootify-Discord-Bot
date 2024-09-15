import {Interaction as DiscordInteraction} from "discord.js";

export abstract class Interaction<T extends DiscordInteraction> {

    abstract execute(interaction: T): void;

}