import logger from "../logger";
import { Member } from "../models/member";
import { Image } from "../models/image";
import { SettingsStore } from "../stores/settingsStore";
import { UserStore } from "../stores/userStore";
import { GuildMember, Channel, TextChannel } from "discord.js";
import { userFined } from "../util";

const settingsStore = new SettingsStore();
const userStore = new UserStore();

// todo: this probs needs less new classes ^ 
// todo: switch this to a law array in which each law is a check function.

// OH MY GOD KILL ME VVV
const punctuationRegEx = /[!-/:-@[-`{-~¡-©«-¬®-±´¶-¸»¿×÷˂-˅˒-˟˥-˫˭˯-˿͵;΄-΅·϶҂՚-՟։-֊־׀׃׆׳-״؆-؏؛؞-؟٪-٭۔۩۽-۾܀-܍߶-߹।-॥॰৲-৳৺૱୰௳-௺౿ೱ-ೲ൹෴฿๏๚-๛༁-༗༚-༟༴༶༸༺-༽྅྾-࿅࿇-࿌࿎-࿔၊-၏႞-႟჻፠-፨᎐-᎙᙭-᙮᚛-᚜᛫-᛭᜵-᜶។-៖៘-៛᠀-᠊᥀᥄-᥅᧞-᧿᨞-᨟᭚-᭪᭴-᭼᰻-᰿᱾-᱿᾽᾿-῁῍-῏῝-῟῭-`´-῾\u2000-\u206e⁺-⁾₊-₎₠-₵℀-℁℃-℆℈-℉℔№-℘℞-℣℥℧℩℮℺-℻⅀-⅄⅊-⅍⅏←-⏧␀-␦⑀-⑊⒜-ⓩ─-⚝⚠-⚼⛀-⛃✁-✄✆-✉✌-✧✩-❋❍❏-❒❖❘-❞❡-❵➔➘-➯➱-➾⟀-⟊⟌⟐-⭌⭐-⭔⳥-⳪⳹-⳼⳾-⳿⸀-\u2e7e⺀-⺙⺛-⻳⼀-⿕⿰-⿻\u3000-〿゛-゜゠・㆐-㆑㆖-㆟㇀-㇣㈀-㈞㈪-㉃㉐㉠-㉿㊊-㊰㋀-㋾㌀-㏿䷀-䷿꒐-꓆꘍-꘏꙳꙾꜀-꜖꜠-꜡꞉-꞊꠨-꠫꡴-꡷꣎-꣏꤮-꤯꥟꩜-꩟﬩﴾-﴿﷼-﷽︐-︙︰-﹒﹔-﹦﹨-﹫！-／：-＠［-｀｛-･￠-￦￨-￮￼-�]|\ud800[\udd00-\udd02\udd37-\udd3f\udd79-\udd89\udd90-\udd9b\uddd0-\uddfc\udf9f\udfd0]|\ud802[\udd1f\udd3f\ude50-\ude58]|\ud809[\udc00-\udc7e]|\ud834[\udc00-\udcf5\udd00-\udd26\udd29-\udd64\udd6a-\udd6c\udd83-\udd84\udd8c-\udda9\uddae-\udddd\ude00-\ude41\ude45\udf00-\udf56]|\ud835[\udec1\udedb\udefb\udf15\udf35\udf4f\udf6f\udf89\udfa9\udfc3]|\ud83c[\udc00-\udc2b\udc30-\udc93]/g;


export class PoliceOfficer {
  public async checkMessage(user: GuildMember | null, message: string, channel: Channel, settingsStore: SettingStore, userStore: UserStore) => Promise<void> {
    if (settingsStore.settings.curses.length == 0) {
      return
    }
    if (settingsStore.settings.curses.indexOf('') > -1) {
      logger.error("Cursewords contains empty string, Police Officer refuses to work under such conditions");
      return
    }

  	const words = message.replace(punctuationRegEx, '').replace(/(\s){2,}/g, '$1').toLowerCase().split(' ');
  	const saidBad = words.filter(w => settingsStore.settings.curses.includes(w))

  	if (saidBad.length > 0 && channel instanceof TextChannel) {
  		await return this.lawBreak(user, `Said bad words: ${saidBad}`, channel, settingsStore, userStore);
    }
  }

  public async lawBreak(user: GuildMember, reason: string, channel: TextChannel, settingsStore: SettingsStore, userStore: UserStore) => Promise<void> {
    // bill person
    await userStore.billAccount(
            user.id,
            settingsStore.settings.fineAmount,
            "Police Officer",
            user.displayName
          );
    logger.info(`${user} broke the law: ${reason}; billed ${settingsStore.settings.fineAmount}`);
    // todo send accumulated stuff

    await channel.send(
        userFined(
          settingsStore.settings.fineAmount,
          user.id,
          settingsStore.settings.currencyName
        )
      );
    }
}