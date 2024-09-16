import {ChatInputCommandInteraction} from "discord.js";
import {Interaction} from "@interactions/interaction";

export abstract class Command extends Interaction<ChatInputCommandInteraction> {
    abstract name: string;
    group: string | null = null;

    abstract execute(interaction: ChatInputCommandInteraction): void;
}