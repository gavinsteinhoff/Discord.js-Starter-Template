import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import { SlashInteractionHandler } from '../../lib/interactionHandler'

const helpCommand = new SlashCommandBuilder().setName('help').setDescription('Provides Help!')
helpCommand.addSubcommand(cmd =>
  cmd
    .setName('ping')
    .setDescription('Pings the Application.')
)

const helpInteraction: SlashInteractionHandler = {
  name: 'help',
  time: -1,
  data: helpCommand,
  async execute (interaction: CommandInteraction) {
    if (!interaction.guildId) return

    const subCommand = interaction.options.getSubcommand(true)

    switch (subCommand) {
      case 'ping': {
        interaction.editReply(`🏓Latency is ${Date.now() - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`)
        break
      }
    }
  }
}

export = helpInteraction
