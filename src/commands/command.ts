import {ChatInputCommandInteraction} from "discord.js";

export abstract class Command {
    name: string;
    group: string | null;

    constructor(name: string, group: string | null = null) {
        this.name = name;
        this.group = group;
    }

    abstract execute(interaction: ChatInputCommandInteraction): void;
}