import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import * as discord from 'discord.js';
import { Command } from '../../discord';
import * as mathjs from 'mathjs'

const expressionOption: SlashCommandStringOption =
    new SlashCommandStringOption()
        .setName("Expression")
        .setDescription("The mathematical expression to evaluate")
        .setRequired(true);

const mathCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .addStringOption(expressionOption)
    .setName('math')
    .setDescription('Evaluates a mathematical expression');

const execute = async function (
    interaction: discord.CommandInteraction
): Promise<void> {
    const expression = interaction.options.data.find(
        (option) => option.name === expressionOption.name
    ).value;

    try{
        const result = mathjs.evaluate(expression as mathjs.MathExpression);
        interaction.reply(`\`\`\`${expression} ==\n${result}\`\`\``);
    }
    catch(error){
        interaction.reply(`\`\`\`${error}\`\`\``);
    }
};

const command: Command = {
    data: mathCommand,
    execute: execute,
};

export = command;
