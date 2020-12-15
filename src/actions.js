import { global, save, poppers, webWorker, keyMultiplier, clearStates, keyMap, srSpeak, sizeApproximation, p_on, moon_on, gal_on, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { timeCheck, timeFormat, vBind, popover, clearElement, costMultiplier, darkEffect, genCivName, powerModifier, powerCostMod, calcPrestige, adjustCosts, modRes, messageQueue, buildQueue, format_emblem, calc_mastery, calcGenomeScore, getShrineBonus, getEaster, easterEgg, getHalloween, trickOrTreat } from './functions.js';
import { unlockAchieve, unlockFeat, drawAchieve, checkAchievements } from './achieve.js';
import { races, traits, genus_traits, randomMinorTrait, cleanAddTrait, biomes, planetTraits, setJType } from './races.js';
import { defineResources, galacticTrade, spatialReasoning } from './resources.js';
import { loadFoundry } from './jobs.js';
import { loadIndustry } from './industry.js';
import { defineIndustry, defineGarrison, buildGarrison, foreignGov, armyRating } from './civics.js';
import { spaceTech, interstellarTech, galaxyTech, universe_affixes, renderSpace, piracy } from './space.js';
import { renderFortress, fortressTech } from './portal.js';
import { arpa, gainGene, gainBlood } from './arpa.js';
import { techList } from './tech.js';

export const actions = {
    evolution: {
        rna: {
            id: 'evo-rna',
            title: 'RNA',
            desc(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                return loc('evo_rna',[rna]);
            },
            action(){
                if(global['resource']['RNA'].amount < global['resource']['RNA'].max){
                    modRes('RNA',global.race['rapid_mutation'] ? 2 : 1,true);
                }
                return false;
            }
        },
        dna: {
            id: 'evo-dna',
            title: loc('evo_dna_title'),
            desc: loc('evo_dna_desc'),
            cost: { RNA(){ return 2; } },
            action(){
                if (global['resource']['RNA'].amount >= 2 && global['resource']['DNA'].amount < global['resource']['DNA'].max){
                    modRes('RNA',-2,true);
                    modRes('DNA',1,true);
                }
                return false;
            },
            effect: loc('evo_dna_effect')
        },
        membrane: {
            id: 'evo-membrane',
            title: loc('evo_membrane_title'),
            desc: loc('evo_membrane_desc'),
            cost: { RNA(){ return evolveCosts('membrane',2,2); } },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                return loc('evo_membrane_effect',[effect]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource']['RNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 5 + 5 : 5;
                    global.evolution['membrane'].count++;
                    return true;
                }
                return false;
            }
        },
        organelles: {
            id: 'evo-organelles',
            title: loc('evo_organelles_title'),
            desc: loc('evo_organelles_desc'),
            cost: {
                RNA(){ return evolveCosts('organelles',12,8); },
                DNA(){ return evolveCosts('organelles',4,4); }
            },
            effect(){
                let rna = global.race['rapid_mutation'] ? 2 : 1;
                if (global.evolution['sexual_reproduction'] && global.evolution['sexual_reproduction'].count > 0){
                    rna++;
                }
                return loc('evo_organelles_effect',[rna]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['organelles'].count++;
                    return true;
                }
                return false;
            }
        },
        nucleus: {
            id: 'evo-nucleus',
            title: loc('evo_nucleus_title'),
            desc: loc('evo_nucleus_desc'),
            cost: {
                RNA(){ return evolveCosts('nucleus',38, global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 16 : 32 ); },
                DNA(){ return evolveCosts('nucleus',18, global.evolution['multicellular'] && global.evolution['multicellular'].count > 0 ? 12 : 16 ); }
            },
            effect(){
                let dna = (global.evolution['bilateral_symmetry'] && global.evolution['bilateral_symmetry'].count > 0) || (global.evolution['poikilohydric'] && global.evolution['poikilohydric'].count > 0) || (global.evolution['spores'] && global.evolution['spores'].count > 0) ? 2 : 1;
                return loc('evo_nucleus_effect',[dna]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['nucleus'].count++;
                    return true;
                }
                return false;
            }
        },
        eukaryotic_cell: {
            id: 'evo-eukaryotic_cell',
            title: loc('evo_eukaryotic_title'),
            desc: loc('evo_eukaryotic_desc'),
            cost: {
                RNA(){ return evolveCosts('eukaryotic_cell',20,20); },
                DNA(){ return evolveCosts('eukaryotic_cell',40,12); }
            },
            effect(){
                let effect = global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                return loc('evo_eukaryotic_effect',[effect]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['eukaryotic_cell'].count++;
                    global['resource']['DNA'].max += global.evolution['mitochondria'] ? global.evolution['mitochondria'].count * 10 + 10 : 10;
                    return true;
                }
                return false;
            }
        },
        mitochondria: {
            id: 'evo-mitochondria',
            title: loc('evo_mitochondria_title'),
            desc: loc('evo_mitochondria_desc'),
            cost: {
                RNA(){ return evolveCosts('mitochondria',75,50); },
                DNA(){ return evolveCosts('mitochondria',65,35); }
            },
            effect: loc('evo_mitochondria_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['mitochondria'].count++;
                    return true;
                }
                return false;
            }
        },
        sexual_reproduction: {
            id: 'evo-sexual_reproduction',
            title: loc('evo_sexual_reproduction_title'),
            desc: loc('evo_sexual_reproduction_desc'),
            cost: {
                DNA(){ return 150; }
            },
            effect: loc('evo_sexual_reproduction_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sexual_reproduction'].count++;
                    removeAction(actions.evolution.sexual_reproduction.id);

                    global.evolution['phagocytosis'] = { count: 0 };
                    addAction('evolution','phagocytosis');
                    global.evolution['chloroplasts'] = { count: 0 };
                    addAction('evolution','chloroplasts');
                    global.evolution['chitin'] = { count: 0 };
                    addAction('evolution','chitin');

                    global.evolution['final'] = 20;
                    evoProgress();
                }
                return false;
            }
        },
        phagocytosis: {
            id: 'evo-phagocytosis',
            title: loc('evo_phagocytosis_title'),
            desc: loc('evo_phagocytosis_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect: loc('evo_phagocytosis_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['phagocytosis'].count++;
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.chloroplasts;
                    delete global.evolution.chitin;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        chloroplasts: {
            id: 'evo-chloroplasts',
            title: loc('evo_chloroplasts_title'),
            desc: loc('evo_chloroplasts_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chloroplasts_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chloroplasts_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['chloroplasts'].count++;
                    removeAction(actions.evolution.chloroplasts.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chitin.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chitin;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        chitin: {
            id: 'evo-chitin',
            title: loc('evo_chitin_title'),
            desc: loc('evo_chitin_desc'),
            cost: {
                DNA(){ return 175; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_chitin_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_chitin_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['chitin'].count++;
                    removeAction(actions.evolution.chitin.id);
                    removeAction(actions.evolution.phagocytosis.id);
                    removeAction(actions.evolution.chloroplasts.id);
                    delete global.evolution.phagocytosis;
                    delete global.evolution.chloroplasts;
                    global.evolution['multicellular'] = { count: 0 };
                    global.evolution['final'] = 40;
                    addAction('evolution','multicellular');
                    evoProgress();
                }
                return false;
            }
        },
        multicellular: {
            id: 'evo-multicellular',
            title: loc('evo_multicellular_title'),
            desc: loc('evo_multicellular_desc'),
            cost: {
                DNA(){ return 200; }
            },
            effect: loc('evo_multicellular_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['multicellular'].count++;
                    removeAction(actions.evolution.multicellular.id);
                    global.evolution['final'] = 60;

                    if (global.evolution['phagocytosis']){
                        global.evolution['bilateral_symmetry'] = { count: 0 };
                        addAction('evolution','bilateral_symmetry');
                    }
                    else if (global.evolution['chloroplasts']){
                        global.evolution['poikilohydric'] = { count: 0 };
                        addAction('evolution','poikilohydric');
                    }
                    else if (global.evolution['chitin']) {
                        global.evolution['spores'] = { count: 0 };
                        addAction('evolution','spores');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        spores: {
            id: 'evo-spores',
            title: loc('evo_spores_title'),
            desc: loc('evo_spores_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['spores'].count++;
                    removeAction(actions.evolution.spores.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            }
        },
        poikilohydric: {
            id: 'evo-poikilohydric',
            title: loc('evo_poikilohydric_title'),
            desc: loc('evo_poikilohydric_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['poikilohydric'].count++;
                    removeAction(actions.evolution.poikilohydric.id);
                    global.evolution['bryophyte'] = { count: 0 };
                    global.evolution['final'] = 80;
                    addAction('evolution','bryophyte');
                    evoProgress();
                }
                return false;
            }
        },
        bilateral_symmetry: {
            id: 'evo-bilateral_symmetry',
            title: loc('evo_bilateral_symmetry_title'),
            desc: loc('evo_bilateral_symmetry_desc'),
            cost: {
                DNA(){ return 230; }
            },
            effect: loc('evo_nucleus_boost'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['bilateral_symmetry'].count++;
                    removeAction(actions.evolution.bilateral_symmetry.id);
                    global.evolution['final'] = 80;

                    global.evolution['athropods'] = { count: 0 };
                    addAction('evolution','athropods');
                    global.evolution['mammals'] = { count: 0 };
                    addAction('evolution','mammals');
                    global.evolution['eggshell'] = { count: 0 };
                    addAction('evolution','eggshell');

                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        global.evolution['aquatic'] = { count: 0 };
                        addAction('evolution','aquatic');
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        global.evolution['fey'] = { count: 0 };
                        addAction('evolution','fey');
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        global.evolution['sand'] = { count: 0 };
                        addAction('evolution','sand');
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        global.evolution['heat'] = { count: 0 };
                        addAction('evolution','heat');
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        global.evolution['polar'] = { count: 0 };
                        addAction('evolution','polar');
                    }

                    evoProgress();
                }
                return false;
            }
        },
        bryophyte: {
            id: 'evo-bryophyte',
            title: loc('evo_bryophyte_title'),
            desc: loc('evo_bryophyte_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_bryophyte_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['bryophyte'].count++;
                    removeAction(actions.evolution.bryophyte.id);
                    global.evolution['final'] = 100;
                    global.evolution['sentience'] = { count: 0 };
                    addAction('evolution','sentience');

                    if (global.evolution['chitin']){
                        addRaces(['sporgar','shroomi','moldling']);
                        if (races.custom.hasOwnProperty('type') && races.custom.type === 'fungi'){
                            global.evolution['custom'] = { count: 0 };
                            addAction('evolution','custom');
                        }
                    }
                    else {
                        addRaces(['entish','cacti','pinguicula']);
                        if (races.custom.hasOwnProperty('type') && races.custom.type === 'plant'){
                            global.evolution['custom'] = { count: 0 };
                            addAction('evolution','custom');
                        }
                    }

                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        athropods: {
            id: 'evo-athropods',
            title: loc('evo_athropods_title'),
            desc: loc('evo_athropods_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_athropods_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_athropods_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['athropods'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['mantis','scorpid','antid']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'insectoid'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        mammals: {
            id: 'evo-mammals',
            title: loc('evo_mammals_title'),
            desc: loc('evo_mammals_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect: loc('evo_mammals_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['mammals'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.eggshell;
                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        global.evolution['demonic'] = { count: 0 };
                        addAction('evolution','demonic');
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        global.evolution['celestial'] = { count: 0 };
                        addAction('evolution','celestial');
                    }
                    global.evolution['humanoid'] = { count: 0 };
                    global.evolution['gigantism'] = { count: 0 };
                    global.evolution['dwarfism'] = { count: 0 };
                    global.evolution['animalism'] = { count: 0 };
                    global.evolution['final'] = 90;
                    addAction('evolution','humanoid');
                    addAction('evolution','gigantism');
                    addAction('evolution','dwarfism');
                    addAction('evolution','animalism');
                    evoProgress();
                }
                return false;
            }
        },
        humanoid: {
            id: 'evo-humanoid',
            title: loc('evo_humanoid_title'),
            desc: loc('evo_humanoid_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_humanoid_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_humanoid_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['humanoid'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['human','orc','elven']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'humanoid'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        gigantism: {
            id: 'evo-gigantism',
            title: loc('evo_gigantism_title'),
            desc: loc('evo_gigantism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_gigantism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_gigantism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['gigantism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['troll','ogre','cyclops']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'giant'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        dwarfism: {
            id: 'evo-dwarfism',
            title: loc('evo_dwarfism_title'),
            desc: loc('evo_dwarfism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_dwarfism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_dwarfism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['dwarfism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.animalism;
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['kobold','goblin','gnome']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'small'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        animalism: {
            id: 'evo-animalism',
            title: loc('evo_animalism_title'),
            desc: loc('evo_animalism_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_animalism_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_animalism_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['animalism'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    if (global.city.biome === 'hellscape' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden' || global.blood['unbound'] && global.blood.unbound >= 3){
                        removeAction(actions.evolution.celestial.id);
                        delete global.evolution.celestial;
                    }
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['cath','wolven','centaur']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'animal'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        celestial: {
            id: 'evo-celestial',
            title: loc('evo_celestial_title'),
            desc: loc('evo_celestial_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return loc('evo_celestial_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['celestial'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    removeAction(actions.evolution.celestial.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['seraph','unicorn']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'angelic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        demonic: {
            id: 'evo-demonic',
            title: loc('evo_demonic_title'),
            desc: loc('evo_demonic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe === 'evil' ? `<div>${loc('evo_demonic_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_demonic_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['demonic'].count++;
                    removeAction(actions.evolution.humanoid.id);
                    removeAction(actions.evolution.gigantism.id);
                    removeAction(actions.evolution.dwarfism.id);
                    removeAction(actions.evolution.animalism.id);
                    removeAction(actions.evolution.demonic.id);
                    delete global.evolution.humanoid;
                    delete global.evolution.gigantism;
                    delete global.evolution.dwarfism;
                    delete global.evolution.animalism;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['balorg','imp']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'demonic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        aquatic: {
            id: 'evo-aquatic',
            title: loc('evo_aquatic_title'),
            desc: loc('evo_aquatic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_aquatic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['aquatic'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.aquatic.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['sharkin','octigoran']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'aquatic'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        fey: {
            id: 'evo-fey',
            title: loc('evo_fey_title'),
            desc: loc('evo_fey_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_fey_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['fey'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.fey.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['dryad','satyr']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'fey'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        heat: {
            id: 'evo-heat',
            title: loc('evo_heat_title'),
            desc: loc('evo_heat_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_heat_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['heat'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.heat.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['phoenix','salamander']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'heat'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        polar: {
            id: 'evo-polar',
            title: loc('evo_polar_title'),
            desc: loc('evo_polar_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_polar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['polar'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.polar.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['yeti','wendigo']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'polar'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        sand: {
            id: 'evo-sand',
            title: loc('evo_sand_title'),
            desc: loc('evo_sand_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_sand_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sand'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    removeAction(actions.evolution.sand.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    delete global.evolution.eggshell;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['tuskin','kamel']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'sand'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        eggshell: {
            id: 'evo-eggshell',
            title: loc('evo_eggshell_title'),
            desc: loc('evo_eggshell_desc'),
            cost: {
                DNA(){ return 245; }
            },
            effect(){ return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_eggshell_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_eggshell_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['eggshell'].count++;
                    removeAction(actions.evolution.athropods.id);
                    removeAction(actions.evolution.mammals.id);
                    removeAction(actions.evolution.eggshell.id);
                    delete global.evolution.athropods;
                    delete global.evolution.mammals;
                    if (global.city.biome === 'oceanic' || global.blood['unbound']){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest' || global.blood['unbound']){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert' || global.blood['unbound']){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic' || global.blood['unbound']){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra' || global.blood['unbound']){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    global.evolution['endothermic'] = { count: 0 };
                    global.evolution['ectothermic'] = { count: 0 };
                    global.evolution['final'] = 90;
                    addAction('evolution','endothermic');
                    addAction('evolution','ectothermic');
                    evoProgress();
                }
                return false;
            }
        },
        endothermic: {
            id: 'evo-endothermic',
            title: loc('evo_endothermic_title'),
            desc: loc('evo_endothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_endothermic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['endothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.ectothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['arraak','pterodacti','dracnid']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'avian'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        ectothermic: {
            id: 'evo-ectothermic',
            title: loc('evo_ectothermic_title'),
            desc: loc('evo_ectothermic_desc'),
            cost: {
                DNA(){ return 260; }
            },
            effect: loc('evo_ectothermic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['ectothermic'].count++;
                    removeAction(actions.evolution.endothermic.id);
                    removeAction(actions.evolution.ectothermic.id);
                    delete global.evolution.endothermic;
                    global.evolution['sentience'] = { count: 0 };
                    global.evolution['final'] = 100;
                    addAction('evolution','sentience');
                    addRaces(['tortoisan','gecko','slitheryn']);
                    if (races.custom.hasOwnProperty('type') && races.custom.type === 'reptilian'){
                        global.evolution['custom'] = { count: 0 };
                        addAction('evolution','custom');
                    }
                    if (global.genes['challenge']){
                        global.evolution['bunker'] = { count: 0 };
                        addAction('evolution','bunker');
                    }
                    evoProgress();
                }
                return false;
            }
        },
        sentience: {
            id: 'evo-sentience',
            title: loc('evo_sentience_title'),
            desc: loc('evo_sentience_desc'),
            cost: {
                RNA(){ return 300; },
                DNA(){ return 300; }
            },
            effect: loc('evo_sentience_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);

                    // Trigger Next Phase of game
                    let races = [];
                    if (global.evolution['humanoid']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'humanoid';
                            races.push('junker');
                        }
                        else {
                            races.push('elven');
                            races.push('orc');
                            races.push('human');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'humanoid'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['gigantism']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'giant';
                            races.push('junker');
                        }
                        else {
                            races.push('troll');
                            races.push('ogre');
                            races.push('cyclops');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'giant'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['dwarfism']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'small';
                            races.push('junker');
                        }
                        else {
                            races.push('kobold');
                            races.push('goblin');
                            races.push('gnome');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'small'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['animalism']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'animal';
                            races.push('junker');
                        }
                        else {
                            races.push('cath');
                            races.push('wolven');
                            races.push('centaur');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'animal'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['ectothermic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'reptilian';
                            races.push('junker');
                        }
                        else {
                            races.push('tortoisan');
                            races.push('gecko');
                            races.push('slitheryn');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'reptilian'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['endothermic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'avian';
                            races.push('junker');
                        }
                        else {
                            races.push('arraak');
                            races.push('pterodacti');
                            races.push('dracnid');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'avian'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['chitin']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'fungi';
                            races.push('junker');
                        }
                        else {
                            races.push('sporgar');
                            races.push('shroomi');
                            races.push('moldling');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fungi'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['athropods']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'insectoid';
                            races.push('junker');
                        }
                        else {
                            races.push('mantis');
                            races.push('scorpid');
                            races.push('antid');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'insectoid'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['chloroplasts']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'plant';
                            races.push('junker');
                        }
                        else {
                            races.push('entish');
                            races.push('cacti');
                            races.push('pinguicula');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'plant'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['aquatic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'aquatic';
                            races.push('junker');
                        }
                        else {
                            races.push('sharkin');
                            races.push('octigoran');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'aquatic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['fey']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'fey';
                            races.push('junker');
                        }
                        else {
                            races.push('dryad');
                            races.push('satyr');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fey'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['heat']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'heat';
                            races.push('junker');
                        }
                        else {
                            races.push('phoenix');
                            races.push('salamander');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'heat'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['polar']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'polar';
                            races.push('junker');
                        }
                        else {
                            races.push('yeti');
                            races.push('wendigo');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'polar'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['sand']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'sand';
                            races.push('junker');
                        }
                        else {
                            races.push('tuskin');
                            races.push('kamel');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'sand'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['demonic']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'demonic';
                            races.push('junker');
                        }
                        else {
                            races.push('balorg');
                            races.push('imp');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'demonic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['celestial']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'angelic';
                            races.push('junker');
                        }
                        else {
                            races.push('seraph');
                            races.push('unicorn');
                            if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'angelic'){
                                races.push('custom');
                            }
                        }
                    }
                    else if (global.evolution['eggshell']){
                        if (global.race['junker']){
                            global.race['jtype'] = 'avian';
                            races.push('junker');
                        }
                        else {
                            races.push('dracnid');
                        }
                    }
                    else {
                        if (global.race['junker']){
                            global.race['jtype'] = 'humanoid';
                            races.push('junker');
                        }
                        else {
                            races.push('human');
                        }
                    }

                    global.race.species = races[Math.floor(Math.seededRandom(0,races.length))];
                    if (global.stats.achieve[`extinct_${global.race.species}`] && global.stats.achieve[`extinct_${global.race.species}`].l >= 1){
                        global.race.species = races[Math.floor(Math.seededRandom(0,races.length))];
                    }

                    sentience();
                }
                return false;
            },
            emblem(){
                if (global.evolution['humanoid']){
                    return format_emblem('genus_humanoid');
                }
                else if (global.evolution['gigantism']){
                    return format_emblem('genus_giant');
                }
                else if (global.evolution['dwarfism']){
                    return format_emblem('genus_small');
                }
                else if (global.evolution['animalism']){
                    return format_emblem('genus_animal');
                }
                else if (global.evolution['ectothermic']){
                    return format_emblem('genus_reptilian');
                }
                else if (global.evolution['endothermic']){
                    return format_emblem('genus_avian');
                }
                else if (global.evolution['chitin']){
                    return format_emblem('genus_fungi');
                }
                else if (global.evolution['athropods']){
                    return format_emblem('genus_insectoid');
                }
                else if (global.evolution['chloroplasts']){
                    return format_emblem('genus_plant');
                }
                else if (global.evolution['aquatic']){
                    return format_emblem('genus_aquatic');
                }
                else if (global.evolution['fey']){
                    return format_emblem('genus_fey');
                }
                else if (global.evolution['heat']){
                    return format_emblem('genus_heat');
                }
                else if (global.evolution['polar']){
                    return format_emblem('genus_polar');
                }
                else if (global.evolution['sand']){
                    return format_emblem('genus_sand');
                }
                else if (global.evolution['demonic']){
                    return format_emblem('genus_demonic');
                }
                else if (global.evolution['celestial']){
                    return format_emblem('genus_angelic');
                }
                else {
                    return '';
                }
            }
        },
        human: {
            id: 'evo-human',
            title(){ return races.human.name; },
            desc(){ return `${loc("evo_evolve")} ${races.human.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.human.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'human';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_human'); }
        },
        orc: {
            id: 'evo-orc',
            title(){ return races.orc.name; },
            desc(){ return `${loc("evo_evolve")} ${races.orc.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.orc.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'orc';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_orc'); }
        },
        elven: {
            id: 'evo-elven',
            title(){ return races.elven.name; },
            desc(){ return `${loc("evo_evolve")} ${races.elven.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.elven.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'elven';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_elven'); }
        },
        troll: {
            id: 'evo-troll',
            title(){ return races.troll.name; },
            desc(){ return `${loc("evo_evolve")} ${races.troll.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.troll.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'troll';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_troll'); }
        },
        ogre: {
            id: 'evo-ogre',
            title(){ return races.ogre.name; },
            desc(){ return `${loc("evo_evolve")} ${races.ogre.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.ogre.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'ogre';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_ogre'); }
        },
        cyclops: {
            id: 'evo-cyclops',
            title(){ return races.cyclops.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cyclops.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cyclops.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cyclops';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cyclops'); }
        },
        kobold: {
            id: 'evo-kobold',
            title(){ return races.kobold.name; },
            desc(){ return `${loc("evo_evolve")} ${races.kobold.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.kobold.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'kobold';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_kobold'); }
        },
        goblin: {
            id: 'evo-goblin',
            title(){ return races.goblin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.goblin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.goblin.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'goblin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_goblin'); }
        },
        gnome: {
            id: 'evo-gnome',
            title(){ return races.gnome.name; },
            desc(){ return `${loc("evo_evolve")} ${races.gnome.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.gnome.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gnome';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_gnome'); }
        },
        cath: {
            id: 'evo-cath',
            title(){ return races.cath.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cath.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cath.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cath';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cath'); }
        },
        wolven: {
            id: 'evo-wolven',
            title(){ return races.wolven.name; },
            desc(){ return `${loc("evo_evolve")} ${races.wolven.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.wolven.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'wolven';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_wolven'); }
        },
        centaur: {
            id: 'evo-centaur',
            title(){ return races.centaur.name; },
            desc(){ return `${loc("evo_evolve")} ${races.centaur.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.centaur.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'centaur';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_centaur'); }
        },
        tortoisan: {
            id: 'evo-tortoisan',
            title(){ return races.tortoisan.name; },
            desc(){ return `${loc("evo_evolve")} ${races.tortoisan.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.tortoisan.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'tortoisan';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_tortoisan'); }
        },
        gecko: {
            id: 'evo-gecko',
            title(){ return races.gecko.name; },
            desc(){ return `${loc("evo_evolve")} ${races.gecko.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.gecko.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'gecko';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_gecko'); }
        },
        slitheryn: {
            id: 'evo-slitheryn',
            title(){ return races.slitheryn.name; },
            desc(){ return `${loc("evo_evolve")} ${races.slitheryn.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.slitheryn.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'slitheryn';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_slitheryn'); }
        },
        arraak: {
            id: 'evo-arraak',
            title(){ return races.arraak.name; },
            desc(){ return `${loc("evo_evolve")} ${races.arraak.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.arraak.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'arraak';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_arraak'); }
        },
        pterodacti: {
            id: 'evo-pterodacti',
            title(){ return races.pterodacti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.pterodacti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.pterodacti.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'pterodacti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_pterodacti'); }
        },
        dracnid: {
            id: 'evo-dracnid',
            title(){ return races.dracnid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.dracnid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.dracnid.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'dracnid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_dracnid'); }
        },
        sporgar: {
            id: 'evo-sporgar',
            title(){ return races.sporgar.name; },
            desc(){ return `${loc("evo_evolve")} ${races.sporgar.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.sporgar.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sporgar';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_sporgar'); }
        },
        shroomi: {
            id: 'evo-shroomi',
            title(){ return races.shroomi.name; },
            desc(){ return `${loc("evo_evolve")} ${races.shroomi.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.shroomi.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'shroomi';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_shroomi'); }
        },
        moldling: {
            id: 'evo-moldling',
            title(){ return races.moldling.name; },
            desc(){ return `${loc("evo_evolve")} ${races.moldling.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.moldling.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'moldling';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_moldling'); }
        },
        mantis: {
            id: 'evo-mantis',
            title(){ return races.mantis.name; },
            desc(){ return `${loc("evo_evolve")} ${races.mantis.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.mantis.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'mantis';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_mantis'); }
        },
        scorpid: {
            id: 'evo-scorpid',
            title(){ return races.scorpid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.scorpid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.scorpid.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'scorpid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_scorpid'); }
        },
        antid: {
            id: 'evo-antid',
            title(){ return races.antid.name; },
            desc(){ return `${loc("evo_evolve")} ${races.antid.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.antid.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'antid';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_antid'); }
        },
        entish: {
            id: 'evo-entish',
            title(){ return races.entish.name; },
            desc(){ return `${loc("evo_evolve")} ${races.entish.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.entish.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'entish';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_entish'); }
        },
        cacti: {
            id: 'evo-cacti',
            title(){ return races.cacti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.cacti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.cacti.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'cacti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_cacti'); }
        },
        pinguicula: {
            id: 'evo-pinguicula',
            title(){ return races.pinguicula.name; },
            desc(){ return `${loc("evo_evolve")} ${races.pinguicula.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.pinguicula.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'pinguicula';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_pinguicula'); }
        },
        sharkin: {
            id: 'evo-sharkin',
            title(){ return races.sharkin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.sharkin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.sharkin.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'sharkin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_sharkin'); }
        },
        octigoran: {
            id: 'evo-octigoran',
            title(){ return races.octigoran.name; },
            desc(){ return `${loc("evo_evolve")} ${races.octigoran.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.octigoran.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'octigoran';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_octigoran'); }
        },
        dryad: {
            id: 'evo-dryad',
            title(){ return races.dryad.name; },
            desc(){ return `${loc("evo_evolve")} ${races.dryad.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.dryad.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'dryad';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_dryad'); }
        },
        satyr: {
            id: 'evo-satyr',
            title(){ return races.satyr.name; },
            desc(){ return `${loc("evo_evolve")} ${races.satyr.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.satyr.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'satyr';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_satyr'); }
        },
        phoenix: {
            id: 'evo-phoenix',
            title(){ return races.phoenix.name; },
            desc(){ return `${loc("evo_evolve")} ${races.phoenix.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.phoenix.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'phoenix';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_phoenix'); }
        },
        salamander: {
            id: 'evo-salamander',
            title(){ return races.salamander.name; },
            desc(){ return `${loc("evo_evolve")} ${races.salamander.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.salamander.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'salamander';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_salamander'); }
        },
        yeti: {
            id: 'evo-yeti',
            title(){ return races.yeti.name; },
            desc(){ return `${loc("evo_evolve")} ${races.yeti.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.yeti.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'yeti';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_yeti'); }
        },
        wendigo: {
            id: 'evo-wendigo',
            title(){ return races.wendigo.name; },
            desc(){ return `${loc("evo_evolve")} ${races.wendigo.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.wendigo.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'wendigo';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_wendigo'); }
        },
        tuskin: {
            id: 'evo-tuskin',
            title(){ return races.tuskin.name; },
            desc(){ return `${loc("evo_evolve")} ${races.tuskin.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.tuskin.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'tuskin';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_tuskin'); }
        },
        kamel: {
            id: 'evo-kamel',
            title(){ return races.kamel.name; },
            desc(){ return `${loc("evo_evolve")} ${races.kamel.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.kamel.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'kamel';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_kamel'); }
        },
        balorg: {
            id: 'evo-balorg',
            title(){ return races.balorg.name; },
            desc(){ return `${loc("evo_evolve")} ${races.balorg.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.balorg.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'balorg';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_balorg'); }
        },
        imp: {
            id: 'evo-imp',
            title(){ return races.imp.name; },
            desc(){ return `${loc("evo_evolve")} ${races.imp.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.imp.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'imp';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_imp'); }
        },
        seraph: {
            id: 'evo-seraph',
            title(){ return races.seraph.name; },
            desc(){ return `${loc("evo_evolve")} ${races.seraph.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.seraph.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'seraph';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_seraph'); }
        },
        unicorn: {
            id: 'evo-unicorn',
            title(){ return races.unicorn.name; },
            desc(){ return `${loc("evo_evolve")} ${races.unicorn.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.unicorn.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'unicorn';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_unicorn'); }
        },
        custom: {
            id: 'evo-custom',
            title(){ return races.custom.name; },
            desc(){ return `${loc("evo_evolve")} ${races.custom.name}`; },
            cost: {
                RNA(){ return 320; },
                DNA(){ return 320; }
            },
            effect(){ return loc('evo_pick_race',[races.custom.name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['sentience'].count++;
                    removeAction(actions.evolution.sentience.id);
                    global.race.species = 'custom';
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_custom'); }
        },
        bunker: {
            id: 'evo-bunker',
            title: loc('evo_bunker'),
            desc(){ return `<div>${loc('evo_bunker')}</div><div class="has-text-special">${loc('evo_challenge')}</div>`; },
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_bunker_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.evolution['bunker'] = { count: 1 };
                    removeAction(actions.evolution.bunker.id);
                    evoProgress();
                    if (global.race.universe === 'antimatter'){
                        global.evolution['mastery'] = { count: 0 };
                    }
                    else {
                        global.evolution['plasmid'] = { count: 0 };
                    }
                    global.evolution['trade'] = { count: 0 };
                    global.evolution['craft'] = { count: 0 };
                    global.evolution['crispr'] = { count: 0 };
                    global.evolution['junker'] = { count: 0 };
                    global.evolution['joyless'] = { count: 0 };
                    global.evolution['steelen'] = { count: 0 };
                    if (global.stats.achieve['whitehole']){
                        global.evolution['decay'] = { count: 0 };
                    }
                    if (global.stats.achieve['ascended']){
                        global.evolution['emfield'] = { count: 0 };
                    }
                    if (global.stats.achieve['shaken']){
                        global.evolution['cataclysm'] = { count: 0 };
                    }
                    challengeGeneHeader();
                    if (global.race.universe === 'antimatter'){
                        addAction('evolution','mastery');
                    }
                    else {
                        addAction('evolution','plasmid');
                    }
                    addAction('evolution','trade');
                    addAction('evolution','craft');
                    addAction('evolution','crispr');
                    challengeActionHeader();
                    addAction('evolution','joyless');
                    addAction('evolution','steelen');
                    if (global.stats.achieve['whitehole']){
                        addAction('evolution','decay');
                    }
                    if (global.stats.achieve['ascended']){
                        addAction('evolution','emfield');
                    }
                    scenarioActionHeader();
                    addAction('evolution','junker');
                    if (global.stats.achieve['shaken']){
                        addAction('evolution','cataclysm');
                    }
                }
                return false;
            },
            flair: loc('evo_bunker_flair')
        },
        plasmid: {
            id: 'evo-plasmid',
            title: loc('evo_challenge_plasmid'),
            desc: loc('evo_challenge_plasmid'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_plasmid_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_plasmid']){
                        delete global.race['no_plasmid'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                        ['junker','cataclysm'].forEach(function(s){
                            delete global.race[s];
                            $(`#evo-${s}`).removeClass('hl');
                        });
                    }
                    else {
                        global.race['no_plasmid'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_plasmid'] ? true : false; }
        },
        mastery: {
            id: 'evo-mastery',
            title: loc('evo_challenge_mastery'),
            desc: loc('evo_challenge_mastery'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_mastery_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['weak_mastery']){
                        delete global.race['weak_mastery'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                        ['junker','cataclysm'].forEach(function(s){
                            delete global.race[s];
                            $(`#evo-${s}`).removeClass('hl');
                        });
                    }
                    else {
                        global.race['weak_mastery'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    calc_mastery(true);
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['weak_mastery'] ? true : false; }
        },
        trade: {
            id: 'evo-trade',
            title: loc('evo_challenge_trade'),
            desc: loc('evo_challenge_trade'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_trade_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_trade']){
                        delete global.race['no_trade'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                        ['junker','cataclysm'].forEach(function(s){
                            delete global.race[s];
                            $(`#evo-${s}`).removeClass('hl');
                        });
                    }
                    else {
                        global.race['no_trade'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_trade'] ? true : false; }
        },
        craft: {
            id: 'evo-craft',
            title: loc('evo_challenge_craft'),
            desc: loc('evo_challenge_craft'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_craft_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['no_craft']){
                        delete global.race['no_craft'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                        ['junker','cataclysm'].forEach(function(s){
                            delete global.race[s];
                            $(`#evo-${s}`).removeClass('hl');
                        });
                    }
                    else {
                        global.race['no_craft'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_craft'] ? true : false; }
        },
        crispr: {
            id: 'evo-crispr',
            title: loc('evo_challenge_crispr'),
            desc: loc('evo_challenge_crispr_desc'),
            cost: {
                DNA(){ return 10; }
            },
            effect: loc('evo_challenge_crispr_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['no_crispr']){
                            delete global.race['no_crispr'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                            ['junker','cataclysm'].forEach(function(s){
                                delete global.race[s];
                                $(`#evo-${s}`).removeClass('hl');
                            });
                        }
                        else {
                            global.race['no_crispr'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                    drawAchieve();
                }
                return false;
            },
            highlight(){ return global.race['no_crispr'] ? true : false; }
        },
        joyless: {
            id: 'evo-joyless',
            title: loc('evo_challenge_joyless'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_joyless_desc')}</div>` : loc('evo_challenge_joyless_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_joyless_effect'),
            action(){
                if (payCosts(actions.evolution.joyless.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['joyless']){
                            delete global.race['joyless'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['joyless'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('joyless'); },
            flair: loc('evo_challenge_joyless_flair'),
            highlight(){ return global.race['joyless'] ? true : false; }
        },
        steelen: {
            id: 'evo-steelen',
            title: loc('evo_challenge_steelen'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_steelen_desc')}</div>` : loc('evo_challenge_steelen_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_steelen_effect'),
            action(){
                if (payCosts(actions.evolution.steelen.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['steelen']){
                            delete global.race['steelen'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['steelen'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('steelen'); },
            flair: loc('evo_challenge_steelen_flair'),
            highlight(){ return global.race['steelen'] ? true : false; }
        },
        decay: {
            id: 'evo-decay',
            title: loc('evo_challenge_decay'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_decay_desc')}</div>` : loc('evo_challenge_decay_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_decay_effect'),
            action(){
                if (payCosts(actions.evolution.decay.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['decay']){
                            delete global.race['decay'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['decay'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('dissipated'); },
            flair: loc('evo_challenge_decay_flair'),
            highlight(){ return global.race['decay'] ? true : false; }
        },
        emfield: {
            id: 'evo-emfield',
            title: loc('evo_challenge_emfield'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div>${loc('evo_challenge_emfield_desc')}</div>` : loc('evo_challenge_emfield_desc'); },
            cost: {
                DNA(){ return 25; }
            },
            effect: loc('evo_challenge_emfield_effect'),
            action(){
                if (payCosts(actions.evolution.decay.cost)){
                    if (payCosts($(this)[0].cost)){
                        if (global.race['emfield']){
                            delete global.race['emfield'];
                            $(`#${$(this)[0].id}`).removeClass('hl');
                        }
                        else {
                            global.race['emfield'] = 1;
                            $(`#${$(this)[0].id}`).addClass('hl');
                        }
                        drawAchieve();
                    }
                }
                return false;
            },
            emblem(){ return format_emblem('technophobe'); },
            flair: loc('evo_challenge_emfield_flair'),
            highlight(){ return global.race['emfield'] ? true : false; }
        },
        junker: {
            id: 'evo-junker',
            title: loc('evo_challenge_junker'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div class="has-text-danger">${loc('evo_start')}</div>` : `<div>${loc('evo_challenge_junker_desc')}</div><div class="has-text-danger">${loc('evo_start')}</div>`; },
            cost: {
                DNA(){ return 50; }
            },
            effect(){
                return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_challenge_junker_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_challenge_junker_effect'); },
            action(){
                if (payCosts(actions.evolution.junker.cost)){
                    setScenario('junker');
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_junker'); },
            flair: loc('evo_challenge_junker_flair'),
            highlight(){ return global.race['junker'] ? true : false; }
        },
        cataclysm: {
            id: 'evo-cataclysm',
            title: loc('evo_challenge_cataclysm'),
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div>` : `<div>${loc('evo_challenge_cataclysm_desc')}</div>`; },
            cost: {
                DNA(){ return 50; }
            },
            effect(){
                if (calc_mastery() >= 50){
                    return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-caution">${loc('evo_challenge_cataclysm_warn')}</div>`;
                }
                else {
                    return `<div>${loc('evo_challenge_cataclysm_effect')}</div><div class="has-text-danger">${loc('evo_challenge_scenario_warn')}</div>`;
                }
            },
            action(){
                if (payCosts(actions.evolution.cataclysm.cost)){
                    setScenario('cataclysm');
                }
                return false;
            },
            emblem(){ return format_emblem('iron_will'); },
            flair: loc('evo_challenge_cataclysm_flair'),
            highlight(){ return global.race['cataclysm'] ? true : false; }
        },
    },
    city: {
        gift: {
            id: 'city-gift',
            title: loc('city_gift'),
            desc: loc('city_gift_desc'),
            wiki: false,
            category: 'outskirts',
            reqs: { primitive: 1 },
            no_queue(){ return true },
            not_tech: ['santa'],
            not_trait: ['cataclysm'],
            class: ['hgift'],
            condition(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    return global['special'] && global.special['gift'] ? true : false;
                }
                return false;
            },
            action(){
                const date = new Date();
                if ( date.getFullYear() <= 2020 && ((date.getMonth() === 11 && date.getDate() <= 16) || (date.getMonth() !== 11)) ){
                    if (global['special'] && global.special['gift']){
                        delete global.special['gift'];
                        if (global.race.universe === 'antimatter'){
                            global.race.Plasmid.anti += 100;
                            global.stats.antiplasmid += 100;
                            messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_antiplasmid')]),'info');
                        }
                        else {
                            global.race.Plasmid.count += 100;
                            global.stats.plasmid += 100;
                            messageQueue(loc('city_gift_msg',[100,loc('arpa_genepool_effect_plasmid')]),'info');
                        }
                        drawCity();
                    }
                }
                else if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    if (global['special'] && global.special['gift']){
                        delete global.special['gift'];
                        
                        let resets = global.stats.hasOwnProperty('reset') ? global.stats.reset : 0;
                        let mad = global.stats.hasOwnProperty('mad') ? global.stats.mad : 0;
                        let bioseed = global.stats.hasOwnProperty('bioseed') ? global.stats.bioseed : 0;
                        let cataclysm = global.stats.hasOwnProperty('cataclysm') ? global.stats.cataclysm : 0;

                        let plasmid = 100 + resets + mad;
                        let phage = bioseed + cataclysm;

                        let gift = [];
                        if (global.race.universe === 'antimatter'){
                            global.race.Plasmid.anti += plasmid;
                            global.stats.antiplasmid += plasmid;
                            gift.push(`${plasmid} ${loc(`resource_AntiPlasmid_plural_name`)}`);
                        }
                        else {
                            global.race.Plasmid.count += plasmid;
                            global.stats.plasmid += plasmid;
                            gift.push(`${plasmid} ${loc(`resource_Plasmid_plural_name`)}`);
                        }
                        if (phage > 0){
                            global.race.Phage.count += phage;
                            global.stats.phage += phage;
                            gift.push(`${phage} ${loc(`resource_Phage_name`)}`);
                        }

                        if (global.stats.hasOwnProperty('achieve')){
                            let universe = global.stats.achieve['whitehole'] ? global.stats.achieve['whitehole'].l : 0;
                            universe += global.stats.achieve['heavy'] ? global.stats.achieve['heavy'].l : 0;
                            universe += global.stats.achieve['canceled'] ? global.stats.achieve['canceled'].l : 0;
                            universe += global.stats.achieve['eviltwin'] ? global.stats.achieve['eviltwin'].l : 0;
                            universe += global.stats.achieve['microbang'] ? global.stats.achieve['microbang'].l : 0;
                            universe += global.stats.achieve['pw_apocalypse'] ? global.stats.achieve['pw_apocalypse'].l : 0;

                            let ascended = global.stats.achieve['ascended'] ? global.stats.achieve['ascended'].l : 0;
                            let descend = global.stats.achieve['corrupted'] ? global.stats.achieve['corrupted'].l : 0;

                            if (universe > 30){ universe = 30; }
                            if (ascended > 5){ ascended = 5; }
                            if (descend > 5){ descend = 5; }
                            
                            if (universe > 0){
                                let dark = +(universe / 7.5).toFixed(2);
                                global.race.Dark.count += dark;
                                global.stats.dark += dark;
                                gift.push(`${dark} ${loc(`resource_Dark_name`)}`);
                            }
                            if (ascended > 0){
                                global.race.Harmony.count += ascended;
                                global.stats.harmony += ascended;
                                gift.push(`${ascended} ${loc(`resource_Harmony_name`)}`);
                            }
                            if (descend > 0){
                                let blood = descend * 5;
                                let art = descend;
                                global.resource.Blood_Stone.amount += blood;
                                global.stats.blood += blood;
                                global.resource.Artifact.amount += art;
                                global.stats.artifact += art;
                                gift.push(`${blood} ${loc(`resource_Blood_Stone_name`)}`);
                                gift.push(`${art} ${loc(`resource_Artifact_name`)}`);
                            }
                        }

                        messageQueue(loc('city_gift2_msg',[gift.join(", ")]),'info');
                        drawCity();
                    }
                }
                return false;
            }
        },
        food: {
            id: 'city-food',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure') : loc('city_trick');
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure') : loc('city_food');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] ? loc('city_trick_conjure_desc',[gain]) : loc('city_trick_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] ? loc('city_food_conjure_desc',[gain]) : loc('city_food_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: { primitive: 1 },
            not_trait: ['soul_eater','cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] ? 1 : 0; },
            },
            action(){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',$(this)[0].val(true),true);
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Food'].amount < global['resource']['Food'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            }
        },
        lumber: {
            id: 'city-lumber',
            title(){
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour') : loc('city_dig');
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure') : loc('city_lumber');
                }
            },
            desc(){
                let gain = $(this)[0].val(false);
                let hallowed = getHalloween();
                if (hallowed.active){
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_dig_conjour_desc',[gain]) : loc('city_dig_desc',[gain]);
                }
                else {
                    return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? loc('city_lumber_conjure_desc',[gain]) : loc('city_lumber_desc',[gain]);
                }
            },
            category: 'outskirts',
            reqs: {},
            not_trait: ['evil','cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(){
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',$(this)[0].val(true),true);
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            }
        },
        stone: {
            id: 'city-stone',
            title(){
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return global.race['sappy'] ? loc('city_amber_conjour') : loc('city_stone_conjour');
                }
                else {
                    return loc(`city_gather`,[global.resource.Stone.name]);
                }                
            },
            desc(){
                let gain = $(this)[0].val(false);
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2){
                    return loc('city_stone_conjour_desc',[gain,global.resource.Stone.name]);
                }
                else {
                    return loc(global.race['sappy'] ? 'city_amber_desc' : 'city_stone_desc',[gain,global.resource.Stone.name]);
                }                
            },
            category: 'outskirts',
            reqs: { primitive: 2 },
            not_trait: ['cataclysm'],
            no_queue(){ return true },
            cost: {
                Mana(){ return global.tech['conjuring'] && global.tech['conjuring'] >= 2 ? 1 : 0; },
            },
            action(){
                if (global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    modRes('Stone',$(this)[0].val(true),true);
                }
                return false;
            },
            val(spend){
                let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global.tech['conjuring'] && global.tech['conjuring'] >= 2 && global.resource.Mana.amount >= 1){
                    gain *= 10;
                    if (global['resource']['Stone'].amount < global['resource']['Stone'].max && spend){
                        modRes('Mana',-1,true);
                    }
                }
                return gain;
            }
        },
        slaughter: {
            id: 'city-slaughter',
            title: loc('city_evil'),
            desc(){
                if (global.race['soul_eater']){
                    return global.tech['primitive'] ? (global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc3') : loc('city_evil_desc2')) : loc('city_evil_desc1');
                }
                else {
                    return global.resource.hasOwnProperty('furs') && global.resource.Furs.display ? loc('city_evil_desc4') : loc('city_evil_desc1');
                }
            },
            category: 'outskirts',
            reqs: {},
            trait: ['evil'],
            not_trait: ['kindling_kindred','cataclysm'],
            no_queue(){ return true },
            action(){
                let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                if (global.genes['enhance']){
                    gain *= 2;
                }
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    modRes('Lumber',gain,true);
                }
                if (global.race['soul_eater'] && global.tech['primitive'] && global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',gain,true);
                }
                if (global.resource.Furs.display && global['resource']['Furs'].amount < global['resource']['Furs'].max){
                    modRes('Furs',gain,true);
                }
                return false;
            }
        },
        slave_market: {
            id: 'city-slave_market',
            title: loc('city_slave_market'),
            desc: loc('city_slave_market_desc'),
            category: 'outskirts',
            reqs: { slaves: 2 },
            trait: ['slaver'],
            not_trait: ['cataclysm'],
            cost: {
                Money(){ return 25000 },
            },
            no_queue(){ return true },
            action(){
                if (global.race['slaver'] && global.city['slave_pen']){
                    let max = global.city.slave_pen.count * 4;
                    let keyMult = keyMultiplier();
                    for (var i=0; i<keyMult; i++){
                        if (max > global.city.slave_pen.slaves){
                            if (payCosts($(this)[0].cost)){
                                global.city.slave_pen.slaves++;
                                global.resource.Slave.amount = global.city.slave_pen.slaves;
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
                return false;
            }
        },
        s_alter: {
            id: 'city-s_alter',
            title: loc('city_s_alter'),
            desc(){
                return global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? `<div>${loc('city_s_alter')}</div><div class="has-text-special">${loc('city_s_alter_desc')}</div>` : loc('city_s_alter');
            },
            category: 'outskirts',
            reqs: { mining: 1 },
            trait: ['cannibalize'],
            not_trait: ['cataclysm'],
            cost: {
                Stone(){ return global.city.hasOwnProperty('s_alter') && global.city['s_alter'].count >= 1 ? 0 : 100; }
            },
            effect(){
                let sacrifices = global.civic.d_job !== 'unemployed' ? global.civic[global.civic.d_job].workers : global.civic.free;
                let desc = `<div class="has-text-caution">${loc('city_s_alter_sacrifice',[sacrifices])}</div>`;
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.rage > 0){
                    desc = desc + `<div>${loc('city_s_alter_rage',[15,timeFormat(global.city.s_alter.rage)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.regen > 0){
                    desc = desc + `<div>${loc('city_s_alter_regen',[15,timeFormat(global.city.s_alter.regen)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mind > 0){
                    desc = desc + `<div>${loc('city_s_alter_mind',[15,timeFormat(global.city.s_alter.mind)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.mine > 0){
                    desc = desc + `<div>${loc('city_s_alter_mine',[15,timeFormat(global.city.s_alter.mine)])}</div>`;
                }
                if (global.city.hasOwnProperty('s_alter') && global.city.s_alter.harvest > 0){
                    let jobType = global.race['evil'] && !global.race['soul_eater'] ? loc('job_reclaimer') : loc('job_lumberjack');
                    desc = desc + `<div>${loc('city_s_alter_harvest',[15,timeFormat(global.city.s_alter.harvest),jobType])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.city['s_alter'].count === 0){
                        global.city['s_alter'].count++;
                    }
                    else {
                        let sacrifices = global.civic.d_job !== 'unemployed' ? global.civic[global.civic.d_job].workers : global.civic.free;
                        if (sacrifices > 0){
                            global['resource'][global.race.species].amount--;
                            if (global.civic.d_job !== 'unemployed'){
                                global.civic[global.civic.d_job].workers--;
                            }
                            else {
                                global.civic.free--;
                            }
                            global['resource'].Food.amount += Math.rand(250,1000);
                            let low = 300;
                            let high = 600;
                            if (global.tech['sacrifice']){
                                switch (global.tech['sacrifice']){
                                    case 1:
                                        low = 600;
                                        high = 1500;
                                        break;
                                    case 2:
                                        low = 1800;
                                        high = 3600;
                                        break;
                                    case 3:
                                        low = 5400;
                                        high = 16200;
                                        break;
                                }
                            }
                            switch (global.race['kindling_kindred'] ? Math.rand(0,4) : Math.rand(0,5)){
                                case 0:
                                    global.city.s_alter.rage += Math.rand(low,high);
                                    break;
                                case 1:
                                    global.city.s_alter.mind += Math.rand(low,high);
                                    break;
                                case 2:
                                    global.city.s_alter.regen += Math.rand(low,high);
                                    break;
                                case 3:
                                    global.city.s_alter.mine += Math.rand(low,high);
                                    break;
                                case 4:
                                    global.city.s_alter.harvest += Math.rand(low,high);
                                    break;
                            }
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        basic_housing: {
            id: 'city-basic_housing',
            title(){
                return basicHousingLabel();
            },
            desc: loc('city_basic_housing_desc'),
            category: 'residential',
            reqs: { housing: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){
                    if (global.city['basic_housing'] && global.city['basic_housing'].count >= 5){
                        return costMultiplier('basic_housing', offset, 20, 1.17);
                    }
                    else {
                        return 0;
                    }
                },
                Lumber(offset){ return global.race['kindling_kindred'] ? 0 : costMultiplier('basic_housing', offset, 10, 1.23); },
                Stone(offset){ return global.race['kindling_kindred'] ? costMultiplier('basic_housing', offset, 10, 1.23) : 0; }
            },
            effect(){
                return global.race['sappy'] ? `<div>${loc('plus_max_resource',[1,loc('citizen')])}</div><div>${loc('city_grove_effect',[2.5])}</div>` : loc('plus_max_resource',[1,loc('citizen')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += 1;
                    global.city['basic_housing'].count++;
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'city-cottage',
            title(){
                return housingLabel('medium');
            },
            desc: loc('city_cottage_desc'),
            category: 'residential',
            reqs: { housing: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('cottage', offset, 900, 1.15); },
                Plywood(offset){ return costMultiplier('cottage', offset, 25, 1.25); },
                Brick(offset){ return costMultiplier('cottage', offset, 20, 1.25); },
                Wrought_Iron(offset){ return costMultiplier('cottage', offset, 15, 1.25); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('cottage', offset, 5, 1.25) : 0; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 5000 : 2000) : 1000);
                    return `<div>${loc('plus_max_citizens',[2])}</div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return loc('plus_max_citizens',[2]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource'][global.race.species].max += 2;
                    global.city['cottage'].count++;
                    return true;
                }
                return false;
            }
        },
        apartment: {
            id: 'city-apartment',
            title(){
                return housingLabel('large');
            },
            desc: `<div>${loc('city_apartment_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'residential',
            reqs: { housing: 3 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('apartment', offset, 1750, 1.26) - 500; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('apartment', offset, 25, 1.22) : 0; },
                Furs(offset){ return costMultiplier('apartment', offset, 725, 1.32) - 500; },
                Copper(offset){ return costMultiplier('apartment', offset, 650, 1.32) - 500; },
                Cement(offset){ return costMultiplier('apartment', offset, 700, 1.32) - 500; },
                Steel(offset){ return costMultiplier('apartment', offset, 800, 1.32) - 500; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? 10000 : 5000) : 2000);
                    return `<div>${loc('plus_max_citizens',[5])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe.toLocaleString()}`,loc('resource_Money_name')])}</div>`;
                }
                else {
                    return `${loc('plus_max_citizens',[5])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
                }
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['apartment'].count++;
                    if (global.city.power >= $(this)[0].powered()){
                        global['resource'][global.race.species].max += 5;
                        global.city['apartment'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'city-lodge',
            title: loc('city_lodge'),
            desc(){ return global.race['detritivore'] ? loc('city_lodge_desc_alt') : loc('city_lodge_desc'); },
            category: 'residential',
            reqs: { housing: 1, currency: 1 },
            not_trait: ['cataclysm'],
            condition(){
                return ((global.race['soul_eater'] || global.race['detritivore']) && global.tech['s_lodge']) || (global.tech['hunting'] && global.tech['hunting'] >= 2) ? true : false;
            },
            cost: {
                Money(offset){ return costMultiplier('lodge', offset, 50, 1.32); },
                Lumber(offset){ return costMultiplier('lodge', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('lodge', offset, 10, 1.36); }
            },
            effect(){ return loc('plus_max_resource',[1,loc('citizen')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'].count++;
                    global['resource'][global.race.species].display = true;
                    global['resource'][global.race.species].max += 1;
                    global.settings.showCivic = true;
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'city-smokehouse',
            title: loc('city_smokehouse'),
            desc: loc('city_food_storage'),
            category: 'trade',
            reqs: { hunting: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('smokehouse', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('smokehouse', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('smokehouse', offset, 50, 1.36); }
            },
            effect(){
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return loc('plus_max_resource',[food, loc('resource_Food_name')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smokehouse'].count++;
                    global['resource']['Food'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            }
        },
        soul_well: {
            id: 'city-soul_well',
            title: loc('city_soul_well'),
            desc: loc('city_soul_well_desc'),
            category: 'trade',
            reqs: { soul_eater: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['soul_well'] && global.city['soul_well'].count >= 3){ return costMultiplier('soul_well', offset, 50, 1.32);} else { return 0; } },
                Lumber(offset){ return costMultiplier('soul_well', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('soul_well', offset, 10, 1.36); }
            },
            effect(){
                let souls = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ souls = Math.round(souls * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                let production = global.race['ghostly'] ? (2 + traits.ghostly.vars[1]) : 2;
                return `<div>${loc('city_soul_well_effect',[production])}</div><div>${loc('plus_max_resource',[souls, loc('resource_Souls_name')])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['soul_well'].count++;
                    return true;
                }
                return false;
            }
        },
        slave_pen: {
            id: 'city-slave_pen',
            title: loc('city_slave_pen'),
            desc: loc('city_slave_pen'),
            category: 'commercial',
            reqs: { slaves: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('slave_pen', offset, 250, 1.32); },
                Lumber(offset){ return costMultiplier('slave_pen', offset, 100, 1.36); },
                Stone(offset){ return costMultiplier('slave_pen', offset, 75, 1.36); },
                Copper(offset){ return costMultiplier('slave_pen', offset, 10, 1.36); }
            },
            effect(){
                let max = global.city['slave_pen'] ? global.city.slave_pen.count * 4 : 4;
                let slaves = global.city['slave_pen'] ? global.city.slave_pen.slaves : 0;
                return `<div>${loc('city_slave_pen_effect',[4])}</div><div>${loc('city_slave_pen_effect2',[slaves,max])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['slave_pen'].count++;
                    global.resource.Slave.display = true;
                    global.resource.Slave.amount = global.city.slave_pen.slaves;
                    global.resource.Slave.max = global.city.slave_pen.count * 4;
                    return true;
                }
                return false;
            }
        },
        farm: {
            id: 'city-farm',
            title: loc('city_farm'),
            desc: loc('city_farm_desc'),
            category: 'residential',
            reqs: { agriculture: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['farm'] && global.city['farm'].count >= 3){ return costMultiplier('farm', offset, 50, 1.32);} else { return 0; } },
                Lumber(offset){ return costMultiplier('farm', offset, 20, 1.36); },
                Stone(offset){ return costMultiplier('farm', offset, 10, 1.36); }
            },
            effect(){
                return global.tech['farm'] ? `<div>${loc('city_farm_effect')}</div><div>${loc('plus_max_resource',[1,loc('citizen')])}</div>` : loc('city_farm_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['farm'].count++;
                    global.civic.farmer.display = true;
                    if (global.tech['farm']){
                        global['resource'][global.race.species].display = true;
                        global['resource'][global.race.species].max += 1;
                        global.settings.showCivic = true;
                    }
                    return true;
                }
                return false;
            },
            flair(){ return global.tech.agriculture >= 7 ? loc('city_farm_flair2') : loc('city_farm_flair1'); }
        },
        compost: {
            id: 'city-compost',
            title: loc('city_compost_heap'),
            desc: loc('city_compost_heap_desc'),
            category: 'residential',
            reqs: { compost: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['compost'] && global.city['compost'].count >= 3){ return costMultiplier('compost', offset, 50, 1.32);} else { return 0; } },
                Lumber(offset){ return costMultiplier('compost', offset, 12, 1.36); },
                Stone(offset){ return costMultiplier('compost', offset, 12, 1.36); }
            },
            effect(){
                let generated = 1.2 + ((global.tech['compost'] ? global.tech['compost'] : 0) * 0.8);
                generated *= global.city.biome === 'grassland' ? 1.2 : 1;
                generated *= global.city.biome === 'volcanic' ? 0.9 : 1;
                generated *= global.city.biome === 'hellscape' ? 0.25 : 1;
                generated *= global.city.ptrait === 'trashed' ? 0.75 : 1;
                generated = +(generated).toFixed(2);
                let store = spatialReasoning(200);
                if (global.stats.achieve['blackhole']){ store = Math.round(store * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                let wood = global.race['kindling_kindred'] ? `` : `<div class="has-text-caution">${loc('city_compost_heap_effect2',[0.5,global.resource.Lumber.name])}</div>`;
                return `<div>${loc('city_compost_heap_effect',[generated])}</div><div>${loc('city_compost_heap_effect3',[store])}</div>${wood}`;
            },
            switchable(){ return true; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['compost'].count++;
                    global.city['compost'].on++;
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'city-mill',
            title(){
                return global.tech['agriculture'] >= 5 ? loc('city_mill_title2') : loc('city_mill_title1');
            },
            desc(){
                let bonus = global.tech['agriculture'] >= 5 ? 5 : 3;
                if (global.tech['agriculture'] >= 6){
                    let power = powerModifier(global.race['environmentalist'] ? 1.5 : 1);
                    return loc('city_mill_desc2',[bonus,power]);
                }
                else {
                    return loc('city_mill_desc1',[bonus]);
                }
            },
            category: 'utility',
            reqs: { agriculture: 4 },
            not_tech: ['wind_plant'],
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('mill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('mill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('mill', offset, 125, 1.33); },
            },
            powered(){ return global.race['environmentalist'] ? -1.5 : -1; },
            power_reqs: { agriculture: 6 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mill'].count++;
                    return true;
                }
                return false;
            },
            effect(){
                if (global.tech['agriculture'] >= 6){
                    return `<span class="has-text-success">${loc('city_on')}</span> ${loc('city_mill_effect1')} <span class="has-text-danger">${loc('city_off')}</span> ${loc('city_mill_effect2')}`;
                }
                else {
                    return false;
                }
            }
        },
        windmill: {
            id: 'city-windmill',
            title(){
                return loc('city_mill_title2');
            },
            desc(){
                let power = powerModifier(global.race['environmentalist'] ? 1.5 : 1);
                return loc('city_windmill_desc',[power]);
            },
            wiki: false,
            category: 'utility',
            reqs: { wind_plant: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('windmill', offset, 1000, 1.31); },
                Lumber(offset){ return costMultiplier('windmill', offset, 600, 1.33); },
                Iron(offset){ return costMultiplier('windmill', offset, 150, 1.33); },
                Cement(offset){ return costMultiplier('windmill', offset, 125, 1.33); },
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'].count++;
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'city-silo',
            title: loc('city_silo'),
            desc: loc('city_food_storage'),
            category: 'trade',
            reqs: { agriculture: 3 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('silo', offset, 85, 1.32); },
                Lumber(offset){ return costMultiplier('silo', offset, 65, 1.36) },
                Stone(offset){ return costMultiplier('silo', offset, 50, 1.36); },
                Iron(offset){ return global.city.silo && global.city.silo.count >= 4 && global.city.ptrait === 'unstable' ? costMultiplier('silo', offset, 10, 1.36) : 0; }
            },
            effect(){
                let food = spatialReasoning(500);
                if (global.stats.achieve['blackhole']){ food = Math.round(food * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return loc('plus_max_resource',[food, loc('resource_Food_name')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['silo'].count++;
                    global['resource']['Food'].max += spatialReasoning(500);
                    return true;
                }
                return false;
            }
        },
        garrison: {
            id: 'city-garrison',
            title: loc('city_garrison'),
            desc: loc('city_garrison_desc'),
            category: 'military',
            reqs: { military: 1, housing: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('garrison', offset, 240, 1.5); },
                Stone(offset){ return costMultiplier('garrison', offset, 260, 1.46); },
                Iron(offset){ return global.city.garrison.count >= 4 && global.city.ptrait === 'unstable' ? costMultiplier('garrison', offset, 50, 1.4) : 0; }
            },
            effect(){
                let bunks = global.tech['military'] >= 5 ? 3 : 2;
                if (global.race['chameleon']){
                    bunks--;
                }
                return loc('plus_max_resource',[bunks,loc('civics_garrison_soldiers')]);
            },
            switchable(){ return true; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings['showMil'] = true;
                    if (!global.civic.garrison.display){
                        global.civic.garrison.display = true;
                        vBind({el: `#garrison`},'update');
                        vBind({el: `#c_garrison`},'update');
                    }
                    let gain = global.tech['military'] >= 5 ? 3 : 2;
                    if (global.race['chameleon']){
                        gain -= global.city.garrison.count;
                    }
                    global.civic['garrison'].max += gain;
                    global.city['garrison'].count++;
                    global.city['garrison'].on++;
                    global.resource.Furs.display = true;
                    return true;
                }
                return false;
            }
        },
        hospital: {
            id: 'city-hospital',
            title: loc('city_hospital'),
            desc: loc('city_hospital_desc'),
            category: 'military',
            reqs: { medic: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('hospital', offset, 22000, 1.32); },
                Furs(offset){ return costMultiplier('hospital', offset, 4000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('hospital', offset, 500, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('hospital', offset, 10000, 1.32); },
            },
            effect(){
                let clinic = global.tech['reproduction'] && global.tech.reproduction >= 2 ? `<div>${loc('city_hospital_effect2')}</div>` : ``;
                let healing = global.tech['medic'] >= 2 ? 10 : 5;
                return `<div>${loc('city_hospital_effect',[healing])}</div>${clinic}`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['hospital'].count++;
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'city-boot_camp',
            title: loc('city_boot_camp'),
            desc: loc('city_boot_camp_desc'),
            category: 'military',
            reqs: { boot_camp: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('boot_camp', offset, 50000, 1.32); },
                Lumber(offset){ return costMultiplier('boot_camp', offset, 21500, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('boot_camp', offset, 300, 1.32) : 0; },
                Aluminium(offset){ return costMultiplier('boot_camp', offset, 12000, 1.32); },
                Brick(offset){ return costMultiplier('boot_camp', offset, 1400, 1.32); },
            },
            effect(){
                let rate = global.tech['boot_camp'] >= 2 ? 8 : 5;
                if (global.blood['lust']){
                    rate += global.blood.lust * 0.2;
                }
                return global.tech['spy'] && global.tech['spy'] >= 3 ? `<div>${loc('city_boot_camp_effect',[rate])}</div><div>${loc('city_boot_camp_effect2',[10])}</div>` : loc('city_boot_camp_effect',[rate]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['boot_camp'].count++;
                    return true;
                }
                return false;
            }
        },
        shed: {
            id: 'city-shed',
            title(){
                return global.tech['storage'] <= 2 ? loc('city_shed_title1') : (global.tech['storage'] >= 4 ? loc('city_shed_title3') : loc('city_shed_title2'));
            },
            desc(){
                let storage = global.tech['storage'] >= 3 ? (global.tech['storage'] >= 4 ? loc('city_shed_desc_size3') : loc('city_shed_desc_size2')) : loc('city_shed_desc_size1');
                return loc('city_shed_desc',[storage]);
            },
            category: 'trade',
            reqs: { storage: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('shed', offset, 75, 1.22); },
                Lumber(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 4){
                        return costMultiplier('shed', offset, 55, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Stone(offset){
                    if (global.tech['storage'] && global.tech['storage'] < 3){
                        return costMultiplier('shed', offset, 45, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Iron(offset){
                    if (global.tech['storage'] && global.tech['storage'] >= 4){
                        return costMultiplier('shed', offset, 22, 1.32);
                    }
                    else {
                        return 0;
                    }
                },
                Cement(offset){
                    if (global.tech['storage'] && global.tech['storage'] >= 3){
                        return costMultiplier('shed', offset, 18, 1.32);
                    }
                    else {
                        return 0;
                    }
                }
            },
            effect(){
                let storage = '<div class="aTable">';
                let multiplier = storageMultipler();
                if (global.resource.Lumber.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Lumber.name])}</span>`;
                }
                if (global.resource.Stone.display){
                    let val = sizeApproximation(+(spatialReasoning(300) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Stone.name])}</span>`;
                }
                if (global.resource.Crystal.display){
                    let val = sizeApproximation(+(spatialReasoning(8) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Crystal.name])}</span>`;
                }
                if (global.resource.Furs.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Furs.name])}</span>`;
                }
                if (global.resource.Copper.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Copper.name])}</span>`;
                }
                if (global.resource.Iron.display){
                    let val = sizeApproximation(+(spatialReasoning(125) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Iron.name])}</span>`;
                }
                if (global.resource.Aluminium.display){
                    let val = sizeApproximation(+(spatialReasoning(90) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Aluminium.name])}</span>`;
                }
                if (global.resource.Cement.display){
                    let val = sizeApproximation(+(spatialReasoning(100) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Cement.name])}</span>`;
                }
                if (global.resource.Coal.display){
                    let val = sizeApproximation(+(spatialReasoning(75) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Coal.name])}</span>`;
                }
                if (global.tech['storage'] >= 3 && global.resource.Steel.display){
                    let val = sizeApproximation(+(spatialReasoning(40) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Steel.name])}</span>`;
                }
                if (global.tech['storage'] >= 4 && global.resource.Titanium.display){
                    let val = sizeApproximation(+(spatialReasoning(20) * multiplier).toFixed(0),1);
                    storage = storage + `<span>${loc('plus_max_resource',[val,global.resource.Titanium.name])}</span>`;
                }
                storage = storage + '</div>';
                return storage;
            },
            wide: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    let multiplier = storageMultipler();
                    global['resource']['Lumber'].max += (spatialReasoning(300) * multiplier);
                    global['resource']['Stone'].max += (spatialReasoning(300) * multiplier);
                    global['resource']['Copper'].max += (spatialReasoning(90) * multiplier);
                    global['resource']['Iron'].max += (spatialReasoning(125) * multiplier);
                    global['resource']['Aluminium'].max += (spatialReasoning(90) * multiplier);
                    global['resource']['Furs'].max += (spatialReasoning(125) * multiplier);
                    global['resource']['Cement'].max += (spatialReasoning(100) * multiplier);
                    global['resource']['Coal'].max += (spatialReasoning(75) * multiplier);
                    if (global.tech['storage'] >= 3){
                        global['resource']['Steel'].max += (global.city['shed'].count * (spatialReasoning(40) * multiplier));
                    }
                    if (global.tech['storage'] >= 4){
                        global['resource']['Titanium'].max += (global.city['shed'].count * (spatialReasoning(20) * multiplier));
                    }
                    global.city['shed'].count++;
                    return true;
                }
                return false;
            }
        },
        storage_yard: {
            id: 'city-storage_yard',
            title: loc('city_storage_yard'),
            desc: loc('city_storage_yard_desc'),
            category: 'trade',
            reqs: { container: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('storage_yard', offset, 10, 1.36); },
                Brick(offset){ return costMultiplier('storage_yard', offset, 3, 1.35); },
                Wrought_Iron(offset){ return costMultiplier('storage_yard', offset, 5, 1.35); }
            },
            effect(){
                let cap = global.tech.container >= 3 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    return `<div>${loc('plus_max_resource',[cap,loc('resource_Crates_name')])}</div><div>${loc('city_trade_effect',[1])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[cap,loc('resource_Crates_name')]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.resource.Crates.display === false){
                        messageQueue(loc('city_storage_yard_msg'),'info');
                    }
                    global.city['storage_yard'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    if (!global.settings.showMarket) {
                        global.settings.marketTabs = 1;
                    }
                    let cap = global.tech.container >= 3 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Crates.max += cap;
                    if (!global.resource.Crates.display){
                        global.resource.Crates.display = true;
                        clearElement($('#resources'));
                        defineResources();
                    }
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'city-warehouse',
            title: loc('city_warehouse'),
            desc: loc('city_warehouse_desc'),
            category: 'trade',
            reqs: { steel_container: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('warehouse', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('warehouse', offset, 75, 1.26); },
                Sheet_Metal(offset){ return costMultiplier('warehouse', offset, 25, 1.25); }
            },
            effect(){
                let cap = global.tech.steel_container >= 2 ? 20 : 10;
                if (global.tech['world_control']){
                    cap += 10;
                }
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    cap *= 2;
                }
                return loc('plus_max_resource',[cap,loc('resource_Containers_name')]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'info');
                    }
                    global.city['warehouse'].count++;
                    global.settings.showResources = true;
                    global.settings.showStorage = true;
                    let cap = global.tech['steel_container'] >= 2 ? 20 : 10;
                    if (global.tech['world_control']){
                        cap += 10;
                    }
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        cap *= 2;
                    }
                    global.resource.Containers.max += cap;
                    if (!global.resource.Containers.display){
                        global.resource.Containers.display = true;
                        clearElement($('#resources'));
                        defineResources();
                    }
                    return true;
                }
                return false;
            }
        },
        bank: {
            id: 'city-bank',
            title: loc('city_bank'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_bank_desc',[planet]);
            },
            category: 'commercial',
            reqs: { banking: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('bank', offset, 250, 1.35); },
                Lumber(offset){ return costMultiplier('bank', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('bank', offset, 100, 1.35); },
                Iron(offset){ return global.city.bank.count >= 2 && global.city.ptrait === 'unstable' ? costMultiplier('bank', offset, 30, 1.3) : 0; }
            },
            effect(){
                let vault = bank_vault();
                vault = spatialReasoning(vault);
                vault = (+(vault).toFixed(0)).toLocaleString();

                if (global.tech['banking'] >= 2){
                    return `<div>${loc('plus_max_resource',[`\$${vault}`,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[1,loc('banker_name')])}</div>`;
                }
                else {
                    return loc('plus_max_resource',[vault,loc('resource_Money_name')]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global['resource']['Money'].max += spatialReasoning(1800);
                    global.city.bank.count++;
                    global.civic.banker.max = global.city.bank.count;
                    return true;
                }
                return false;
            }
        },
        pylon: {
            id: 'city-pylon',
            title: loc('city_pylon'),
            desc: loc('city_pylon'),
            category: 'industrial',
            reqs: { magic: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['pylon'] && global.city['pylon'].count >= 2){ return costMultiplier('pylon', offset, 10, 1.48);} else { return 0; } },
                Stone(offset){ return costMultiplier('pylon', offset, 12, 1.42); },
                Crystal(offset){ return costMultiplier('pylon', offset, 8, 1.42) - 3; }
            },
            effect(){
                let max = spatialReasoning(5);
                let mana = +(0.01 * darkEffect('magic')).toFixed(3);
                return `<div>${loc('gain',[mana,global.resource.Mana.name])}</div><div>${loc('plus_max_resource',[max,global.resource.Mana.name])}</div>`;
            },
            special(){ return global.tech['magic'] && global.tech.magic >= 3 ? true : false; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['pylon'].count++;
                    global.resource.Mana.max += spatialReasoning(5);
                    return true;
                }
                return false;
            }
        },
        graveyard: {
            id: 'city-graveyard',
            title: loc('city_graveyard'),
            desc: loc('city_graveyard_desc'),
            category: 'industrial',
            reqs: { reclaimer: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['graveyard'] && global.city['graveyard'].count >= 5){ return costMultiplier('graveyard', offset, 5, 1.85);} else { return 0; } },
                Lumber(offset){ return costMultiplier('graveyard', offset, 2, 1.95); },
                Stone(offset){ return costMultiplier('graveyard', offset, 6, 1.9); }
            },
            effect(){
                let lum = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return `<div>${loc('city_graveyard_effect',[8])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['graveyard'].count++;
                    global['resource']['Lumber'].max += spatialReasoning(100);
                    return true;
                }
                return false;
            }
        },
        lumber_yard: {
            id: 'city-lumber_yard',
            title: loc('city_lumber_yard'),
            desc: loc('city_lumber_yard_desc'),
            category: 'industrial',
            reqs: { axe: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ if (global.city['lumber_yard'] && global.city['lumber_yard'].count >= 5){ return costMultiplier('lumber_yard', offset, 5, 1.85);} else { return 0; } },
                Lumber(offset){ return costMultiplier('lumber_yard', offset, 6, 1.9); },
                Stone(offset){ return costMultiplier('lumber_yard', offset, 2, 1.95); }
            },
            effect(){
                let lum = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                return `<div>${loc('city_lumber_yard_effect',[2])}</div><div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lumber_yard'].count++;
                    global.civic.lumberjack.display = true;
                    global['resource']['Lumber'].max += spatialReasoning(100);
                    return true;
                }
                return false;
            }
        },
        sawmill: {
            id: 'city-sawmill',
            title: loc('city_sawmill'),
            desc: loc('city_sawmill_desc'),
            category: 'industrial',
            reqs: { saw: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('sawmill', offset, 3000, 1.26); },
                Iron(offset){ return costMultiplier('sawmill', offset, 400, 1.26); },
                Cement(offset){ return costMultiplier('sawmill', offset, 420, 1.26); }
            },
            effect(){
                let impact = global.tech['saw'] >= 2 ? 8 : 5;
                let lum = spatialReasoning(200);
                if (global.stats.achieve['blackhole']){ lum = Math.round(lum * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                let desc = `<div>${loc('plus_max_resource',[lum,global.resource.Lumber.name])}</div><div>${loc('city_lumber_yard_effect',[impact])}</div>`;
                if (global.tech['foundry'] && global.tech['foundry'] >= 4){
                    desc = desc + `<div>${loc('city_sawmill_effect2',[2])}</div>`;
                }
                if (global.city.powered){
                    desc = desc + `<div class="has-text-caution">${loc('city_sawmill_effect3',[4,$(this)[0].powered()])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['sawmill'].count++;
                    global['resource']['Lumber'].max += spatialReasoning(200);
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.sawmill.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        rock_quarry: {
            id: 'city-rock_quarry',
            title: loc('city_rock_quarry'),
            desc: loc('city_rock_quarry_desc'),
            category: 'industrial',
            reqs: { mining: 1 },
            not_trait: ['cataclysm','sappy'],
            cost: {
                Money(offset){ if (global.city['rock_quarry'] && global.city['rock_quarry'].count >= 2){ return costMultiplier('rock_quarry', offset, 20, 1.45);} else { return 0; } },
                Lumber(offset){ return costMultiplier('rock_quarry', offset, 50, 1.36); },
                Stone(offset){ return costMultiplier('rock_quarry', offset, 10, 1.36); }
            },
            effect(){
                let stone = spatialReasoning(100);
                if (global.stats.achieve['blackhole']){ stone = Math.round(stone * (1 + (global.stats.achieve.blackhole.l * 0.05))) };
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div><div class="has-text-caution">${loc('city_rock_quarry_effect2',[4,$(this)[0].powered()])}</div>`;
                }
                else {
                    return `<div>${loc('city_rock_quarry_effect1',[2])}</div><div>${loc('plus_max_resource',[stone,global.resource.Stone.name])}</div>`;
                }
            },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['rock_quarry'].count++;
                    global.civic.quarry_worker.display = true;
                    global['resource']['Stone'].max += 100;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['rock_quarry'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        cement_plant: {
            id: 'city-cement_plant',
            title: loc('city_cement_plant'),
            desc: loc('city_cement_plant_desc'),
            category: 'industrial',
            reqs: { cement: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('cement_plant', offset, 3000, 1.5); },
                Lumber(offset){ return costMultiplier('cement_plant', offset, 1800, 1.36); },
                Stone(offset){ return costMultiplier('cement_plant', offset, 2000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('cement_plant', offset, 275, 1.32) : 0; }
            },
            effect(){
                if (global.tech['cement'] >= 5){
                    let screws = global.tech['cement'] >= 6 ? 8 : 5;
                    return `<div>${loc('city_cement_plant_effect1',[2])}</div><div class="has-text-caution">${loc('city_cement_plant_effect2',[$(this)[0].powered(),screws])}</div>`;
                }
                else {
                    return loc('city_cement_plant_effect1',[2]);
                }
            },
            powered(){ return powerCostMod(2); },
            power_reqs: { cement: 5 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Cement.display = true;
                    global.city.cement_plant.count++;
                    global.civic.cement_worker.display = true;
                    global.civic.cement_worker.max = global.city.cement_plant.count * 2;
                    if (global.tech['cement'] && global.tech['cement'] >= 5 && global.city.power >= $(this)[0].powered()){
                        global.city['cement_plant'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'city-foundry',
            title: loc('city_foundry'),
            desc: loc('city_foundry_desc'),
            category: 'industrial',
            reqs: { foundry: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('foundry', offset, 750, 1.36); },
                Stone(offset){ return costMultiplier('foundry', offset, 100, 1.36); },
                Copper(offset){ return costMultiplier('foundry', offset, 250, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('foundry', offset, 40, 1.36) : 0; },
            },
            effect(){
                let desc = `<div>${loc('city_foundry_effect1',[1])}</div>`;
                if (global.tech['foundry'] >= 2){
                    let skill = global.tech['foundry'] >= 5 ? (global.tech['foundry'] >= 8 ? 8 : 5) : 3;
                    desc = desc + `<div>${loc('city_crafted_mats',[skill])}</div>`;
                }
                if (global.tech['foundry'] >= 6){
                    desc = desc + `<div>${loc('city_foundry_effect2',[2])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.city['foundry'].count === 0){
                        if (global.race['no_craft']) {
                            messageQueue(loc('city_foundry_msg2'),'info');
                        }
                        else {
                            messageQueue(loc('city_foundry_msg1'),'info');
                        }
                    }
                    global.city['foundry'].count++;
                    global.civic.craftsman.max++;
                    global.civic.craftsman.display = true;
                    if (!global.race['kindling_kindred']){
                        global.resource.Plywood.display = true;
                    }
                    global.resource.Brick.display = true;
                    if (global.resource.Iron.display){
                        global.resource.Wrought_Iron.display = true;
                    }
                    if (global.resource.Aluminium.display){
                        global.resource.Sheet_Metal.display = true;
                    }
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        factory: {
            id: 'city-factory',
            title: loc('city_factory'),
            desc: `<div>${loc('city_factory_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'industrial',
            reqs: { high_tech: 3 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('factory', offset, 25000, 1.32); },
                Cement(offset){ return costMultiplier('factory', offset, 1000, 1.32); },
                Steel(offset){ return costMultiplier('factory', offset, 7500, 1.32); },
                Titanium(offset){ return costMultiplier('factory', offset, 2500, 1.32); }
            },
            effect(){
                let desc = `<div>${loc('city_factory_effect')}</div><div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                if (global.tech['foundry'] >= 7){
                    desc = desc + `<div>${loc('city_crafted_mats',[5])}</div>`;
                }
                return desc;
            },
            powered(){ return powerCostMod(3); },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.factory.count++;
                    global.resource.Alloy.display = true;
                    if (global.city.power >= $(this)[0].powered()){
                        global.city.factory.on++;
                        global.city.factory.Alloy++;
                    }
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        smelter: {
            id: 'city-smelter',
            title: loc('city_smelter'),
            desc: loc('city_smelter_desc'),
            category: 'industrial',
            reqs: { smelting: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('smelter', offset, 1000, 1.32); },
                Iron(offset){ return costMultiplier('smelter', offset, 500, 1.33); }
            },
            effect(){
                var iron_yield = global.tech['smelting'] >= 3 ? (global.tech['smelting'] >= 7 ? 15 : 12) : 10;
                if (global.race['pyrophobia']){
                    iron_yield *= 0.9;
                }
                if (global.tech['smelting'] >= 2 && !global.race['steelen']){
                    return loc('city_smelter_effect2',[iron_yield]);
                }
                else {
                    return loc('city_smelter_effect1',[iron_yield]);
                }
            },
            special: true,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smelter'].count++;
                    if (global.race['kindling_kindred']){
                        if (global.race['evil']) {
                            global.city['smelter'].Wood++;
                        }
                        else {
                            global.city['smelter'].Coal++;
                        }
                    }
                    else {
                        global.city['smelter'].Wood++;
                    }
                    global.city['smelter'].Iron++;
                    global.settings.showIndustry = true;
                    defineIndustry();
                    return true;
                }
                return false;
            },
            flair: `<div>${loc('city_smelter_flair1')}<div></div>${loc('city_smelter_flair2')}</div>`
        },
        metal_refinery: {
            id: 'city-metal_refinery',
            title: loc('city_metal_refinery'),
            desc: loc('city_metal_refinery_desc'),
            category: 'industrial',
            reqs: { alumina: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('metal_refinery', offset, 2500, 1.35); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('metal_refinery', offset, 125, 1.35) : 0; },
                Steel(offset){ return costMultiplier('metal_refinery', offset, 350, 1.35); }
            },
            powered(){ return powerCostMod(2); },
            power_reqs: { alumina: 2 },
            effect() {
                let label = global.race['sappy'] ? 'city_metal_refinery_effect_alt' : 'city_metal_refinery_effect';
                if (global.tech['alumina'] >= 2){
                    return `<span>${loc(label,[6])}</span> <span class="has-text-caution">${loc('city_metal_refinery_effect2',[6,12,$(this)[0].powered()])}</span>`;
                }
                else {
                    return loc(label,[6]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['metal_refinery'].count++;
                    global.resource.Aluminium.display = true;
                    if (global.city['foundry'] && global.city.foundry.count > 0){
                        global.resource.Sheet_Metal.display = true;
                    }
                    if (global.tech['alumina'] >= 2 && global.city.power >= $(this)[0].powered()){
                        global.city['metal_refinery'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        mine: {
            id: 'city-mine',
            title: loc('city_mine'),
            desc: loc('city_mine_desc'),
            category: 'industrial',
            reqs: { mining: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mine', offset, 60, 1.6); },
                Lumber(offset){ return costMultiplier('mine', offset, 175, 1.38); }
            },
            effect() {
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_mine_effect1')}</div><div class="has-text-caution">${loc('city_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_mine_effect1');
                }
            },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mine'].count++;
                    global.resource.Copper.display = true;
                    global.civic.miner.display = true;
                    global.civic.miner.max = global.city.mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        coal_mine: {
            id: 'city-coal_mine',
            title: loc('city_coal_mine'),
            desc: loc('city_coal_mine_desc'),
            category: 'industrial',
            reqs: { mining: 4 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('coal_mine', offset, 480, 1.4); },
                Lumber(offset){ return costMultiplier('coal_mine', offset, 250, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('coal_mine', offset, 28, 1.36) : 0; },
                Wrought_Iron(offset){ return costMultiplier('coal_mine', offset, 18, 1.36); }
            },
            effect() {
                if (global.tech['mine_conveyor']){
                    return `<div>${loc('city_coal_mine_effect1')}</div><div class="has-text-caution">${loc('city_coal_mine_effect2',[$(this)[0].powered(),5])}</div>`;
                }
                else {
                    return loc('city_coal_mine_effect1');
                }
            },
            powered(){ return powerCostMod(1); },
            power_reqs: { mine_conveyor: 1 },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['coal_mine'].count++;
                    global.resource.Coal.display = true;
                    global.civic.coal_miner.display = true;
                    global.civic.coal_miner.max = global.city.coal_mine.count;
                    if (global.tech['mine_conveyor'] && global.city.power >= $(this)[0].powered()){
                        global.city['coal_mine'].on++;
                    }
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'city-oil_well',
            title: loc('city_oil_well'),
            desc: loc('city_oil_well_desc'),
            category: 'industrial',
            reqs: { oil: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_well', offset, 5000, 1.5); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_well', offset, 450, 1.5) : 0; },
                Cement(offset){ return costMultiplier('oil_well', offset, 5250, 1.5); },
                Steel(offset){ return costMultiplier('oil_well', offset, 6000, 1.5); }
            },
            effect() {
                let oil = global.tech['oil'] >= 4 ? 0.48 : 0.4;
                if (global.tech['oil'] >= 7){
                    oil *= 2;
                }
                else if (global.tech['oil'] >= 5){
                    oil *= global.tech['oil'] >= 6 ? 1.75 : 1.25;
                }
                if (global.city.geology['Oil']){
                    oil *= global.city.geology['Oil'] + 1;
                }
                oil = +oil.toFixed(2);
                let oc = spatialReasoning(500);
                return loc('city_oil_well_effect',[oil,oc]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_well'].count++;
                    global['resource']['Oil'].max += spatialReasoning(500);
                    if (global.city['oil_well'].count === 1) {
                        global.resource.Oil.display = true;
                        defineIndustry();
                    }
                    return true;
                }
                return false;
            },
            flair: 'Roxxon'
        },
        oil_depot: {
            id: 'city-oil_depot',
            title: loc('city_oil_depot'),
            desc: loc('city_oil_depot_desc'),
            category: 'trade',
            reqs: { oil: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_depot', offset, 2500, 1.46); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_depot', offset, 325, 1.36) : 0; },
                Cement(offset){ return costMultiplier('oil_depot', offset, 3750, 1.46); },
                Sheet_Metal(offset){ return costMultiplier('oil_depot', offset, 100, 1.45); }
            },
            effect() {
                let oil = spatialReasoning(1000);
                oil *= global.tech['world_control'] ? 1.5 : 1;
                let effect = `<div>${loc('plus_max_resource',[oil,global.resource.Oil.name])}.</div>`;
                if (global.resource['Helium_3'].display){
                    let val = spatialReasoning(400);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Helium_3.name])}.</div>`;
                }
                if (global.tech['uranium'] >= 2){
                    let val = spatialReasoning(250);
                    val *= global.tech['world_control'] ? 1.5 : 1;
                    effect = effect + `<div>${loc('plus_max_resource',[val,global.resource.Uranium.name])}.</div>`;
                }
                return effect;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_depot'].count++;
                    global['resource']['Oil'].max += spatialReasoning(1000) * (global.tech['world_control'] ? 1.5 : 1);
                    if (global.resource['Helium_3'].display){
                        global['resource']['Helium_3'].max += spatialReasoning(400) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    if (global.tech['uranium'] >= 2){
                        global['resource']['Uranium'].max += spatialReasoning(250) * (global.tech['world_control'] ? 1.5 : 1);
                    }
                    return true;
                }
                return false;
            }
        },
        trade: {
            id: 'city-trade',
            title: loc('city_trade'),
            desc: loc('city_trade_desc'),
            category: 'trade',
            reqs: { trade: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('trade', offset, 500, 1.36); },
                Lumber(offset){ return costMultiplier('trade', offset, 125, 1.36); },
                Stone(offset){ return costMultiplier('trade', offset, 50, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('trade', offset, 15, 1.36) : 0; },
                Furs(offset){ return costMultiplier('trade', offset, 65, 1.36); }
            },
            effect(){
                let routes = global.race['xenophobic'] || global.race['nomadic'] ? global.tech.trade : global.tech.trade + 1;
                if (global.tech['trade'] && global.tech['trade'] >= 3){
                    routes--;
                }
                return loc('city_trade_effect',[routes]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['trade'].count++;
                    let routes = global.race['xenophobic'] || global.race['nomadic'] ? global.tech.trade : global.tech.trade + 1;
                    if (global.tech['trade'] && global.tech['trade'] >= 3){
                        routes--;
                    }
                    global.city.market.mtrade += routes;
                    return true;
                }
                return false;
            }
        },
        wharf: {
            id: 'city-wharf',
            title: loc('city_wharf'),
            desc: loc('city_wharf_desc'),
            category: 'trade',
            era: 'industrialized',
            reqs: { wharf: 1 },
            not_trait: ['thalassophobia','cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('wharf', offset, 62000, 1.32); },
                Lumber(offset){ return costMultiplier('wharf', offset, 44000, 1.32); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('trade', offset, 200, 1.32) : 0; },
                Cement(offset){ return costMultiplier('wharf', offset, 3000, 1.32); },
                Oil(offset){ return costMultiplier('wharf', offset, 750, 1.32); }
            },
            effect(){
                let routes = global.race['xenophobic'] ? 1 : 2;
                let containers = global.tech['world_control'] ? 15 : 10;
                if (global.tech['particles'] && global.tech['particles'] >= 2){
                    containers *= 2;
                }
                return `<div>${loc('city_trade_effect',[routes])}</div><div>${loc('city_wharf_effect')}</div><div>${loc('plus_max_crates',[containers])}</div><div>${loc('plus_max_containers',[containers])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.resource.Containers.display === false){
                        messageQueue(loc('city_warehouse_msg'),'info');
                        global.resource.Containers.display = true;
                        clearElement($('#resources'));
                        defineResources();
                    }
                    global.city['wharf'].count++;
                    global.city.market.mtrade += 2;
                    let vol = global.tech['world_control'] ? 15 : 10
                    if (global.tech['particles'] && global.tech['particles'] >= 2){
                        vol *= 2;
                    }
                    global.resource.Crates.max += vol;
                    global.resource.Containers.max += vol;
                    return true;
                }
                return false;
            }
        },
        tourist_center: {
            id: 'city-tourist_center',
            title: loc('city_tourist_center'),
            desc: loc('city_tourist_center_desc'),
            category: 'commercial',
            reqs: { monument: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('tourist_center', offset, 100000, 1.36); },
                Stone(offset){ return costMultiplier('tourist_center', offset, 25000, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('tourist_center', offset, 1000, 1.36) : 0; },
                Furs(offset){ return costMultiplier('tourist_center', offset, 7500, 1.36); },
                Plywood(offset){ return costMultiplier('tourist_center', offset, 5000, 1.36); },
            },
            effect(){
                let xeno = global.tech['monument'] && global.tech.monument >= 3 && p_on['s_gate'] ? 3 : 1;
                let amp = (global.civic.govern.type === 'corpocracy' ? 2 : 1) * xeno;
                let cas = (global.civic.govern.type === 'corpocracy' ? 10 : 5) * xeno;
                let mon = (global.civic.govern.type === 'corpocracy' ? 4 : 2) * xeno;
                return `<div class="has-text-caution">${loc('city_tourist_center_effect1',[global.resource.Food.name])}</div><div>${loc('city_tourist_center_effect2',[amp])}</div><div>${loc('city_tourist_center_effect3',[cas])}</div><div>${loc('city_tourist_center_effect4',[mon])}</div>`;
            },
            powered(){ return powerCostMod(1); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['tourist_center'].count++;
                    global.city['tourist_center'].on++;
                    return true;
                }
                return false;
            }
        },
        amphitheatre: {
            id: 'city-amphitheatre',
            title: loc('city_amphitheatre'),
            desc: loc('city_amphitheatre_desc'),
            category: 'commercial',
            reqs: { theatre: 1 },
            not_trait: ['joyless','cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('amphitheatre', offset, 500, 1.55); },
                Lumber(offset){ return costMultiplier('amphitheatre', offset, 50, 1.75); },
                Stone(offset){ return costMultiplier('amphitheatre', offset, 200, 1.75); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('amphitheatre', offset, 18, 1.36) : 0; },
            },
            effect: `<div>${loc('city_max_entertainer',[1])}</div><div>${loc('city_max_morale')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['amphitheatre'].count++;
                    global.civic.entertainer.max++;
                    global.civic.entertainer.display = true;
                    return true;
                }
                return false;
            },
            flair: loc('city_amphitheatre_flair')
        },
        casino: {
            id: 'city-casino',
            title: loc('city_casino'),
            desc: loc('city_casino'),
            category: 'commercial',
            reqs: { gambling: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('casino', offset, 350000, 1.35); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('casino', offset, 2000, 1.35) : 0; },
                Furs(offset){ return costMultiplier('casino', offset, 60000, 1.35); },
                Plywood(offset){ return costMultiplier('casino', offset, 10000, 1.35); },
                Brick(offset){ return costMultiplier('casino', offset, 6000, 1.35); }
            },
            effect(){
                let desc = casinoEffect();
                desc = desc + `<div class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</div>`;
                return desc;
            },
            powered(){ return powerCostMod(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 2 ? 2 : 3); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.casino.count++;
                    if (!global.race['joyless']){
                        global.civic.entertainer.max++;
                        global.civic.entertainer.display = true;
                    }
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.casino.on++;
                    }
                    return true;
                }
                return false;
            },
            flair: loc('city_casino_flair')
        },
        temple: {
            id: 'city-temple',
            title: loc('city_temple'),
            desc(){
                let entity = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
                return loc('city_temple_desc',[entity]);
            },
            category: 'commercial',
            reqs: { theology: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('temple', offset, 50, 1.36); },
                Lumber(offset){ return costMultiplier('temple', offset, 25, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('temple', offset, 6, 1.36) : 0; },
                Furs(offset){ return costMultiplier('temple', offset, 15, 1.36); },
                Cement(offset){ return costMultiplier('temple', offset, 10, 1.36); }
            },
            effect(){
                let desc = templeEffect();
                if (global.genes['ancients'] && global.genes['ancients'] >= 2){
                    global.civic.priest.display = true;
                    desc = desc + `<div>${loc('city_temple_effect6')}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['temple'].count++;
                    return true;
                }
                return false;
            }
        },
        shrine: {
            id: 'city-shrine',
            title: loc('city_shrine'),
            desc(){
                return loc('city_shrine_desc');
            },
            category: 'commercial',
            reqs: { theology: 2 },
            trait: ['magnificent'],
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('shrine', offset, 75, 1.32); },
                Stone(offset){ return costMultiplier('shrine', offset, 65, 1.32); },
                Furs(offset){ return costMultiplier('shrine', offset, 10, 1.32); },
                Copper(offset){ return costMultiplier('shrine', offset, 15, 1.32); }
            },
            effect(){
                let desc = `<div class="has-text-special">${loc('city_shrine_effect')}</div>`;
                if (global.city['shrine'] && global.city.shrine.morale > 0){
                    let morale = getShrineBonus('morale');
                    desc = desc + `<div>${loc('city_shrine_morale',[+(morale.add).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.metal > 0){
                    let metal = getShrineBonus('metal');
                    desc = desc + `<div>${loc('city_shrine_metal',[+((metal.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.know > 0){
                    let know = getShrineBonus('know');
                    desc = desc + `<div>${loc('city_shrine_know',[+(know.add).toFixed(1)])}</div>`;
                    desc = desc + `<div>${loc('city_shrine_know2',[+((know.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.tax > 0){
                    let tax = getShrineBonus('tax');
                    desc = desc + `<div>${loc('city_shrine_tax',[+((tax.mult - 1) * 100).toFixed(1)])}</div>`;
                }
                return desc;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.shrine.count++;
                    if (global.city.calendar.moon > 0 && global.city.calendar.moon < 7){
                        global.city.shrine.morale++;
                    }
                    else if (global.city.calendar.moon > 7 && global.city.calendar.moon < 14){
                        global.city.shrine.metal++;
                    }
                    else if (global.city.calendar.moon > 14 && global.city.calendar.moon < 21){
                        global.city.shrine.know++;
                    }
                    else if (global.city.calendar.moon > 21){
                        global.city.shrine.tax++;
                    }
                    else {
                        switch (Math.floor(Math.seededRandom(0,4))){
                            case 0:
                                global.city.shrine.morale++;
                                break;
                            case 1:
                                global.city.shrine.metal++;
                                break;
                            case 2:
                                global.city.shrine.know++;
                                break;
                            case 3:
                                global.city.shrine.tax++;
                                break;
                        }
                    }
                    return true;
                }
                return false;
            }
        },
        university: {
            id: 'city-university',
            title: loc('city_university'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_university_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('university', offset, 900, 1.5) - 500; },
                Lumber(offset){ return costMultiplier('university', offset, 500, 1.36) - 200; },
                Stone(offset){ return costMultiplier('university', offset, 750, 1.36) - 350; },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('university', offset, 5, 1.36) : 0; },
                Iron(offset){ return global.city.university.count >= 3 && global.city.ptrait === 'unstable' ? costMultiplier('university', offset, 25, 1.36) : 0; }
            },
            effect(){
                let multiplier = 1;
                let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                if (global.tech['science'] >= 4){
                    multiplier += (global.city['library'].count * 0.02);
                }
                if (global.space['observatory'] && global.space.observatory.count > 0){
                    multiplier += (moon_on['observatory'] * 0.05);
                }
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    multiplier += (p_on['sensor_drone'] * 0.02);
                }
                if (global.race['hard_of_hearing']){
                    multiplier *= 1 - (traits.hard_of_hearing.vars[0] / 100);
                }
                if (p_on['s_gate'] && gal_on['scavenger']){
                    let uni = gal_on['scavenger'] * +(piracy('gxy_alien2') / 4).toFixed(1);
                    multiplier *= 1 + uni;
                }
                gain *= multiplier;
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.race['magnificent'] && global.city['shrine'] && global.city.shrine.count > 0){
                    let shrineBonus = getShrineBonus('know');
                    gain *= shrineBonus.mult;
                }
                gain = gain.toFixed(0);
                return `<div>${loc('city_university_effect')}</div><div>${loc('city_max_knowledge',[gain])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    let gain = global.tech['science'] && global.tech['science'] >= 8 ? 700 : 500;
                    if (global.tech['science'] >= 4){
                        gain *= 1 + (global.city['library'].count * 0.02);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    global.city.university.count++;
                    global.civic.professor.display = true;
                    global.civic.professor.max = global.city.university.count;
                    return true;
                }
                return false;
            }
        },
        library: {
            id: 'city-library',
            title: loc('city_library'),
            desc(){
                let planet = races[global.race.species].home;
                return loc('city_library_desc',[planet]);
            },
            category: 'science',
            reqs: { science: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('library', offset, 45, 1.2); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('library', offset, 2, 1.2) : 0; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('library', offset, 4, 1.2) : 0; },
                Furs(offset){ return costMultiplier('library', offset, 22, 1.2); },
                Plywood(offset){ return costMultiplier('library', offset, 20, 1.2); },
                Brick(offset){ return costMultiplier('library', offset, 15, 1.2); }
            },
            effect(){
                let gain = 125;
                if (global.race['nearsighted']){
                    gain *= 1 - (traits.nearsighted.vars[0] / 100);
                }
                if (global.tech['science'] && global.tech['science'] >= 8){
                    gain *= 1.4;
                }
                if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                    gain *= 1 + (global.city.temple.count * 0.05);
                }
                if (global.tech['science'] && global.tech['science'] >= 5){
                    gain *= 1 + (global.civic.scientist.workers * 0.12);
                }
                gain = +(gain).toFixed(1);
                return `<div>${loc('city_max_knowledge',[gain])}</div><div>${loc('city_library_effect',[global.race['autoignition'] ? traits.autoignition.vars[0] : 5])}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    let gain = 125;
                    if (global.race['nearsighted']){
                        gain *= 1 - (traits.nearsighted.vars[0] / 100);
                    }
                    if (global.tech['science'] && global.tech['science'] >= 8){
                        gain *= 1.4;
                    }
                    if (global.tech['anthropology'] && global.tech['anthropology'] >= 2){
                        gain *= 1 + (global.city.temple.count * 0.05);
                    }
                    if (global.tech['science'] && global.tech['science'] >= 5){
                        gain *= 1 + (global.civic.scientist.workers * 0.12);
                    }
                    gain = +(gain).toFixed(1);
                    global['resource']['Knowledge'].max += gain;
                    global.city.library.count++;
                    if (global.tech['science'] && global.tech['science'] >= 3){
                        global.civic.professor.impact = 0.5 + (global.city.library.count * 0.01)
                    }
                    return true;
                }
                return false;
            },
            flair: 'No bonfires please'
        },
        wardenclyffe: {
            id: 'city-wardenclyffe',
            title(){ return wardenLabel(); },
            desc: loc('city_wardenclyffe_desc'),
            category: 'science',
            reqs: { high_tech: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('wardenclyffe', offset, 5000, 1.22); },
                Knowledge(offset){ return costMultiplier('wardenclyffe', offset, 1000, 1.22); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('wardenclyffe', offset, 100, 1.22) : 0; },
                Copper(offset){ return costMultiplier('wardenclyffe', offset, 500, 1.22); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('wardenclyffe', offset, 75, 1.22) : 0; },
                Cement(offset){ return costMultiplier('wardenclyffe', offset, 350, 1.22); },
                Sheet_Metal(offset){ return costMultiplier('wardenclyffe', offset, 125, 1.2); }
            },
            effect(){
                let gain = 1000;
                if (global.city.ptrait === 'magnetic'){
                    gain += planetTraits.magnetic.vars[1];
                }
                if (global.tech['supercollider']){
                    let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                    gain *= (global.tech['supercollider'] / ratio) + 1;
                }
                if (global.space['satellite']){
                    gain *= 1 + (global.space.satellite.count * 0.04);
                }
                gain = +(gain).toFixed(1);
                let desc = `<div>${loc('city_wardenclyffe_effect1',[global.civic.scientist.name])}</div><div>${loc('city_max_knowledge',[gain])}</div>`;
                if (global.city.powered){
                    let pgain = global.tech['science'] >= 7 ? 2500 : 2000;
                    if (global.city.ptrait === 'magnetic'){
                        pgain += planetTraits.magnetic.vars[1];
                    }
                    if (global.space['satellite']){
                        pgain *= 1 + (global.space.satellite.count * 0.04);
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        pgain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    pgain = +(pgain).toFixed(1);
                    if (global.tech.science >= 15){
                        desc = desc + `<div>${loc('city_wardenclyffe_effect4',[2])}</div>`;
                    }
                    if (global.race.universe === 'magic'){
                        let mana = spatialReasoning(8);
                        desc = desc + `<div>${loc('plus_max_resource',[mana,global.resource.Mana.name])}</div>`;
                    }
                    if (global.tech['broadcast']){
                        let morale = global.tech['broadcast'];
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect3',[$(this)[0].powered(),pgain,morale])}</div>`
                    }
                    else {
                        desc = desc + `<div class="has-text-caution">${loc('city_wardenclyffe_effect2',[$(this)[0].powered(),pgain])}</div>`;
                    }
                }
                return desc;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0].cost)){
                    let gain = 1000;
                    global.city.wardenclyffe.count++;
                    global.civic.scientist.display = true;
                    global.civic.scientist.max = global.city.wardenclyffe.count;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.wardenclyffe.on++;
                        gain = global.tech['science'] >= 7 ? 2500 : 2000;
                    }
                    if (global.tech['supercollider']){
                        let ratio = global.tech['particles'] && global.tech['particles'] >= 3 ? 12.5: 25;
                        gain *= (global.tech['supercollider'] / ratio) + 1;
                    }
                    global['resource']['Knowledge'].max += gain;
                    return true;
                }
                return false;
            },
            flair(){ return global.race.universe === 'magic' ? `<div>${loc('city_wizard_tower_flair')}</div>` :  (global.race['evil'] ? `<div>${loc('city_babel_flair')}</div>` : `<div>${loc('city_wardenclyffe_flair1')}</div><div>${loc('city_wardenclyffe_flair2')}</div>`); }
        },
        biolab: {
            id: 'city-biolab',
            title: loc('city_biolab'),
            desc: `<div>${loc('city_biolab_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'science',
            reqs: { genetics: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('biolab', offset, 25000, 1.3); },
                Knowledge(offset){ return costMultiplier('biolab', offset, 5000, 1.3); },
                Copper(offset){ return costMultiplier('biolab', offset, 1250, 1.3); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('biolab', offset, 160, 1.3) : 0; },
                Alloy(offset){ return costMultiplier('biolab', offset, 350, 1.3); }
            },
            effect(){
                let gain = 3000;
                if (global.portal['sensor_drone'] && global.tech['science'] >= 14){
                    gain *= 1 + (p_on['sensor_drone'] * 0.02);
                }
                if (global.tech['science'] >= 20){
                    gain *= 3;
                }
                if (global.tech['science'] >= 21){
                    gain *= 1.45;
                }
                gain = +(gain).toFixed(0);
                return `<span>${loc('city_max_knowledge',[gain])}</span>, <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){ return powerCostMod(2); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.biolab.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.resource.Knowledge.max += 3000;
                        global.city.biolab.on++;
                    }
                    return true;
                }
                return false;
            }
        },
        coal_power: {
            id: 'city-coal_power',
            title(){
                return global.race['environmentalist'] ? loc('city_hydro_power') : loc(global.race.universe === 'magic' ? 'city_mana_engine' : 'city_coal_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_hydro_power_desc')}</div>`
                    : `<div>${loc(global.race.universe === 'magic' ? 'city_mana_engine_desc' : 'city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc(global.race.universe === 'magic' ? 'resource_Mana_name' : 'resource_Coal_name')])}</div>`;
            },
            category: 'utility',
            reqs: { high_tech: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('coal_power', offset, 10000, 1.22); },
                Crystal(offset){ return global.race.universe === 'magic' ? costMultiplier('coal_power', offset, 125, 1.22) : 0; },
                Copper(offset){ return costMultiplier('coal_power', offset, 1800, 1.22) - 1000; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('coal_power', offset, 175, 1.22) : 0; },
                Cement(offset){ return costMultiplier('coal_power', offset, 600, 1.22); },
                Steel(offset){ return costMultiplier('coal_power', offset, 2000, 1.22) - 1000; }
            },
            effect(){
                let consume = global.race.universe === 'magic' ? 0.05 : 0.35;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc(global.race.universe === 'magic' ? 'city_mana_engine_effect' : 'city_coal_power_effect',[consume])}</span>`;
            },
            powered(){
                return global.race['environmentalist']
                    ? powerModifier(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -5 : -4)
                    : powerModifier(global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 1 ? -6 : -5);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.coal_power.count++;
                    global.city.coal_power.on++;
                    global.city.power += 5;
                    return true;
                }
                return false;
            }
        },
        oil_power: {
            id: 'city-oil_power',
            title(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('city_oil_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_wind_power_desc')}</div>`
                    : `<div>${loc('city_oil_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Oil_name')])}</div>`
            },
            category: 'utility',
            reqs: { oil: 3 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('oil_power', offset, 50000, 1.22); },
                Copper(offset){ return costMultiplier('oil_power', offset, 6500, 1.22) + 1000; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('oil_power', offset, 180, 1.22) : 0; },
                Aluminium(offset){ return costMultiplier('oil_power', offset, 12000, 1.22); },
                Cement(offset){ return costMultiplier('oil_power', offset, 5600, 1.22) + 1000; }
            },
            effect(){
                let consume = 0.65;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc('city_oil_power_effect',[consume])}</span>`;
            },
            powered(){
                if (global.race['environmentalist']){
                    if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                        let base = global.city.calendar.wind === 1 ? -7 : -5;
                        return powerModifier(global.stats.achieve['dissipated'].l >= 5 ? (base - 2) : (base - 1));
                    }
                    else {
                        return powerModifier(global.city.calendar.wind === 1 ? -7 : -5);
                    }
                }
                else {
                    if (global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 3){
                        return powerModifier(global.stats.achieve['dissipated'].l >= 5 ? -8 : -7);
                    }
                    else {
                        return powerModifier(-6);
                    }
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.oil_power.count++;
                    global.city.oil_power.on++;
                    global.city.power += 6;
                    return true;
                }
                return false;
            }
        },
        fission_power: {
            id: 'city-fission_power',
            title: loc('city_fission_power'),
            desc: `<div>${loc('city_fission_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Uranium_name')])}</div>`,
            category: 'utility',
            reqs: { high_tech: 5 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('fission_power', offset, 250000, 1.36); },
                Copper(offset){ return costMultiplier('fission_power', offset, 13500, 1.36); },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('fission_power', offset, 1750, 1.36) : 0; },
                Cement(offset){ return costMultiplier('fission_power', offset, 10800, 1.36); },
                Titanium(offset){ return costMultiplier('fission_power', offset, 7500, 1.36); }
            },
            effect(){
                let consume = 0.1;
                return `<span>+${-($(this)[0].powered())}MW.</span> <span class="has-text-caution">${loc('city_fission_power_effect',[consume])}</span>`;
            },
            powered(){ return powerModifier(global.tech['uranium'] >= 4 ? -18 : -14); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.fission_power.count++;
                    global.city.fission_power.on++;
                    global.city.power += 14;
                    return true;
                }
                return false;
            }
        },
        mass_driver: {
            id: 'city-mass_driver',
            title: loc('city_mass_driver'),
            desc: `<div>${loc('city_mass_driver_desc')}</div><div class="has-text-special">${loc('requires_power')}</div>`,
            category: 'utility',
            reqs: { mass: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('mass_driver', offset, 375000, 1.32); },
                Copper(offset){ return costMultiplier('mass_driver', offset, 33000, 1.32); },
                Iron(offset){ return costMultiplier('mass_driver', offset, 42500, 1.32); },
                Iridium(offset){ return costMultiplier('mass_driver', offset, 2200, 1.32); }
            },
            effect(){
                let exo = global.tech.mass >= 2 ? `<div>${loc('city_mass_driver_effect2',[1,global.civic.scientist.name])}</div>` : '';
                return `${exo}<span>${loc('city_mass_driver_effect',[5,races[global.race.species].name])}</span> <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span>`;
            },
            powered(){
                let power = global.stats.achieve['dissipated'] && global.stats.achieve['dissipated'].l >= 4 ? 4 : 5;
                return powerCostMod(global.tech.mass >= 2 ? power - 1 : power);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city.mass_driver.count++;
                    if (global.city.powered && global.city.power >= $(this)[0].powered()){
                        global.city.mass_driver.on++;
                    }
                    return true;
                }
                return false;
            }
        }
    },
    tech: techList(),
    arpa: arpa('PhysicsTech'),
    genes: arpa('GeneTech'),
    blood: arpa('BloodTech'),
    space: spaceTech(),
    interstellar: interstellarTech(),
    galaxy: galaxyTech(),
    starDock: {
        probes: {
            id: 'starDock-probes',
            title: loc('star_dock_probe'),
            desc(){
                return `<div>${loc('star_dock_probe_desc')}</div>`;
            },
            reqs: { genesis: 4 },
            cost: {
                Money(offset){ return costMultiplier('probes', offset, 350000, 1.25,'starDock'); },
                Alloy(offset){ return costMultiplier('probes', offset, 75000, 1.25,'starDock'); },
                Polymer(offset){ return costMultiplier('probes', offset, 85000, 1.25,'starDock'); },
                Iridium(offset){ return costMultiplier('probes', offset, 12000, 1.25,'starDock'); },
                Mythril(offset){ return costMultiplier('probes', offset, 3500, 1.25,'starDock'); },
            },
            effect(){
                return `<div>${loc('star_dock_probe_effect')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.starDock.probes.count++;
                    return true;
                }
                return false;
            },
        },
        seeder: {
            id: 'starDock-seeder',
            title(){ return global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder'); },
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_exodus') : loc('star_dock_seeder');
                if (global.starDock.seeder.count >= 100){
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc2')}</div>`;
                }
                else {
                    return `<div>${label}</div><div class="has-text-special">${loc('star_dock_seeder_desc1')}</div>`;
                }
            },
            reqs: { genesis: 5 },
            no_queue(){ return global.starDock.seeder.count < 100 ? false : true },
            queue_size: 10,
            queue_complete(){ return 100 - global.starDock.seeder.count; },
            cost: {
                Money(){ return global.starDock.seeder.count < 100 ? 100000 : 0; },
                Steel(){ return global.starDock.seeder.count < 100 ? 25000 : 0; },
                Neutronium(){ return global.starDock.seeder.count < 100 ? 240 : 0; },
                Elerium(){ return global.starDock.seeder.count < 100 ? 10 : 0; },
                Nano_Tube(){ return global.starDock.seeder.count < 100 ? 12000 : 0; },
            },
            effect(){
                let remain = global.starDock.seeder.count < 100 ? loc('star_dock_seeder_status1',[100 - global.starDock.seeder.count]) : loc('star_dock_seeder_status2');
                return `<div>${global.race['cataclysm'] ? loc('star_dock_exodus_effect') : loc('star_dock_seeder_effect')}</div><div class="has-text-special">${remain}</div>`;
            },
            action(){
                if (global.starDock.seeder.count < 100 && payCosts($(this)[0].cost)){
                    global.starDock.seeder.count++;
                    if (global.starDock.seeder.count >= 100){
                        global.tech.genesis = 6;
                        clearElement($('#popspcdock-seeder'),true);
                        clearElement($('#modalBox'));
                        let c_action = actions.space.spc_gas.star_dock;
                        drawModal(c_action,'star_dock');
                    }
                    return true;
                }
                return false;
            },
        },
        prep_ship: {
            id: 'starDock-prep_ship',
            title: loc('star_dock_prep'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_desc') : loc('star_dock_prep_desc');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 6 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_prep_effect');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(){
                global.tech['genesis'] = 7;
                clearElement($('#popspcdock-seeder'),true);
                clearElement($('#modalBox'));
                let c_action = actions.space.spc_gas.star_dock;
                drawModal(c_action,'star_dock');
                return true;
            },
        },
        launch_ship: {
            id: 'starDock-launch_ship',
            title: loc('star_dock_genesis'),
            desc(){
                let label = global.race['cataclysm'] ? loc('star_dock_prep_cata_effect') : loc('star_dock_genesis_desc1');
                return `<div>${label}</div><div class="has-text-danger">${loc('star_dock_genesis_desc2')}</div>`;
            },
            reqs: { genesis: 7 },
            cost: {},
            no_queue(){ return true },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                let label = global.race['cataclysm'] ? loc('star_dock_genesis_cata_effect1') : loc('star_dock_genesis_effect1');
                return `<div>${label}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`;
            },
            action(){
                bioseed();
                return false;
            },
        },
    },
    portal: fortressTech()
};

export function templeEffect(){
    let desc;
    if (global.race.universe === 'antimatter' || global.race['no_plasmid']){
        let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 1.6 : 1;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            faith += +(global.civic.professor.workers * (global.race.universe === 'antimatter' ? 0.02 : 0.04)).toFixed(2);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.015 : (global.genes['ancients'] >= 3 ? 0.0125 : 0.01);
            faith += priest_bonus * global.civic.priest.workers;
        }
        if (global.race.universe === 'antimatter'){
            faith /= 2;
        }
        if (global.race['spiritual']){
            faith *= 1 + (traits.spiritual.vars[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            faith *= 1.12;
        }
        faith = +(faith).toFixed(3);
        desc = `<div>${loc('city_temple_effect1',[faith])}</div>`;
        if (global.race.universe === 'antimatter'){
            let temple = 6;
            if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
                let priest = global.genes['ancients'] >= 5 ? 0.12 : (global.genes['ancients'] >= 3 ? 0.1 : 0.08);
                temple += priest * global.civic.priest.workers;
            }
            desc += `<div>${loc('city_temple_effect5',[temple.toFixed(2)])}</div>`;
        }
    }
    else {
        let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.15 : (global.genes['ancients'] >= 3 ? 0.125 : 0.1);
            plasmid += priest_bonus * global.civic.priest.workers;
        }
        if (global.race['spiritual']){
            plasmid *= 1 + (traits.spiritual.vars[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            plasmid *= 1.12;
        }
        plasmid = +(plasmid).toFixed(3);
        desc = `<div>${loc('city_temple_effect2',[plasmid])}</div>`;
    }
    if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 3){
        desc = desc + `<div>${loc('city_temple_effect3')}</div>`;
    }
    if (global.tech['anthropology'] && global.tech['anthropology'] >= 4){
        desc = desc + `<div>${loc('city_temple_effect4')}</div>`;
    }
    return desc;
}

export function casinoEffect(){
    let money = spatialReasoning(global.tech['gambling'] >= 3 ? 60000 : 40000);
    if (global.tech['gambling'] >= 5){
        money += global.tech['gambling'] >= 6 ? 240000 : 60000;
    }
    if (global.race['gambler']){
        money *= 1 + (global.race['gambler'] * 0.04);
    }
    if (global.tech['world_control']){
        money = money * 1.25;
    }
    if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
        money *= 1 + (global.tech['stock_exchange'] * 0.05);
    }
    money = Math.round(money);
    let joy = global.race['joyless'] ? '' : `<div>${loc('city_max_entertainer',[1])}</div>`;
    let desc = `<div>${loc('plus_max_resource',[`\$${money.toLocaleString()}`,loc('resource_Money_name')])}</div>${joy}<div>${loc('city_max_morale')}</div>`;
    let cash = Math.log2(1 + global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5);
    if (global.tech['gambling'] && global.tech['gambling'] >= 2){
        cash *= global.tech.gambling >= 5 ? 2 : 1.5;
    }
    if (global.tech['stock_exchange'] && global.tech['gambling'] >= 4){
        cash *= 1 + (global.tech['stock_exchange'] * 0.01);
    }
    if (global.civic.govern.type === 'corpocracy'){
        cash *= 3;
    }
    if (global.civic.govern.type === 'socialist'){
        cash *= 0.8;
    }
    cash = +(cash).toFixed(2);
    desc = desc + `<div>${loc('tech_casino_effect2',[cash])}</div>`;
    return desc;
}

function evolveCosts(molecule,base,mult){
    if (global.evolution.hasOwnProperty(molecule)){
        return global.evolution[molecule].count * mult + base;
    }
    return base;
}

function addRaces(races){
    let add_all = false;
    if (global.race.seeded || (global.stats.achieve['mass_extinction'] && global.stats.achieve['mass_extinction'].l >= 1)){
        add_all = true;
    }
    for (let i=0; i<races.length; i++){
        if (add_all || (global.stats.achieve[`extinct_${races[i]}`] && global.stats.achieve[`extinct_${races[i]}`].l >= 1)){
            global.evolution[races[i]] = { count: 0 };
            addAction('evolution',races[i]);
        }
    }
}

function setScenario(scenario){
    Object.keys(races).forEach(function(r){
        if (r !== 'junker'){
            $(`#evo-${r}`).removeClass('is-hidden');
        }
    });
    if (global.race[scenario]){
        delete global.race[scenario];
        $(`#evo-${scenario}`).removeClass('hl');
    }
    else {
        ['junker','cataclysm'].forEach(function(s){
            delete global.race[s];
            $(`#evo-${s}`).removeClass('hl');
        });
        global.race[scenario] = 1;
        $(`#evo-${scenario}`).addClass('hl');

        if (scenario === 'junker'){
            Object.keys(races).forEach(function(r){
                if (r !== 'junker'){
                    $(`#evo-${r}`).addClass('is-hidden');
                }
            });
        }

        if (global.race.universe === 'antimatter') {
            global.race['weak_mastery'] = 1;
            if (!$(`#evo-mastery`).hasClass('hl')){
                $(`#evo-mastery`).addClass('hl');
            }
        }
        else {
            global.race['no_plasmid'] = 1;
            if (!$(`#evo-plasmid`).hasClass('hl')){
                $(`#evo-plasmid`).addClass('hl');
            }
        }

        let genes = ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[`no_${genes[i]}`] = 1;
            if (!$(`#evo-${genes[i]}`).hasClass('hl')){
                $(`#evo-${genes[i]}`).addClass('hl');
            }
        }
    }
    drawAchieve();
}

export function storageMultipler(){
    let multiplier = (global.tech['storage'] - 1) * 1.25 + 1;
    if (global.tech['storage'] >= 3){
        multiplier *= global.tech['storage'] >= 4 ? 3 : 1.5;
    }
    if (global.race['pack_rat']){
        multiplier *= 1 + (traits.pack_rat.vars[1] / 100);
    }
    if (global.tech['storage'] >= 6){
        multiplier *= 1 + (global.tech['supercollider'] / 20);
    }
    if (global.stats.achieve['blackhole']){
        multiplier *= 1 + global.stats.achieve.blackhole.l * 0.05;
    }
    multiplier *= global.tech['world_control'] ? 3 : 1;
    if (global.race['ascended']){
        multiplier *= 1.1;
    }
    if (global.blood['hoarder']){
        multiplier *= 1 + (global.blood['hoarder'] / 100);
    }
    if (global.tech['storage'] >= 7 && global.interstellar['cargo_yard']){
        multiplier *= 1 + ((global.interstellar['cargo_yard'].count * quantum_level) / 100);
    }
    return multiplier;
}

export function checkCityRequirements(action){
    if (global.race['kindling_kindred'] && action === 'lumber'){
        return false;
    }
    else if (global.race['kindling_kindred'] && action === 'stone'){
        return true;
    }
    var isMet = true;
    Object.keys(actions.city[action].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < actions.city[action].reqs[req]){
            isMet = false;
        }
    });
    return isMet;
}

export function checkTechRequirements(tech){
    let isMet = true;
    Object.keys(actions.tech[tech].reqs).forEach(function (req){
        if (!global.tech[req] || global.tech[req] < actions.tech[tech].reqs[req]){
            isMet = false;
        }
    });
    if (isMet && (!global.tech[actions.tech[tech].grant[0]] || global.tech[actions.tech[tech].grant[0]] < actions.tech[tech].grant[1])){
        return true;
    }
    return false;
}

function checkTechQualifications(c_action,type){
    if (c_action['condition'] && !c_action.condition()){
        return false;
    }
    if (c_action['not_trait']){
        for (let i=0; i<c_action.not_trait.length; i++){
            if (global.race[c_action.not_trait[i]]){
                return false;
            }
        }
    }
    if (c_action['trait']){
        for (let i=0; i<c_action.trait.length; i++){
            if (!global.race[c_action.trait[i]]){
                return false;
            }
        }
    }
    if (c_action['not_gene']){
        for (let i=0; i<c_action.not_gene.length; i++){
            if (global.genes[c_action.not_gene[i]]){
                return false;
            }
        }
    }
    if (c_action['gene']){
        for (let i=0; i<c_action.gene.length; i++){
            if (!global.genes[c_action.gene[i]]){
                return false;
            }
        }
    }
    if (c_action['not_tech']){
        for (let i=0; i<c_action.not_tech.length; i++){
            if (global.tech[c_action.not_tech[i]]){
                return false;
            }
        }
    }
    if (type === 'ancient_theology' && !global.genes['ancients']){
        return false;
    }
    return true;
}

export function checkOldTech(tech){
    let tch = actions.tech[tech].grant[0];
    if (global.tech[tch] && global.tech[tch] >= actions.tech[tech].grant[1]){
        if (tech !== 'fanaticism' && tech !== 'anthropology' && tech !== 'deify' && tech !== 'study'){
            return true;
        }
        else if (tech === 'fanaticism' && global.tech['fanaticism']){
            return true;
        }
        else if (tech === 'anthropology' && global.tech['anthropology']){
            return true;
        }
        else if (tech === 'deify' && global.tech['ancient_deify']){
            return true;
        }
        else if (tech === 'study' && global.tech['ancient_study']){
            return true;
        }
    }
    return false;
}

export function checkPowerRequirements(c_action){
    let isMet = true;
    if (c_action['power_reqs']){
        Object.keys(c_action.power_reqs).forEach(function (req){
            if (!global.tech[req] || global.tech[req] < c_action.power_reqs[req]){
                isMet = false;
            }
        });
    }
    return isMet;
}

function registerTech(action){
    let tech = actions.tech[action].grant[0];
    if (!global.tech[tech]){
        global.tech[tech] = 0;
    }
    addAction('tech',action);
}

export function gainTech(action){
    let tech = actions.tech[action].grant[0];
    global.tech[tech] = actions.tech[action].grant[1];
    drawCity();
    drawTech();
    renderSpace();
    renderFortress();
}

export function drawCity(){
    let city_buildings = {};
    Object.keys(actions.city).forEach(function (city_name) {
        removeAction(actions.city[city_name].id);

        if(!checkCityRequirements(city_name))
            return;

        let action = actions.city[city_name];
        let category = 'category' in action ? action.category : 'utility';

        if(!(category in city_buildings)) {
            city_buildings[category] = [];
        }

        if (global.settings['cLabels']){
            city_buildings[category].push(city_name);
        }
        else {
            addAction('city', city_name);
        }
    });

    let city_categories =  [
        'outskirts',
        'residential',
        'commercial',
        'science',
        'military',
        'trade',
        'industrial',
        'utility'
    ];

    city_categories.forEach(function(category){
        clearElement($(`#city-dist-${category}`),true);
        if (global.settings['cLabels']){
            if(!(category in city_buildings))
                return;

            $(`<div id="city-dist-${category}" class="city"></div>`)
                .appendTo('#city')
                .append(`<div><h3 class="name has-text-warning">${loc(`city_dist_${category}`)}</h3></div>`);

            city_buildings[category].forEach(function(city_name) {
                addAction('city', city_name);
            });
        }
    });
}

export function drawTech(){
    let techs = {};
    let old_techs = {};
    let new_techs = {};
    let tech_categories = [];
    let old_categories = [];
    let all_categories = [];

    ['primitive','civilized','discovery','industrialized','globalized','early_space','deep_space','interstellar','intergalactic'].forEach(function (era){
        new_techs[era] = [];
    });

    Object.keys(actions.tech).forEach(function (tech_name){
        removeAction(actions.tech[tech_name].id);

        let isOld = checkOldTech(tech_name);

        let action = actions.tech[tech_name];
        let category = 'category' in action ? action.category : 'research';

        if (!isOld && tech_categories.indexOf(category) === -1) {
            tech_categories.push(category);
        }
        if (isOld && old_categories.indexOf(category) === -1) {
            old_categories.push(category);
        }
        if (all_categories.indexOf(category) === -1) {
            all_categories.push(category);
        }

        if (isOld === true) {
            if (!(category in old_techs)){
                old_techs[category] = [];
            }

            old_techs[category].push(tech_name);
        }
        else {
            if (!checkTechRequirements(tech_name)){
                return;
            }
            let c_action = actions['tech'][tech_name];
            if (!checkTechQualifications(c_action,tech_name)){
                return;
            }

            if (!(category in techs)) {
                techs[category] = [];
            }

            if (!new_techs.hasOwnProperty(c_action.era)){
                new_techs[c_action.era] = [];
            }

            new_techs[c_action.era].push(tech_name);
        }
    });

    clearElement($(`#tech`));
    Object.keys(new_techs).forEach(function (era){
        if (new_techs[era].length > 0){
            $(`#tech`).append(`<div><h3 class="name has-text-warning">${loc(`tech_era_${era}`)}</h3></div>`);

            new_techs[era].sort(function(a, b){
                if(actions.tech[a].cost.Knowledge == undefined){
                    return -1;
                }
                if(actions.tech[b].cost.Knowledge == undefined){
                    return 1;
                }
                return actions.tech[a].cost.Knowledge() > actions.tech[b].cost.Knowledge() ? 1 : -1;
            });
            new_techs[era].forEach(function(tech_name){
                addAction('tech', tech_name);
            });
        }
    });

    all_categories.forEach(function(category){
        clearElement($(`#tech-dist-${category}`),true);
        clearElement($(`#tech-dist-old-${category}`),true);
    });

    old_categories.forEach(function(category){
        if(!(category in old_techs)){
            return;
        }

        $(`<div id="tech-dist-old-${category}" class="tech"></div>`)
            .appendTo('#oldTech')
            .append(`<div><h3 class="name has-text-warning">${loc(`tech_dist_${category}`)}</h3></div>`);

        let trick = trickOrTreat(4,12);
        if (trick.length > 0 && category === 'science'){
            $(`#tech-dist-old-science h3`).append(trick);
        }

        old_techs[category].forEach(function(tech_name) {
            addAction('tech', tech_name, true);
        });
    });
}

export function evalAffordable(){
    Object.keys(global.resource).forEach(function (res){
        $(`[data-${res}]`).each(function (i,v){
            if (global.resource[res].amount < $(this).attr(`data-${res}`)){
                if ($(this).hasClass('has-text-dark')){
                    $(this).removeClass('has-text-dark');
                    $(this).addClass('has-text-danger');
                }
            }
            else if ($(this).hasClass('has-text-danger')){
                $(this).removeClass('has-text-danger');
                $(this).addClass('has-text-dark');
            }
        });
    });
}

export function addAction(action,type,old){
    let c_action = actions[action][type];
    setAction(c_action,action,type,old)
}

export function setAction(c_action,action,type,old){
    if (checkTechQualifications(c_action,type) === false) {
        return;
    }
    if (c_action['powered'] && !global[action][type]['on']){
        global[action][type]['on'] = 0;
    }
    let id = c_action.id;
    removeAction(id);
    let parent = c_action['highlight'] && c_action.highlight() ? $(`<div id="${id}" class="action hl"></div>`) : $(`<div id="${id}" class="action"></div>`);
    if (!checkAffordable(c_action)){
        parent.addClass('cna');
    }
    if (!checkAffordable(c_action,true)){
        parent.addClass('cnam');
    }
    let element;
    if (old){
        element = $('<span class="oldTech is-dark"><span class="aTitle">{{ title }}</span></span>');
    }
    else {
        let cst = '';
        let data = '';
        if (c_action['cost']){
            let costs = action !== 'genes' && action !== 'blood' ? adjustCosts(c_action.cost) : c_action.cost;
            Object.keys(costs).forEach(function (res){
                let cost = costs[res]();
                if (cost > 0){
                    cst = cst + ` res-${res}`;
                    data = data + ` data-${res}="${cost}"`;
                }
            });
        }
        let clss = c_action['class'] ? ` ${c_action['class']}` : ``;
        element = $(`<a class="button is-dark${cst}${clss}"${data} v-on:click="action"><span class="aTitle">{{ title }}</span></a><a v-on:click="describe" class="is-sr-only">{{ title }} description</a>`);
    }
    parent.append(element);

    if (c_action.hasOwnProperty('special') && ((typeof c_action['special'] === 'function' && c_action.special()) || c_action['special'] === true) ){
        let special = $(`<div class="special" role="button" title="${type} options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
            <path class="gear" d="M620,305.666v-51.333l-31.5-5.25c-2.333-8.75-5.833-16.917-9.917-23.917L597.25,199.5l-36.167-36.75l-26.25,18.083
                c-7.583-4.083-15.75-7.583-23.916-9.917L505.667,140h-51.334l-5.25,31.5c-8.75,2.333-16.333,5.833-23.916,9.916L399.5,163.333
                L362.75,199.5l18.667,25.666c-4.083,7.584-7.583,15.75-9.917,24.5l-31.5,4.667v51.333l31.5,5.25
                c2.333,8.75,5.833,16.334,9.917,23.917l-18.667,26.25l36.167,36.167l26.25-18.667c7.583,4.083,15.75,7.583,24.5,9.917l5.25,30.916
                h51.333l5.25-31.5c8.167-2.333,16.333-5.833,23.917-9.916l26.25,18.666l36.166-36.166l-18.666-26.25
                c4.083-7.584,7.583-15.167,9.916-23.917L620,305.666z M480,333.666c-29.75,0-53.667-23.916-53.667-53.666s24.5-53.667,53.667-53.667
                S533.667,250.25,533.667,280S509.75,333.666,480,333.666z"/>
            </svg></div>`);
        parent.append(special);
    }
    if ((c_action['powered'] && global.tech['high_tech'] && global.tech['high_tech'] >= 2 && checkPowerRequirements(c_action)) || (c_action['switchable'] && c_action.switchable())){
        let powerOn = $(`<span role="button" :aria-label="on_label()" class="on" @click="power_on" title="ON" v-html="$options.filters.p_on(act.on,'${c_action.id}')"></span>`);
        let powerOff = $(`<span role="button" :aria-label="off_label()" class="off" @click="power_off" title="OFF" v-html="$options.filters.p_off(act.on,'${c_action.id}')"></span>`);
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
    }
    if (action === 'blood' && global[action] && global[action][c_action.grant[0]] && global[action][c_action.grant[0]] > 0 && c_action.grant[1] === '*'){
        element.append($(`<span class="count"> ${global[action][c_action.grant[0]]} </span>`));
    }
    if (action !== 'tech' && global[action] && global[action][type] && typeof(global[action][type]['repair']) !== 'undefined'){
        element.append($(`<div class="repair"><progress class="progress" :value="repair()" :max="repairMax()"></progress></div>`));
    }
    if (old){
        $('#oldTech').append(parent);
    }
    else {
        $('#'+action).append(parent);
    }
    if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count === 0){
        $(`#${id} .count`).css('display','none');
        $(`#${id} .special`).css('display','none');
        $(`#${id} .on`).css('display','none');
        $(`#${id} .off`).css('display','none');
    }

    if (c_action['emblem']){
        let emblem = c_action.emblem();
        parent.append($(emblem));
    }

    let modal = {
        template: '<div id="modalBox" class="modalBox"></div>'
    };

    vBind({
        el: '#'+id,
        data: {
            title: typeof c_action.title === 'string' ? c_action.title : c_action.title(),
            act: global[action][type]
        },
        methods: {
            action(){
                if (c_action.id === 'spcdock-launch_ship'){
                    c_action.action();
                }
                else {
                    switch (action){
                        case 'tech':
                            if (!(global.settings.qKey && keyMap.q) && c_action.action()){
                                gainTech(type);
                                if (c_action['post']){
                                    setTimeout(function(){
                                        c_action.post();
                                    }, 250);
                                }
                            }
                            else {
                                if (!(c_action['no_queue'] && c_action['no_queue']()) && global.tech['r_queue']){
                                    let max_queue = 3;
                                    if (global.stats.feat['journeyman']){
                                        max_queue += global.stats.feat['journeyman'] >= 3 ? (global.stats.feat['journeyman'] >= 5 ? 3 : 2) : 1;
                                    }
                                    if (global.genes['queue'] && global.genes['queue'] >= 2){
                                        max_queue *= 2;
                                    }
                                    if (global.r_queue.queue.length < max_queue){
                                        let queued = false;
                                        for (let tech in global.r_queue.queue){
                                            if (global.r_queue.queue[tech].id === c_action.id){
                                                queued = true;
                                                break;
                                            }
                                        }
                                        if (!queued){
                                            global.r_queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0 });
                                            resQueue();
                                        }
                                    }
                                }
                            }
                            break;
                        case 'genes':
                        case 'blood':
                            if (c_action.action()){
                                if (action === 'genes'){
                                    gainGene(type);
                                }
                                else {
                                    gainBlood(type);
                                }
                                if (c_action['post']){
                                    setTimeout(function(){
                                        c_action.post();
                                    }, 250);
                                }
                            }
                            break;
                        default:
                            {
                                let keyMult = keyMultiplier();
                                if (c_action['grant']){
                                    keyMult = 1;
                                }
                                let grant = false;
                                let add_queue = false;
                                let no_queue = action === 'evolution' || (c_action['no_queue'] && c_action['no_queue']()) ? true : false;
                                for (let i=0; i<keyMult; i++){
                                    if ((global.settings.qKey && keyMap.q) || !c_action.action()){
                                        if (!no_queue && global.tech['queue'] && keyMult === 1){
                                            let max_queue = global.tech['queue'] >= 2 ? (global.tech['queue'] >= 3 ? 8 : 5) : 3;
                                            if (global.stats.feat['journeyman'] && global.stats.feat['journeyman'] >= 2){
                                                max_queue += global.stats.feat['journeyman'] >= 4 ? 2 : 1;
                                            }
                                            if (global.genes['queue'] && global.genes['queue'] >= 2){
                                                max_queue *= 2;
                                            }
                                            let used = 0;
                                            for (let j=0; j<global.queue.queue.length; j++){
                                                used += Math.ceil(global.queue.queue[j].q / global.queue.queue[j].qs);
                                            }
                                            if (used < max_queue){
                                                let q_size = c_action['queue_size'] ? c_action['queue_size'] : 1;
                                                if (global.queue.queue.length > 0 && global.queue.queue[global.queue.queue.length-1].id === c_action.id){
                                                    global.queue.queue[global.queue.queue.length-1].q += q_size;
                                                }
                                                else {
                                                    global.queue.queue.push({ id: c_action.id, action: action, type: type, label: typeof c_action.title === 'string' ? c_action.title : c_action.title(), cna: false, time: 0, q: q_size, qs: q_size, t_max: 0 });
                                                }
                                                add_queue = true;
                                            }
                                        }
                                        break;
                                    }
                                    grant = true;
                                }
                                if (!checkAffordable(c_action)){
                                    let id = c_action.id;
                                    $(`#${id}`).addClass('cna');
                                }
                                if (c_action['grant'] && grant){
                                    let tech = c_action.grant[0];
                                    global.tech[tech] = c_action.grant[1];
                                    removeAction(c_action.id);
                                    drawCity();
                                    drawTech();
                                    renderSpace();
                                    renderFortress();
                                }
                                else if (c_action['refresh']){
                                    removeAction(c_action.id);
                                    drawCity();
                                    drawTech();
                                    renderSpace();
                                    renderFortress();
                                }
                                if (c_action['post']){
                                    setTimeout(function(){
                                        c_action.post();
                                    }, 250);
                                }
                                updateDesc(c_action,action,type);
                                if (add_queue){
                                    buildQueue();
                                }
                                break;
                            }
                    }
                }
            },
            describe(){
                srSpeak(srDesc(c_action,old));
            },
            trigModal(){
                if (c_action['sAction'] && typeof c_action['sAction'] === 'function'){
                    c_action.sAction()
                }
                else {
                    this.$buefy.modal.open({
                        parent: this,
                        component: modal
                    });

                    let checkExist = setInterval(function(){
                        if ($('#modalBox').length > 0) {
                            clearInterval(checkExist);
                            drawModal(c_action,type);
                        }
                    }, 50);
                }
            },
            on_label(){
                return `on: ${global[action][type].on}`;
            },
            off_label(){
                return `off: ${global[action][type].count - global[action][type].on}`;
            },
            power_on(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[action][type].on < global[action][type].count){
                        global[action][type].on++;
                    }
                    else {
                        break;
                    }
                }
                if (c_action['postPower']){
                    setTimeout(function(){
                        c_action.postPower(true);
                    }, 250);
                }
            },
            power_off(){
                let keyMult = keyMultiplier();
                for (let i=0; i<keyMult; i++){
                    if (global[action][type].on > 0){
                        global[action][type].on--;
                    }
                    else {
                        break;
                    }
                }
                if (c_action['postPower']){
                    setTimeout(function(){
                        c_action.postPower(false);
                    }, 250);
                }
            },
            repair(){
                return global[action][type].repair;
            },
            repairMax(){
                return c_action.repair();
            }
        },
        filters: {
            p_off(p,id){
                let value = global[action][type].count - p;
                if (id === 'city-casino' || id === 'space-spc_casino'){
                    let egg = easterEgg(5,12);
                    if (value === 0 && egg.length > 0){
                        return egg;
                    }
                }
                return value;
            },
            p_on(p,id){
                if (id === 'city-biolab'){
                    let egg = easterEgg(12,12);
                    if (p === 0 && egg.length > 0){
                        return egg;
                    }
                }
                else if (id === 'city-garrison' || id === 'space-space_barracks'){
                    let trick = trickOrTreat(7,14);
                    let num = id === 'city-garrison' ? 13 : 0;
                    if (p === num && trick.length > 0){
                        return trick;
                    }
                }
                return p;
            }
        }
    });

    popover(id,function(){ return undefined; },{
        in: function(obj){
            actionDesc(obj.popper,c_action,global[action][type],old);
        },
        out: function(){
            vBind({el: `#popTimer`},'destroy');
        },
        attach: action === 'starDock' ? 'body .modal' : '#main',
        wide: c_action['wide']
    });
}

export function setPlanet(hell){
    var biome = 'grassland';
    let max_bound = !hell && global.stats.portals >= 1 ? 7 : 6;
    switch (Math.floor(Math.seededRandom(0,max_bound))){
        case 0:
            biome = 'grassland';
            break;
        case 1:
            biome = 'oceanic';
            break;
        case 2:
            biome = 'forest';
            break;
        case 3:
            biome = 'desert';
            break;
        case 4:
            biome = 'volcanic';
            break;
        case 5:
            biome = 'tundra';
            break;
        case 6:
            biome = global.race.universe === 'evil' ? 'eden' : 'hellscape';
            break;
        default:
            biome = 'grassland';
            break;
    }

    let trait = 'none';
    switch (Math.floor(Math.seededRandom(0,16))){
        case 0:
            trait = 'toxic';
            break;
        case 1:
            trait = 'mellow';
            break;
        case 2:
            trait = 'rage';
            break;
        case 3:
            trait = 'stormy';
            break;
        case 4:
            trait = 'ozone';
            break;
        case 5:
            trait = 'magnetic';
            break;
        case 6:
            trait = 'trashed';
            break;
        case 7:
            trait = 'elliptical';
            break;
        case 8:
            trait = 'flare';
            break;
        case 9:
            trait = 'dense';
            break;
        case 10:
            trait = 'unstable';
            break;
        default:
            trait = 'none';
            break;
    }

    let geology = {};
    let max = Math.floor(Math.seededRandom(0,3));
    let top = 30;
    if (global.stats.achieve['whitehole']){
        top += global.stats.achieve['whitehole'].l * 5;
        max += global.stats.achieve['whitehole'].l;
    }
    if (biome === 'eden'){
        top += 5;
    }

    for (let i=0; i<max; i++){
        switch (Math.floor(Math.seededRandom(0,10))){
            case 0:
                geology['Copper'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 1:
                geology['Iron'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 2:
                geology['Aluminium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 3:
                geology['Coal'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 4:
                geology['Oil'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 5:
                geology['Titanium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 6:
                geology['Uranium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                break;
            case 7:
                if (global.stats.achieve['whitehole']){
                    geology['Iridium'] = ((Math.floor(Math.seededRandom(0,top)) - 10) / 100);
                }
                break;
            default:
                break;
        }
    }

    let num = Math.floor(Math.seededRandom(0,10000));
    var id = biome+num;
    id = id.charAt(0).toUpperCase() + id.slice(1);

    var orbit = 365;
    switch (biome){
        case 'hellscape':
            orbit = 666;
            break;
        case 'eden':
            orbit = 777;
            break;
        default:
            orbit = Math.floor(Math.seededRandom(200,trait === 'elliptical' ? 800 : 600));
            break;
    }

    let title = trait === 'none' ? `${biomes[biome].label} ${num}` : `${planetTraits[trait].label} ${biomes[biome].label} ${num}`;
    var parent = $(`<div id="${id}" class="action"></div>`);
    var element = $(`<a class="button is-dark" v-on:click="action"><span class="aTitle">${title}</span></a>`);
    parent.append(element);

    $('#evolution').append(parent);

    $('#'+id).on('click',function(){
        global.race['chose'] = id;
        global.city.biome = biome;
        global.city.calendar.orbit = orbit;
        global.city.geology = geology;
        global.city.ptrait = trait;
        clearElement($('#evolution'));
        $(`#pop${id}`).hide();
        if (poppers[id]){
            poppers[id].destroy();
        }
        clearElement($(`#pop${id}`),true);
        addAction('evolution','rna');
    });

    popover(id,function(obj){
        obj.popper.append($(`<div>${loc('set_planet',[title,biomes[biome].label,orbit])}</div>`));
        obj.popper.append($(`<div>${biomes[biome].desc}</div>`));
        if (trait !== 'none'){
            obj.popper.append($(`<div>${planetTraits[trait].desc}</div>`));
        }

        let good = $('<div></div>');
        let bad = $('<div></div>');
        let goodCnt = 0;
        let badCnt = 0;
        let numShow = global.stats.achieve['miners_dream'] ? global.stats.achieve['miners_dream'].l >= 4 ? global.stats.achieve['miners_dream'].l * 2 - 3 : global.stats.achieve['miners_dream'].l : 0;
        for (let key in geology){
            if (key !== 0){
                if (geology[key] > 0) {
                    goodCnt++;
                    if (goodCnt === 1) {
                        good.append($(`<div>${loc('set_planet_extra_rich')}</div>`));
                    }
                    let res_val = `<div class="has-text-advanced">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-success">+${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
                    }
                    res_val += `</div>`;
                    good.append(res_val);
                }
                else if (geology[key] < 0){
                    badCnt++;
                    if (badCnt === 1) {
                        bad.append($(`<div>${loc('set_planet_extra_poor')}</div>`));
                    }
                    let res_val = `<div class="has-text-caution">${loc(`resource_${key}_name`)}`;
                    if (numShow > 0) {
                        res_val += `: <span class="has-text-danger">${Math.round((geology[key] + 1) * 100 - 100)}%</span>`;
                        numShow--;
                    }
                    res_val += `</div>`;
                    bad.append(res_val);
                }
            }
        }
        if (badCnt > 0){
            good.append(bad);
        }
        if (goodCnt > 0 || badCnt > 0) {
            obj.popper.append(good);
        }
        return undefined;
    },{
        classes: `has-background-light has-text-dark`
    });
    return biome === 'eden' ? 'hellscape' : biome;
}

function srDesc(c_action,old){
    let desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    desc = desc + '. ';
    if (c_action.cost && !old){
        if (checkAffordable(c_action)){
            desc = desc + loc('affordable') + '. ';
        }
        else {
            desc = desc + loc('not_affordable') + '. ';
        }
        desc = desc + 'Costs: ';
        let type = c_action.id.split('-')[0];
        var costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action.cost) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                desc = desc + custom.label;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let label = '';
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                        }
                        desc = desc + `${label}. `;

                        if (!global[region][struct]){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            desc = desc + `${loc('insufficient')} ${label}. `;
                        }
                        else if (structs[region][struct].hasOwnProperty('on') && structs[region][struct].on > global[region][struct].on){
                            desc = desc + `${loc('insufficient')} ${label} enabled. `;
                        }
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    desc = desc + `${label}: ${res_cost}. `;
                    if ((res === 'AntiPlasmid' ? global.race['Plasmid'].anti : global.race[res].count) < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    desc = desc + `${label}: ${res_cost}. `;
                    if (global.portal.purifier.supply < res_cost){
                        desc = desc + `${loc('insufficient')} ${label}. `;
                    }
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                    label = label.replace("_", " ");

                    let display_cost = sizeApproximation(res_cost,1);
                    desc = desc + `${label}${display_cost}. `;
                    if (global.resource[res].amount < res_cost){
                        desc = desc + `${loc('insufficient')} ${global.resource[res].name}. `;
                    }
                }
            }
        });
    }

    if (c_action.effect){
        let effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            desc = desc + effect + '. ';
        }
    }
    if (c_action.flair){
        let flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        if (flair){
            desc = desc + flair + '.';
        }
    }

    return desc.replace("..",".");
}

export function actionDesc(parent,c_action,obj,old){
    clearElement(parent);
    var desc = typeof c_action.desc === 'string' ? c_action.desc : c_action.desc();
    parent.append($(`<div>${desc}</div>`));

    let type = c_action.id.split('-')[0];
    if (c_action['category'] && type === 'tech' && !old){
        parent.append($(`<div class="has-text-flair">${loc('tech_dist_category')}: ${loc(`tech_dist_${c_action.category}`)}</div>`));
    }

    let tc = timeCheck(c_action,false,true);
    if (c_action.cost && !old){
        let empty = true;
        var cost = $('<div></div>');

        var costs = type !== 'genes' && type !== 'blood' ? adjustCosts(c_action.cost) : c_action.cost;
        Object.keys(costs).forEach(function (res){
            if (res === 'Custom'){
                let custom = costs[res]();
                cost.append($(`<div>${custom.label}</div>`));
                empty = false;
            }
            else if (res === 'Structs'){
                let structs = costs[res]();
                Object.keys(structs).forEach(function (region){
                    Object.keys(structs[region]).forEach(function (struct){
                        let res_cost = structs[region][struct].hasOwnProperty('on') ? structs[region][struct].on : structs[region][struct].count;
                        let color = 'has-text-dark';
                        if (!global[region][struct]){
                            color = 'has-text-danger';
                        }
                        else if (structs[region][struct].count > global[region][struct].count){
                            color = 'has-text-danger';
                        }
                        else if (structs[region][struct].hasOwnProperty('on') && structs[region][struct].on > global[region][struct].on){
                            color = 'has-text-alert';
                        }

                        let label = '';
                        if (structs[region][struct].hasOwnProperty('s')){
                            let sector = structs[region][struct].s;
                            label = typeof actions[region][sector][struct].title === 'string' ? actions[region][sector][struct].title : actions[region][sector][struct].title();
                        }
                        else {
                            label = typeof actions[region][struct].title === 'string' ? actions[region][struct].title : actions[region][struct].title();
                        }
                        empty = false;
                        cost.append($(`<div class="${color}">${label}: ${res_cost}</div>`));
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                        res = 'AntiPlasmid';
                    }
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    if ((res === 'AntiPlasmid' ? global.race['Plasmid'].anti : global.race[res].count) < res_cost){
                        color = 'has-text-danger';
                    }
                    empty = false;
                    cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                }
            }
            else if (res === 'Supply'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    let label = loc(`resource_${res}_name`);
                    let color = 'has-text-dark';
                    if (global.portal.purifier.supply < res_cost){
                        color = 'has-text-danger';
                    }
                    empty = false;
                    cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}: ${res_cost}</div>`));
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'Bool'){
                let res_cost = costs[res]();
                if (res_cost > 0){
                    if (res === 'HellArmy'){
                        let color = 'has-text-dark';
                        if (global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < res_cost){
                            color = tc.r === res ? 'has-text-danger' : 'has-text-alert';
                        }
                        empty = false;
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">Fortress Troops: ${res_cost}</div>`));
                    }
                    else {
                        let label = res === 'Money' ? '$' : global.resource[res].name+': ';
                        label = label.replace("_", " ");
                        let color = 'has-text-dark';
                        if (global.resource[res].amount < res_cost){
                            color = tc.r === res ? 'has-text-danger' : 'has-text-alert';
                        }
                        let display_cost = sizeApproximation(res_cost,1);
                        empty = false;
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${display_cost}</div>`));
                    }
                }
            }
        });
        if (!empty){
            parent.append(cost);
        }
    }
    if (c_action.effect){
        var effect = typeof c_action.effect === 'string' ? c_action.effect : c_action.effect();
        if (effect){
            parent.append($(`<div>${effect}</div>`));
        }
    }
    if (c_action.flair){
        var flair = typeof c_action.flair === 'string' ? c_action.flair : c_action.flair();
        parent.append($(`<div class="flair has-text-flair">${flair}</div>`));
        parent.addClass('flair');
    }
    if (!old && c_action.id.substring(0,5) !== 'blood' && !checkAffordable(c_action) && checkAffordable(c_action,true)){
        if (typeof obj === 'string' && obj === 'notimer'){
            return;
        }
        if (obj && obj['time']){
            parent.append($(`<div id="popTimer" class="flair has-text-advanced">{{ time | timer }}</div>`));
            vBind({
                el: '#popTimer',
                data: obj,
                filters: {
                    timer(t){
                        return loc('action_ready',[t]);
                    }
                }
            });
        }
        else {
            let time = timeFormat(tc.t);
            parent.append($(`<div class="flair has-text-advanced">${loc('action_ready',[time])}</div>`));
        }
    }
}

export function removeAction(id){
    clearElement($(`#${id}`),true);
    clearElement($(`#pop${id}`),true);
}

export function updateDesc(c_action,category,action){
    var id = c_action.id;
    if (global[category] && global[category][action] && global[category][action]['count']){
        $(`#${id} .count`).html(global[category][action].count);
        if (global[category][action] && global[category][action].count > 0){
            $(`#${id} .count`).css('display','inline-block');
            $(`#${id} .special`).css('display','block');
            $(`#${id} .on`).css('display','block');
            $(`#${id} .off`).css('display','block');
        }
    }
    actionDesc($('#pop'+id),c_action,global[category][action]);
}

export function payCosts(costs){
    costs = adjustCosts(costs);
    if (checkCosts(costs)){
        Object.keys(costs).forEach(function (res){
            if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
                let cost = costs[res]();
                if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                    global.race.Plasmid.anti -= cost;
                }
                else {
                    global.race[res].count -= cost;
                }
            }
            else if (res === 'Supply'){
                let cost = costs[res]();
                global.portal.purifier.supply -= cost;
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'HellArmy' && res !== 'Structs' && res !== 'Bool' && res !== 'Custom'){
                let cost = costs[res]();
                global['resource'][res].amount -= cost;
                if (res === 'Knowledge'){
                    global.stats.know += cost;
                }
            }
        });
        return true;
    }
    return false;
}

export function checkAffordable(c_action,max){
    if (c_action.cost){
        if (max){
            return checkMaxCosts(adjustCosts(c_action.cost));
        }
        else {
            return checkCosts(adjustCosts(c_action.cost));
        }
    }
    return true;
}

function checkMaxCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            // Do Nothing
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                if (global.race.Plasmid.anti < Number(costs[res]())){
                    test = false;
                    return;
                }
            }
            else if (global.race[res].count < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (armyRating(global.civic.garrison.raid,'army') < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (typeof global.portal['fortress'] === 'undefined' || global.portal.fortress.garrison - (global.portal.fortress.patrols * global.portal.fortress.patrol_size) < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (global.portal.purifier.sup_max < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            var testCost = Number(costs[res]()) || 0;
            if (global.resource[res].max >= 0 && testCost > Number(global.resource[res].max) && Number(global.resource[res].max) !== -1){
                test = false;
                return;
            }
        }
    });
    return test;
}

export function checkCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Custom'){
            let custom = costs[res]();
            if (!custom.met){
                test = false;
                return;
            }
        }
        else if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage' || res === 'Dark' || res === 'Harmony'){
            if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                if (global.race.Plasmid.anti < Number(costs[res]())){
                    test = false;
                    return;
                }
            }
            else if (global.race[res].count < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Bool'){
            if (!costs[res]()){
                test = false;
                return;
            }
        }
        else if (res === 'Morale'){
            if (global.city.morale.current < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Army'){
            if (costs[res]() === false){
                test = false;
                return;
            }
        }
        else if (res === 'HellArmy'){
            if (costs[res]() === false){
                test = false;
                return;
            }
        }
        else if (res === 'Supply'){
            if (global.portal.purifier.supply < Number(costs[res]())){
                test = false;
                return;
            }
        }
        else {
            var testCost = Number(costs[res]()) || 0;
            let fail_max = global.resource[res].max >= 0 && testCost > global.resource[res].max ? true : false;
            if (testCost > Number(global.resource[res].amount) + global.resource[res].diff || fail_max){
                test = false;
                return;
            }
        }
    });
    return test;
}

function checkStructs(structs){
    let test = true;
    Object.keys(structs).forEach(function (region){
        if (global.hasOwnProperty(region)){
            Object.keys(structs[region]).forEach(function (struct){
                if (global[region].hasOwnProperty(struct)){
                    if (global[region][struct].count < structs[region][struct].count){
                        test = false;
                        return;
                    }
                    if (global[region][struct].hasOwnProperty('on') && global[region][struct].on < structs[region][struct].on){
                        test = false;
                        return;
                    }
                }
                else {
                    test = false;
                    return;
                }
            });
        }
        else {
            test = false;
            return;
        }
    });
    return test;
}

export function challengeGeneHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_genes')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_desc')}</div>`));
    if (global.genes['challenge'] && global.genes['challenge'] >= 2){
        challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_genes_mastery')}</div>`));
    }
}

export function challengeActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_challenge_run')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_challenge_run_desc')}</div>`));
}

export function scenarioActionHeader(){
    let challenge = $(`<div class="challenge"></div>`);
    $('#evolution').append(challenge);
    challenge.append($(`<div class="divider has-text-warning"><h2 class="has-text-danger">${loc('evo_scenario')}</h2></div>`));
    challenge.append($(`<div class="has-text-advanced">${loc('evo_scenario_desc')}</div>`));
}

function drawModal(c_action,type){
    if (type === 'red_factory' || type === 'int_factory'){
        type = 'factory';
    }

    let title = typeof c_action.title === 'string' ? c_action.title : c_action.title();
    $('#modalBox').append($(`<p id="modalBoxTitle" class="has-text-warning modalTitle">${title}</p>`));

    var body = $('<div id="specialModal" class="modalBody"></div>');
    $('#modalBox').append(body);

    switch(type){
        case 'smelter':
            smelterModal(body);
            break;
        case 'stellar_forge':
            smelterModal(body);
            break;
        case 'hell_forge':
            smelterModal(body);
            break;
        case 'geothermal':
            smelterModal(body);
            break;
        case 'factory':
            factoryModal(body);
            break;
        case 'star_dock':
            starDockModal(body);
            break;
        case 'mining_droid':
            droidModal(body);
            break;
        case 'g_factory':
            grapheneModal(body);
            break;
        case 'freighter':
            freighterModal(body);
            break;
        case 'pylon':
            pylonModal(body);
            break;
    }
}

function freighterModal(modal){
    galacticTrade(modal);
}

function starDockModal(modal){
    if (global.tech['genesis'] < 4){
        let warn = $(`<div><span class="has-text-warning">${loc('stardock_warn')}</span></div>`);
        modal.append(warn);
        return;
    }

    let dock = $(`<div id="starDock" class="actionSpace"></div>`);
    modal.append(dock);

    let c_action = actions.starDock.probes;
    setAction(c_action,'starDock','probes');

    if (global.tech['genesis'] >= 5){
        let c_action = actions.starDock.seeder;
        setAction(c_action,'starDock','seeder');
    }

    if (global.tech['genesis'] === 6){
        let c_action = actions.starDock.prep_ship;
        setAction(c_action,'starDock','prep_ship');
    }

    if (global.tech['genesis'] >= 7){
        let c_action = actions.starDock.launch_ship;
        setAction(c_action,'starDock','launch_ship');
    }
}

function smelterModal(modal){
    loadIndustry('smelter',modal);
}

function factoryModal(modal){
    loadIndustry('factory',modal);
}

function droidModal(modal){
    loadIndustry('droid',modal);
}

function grapheneModal(modal){
    loadIndustry('graphene',modal);
}

function pylonModal(modal){
    loadIndustry('pylon',modal);
}

export function evoProgress(){
    clearElement($('#evolution .evolving'),true);
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
}

export function wardenLabel(){
    if (global.race.universe === 'magic'){
        return loc('city_wizard_tower_title');
    }
    else {
        return global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe');
    }
}

function basicHousingLabel(){
    switch (global.race.species){
        case 'orc':
            return loc('city_basic_housing_orc_title');
        case 'wolven':
            return loc('city_basic_housing_wolven_title');
        case 'cacti':
            return loc('city_basic_housing_entish_title');
        case 'entish':
            return loc('city_basic_housing_entish_title');
        case 'pinguicula':
            return loc('city_basic_housing_entish_title');
        case 'arraak':
            return loc('city_basic_housing_nest_title');
        case 'pterodacti':
            return loc('city_basic_housing_nest_title');
        case 'sporgar':
            return loc('city_basic_housing_sporgar_title');
        case 'dracnid':
            return loc('city_basic_housing_title7');
        case 'balorg':
            return loc('city_basic_housing_title7');
        case 'imp':
            return loc('city_basic_housing_title8');
        case 'seraph':
            return loc('city_basic_housing_seraph_title');
        case 'unicorn':
            return loc('city_basic_housing_unicorn_title');
        case 'tuskin':
            return loc('city_basic_housing_sand_title');
        case 'kamel':
            return loc('city_basic_housing_sand_title');
        default:
            return global.city.ptrait === 'trashed' ? loc('city_basic_housing_trash_title') : loc('city_basic_housing_title');
    }
}

function mediumHousingLabel(){
    switch (global.race.species){
        case 'sporgar':
            return loc('city_cottage_title2');
        case 'balorg':
            return loc('city_cottage_title3');
        case 'imp':
            return loc('city_basic_housing_title7');
        case 'seraph':
            return loc('city_cottage_title4');
        case 'unicorn':
            return loc('city_cottage_title5');
        default:
            return loc('city_cottage_title1');
    }
}

function largeHousingLabel(){
    switch (global.race.species){
        case 'sporgar':
            return loc('city_apartment_title2');
        case 'balorg':
            return loc('city_apartment_title3');
        case 'imp':
            return loc('city_apartment_title3');
        case 'seraph':
            return loc('city_apartment_title4');
        case 'unicorn':
            return loc('city_apartment_title4');
        default:
            return loc('city_apartment_title1');
    }
}

export function housingLabel(type){
    switch (type){
        case 'small':
            return basicHousingLabel();
        case 'medium':
            return mediumHousingLabel();
        case 'large':
            return largeHousingLabel();
    }
}

export function updateQueueNames(both, items){
    if (global.tech['queue'] && global.queue.display){
        let deepScan = ['space','interstellar','galaxy','portal'];
        for (let i=0; i<global.queue.queue.length; i++){
            let currItem = global.queue.queue[i];
            if (!items || items.indexOf(currItem.id) > -1){
                if (deepScan.includes(currItem.action)){
                    let scan = true; Object.keys(actions[currItem.action]).forEach(function (region){
                        if (actions[currItem.action][region][currItem.type] && scan){
                            global.queue.queue[i].label = 
                                typeof actions[currItem.action][region][currItem.type].title === 'string' ? 
                                actions[currItem.action][region][currItem.type].title : 
                                actions[currItem.action][region][currItem.type].title();
                            scan = false;
                        }
                    });
                }
                else {
                    global.queue.queue[i].label = 
                        typeof actions[currItem.action][currItem.type].title === 'string' ? 
                        actions[currItem.action][currItem.type].title : 
                        actions[currItem.action][currItem.type].title();
                }
            }
        }
    }
    if (both && global.tech['r_queue'] && global.r_queue.display){
        for (let i=0; i<global.r_queue.queue.length; i++){
            global.r_queue.queue[i].label = 
                typeof actions.tech[global.r_queue.queue[i].type].title === 'string' ? 
                actions.tech[global.r_queue.queue[i].type].title : 
                actions.tech[global.r_queue.queue[i].type].title();
        }
    }
}

function sentience(){
    if (global.resource.hasOwnProperty('RNA')){
        global.resource.RNA.display = false;
    }
    if (global.resource.hasOwnProperty('DNA')){
        global.resource.DNA.display = false;
    }

    if (global.race.species !== 'junker'){
        delete global.race['junker'];
    }
    else {
        setJType();
    }

    var evolve_actions = ['rna','dna','membrane','organelles','nucleus','eukaryotic_cell','mitochondria'];
    for (var i = 0; i < evolve_actions.length; i++) {
        if (global.race[evolve_actions[i]]){
            clearElement($('#'+actions.evolution[evolve_actions[i]].id),true);
            clearElement($('#pop'+actions.evolution[evolve_actions[i]].id),true);
        }
    }

    Object.keys(genus_traits[races[global.race.species].type]).forEach(function (trait) {
        global.race[trait] = genus_traits[races[global.race.species].type][trait];
    });
    Object.keys(races[global.race.species].traits).forEach(function (trait) {
        global.race[trait] = races[global.race.species].traits[trait];
    });

    const date = new Date();
    if (!global.settings.boring && global.race.species === 'elven' && date.getMonth() === 11 && date.getDate() >= 17){
        global.race['slaver'] = 1;
    }
    const easter = getEaster();
    if (global.race.species === 'wolven' && easter.active){
        global.race['hyper'] = 1;
        global.race['fast_growth'] = 1;
        global.race['rainbow'] = 1;
        global.race['optimistic'] = 1;
    }

    if (global.race['no_crispr']){
        let bad = ['diverse','arrogant','angry','lazy','herbivore','paranoid','greedy','puny','dumb','nearsighted','gluttony','slow','hard_of_hearing','pessimistic','solitary','pyrophobia','skittish','nyctophilia','frail','atrophy','invertebrate','pathetic','invertebrate','unorganized','slow_regen','snowy','mistrustful','fragrant'];
        for (let i=0; i<10; i++){
            let trait = bad[Math.rand(0,bad.length)];
            if ((global.race['carnivore'] && trait === 'herbivore') || (global.race['smart'] && trait === 'dumb')) {
                continue;
            }
            if (!global.race[trait]){
                global.race[trait] = 1;
                break;
            }
        }
    }

    if (global.race.universe === 'evil'){
        if (global.race['evil']){
            delete global.race['evil'];
        }
        else if (races[global.race.species].type !== 'angelic'){
            global.race['evil'] = 1;
        }
    }

    if (global.race['unified']){
        global.tech['world_control'] = 1;
        global.tech['unify'] = 2;
    }

    clearElement($('#resources'));
    defineResources();
    if (!global.race['kindling_kindred']){
        global.resource.Lumber.display = true;
    }
    else {
        global.resource.Stone.display = true;
    }
    registerTech('club');

    global.city.calendar.day = 0;

    var city_actions = global.race['kindling_kindred'] ? ['food','stone'] : ['food','lumber','stone'];
    if (global.race['evil'] && !global.race['kindling_kindred']){
        global.city['slaughter'] = 1;
        city_actions = ['slaughter'];
    }
    for (var i = 0; i < city_actions.length; i++) {
        if (global.city[city_actions[i]]){
            addAction('city',city_actions[i]);
        }
    }

    if (global.race.species === 'custom'){
        global.race['untapped'] = calcGenomeScore({
            name: global.custom.race0.name,
            desc: global.custom.race0.desc,
            entity: global.custom.race0.entity,
            home: global.custom.race0.home,
            red: global.custom.race0.red,
            hell: global.custom.race0.hell,
            gas: global.custom.race0.gas,
            gas_moon: global.custom.race0.gas_moon,
            dwarf: global.custom.race0.dwarf,
            genes: 0,
            genus: global.custom.race0.genus,
            traitlist: global.custom.race0.traits
        });
    }

    global.settings.civTabs = 1;
    global.settings.showEvolve = false;
    global.settings.showCiv = true;
    global.settings.showCity = true;

    global.civic.govern.type = 'anarchy';
    global.civic.govern.rev = 0;
    global.civic.govern.fr = 0;

    if (global.genes['queue']){
        global.tech['queue'] = 1;
        global.tech['r_queue'] = 1;
        global.queue.display = true;
        global.r_queue.display = true;
    }

    Object.keys(global.genes.minor).forEach(function (trait){
        global.race[trait] = trait === 'mastery' ? global.genes.minor[trait] : global.genes.minor[trait] * 2;
    });

    if (global.genes['evolve'] && global.genes['evolve'] >= 2){
        for (let i=1; i<8; i++){
            if (global.genes['evolve'] >= i+1){
                randomMinorTrait(i);
            }
        }
    }

    let civ0name = genCivName();
    global.civic.foreign.gov0['name'] = {
        s0: civ0name.s0,
        s1: civ0name.s1
    };
    let civ1name = genCivName();
    while (civ0name.s0 === civ1name.s0 && civ0name.s1 === civ1name.s1){
        civ1name = genCivName();
    }
    global.civic.foreign.gov1['name'] = {
        s0: civ1name.s0,
        s1: civ1name.s1
    };
    let civ2name = genCivName();
    while ((civ0name.s0 === civ2name.s0 && civ0name.s1 === civ2name.s1) || (civ1name.s0 === civ2name.s0 && civ1name.s1 === civ2name.s1)){
        civ2name = genCivName();
    }
    global.civic.foreign.gov2['name'] = {
        s0: civ2name.s0,
        s1: civ2name.s1
    };

    if (global.race['cataclysm']){
        messageQueue(loc('cataclysm_sentience',[races[global.race.species].home,races[global.race.species].name]),'info');
    }
    else {
        messageQueue(loc('sentience',[races[global.race.species].type,races[global.race.species].entity,races[global.race.species].name]),'info');
    }

    if (global.stats.achieve['technophobe'] && global.stats.achieve.technophobe.l >= 1){
        global.resource.Steel.display = true;
        global.resource.Steel.amount = 25;
        if (global.stats.achieve.technophobe.l >= 3){
            global.resource.Soul_Gem.display = true;
            let gems = 1;
            for (let i=1; i<universe_affixes.length; i++){
                if (global.stats.achieve.technophobe[universe_affixes[i]] && global.stats.achieve.technophobe[universe_affixes[i]] >= 5){
                    gems++;
                }
            }
            global.resource.Soul_Gem.amount = gems;
        }
    }

    if (global.blood['aware']){
        global.settings.arpa['blood'] = true;
        global.tech['b_stone'] = 2;
    }

    if (global.race['cataclysm']){
        cataclysm();
    }

    if (global.race['slow'] || global.race['hyper'] || global.race.species === 'junker'){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
        window.location.reload();
    }

    calc_mastery(true);
    drawCity();
    defineGarrison();
    buildGarrison($('#c_garrison'),false);
    foreignGov();
}

function cataclysm(){
    if (global.race['cataclysm']){
        global.tech['unify'] = 2;
        global.tech['spy'] = 5;
        global.tech['primitive'] = 3;
        global.tech['currency'] = 6;
        global.tech['govern'] = 3;
        global.tech['spy'] = 5;
        global.tech['boot_camp'] = 1;
        global.tech['medic'] = 1;
        global.tech['military'] = 5;
        global.tech['marines'] = 1;
        global.tech['explosives'] = 3;
        global.tech['trade'] = 3;
        global.tech['wharf'] = 1;
        global.tech['banking'] = 6;
        global.tech['gambling'] = 1;
        global.tech['home_safe'] = 1;
        global.tech['housing'] = 3;
        global.tech['smelting'] = 3;
        global.tech['copper'] = 1;
        global.tech['storage'] = 5;
        global.tech['container'] = 4;
        global.tech['steel_container'] = 3;
        global.tech['mining'] = 4;
        global.tech['cement'] = 5;
        global.tech['oil'] = 7;
        global.tech['mass'] = 1;
        global.tech['alumina'] = 1;
        global.tech['titanium'] = 2;
        global.tech['polymer'] = 2;
        global.tech['uranium'] = 4;
        global.tech['foundry'] = 7;
        global.tech['factory'] = 1;
        global.tech['theatre'] = 3;
        global.tech['broadcast'] = 2;
        global.tech['mine_conveyor'] = 1;
        global.tech['science'] = 9;
        global.tech['high_tech'] = 7;
        global.tech['genetics'] = 1;
        global.tech['theology'] = 2;
        global.tech['space'] = 6;
        global.tech['solar'] = 3;
        global.tech['luna'] = 2;
        global.tech['hell'] = 1;
        global.tech['mars'] = 5;
        global.tech['gas_giant'] = 1;
        global.tech['gas_moon'] = 2;
        global.tech['asteroid'] = 3;
        global.tech['satellite'] = 1;
        global.tech['space_explore'] = 4;
        global.tech['genesis'] = 2;

        global.settings.showSpace = true;
        global.settings.space.home = true;
        global.settings.space.moon = true;
        global.settings.space.red = true;
        global.settings.space.hell = true;
        global.settings.space.sun = true;
        global.settings.space.gas = true;
        global.settings.space.gas_moon = true;
        global.settings.space.belt = true;
        global.settings.space.dwarf = true;

        global.settings.showCity = false;
        global.settings.showIndustry = true;
        global.settings.showPowerGrid = true;
        global.settings.showResearch = true;
        global.settings.showCivic = true;
        global.settings.showMil = true;
        global.settings.showResources = true;
        global.settings.showMarket = true;
        global.settings.showStorage = true;
        global.settings.civTabs = 1;
        global.settings.spaceTabs = 1;
        global.settings.showGenetics = true;

        //global.civic.garrison.display = true;
        global.resource[global.race.species].display = true;
        global.resource.Knowledge.display = true;
        global.resource.Money.display = true;
        global.resource.Food.display = true;

        global.resource.Stone.display = true;
        global.resource.Furs.display = true;
        global.resource.Copper.display = true;
        global.resource.Iron.display = true;
        global.resource.Aluminium.display = true;
        global.resource.Cement.display = true;
        global.resource.Coal.display = true;
        global.resource.Oil.display = true;
        global.resource.Uranium.display = true;
        global.resource.Steel.display = true;
        global.resource.Titanium.display = true;
        global.resource.Alloy.display = true;
        global.resource.Polymer.display = true;
        global.resource.Iridium.display = true;
        global.resource.Helium_3.display = true;
        global.resource.Brick.display = true;
        global.resource.Wrought_Iron.display = true;
        global.resource.Sheet_Metal.display = true;
        global.resource.Mythril.display = true;
        global.resource.Crates.display = true;
        global.resource.Containers.display = true;

        if (!global.race['kindling_kindred']){
            global.resource.Lumber.display = true;
            global.resource.Plywood.display = true;
            global.resource.Lumber.max = 90000;
            global.resource.Lumber.amount = 90000;
            global.resource.Plywood.amount = 50000;
        }

        global.resource[global.race.species].max = 8;
        global.resource[global.race.species].amount = 8;
        global.resource.Crates.amount = 20;
        global.resource.Containers.amount = 20;
        global.resource.Money.max = 225000;
        global.resource.Money.amount = 225000;
        global.resource.Food.max = 1000;
        global.resource.Food.amount = 1000;
        global.resource.Oil.max = 1000;
        global.resource.Oil.amount = 1000;
        global.resource.Helium_3.max = 1000;
        global.resource.Helium_3.amount = 1000;
        global.resource.Uranium.max = 1000;
        global.resource.Uranium.amount = 1000;
        global.resource.Stone.max = 90000;
        global.resource.Stone.amount = 90000;
        global.resource.Furs.max = 40000;
        global.resource.Furs.amount = 40000;
        global.resource.Copper.max = 75000;
        global.resource.Copper.amount = 75000;
        global.resource.Iron.max = 75000;
        global.resource.Iron.amount = 75000;
        global.resource.Steel.max = 75000;
        global.resource.Steel.amount = 75000;
        global.resource.Aluminium.max = 75000;
        global.resource.Aluminium.amount = 75000;
        global.resource.Cement.max = 75000;
        global.resource.Cement.amount = 75000;
        global.resource.Titanium.max = 75000;
        global.resource.Titanium.amount = 75000;
        global.resource.Coal.max = 10000;
        global.resource.Coal.amount = 10000;
        global.resource.Alloy.max = 20000;
        global.resource.Alloy.amount = 20000;
        global.resource.Polymer.max = 20000;
        global.resource.Polymer.amount = 20000;
        global.resource.Iridium.max = 1000;
        global.resource.Iridium.amount = 1000;
        global.resource.Brick.amount = 50000;
        global.resource.Wrought_Iron.amount = 50000;
        global.resource.Sheet_Metal.amount = 50000;
        global.resource.Mythril.amount = 8000;

        global.resource.Iridium.crates = 5;
        global.resource.Iridium.containers = 5;

        global.civic.taxes.display = true;

        global.civic.professor.display = true;
        global.civic.scientist.display = true;
        global.civic.cement_worker.display = true;
        global.civic.colonist.display = true;
        global.civic.space_miner.display = true;

        global.civic.colonist.max = 4;
        global.civic.colonist.workers = 4;
        global.civic.space_miner.max = 3;
        global.civic.space_miner.workers = 2;
        global.civic.professor.max = 1;
        global.civic.professor.workers = 1;
        global.civic.cement_worker.max = 1;
        global.civic.cement_worker.workers = 1;

        global.city.calendar.day++;
        global.city.market.active = true;
        global.city['power'] = 0;
        global.city['powered'] = true;

        global.city['factory'] = { count: 0, on: 0, Lux: 0, Furs: 0, Alloy: 0, Polymer: 1, Nano: 0, Stanene: 0 };
        global.city['foundry'] = { count: 0, crafting: 0, Plywood: 0, Brick: 0, Bronze: 0, Wrought_Iron: 0, Sheet_Metal: 0, Mythril: 0, Aerogel: 0, Nanoweave: 0, Scarletite: 0 };
        global.city['smelter'] = { count: 0, cap: 2, Wood: 0, Coal: 0, Oil: 2, Star: 0, StarCap: 0, Inferno: 0, Iron: 1, Steel: 1 };
        global.city['fission_power'] = { count: 0, on: 0 };
        global.city['oil_power'] = { count: 0, on: 0 };
        global.city['coal_power'] = { count: 0, on: 0 };

        global.city['mass_driver'] = { count: 0, on: 0 };
        global.city['mine'] = { count: 0, on: 0 };
        global.city['coal_mine'] = { count: 0, on: 0 };
        global.city['oil_well'] = { count: 0 };
        global.city['oil_depot'] = { count: 0 };
        global.city['garrison'] = { count: 0, on: 0 };
        global.city['basic_housing'] = { count: 0 };
        global.city['cottage'] = { count: 0 };
        global.city['apartment'] = { count: 0, on: 0 };
        global.city['amphitheatre'] = { count: 0 };
        global.city['casino'] = { count: 0, on: 0 };
        global.city['rock_quarry'] = { count: 0, on: 0 };
        global.city['metal_refinery'] = { count: 0, on: 0 };
        global.city['storage_yard'] = { count: 0 };
        global.city['warehouse'] = { count: 0 };
        global.city['trade'] = { count: 0 };
        global.city['wharf'] = { count: 0 };
        global.city['bank'] = { count: 0 };
        global.city['tourist_center'] = { count: 0, on: 0 };
        global.city['university'] = { count: 0 };
        global.city['library'] = { count: 0 };
        global.city['wardenclyffe'] = { count: 0, on: 0 };
        global.city['biolab'] = { count: 0, on: 0 };
        global.city['lumber_yard'] = { count: 0 };
        global.city['sawmill'] = { count: 0, on: 0 };
        global.city['temple'] = { count: 0 };

        global.space['satellite'] = { count: 1 };
        global.space['propellant_depot'] = { count: 1 };
        global.space['gps'] = { count: 4 };
        global.space['nav_beacon'] = { count: 1, on: 1 };
        global.space['moon_base'] = { count: 1, on: 1, support: 3, s_max: 3 };
        global.space['iridium_mine'] = { count: 1, on: 1 };
        global.space['helium_mine'] = { count: 1, on: 1 };
        global.space['observatory'] = { count: 1, on: 1 };
        global.space['spaceport'] = { count: 2, on: 2, support: 8, s_max: 10 };
        global.space['red_tower'] = { count: 1, on: 1 };
        global.space['living_quarters'] = { count: 4, on: 4 };
        global.space['vr_center'] = { count: 0, on: 0 };
        global.space['garage'] = { count: 1 };
        global.space['red_mine'] = { count: 1, on: 1 };
        global.space['fabrication'] = { count: 1, on: 1 };
        global.space['red_factory'] = { count: 1, on: 1 };
        global.space['exotic_lab'] = { count: 1, on: 1 };
        global.space['ziggurat'] = { count: 0 };
        global.space['space_barracks'] = { count: 1, on: 1 };
        global.space['biodome'] = { count: 2, on: 2 };
        global.space['laboratory'] = { count: 0, on: 0 };
        global.space['geothermal'] = { count: 2, on: 2 };
        global.space['spc_casino'] = { count: 0, on: 0 };
        global.space['swarm_plant'] = { count: 0 };
        global.space['swarm_control'] = { count: 5, support: 40, s_max: 50 };
        global.space['swarm_satellite'] = { count: 40 };
        global.space['gas_mining'] = { count: 2, on: 2 };
        global.space['gas_storage'] = { count: 1 };
        global.space['outpost'] = { count: 0, on: 0 };
        global.space['drone'] = { count: 0 };
        global.space['oil_extractor'] = { count: 2, on: 2 };
        global.space['space_station'] = { count: 1, on: 1, support: 0, s_max: 3 };
        global.space['iridium_ship'] = { count: 1, on: 1 };
        global.space['elerium_ship'] = { count: 0, on: 0 };
        global.space['elerium_prospector'] = { count: 0, on: 0 };
        global.space['iron_ship'] = { count: 1, on: 1 };
        global.space['elerium_contain'] = { count: 0, on: 0 };

        global.civic['garrison'] = {
            display: true,
            disabled: false,
            progress: 0,
            tactic: 0,
            workers: 2,
            wounded: 0,
            raid: 0,
            max: 2
        };

        drawCity();
        drawTech();
        renderSpace();
        arpa('Physics');
        loadFoundry();
    }
}

export function fanaticism(god){
    switch (races[god].fanaticism){
        case 'carnivore':
            if (global.race['herbivore']){
                randomMinorTrait(5);
                arpa('Genetics');
            }
            else {
                fanaticTrait('carnivore');
                if (global.race.species === 'entish'){
                    unlockAchieve(`madagascar_tree`);
                }
            }
            break;
        case 'smart':
            if (global.race['dumb']){
                randomMinorTrait(5);
                arpa('Genetics');
            }
            else {
                fanaticTrait('smart');
            }
            break;
        case 'infectious':
            fanaticTrait('infectious');
            if (global.race.species === 'human'){
                unlockAchieve(`infested`);
            }
            break;
        case 'none':
            randomMinorTrait(5);
            arpa('Genetics')
            break;
        default:
            fanaticTrait(races[god].fanaticism);
            break;
    }
}

function fanaticTrait(trait){
    if (global.race[trait]){
        randomMinorTrait(5);
        arpa('Genetics');
    }
    else {
        global.race[trait] = 1;
        cleanAddTrait(trait);
    }
}

export function resQueue(){
    clearResDrag();
    clearElement($('#resQueue'));

    let queue = $(`<ul class="buildList"></ul>`);
    $('#resQueue').append(queue);

    queue.append($(`<li v-for="(item, index) in queue"><a v-bind:id="setID(index)" class="queued" v-bind:class="{ 'qany': item.qa }" @click="remove(index)"><span class="has-text-warning">{{ item.label }}</span> [<span v-bind:class="{ 'has-text-danger': item.cna, 'has-text-success': !item.cna }">{{ item.time | time }}</span>]</a></li>`));

    try {
        vBind({
            el: '#resQueue .buildList',
            data: global.r_queue,
            methods: {
                remove(index){
                    cleanTechPopOver(`rq${global.r_queue.queue[index].id}`);
                    global.r_queue.queue.splice(index,1);
                    resQueue();
                },
                setID(index){
                    return `rq${global.r_queue.queue[index].id}`;
                }
            },
            filters: {
                time(time){
                    return timeFormat(time);
                }
            }
        });
        resDragQueue();
    }
    catch {
        global.r_queue.queue = [];
    }
}

function clearResDrag(){
    let el = $('#resQueue .buildList')[0];
    if (el){
        let sort = Sortable.get(el);
        if (sort){
            sort.destroy();
        }
    }
}

function resDragQueue(){
    let el = $('#resQueue .buildList')[0];
    Sortable.create(el,{
        onEnd(e){
            let order = global.r_queue.queue;
            order.splice(e.newDraggableIndex, 0, order.splice(e.oldDraggableIndex, 1)[0]);
            global.r_queue.queue = order;
            resQueue();
        }
    });
    attachQueuePopovers();
}

function attachQueuePopovers(){
    for (let i=0; i<global.r_queue.queue.length; i++){
        let id = `rq${global.r_queue.queue[i].id}`;
        cleanTechPopOver(id);

        let c_action;
        let segments = global.r_queue.queue[i].id.split("-");
        c_action = actions[segments[0]][segments[1]];

        popover(id,function(){ return undefined; },{
            in: function(obj){
                actionDesc(obj.popper,c_action,global[segments[0]][segments[1]],false);
            },
            out: function(){
                cleanTechPopOver(id);
            },
            wide: c_action['wide']
        });
    }

}

export function cleanTechPopOver(id){
    $(`#pop${id}`).hide();
    vBind({el: `#popTimer`},'destroy');
    if (poppers[id]){
        poppers[id].destroy();
    }
    clearElement($(`#pop${id}`),true);
}

export function bank_vault(){
    let vault = 1800;
    if (global.tech['vault'] >= 1){
        vault = (global.tech['vault'] + 1) * 7500;
    }
    else if (global.tech['banking'] >= 5){
        vault = 9000;
    }
    else if (global.tech['banking'] >= 3){
        vault = 4000;
    }
    if (global.race['paranoid']){
        vault *= 1 - (traits.paranoid.vars[0] / 100);
    }
    if (global.race['hoarder']){
        vault *= 1 + (traits.hoarder.vars[0] / 100);
    }
    if (global.tech['banking'] >= 7){
        vault *= 1 + (global.civic.banker.workers * 0.05);
    }
    if (global.tech['banking'] >= 8){
        vault += 25 * global.resource[global.race.species].amount;
    }
    if (global.tech['stock_exchange']){
        vault *= 1 + (global.tech['stock_exchange'] * 0.1);
    }
    if (global.tech['world_control']){
        vault *= 1.25;
    }
    if (global.blood['greed']){
        vault *= 1 + (global.blood.greed / 100);
    }
    return vault;
}

function bioseed(){
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    global.lastMsg = false;

    let god = global.race.species;
    let old_god = global.race.gods;
    let genus = races[god].type;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;

    let gains = calcPrestige('bioseed');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;

    phage += new_phage;
    global.stats.reset++;
    global.stats.bioseed++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    unlockAchieve(`seeder`);
    unlockAchieve(`biome_${biome}`);
    if (atmo !== 'none'){
        unlockAchieve(`atmo_${atmo}`);
    }
    unlockAchieve(`genus_${genus}`);

    if (atmo === 'dense' && global.race.universe === 'heavy'){
        unlockAchieve(`double_density`);
    }
    if (global.race.species === 'junker'){
        unlockFeat('organ_harvester');
    }
    if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
        unlockFeat('ill_advised');
    }
    if (typeof global.tech['world_control'] === 'undefined'){
        unlockAchieve(`cult_of_personality`);
    }

    if (global.race['cataclysm']){
        unlockAchieve('iron_will',false,5);
    }

    let good_rocks = 0;
    let bad_rocks = 0;
    Object.keys(global.city.geology).forEach(function (g){
        if (global.city.geology[g] > 0) {
            good_rocks++;
        }
        else if (global.city.geology[g] < 0){
            bad_rocks++;
        }
    });
    if (good_rocks >= 4) {
        unlockAchieve('miners_dream');
    }
    if (bad_rocks >= 3){
        unlockFeat('rocky_road');
    }
    if (global.race['steelen'] && global.race['steelen'] >= 1){
        unlockAchieve(`steelen`);
    }

    switch (global.race.universe){
        case 'micro':
            if (global.race['small'] || global.race['compact']){
                unlockAchieve(`macro`,true);
            }
            else {
                unlockAchieve(`marble`,true);
            }
            break;
        default:
            break;
    }

    checkAchievements();

    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    let probes = global.starDock.probes.count + 1;
    if (global.stats.achieve['explorer']){
        probes += global.stats.achieve['explorer'].l;
    }
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: global.race.Dark.count },
        Harmony: { count: global.race.Harmony.count },
        universe: global.race.universe,
        seeded: true,
        probes: probes,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: false,
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome,
        ptrait: atmo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export function cataclysm_end(){
    if (global.city.ptrait === 'unstable' && global.tech['quaked']){
        if (webWorker.w){
            webWorker.w.terminate();
        }
        save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));

        global.lastMsg = false;

        let plasmid = global.race.Plasmid.count;
        let antiplasmid = global.race.Plasmid.anti;
        let phage = global.race.Phage.count;

        let gains = calcPrestige('bioseed');
        let new_plasmid = gains.plasmid;
        let new_phage = gains.phage;

        global.stats.reset++;
        global.stats.cataclysm++;
        global.stats.tdays += global.stats.days;
        global.stats.days = 0;
        global.stats.tknow += global.stats.know;
        global.stats.know = 0;
        global.stats.tstarved += global.stats.starved;
        global.stats.starved = 0;
        global.stats.tdied += global.stats.died;
        global.stats.died = 0;

        phage += new_phage;
        if (global.race.universe === 'antimatter'){
            antiplasmid += new_plasmid;
            global.stats.antiplasmid += new_plasmid;
        }
        else {
            plasmid += new_plasmid;
            global.stats.plasmid += new_plasmid;
        }
        global.stats.phage += new_phage;

        unlockAchieve(`apocalypse`);
        unlockAchieve(`squished`,true);
        unlockAchieve(`extinct_${global.race.species}`);
        if (global.civic.govern.type === 'anarchy'){
            unlockAchieve(`anarchist`);
        }
        if (global.city.biome === 'hellscape' && races[global.race.species].type !== 'demonic'){
            unlockFeat('take_no_advice');
        }
        checkAchievements();
        unlockAchieve('shaken');
        if (global.race['cataclysm']){
            unlockAchieve('failed_history');
        }

        let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
        global['race'] = {
            species : global.race.species,
            gods: global.race.gods,
            old_gods: global.race.old_gods,
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: phage },
            Dark: { count: global.race.Dark.count },
            Harmony: { count: global.race.Harmony.count },
            universe: global.race.universe,
            seeded: false,
            ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        };
        if (corruption > 0){
            global.race['corruption'] = corruption;
        }
        global.city = {
            calendar: {
                day: 0,
                year: 0,
                weather: 2,
                temp: 1,
                moon: 0,
                wind: 0,
                orbit: global.city.calendar.orbit
            },
            biome: global.city.biome,
            ptrait: global.city.ptrait,
            geology: global.city.geology
        };
        global.tech = { theology: 1 };
        clearStates();
        global.new = true;
        Math.seed = Math.rand(0,10000);
        global.seed = Math.seed;

        if (global.race.universe === 'antimatter') {
            global.race['weak_mastery'] = 1;
        }
        else {
            global.race['no_plasmid'] = 1;
        }

        let genes = ['crispr','trade','craft'];
        for (let i=0; i<genes.length; i++){
            global.race[`no_${genes[i]}`] = 1;
        }

        global.race['start_cataclysm'] = 1;
        global.race['cataclysm'] = 1;
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        window.location.reload();
    }
}

export function big_bang(){
    save.setItem('evolveBak',LZString.compressToUTF16(JSON.stringify(global)));
    global.lastMsg = false;

    unlockAchieve(`extinct_${global.race.species}`);
    switch (global.race.universe){
        case 'heavy':
            unlockAchieve(`heavy`);
            break;
        case 'antimatter':
            unlockAchieve(`canceled`);
            break;
        case 'evil':
            unlockAchieve(`eviltwin`);
            break;
        case 'micro':
            unlockAchieve(`microbang`,true);
            break;
        case 'standard':
            unlockAchieve(`whitehole`);
            break;
        default:
            break;
    }

    if (global.race.universe === 'evil' && races[global.race.species].type === 'angelic'){
        unlockFeat('nephilim');
    }
    if (global.race.species === 'junker'){
        unlockFeat('the_misery');
    }
    if (global.race['decay']){
        unlockAchieve(`dissipated`);
    }
    if (global.race['steelen']){
        unlockFeat('steelem');
    }

    let god = global.race.species;
    let old_god = global.race.gods;
    let orbit = global.city.calendar.orbit;
    let biome = global.city.biome;
    let atmo = global.city.ptrait;
    let plasmid = global.race.Plasmid.count;
    let antiplasmid = global.race.Plasmid.anti;
    let phage = global.race.Phage.count;
    let dark = global.race.Dark.count;

    let gains = calcPrestige('bigbang');
    let new_plasmid = gains.plasmid;
    let new_phage = gains.phage;
    let new_dark = gains.dark;

    checkAchievements();

    phage += new_phage;
    global.stats.reset++;
    global.stats.blackhole++;
    global.stats.tdays += global.stats.days;
    global.stats.days = 0;
    global.stats.tknow += global.stats.know;
    global.stats.know = 0;
    global.stats.tstarved += global.stats.starved;
    global.stats.starved = 0;
    global.stats.tdied += global.stats.died;
    global.stats.died = 0;
    if (global.race.universe === 'antimatter'){
        antiplasmid += new_plasmid;
        global.stats.antiplasmid += new_plasmid;
    }
    else {
        plasmid += new_plasmid;
        global.stats.plasmid += new_plasmid;
    }
    global.stats.phage += new_phage;
    global.stats.dark = +(global.stats.dark + new_dark).toFixed(3);
    global.stats.universes++;

    let corruption = global.race.hasOwnProperty('corruption') && global.race.corruption > 1 ? global.race.corruption - 1 : 0;
    global['race'] = {
        species : 'protoplasm',
        gods: god,
        old_gods: old_god,
        Plasmid: { count: plasmid, anti: antiplasmid },
        Phage: { count: phage },
        Dark: { count: +(dark + new_dark).toFixed(3) },
        Harmony: { count: global.race.Harmony.count },
        universe: 'bigbang',
        seeded: true,
        bigbang: true,
        probes: 4,
        seed: Math.floor(Math.seededRandom(10000)),
        ascended: false
    };
    if (corruption > 0){
        global.race['corruption'] = corruption;
    }
    global.city = {
        calendar: {
            day: 0,
            year: 0,
            weather: 2,
            temp: 1,
            moon: 0,
            wind: 0,
            orbit: orbit
        },
        biome: biome,
        ptrait: atmo
    };
    global.tech = { theology: 1 };
    clearStates();
    global.new = true;
    Math.seed = Math.rand(0,10000);
    global.seed = Math.seed;

    save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
    window.location.reload();
}

export function start_cataclysm(){
    if (global.race['start_cataclysm']){
        delete global.race['start_cataclysm'];
        sentience();
    }
}
