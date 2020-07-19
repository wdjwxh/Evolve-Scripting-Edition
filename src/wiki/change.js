import {} from './../vars.js';
import { clearElement } from './../functions.js';

const changeList = [
    {
        version: `0.9.8`,
        date: `7/18/2020`,
        changes: [
            `Czech translation by Mousesama`,
            `The slaves have staged a sucessful hunger strike to demand better living conditions, as a result slave pens can now only hold 4 slaves each.`,
            `Autocracy and Frenzy no longer block Immoral races from gaining a Warmonger bonus.`,
            `Geology traits now display under planet information.`,
            `Popovers added to building and research queues.`
        ]
    },
    {
        version: `0.9.7`,
        date: `7/13/2020`,
        changes: [
            `Seasons no longer exist in Cataclysm mode.`,
            `It is no longer Sunny in Cataclysm mode.`,
            `Parasites are no longer unable to grow population in Cataclysm mode, but they do take a growth penalty.`,
            `Base Sawmill effect is now seperated from lumberjack in production breakdown.`
        ]
    },
    {
        version: `0.9.6`,
        date: `7/10/2020`,
        changes: [
            `Fixed bug with Infiltrator not unlocking Nanoweave.`,
            `Fixed bug with Railways not adding traderoutes correctly in Cataclysm mode.`
        ]
    },
    {
        version: `0.9.5`,
        date: `7/6/2020`,
        changes: [
            `Fixed a bug that occured when combining the Terrifying trait with the gold star Iron Will perk.`
        ]
    },
    {
        version: `0.9.4`,
        date: `7/3/2020`,
        changes: [
            `Failed History perk raised from +1 Geothermal to +2 Geothermal energy.`,
            `Fixed Oligarchy tax riot immunity between 36%-45%.`,
            `Infiltrator can now steal Graphene Processing, Nanoweave, and Orichalcum Analysis techs.`
        ]
    },
    {
        version: `0.9.3`,
        date: `7/1/2020`,
        changes: [
            `Increased base number of Plasmids earned in Cataclysm mode.`
        ]
    },
    {
        version: `0.9.2`,
        date: `6/30/2020`,
        changes: [
            `Added Restore Backup option, restores game to just before your last prestige reset.`,
            `Extended Recombination CRISPR line.`,
            `When gaining a random minor trait from Fanaticism, you will now gain 5 ranks of it.`
        ]
    },
    {
        version: `0.9.1`,
        date: `6/21/2020`,
        changes: [
            `Fixed Dyson Net.`
        ]
    },
    {
        version: `0.9.0`,
        date: `6/21/2020`,
        changes: [
            `Added Scenarios Section to Evolution Challenges.`,
            `Added Cataclysm Scenario for those who value science over caution.`,
            `Genetic Dead End is now classified as a Scenario.`,
            `Plant genus redesign. Photosynth trait replaced with Sappy.`,
            `Added 3rd race option for Plant genus: Pinguicula.`,
            `Dyson Net now provides partial power as it is constructed.`,
            `Added Orichalcum upgrade for Dyson Sphere.`,
            `Added Xeno Tourism upgrade.`,
            `Added Fertility Clinic upgrade for Hospitals.`,
            `Added OTB, Online Gambling, & Bolognium Vault upgrade for Casinos.`,
            `Added Scrooge achievement.`,
            `Added Soul Link upgrade for Soul Forge/Soul Attractors.`,
            `Reduced Bolognium cost of Freighters & Corvette Ships.`,
            `Increased rating of Corvette Ships to 30.`,
            `Piracy will no longer start until after you construct the Embassy.`,
            `Reduced power requirement of Soul Forge and Soul Attractor.`,
            `Gun Emplacements and Soul Attractors are now more potent.`,
            `Reduced requirement of Demon Slayer feat to 666 Million demon kills.`
        ]
    },
    {
        version: `0.8.17`,
        date: `5/30/2020`,
        changes: [
            `Added 3rd race option for Fungus genus: Moldling.`,
            `真菌类生物新增第三个种族：霉菌。`,
            `&nbsp;`,
            `Fungi genus Spore trait replaced with Detritivore.`,
            `真菌种属的孢子特质被食腐特质取代。`,
            `&nbsp;`,
            `Casinos now start powered and generated money immediately.`,
            `赌场建成后由手动供电改为直接供电，资金收入提升。`,
            `&nbsp;`,
            `Extreme Dazzle upgrade now boosts Casino income by 50%.`,
            `闪瞎狗眼的效果改为赌场收入 +50% 。`,
            `&nbsp;`,
            `Reduced power requirement of Casino by 1.`,
            `赌场电力需求 -1MW（由4MW降为3MW）。`,
            `&nbsp;`,
            `Casino Max Morale boost no longer works unless casino is powered.`,
            `赌场 +1% 士气上限的效果需供电才能生效。`,
            `&nbsp;`,
            `Occupation will now unlock Federation research.`,
            `军事占领也能触发联邦制的研究了（原先只能通过购买或士气吞并任意一家，或完成统一世界才能触发）。`,
            `&nbsp;`,
            `Added Double Density achievement in heavyverse.`,
            `高引力宇宙新增一项成就：双密度。`,
            `&nbsp;`,
            `Stoned penalty on mellow planets raised to 10%.`,
            `甘甜星球的懒惰产量惩罚由 -2% 变更为 -10% 。`,
            `&nbsp;`,
            `Unemployed citizens on mellow planets no longer generate any stress (note: hunters are NOT unemployed).`,
            `甘甜星球上的失业人口不再降低士气（注意：猎人不算失业人口）。`,
            `&nbsp;`,
            `Life on mellow planets is now overall less stressful.`,
            `甘甜星球上的工作压力减小了。`,
            `&nbsp;`,
            `Slaver trait rating raised to 12.`,
            `自定义种族时，奴隶特质的基础价格提升到12基因点数。`,
            `&nbsp;`,
            `Barracks can now be switched off.`,
            `军营可以关掉了。`,
            `&nbsp;`,
            `Space Stations will now automatically staff Space Miners from the default job when constructed.`,
            `深空采矿站建成后，系统能正确滴从默认工作里捞人去当太空矿工了。`,
            `&nbsp;`,
            `Factories now default to producing Alloy instead of Nothing.`,
            `工厂建成后，现在默认产合金，而不是空置等玩家去设定产品。`,
        ]
    },
    {
        version: `0.8.16`,
        date: `5/8/2020`,
        changes: [
            `Oceanic biome now applies a 6% bonus to Titanium from Steel smelting.`,
            `海洋星球通过炼钢获取的钛产量 +6% 。`,
            `&nbsp;`,
            `Oceanic biome now applies a 12% bonus to Titanium from Iron smelting.`,
            `海洋星球通过炼铁获取的钛产量 +12% 。`,
            `&nbsp;`,
            `Oceanic biome now applies a 5% penalty to Fur generation.`,
            `海洋星球的毛皮产量 -5% 。`,
            `&nbsp;`,
            `Tundra biome now applies a 25% bonus to Fur generation.`,
            `苔原星球的毛皮产量 +25% 。`,
            `&nbsp;`,
            `Tundra biome now applies a 10% penalty to Oil generation.`,
            `苔原星球的石油产量 -10% 。`,
            `&nbsp;`,
            `New plantery modifiers: Elliptical, Flare, Dense, and Unstable.`,
            `新增星球气候类型：椭圆、耀斑、致密，地震。`,
            `&nbsp;`,
            `Oligarchy tax riot immunity raised from 35% to 45%.`,
            `寡头政府体制下，税率的暴乱触发值从 35% 提升到 45% 。`,
        ]
    },
    {
        version: `0.8.15`,
        date: `5/2/2020`,
        changes: [
            `Grassland biome Food bonus raised to 20%.`,
            `草原星球的食物产量加成提升到 +20% 。`,
            `&nbsp;`,
            `Forest biome Lumber bonus raised to 15%.`,
            `森林星球的木材产量加成提升到 +15% 。`,
            `&nbsp;`,
            `Desert biome now applies a 25% Lumber penalty.`,
            `沙漠星球的木材产量 -25% 。`,
            `&nbsp;`,
            `Desert biome now gives a 20% stone bonus and a 10% Oil bonus.`,
            `沙漠星球的石头产量 +20%，石油产量 +10% 。`,
            `&nbsp;`,
            `Volcanic biome now applies a 10% Food penalty.`,
            `火山星球的食物产量 -10% 。`,
            `&nbsp;`,
            `Volcanic biome now gives an 8% Iron and 12% Copper bonus.`,
            `火山星球的铁产量 +8%，铜产量 +12% 。`,
            `&nbsp;`,
            `Added partial Korean translation.`,
            `增加了南棒语翻译版本。`,
            `&nbsp;`,
            `Achievements in the wiki are now sorted Alphabetically.`,
            `WIKI中的成就现在按字母顺序排列了。`,
            `&nbsp;`,
            `Some achievements now show completion progress in the wiki.`,
            `部分成就的完成进度可以在WIKI里实时查看。`,
        ]
    },
    {
        version: `0.8.14`,
        date: `4/30/2020`,
        changes: [
            `Post unification Federation now gives a 32% bonus (raised from 30%).`,
            `统一后，联邦制的所有物资产量加成从 +30% 提升到 +32% 。`,
            `&nbsp;`,
            `Federation now increases morale by 10%.`,
            `联邦制政府体制新增一项属性：士气 +10% 。`,
            `&nbsp;`,
            `Socialist factory bonus is now 10% (raised from 5%).`,
            `社会主义政府体制下，工厂产量加成从 +5% 提升到 +10% 。`,
            `&nbsp;`,
            `Socialist crafting bonus is now 35% (raised from 25%).`,
            `社会主义政府体制下，工匠制品产量加成从 25% 提升到 35% 。`,
            `&nbsp;`,
            `Corpocracy factory bonus is now 30% (raised from 20%).`,
            `公司官僚主义体制下，工厂产量加成从 +20% 提升到 +30% 。`,
            `&nbsp;`,
            `Corpocracy factory bonus now applies to Cement, Graphene, and Vitreloy.`,
            `公司官僚主义体制下，工厂产量加成现在开始作用于水泥、石墨烯和金属玻璃。`,
            `&nbsp;`,
            `Republic now increases morale by 20%.`,
            `共和制政府体制新增一项属性：士气 +20% 。`,
            `&nbsp;`,
            `Oligarchy tax revenue penalty is now 5% (lowered from 10%).`,
            `寡头政府体制下，税收收入加成从 -10% 提升到 -5% 。`,
            `&nbsp;`,
            `Oligarchy can now set taxes 20% higher then other governments (raised from 10%).`,
            `寡头政府体制可设置税收上限，现在开始比起其他政府体制高 20% （原先为 10%）。`,
            `&nbsp;`,
            `Technocracy now adds a 10% Knowledge gain bonus.`,
            `技术官僚主义新增一项属性：知识产量 +10% 。`,
            `&nbsp;`,
            `Autocracy governments are now immune to the warmonger penalty.`,
            `专治政府体制新增一项属性：不受战争贩子效果影响。`,
            `&nbsp;`,
            `Priests now apply a bonus to Ziggurats under Theocracy.`,
            `神权政府体制新增一项属性：牧师提升通灵塔的效果。`,
            `&nbsp;`,
            `Fixed display of Theocracy effect on temples. This gives a 12% bonus but was only displaying as a 5% increase.`,
            `神权政府体制修正一处显示问题：原先对寺庙效果的 12% 加成显示为 5% 。`,
            `&nbsp;`,
            `Nobile Oligarchy can now set their taxes as high as 40%.`,
            `寡头政府体制现在可以将税率设置到 40% 。`,
            `&nbsp;`,
        ]
    },
    {
        version: `0.8.13`,
        date: `4/29/2020`,
        changes: [
            `New research is now sorted by knowledge cost.`,
            `待研究的新科技现在按知识消耗排序`,
            `&nbsp;`,
            `Added popover descriptions for prestige resources.`,
            `威望资源添加悬浮窗描述。`,
            `&nbsp;`,
            `Harmony Crystals now boost standard Dark Energy by 0.1% instead of 0.01%.`,
            `和谐水晶对暗能量的加成从0.01%提升到0.1%`,
            `&nbsp;`,
            `Lots of minor bug fixes.`,
            `修复了许多小BUG。`
        ]
    },
    {
        version: `0.8.12`,
        date: `4/24/2020`,
        changes: [
            `Farming has been redesigned. Farms no longer directly generate food, Farmers now generate food in combination with Farms.`,
            `农业系统重新设计，农场不再直接产生食物，需要分配农民。`,
            `&nbsp;`,
            `Added Energizer Feat for ascending without building any Thermal Collectors.`,
            `添加一个新壮举，不建造任何集热器完成飞升。`,
            `&nbsp;`,
            `Bad traits no longer count for Ascension Species Creator complexity.`,
            `负面特质不纳入基因奢侈税的计算。`,
            `&nbsp;`,
            `Dreaded Achievement will now unlock if you never researched dreadnoughts.`,
            `不研究无畏舰也能正确触发畏惧成就了。`,
            `&nbsp;`,
            `Fixed issue with some feats spamming the log due to micro achievements.`,
            `修正了微型宇宙成就造成的日志文件堆积问题。`,
            `&nbsp;`,
            `Fixed base training rate of soldiers.`,
            `修正了士兵的基础训练速度。`,
            `&nbsp;`,
            `Fixed bug with diverse trait that made it do the opposite of what it was suppose to do.`,
            `修正了 [多样性] 特质起反作用的问题，现在恢复正常了。`,
            `&nbsp;`,
            `Adjusted color of "purple" text on Night theme.`,
            `夜晚主题的紫色文字变得更亮了。`,
            `&nbsp;`,
            `Kilowatts are now Megawatts.`,
            `游戏中所有的千瓦（kW）全部改成兆瓦（MW）了。`,
        ]
    },
    {
        version: `0.8.11`,
        date: `4/16/2020`,
        changes: [
            `Ascension reset no longer offers planet choices, instead your next race is created on the old planet with bonuses added to that planet.`,
            `飞升重置后不再选择星球，而是在原星球上重新选择种族进化，另外，该星球会获取一些基础加成。`,
            `&nbsp;`,
            `Ascended planets now gain +2% to all geology deposits, +5% production, +10% storage, and +2 Sundial base Knowledge gain.`,
            `飞升后的星球基础加成：所有地质加成 +2%，所有物资产量 +5%，仓储上限 +10%，日晷仪知识产量 +2 。`,
            `&nbsp;`,
            `Unspent gene points in the Ascension Lab will be converted into Untapped Potential.`,
            `创建自定义种族时，未使用的基因点数将被转化为 [无限潜能] 特质。`,
            `&nbsp;`,
            `Ascension lab now has a complexity gene tax for adding more then 4 traits.`,
            `飞升实验室里新增了一项设定，创建自定义种族时，超出 4 项特质将被征收基因奢侈税。`,
            `&nbsp;`,
            `Technophobe perk now applies an additional bonus to custom race complexity.`,
            `技术恐惧症特权将放宽自定义种族时基因奢侈税的起征点。`,
            `&nbsp;`,
            `Paranoid and Hoarder can now be combined.`,
            ` [多疑] 特质和 [囤积者] 特质现在和同时起作用了。`,
            `&nbsp;`,
            `Over capped slaves will now be released.`,
            `修正了奴隶数量显示过多的问题。`,
        ]
    },
    {
        version: `0.8.10`,
        date: `4/13/2020`,
        changes: [
            `Added EM Field Challenge.`,
            `增加一项挑战模式： E.M. 磁场。`,
        ]
    },
    {
        version: `0.8.9`,
        date: `4/12/2020`,
        changes: [
            `Added a Feat for finding all the Eggs.`,
            `增加一项壮举：找到所有的彩蛋。`,
            `&nbsp;`,
            `Current egg count can now be checked in the Wiki.`,
            `当前找到的彩蛋数量能实时在WIKI里查询了。`,

        ]
    },
    {
        version: `0.8.8`,
        date: `4/12/2020`,
        changes: [
            `Easter Event Activated`,
            `复活节活动开启。`,
            `&nbsp;`,
            `Event ends 10 days after the start of Easter.`,
            `复活节活动持续 10 天。`,
        ]
    },
    {
        version: `0.8.7`,
        date: `4/11/2020`,
        changes: [
            `Fixed Pathetic trait.`,
            `修复了 [无力] 特质。`,
        ]
    },
    {
        version: `0.8.6`,
        date: `4/11/2020`,
        changes: [
            `Fixed Brute trait.`,
            `修复了 [野蛮] 特质。`,
            `&nbsp;`,
            `Added section for Achievements and Feats to Wiki.`,
            `WIKI里新增成就和壮举的页面。`,
        ]
    },
    {
        version: `0.8.5`,
        date: `4/11/2020`,
        changes: [
            `Added New Work in Progress Game Wiki`,
            `WIKI里新增一些施工中的页面（Coming Soon...）。`,
            `&nbsp;`,
            `Sentience is now more likely to grant a species where the extinction achievement has not yet been earned.`,
            `进化阶段选择感知，更有可能会随机到一个没有核弹重置过的种族。`,
            `&nbsp;`,
            `Sentience can now include custom races.`,
            `进化阶段选择感知，能够随机到自定义种族了。`,
            `&nbsp;`,
            `Incorporeal Existence research now costs Phage instead of Plasmids.`,
            `无形存在科技的研究，不再消耗质粒，改为噬菌体。`,
            `&nbsp;`,
            `Ascension research now Plasmids instead of Phage.`,
            `飞升科技的研究，不再消耗噬菌体，改为消耗质粒。`,
            `&nbsp;`,
            `The change log is now part of the Wiki.`,
            `WIKI里新增更新日志。`,
        ]
    },
    {
        version: `0.8.4`,
        date: `4/4/2020`,
        changes: [
            `Fixed breaking bug with Rigid trait.`,
            `修复了 [僵硬] 特质的BUG。`,
        ]
    },
    {
        version: `0.8.3`,
        date: `4/3/2020`,
        changes: [
            `Federation now reduces the soldier requirement of occupied cities by 5.`,
            `联邦体制下，军事占领需求的士兵数量 -5 。`,
            `&nbsp;`,
            `Fixed incorrect Industrious string.`,
            `修复了一些过于“勤劳”的字符串。`,
        ]
    },
    {
        version: `0.8.2`,
        date: `3/30/2020`,
        changes: [
            `Piracy in the Gateway and Stargate regions ramp up more slowly as you explore Andromeda.`,
            `在你探索星女座星云的过程中，星门中转站和星门宙域的海盗集结速度更慢了。`,
            `&nbsp;`,
            `Fixed formatting of multiline Crafting Tooltip cost display.`,
            `修复了工匠产品悬浮窗中的成本提示。`,
            `&nbsp;`,
            `Fixed incorrect string used by completed Dyson Sphere.`,
            `修复了戴森球建成后错误的字符串。`,
        ]
    },
    {
        version: `0.8.1`,
        date: `3/29/2020`,
        changes: [
            `Piracy now slowly takes effect in the Gateway System and Stargate region over 1000 days after piracy begins.`,
            `海盗活动开始 1000 天后才逐渐对星门系统和星门宙域产生影响。`,
            `&nbsp;`,
            `Purchasing Negotiator and levels of Persuasive will now update the regular Market as well as the Galactic Market.`,
            `谈判者特权和 [说服者] 特质现在对普通贸易路线和星际贸易路线都起作用了。`,
            `&nbsp;`,
            `Added new CRISPR upgrade effects from the Challenge, Ancients, and Trader trees to the perks list.`,
            `新的CRISPR升级效果（挑战、上古、交易等）现在写入特权列表。`,
            `&nbsp;`,
            `Queued Monuments will update their name in the queue when a Monument is constructed.`,
            `建造纪念碑时，其名字将会在建筑队列里正确体现（不会再出现建造方尖塔时队列显示雕塑类的问题）。`,
            `&nbsp;`,
            `Fixed bug where ARPA projects at the end of the Queue while No Queue Order was active would cause No Queue Order to not work as intended.`,
            `修复了高级研究排在建筑队列末尾时，前面的非高级研究建筑剩余时间显示0s但没有自动建造的问题。`,
            `&nbsp;`,
            `The name of the trait gained from a Mutation in the message is now localized.`,
            `基因突变获得特质的信息里，特质名称现在本地化了（即特质名称可以汉化了，不再显示英文了，汉化组滑跪中）。`,
            `&nbsp;`,
            `Adding Apex Predator will remove currently obtained Armor techs.`,
            `添加 [顶级捕猎者] 特质后，当前装甲科技被正确移除了。`,
            `&nbsp;`,
            `Annexed/Purchased powers will now have a respective " - Annexed"/" - Purchased" tag next to their name, like Occupied powers do.`,
            `与军事占领一样，被士气吞并或收购的国家名字后面会添上“已吞并”、“已收购”的小尾巴。`,
            `&nbsp;`,
            `Blackhole reset gives its proper reward again.`,
            `黑洞重置获取的资源恢复正常了（有位萌新BUG期间黑洞重置未能获取暗能量，导致之后的游戏里处于暗能量解锁但暗能量=0的情况，根据游戏算法无法获取灵魂石的悲惨境地）。`,
            `&nbsp;`,
            `The amount of Gene/Phage levels of Minor Traits purchased is now affected by Multiplier Keys.`,
            `通过基因和噬菌体升级次要特质等级的按钮现在可以按乘数键点击了。`,
            `&nbsp;`,
            `The amount of Ships moved from one area to another is now affected by Multiplier Keys.`,
            `舰船数量按钮现在可以按乘数键点击了。`,
            `&nbsp;`,
            `Manual Crafting button tooltips are more informational.`,
            `手动制作工匠产品按钮的悬浮窗里的信息更详细了。`,
            `&nbsp;`,
            `Constructing the first Foundry of a game will log a message briefly explaining what Crafted Resources are and the ways to make them.`,
            `当开发出一个新的工匠产品时，信息栏里将出现一条详尽描述如何制造该产品的信息（屁话更多了）。`,
            `&nbsp;`,
            `Informative messages (mission results, messages that explain newly unlocked mechanics, the Launch Facility message that informs the player of the space tab, etc.) are now displayed in blue, to separate them from less important messages.`,
            `任务结果、解锁新产品、跨入新时代等重要信息现在用蓝色字显示，与其他不重要的信息有所区分。`,
            `&nbsp;`,
            `Added the missing Wormhole Mission result string.`,
            `增加一条之前忘了写的虫洞任务结果的字符串。`,
        ]
    },
    {
        version: `0.8.0`,
        date: `3/27/2020`,
        changes: [
            `Intergalactic Content.`,
            `添加大量的星系内容`,
            `&nbsp;`,
            `Universe Mastery Rework.`,
            `精通重做，按宇宙结算（汉化组的乌鸦嘴不慎奶中，作者搞事了）`,
            `&nbsp;`,
            `-Each Universe now tracks its own mastery level responsible for 40% of the mastery bonus, the remaining 60% comes from the general mastery level.`,
            `所有已触发的成就（挂星）按照基准值的 60% 计算精通奖励，在本宇宙触发的成就（挂宇宙图标）按照基准值的 40% 计算精通奖励，二者相加（挂星 60% +本宇宙 40% ）为最终精通奖励。`,
            `&nbsp;`,
            `-Standard Universe mastery rules remains unchanged.`,
            `宇宙专属成就的精通计算规则不变，在其他宇宙按挂星（60%）结算，本宇宙按挂星（60%）+挂宇宙图标（40%）结算。`,
            `&nbsp;`,
            `Micro icons can now be earned for none Micro achievements. These will not count for standard mastery, only Micro mastery.`,
            `完成非微型宇宙专属成就，可以点亮微型宇宙图标，但不触发挂星。汉化组补充：该修改触发一个恶性BUG，不挂星但计入成就数量，成就数量在坎上的玩家（如 75 个）刷屏式触发“你达成 75 个成就壮举”，造成日志堆积占用系统资源，浏览器崩溃。该问题直到 0.8.12 版本才修复，某位大佬 75 成就的存档被迫废弃，重新玩起。`,
            `&nbsp;`,
            `Unification 3.0, the unification system has been reworked.`,
            `统一系统重做。`,
            `&nbsp;`,
            `Federation Government type.`,
            `新增一个政治体制：联邦制。`,
            `&nbsp;`,
            `New Faith CRISPR line of upgrades, unlocks priest job.`,
            `基因修改中新增信仰线的升级，解锁牧师职业（加成少，还占人口，被玩家们称为高级拾荒者）。`,
            `&nbsp;`,
            `Universal, Standard and Mastered CRISPR Upgrades, for masters of the universes.`,
            `基因修改中新增宇宙精通线的相关升级（基于精通奖励系统重做）。 `,
            `&nbsp;`,
            `Added Negotiator CRISPR upgrade.`,
            `基因修改中新增谈判者的相关升级。`,
            `&nbsp;`,
            `Added Persuasive Minor Gene.`,
            `新增一个次要特质：说服力。`,
            `&nbsp;`,
            `Extended the Deify and Study Ancients tech trees.`,
            `神化先祖和研究先祖之后各自新增一项科技。`,
            `&nbsp;`,
            `Enhanced Droids upgrade for War Droids.`,
            `战争机器人可以升级为增强型战争机器人。`,
            `&nbsp;`,
            `Repair Droids for Fortress.`,
            `新增修理机器人（用于加速堡垒和勘探车的修复）。`,
            `&nbsp;`,
            `Smoldering and Chilled now have reduced effectiveness after 100 stacks.`,
            `炎热或寒冷效果叠加超过 100 层后，效果开始衰减。`,
            `&nbsp;`,
            `Removed Heavy Genus Feats, these were redundant with Universe Icons.`,
            `移出了高引力宇宙的一系列壮举，现在并入各项成就（挂高引力宇宙图标）。`,
            `&nbsp;`,
            `Blackhole reset now also grants species level extinction achievement.`,
            `黑洞重置现在可以触发物种灭绝的成就了。`,
            `&nbsp;`,
            `Power cost of Mass Ejector increased to 3kW.`,
            `质量喷射器的电力消耗提升到 3 kW。`,
            `&nbsp;`,
            `Genetics lab custom mutation costs rescaled to static values depending on the genetic trait.`,
            `捏人选择特质的基因价格调整为定值。`,
            `&nbsp;`,
            `Colonists will now be automatically assigned when a Living Quarter is completed if the default job has any available citizens.`,
            `建完一个行星生活区后，系统会自动分配一位行星居民（只要有人可以分配）。`,
            `&nbsp;`,
            `Biodome redesigned, produces less food but increases living quarter capacity for Citizens.`,
            `生物穹顶重新设计，食物产量减少，但新增一项根据生活区数量提升市民上限的效果。`,
            `&nbsp;`,
            `More robust research catagories.`,
            `科研分类更详细了。`,
            `&nbsp;`,
            `Various racial traits now apply to ARPA projects.`,
            `各种族的特质现在作用于高级研究项目了。`,
            `&nbsp;`,
            `Human Creative trait rescaled.`,
            `人类的 [创造性] 特质修改，高级项目成本蠕变从 -1% 砍到 -0.5%，基准成本 -20% 。`,
            `&nbsp;`,
            `Large cost creep penalty reduced to 0.005 from 0.01.`,
            ` [巨大] 特质修改，地面建筑成本蠕变从 +1% 降至 +0.5% 。`,
            `&nbsp;`,
            `Strong gathering bonus increased from 2 to 5.`,
            ` [强壮] 特质修改，点击获取资财数量从 2 提升到 5 。`,
            `&nbsp;`,
            `Compact lowered from -0.02 to -0.015.`,
            ` [袖珍] 特质修改，地面建筑成本蠕变从 -2% 砍到 -1.5% 。`,
        ]
    },
    {
        version: `0.7.28`,
        date: `3/16/2020`,
        changes: [
            `Antimatter Universe now gives a 10% prestige bonus post MAD.`,
            `反物质宇宙的核弹重置奖励提升 10% 。`,
            `&nbsp;`,
            `St. Patricks Day event.`,
            `圣帕特里克节活动开启。`,
            `&nbsp;`,
            `Blood War can no longer be earned by none demonic evil races.`,
            `非恶魔种族无法再触发血战（Blood War）成就。`,
            `&nbsp;`,
            `Build Crate/Container buttons now update create/container values when upgraded by research.`,
            `构筑板条箱和集装箱的按钮悬浮窗现在会显示容量。`,
        ]
    },
    {
        version: `0.7.27`,
        date: `3/10/2020`,
        changes: [
            `Memory leak fixes.`,
            `修复了内存泄露的问题。`,
        ]
    },
    {
        version: `0.7.26`,
        date: `3/5/2020`,
        changes: [
            `Any race where the associated extinction achievement has been unlocked is now always available during evolution.`,
            `现在核弹重置后，可以在进化阶段直接选择已完成完成灭绝成就的种族了。`,
            `&nbsp;`,
            `Joyless perk changed to +2% Max Morale per star level.`,
            `无趣特权改动，现在根据无趣成就的等级给予 +2% / +4% / +6% / +8% / +10% 士气奖励。`,
            `&nbsp;`,
            `The effects of the Mass Extinction and Creator perks have been swapped.`,
            `造物主与大灭绝成就的特权效果互换。`,
            `&nbsp;`,
            `Creator perk (old mass extinction) changed to 1.5x / 2x / 2.5x / 3x / 3.5x genes gained on mutation.`,
            `造物主特权（原大灭绝）现在改为突变获取1.5 / 2 / 2.5 / 3 / 3.5 倍基因数量。 `,
            `&nbsp;`,
            `Minor traits bought with Phage now count twice when you complete evolution.`,
            `消耗噬菌体购买的次要特质等级在进化阶段后按双倍计算效果（即噬菌体买了 3 级次要特质，进化完成后实际效果按 6 级计算，当再次购买升到 4 级时，按照 7 级计算，但下周目开局按 8 级计算）。`,
        ]
    },
    {
        version: `0.7.25`,
        date: `2/26/2020`,
        changes: [
            `Unicorn Shrine bonus is now determined by the moon phase when constructed.`,
            `现在按照月相决定独角兽圣地的奖励属性。`,
            `&nbsp;`,
            `Shrine Knowledge bonus now applies an additional affect to universities.`,
            `独角兽圣地的知识奖励现在同样作用于大学。`,
            `&nbsp;`,
            `Smelters in Evil universe when using Kindling Kindred default to Flesh instead of Coal.`,
            `在邪恶宇宙中，如激活 [树木亲和] 特质，冶炼厂默认使用肉作为燃料，取代之前的煤。`,
            `&nbsp;`,
            `Evil Wendigo Smelters correctly display that they use 1 Flesh/s instead of 3 Souls/s. Also fixed the bug where they end up using 3 Flesh/s instead of 1.`,
            `邪恶温迪戈的冶炼厂现在能正确显示每秒消耗 1 肉而不是每秒消耗 3 灵魂，并且修复了最终每秒消耗 1 肉却显示 3 肉的BUG。`,
            `&nbsp;`,
            `Fixed bug where the Evil Wendigo Reclaimer description would show the Lumberjack description.`,
            `修复了邪恶温迪戈的回收者描述显示为伐木工的BUG。`,
            `&nbsp;`,
            `If Containers have not yet been unlocked as a resource, getting a Wharf will unlock it.`,
            `在未解锁集装箱的情况下，建造一个码头将自动解锁。`,
            `&nbsp;`,
            `Fixed bug where, if Frieght Trains was gotten after ARPA, the Railway project would need a refresh to appear.`,
            `修复了在A.R.P.A.研究完成后需要刷新页面才能显示铁路研究的BUG。`,
        ]
    },
    {
        version: `0.7.24`,
        date: `2/12/2020`,
        changes: [
            `Special Prestige icons awarded to players from certain feats can now be set to replace the standard Star icon.`,
            `完成各种壮举获得的图标现在能用来替代星辰图标。`,
        ]
    },
    {
        version: `0.7.23`,
        date: `2/11/2020`,
        changes: [
            `Steelen Challenge now requires Bioseed as its win condition.`,
            `无钢挑战现在需要通过播种重置完成。`,
            `&nbsp;`,
            `Added Feat for Blackhole reset with Steelen Challenge.`,
            `新增一项壮举，激活无钢挑战完成黑洞重置触发。`,
            `&nbsp;`,
            `Added V-Day Event stuff.`,
            `情人节活动开启。`,
        ]
    },
    {
        version: `0.7.22`,
        date: `2/9/2020`,
        changes: [
            `Steelen Challenge.`,
            `新增无钢挑战。`,
            `&nbsp;`,
            `Graveyards are now removed upon gaining Kindling Kindred.`,
            `墓地在获得 [树木亲和] 特质后被正确移除了。`,
            `&nbsp;`,
            `If Default job is set to Farmer/Lumberjack for Carnivore/Kindling Kindred, it will be changed to Unemployed upon adding those traits.`,
            `当默认工作设置为农民/伐木工时获取 [食肉动物] 或 [树木亲和] 特质，默认工作将被自动设置为失业人口。`,
            `&nbsp;`,
            `Fixed bug where gaining Carnivore and having no Grain Mills would make Smokehouses unpurchasable until refresh.`,
            `修复了玩家在尚未购买粮仓时获得 [食肉动物] 特质，需要刷新才能购买烟熏屋的BUG。`,
            `&nbsp;`,
            `Cargo Yard now requires the construction of a Transfer Station to be unlocked.`,
            `建造深空转运站后采坑解锁星际货仓。`,
            `&nbsp;`,
            `Mitosis/Metaphase effect now appears on perks list.`,
            `有丝分裂和分裂中期的效果现在体现在特权列表中。`,
        ]
    },
    {
        version: `0.7.21`,
        date: `1/28/2020`,
        changes: [
            `More bug fixes.`,
            `添加了很多BUG。`,
        ]
    },
    {
        version: `0.7.20`,
        date: `1/20/2020`,
        changes: [
            `Bug Fixes by Beorseder.`,
            ` Beorseder 修复了很多Bug。`,
            `&nbsp;`,
            `Fixed bug where purchasing Multicellular would double DNA generation from Nuclei instead of Bilateral Symmetry/Poikilohydric/Spores.`,
            `修复了一个BUG，升级到多细胞生物会错误地加倍细胞核的 DNA 获取速度，该效果应通过升级左右对称、变水植物、孢子获得。`,
            `&nbsp;`,
            `New population from the Infectious trait now go into the set Default job, instead of always Unemployed.`,
            `通过 [传染] 特质获得的新人口直接成为设定的默认工作，而不是原先的失业人口。`,
            `&nbsp;`,
            `Controlled Mutation will no longer offer conflicting traits.`,
            `受控的基因突变不再提供相互矛盾的特质。（汉化组不确定，存疑）`,
        ]
    },
    {
        version: `0.7.19`,
        date: `1/14/2020`,
        changes: [
            `Bug Fixes.`,
            `添加了BUG。`,
        ]
    },
    {
        version: `0.7.18`,
        date: `1/12/2020`,
        changes: [
            `Theocracy temple bonus raised from 5% to 12%.`,
            `神权政府体制下，寺庙的产量加成从 5% 提升到 12% 。`,
            `&nbsp;`,
            `Technocracy knowledge discount raised from 5% to 8%.`,
            `技术官僚主义政府体制下，知识消耗从 -5% 调整为 -8% 。`,
            `&nbsp;`,
            `Corpocracy Casino Bonus raised from +100% to +200%.`,
            `公司官僚主义政府体制下，赌场收益加成从 +100% 提升到 +200% 。`,
            `&nbsp;`,
            `Corpocracy Luxury Good Bonus raised from +50% to +150%.`,
            `公司官僚主义政府体制下，奢侈品售价加成从 +50% 提升到 +150% 。`,
            `&nbsp;`,
            `Corpocracy Tourism Bonus raised from +50% to +100%.`,
            `公司官僚主义政府体制下，旅游收入加成从 +50% 提升到 +100% 。`,
            `&nbsp;`,
            `Corpocracy morale penalty lowered from -15% to -10%.`,
            `公司官僚主义政府体制下，士气惩罚由 -15% 调整为 -10% 。`,
            `&nbsp;`,
            `Corpocracy Manufacturing Bonus raised from +15% to +20%.`,
            `公司官僚主义政府体制下，工厂产品产量加成由 +15% 提升到 +20% 。`,
            `&nbsp;`,
            `Miner's Dream now scales the information that is revealed depending on the star level of the achievement.`,
            `矿工之梦特权所能查看的星球地质特性产量波动的数量取决于该成就的星级。`,
            `&nbsp;`,
            `Slaves now appear as a resource.`,
            `奴隶加入资源列表。`,
            `&nbsp;`,
            `Alternate universes now award icons for complex achievements.`,
            `成就在每个宇宙都有独立的图标了。（汉化组乌鸦嘴：这是为以后每个宇宙的精通分别结算作准备了？）`,
        ]
    },
    {
        version: `0.7.17`,
        date: `1/9/2020`,
        changes: [
            `Fixed an issue with displaying foreign powers in civics tab on unlock.`,
            `修复了周边国家还没解锁就显示在内政页面的BUG（显示就算了还一堆乱码）。`,
        ]
    },
    {
        version: `0.7.16`,
        date: `1/8/2020`,
        changes: [
            `Exploration Missions can be queued again.`,
            `勘探任务又能丢进建筑队列了。`,
            `&nbsp;`,
            `The game will now notify the user if the current version is out of date.`,
            `新版本有提示了。`,
            `&nbsp;`,
            `Changes by Beorseder.`,
            `Beorseder 搞了一堆修改。`,
            `&nbsp;`,
            `Geology deposit aesthetic changes on planet selection.`,
            `星球选择中，星球地质特性产量将产生波动（石油 +20%，煤炭 -10% 之类）。`,
            `&nbsp;`,
            `Miner's Dream Achievement & Perk.`,
            `新增矿工之梦成就与特权。`,
        ]
    },
    {
        version: `0.7.15`,
        date: `1/7/2020`,
        changes: [
            `Queueing the World Collider will no longer lag the game.`,
            `把世界对撞机加入建筑队列不会再把游戏搞卡了。`,
            `&nbsp;`,
            `Multi-segement projects will now have extra segments cleared from the queue on completion.`,
            `多段建筑完成后，建筑队列中的多余部分将被正确移除。`,
            `&nbsp;`,
            `Spy and Government related popovers that would sometimes get stuck open will now clear.`,
            `解决了间谍和政府体制的悬浮窗赖在页面上不走的问题。`,
            `&nbsp;`,
            `Queued projects that will not complete due to lack of production will now display a green [Never] instead of -1 second timer.`,
            `队列中因为物资产量不足而无法建造的项目将挂个 [ 永不 ] 的小尾巴，而不是之前的 [ -1s ] 。`,
            `&nbsp;`,
            `Multi-segment projects no longer block queueing ARPA projects unless they consumed the entire queue space.`,
            `多段建筑不再阻塞APRA项目的添加，除非它们占满整个建筑队列。`,
        ]
    },
    {
        version: `0.7.14`,
        date: `12/31/2019`,
        changes: [
            `Research Categorization option by Naryl.`,
            `Naryl 搞出个科学研究分类。`,
        ]
    },
    {
        version: `0.7.13`,
        date: `12/30/2019`,
        changes: [
            `Gene decay will no longer result in a negative plasmid count.`,
            `基因衰变不会导致质粒效果变为负数。`,
            `&nbsp;`,
            `Gene fortification is slightly more effective.`,
            `基因强化的效果略微提升。`,
        ]
    },
    {
        version: `0.7.12`,
        date: `12/19/2019`,
        changes: [
            `Gene Fortification.`,
            `新增一项特质：基因强化。`,
            `&nbsp;`,
            `Fixed Cultural Supremacy popover.`,
            `修复了文化统一的悬浮窗信息。`,
        ]
    },
    {
        version: `0.7.11`,
        date: `12/15/2019`,
        changes: [
            `Decaying resources will now use a warning color if you are losing that resource but at a slower rate then the decay rate.`,
            `如果一项正在生产的资源在衰变作用下储量减少，系统会显示一个特别的警告色。`,
            `&nbsp;`,
            `The most bottlenecked resource will now display in red while other trouble resources will be marked with an alert color.`,
            `不足的资源将显示一个警告色，其中最为瓶颈的资源将被显示为红色。`,
            `&nbsp;`,
            `CRISPR upgrades are now darkened when unaffordable.`,
            `买不起的CRISPR项目现在变暗了。.`,
            `&nbsp;`,
            `Transfer Station now lists its uranium storage.`,
            `转运站的铀储量现在正确显示了。`,
            `&nbsp;`,
            `Wendigo bug fixes.`,
            `修复了温迪戈的一些BUG`,
        ]
    },
    {
        version: `0.7.10`,
        date: `12/12/2019`,
        changes: [
            `Craftsman now continuously output product instead of once/twice a month.`,
            `工匠们现在每秒都会生产产品了，而不是之前的每月1~2次。`,
            `&nbsp;`,
            `Cumulative achievements now check for lower tier unlocks.`,
            `累积型成就现在解锁下层检查（如大灭绝成就，原先只要有金星毁灭成就，必须满 25 个金星毁灭才显示金星大灭绝。现在启动下层检查， 20 金星灭绝+ 3 银星灭绝+ 2 铜星灭绝，大灭绝成就会先显示铜星）。`,
        ]
    },
    {
        version: `0.7.9`,
        date: `12/7/2019`,
        changes: [
            `Many bug fixes.`,
            `添加了很多BUG。`,
        ]
    },
    {
        version: `0.7.8`,
        date: `12/6/2019`,
        changes: [
            `The default job can now be set to: Unemployed, Farmer, Lumberjack, Quarry Worker, or Scavanger.`,
            `现在可以将失业人口、农民、伐木工、采石场工人、回收者设置为默认工作了。`,
            `&nbsp;`,
            `New line of feats for achievement hunting.`,
            `添加了一些列新壮举。`,
            `&nbsp;`,
            `Novice Perk.`,
            `添加新手足迹特权。`,
            `&nbsp;`,
            `Journeyman Perk.`,
            `添加基因熟练工特权。`,
        ]
    },
    {
        version: `0.7.7`,
        date: `12/5/2019`,
        changes: [
            `Super projects now queue in larger batches.`,
            `多段项目现在能以更大的规模加入队列（根据项目不同，10段或100段算作1个队列位置）。`,
            `&nbsp;`,
            `Super projects now only report completion by the queue if actually complete instead of for each segment constructed.`,
            `多段项目现在整体竣工后才显示完成，而不是每完成一段跳一下信息。`,
        ]
    },
    {
        version: `0.7.6`,
        date: `12/2/2019`,
        changes: [
            `Adjacent queue items of the same type will now combine.`,
            `建筑队列中，相邻的项目如果是同一个建筑，将合并显示。`,
            `&nbsp;`,
            `Architect now doubles queue sizes instead of adding a flat +2.`,
            `建筑师特权效果由队列 +2 调整为队列数量翻倍。`,
            `&nbsp;`,
            `Misc minor bug fixes.`,
            `修复了一些小BUG。`,
        ]
    },
    {
        version: `0.7.5`,
        date: `11/28/2019`,
        changes: [
            `Queueing 2x or more of the same building in a row will now stack them in the queue.`,
            `建筑队列里连续的相同建筑将合并显示。`,
            `&nbsp;`,
            `Queue timer now adjusts for cost creep.`,
            `当建筑成本变化时，建筑队列里显示的剩余时间将实时调整。`,
            `&nbsp;`,
            `ARPA Projects can now be queued.`,
            `A.R.P.A.项目现在可以加入建筑队列了。`,
            `&nbsp;`,
            `Fixed a bug that could break the game when Yeti or Wendigo unlocked the genetics lab.`,
            `修复了雪人或温迪戈解锁生命科学实验室时会把游戏搞崩溃的BUG。`,
        ]
    },
    {
        version: `0.7.4`,
        date: `11/27/2019`,
        changes: [
            `Wendigo can now build hunting lodges.`,
            `温迪戈现在能建造猎人小屋了。`,
            `&nbsp;`,
            `Trade route prices are now tracked to 1 decimal.`,
            `贸易路线的结算价格现在精确到小数点后一位。`,
            `&nbsp;`,
            `Elusive spies will no longer be killed when they fail a mission.`,
            `拥有 [难以捉摸] 特质的种族，间谍任务失败后不会被宰了。`,
            `&nbsp;`,
            `Disruptor Rifles now require researching Quantum Entanglement.`,
            `分子裂解步枪现在添加一项前置研究：量子纠缠。`,
        ]
    },
    {
        version: `0.7.3`,
        date: `11/26/2019`,
        changes: [
            `Night Theme trade volume control made more night theme friendly.`,
            `夜晚主题下，交易数量按钮变得更“友好”了。`,
            `&nbsp;`,
            `Contrast improvements for Night and R/G Theme.`,
            `夜晚主题和RG主题的颜色对比度修改。`,
        ]
    },
    {
        version: `0.7.2`,
        date: `11/24/2019`,
        changes: [
            `New market buy/sell volume control.`,
            `贸易市场里添加了新的购买/售卖按钮。`,
            `&nbsp;`,
            `Large Trade upgrade now raises the buy/sell cap to 5,000.`,
            `大宗交易的单笔限额提升到 5,000 。`,
            `&nbsp;`,
            `Massive Trades upgrade now raises the buy/sell cap to 1,000,000.`,
            `超大宗交易的单笔限额提升到 1,000,000。`,
            `&nbsp;`,
            `Various bug fixes by Beorseder.`,
            `Beorseder 修复了各种BUG。`,
        ]
    },
    {
        version: `0.7.1`,
        date: `11/23/2019`,
        changes: [
            `Garrison controls reintegrated into government section.`,
            `军营的操作重新纳入内政页面。`,
            `&nbsp;`,
            `Mutation plasmids now track correctly in no plasmid challenge runs.`,
            `在无质粒挑战中，新获得质粒的效果将被正确计算（依然对产量和储量起作用）。`,
            `&nbsp;`,
            `Fixed many issues with foreign power name generation.`,
            `修复的周边国家名字在生成时产生的诸多问题。`,
            `&nbsp;`,
            `Feat star icon is no longer tiny.`,
            `特权的星辰图标不再那么小了。`,
        ]
    },
    {
        version: `0.7.0`,
        date: `11/21/2019`,
        changes: [
            `Establish a Government.`,
            `新增内容：建立政府。`,
            `&nbsp;`,
            `Battle rival cities.`,
            `新增内容：对周边国家发动战争。`,
            `&nbsp;`,
            `Biome races added for Forest, Desert, Tundra, and Volcanic.`,
            `新增星球：森林、沙漠、苔原、火山。`,
            `&nbsp;`,
            `New ARPA Project: Railway.`,
            `新增高级研究项目：铁路。`,
            `&nbsp;`,
            `New CRISPR upgrades: Mitosis & Metaphase.`,
            `新增CRISPR内容：有丝分裂、分裂中期。`,
            `&nbsp;`,
            `Construct advanced AI stations in deep space.`,
            `新增内容：AI中枢要塞，位于外太空。`,
            `&nbsp;`,
            `Rapid Gene Squencing upgrade.`,
            `新增内容：高速基因测序。`,
            `&nbsp;`,
            `Civics tab split into Government, Industry, and Military sections.`,
            `内政页面现在细分三页：政府、工业、军事。`,
            `&nbsp;`,
            `Inspiration no longer adds an upfront knowledge bonus.`,
            `灵感效果增加的知识产量不再是一个定值（改为产量翻倍的效果）。`,
            `&nbsp;`,
            `Vigilante requirement lowered to 12.`,
            `治安官成就，现在需求在邪恶宇宙完成毁灭成就的种族数量降低到 12 个。`,
            `&nbsp;`,
            `Xenophobic replaced with Wasteful.`,
            `[仇外] 特质取代了 [生性挥霍] 特质。`,
            `&nbsp;`,
            `Added Rocky Road Feat.`,
            `增加一项壮举：崎岖之路。`,
            `&nbsp;`,
            `Configurable number notations.`,
            `数字格式可选了。`,
        ]
    },
    {
        version: `0.6.27`,
        date: `11/12/2019`,
        changes: [
            `Tundra planets are now always cold in winter.`,
            `苔原星球在冬天总是寒冷。`,
            `&nbsp;`,
            `Volcanic planets are now always hot in summer.`,
            `火山星球在夏天总是炎热。`,
            `&nbsp;`,
            `Stormy planets are now more likely to be windy.`,
            `风暴星球的有风天气出现率更高了。`,
            `&nbsp;`,
            `Fixed issue with last rites not showing up as affordable.`,
            `修复了最后仪式可研究时按钮不出现问题。`,
            `&nbsp;`,
            `2-4x Challenge Multipliers changed:.`,
            `2-4项基因挑战有数项改动：`,
            `&nbsp;`,
            `2 Challenges: +12% Prestige.`,
            `2项基因挑战：重置获得的威望资源 +12% 。`,
            `&nbsp;`,
            `3 Challenges: +25% Prestige.`,
            `3项基因挑战：重置获得的威望资源 +25% 。`,
            `&nbsp;`,
            `4 Challenges: +45% Prestige.`,
            `4项基因挑战：重置获得的威望资源 +45% 。`,
            `&nbsp;`,
            `Heavy Universe prestige bonus now scales with challenge level:.`,
            `高引力宇宙的基因挑战数量与威望资源的额外加成：`,
            `&nbsp;`,
            `0 Challenges: +5% Prestige.`,
            `0项基因挑战：重置获得的威望资源 +5% 。`,
            `&nbsp;`,
            `1 Challenge: +10% Prestige.`,
            `1项基因挑战：重置获得的威望资源 +10% 。`,
            `&nbsp;`,
            `2 Challenges: +15% Prestige.`,
            `2项基因挑战：重置获得的威望资源 +15% 。`,
            `&nbsp;`,
            `3 Challenges: +20% Prestige.`,
            `3项基因挑战：重置获得的威望资源 +20% 。`,
            `&nbsp;`,
            `4 Challenges: +25% Prestige.`,
            `4项基因挑战：重置获得的威望资源 +25% 。`,
        ]
    },
    {
        version: `0.6.26`,
        date: `11/7/2019`,
        changes: [
            `ARPA costs now update without mousing off and back on the buttons.`,
            `鼠标悬停在高级研究项目按钮上时，项目成本会根据等级实时更新，不必移开鼠标再次悬停。`,
            `&nbsp;`,
            `Fixed issues with incorrectly powering on newly built structures.`,
            `修复了新建筑自动供电不正确的问题。.`,
            `&nbsp;`,
            `None-demonic evil smelters now correctly state they burn 1 flesh/s.`,
            `非恶魔种族，带邪恶特质的种族的冶炼厂燃料现在能正确显示每秒1肉了。`,
            `&nbsp;`,
            `Added whitehole perk to stats page.`,
            `白洞特权加入特权列表。`,
        ]
    },
    {
        version: `0.6.25`,
        date: `11/2/2019`,
        changes: [
            `Geology bonus is now preserved on MAD reset.`,
            `核弹重置后，星球地质奖励依然保留。`,
            `&nbsp;`,
            `Key Mappings are now configurable for multiplier and queue keys.`,
            `现在可以为乘数键和队列键配置键映射。（汉化组不确定，存疑）`,
        ]
    },
    {
        version: `0.6.24`,
        date: `10/31/2019`,
        changes: [
            `The Halloween feat will now unlock inside a micro universe.`,
            `在微型宇宙可以触发万圣节壮举了。`,
        ]
    },
    {
        version: `0.6.23`,
        date: `10/28/2019`,
        changes: [
            `Exotic mass now counts towards Galactic Landfill and Supermassive.`,
            `奇异物质的质量现在计入垃圾填埋场成就和超大质量的壮举。`,
            `&nbsp;`,
            `Fixed issues with queue timers and kindling kindred trait.`,
            `修复了队列时间和树木亲和特质的问题。`,
            `&nbsp;`,
            `Dark Energy now applies to windmills in antimatter universe.`,
            `暗能量现在对反物质宇宙中的风车起作用了。`,
        ]
    },
    {
        version: `0.6.22`,
        date: `10/26/2019`,
        changes: [
            `Game optimizations.`,
            `游戏优化。`,
            `&nbsp;`,
            `Bug fixes for queues.`,
            `修复了队列中的BUG。`,
            `&nbsp;`,
            `Fixed bug with war droids.`,
            `修复了战争机器人的BUG。`,
        ]
    },
    {
        version: `0.6.21`,
        date: `10/24/2019`,
        changes: [
            `Freight Train upgrade now adds a trade route to freight yards instead of trade posts.`,
            `铁路增加的贸易路线现在取决于货场数量，而不是贸易站数量。`,
            `&nbsp;`,
            `Toxic troll achievement.`,
            `新增一项成就：高德温法则（巨魔狂热崇拜蘑菇人并研发互联网科技触发）。`,
            `&nbsp;`,
            `Spatial reasoning rounding fix.`,
            `空间推理的取整方式修复。.`,
        ]
    },
    {
        version: `0.6.20`,
        date: `10/21/2019`,
        changes: [
            `Fixed application of plasmids with antiplasmids.`,
            `修复了本来应该是反质粒生效的部分仍然是质粒生效的问题。`,
            `&nbsp;`,
            `Updated description of bleeding effect.`,
            `引流措施的描述升级。`,
            `&nbsp;`,
            `Added achievement for synthesizing an anti-plasmid.`,
            `增加了一项通过突变获取反质粒的成就。`,
            `&nbsp;`,
            `More readable achievement page.`,
            `成就页面更具有可读性了。`,
        ]
    },
    {
        version: `0.6.19`,
        date: `10/20/2019`,
        changes: [
            `Fixed power errors with hell dimension turrets.`,
            `修复了地狱维度炮塔的电力错误。`,
            `&nbsp;`,
            `Crate/Container rounding is now applied after spatial reasoning.`,
            `升级空间推理后，板条箱和集装箱的容量重新计算。`,
            `&nbsp;`,
            `Added extra text to the asteroid belt description to call out the necessity of assigning space miners.`,
            `在小行星带的文本描述中添加额外的文字，用以说明指派太空矿工的必要性。`,
            `&nbsp;`,
            `Evil Ents can now burn flesh in the smelter.`,
            `邪恶树人现在在冶炼厂烧肉作为燃料了。`,
        ]
    },
    {
        version: `0.6.18`,
        date: `10/16/2019`,
        changes: [
            `Swarm Satellite redesign.`,
            `蜂群卫星重新设计。`,
            `&nbsp;`,
            `Swarm Satellites cost and output decreased.`,
            `蜂群卫星的成本和电力输出减少了。`,
            `&nbsp;`,
            `Control Stations can now control 10/18 swarm satellites.`,
            `蜂群卫星控制站现在能控制 10/18 颗蜂群卫星。`,
            `&nbsp;`,
            `Iron mining ship swarm plant discount now applies to all swarm plant costs.`,
            `铁采矿船现在能降低蜂群卫星工厂的所有材料成本。`,
            `&nbsp;`,
            `New upgrades to increase output of swarm satellites.`,
            `新增科技用于提升蜂群卫星的电力输出。`,
        ]
    },
    {
        version: `0.6.17`,
        date: `10/14/2019`,
        changes: [
            `"Q" key now works with research queue.`,
            `Q键可以作用于研究队列了。`,
            `&nbsp;`,
            `Added settings option to not enforce queue order.`,
            `新增乱序队列的选项。`,
            `&nbsp;`,
            `Decay challenge no longer shows the star level for Joyless.`,
            `衰变挑战按钮上不再显示无趣挑战的星级。`,
            `&nbsp;`,
            `All universe types can now be seen on achievements.`,
            `成就页面里能显示所有宇宙的图标了。`,
            `&nbsp;`,
            `Genus completion is now marked on sentience.`,
            `感知按钮上现在显示种群了。`,
            `&nbsp;`,
            `Challenges can now be toggled during evolution.`,
            `现在可以在进化过程中随意切换挑战了。`,
            `&nbsp;`,
            `Inspiration event now gives a temporary buff to all science production.`,
            `灵感事件现在给知识产量一个增益效果。`,
            `&nbsp;`,
            `Added Slave Market for slaver races to buy slaves as an alternative to catching them.`,
            `增加奴隶市场，这样可以通过购买获取奴隶，抓捕不再是唯一补充奴隶的手段。`,
            `&nbsp;`,
            `Added Crate/Container storage amount to the build crate/container tooltip.`,
            `在构筑板条箱/集装箱的工具提示中增加了板条箱/集装箱仓储容量的显示。`,
            `&nbsp;`,
            `Added a button to cancel all trade routes for each resource.`,
            `每项资源后面都增加一个清除贸易路线数量的按钮。`,
        ]
    },
    {
        version: `0.6.16`,
        date: `10/13/2019`,
        changes: [
            `Employment is now color coded depending on staffing levels.`,
            `每项工作根据人员配置比例（满员，非满员，0等）以不同颜色显示。`,
            `&nbsp;`,
            `GPS satellites now add additional trade routes.`,
            `GPS卫星现在能增加贸易路线了。`,
            `&nbsp;`,
            `Added stats tracking on reset mechanics used.`,
            `增加了对重置次数的统计。`,
            `&nbsp;`,
            `Added a message when completing the launch facility.`,
            `完成发射设施时添加了一条消息。`,
            `&nbsp;`,
            `Added icons to challenges and races in evolution stage to indicate level of challenge completion.`,
            `在进化阶段的种族按钮和挑战按钮上添加已完成星级的提示（金星，银星等）。`,
        ]
    },
    {
        version: `0.6.15`,
        date: `10/11/2019`,
        changes: [
            `Added a settings option to disable the queue hot key.`,
            `添加一个启用/禁用队列按钮的设定。`,
            `&nbsp;`,
            `The queue hot key is now disabled by default because it breaks the game for some users.`,
            `队列按钮现在默认为禁用状态，因为直接启用会把某些非洲玩家的游戏搞崩溃。`,
        ]
    },
    {
        version: `0.6.14`,
        date: `10/9/2019`,
        changes: [
            `Fixed several bugs with celestial races.`,
            `修复了天堂种族的一些BUG。`,
            `&nbsp;`,
            `Only one demonic invasion event is now required to reach a hellscape planet.`,
            `现在只需要触发一次恶魔入侵事件就可以找到地狱星球了。`,
            `&nbsp;`,
            `New city categorization can now be switched off in the settings tab.`,
            `现在可以在选项页面里设置启用/关闭建筑分类了。`,
            `&nbsp;`,
            `Holding Q while clicking a building will now queue it instead of constructing it.`,
            `现在可以按Q键把一个建筑加入队列而不是直接建造。`,
        ]
    },
    {
        version: `0.6.13`,
        date: `10/7/2019`,
        changes: [
            `Fixed bioseed reset bug when seeding from a planet without a special property.`,
            `修正了从一个没有特殊属性的星球播种重置导致的BUG。`,
        ]
    },
    {
        version: `0.6.12`,
        date: `10/6/2019`,
        changes: [
            `Added a hire merc option to fortress, mercs hired here go directly to the fortress.`,
            `在堡垒页面增加了一个雇佣兵按钮，该雇佣兵直接成为堡垒驻扎士兵。`,
            `&nbsp;`,
            `Default patrol size is now 10 instead of 4.`,
            `默认巡逻队规模现在由 4 人提升至 10 人。`,
            `&nbsp;`,
            `Adjuted margins in city tab/space tabs to slightly reduce vertical scrolling.`,
            `在城市/太空页面按钮之间调整间距减少滚动。`,
            `&nbsp;`,
            `New Tower of Babel flair.`,
            `通天塔添加了一条新吐槽。`,
        ]
    },
    {
        version: `0.6.11`,
        date: `10/5/2019`,
        changes: [
            `New planetary modifiers: Toxic, Mellow, Rage, Stormy, Ozone, Magnetic, and Trashed.`,
            `新增星球属性：有毒，温和，怒火，风暴，臭氧，磁性，垃圾场。`,
            `&nbsp;`,
            `City Categorization by NotOats.`,
            `城市名按规模而定。.`,
            `&nbsp;`,
            `Chinese Translation.`,
            `新增中文翻译`,
        ]
    },
    {
        version: `0.6.10`,
        date: `10/1/2019`,
        changes: [
            `Fixed issue with gene editing costing the wrong type of Plasmid.`,
            `修复了基因修改成本导致质粒类型错误的问题。`,
            `&nbsp;`,
            `Fixed Bone label in Graphene plant.`,
            `修复了石墨烯厂的骨头标签。`,
            `&nbsp;`,
            `Fixed issue with Plywood not unlocking when removing Kindling Kindred trait.`,
            `修复了移出树木亲和特质时未能解锁胶合板的问题。`,
        ]
    },
    {
        version: `0.6.9`,
        date: `9/30/2019`,
        changes: [
            `Antimatter Universe.`,
            `反物质宇宙。`,
            `&nbsp;`,
            `Bleeding Effect line of CRISPR upgrades, requires Anti-Plasmids to unlock.`,
            `CRISPR中的引流措施需要反质粒来解锁。`,
            `&nbsp;`,
            `Balorg can now unlock queues.`,
            `炎魔现在能解锁队列了。`,
            `&nbsp;`,
            `Fixed aria labels in mass ejector.`,
            `修复了质量喷射器的标签。`,
        ]
    },
    {
        version: `0.6.8`,
        date: `9/24/2019`,
        changes: [
            `Queue reordering no longer swaps the dragged item with the one in the target spot.`,
            `队伍重新排序时，不会再将拖拽中的项目与目标项目互换。`,
            `&nbsp;`,
            `Added timers to research queue.`,
            `研究队列里新增剩余时间显示。`,
            `&nbsp;`,
            `Cost adjustments are now applied to queue timers increasing their accuracy.`,
            `成本变化后，队列中剩余时间也相应变化。`,
        ]
    },
    {
        version: `0.6.7`,
        date: `9/24/2019`,
        changes: [
            `Cath windmills now generate power instead of just looking pretty.`,
            `猫族的风车现在可以用来发电，而不是仅仅看起来漂亮。`,
            `&nbsp;`,
            `Fixed Spanish strings file, language now loads again.`,
            `西班牙语文件现在又能用了！`,
        ]
    },
    {
        version: `0.6.6`,
        date: `9/23/2019`,
        changes: [
            `Added special tech tree to sacrifical altar to boost its effectiveness per sacrifice.`,
            `新增一项技能树，用于提升献祭的效果。`,
            `&nbsp;`,
            `Restored windmills to cath.`,
            `把风车还给猫族了。`,
            `&nbsp;`,
            `Challenge Multiplier Dark Energy rounding calculation fixed.`,
            `修复了挑战模式获取暗能量的取整方式。`,
            `&nbsp;`,
            `Added extra information to blackhole description when it reaches destabilization point.`,
            `当黑洞读数开始不稳定时，描述文字里添加额外信息。`,
            `&nbsp;`,
            `Added a warning to stabilize option that it will reset your exotic matter.`,
            `稳定黑洞重置奇异物质时增加一条警告。`,
        ]
    },
    {
        version: `0.6.5`,
        date: `9/21/2019`,
        changes: [
            `Fixed display issue with frenzy appearing to never drop below 1%.`,
            `修复了发狂效果总是不低于 1% 的显示问题。`,
            `&nbsp;`,
            `Updated the tooltip values on farms and farmers to include the hellscape penalty.`,
            `地狱星球的产量减益效果现在包含在农场和农民的工具提示里。`,
            `&nbsp;`,
            `Fixed Evil Ents so they start with Gather Stone option.`,
            `修复了邪恶树人的一些问题，现在他们从采集石头开始游戏了。`,
        ]
    },
    {
        version: `0.6.4`,
        date: `9/19/2019`,
        changes: [
            `Fixed double windmill issue with evil universe races.`,
            `修复了邪恶宇宙种族的双风车问题。`,
            `&nbsp;`,
            `Spanish language updates.`,
            `添加西班牙语翻译。.`,
            `&nbsp;`,
            `Added warnings to challenge modes in micro universe that you will not receive credit.`,
            `添加一条警告，告知玩家在微型宇宙无法触发成就或壮举（不挂星）。`,
        ]
    },
    {
        version: `0.6.3`,
        date: `9/17/2019`,
        changes: [
            `Restored broken perks.`,
            `修复了崩坏的特权页面。`,
        ]
    },
    {
        version: `0.6.2`,
        date: `9/17/2019`,
        changes: [
            `Bug Fixes.`,
            `添加了BUG。`,
        ]
    },
    {
        version: `0.6.1`,
        date: `9/17/2019`,
        changes: [
            `Universe Update, explore ~~ 4 ~~ 3 new universe types:.`,
            `宇宙系统大升级！新增4……哦不3个新宇宙。`,
            `&nbsp;`,
            `Heavy Gravity Universe.`,
            `高引力宇宙！`,
            `&nbsp;`,
            `Micro Universe.`,
            `微型宇宙！`,
            `&nbsp;`,
            `Evil Universe.`,
            `邪恶宇宙！`,
            `&nbsp;`,
            `New Decay Challenge.`,
            `新增衰变挑战！`,
            `&nbsp;`,
            `Antimatter universe is still forming, coming soon.`,
            `反物质宇宙在做了在做了……`,
            `&nbsp;`,
            `Dark Energy effects added, unique per universe type.`,
            `每个宇宙增加了独特的暗能量效果。`,
            `&nbsp;`,
            `New Plasmid scaling formula.`,
            `新的质粒换算公式。`,
            `&nbsp;`,
            `Blackhole mass added to Stellar Engine.`,
            `黑洞质量加入恒星引擎。`,
            `&nbsp;`,
            `Stuff I probably forgot about.`,
            `还有一些其他修改，但作者忘记了，这里皮了一条。`,
        ]
    },
    {
        version: `0.5.18`,
        date: `9/11/2019`,
        changes: [
            `Spanish translation provided by RanaPeluda.`,
            `Fixed Ent fanaticism.`,
            `Modals are no longer unnecessarily wide.`,
            `Smelter modal now shows the fuel production for each type.`,
        ]
    },
    {
        version: `0.5.17`,
        date: `9/5/2019`,
        changes: [
            `Mantis Fraile trait replaced with new Cannibalize trait, eat your own citizens for buffs.`,
            `The Fortress will now remember the number of troops assigned to it and attempt to keep it at that level.`,
        ]
    },
    {
        version: `0.5.16`,
        date: `9/3/2019`,
        changes: [
            `Made some adjustments to Soul Gem drop odds.`,
            `Added a message when you discover your first Soul Gem.`,
        ]
    },
    {
        version: `0.5.15`,
        date: `9/1/2019`,
        changes: [
            `Portuguese translations updated by Rodrigodd.`,
        ]
    },
    {
        version: `0.5.14`,
        date: `9/1/2019`,
        changes: [
            `Buildings will no longer be added to the queue if holding down a multiplier key.`,
            `Fixed a problem with smelters that could cause their production to become stuck in a high state.`,
            `Fixed initial display state of containers in storage management tab.`,
        ]
    },
    {
        version: `0.5.13`,
        date: `8/30/2019`,
        changes: [
            `New layout for selecting challenge genes/modes during end of evolution stage.`,
            `Fixed bug with low support elerium miners that caused them to miscalulate miner outputs.`,
            `Added a threat level warning to fortress.`,
        ]
    },
    {
        version: `0.5.12`,
        date: `8/30/2019`,
        changes: [
            `Pacifist Achievement is now unlocked by unifying without ever initiating an attack.`,
        ]
    },
    {
        version: `0.5.11`,
        date: `8/28/2019`,
        changes: [
            `Fixed issue with nucleus DNA bonus not applying from correct cell stage evolutions.`,
            `Building timers now count down without refreashing the popover.`,
            `Long action titles will now wrap instead of overflowing the button.`,
            `Fixed a bug that could cause the research queue to clear items from the building queue.`,
        ]
    },
    {
        version: `0.5.10`,
        date: `8/28/2019`,
        changes: [
            `Fixed bug with some construction projects not refreshing the page after being built with the queue.`,
            `Space exploration missions can no longer be queued more then once at a time.`,
            `One off projects are now removed from the queue if completed manually.`,
            `Queue timers now track crafted resources.`,
            `Demonic attractor soul gem drop rate increase buffed from 5% to 8%.`,
            `Updated some fortress related tooltips.`,
            `Mousing over the star rating in the top left corner now lists which challenges are active.`,
            `Time until ready added to unaffordable actions.`,
        ]
    },
    {
        version: `0.5.9`,
        date: `8/27/2019`,
        changes: [
            `Active build queues wiped due do internal game breaking format change.`,
        ]
    },
    {
        version: `0.5.8`,
        date: `8/27/2019`,
        changes: [
            `Construction timers added to build queue.`,
            `Construction and research completed by queues are now logged to the messege list.`,
            `Improved drag and drop support for queues.`,
        ]
    },
    {
        version: `0.5.7`,
        date: `8/25/2019`,
        changes: [
            `Drag support for queue sorting.`,
            `Fixed resource display bug that occured when buying a mass ejector.`,
            `Minor traits now show the number of ranks from phage or genes spent.`,
        ]
    },
    {
        version: `0.5.6`,
        date: `8/23/2019`,
        changes: [
            `Building queue now works in space.`,
            `Added a seperate research queue.`,
            `Fixed rock quarry awarding 4% stone bonus instead of the stated 2%.`,
            `Fixed rendering bugs with the blackhole and mass ejector.`,
        ]
    },
    {
        version: `0.5.5`,
        date: `8/22/2019`,
        changes: [
            `Bug Fixes for queueing system.`,
        ]
    },
    {
        version: `0.5.4`,
        date: `8/22/2019`,
        changes: [
            `Building Queue system v1.0.`,
            `Urban Planning, Zoning Permits, and Urbanization queue related techs.`,
            `New CRISPR upgrades for enchanced queueing.`,
        ]
    },
    {
        version: `0.5.3`,
        date: `8/20/2019`,
        changes: [
            `Stats and Achievements separated into separate sub tabs.`,
            `Disrupter rifle upgrade for soldiers.`,
            `Mass Ejector can no longer be unlocked before completing the Stellar Engine.`,
        ]
    },
    {
        version: `0.5.2`,
        date: `8/20/2019`,
        changes: [
            `Fixed misnamed mantis trait key.`,
            `Fixed Iron smelter paying out 10x intended amount.`,
        ]
    },
    {
        version: `0.5.1`,
        date: `8/20/2019`,
        changes: [
            `Disappearing craftsman fix.`,
        ]
    },
    {
        version: `0.5.0`,
        date: `8/19/2019`,
        changes: [
            `Interstellar space is now unlockable.`,
            `Interdimensional travel is now unlockable.`,
            `New mangement tab for Crates & Containers.`,
            `Power generation breakdown.`,
            `Improved resource breakdown layout.`,
            `Leathery trait buffed.`,
            `Chameleon trait now adds a combat rating bonus.`,
            `Optimistic now also applies to the minimum morale rating.`,
            `Smarter Smelter fuel switching.`,
            `New CRISPR unlocks.`,
        ]
    },
    {
        version: `0.4.42`,
        date: `8/16/2019`,
        changes: [
            `Fixed some screen reader issues with the crate modal launch button.`,
            `Added a warning to the Genetic Dead End challenge if you are on a hellscape planet.`,
        ]
    },
    {
        version: `0.4.41`,
        date: `8/15/2019`,
        changes: [
            `Joyless Challenge.`,
            `??? - Nothing to see here, move along.`,
        ]
    },
    {
        version: `0.4.40`,
        date: `8/9/2019`,
        changes: [
            `Changed No Cripser gene into the Weak Crisper gene.`,
        ]
    },
    {
        version: `0.4.39`,
        date: `8/6/2019`,
        changes: [
            `Genetic Disaster Challenge.`,
        ]
    },
    {
        version: `0.4.38`,
        date: `8/5/2019`,
        changes: [
            `Special action icon is now properly flagged as a button.`,
        ]
    },
    {
        version: `0.4.37`,
        date: `7/31/2019`,
        changes: [
            `ARIA Improvements for Factory and A.R.P.A.`,
        ]
    },
    {
        version: `0.4.36`,
        date: `7/27/2019`,
        changes: [
            `Slow and Hyper traits can now combine.`,
            `Added new achievements: Creator & Explorer.`,
            `Added perks for Mass Extinction, Creator, and Explorer.`,
        ]
    },
    {
        version: `0.4.35`,
        date: `7/25/2019`,
        changes: [
            `Centaur can now pick Fanaticism.`,
            `Challenge multiplier is now applied to phage gain.`,
        ]
    },
    {
        version: `0.4.34`,
        date: `7/23/2019`,
        changes: [
            `Fixed SR descriptions of buildings that lack affordability.`,
            `Fixed resource highlighting of buildings that have zero costs.`,
        ]
    },
    {
        version: `0.4.33`,
        date: `7/23/2019`,
        changes: [
            `Fixes for Ent Fanaticism not releasing some resources.`,
            `Aria improvements for the smelter modal.`,
            `Improved screen reader resource affordability description of buildings/research.`,
            `Resource highlighting on structures.`,
        ]
    },
    {
        version: `0.4.32`,
        date: `7/21/2019`,
        changes: [
            `Balorg slaver trait added.`,
            `Ziggurat bonus now applies to the oil extractor.`,
            `Geology Oil rich/poor no longer applies to oil extractor.`,
            `Added resource alternate row coloring.`,
            `Added an affordability hint for screen readers.`,
            `Fixed some bugs with awarding a random minor trait from fanatiscm.`,
            `Dimensional Compression now charges the correct cost.`,
        ]
    },
    {
        version: `0.4.31`,
        date: `7/20/2019`,
        changes: [
            `Extreme Dazzle casino upgrade.`,
            `Metallurgist minor trait, buffs alloy.`,
            `Gambler minor trait, buffs casinos.`,
            `A.R.P.A. projects now use resource approximations for large numbers.`,
            `Cement Factory renamed to Cement Plant to reduce confusion with the regular Factory.`,
            `Key multipliers now work inside the factory modal.`,
            `Imps and Balorg now have access to advanced crafting tech.`,
            `Imps and Balorg now have access to windmills.`,
            `Balorg can now set their taxes below 10% and above 30%.`,
        ]
    },
    {
        version: `0.4.30`,
        date: `7/19/2019`,
        changes: [
            `Portuguese translation by Rodrigodd.`,
            `DNA Sequencer upgrade.`,
            `Gene Assembly cost increase to 200k.`,
            `Synthesis now applies a bonus to auto crafted genes.`,
            `Ambidextrous buffed.`,
            `Ambidextrous now has a greater effect on auto crafting.`,
        ]
    },
    {
        version: `0.4.29`,
        date: `7/18/2019`,
        changes: [
            `Genetic modification system, customize your race with minor traits.`,
            `Shotgun Sequencing upgrade for genome research.`,
            `Randomly gained minor traits will no longer stack unless they have all been unlocked.`,
            `Genes are now gained from random mutations.`,
            `Synthesis line of CRISPR upgrades.`,
            `Satellite and Observatory cost reductions.`,
            `Fibroblast minor trait.`,
            `Iridium is now unlocked by constructing an irdium mine instead of the moon base.`,
            `Helium-3 is now unlocked by constructing a helium-3 mine instead of the moon base.`,
            `Genome sequencing now defaults to on when first unlocked.`,
        ]
    },
    {
        version: `0.4.28`,
        date: `7/16/2019`,
        changes: [
            `Added missing hellscape achievement.`,
            `Fixed spatial reasoning and phage interaction.`,
            `Fixed warmonger unlocking requirement.`,
        ]
    },
    {
        version: `0.4.27`,
        date: `7/13/2019`,
        changes: [
            `Added special action description buttons for screen readers.`,
        ]
    },
    {
        version: `0.4.26`,
        date: `7/12/2019`,
        changes: [
            `Unlocked CRISPR upgrades are now listed as perks.`,
            `Control/Shift/Alt click now works with power on and off buttons.`,
        ]
    },
    {
        version: `0.4.25`,
        date: `7/11/2019`,
        changes: [
            `Quantum Manufacturing upgrade.`,
            `Quantum Swarm cost lowered from 465k to 450k.`,
        ]
    },
    {
        version: `0.4.24`,
        date: `7/10/2019`,
        changes: [
            `Thermomechanics upgrade for alloy production.`,
            `Ziggurats unlockable via ancients upgrade.`,
            `Cement factory has a more clear label in breakdown lists.`,
        ]
    },
    {
        version: `0.4.23`,
        date: `7/7/2019`,
        changes: [
            `Resources at the millions breakpoint and above are now shown with 2 significant decimal points.`,
            `Reduced the creep cost of Observatory.`,
            `Reduced the base knowledge cost of Observatory.`,
            `Reduced the Brick cost of Boot Camps.`,
            `Evil has been unleashed.`,
        ]
    },
    {
        version: `0.4.22`,
        date: `7/6/2019`,
        changes: [
            `Fixed issue with having exactly 251 Plasmids that would break your resources.`,
            `Fixed issue with planet generation that caused it to always use the same seed.`,
        ]
    },
    {
        version: `0.4.21`,
        date: `7/6/2019`,
        changes: [
            `Fixed unlocking of mass extinction achievement.`,
            `Fixed potential fuel consumption bug with power plants.`,
        ]
    },
    {
        version: `0.4.20`,
        date: `7/4/2019`,
        changes: [
            `Phage can now be earned from space resets, phage extends the plasmid diminishing return breakpoint.`,
            `Dimensional Warping cripsr upgrade, applies phages to spatial reasoning.`,
            `Added special windmill tech for carnivore path to equalize power grid.`,
            `Space Stations now give 5 Elerium storage instead of 4.`,
        ]
    },
    {
        version: `0.4.19`,
        date: `7/2/2019`,
        changes: [
            `Fixed bugs with the hell planet and gas planet survey mission.`,
            `Fixed bug that prevented the planet description tooltip from triggering.`,
            `Aluminium now properly requires you to build a metal refinery.`,
        ]
    },
    {
        version: `0.4.18`,
        date: `7/1/2019`,
        changes: [
            `Planets choice now has more depth to it, each planet can be poor or rich in various resource types.`,
            `A mineral poor planet suffers anywhere from 1 to 10% penalty for that resource.`,
            `A mineral rich planet gains anywhere from 1 to 20% bonus for that resource.`,
            `The fire event no longer triggers for aquatic races.`,
            `The first interstellar probe now contributes to the number of potential target worlds.`,
            `All interstellar space probe costs are now cheaper.`,
        ]
    },
    {
        version: `0.4.17`,
        date: `6/29/2019`,
        changes: [
            `Added indication of current challenge level to top bar.`,
            `Added H tags for accessibility.`,
        ]
    },
    {
        version: `0.4.16`,
        date: `6/28/2019`,
        changes: [
            `New Hospital, heals wounded soldiers faster.`,
            `New Boot Camp, train new soldiers quicker.`,
            `Lowered research cost of Mass Driver from 170k to 160k.`,
            `Lowered Iridium cost of Mass Drivers.`,
            `Updated Mass Extinction unlock requirement.`,
        ]
    },
    {
        version: `0.4.15`,
        date: `6/28/2019`,
        changes: [
            `Global bonuses are now multiplicative instead of additive.`,
            `Decreased base Elerium cost of Exotic Lab by 4.`,
            `Creative trait decreases cost creep instead of providing a flat discount.`,
            `ARPA 100% button replaced with remaining percentage value.`,
            `New experimental military advice.`,
        ]
    },
    {
        version: `0.4.14`,
        date: `6/27/2019`,
        changes: [
            `Statues now cost Aluminium instead of Wrought Iron.`,
            `Nav Beacon now costs Aluminium instead of Iron.`,
            `Helium-3 Mine now costs Aluminium instead of Copper.`,
            `Elerium Mining Ship now costs Titanium instead of Iridium.`,
            `Iron Mining Ship now costs Aluminium instead of Titanium.`,
            `Dimension Compression upgrade now works correctly.`,
            `Aluminium can now be looted from battle.`,
        ]
    },
    {
        version: `0.4.13`,
        date: `6/26/2019`,
        changes: [
            `Aluminium resource added to the game, research Bayer Process to unlock Metal Refinery which in turn unlocks Aluminum.`,
            `New Metal Refinery structure for producing Aluminium.`,
            `Alloy is now made out of Aluminium and Copper.`,
            `Sheet Metal is now made out of Aluminium.`,
            `Oil Powerplant and Propellant Depot now cost Aluminium instead of Steel.`,
            `Some minor accessibility improvements.`,
        ]
    },
    {
        version: `0.4.12`,
        date: `6/24/2019`,
        changes: [
            `Blackhole achievement now gives a permanent perk for completing it, the perk strength depends on the achievemnt level.`,
            `Fixed issue with event timer being frozen after changing planets.`,
            `Fixed the unlocking of upgraded versions of some achievements.`,
            `Cost descriptions now show approximations above 10,000.`,
        ]
    },
    {
        version: `0.4.11`,
        date: `6/24/2019`,
        changes: [
            `Re-evaluated starvation breakpoint.`,
            `Added Infested Terran achievement.`,
            `Titanium price is now reset after unlocking Hunter Process.`,
            `Resources now have a 25% chance of their market price changing per day, up from 10%.`,
        ]
    },
    {
        version: `0.4.10`,
        date: `6/23/2019`,
        changes: [
            `Fixed stats tracking on demonic invasions so it actually tracks new invasions.`,
        ]
    },
    {
        version: `0.4.9`,
        date: `6/23/2019`,
        changes: [
            `Fabrication facilities now increase craftsman cap.`,
            `Added stats tracking on demonic invasions.`,
            `Detail Oriented buffed to 50% from 33%.`,
            `Rigorous buffed to 100% from 66%.`,
            `Crafting bonus now shown for each resource.`,
            `Temple Faith bonus now applies to crafting in no plasmid challenge mode.`,
            `Mastery bonus now applies to crafting.`,
        ]
    },
    {
        version: `0.4.8`,
        date: `6/22/2019`,
        changes: [
            `Fixed a bug that removed MAD when achieving unification.`,
            `Fixed missing options in evolution stage with picking avians after space reset.`,
        ]
    },
    {
        version: `0.4.7`,
        date: `6/21/2019`,
        changes: [
            `Activating challenge genes now provide a bonus to the number of plasmids earned.`,
        ]
    },
    {
        version: `0.4.6`,
        date: `6/21/2019`,
        changes: [
            `Reduced Nano Tube and Neutronium costs of bioseeder ship.`,
            `Reduced Mythril cost of Space Probes.`,
        ]
    },
    {
        version: `0.4.5`,
        date: `6/19/2019`,
        changes: [
            `Mastery Bonus now unlockable in crispr.`,
            `Fixed bug with elerium mining that could cause negative mining when you lacked asteroid miners.`,
            `Fixed low power warning not clearing when you have no buildings active.`,
            `Fixed Sporgar label of Cottages in Steel & Mythril Beams research.`,
            `Gene Mutation research will no longer turn off when you run out of knowledge, instead it will pause.`,
            `Human creative trait buffed from 2% to 5%.`,
            `Troll regenerative trait buffed to heal 4 wounded per day instead of 2.`,
            `Ogre tough trait buffed to 25% from 10%.`,
            `Gecko optimistic trait buffed to 10% from 2%.`,
            `Arraak resourceful trait buffed from 5% to 10%.`,
            `Dracnid hoarder trait buffed from 10% to 20%.`,
            `Shroomi toxic trait buffed from 10% to 25%.`,
            `Wolven pack mentality trait now applies to apartments.`,
            `Reduced Nano Tube cost of Mining Drones.`,
        ]
    },
    {
        version: `0.4.4`,
        date: `6/18/2019`,
        changes: [
            `Matter compression now applies to Wharfs.`,
            `Xenophobia now applies to Wharfs.`,
            `Plasmids earned by mutation now apply to no plasmid challenge run.`,
            `Reduced Nano Tube cost of Mining Drones.`,
        ]
    },
    {
        version: `0.4.3`,
        date: `6/17/2019`,
        changes: [
            `Challenge mode achievement tracking.`,
            `Vocational Training for craftsman.`,
            `Spelling and grammer fixes.`,
            `Fixed incorrect reject unity reward text.`,
        ]
    },
    {
        version: `0.4.2`,
        date: `6/16/2019`,
        changes: [
            `Added some clarification to breakdown of stress.`,
        ]
    },
    {
        version: `0.4.1`,
        date: `6/16/2019`,
        changes: [
            `Fixed a bug with factories converted from some pre 0.4.0 save files.`,
        ]
    },
    {
        version: `0.4.0`,
        date: `6/16/2019`,
        changes: [
            `Space reset option, control the destiny of your next race.`,
            `Challenge Modes.`,
            `New Stuff to discover.`,
            `New Achievements to unlock.`,
            `Added missing Cyclops racial trait.`,
            `World Domination, maybe.`,
            `Added soft reset option.`,
        ]
    },
    {
        version: `0.3.12`,
        date: `6/11/2019`,
        changes: [
            `Fixed bug with riot event that caused it to trigger on high morale instead of low morale.`,
        ]
    },
    {
        version: `0.3.11`,
        date: `6/10/2019`,
        changes: [
            `The Gas Moon and the Dwarf planets are now accessible.`,
            `New technologies based on new discoveries made in deep space.`,
            `Wharfs can now be unlocked after discovering oil.`,
            `There is now an alternative method of unlocking steel.`,
            `Night Theme updated, popovers are no longer bright.`,
            `Trade route tooltips now include money being imported or exported.`,
            `New crisper upgrades for crafting.`,
            `Warmonger achievement requirement lowered from 10% to 8%.`,
        ]
    },
    {
        version: `0.3.10`,
        date: `6/9/2019`,
        changes: [
            `Added code to fix peculiar failed space launch game state.`,
        ]
    },
    {
        version: `0.3.9`,
        date: `6/8/2019`,
        changes: [
            `New offical Evolve [Discord](https://discordapp.com/invite/dcwdQEr).`,
        ]
    },
    {
        version: `0.3.8`,
        date: `6/7/2019`,
        changes: [
            `Fixed a problem with negative craftsman counts that could result from craftsman dying.`,
        ]
    },
    {
        version: `0.3.7`,
        date: `6/6/2019`,
        changes: [
            `Warmongering is now tracked and high casualties may impact morale.`,
            `Deplating the mercenary pool will temporarily increase their cost.`,
            `Three new achievements related to war.`,
        ]
    },
    {
        version: `0.3.6`,
        date: `6/5/2019`,
        changes: [
            `Fixed issue with production breakdowns not showing when income was only produced by trade.`,
            `Fixed issue that prevented affordability check from refreshing on space missions.`,
        ]
    },
    {
        version: `0.3.5`,
        date: `6/5/2019`,
        changes: [
            `Mythril Craftman now unlock correctly.`,
            `Fixed a bug that could pause the game if you ran out of Titanium.`,
        ]
    },
    {
        version: `0.3.4`,
        date: `6/4/2019`,
        changes: [
            `The Asteroid Belt is now open for business.`,
            `Robotics Upgrades.`,
            `Automation renamed to Machinery.`,
            `Assembly Line upgrade for factory.`,
        ]
    },
    {
        version: `0.3.3`,
        date: `6/3/2019`,
        changes: [
            `New Orbit Structure: Navigation Beacon.`,
            `New Red Planet Structures: Space Control Tower and Space Factory.`,
            `Reduced number of monuments required to unlock tourism from 4 to 2.`,
            `Cement plant workers now round their contribution to 2 decimal places.`,
            `Red planet mining now correctly attributes to the red planet in breakdowns.`,
        ]
    },
    {
        version: `0.3.2`,
        date: `6/3/2019`,
        changes: [
            `Fixed bug that would let you launch the space missions without the proper resources, this would corrupt your game file and break the game.`,
            `Added code to detect games corrupted by the previous bug and fix them.`,
            `Fixed Fanaticism bug that wouldn't release lumberjacks when you have ent gods.`,
        ]
    },
    {
        version: `0.3.1`,
        date: `6/3/2019`,
        changes: [
            `Added building check redundancy to auto correct game states that shouldn't occur anyway.`,
        ]
    },
    {
        version: `0.3.0`,
        date: `6/2/2019`,
        changes: [
            `Space V1 Update.`,
            `This opens the first steps into space exploration, more to come... this is not the end.`,
            `Rebalanced storage caps to help the game feel more idle friendly.`,
        ]
    },
    {
        version: `0.2.70`,
        date: `6/2/2019`,
        changes: [
            `Fixed bug when picking Fanaticism with cath gods that wouldn't release your farmers.`,
            `Fixed bug when upgrading weapon technology that wouldn't immediately show the increase in army rating.`,
        ]
    },
    {
        version: `0.2.69`,
        date: `5/26/2019`,
        changes: [
            `Fixed bug which could let you get free barn or warehouse upgrade by essentially skipping over the tech.`,
            `Added aria button roles to many button like elements that were not technically buttons.`,
        ]
    },
    {
        version: `0.2.68`,
        date: `5/26/2019`,
        changes: [
            `Fixed bug with Rock Quarry that prevented the 2% bonus from working unless you had electricity unlocked.`,
        ]
    },
    {
        version: `0.2.67`,
        date: `5/24/2019`,
        changes: [
            `Revamp of farmer, lumberjack, and quarry worker jobs. These govern the most basic materials produced and can now assign as many workers as you like to these positions.`,
            `Farms now directly produce food instead of determining farmer cap.`,
            `Lumber Yards now increase lumber production instead of governing lumberjack cap.`,
            `Rock Quarry now increase stone production instead of governing quarry worker cap.`,
            `Sawmill powered on bonus reduced from 5% to 4%.`,
            `Rock Quarry powered on bonus reduced from 5% to 4%.`,
            `Stock Exchanges no longer cost Knowledge.`,
            `Fixed a display bug that could cause farmers to falsely show they produced more food then they actual did.`,
        ]
    },
    {
        version: `0.2.66`,
        date: `5/22/2019`,
        changes: [
            `Added alternate row coloring to the market to help distinguish rows.`,
        ]
    },
    {
        version: `0.2.65`,
        date: `5/21/2019`,
        changes: [
            `Sporgar race redesigned into a parasitic race that spreads through infecting victims.`,
        ]
    },
    {
        version: `0.2.64`,
        date: `5/20/2019`,
        changes: [
            `Currency is now required before unlocking Basic Storage.`,
            `Primitive Axes are no longer gated behind Basic Storage.`,
            `Foundry now requires Metal Working to unlock and no longer requires Cement.`,
            `Research tab now defaults back to new when resetting.`,
            `Fixed issue with not being able to buy something if you had consumption on a resource and the cost was the same as your max capacity.`,
            `Fixed issue with max affordability check not refreshing on evolution stage.`,
            `Experimental Red-Green color blind theme.`,
        ]
    },
    {
        version: `0.2.63`,
        date: `5/20/2019`,
        changes: [
            `Fixed an issue that accidently set the default tax rate to 2% instead of 20% for new games.`,
        ]
    },
    {
        version: `0.2.62`,
        date: `5/19/2019`,
        changes: [
            `Tax system revamped. Taxes can now be adjusted more granularly and effect morale instead of production.`,
            `Cement is now a requirement for theology since cement is needed for temples.`,
        ]
    },
    {
        version: `0.2.61`,
        date: `5/19/2019`,
        changes: [
            `Every genus type now has its own evolution path.`,
        ]
    },
    {
        version: `0.2.60`,
        date: `5/18/2019`,
        changes: [
            `Rescaled crate/container volumes. There are now substantially less crates/containers but they do a lot more per crate/container.`,
            `Spatial Reasoning now correctly applies to crates & containers.`,
            `Increased base value of several major storage facilities.`,
            `Added storage timers.`,
            `A.R.P.A. costs in popover now update their affordability check.`,
            `Buildings and Research that can not be afforded due to low capacity are now marked in red text.`,
        ]
    },
    {
        version: `0.2.59`,
        date: `5/17/2019`,
        changes: [
            `Added additional validation to ensure save strings belong to evolve before importing.`,
            `Fixed army rating display when rating doens't calculate to a whole number.`,
            `Fixed listing order of some resources.`,
            `Smelter Iron bonus breakdown fixed.`,
            `Added Selenophobia to breakdown lists.`,
        ]
    },
    {
        version: `0.2.58`,
        date: `5/15/2019`,
        changes: [
            `Settings option to disable multiplier keys.`,
        ]
    },
    {
        version: `0.2.57`,
        date: `5/15/2019`,
        changes: [
            `Added labor validation to coal miners.`,
            `Key Multipliers now work with job and trade route assignment.`,
        ]
    },
    {
        version: `0.2.56`,
        date: `5/15/2019`,
        changes: [
            `Added +- symbols to trade route to distinguish import vs export.`,
        ]
    },
    {
        version: `0.2.55`,
        date: `5/14/2019`,
        changes: [
            `Manually crafting resources now gets all the same bonuses as auto crafting.`,
            `Fixed Recombination crispr upgrade.`,
            `Death limits added to each war campaign level.`,
            `War assessment added for each war campaign level.`,
        ]
    },
    {
        version: `0.2.54`,
        date: `5/13/2019`,
        changes: [
            `Uranium Breakdown Fixes.`,
        ]
    },
    {
        version: `0.2.53`,
        date: `5/13/2019`,
        changes: [
            `Breakdown Accuracy Enchancements.`,
            `Some Kindling Kindred costs reduced.`,
            `Fixed bug related to Fanaticism and Ent gods with foundry workers assigned to make plywood.`,
            `Plasmid bonus now applies to the sundial.`,
            `Fixed some spelling errors.`,
        ]
    },
    {
        version: `0.2.52`,
        date: `5/11/2019`,
        changes: [
            `Completed research can now be viewed on a seperate tab under research.`,
            `Removed Plywood requirement from Stock Exchange for players with Kindling Kindred trait.`,
            `Fixed a CSS issue in the A.R.P.A. projects tab.`,
        ]
    },
    {
        version: `0.2.51`,
        date: `5/11/2019`,
        changes: [
            `University starts slightly cheaper.`,
            `Added Spatial Superiority crispr upgrade.`,
            `Added Spatial Supremacy crispr upgrade.`,
            `Exporting a save string now automatically selects the text and copies it to the clipboard.`,
        ]
    },
    {
        version: `0.2.50`,
        date: `5/10/2019`,
        changes: [
            `Added new capacity breakdowns for various resources.`,
        ]
    },
    {
        version: `0.2.49`,
        date: `5/10/2019`,
        changes: [
            `Added changelog link to version listing.`,
            `Added protection against loading a corrupt save string.`,
            `Greedy trait is now less greedy.`,
            `Spelling error fixes.`,
        ]
    },
    {
        version: `0.2.48`,
        date: `5/8/2019`,
        changes: [
            `Resources that are at greater then 99% capacity now change color to indicate they are at cap.`,
            `Attacks from rival cities should no longer cause more wounded soldiers then you have.`,
            `Assigning craftsman when no citizens are free will no longer take the labor from another job.`,
        ]
    },
    {
        version: `0.2.47`,
        date: `5/8/2019`,
        changes: [
            `Gluttony trait lowered to 10% from 25% .`,
            `High Metabolism trait lowered to 5% from 10% .`,
            `Fixed Sheet Metal not being added to craftsman list when unlocked.`,
        ]
    },
    {
        version: `0.2.46`,
        date: `5/8/2019`,
        changes: [
            `The 5% library bonus was only applying to scientists which was not intended. This now applies to the sundial and professors as well.`,
        ]
    },
    {
        version: `0.2.45`,
        date: `5/8/2019`,
        changes: [
            `Fixed an issue that allowed you to get extra benefits from under-powered wardenclyffe towers and biolabs.`,
        ]
    },
    {
        version: `0.2.44`,
        date: `5/8/2019`,
        changes: [
            `Fixed Key Multipliers getting stuck down.`,
        ]
    },
    {
        version: `0.2.43`,
        date: `5/7/2019`,
        changes: [
            `Fixed bug that could cause player to get free extra crafted resources when using the +5 option.`,
            `Reordered buildings in Village tab to group them more logically.`,
        ]
    },
    {
        version: `0.2.42`,
        date: `5/7/2019`,
        changes: [
            `Fixed a bug that was causing soldiers to become immortal.`,
            `Fixed some bugs with morale that caused some weather patterns to apply a different value then was reported.`,
            `Added weather to Food breakdown.`,
        ]
    },
    {
        version: `0.2.41`,
        date: `5/7/2019`,
        changes: [
            `Added a 5% bonus to global knowledge production on libraries.`,
        ]
    },
    {
        version: `0.2.40`,
        date: `5/7/2019`,
        changes: [
            `The Hivemind trait no longer applies to farmers as this was especially punishing.`,
        ]
    },
    {
        version: `0.2.39`,
        date: `5/7/2019`,
        changes: [
            `Evolution 2.0: Redid the evolution stage of the game to make it feel less tedious and like it matters more to the next phase of the game.`,
            `Fixed a bug that has the intended effects of Pessimism and Optimism traits swapped.`,
        ]
    },
    {
        version: `0.2.38`,
        date: `5/6/2019`,
        changes: [
            `First public release.`,
        ]
    }
];

export function changeLog(){
    let content = $(`#content`);
    clearElement(content);

    for (let i=0; i<changeList.length; i++){
        let change = $(`<div class="infoBox"></div>`);
        content.append(change);

        change.append(`<div class="type"><h2 class="has-text-warning">v${changeList[i].version}</h2><span class="has-text-caution">${changeList[i].date}</span></div>`);

        for (let j=0; j<changeList[i].changes.length; j++){
            change.append(`<div class="desc">${changeList[i].changes[j]}</div>`);
        }
    }
}

export function getTopChange(elm){
    elm.append(`<div class="type"><h2 class="has-text-warning">v${changeList[0].version}</h2><span class="has-text-caution">${changeList[0].date}</span></div>`);
    for (let i=0; i<changeList[0].changes.length; i++){
        elm.append(`<div class="desc">${changeList[0].changes[i]}</div>`);
    }
    return elm;
}
