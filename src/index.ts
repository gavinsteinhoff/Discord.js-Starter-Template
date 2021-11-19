import Discord from 'discord.js'
import { token } from './config.local.json'
import { InteractionHandler } from './lib/interactionHandler'

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.GUILDS
  ],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
})

client.once('ready', async () => {
  console.log('Ready!')
  InteractionHandler.GenerateEvents(client)
  InteractionHandler.GenerateInteractions(client)
})

client.login(token)
