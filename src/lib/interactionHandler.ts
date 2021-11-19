import { SlashCommandBuilder } from '@discordjs/builders'
import Discord from 'discord.js'
import fs from 'fs'
import path from 'path'
import { guildId, token } from '../config.local.json'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

export interface ButtonInteractionHandler {
  name: string;
  startup(client: Discord.Client): any;
  execute(interaction: Discord.ButtonInteraction): any;
}

export interface SlashInteractionHandler {
  name: string
  time: number
  data: SlashCommandBuilder
  execute(interaction: Discord.CommandInteraction): any
}

export interface ContextInteractionHandler {
  name: string;
  type: number;
  time: number;
  startup(client: Discord.Client): any;
  execute(interaction: Discord.ContextMenuInteraction): any;
}

export interface EventHandler {
  name: string;
  startup(client: Discord.Client): any;
  execute(...args: any[]): any;
}

const slashInteractions: Array<SlashInteractionHandler> = []
const contextInteractions: Array<ContextInteractionHandler> = []
const buttonInteractions: Array<ButtonInteractionHandler> = []

export const InteractionHandler = {
  async GenerateInteractions (client: Discord.Client) {
    try {
      for (const file of getSlashInteractionFiles()) {
        const command = (await import(file)) as SlashInteractionHandler
        slashInteractions.push(command)
      }

      for (const file of getContextInteractionFiles()) {
        const command = (await import(file)) as ContextInteractionHandler
        contextInteractions.push(command)
      }

      for (const file of getButtonInteractionFiles()) {
        const command = (await import(file)) as ButtonInteractionHandler
        buttonInteractions.push(command)
      }

      const commands: object[] = []
      slashInteractions.forEach(element => {
        commands.push(element.data.toJSON())
      })

      const rest = new REST({ version: '9' }).setToken(token)

      rest.put(Routes.applicationGuildCommands(client.user?.id!, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error)

      console.log('Successfully reloaded application commands.')
    } catch (err) {
      console.error(err)
    }
  },
  async GenerateEvents (client: Discord.Client) {
    const eventFiles = fs.readdirSync(path.join(__dirname, '../', 'events')).filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
      const event = (await import((path.join(__dirname, '../', 'events', file)))) as EventHandler
      event.startup(client)
      client.on(event.name, (...args) => (<any>event.execute)(...args))
    }
  }
}

function getAllFiles (dirPath: string, arrayOfFiles?: string[]) {
  const files = fs.readdirSync(dirPath)
  if (arrayOfFiles === undefined) arrayOfFiles = []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles!.push(path.join(dirPath, '/', file))
    }
  })
  return arrayOfFiles
}

function getSlashInteractionFiles () {
  return getAllFiles(path.join(__dirname, '../', 'modules')).filter(f => f.endsWith('.slashInteraction.js'))
}

function getContextInteractionFiles () {
  return getAllFiles(path.join(__dirname, '../', 'modules')).filter(f => f.endsWith('.contextInteraction.js'))
}

function getButtonInteractionFiles () {
  return getAllFiles(path.join(__dirname, '../', 'modules')).filter(f => f.endsWith('.buttonInteraction.js'))
}
