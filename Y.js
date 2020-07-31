const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('./config.json');
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`holo.help | ${client.guilds.cache.size} Servers | Non-Stable Version`, { type: 'STREAMING', url: 'https://twitch.tv/pew' });
});
const ytdl = require("ytdl-core");
const ms = require("ms");
const prefix = 'holo.';
const queue = new Map();
let dmode = 1
const rgif = 1
 //---------------------------------------------------------------------------------------------------------------------------------------------------------
 //------------------------------------------------------------------Embeds----------------------------------------------------------------------------------------


 const help = {

  color: 0x4dff00,
  title: 'Holo Help',
  fields: [
		{
			name: 'User',
			value: 'holo.avatar "@user"- Display Users avatar\n\nholo.info - Bot Info',
		},
		{
			name: 'Music',
			value: 'holo.play "URL" - Start playing music!\n\nholo.skip - Skip Queue music!\n\nholo.stop - Stop playing music and Cleaning Queue!',
			inline: true,
    },
    {
			name: 'Moderation',
			value: 'holo.ban "@user" "reason" - Ban User!\n\nholo.kick "@user" "reason" - Kick User!\n\nholo.say "text" - Bot say your text\n\nholo.clear "number" - delete messages(2-100)',
			inline: true,
		},
		{
			name: 'Fun',
			value: 'Holo - Holo Gif!',
			inline: true,
    }
    
  ],
  footer: {
    text: 'Holo help you!',
  }
 }

 const info = {

  color: 0x000000,
  title: 'INFO',
  fields: [
		{
			name: '**Разработчик**',
			value: '02#1391',
		},
		{
			name: '**Помощь**',
			value: 'holo.help',
			inline: false,
    },
    {
      name: '**Приглашение**',
      url: 'https://discord.js.org',
			value: 'Приглашай на свой Discord Сервер!',
			inline: false,
    },
    {
			name: '**Состояние Бота**',
			value: 'Нестабильное - Возможны Частые перезагрузки',
			inline: false,
		},
    
  ],
  author: {
		name: 'Invite',
		icon_url: 'https://cdn.discordapp.com/attachments/655853428894859266/737424128918814801/download_3.jpg',
    url: 'https://discord.com/api/oauth2/authorize?client_id=722119669581873203&permissions=8&scope=bot',
  },
  footer: {
    icon_url: 'https://cdn.discordapp.com/attachments/655853428894859266/737425406449418300/download.png',
    text: `DiscordJS ${require('discord.js').version}  | JavaScript | NodeJS`,
  }
 }

 const failk = {

  color: 0xf5d442,
  title: 'Error',
  description: 'You dont kick/ban this user!',
  footer: {
    text: 'I`m Holo :3',
    
  },
 };

const failp = {

  color: 0xf5d442,
  title: 'Error',
  description: '',
  footer: {
    text: 'I`m Holo :3',
    
  },
 };


 const rup = {

  color: 0xf5d442,
  title: 'Error!',
  description: 'You dont kick/ban this user! You permissions little! ',
  footer: {
    text: 'I`m Holo :3 ',
    
  },

 };

 //------------------------------------------------------------------------------------------------------------------------------------------------
 // --------------------------------------------CODE--------------------------------------------------------------------------------------------------

client.on("message", message => {
  if(message.content === `${prefix}info`) {
    message.channel.send({ embed: info })
  }
});


client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

 
 client.on("message", message => {
  if(message.content.startsWith('Holo')) {
      message.channel.send(undefined, {
      embed: {
        image: {
          url: `attachment://${Math.floor(Math.random() * (9 - 1)) + 1}.gif`
        },
        files: [
          `./gif/${Math.floor(Math.random() * (9 - 1)) + 1}.gif`, 
        ]
      }
    });
 };
 });
 
 client.on("message", async message => {
   
   if(!message.content.startsWith(path.prefix) || message.author.bot) return;
   const args = message.content.slice(path.prefix.length).trim().split(' ');
   const command = args.shift().toLowerCase();
   
   if(message.content.startsWith(`${path.prefix}say`)) {
    if(!message.member.permissions.has(['ADMINISTRATOR']))
     return message.reply("You don't have permissions");
    const smsg = args.join(" ");
    message.delete().catch(O_o=>{});
    message.channel.send(smsg);
   }

   if(command === 'dmode') {
    dmode = 1
   }
   if(command === 'dmodeoff') {
    dmode = 0
   }
   if(command === 'ping') {
       message.channel.send('Pong.');
   } else if(command === 'beep') {
       message.channel.send('Boop.');
   }
   if(command === 'mute') {

      //!tempmute @user 1s/m/h/d
    
      let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.fetch(args[0]));
      if(!tomute) return message.reply("Couldn't find user.");
      if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them!");
      let muterole = message.guild.roles.cache.find(muterole => muterole.name === "muted");
      //start of create role
      if(!muterole){
        try{
          muterole = await message.guild.roles.create({ data: {
            name: "muted",
            color: "#000000",
            permissions:[]
         } })
          message.guild.channels.cache.forEach(async (channel, id) => {
            await channel.updateOverwrite(muterole, {
              SEND_MESSAGES: false,
              ADD_REACTIONS: false
            });
          });
        }catch(e){
          console.log(e.stack);
        }
      }
      //end of create role
      let mutetime = args[1];
      if(!mutetime) return message.reply("You didn't specify a time!");
    
      await(tomute.roles.add(muterole.id));
      message.reply(`Пользователю <@${tomute.id}> Заблокирован чат на  ${ms(ms(mutetime))}. Модератором/Администратором: ${message.author.name}`);
    
      setTimeout(function(){
        tomute.roles.remove(muterole.id);
        message.channel.send(`Пользователю <@${tomute.id}> Разблокирован чат!`);
      }, ms(mutetime));
    
    
    //end of module
    
    
   };
if(command === "clear") {
    // This command removes all messages from all users in the channel, up to 100.
    if(!message.member.permissions.has(['MANAGE_MESSAGES']))
         return message.reply("You dont have permissions!");

    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Вы можете удалить только от 2 до 100 сообщений!");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.messages.fetch({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Сообщения небыли удалены, ошибка: ${error}`));
  }

   if(command === 'kick') {
        if(!message.member.permissions.has(['KICK_MEMBERS']))
         return message.reply("You dont have permissions!");
       
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[1]);
        if(!member) 
         return message.reply("Invalid user!");
        if(!member.kickable)
         return message.channel.send({ embed: rup });
        let reason = args.slice(1).join(' ');
        if(!reason) reason = "Not set reason";
        await member.kick(reason)
               .catch(error => {
                 message.channel.send({ embed: failk })
                 if (dmode = 1) {
                   message.reply(`TraceBack Error:\n ${error} `)
                 }
               
                }
                 );
               
        message.reply(`${member.user.tag} Кикнут Администратором ${message.author.tag}! Причина: ${reason}`);

              }

   
  if (command === "ban") {
           
           if(!message.member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS']))
             return message.reply("You dont have permissions");
            let member = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[1]);
           if(!member)
             return message.reply('Invalid user!');
           if(!member.bannable)
              return message.reply("Я не могу забанить этого User'a! Может ты не имеешь прав?");
           let reason = args.slice(1).join(' ');
           if(!reason) reason = "Причина не указана!";
           await member.ban(reason).catch(error => {
               message.reply(`Прости ${message.author}, Я не могу забанить этого User'a!`);
               if(dmode = 1) {
               message.reply(`TraceBack Error: \n ${error}}`)
               }
           })
           message.reply(`${member.user.tag} Забанен Администратором - ${message.author.tag}! Причина: ${reason}`);
        
        
        
        } 
        
        
        
        
        
        
        });

client.on("message", message =>{
if(message.content === `${path.prefix}help`) {
message.channel.send({embed: help})
}});


client.on("message", message => {
  if(message.content.startsWith(path.prefix +'avatar')){
    
        
    if(message.mentions.users.size){
        let member=message.mentions.users.first()
    if(member){
        const emb=new Discord.MessageEmbed().setImage(member.displayAvatarURL()).setTitle(member.username)
        message.channel.send(emb)
        
    }
    else{
        message.channel.send("Sorry none found with that name")

    }
    }else{
        const emb=new Discord.MessageEmbed().setImage(message.author.displayAvatarURL()).setTitle(message.author.username)
        message.channel.send(emb)
    }
}
})

client.login(path.token);