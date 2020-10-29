import { global, save, poppers, webWorker, keyMultiplier, clearStates, keyMap, srSpeak, sizeApproximation, p_on, moon_on, gal_on, quantum_level } from './vars.js';
import { loc } from './locale.js';
import { timeCheck, timeFormat, vBind, popover, clearElement, costMultiplier, genCivName, powerModifier, powerCostMod, calcPrestige, adjustCosts, modRes, messageQueue, buildQueue, format_emblem, calc_mastery, calcGenomeScore, getEaster, easterEgg, trickOrTreat } from './functions.js';
import { unlockAchieve, unlockFeat, drawAchieve, checkAchievements } from './achieve.js';
import { races, traits, genus_traits, randomMinorTrait, cleanAddTrait, biomes, planetTraits } from './races.js';
import { defineResources, loadMarket, galacticTrade, spatialReasoning, resource_values, atomic_mass } from './resources.js';
import { loadFoundry } from './jobs.js';
import { loadIndustry } from './industry.js';
import { defineIndustry, defineGarrison, buildGarrison, foreignGov, checkControlling, armyRating } from './civics.js';
import { spaceTech, interstellarTech, galaxyTech, renderSpace, piracy } from './space.js';
import { renderFortress, fortressTech } from './portal.js';
import { arpa, gainGene } from './arpa.js';

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
                    modRes('RNA',global.race['rapid_mutation'] ? 2 : 1);
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
                    modRes('RNA',-2);
                    modRes('DNA',1);
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

                    if (global.city.biome === 'oceanic'){
                        global.evolution['aquatic'] = { count: 0 };
                        addAction('evolution','aquatic');
                    }
                    if (global.city.biome === 'forest'){
                        global.evolution['fey'] = { count: 0 };
                        addAction('evolution','fey');
                    }
                    if (global.city.biome === 'desert'){
                        global.evolution['sand'] = { count: 0 };
                        addAction('evolution','sand');
                    }
                    if (global.city.biome === 'volcanic'){
                        global.evolution['heat'] = { count: 0 };
                        addAction('evolution','heat');
                    }
                    if (global.city.biome === 'tundra'){
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
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
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
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
                        removeAction(actions.evolution.polar.id);
                        delete global.evolution.polar;
                    }
                    if (global.city.biome === 'hellscape'){
                        global.evolution['demonic'] = { count: 0 };
                        addAction('evolution','demonic');
                    }
                    if (global.city.biome === 'eden'){
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
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
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
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
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
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
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
                    if (global.city.biome === 'hellscape'){
                        removeAction(actions.evolution.demonic.id);
                        delete global.evolution.demonic;
                    }
                    if (global.city.biome === 'eden'){
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
                    if (global.city.biome === 'oceanic'){
                        removeAction(actions.evolution.aquatic.id);
                        delete global.evolution.aquatic;
                    }
                    if (global.city.biome === 'forest'){
                        removeAction(actions.evolution.fey.id);
                        delete global.evolution.fey;
                    }
                    if (global.city.biome === 'desert'){
                        removeAction(actions.evolution.sand.id);
                        delete global.evolution.sand;
                    }
                    if (global.city.biome === 'volcanic'){
                        removeAction(actions.evolution.heat.id);
                        delete global.evolution.heat;
                    }
                    if (global.city.biome === 'tundra'){
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
                        races.push('elven');
                        races.push('orc');
                        races.push('human');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'humanoid'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['gigantism']){
                        races.push('troll');
                        races.push('ogre');
                        races.push('cyclops');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'giant'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['dwarfism']){
                        races.push('kobold');
                        races.push('goblin');
                        races.push('gnome');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'small'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['animalism']){
                        races.push('cath');
                        races.push('wolven');
                        races.push('centaur');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'animal'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['ectothermic']){
                        races.push('tortoisan');
                        races.push('gecko');
                        races.push('slitheryn');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'reptilian'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['endothermic']){
                        races.push('arraak');
                        races.push('pterodacti');
                        races.push('dracnid');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'avian'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['chitin']){
                        races.push('sporgar');
                        races.push('shroomi');
                        races.push('moldling');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fungi'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['athropods']){
                        races.push('mantis');
                        races.push('scorpid');
                        races.push('antid');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'insectoid'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['chloroplasts']){
                        races.push('entish');
                        races.push('cacti');
                        races.push('pinguicula');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'plant'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['aquatic']){
                        races.push('sharkin');
                        races.push('octigoran');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'aquatic'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['fey']){
                        races.push('dryad');
                        races.push('satyr');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'fey'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['heat']){
                        races.push('phoenix');
                        races.push('salamander');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'heat'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['polar']){
                        races.push('yeti');
                        races.push('wendigo');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'polar'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['sand']){
                        races.push('tuskin');
                        races.push('kamel');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'sand'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['demonic']){
                        races.push('balorg');
                        races.push('imp');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'demonic'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['celestial']){
                        races.push('seraph');
                        races.push('unicorn');
                        if (global.hasOwnProperty('custom') && global.custom.race0.genus === 'angelic'){
                            races.push('custom');
                        }
                    }
                    else if (global.evolution['eggshell']){
                        races.push('dracnid');
                    }
                    else {
                        races.push('human');
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
                        delete global.race['cataclysm'];
                        $(`#evo-cataclysm`).removeClass('hl');
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
                        delete global.race['cataclysm'];
                        $(`#evo-cataclysm`).removeClass('hl');
                    }
                    else {
                        global.race['weak_mastery'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');
                    }
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
                        delete global.race['cataclysm'];
                        $(`#evo-cataclysm`).removeClass('hl');
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
                        delete global.race['cataclysm'];
                        $(`#evo-cataclysm`).removeClass('hl');
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
                            delete global.race['cataclysm'];
                            $(`#evo-cataclysm`).removeClass('hl');
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
            desc(){ return global.race.universe === 'micro' ? `<div class="has-text-danger">${loc('evo_challenge_micro_warn')}</div><div class="has-text-danger">${loc('evo_no_toggle')}</div>` : `<div>${loc('evo_challenge_junker_desc')}</div><div class="has-text-danger">${loc('evo_no_toggle')}</div>`; },
            cost: {
                DNA(){ return 50; }
            },
            effect(){
                return global.city.biome === 'hellscape' && global.race.universe !== 'evil' ? `<div>${loc('evo_challenge_junker_effect')}</div><div class="has-text-special">${loc('evo_warn_unwise')}</div>` : loc('evo_challenge_junker_effect'); },
            action(){
                if (payCosts(actions.evolution.junker.cost)){
                    global.race.species = 'junker';
                    global.race['junker'] = 1;
                    delete global.race['cataclysm'];
                    if (global.race.universe === 'antimatter') {
                        global.race['weak_mastery'] = 1;
                    }
                    else {
                        global.race['no_plasmid'] = 1;
                    }
                    global.race['no_trade'] = 1;
                    global.race['no_craft'] = 1;
                    global.race['no_crispr'] = 1;
                    sentience();
                }
                return false;
            },
            emblem(){ return format_emblem('extinct_junker'); },
            flair: loc('evo_challenge_junker_flair')
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
                    if (global.race['cataclysm']){
                        delete global.race['cataclysm'];
                        $(`#${$(this)[0].id}`).removeClass('hl');
                    }
                    else {
                        global.race['cataclysm'] = 1;
                        $(`#${$(this)[0].id}`).addClass('hl');

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
            condition(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
                    return global['special'] && global.special['gift'] ? true : false;
                }
                return false;
            },
            action(){
                const date = new Date();
                if (date.getMonth() !== 11 || (date.getMonth() === 11 && (date.getDate() <= 16 || date.getDate() >= 25))){
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
                return false;
            }
        },
        food: {
            id: 'city-food',
            title(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_trick');
                }
                else {
                    return loc('city_food');
                }
            },
            desc(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_trick_desc');
                }
                else {
                    return loc('city_food_desc');
                }
            },
            category: 'outskirts',
            reqs: { primitive: 1 },
            not_trait: ['soul_eater','cataclysm'],
            no_queue(){ return true },
            action(){
                if(global['resource']['Food'].amount < global['resource']['Food'].max){
                    let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                    if (global.genes['enhance']){
                        gain *= 2;
                    }
                    modRes('Food',gain);
                }
                return false;
            }
        },
        lumber: {
            id: 'city-lumber',
            title(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_dig');
                }
                else {
                    return loc('city_lumber');
                }
            },
            desc(){
                const date = new Date();
                if (date.getMonth() === 9 && date.getDate() === 31){
                    return loc('city_dig_desc');
                }
                else {
                    return loc('city_lumber_desc');
                }
            },
            category: 'outskirts',
            reqs: {},
            not_trait: ['evil','cataclysm'],
            no_queue(){ return true },
            action(){
                if (global['resource']['Lumber'].amount < global['resource']['Lumber'].max){
                    let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                    if (global.genes['enhance']){
                        gain *= 2;
                    }
                    modRes('Lumber',gain);
                }
                return false;
            }
        },
        stone: {
            id: 'city-stone',
            title(){ return global.race['sappy'] ? loc('city_amber') : loc('city_stone'); },
            desc(){ return global.race['sappy'] ? loc('city_amber_desc') : loc('city_stone_desc'); },
            category: 'outskirts',
            reqs: { primitive: 2 },
            not_trait: ['cataclysm'],
            no_queue(){ return true },
            action(){
                if (global['resource']['Stone'].amount < global['resource']['Stone'].max){
                    let gain = global.race['strong'] ? traits.strong.vars[0] : 1;
                    if (global.genes['enhance']){
                        gain *= 2;
                    }
                    modRes('Stone',gain);
                }
                return false;
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
                    modRes('Lumber',gain);
                }
                if (global.race['soul_eater'] && global.tech['primitive'] && global['resource']['Food'].amount < global['resource']['Food'].max){
                    modRes('Food',gain);
                }
                if (global.resource.Furs.display && global['resource']['Furs'].amount < global['resource']['Furs'].max){
                    modRes('Furs',gain);
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
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '5000' : '2000') : '1000');
                    return `<div>${loc('plus_max_citizens',[2])}</div><div>${loc('plus_max_resource',[`\$${safe}`,loc('resource_Money_name')])}</div>`;
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
                Furs(offset){ return costMultiplier('apartment', offset, 725, 1.32) - 500; },
                Copper(offset){ return costMultiplier('apartment', offset, 650, 1.32) - 500; },
                Cement(offset){ return costMultiplier('apartment', offset, 700, 1.32) - 500; },
                Steel(offset){ return costMultiplier('apartment', offset, 800, 1.32) - 500; }
            },
            effect(){
                if (global.tech['home_safe']){
                    let safe = spatialReasoning(global.tech.home_safe >= 2 ? (global.tech.home_safe >= 3 ? '10000' : '5000') : '2000');
                    return `<div>${loc('plus_max_citizens',[5])}. <span class="has-text-caution">${loc('minus_power',[$(this)[0].powered()])}</span></div><div>${loc('plus_max_resource',[`\$${safe}`,loc('resource_Money_name')])}</div>`;
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
                vault = +(vault).toFixed(0);

                vault = '$'+vault;
                if (global.tech['banking'] >= 2){
                    return `<div>${loc('plus_max_resource',[vault,loc('resource_Money_name')])}</div><div>${loc('plus_max_resource',[1,loc('banker_name')])}</div>`;
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
            effect:  function(){
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
            effect:  function(){
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
            effect() {
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
                if (global.tech['alumina'] >= 2){
                    let label = global.race['sappy'] ? 'city_metal_refinery_effect_alt' : 'city_metal_refinery_effect';
                    return `<span>${loc(label,[6])}</span> <span class="has-text-caution">${loc('city_metal_refinery_effect2',[6,12,$(this)[0].powered()])}</span>`;
                }
                else {
                    return loc('city_metal_refinery_effect',[6]);
                }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['metal_refinery'].count++;
                    global.resource.Aluminium.display = true;
                    if (global.tech['foundry']){
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
                    let morale = global.city.shrine.morale;
                    desc = desc + `<div>${loc('city_shrine_morale',[morale])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.metal > 0){
                    let metal = global.city.shrine.metal;
                    desc = desc + `<div>${loc('city_shrine_metal',[metal])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.know > 0){
                    desc = desc + `<div>${loc('city_shrine_know',[global.city.shrine.know * 400])}</div>`;
                    desc = desc + `<div>${loc('city_shrine_know2',[global.city.shrine.know * 3])}</div>`;
                }
                if (global.city['shrine'] && global.city.shrine.tax > 0){
                    let tax = global.city.shrine.tax;
                    desc = desc + `<div>${loc('city_shrine_tax',[tax])}</div>`;
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
                    let shrine = 1 + (global.city.shrine.know * 0.03);
                    gain *= shrine;
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
            title(){ return global.race['evil'] ? loc('city_babel_title') : loc('city_wardenclyffe'); },
            desc: loc('city_wardenclyffe_desc'),
            category: 'science',
            reqs: { high_tech: 1 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('wardenclyffe', offset, 5000, 1.22); },
                Knowledge(offset){ return costMultiplier('wardenclyffe', offset, 1000, 1.22); },
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
                let desc = `<div>${loc('city_wardenclyffe_effect1')}</div><div>${loc('city_max_knowledge',[gain])}</div>`;
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
            flair(){ return global.race['evil'] ? `<div>${loc('city_babel_flair')}</div>` : `<div>${loc('city_wardenclyffe_flair1')}</div><div>${loc('city_wardenclyffe_flair2')}</div>`; }
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
                    gain = +(gain).toFixed(0);
                }
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
                return global.race['environmentalist'] ? loc('city_hydro_power') : loc('city_coal_power');
            },
            desc(){
                return global.race['environmentalist']
                    ? `<div>${loc('city_hydro_power_desc')}</div>`
                    : `<div>${loc('city_coal_power_desc')}</div><div class="has-text-special">${loc('requires_res',[loc('resource_Coal_name')])}</div>`;
            },
            category: 'utility',
            reqs: { high_tech: 2 },
            not_trait: ['cataclysm'],
            cost: {
                Money(offset){ return costMultiplier('coal_power', offset, 10000, 1.22); },
                Copper(offset){ return costMultiplier('coal_power', offset, 1800, 1.22) - 1000; },
                Iron(offset){ return global.city.ptrait === 'unstable' ? costMultiplier('coal_power', offset, 175, 1.22) : 0; },
                Cement(offset){ return costMultiplier('coal_power', offset, 600, 1.22); },
                Steel(offset){ return costMultiplier('coal_power', offset, 2000, 1.22) - 1000; }
            },
            effect(){
                let consume = 0.35;
                let power = -($(this)[0].powered());
                return global.race['environmentalist'] ? `+${power}MW` : `<span>+${power}MW.</span> <span class="has-text-caution">${loc('city_coal_power_effect',[consume])}</span>`;
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
                let exo = global.tech.mass >= 2 ? `<div>${loc('city_mass_driver_effect2',[1])}</div>` : '';
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
    tech: {
        club: {
            id: 'tech-club',
            title: loc('tech_club'),
            desc: loc('tech_club_desc'),
            category: 'agriculture',
            era: 'primitive',
            reqs: {},
            grant: ['primitive',1],
            cost: {
                Lumber(){ return global.race['kindling_kindred'] ? 0 : 5; },
                Stone(){ return global.race['kindling_kindred'] ? 5 : 0; }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Food.display = true;
                    return true;
                }
                return false;
            }
        },
        bone_tools: {
            id: 'tech-bone_tools',
            title: loc('tech_bone_tools'),
            desc: loc('tech_bone_tools_desc'),
            category: 'stone_gathering',
            era: 'primitive',
            reqs: { primitive: 1 },
            grant: ['primitive',2],
            condition(){
                return global.race.species === 'wendigo' ? false : true;
            },
            cost: {
                Food(){ return global.race['evil'] ? 0 : 10; },
                Lumber(){ return global.race['evil'] ? 10 : 0; }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Stone.display = true;
                    return true;
                }
                return false;
            }
        },
        wooden_tools: {
            id: 'tech-wooden_tools',
            title() {
                return global.race['evil'] ? loc('tech_bone_tools') : loc('tech_wooden_tools');
            },
            desc() {
                return global.race['evil'] ? loc('tech_bone_tools_desc') : loc('tech_wooden_tools_desc');
            },
            category: 'stone_gathering',
            era: 'primitive',
            reqs: { primitive: 1 },
            grant: ['primitive',2],
            condition(){
                return global.race.species === 'wendigo' ? true : false;
            },
            cost: {
                Lumber(){ return 10; }
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Stone.display = true;
                    return true;
                }
                return false;
            }
        },
        sundial: {
            id: 'tech-sundial',
            title: loc('tech_sundial'),
            desc: loc('tech_sundial_desc'),
            category: 'science',
            era: 'primitive',
            reqs: { primitive: 2 },
            grant: ['primitive',3],
            cost: {
                Lumber(){ return 8; },
                Stone(){ return 10; }
            },
            effect: loc('tech_sundial_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_sundial_msg'),'info');
                    global.resource.Knowledge.display = true;
                    global.city.calendar.day++;
                    if (global.race['infectious']){
                        global.civic.garrison.display = true;
                        global.settings.showCivic = true;
                        global.city['garrison'] = { count: 0, on: 0 };
                    }
                    return true;
                }
                return false;
            }
        },
        housing: {
            id: 'tech-housing',
            title: loc('tech_housing'),
            desc: loc('tech_housing_desc'),
            category: 'housing',
            era: 'civilized',
            reqs: { primitive: 3 },
            grant: ['housing',1],
            cost: {
                Knowledge(){ return 10; }
            },
            effect: loc('tech_housing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['basic_housing'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        cottage: {
            id: 'tech-cottage',
            title(){
                return housingLabel('medium');
            },
            desc: loc('tech_cottage_desc'),
            category: 'housing',
            era: 'civilized',
            reqs: { housing: 1, cement: 1, mining: 3 },
            grant: ['housing',2],
            cost: {
                Knowledge(){ return 3600; }
            },
            effect: loc('tech_cottage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['cottage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        apartment: {
            id: 'tech-apartment',
            title(){
                return housingLabel('large');
            },
            desc(){
                return housingLabel('large');
            },
            category: 'housing',
            era: 'discovery',
            reqs: { housing: 2, high_tech: 2 },
            grant: ['housing',3],
            cost: {
                Knowledge(){ return 15750; }
            },
            effect: loc('tech_apartment_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['apartment'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        steel_beams: {
            id: 'tech-steel_beams',
            title: loc('tech_steel_beams'),
            desc: loc('tech_housing_cost'),
            category: 'housing',
            era: 'discovery',
            reqs: { housing: 2, smelting: 2 },
            not_trait: ['cataclysm'],
            grant: ['housing_reduction',1],
            cost: {
                Knowledge(){ return 11250; },
                Steel(){ return 2500; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_steel_beams_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_beams: {
            id: 'tech-mythril_beams',
            title: loc('tech_mythril_beams'),
            desc: loc('tech_housing_cost'),
            category: 'housing',
            era: 'early_space',
            reqs: { housing_reduction: 1, space: 3 },
            grant: ['housing_reduction',2],
            cost: {
                Knowledge(){ return 175000; },
                Mythril(){ return 1000; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_mythril_beams_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_walls: {
            id: 'tech-neutronium_walls',
            title: loc('tech_neutronium_walls'),
            desc: loc('tech_housing_cost'),
            category: 'housing',
            era: 'deep_space',
            reqs: { housing_reduction: 2, gas_moon: 1 },
            grant: ['housing_reduction',3],
            cost: {
                Knowledge(){ return 300000; },
                Neutronium(){ return 850; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_neutronium_walls_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bolognium_alloy_beams: {
            id: 'tech-bolognium_alloy_beams',
            title: loc('tech_bolognium_alloy_beams'),
            desc: loc('tech_housing_cost'),
            category: 'housing',
            era: 'intergalactic',
            reqs: { housing_reduction: 3, gateway: 3 },
            grant: ['housing_reduction',4],
            cost: {
                Knowledge(){ return 3750000; },
                Adamantite(){ return 2500000; },
                Bolognium(){ return 100000; }
            },
            effect(){
                let label = housingLabel('small');
                let cLabel = housingLabel('medium');
                return loc('tech_bolognium_alloy_beams_effect',[label,cLabel]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        aphrodisiac: {
            id: 'tech-aphrodisiac',
            title: loc('tech_aphrodisiac'),
            desc: loc('tech_aphrodisiac_desc'),
            category: 'housing',
            era: 'civilized',
            reqs: { housing: 2 },
            grant: ['reproduction',1],
            cost: {
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_aphrodisiac_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fertility_clinic: {
            id: 'tech-fertility_clinic',
            title: loc('tech_fertility_clinic'),
            desc: loc('tech_fertility_clinic'),
            category: 'housing',
            era: 'intergalactic',
            reqs: { reproduction: 1, xeno: 6 },
            not_trait: ['cataclysm'],
            grant: ['reproduction',2],
            cost: {
                Knowledge(){ return 4500000; }
            },
            effect: loc('tech_fertility_clinic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        smokehouse: {
            id: 'tech-smokehouse',
            title: loc('tech_smokehouse'),
            desc: loc('tech_smokehouse_desc'),
            category: 'storage',
            era: 'civilized',
            reqs: { primitive: 3, storage: 1 },
            trait: ['carnivore'],
            not_trait: ['cataclysm'],
            grant: ['hunting',1],
            cost: {
                Knowledge(){ return 80; }
            },
            effect: loc('tech_smokehouse_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smokehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        lodge: {
            id: 'tech-lodge',
            title: loc('tech_lodge'),
            desc: loc('tech_lodge'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { hunting: 1, housing: 1, currency: 1 },
            grant: ['hunting',2],
            not_trait: ['soul_eater'],
            cost: {
                Knowledge(){ return 180; }
            },
            effect: loc('tech_lodge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        alt_lodge: {
            id: 'tech-alt_lodge',
            title(){ return global.race['detritivore'] ? loc('tech_lodge_alt') : loc('tech_lodge'); },
            desc(){ return global.race['detritivore'] ? loc('tech_lodge_alt') : loc('tech_lodge'); },
            wiki: false,
            category: 'housing',
            era: 'civilized',
            reqs: { housing: 1, currency: 1 },
            grant: ['s_lodge',1],
            condition(){
                return global.race.species === 'wendigo' || global.race['detritivore'] ? true : false;
            },
            cost: {
                Knowledge(){ return 180; }
            },
            effect(){ return global.race['detritivore'] ? loc('tech_lodge_effect_alt') : loc('tech_lodge_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['lodge'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_well: {
            id: 'tech-soul_well',
            title: loc('tech_soul_well'),
            desc: loc('tech_soul_well'),
            category: 'souls',
            era: 'civilized',
            reqs: { primitive: 3 },
            trait: ['soul_eater'],
            not_trait: ['cataclysm'],
            grant: ['soul_eater',1],
            cost: {
                Knowledge(){ return 10; }
            },
            effect: loc('tech_soul_well_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['soul_well'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        compost: {
            id: 'tech-compost',
            title: loc('tech_compost'),
            desc: loc('tech_compost_desc'),
            category: 'compost',
            era: 'civilized',
            reqs: { primitive: 3 },
            trait: ['detritivore'],
            not_trait: ['cataclysm'],
            grant: ['compost',1],
            cost: {
                Knowledge(){ return 10; }
            },
            effect: loc('tech_compost_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['compost'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        hot_compost: {
            id: 'tech-hot_compost',
            title: loc('tech_hot_compost'),
            desc: loc('tech_hot_compost'),
            category: 'compost',
            era: 'civilized',
            reqs: { compost: 1 },
            trait: ['detritivore'],
            grant: ['compost',2],
            cost: {
                Knowledge(){ return 100; }
            },
            effect: loc('tech_hot_compost_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mulching: {
            id: 'tech-mulching',
            title: loc('tech_mulching'),
            desc: loc('tech_mulching'),
            category: 'compost',
            era: 'civilized',
            reqs: { compost: 2, mining: 3 },
            trait: ['detritivore'],
            grant: ['compost',3],
            cost: {
                Knowledge(){ return 3200; }
            },
            effect: loc('tech_mulching_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adv_mulching: {
            id: 'tech-adv_mulching',
            title: loc('tech_adv_mulching'),
            desc: loc('tech_adv_mulching'),
            category: 'compost',
            era: 'discovery',
            reqs: { compost: 3, high_tech: 2 },
            trait: ['detritivore'],
            grant: ['compost',4],
            cost: {
                Knowledge(){ return 16000; }
            },
            effect: loc('tech_adv_mulching_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        agriculture: {
            id: 'tech-agriculture',
            title: loc('tech_agriculture'),
            desc: loc('tech_agriculture_desc'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { primitive: 3 },
            not_trait: ['carnivore','soul_eater','detritivore','cataclysm'],
            grant: ['agriculture',1],
            cost: {
                Knowledge(){ return 10; }
            },
            effect: loc('tech_agriculture_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['farm'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        farm_house: {
            id: 'tech-farm_house',
            title: loc('tech_farm_house'),
            desc: loc('tech_farm_house_desc'),
            category: 'housing',
            era: 'civilized',
            reqs: { agriculture: 1, housing: 1, currency: 1 },
            grant: ['farm',1],
            cost: {
                Money(){ return 50; },
                Knowledge(){ return 180; }
            },
            effect: loc('tech_farm_house_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        irrigation: {
            id: 'tech-irrigation',
            title: loc('tech_irrigation'),
            desc: loc('tech_irrigation_desc'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { agriculture: 1 },
            grant: ['agriculture',2],
            cost: {
                Knowledge(){ return 55; }
            },
            effect: loc('tech_irrigation_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        silo: {
            id: 'tech-silo',
            title: loc('tech_silo'),
            desc: loc('tech_silo_desc'),
            category: 'storage',
            era: 'civilized',
            reqs: { agriculture: 2, storage: 1 },
            grant: ['agriculture',3],
            cost: {
                Knowledge(){ return 80; }
            },
            effect: loc('tech_silo_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['silo'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        mill: {
            id: 'tech-mill',
            title: loc('tech_mill'),
            desc: loc('tech_mill_desc'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { agriculture: 3, mining: 3 },
            grant: ['agriculture',4],
            cost: {
                Knowledge(){ return 5400; }
            },
            effect: loc('tech_mill_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mill'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        windmill: {
            id: 'tech-windmill',
            title: loc('tech_windmill'),
            desc: loc('tech_windmill_desc'),
            category: 'agriculture',
            era: 'discovery',
            reqs: { agriculture: 4, high_tech: 1 },
            grant: ['agriculture',5],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect: loc('tech_windmill_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        windturbine: {
            id: 'tech-windturbine',
            title: loc('tech_windturbine'),
            desc: loc('tech_windturbine'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { agriculture: 5, high_tech: 4 },
            grant: ['agriculture',6],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_windturbine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wind_plant: {
            id: 'tech-wind_plant',
            title: loc('tech_windmill'),
            desc: loc('tech_windmill'),
            category: 'agriculture',
            era: 'globalized',
            reqs: { hunting: 2, high_tech: 4 },
            grant: ['wind_plant',1],
            not_trait: ['soul_eater'],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_wind_plant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        evil_wind_plant: {
            id: 'tech-evil_wind_plant',
            title: loc('tech_windmill'),
            desc: loc('tech_windmill'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { high_tech: 4 },
            grant: ['wind_plant',1],
            trait: ['soul_eater'],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_wind_plant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['windmill'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gmfood: {
            id: 'tech-gmfood',
            title: loc('tech_gmfood'),
            desc: loc('tech_gmfood_desc'),
            category: 'agriculture',
            era: 'globalized',
            reqs: { agriculture: 6, genetics: 1 },
            grant: ['agriculture',7],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect: loc('tech_gmfood_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        foundry: {
            id: 'tech-foundry',
            title: loc('tech_foundry'),
            desc: loc('tech_foundry'),
            category: 'crafting',
            era: 'civilized',
            reqs: { mining: 2 },
            grant: ['foundry',1],
            cost: {
                Knowledge(){ return 650; }
            },
            effect: loc('tech_foundry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['foundry'] = {
                        count: 0,
                        crafting: 0,
                        Plywood: 0,
                        Brick: 0,
                        Bronze: 0,
                        Wrought_Iron: 0,
                        Sheet_Metal: 0,
                        Mythril: 0,
                        Aerogel: 0,
                        Nanoweave: 0,
                    };
                    return true;
                }
                return false;
            }
        },
        artisans: {
            id: 'tech-artisans',
            title: loc('tech_artisans'),
            desc: loc('tech_artisans'),
            category: 'crafting',
            era: 'civilized',
            reqs: { foundry: 1 },
            grant: ['foundry',2],
            cost: {
                Knowledge(){ return 1500; }
            },
            effect: loc('tech_artisans_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        apprentices: {
            id: 'tech-apprentices',
            title: loc('tech_apprentices'),
            desc: loc('tech_apprentices'),
            category: 'crafting',
            era: 'civilized',
            reqs: { foundry: 2 },
            grant: ['foundry',3],
            cost: {
                Knowledge(){ return 3200; }
            },
            effect: loc('tech_apprentices_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        carpentry: {
            id: 'tech-carpentry',
            title: loc('tech_carpentry'),
            desc: loc('tech_carpentry'),
            category: 'crafting',
            era: 'civilized',
            reqs: { foundry: 3, saw: 1 },
            grant: ['foundry',4],
            not_trait: ['evil'],
            cost: {
                Knowledge(){ return 5200; }
            },
            effect: loc('tech_carpentry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        demonic_craftsman: {
            id: 'tech-demonic_craftsman',
            title: loc('tech_master_craftsman'),
            desc: loc('tech_master_craftsman'),
            category: 'crafting',
            era: 'discovery',
            reqs: { foundry: 3 },
            grant: ['foundry',5],
            trait: ['evil'],
            cost: {
                Knowledge(){ return 12000; }
            },
            effect: loc('tech_master_craftsman_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        master_craftsman: {
            id: 'tech-master_craftsman',
            title: loc('tech_master_craftsman'),
            desc: loc('tech_master_craftsman'),
            category: 'crafting',
            era: 'discovery',
            reqs: { foundry: 4 },
            grant: ['foundry',5],
            not_trait: ['evil'],
            cost: {
                Knowledge(){ return 12000; }
            },
            effect: loc('tech_master_craftsman_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        brickworks: {
            id: 'tech-brickworks',
            title: loc('tech_brickworks'),
            desc: loc('tech_brickworks'),
            category: 'crafting',
            era: 'discovery',
            reqs: { foundry: 5 },
            grant: ['foundry',6],
            cost: {
                Knowledge(){ return 18500; }
            },
            effect: loc('tech_brickworks_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        machinery: {
            id: 'tech-machinery',
            title: loc('tech_machinery'),
            desc: loc('tech_machinery'),
            category: 'crafting',
            era: 'globalized',
            reqs: { foundry: 6, high_tech: 4 },
            grant: ['foundry',7],
            cost: {
                Knowledge(){ return 66000; }
            },
            effect: loc('tech_machinery_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cnc_machine: {
            id: 'tech-cnc_machine',
            title: loc('tech_cnc_machine'),
            desc: loc('tech_cnc_machine'),
            category: 'crafting',
            era: 'globalized',
            reqs: { foundry: 7, high_tech: 8 },
            grant: ['foundry',8],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: loc('tech_cnc_machine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        vocational_training: {
            id: 'tech-vocational_training',
            title: loc('tech_vocational_training'),
            desc: loc('tech_vocational_training'),
            category: 'crafting',
            era: 'industrialized',
            reqs: { foundry: 1, high_tech: 3 },
            grant: ['v_train',1],
            cost: {
                Knowledge(){ return 30000; }
            },
            effect: loc('tech_vocational_training_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stellar_forge: {
            id: 'tech-stellar_forge',
            title: loc('tech_stellar_forge'),
            desc: loc('tech_stellar_forge'),
            category: 'crafting',
            era: 'intergalactic',
            reqs: { foundry: 8, high_tech: 15, gateway: 3, neutron: 1 },
            grant: ['star_forge',1],
            cost: {
                Knowledge(){ return 4500000; }
            },
            effect: loc('tech_stellar_forge_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['stellar_forge'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        stellar_smelting: {
            id: 'tech-stellar_smelting',
            title: loc('tech_stellar_smelting'),
            desc: loc('tech_stellar_smelting'),
            category: 'crafting',
            era: 'intergalactic',
            reqs: { star_forge: 1, xeno: 4 },
            grant: ['star_forge',2],
            cost: {
                Knowledge(){ return 5000000; },
                Vitreloy(){ return 10000; }
            },
            effect: loc('tech_stellar_smelting_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        assembly_line: {
            id: 'tech-assembly_line',
            title: loc('tech_assembly_line'),
            desc: loc('tech_assembly_line'),
            category: 'crafting',
            era: 'globalized',
            reqs: { high_tech: 4 },
            grant: ['factory',1],
            cost: {
                Knowledge(){ return 72000; },
                Copper(){ return 125000; }
            },
            effect: `<span>${loc('tech_assembly_line_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        automation: {
            id: 'tech-automation',
            title: loc('tech_automation'),
            desc: loc('tech_automation'),
            category: 'crafting',
            era: 'early_space',
            reqs: { high_tech: 8, factory: 1},
            grant: ['factory',2],
            cost: {
                Knowledge(){ return 165000; }
            },
            effect: `<span>${loc('tech_automation_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        laser_cutters: {
            id: 'tech-laser_cutters',
            title: loc('tech_laser_cutters'),
            desc: loc('tech_laser_cutters'),
            category: 'crafting',
            era: 'deep_space',
            reqs: { high_tech: 9, factory: 2 },
            grant: ['factory',3],
            cost: {
                Knowledge(){ return 300000; },
                Elerium(){ return 200; }
            },
            effect: `<span>${loc('tech_laser_cutters_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        high_tech_factories: {
            id: 'tech-high_tech_factories',
            title: loc('tech_high_tech_factories'),
            desc: loc('tech_high_tech_factories'),
            category: 'crafting',
            era: 'intergalactic',
            reqs: { high_tech: 17, alpha: 4, factory: 3 },
            grant: ['factory',4],
            cost: {
                Knowledge(){ return 13500000; },
                Vitreloy(){ return 500000; },
                Orichalcum(){ return 300000; }
            },
            effect: `<span>${loc('tech_high_tech_factories_effect')}</span> <span class="has-text-special">${loc('tech_factory_warning')}</span>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        theatre: {
            id: 'tech-theatre',
            title: loc('tech_theatre'),
            desc: loc('tech_theatre'),
            category: 'entertainment',
            era: 'civilized',
            reqs: { housing: 1, currency: 1, cement: 1 },
            grant: ['theatre',1],
            not_trait: ['joyless'],
            cost: {
                Knowledge(){ return 750; }
            },
            effect: loc('tech_theatre_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['amphitheatre'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        playwright: {
            id: 'tech-playwright',
            title: loc('tech_playwright'),
            desc: loc('tech_playwright'),
            category: 'entertainment',
            era: 'civilized',
            reqs: { theatre: 1, science: 2 },
            grant: ['theatre',2],
            cost: {
                Knowledge(){ return 1080; }
            },
            effect: loc('tech_playwright_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        magic: {
            id: 'tech-magic',
            title: loc('tech_magic'),
            desc: loc('tech_magic'),
            category: 'entertainment',
            era: 'discovery',
            reqs: { theatre: 2, high_tech: 1 },
            grant: ['theatre',3],
            cost: {
                Knowledge(){ return 7920; }
            },
            effect: loc('tech_magic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        superstars: {
            id: 'tech-superstars',
            title: loc('tech_superstars'),
            desc: loc('tech_superstars'),
            category: 'entertainment',
            era: 'interstellar',
            reqs: { theatre: 3, high_tech: 12 },
            grant: ['superstar',1],
            cost: {
                Knowledge(){ return 660000; }
            },
            effect: loc('tech_superstars_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        radio: {
            id: 'tech-radio',
            title: loc('tech_radio'),
            desc: loc('tech_radio'),
            category: 'entertainment',
            era: 'discovery',
            reqs: { theatre: 3, high_tech: 2 },
            grant: ['broadcast',1],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect(){ return loc('tech_radio_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tv: {
            id: 'tech-tv',
            title: loc('tech_tv'),
            desc: loc('tech_tv'),
            category: 'entertainment',
            era: 'globalized',
            reqs: { broadcast: 1, high_tech: 4 },
            grant: ['broadcast',2],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect(){ return loc('tech_tv_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        vr_center: {
            id: 'tech-vr_center',
            title: loc('tech_vr_center'),
            desc: loc('tech_vr_center'),
            category: 'entertainment',
            era: 'interstellar',
            reqs: { broadcast: 2, high_tech: 12, stanene: 1 },
            grant: ['broadcast',3],
            cost: {
                Knowledge(){ return 620000; }
            },
            effect(){ return loc('tech_vr_center_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['vr_center'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        casino: {
            id: 'tech-casino',
            title: loc('tech_casino'),
            desc: loc('tech_casino'),
            category: 'entertainment',
            era: 'globalized',
            reqs: { high_tech: 4, currency: 5 },
            grant: ['gambling',1],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect: loc('tech_casino_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['casino'] = { count: 0, on: 0 };
                    global.space['spc_casino'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        dazzle: {
            id: 'tech-dazzle',
            title: loc('tech_dazzle'),
            desc: loc('tech_dazzle'),
            category: 'banking',
            era: 'globalized',
            reqs: { gambling: 1 },
            grant: ['gambling',2],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_dazzle_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        casino_vault: {
            id: 'tech-casino_vault',
            title: loc('tech_casino_vault'),
            desc: loc('tech_casino_vault'),
            category: 'banking',
            era: 'early_space',
            reqs: { gambling: 2, space: 3 },
            grant: ['gambling',3],
            cost: {
                Knowledge(){ return 145000; },
                Iridium(){ return 2500; }
            },
            effect: loc('tech_casino_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        otb: {
            id: 'tech-otb',
            title: loc('tech_otb'),
            desc: loc('tech_otb'),
            category: 'banking',
            era: 'deep_space',
            reqs: { gambling: 3, banking: 10, high_tech: 10 },
            grant: ['gambling',4],
            cost: {
                Knowledge(){ return 390000; }
            },
            effect: loc('tech_otb_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        online_gambling: {
            id: 'tech-online_gambling',
            title: loc('tech_online_gambling'),
            desc: loc('tech_online_gambling'),
            category: 'banking',
            era: 'interstellar',
            reqs: { gambling: 4, banking: 12 },
            grant: ['gambling',5],
            cost: {
                Knowledge(){ return 800000; }
            },
            effect: loc('tech_online_gambling_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bolognium_vaults: {
            id: 'tech-bolognium_vaults',
            title: loc('tech_bolognium_vaults'),
            desc: loc('tech_bolognium_vaults'),
            category: 'banking',
            era: 'intergalactic',
            reqs: { gambling: 5, gateway: 3 },
            grant: ['gambling',6],
            cost: {
                Knowledge(){ return 3900000; },
                Bolognium(){ return 180000; }
            },
            effect: loc('tech_bolognium_vaults_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mining: {
            id: 'tech-mining',
            title(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining'); },
            desc(){ return global.race['sappy'] ? loc('tech_amber') : loc('tech_mining_desc'); },
            category: 'mining',
            era: 'civilized',
            reqs: { primitive: 3 },
            grant: ['mining',1],
            cost: {
                Knowledge(){ return 45; }
            },
            effect(){ return global.race['sappy'] ? loc('tech_amber_effect') : loc('tech_mining_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['rock_quarry'] = {
                        count: 0,
                        on: 0
                    };
                    if (global.race['cannibalize']){
                        global.city['s_alter'] = {
                            count: 0,
                            rage: 0,
                            mind: 0,
                            regen: 0,
                            mine: 0,
                            harvest: 0,
                        };
                    }
                    return true;
                }
                return false;
            }
        },
        bayer_process: {
            id: 'tech-bayer_process',
            title: loc('tech_bayer_process'),
            desc: loc('tech_bayer_process_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { smelting: 2 },
            grant: ['alumina',1],
            cost: {
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_bayer_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['metal_refinery'] = { count: 0, on: 0 };
                    global.resource.Sheet_Metal.display = true;
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        elysis_process: {
            id: 'tech-elysis_process',
            title: loc('tech_elysis_process'),
            desc: loc('tech_elysis_process'),
            category: 'mining',
            era: 'interstellar',
            reqs: { alumina: 1, stanene: 1, graphene: 1 },
            not_trait: ['cataclysm'],
            grant: ['alumina',2],
            cost: {
                Knowledge(){ return 675000; },
                Graphene(){ return 45000; },
                Stanene(){ return 75000; },
            },
            effect: loc('tech_elysis_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        smelting: {
            id: 'tech-smelting',
            title: loc('tech_smelting'),
            desc: loc('tech_smelting_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { mining: 3 },
            grant: ['smelting',1],
            cost: {
                Knowledge(){ return 4050; }
            },
            effect: loc('tech_smelting_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['smelter'] = {
                        count: 0,
                        cap: 0,
                        Wood: 0,
                        Coal: 0,
                        Oil: 0,
                        Iron: 0,
                        Steel: 0
                    };
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['steelen']){
                    global.tech['smelting'] = 2;
                    drawTech();
                }
            }
        },
        steel: {
            id: 'tech-steel',
            title: loc('tech_steel'),
            desc: loc('tech_steel_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { smelting: 1, mining: 4 },
            grant: ['smelting',2],
            condition() {
                return global.race['steelen'] ? false : true;
            },
            cost: {
                Knowledge(){ return 4950; },
                Steel(){ return 25; }
            },
            effect: loc('tech_steel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Steel.display = true;
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        blast_furnace: {
            id: 'tech-blast_furnace',
            title: loc('tech_blast_furnace'),
            desc: loc('tech_blast_furnace'),
            category: 'mining',
            era: 'discovery',
            reqs: { smelting: 2 },
            grant: ['smelting',3],
            cost: {
                Knowledge(){ return 13500; },
                Coal(){ return 2000; }
            },
            effect: loc('tech_blast_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['steelen']){
                    global.tech['smelting'] = 6;
                    drawTech();
                }
            }
        },
        bessemer_process: {
            id: 'tech-bessemer_process',
            title: loc('tech_bessemer_process'),
            desc: loc('tech_bessemer_process'),
            category: 'mining',
            era: 'discovery',
            reqs: { smelting: 3 },
            grant: ['smelting',4],
            condition() {
                return global.race['steelen'] ? false : true;
            },
            cost: {
                Knowledge(){ return 19800; },
                Coal(){ return 5000; }
            },
            effect: loc('tech_bessemer_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        oxygen_converter: {
            id: 'tech-oxygen_converter',
            title: loc('tech_oxygen_converter'),
            desc: loc('tech_oxygen_converter'),
            category: 'mining',
            era: 'industrialized',
            reqs: { smelting: 4, high_tech: 3 },
            grant: ['smelting',5],
            condition() {
                return global.race['steelen'] ? false : true;
            },
            cost: {
                Knowledge(){ return 46800; },
                Coal(){ return 10000; }
            },
            effect: loc('tech_oxygen_converter_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        electric_arc_furnace: {
            id: 'tech-electric_arc_furnace',
            title: loc('tech_electric_arc_furnace'),
            desc: loc('tech_electric_arc_furnace'),
            category: 'mining',
            era: 'globalized',
            reqs: { smelting: 5, high_tech: 4 },
            grant: ['smelting',6],
            condition() {
                return global.race['steelen'] ? false : true;
            },
            cost: {
                Knowledge(){ return 85500; },
                Copper(){ return 25000; }
            },
            effect: loc('tech_electric_arc_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hellfire_furnace: {
            id: 'tech-hellfire_furnace',
            title: loc('tech_hellfire_furnace'),
            desc: loc('tech_hellfire_furnace'),
            category: 'mining',
            era: 'interstellar',
            reqs: { smelting: 6, infernite: 1 },
            grant: ['smelting',7],
            cost: {
                Knowledge(){ return 615000; },
                Infernite(){ return 2000; },
                Soul_Gem(){ return 2; }
            },
            effect: loc('tech_hellfire_furnace_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        rotary_kiln: {
            id: 'tech-rotary_kiln',
            title: loc('tech_rotary_kiln'),
            desc: loc('tech_rotary_kiln'),
            category: 'mining',
            era: 'industrialized',
            reqs: { smelting: 3, high_tech: 3 },
            grant: ['copper',1],
            cost: {
                Knowledge(){ return 57600; },
                Coal(){ return 8000; }
            },
            effect: loc('tech_rotary_kiln_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        metal_working: {
            id: 'tech-metal_working',
            title: loc('tech_metal_working'),
            desc: loc('tech_metal_working_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { mining: 1 },
            grant: ['mining',2],
            cost: {
                Knowledge(){ return 350; }
            },
            effect: loc('tech_metal_working_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mine'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        iron_mining: {
            id: 'tech-iron_mining',
            title: loc('tech_iron_mining'),
            desc: loc('tech_iron_mining_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { mining: 2 },
            grant: ['mining',3],
            cost: {
                Knowledge(){ return global.city.ptrait === 'unstable' ? 500 : 2500; }
            },
            effect: loc('tech_iron_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Iron.display = true;
                    if (global.city['foundry'] && global.city['foundry'].count > 0){
                        global.resource.Wrought_Iron.display = true;
                        loadFoundry();
                    }
                    return true;
                }
                return false;
            }
        },
        coal_mining: {
            id: 'tech-coal_mining',
            title: loc('tech_coal_mining'),
            desc: loc('tech_coal_mining_desc'),
            category: 'power_generation',
            era: 'civilized',
            reqs: { mining: 3 },
            grant: ['mining',4],
            cost: {
                Knowledge(){ return 4320; }
            },
            effect: loc('tech_coal_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['coal_mine'] = {
                        count: 0,
                        on: 0
                    };
                    global.resource.Coal.display = true;
                    return true;
                }
                return false;
            }
        },
        storage: {
            id: 'tech-storage',
            title: loc('tech_storage'),
            desc: loc('tech_storage_desc'),
            category: 'storage',
            era: 'civilized',
            reqs: { primitive: 3, currency: 1 },
            grant: ['storage',1],
            cost: {
                Knowledge(){ return 20; }
            },
            effect: loc('tech_storage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['shed'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_shed: {
            id: 'tech-reinforced_shed',
            title: loc('tech_reinforced_shed'),
            desc: loc('tech_reinforced_shed_desc'),
            category: 'storage',
            era: 'civilized',
            reqs: { storage: 1, cement: 1 },
            grant: ['storage',2],
            cost: {
                Money(){ return 3750; },
                Knowledge(){ return 2250; },
                Iron(){ return 750; },
                Cement(){ return 500; }
            },
            effect: loc('tech_reinforced_shed_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        barns: {
            id: 'tech-barns',
            title: loc('tech_barns'),
            desc: loc('tech_barns_desc'),
            category: 'storage',
            era: 'discovery',
            reqs: { storage: 2, smelting: 2, alumina: 1 },
            grant: ['storage',3],
            cost: {
                Knowledge(){ return 15750; },
                Aluminium(){ return 3000; },
                Steel(){ return 3000; }
            },
            effect: loc('tech_barns_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        warehouse: {
            id: 'tech-warehouse',
            title: loc('tech_warehouse'),
            desc: loc('tech_warehouse_desc'),
            category: 'storage',
            era: 'industrialized',
            reqs: { storage: 3, high_tech: 3, smelting: 2 },
            grant: ['storage',4],
            cost: {
                Knowledge(){ return 40500; },
                Titanium(){ return 3000; }
            },
            effect: loc('tech_warehouse_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cameras: {
            id: 'tech-cameras',
            title: loc('tech_cameras'),
            desc: loc('tech_cameras_desc'),
            category: 'storage',
            era: 'globalized',
            reqs: { storage: 4, high_tech: 4 },
            grant: ['storage',5],
            cost: {
                Money(){ return 90000; },
                Knowledge(){ return 65000; }
            },
            effect: loc('tech_cameras_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        pocket_dimensions: {
            id: 'tech-pocket_dimensions',
            title: loc('tech_pocket_dimensions'),
            desc: loc('tech_pocket_dimensions_desc'),
            category: 'storage',
            era: 'early_space',
            reqs: { particles: 1, storage: 5 },
            grant: ['storage',6],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_pocket_dimensions_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ai_logistics: {
            id: 'tech-ai_logistics',
            title: loc('tech_ai_logistics'),
            desc: loc('tech_ai_logistics'),
            category: 'storage',
            era: 'interstellar',
            reqs: { storage: 6, proxima: 2, science: 13 },
            grant: ['storage',7],
            cost: {
                Knowledge(){ return 650000; }
            },
            effect: loc('tech_ai_logistics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        containerization: {
            id: 'tech-containerization',
            title: loc('tech_containerization'),
            desc: loc('tech_containerization_desc'),
            category: 'storage',
            era: 'civilized',
            reqs: { cement: 1 },
            grant: ['container',1],
            cost: {
                Knowledge(){ return 2700; }
            },
            effect: loc('tech_containerization_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['storage_yard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        reinforced_crates: {
            id: 'tech-reinforced_crates',
            title: loc('tech_reinforced_crates'),
            desc: loc('tech_reinforced_crates'),
            category: 'storage',
            era: 'civilized',
            reqs: { container: 1, smelting: 2 },
            grant: ['container',2],
            cost: {
                Knowledge(){ return 6750; },
                Sheet_Metal(){ return 100; }
            },
            effect() {
                return global.race['kindling_kindred'] ? loc('tech_reinforced_crates_stone_effect') : global.race['evil'] ? loc('tech_reinforced_crates_bone_effect') : loc('tech_reinforced_crates_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        cranes: {
            id: 'tech-cranes',
            title: loc('tech_cranes'),
            desc: loc('tech_cranes_desc'),
            category: 'storage',
            era: 'discovery',
            reqs: { container: 2, high_tech: 2 },
            grant: ['container',3],
            cost: {
                Knowledge(){ return 18000; },
                Copper(){ return 1000; },
                Steel(){ return 2500; }
            },
            effect: loc('tech_cranes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_crates: {
            id: 'tech-titanium_crates',
            title: loc('tech_titanium_crates'),
            desc: loc('tech_titanium_crates'),
            category: 'storage',
            era: 'globalized',
            reqs: { container: 3, titanium: 1 },
            grant: ['container',4],
            cost: {
                Knowledge(){ return 67500; },
                Titanium(){ return 1000; }
            },
            effect: loc('tech_titanium_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        mythril_crates: {
            id: 'tech-mythril_crates',
            title: loc('tech_mythril_crates'),
            desc: loc('tech_mythril_crates'),
            category: 'storage',
            era: 'early_space',
            reqs: { container: 4, space: 3 },
            grant: ['container',5],
            cost: {
                Knowledge(){ return 145000; },
                Mythril(){ return 350; }
            },
            effect: loc('tech_mythril_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        infernite_crates: {
            id: 'tech-infernite_crates',
            title: loc('tech_infernite_crates'),
            desc: loc('tech_infernite_crates_desc'),
            category: 'storage',
            era: 'interstellar',
            reqs: { container: 5, infernite: 1 },
            grant: ['container',6],
            cost: {
                Knowledge(){ return 575000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_infernite_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        graphene_crates: {
            id: 'tech-graphene_crates',
            title: loc('tech_graphene_crates'),
            desc: loc('tech_graphene_crates'),
            category: 'storage',
            era: 'interstellar',
            reqs: { container: 6, graphene: 1 },
            grant: ['container',7],
            cost: {
                Knowledge(){ return 725000; },
                Graphene(){ return 75000; }
            },
            effect: loc('tech_graphene_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        bolognium_crates: {
            id: 'tech-bolognium_crates',
            title: loc('tech_bolognium_crates'),
            desc: loc('tech_bolognium_crates'),
            category: 'storage',
            era: 'intergalactic',
            reqs: { container: 7, gateway: 3 },
            grant: ['container',8],
            cost: {
                Knowledge(){ return 3420000; },
                Bolognium(){ return 90000; }
            },
            effect: loc('tech_bolognium_crates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_containers: {
            id: 'tech-steel_containers',
            title: loc('tech_steel_containers'),
            desc: loc('tech_steel_containers_desc'),
            category: 'storage',
            era: 'discovery',
            reqs: { smelting: 2, container: 1 },
            grant: ['steel_container',1],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect() {
                return global.race['kindling_kindred'] ? loc('tech_steel_containers_stone_effect') : global.race['evil'] ? loc('tech_steel_containers_bone_effect') : loc('tech_steel_containers_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['warehouse'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gantry_crane: {
            id: 'tech-gantry_crane',
            title: loc('tech_gantry_crane'),
            desc: loc('tech_gantry_crane_desc'),
            category: 'storage',
            era: 'discovery',
            reqs: { steel_container: 1, high_tech: 2 },
            grant: ['steel_container',2],
            cost: {
                Knowledge(){ return 22500; },
                Steel(){ return 5000; }
            },
            effect: loc('tech_gantry_crane_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_containers: {
            id: 'tech-alloy_containers',
            title: loc('tech_alloy_containers'),
            desc: loc('tech_alloy_containers_desc'),
            category: 'storage',
            era: 'industrialized',
            reqs: { steel_container: 2, storage: 4 },
            grant: ['steel_container',3],
            cost: {
                Knowledge(){ return 49500; },
                Alloy(){ return 2500; }
            },
            effect: loc('tech_alloy_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        mythril_containers: {
            id: 'tech-mythril_containers',
            title: loc('tech_mythril_containers'),
            desc: loc('tech_mythril_containers_desc'),
            category: 'storage',
            era: 'early_space',
            reqs: { steel_container: 3, space: 3 },
            grant: ['steel_container',4],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 500; }
            },
            effect: loc('tech_mythril_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        adamantite_containers: {
            id: 'tech-adamantite_containers',
            title: loc('tech_adamantite_containers'),
            desc: loc('tech_adamantite_containers_desc'),
            category: 'storage',
            era: 'interstellar',
            reqs: { steel_container: 4, alpha: 2 },
            grant: ['steel_container',5],
            cost: {
                Knowledge(){ return 525000; },
                Adamantite(){ return 17500; }
            },
            effect: loc('tech_adamantite_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        aerogel_containers: {
            id: 'tech-aerogel_containers',
            title: loc('tech_aerogel_containers'),
            desc: loc('tech_aerogel_containers'),
            category: 'storage',
            era: 'interstellar',
            reqs: { steel_container: 5, aerogel: 1 },
            grant: ['steel_container',6],
            cost: {
                Knowledge(){ return 775000; },
                Aerogel(){ return 500; }
            },
            effect: loc('tech_aerogel_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: `#createHead`},'update');
                    return true;
                }
                return false;
            }
        },
        bolognium_containers: {
            id: 'tech-bolognium_containers',
            title: loc('tech_bolognium_containers'),
            desc: loc('tech_bolognium_containers'),
            category: 'storage',
            era: 'intergalactic',
            reqs: { steel_container: 6, gateway: 3 },
            grant: ['steel_container',7],
            cost: {
                Knowledge(){ return 3500000; },
                Bolognium(){ return 125000; }
            },
            effect: loc('tech_bolognium_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        nanoweave_containers: {
            id: 'tech-nanoweave_containers',
            title: loc('tech_nanoweave_containers'),
            desc: loc('tech_nanoweave_containers'),
            category: 'storage',
            era: 'intergalactic',
            reqs: { steel_container: 7, nanoweave: 1 },
            grant: ['steel_container',8],
            cost: {
                Knowledge(){ return 9000000; },
                Nanoweave(){ return 50000; }
            },
            effect: loc('tech_nanoweave_containers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        evil_planning: {
            id: 'tech-evil_planning',
            title: loc('tech_urban_planning'),
            desc: loc('tech_urban_planning'),
            category: 'queues',
            era: 'civilized',
            reqs: { banking: 2 },
            grant: ['queue',1],
            trait: ['terrifying'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: loc('tech_urban_planning_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.queue.display = true;
                    return true;
                }
                return false;
            }
        },
        urban_planning: {
            id: 'tech-urban_planning',
            title: loc('tech_urban_planning'),
            desc: loc('tech_urban_planning'),
            category: 'queues',
            era: 'civilized',
            reqs: { banking: 2, currency: 2 },
            grant: ['queue',1],
            not_trait: ['terrifying'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: loc('tech_urban_planning_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.queue.display = true;
                    return true;
                }
                return false;
            }
        },
        zoning_permits: {
            id: 'tech-zoning_permits',
            title: loc('tech_zoning_permits'),
            desc: loc('tech_zoning_permits'),
            category: 'queues',
            era: 'industrialized',
            reqs: { queue: 1, high_tech: 3 },
            grant: ['queue',2],
            cost: {
                Knowledge(){ return 28000; }
            },
            effect(){
                return loc('tech_zoning_permits_effect',[global.genes['queue'] && global.genes['queue'] >= 2 ? 4 : 2]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        urbanization: {
            id: 'tech-urbanization',
            title: loc('tech_urbanization'),
            desc: loc('tech_urbanization'),
            category: 'queues',
            era: 'globalized',
            reqs: { queue: 2, high_tech: 6 },
            grant: ['queue',3],
            cost: {
                Knowledge(){ return 95000; }
            },
            effect(){
                return loc('tech_urbanization_effect',[global.genes['queue'] && global.genes['queue'] >= 2 ? 6 : 3]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        assistant: {
            id: 'tech-assistant',
            title: loc('tech_assistant'),
            desc: loc('tech_assistant'),
            category: 'queues',
            era: 'civilized',
            reqs: { queue: 1, science: 4 },
            grant: ['r_queue',1],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_assistant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.r_queue.display = true;
                    return true;
                }
                return false;
            }
        },
        government: {
            id: 'tech-government',
            title: loc('tech_government'),
            desc: loc('tech_government_desc'),
            category: 'government',
            era: 'civilized',
            reqs: { currency: 1 },
            grant: ['govern',1],
            cost: {
                Knowledge(){ return 750; }
            },
            effect: loc('tech_government_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    vBind({el: '#govType'},'update');
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        theocracy: {
            id: 'tech-theocracy',
            title: loc('govern_theocracy'),
            desc: loc('govern_theocracy'),
            category: 'government',
            era: 'civilized',
            reqs: { govern: 1, theology: 2 },
            grant: ['gov_theo',1],
            cost: {
                Knowledge(){ return 1200; }
            },
            effect: loc('tech_theocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        republic: {
            id: 'tech-republic',
            title: loc('govern_republic'),
            desc: loc('govern_republic'),
            category: 'government',
            era: 'discovery',
            reqs: { govern: 1 },
            condition(){
                return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
            },
            grant: ['govern',2],
            cost: {
                Knowledge(){ return 17000; }
            },
            effect: loc('tech_republic_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        socialist: {
            id: 'tech-socialist',
            title: loc('govern_socialist'),
            desc: loc('govern_socialist'),
            category: 'government',
            era: 'discovery',
            reqs: { govern: 1 },
            condition(){
                return (global.tech['trade'] && global.tech['trade'] >= 2) || global.race['terrifying'] ? true : false;
            },
            grant: ['gov_soc',1],
            cost: {
                Knowledge(){ return 17000; }
            },
            effect: loc('tech_socialist_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        corpocracy: {
            id: 'tech-corpocracy',
            title: loc('govern_corpocracy'),
            desc: loc('govern_corpocracy'),
            category: 'government',
            era: 'industrialized',
            reqs: { govern: 2, high_tech: 3 },
            grant: ['gov_corp',1],
            cost: {
                Knowledge(){ return 26000; }
            },
            effect: loc('tech_corpocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        technocracy: {
            id: 'tech-technocracy',
            title: loc('govern_technocracy'),
            desc: loc('govern_technocracy'),
            category: 'government',
            era: 'industrialized',
            reqs: { govern: 2, high_tech: 3 },
            grant: ['govern',3],
            cost: {
                Knowledge(){ return 26000; }
            },
            effect: loc('tech_technocracy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        federation: {
            id: 'tech-federation',
            title: loc('govern_federation'),
            desc: loc('govern_federation'),
            category: 'government',
            era: 'early_space',
            reqs: { govern: 2 },
            condition(){
                return (global.tech['unify'] && global.tech['unify'] >= 2) || checkControlling();
            },
            grant: ['gov_fed',1],
            cost: {
                Knowledge(){ return 30000; }
            },
            effect: loc('tech_federation_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        spy: {
            id: 'tech-spy',
            title: loc('tech_spy'),
            desc: loc('tech_spy'),
            category: 'spies',
            era: 'civilized',
            reqs: { govern: 1 },
            grant: ['spy',1],
            cost: {
                Knowledge(){ return 1250; }
            },
            effect: loc('tech_spy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        espionage: {
            id: 'tech-espionage',
            title: loc('tech_espionage'),
            desc: loc('tech_espionage'),
            category: 'spies',
            era: 'discovery',
            reqs: { spy: 1, high_tech: 1 },
            grant: ['spy',2],
            cost: {
                Knowledge(){ return 7500; }
            },
            effect: loc('tech_espionage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: '#foreign'},'update');
                    return true;
                }
                return false;
            }
        },
        spy_training: {
            id: 'tech-spy_training',
            title: loc('tech_spy_training'),
            desc: loc('tech_spy_training'),
            category: 'spies',
            era: 'discovery',
            reqs: { spy: 2, boot_camp: 1 },
            grant: ['spy',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_spy_training_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        spy_gadgets: {
            id: 'tech-spy_gadgets',
            title: loc('tech_spy_gadgets'),
            desc: loc('tech_spy_gadgets'),
            category: 'spies',
            era: 'discovery',
            reqs: { spy: 3, high_tech: 2 },
            grant: ['spy',4],
            cost: {
                Knowledge(){ return 15000; }
            },
            effect: loc('tech_spy_gadgets_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        code_breakers: {
            id: 'tech-code_breakers',
            title: loc('tech_code_breakers'),
            desc: loc('tech_code_breakers'),
            category: 'spies',
            era: 'industrialized',
            reqs: { spy: 4, high_tech: 4 },
            grant: ['spy',5],
            cost: {
                Knowledge(){ return 55000; }
            },
            effect: loc('tech_code_breakers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        currency: {
            id: 'tech-currency',
            title: loc('tech_currency'),
            desc: loc('tech_currency_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { housing: 1 },
            grant: ['currency',1],
            cost: {
                Knowledge(){ return 22; },
                Lumber(){ return 10; }
            },
            effect: loc('tech_currency_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Money.display = true;
                    return true;
                }
                return false;
            }
        },
        market: {
            id: 'tech-market',
            title: loc('tech_market'),
            desc: loc('tech_market_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 1, govern: 1 },
            not_trait: ['terrifying'],
            grant: ['currency',2],
            cost: {
                Knowledge(){ return 1800; }
            },
            effect: loc('tech_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showResources = true;
                    global.settings.showMarket = true;
                    return true;
                }
                return false;
            }
        },
        tax_rates: {
            id: 'tech-tax_rates',
            title: loc('tech_tax_rates'),
            desc: loc('tech_tax_rates_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 2, currency: 2, queue: 1 },
            grant: ['currency',3],
            cost: {
                Knowledge(){ return 3375; }
            },
            effect: loc('tech_tax_rates_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic['taxes'].display = true;
                    return true;
                }
                return false;
            }
        },
        large_trades: {
            id: 'tech-large_trades',
            title: loc('tech_large_trades'),
            desc: loc('tech_large_trades_desc'),
            category: 'market',
            era: 'civilized',
            reqs: { currency: 3 },
            grant: ['currency',4],
            cost: {
                Knowledge(){ return 6750; }
            },
            effect: loc('tech_large_trades_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            },
            post(){
                if (global.race['noble']){
                    global.tech['currency'] = 5;
                    drawTech();
                }
            }
        },
        corruption: {
            id: 'tech-corruption',
            title: loc('tech_corruption'),
            desc: loc('tech_corruption_desc'),
            category: 'banking',
            era: 'industrialized',
            reqs: { currency: 4, high_tech: 3 },
            grant: ['currency',5],
            not_trait: ['noble'],
            cost: {
                Knowledge(){ return 36000; }
            },
            effect: loc('tech_corruption_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        massive_trades: {
            id: 'tech-massive_trades',
            title: loc('tech_massive_trades'),
            desc: loc('tech_massive_trades_desc'),
            category: 'market',
            era: 'globalized',
            reqs: { currency: 5, high_tech: 4 },
            grant: ['currency',6],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_massive_trades_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    loadMarket();
                    return true;
                }
                return false;
            }
        },
        trade: {
            id: 'tech-trade',
            title: loc('tech_trade'),
            desc: loc('tech_trade_desc'),
            category: 'market',
            era: 'civilized',
            reqs: { currency: 2, military: 1 },
            grant: ['trade',1],
            cost: {
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_trade_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['trade'] = { count: 0 };
                    global.city.market.active = true;
                    return true;
                }
                return false;
            }
        },
        diplomacy: {
            id: 'tech-diplomacy',
            title: loc('tech_diplomacy'),
            desc: loc('tech_diplomacy_desc'),
            category: 'market',
            era: 'discovery',
            reqs: { trade: 1, high_tech: 1 },
            grant: ['trade',2],
            cost: {
                Knowledge(){ return 16200; }
            },
            effect: loc('tech_diplomacy_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        freight: {
            id: 'tech-freight',
            title: loc('tech_freight'),
            desc: loc('tech_freight_desc'),
            category: 'market',
            era: 'industrialized',
            reqs: { trade: 2, high_tech: 3 },
            grant: ['trade',3],
            cost: {
                Knowledge(){ return 37800; }
            },
            effect: loc('tech_freight_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['high_tech'] >= 6) {
                        let tech = $(this)[0].grant[0];
                        global.tech[tech] = $(this)[0].grant[1];
                        arpa('Physics');
                    }
                    return true;
                }
                return false;
            }
        },
        wharf: {
            id: 'tech-wharf',
            title: loc('tech_wharf'),
            desc: loc('tech_wharf_desc'),
            category: 'market',
            era: 'industrialized',
            reqs: { trade: 1, high_tech: 3, oil: 1 },
            not_trait: ['thalassophobia'],
            grant: ['wharf',1],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect: loc('tech_wharf_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['wharf'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        banking: {
            id: 'tech-banking',
            title: loc('tech_banking'),
            desc: loc('tech_banking_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { currency: 1 },
            grant: ['banking',1],
            cost: {
                Knowledge(){ return 90; }
            },
            effect: loc('tech_banking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['bank'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        investing: {
            id: 'tech-investing',
            title: loc('tech_investing'),
            desc: loc('tech_investing_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 1 },
            grant: ['banking',2],
            cost: {
                Money(){ return 2500; },
                Knowledge(){ return 900; }
            },
            effect: loc('tech_investing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.banker.display = true;
                    return true;
                }
                return false;
            }
        },
        vault: {
            id: 'tech-vault',
            title: loc('tech_vault'),
            desc: loc('tech_vault_desc'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 2, cement: 1 },
            grant: ['banking',3],
            cost: {
                Money(){ return 2000; },
                Knowledge(){ return 3600; },
                Iron(){ return 500; },
                Cement(){ return 750; }
            },
            effect: loc('tech_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bonds: {
            id: 'tech-bonds',
            title: loc('tech_bonds'),
            desc: loc('tech_bonds'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 3 },
            grant: ['banking',4],
            cost: {
                Money(){ return 20000; },
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_bonds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_vault: {
            id: 'tech-steel_vault',
            title: loc('tech_steel_vault'),
            desc: loc('tech_steel_vault'),
            category: 'banking',
            era: 'civilized',
            reqs: { banking: 4, smelting: 2 },
            grant: ['banking',5],
            cost: {
                Money(){ return 30000; },
                Knowledge(){ return 6750; },
                Steel(){ return 3000; }
            },
            effect: loc('tech_steel_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        eebonds: {
            id: 'tech-eebonds',
            title: loc('tech_eebonds'),
            desc: loc('tech_eebonds'),
            category: 'banking',
            era: 'discovery',
            reqs: { banking: 5, high_tech: 1 },
            grant: ['banking',6],
            cost: {
                Money(){ return 75000; },
                Knowledge(){ return 18000; }
            },
            effect: loc('tech_eebonds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swiss_banking: {
            id: 'tech-swiss_banking',
            title: loc('tech_swiss_banking'),
            desc: loc('tech_swiss_banking'),
            category: 'banking',
            era: 'industrialized',
            reqs: { banking: 6 },
            grant: ['banking',7],
            cost: {
                Money(){ return 125000; },
                Knowledge(){ return 45000; }
            },
            effect: loc('tech_swiss_banking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        safety_deposit: {
            id: 'tech-safety_deposit',
            title: loc('tech_safety_deposit'),
            desc: loc('tech_safety_deposit'),
            category: 'banking',
            era: 'globalized',
            reqs: { banking: 7, high_tech: 4 },
            grant: ['banking',8],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 67500; }
            },
            effect: loc('tech_safety_deposit_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stock_market: {
            id: 'tech-stock_market',
            title: loc('tech_stock_market'),
            desc: loc('tech_stock_market'),
            category: 'arpa',
            era: 'globalized',
            reqs: { banking: 8, high_tech: 6 },
            grant: ['banking',9],
            cost: {
                Money(){ return 325000; },
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_stock_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        hedge_funds: {
            id: 'tech-hedge_funds',
            title: loc('tech_hedge_funds'),
            desc: loc('tech_hedge_funds'),
            category: 'banking',
            era: 'early_space',
            reqs: { banking: 9, stock_exchange: 1 },
            grant: ['banking',10],
            cost: {
                Money(){ return 375000; },
                Knowledge(){ return 126000; }
            },
            effect: loc('tech_hedge_funds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        four_oh_one: {
            id: 'tech-four_oh_one',
            title: loc('tech_four_oh_one'),
            desc: loc('tech_four_oh_one'),
            category: 'banking',
            era: 'early_space',
            reqs: { banking: 10 },
            grant: ['banking',11],
            cost: {
                Money(){ return 425000; },
                Knowledge(){ return 144000; }
            },
            effect: loc('tech_four_oh_one_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_four_oh_one_flair');
            }
        },
        exchange: {
            id: 'tech-exchange',
            title: loc('tech_exchange'),
            desc: loc('tech_exchange'),
            category: 'banking',
            era: 'interstellar',
            reqs: { banking: 11, alpha: 2, graphene: 1 },
            grant: ['banking',12],
            cost: {
                Money(){ return 1000000; },
                Knowledge(){ return 675000; }
            },
            effect: loc('tech_exchange_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['exchange'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        foreign_investment: {
            id: 'tech-foreign_investment',
            title: loc('tech_foreign_investment'),
            desc: loc('tech_foreign_investment'),
            category: 'banking',
            era: 'intergalactic',
            reqs: { banking: 12, xeno: 10 },
            grant: ['banking',13],
            cost: {
                Money(){ return 100000000; },
                Knowledge(){ return 8000000; }
            },
            effect: loc('tech_foreign_investment_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_vault: {
            id: 'tech-mythril_vault',
            title: loc('tech_mythril_vault'),
            desc: loc('tech_mythril_vault'),
            category: 'banking',
            era: 'early_space',
            reqs: { banking: 5, space: 3 },
            grant: ['vault',1],
            cost: {
                Money(){ return 500000; },
                Knowledge(){ return 150000; },
                Mythril(){ return 750; }
            },
            effect: loc('tech_mythril_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        neutronium_vault: {
            id: 'tech-neutronium_vault',
            title: loc('tech_neutronium_vault'),
            desc: loc('tech_neutronium_vault'),
            category: 'banking',
            era: 'deep_space',
            reqs: { vault: 1, gas_moon: 1 },
            grant: ['vault',2],
            cost: {
                Money(){ return 750000; },
                Knowledge(){ return 280000; },
                Neutronium(){ return 650; }
            },
            effect: loc('tech_neutronium_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_vault: {
            id: 'tech-adamantite_vault',
            title: loc('tech_adamantite_vault'),
            desc: loc('tech_adamantite_vault'),
            category: 'banking',
            era: 'interstellar',
            reqs: { vault: 2, alpha: 2 },
            grant: ['vault',3],
            cost: {
                Money(){ return 2000000; },
                Knowledge(){ return 560000; },
                Adamantite(){ return 20000; }
            },
            effect: loc('tech_adamantite_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        graphene_vault: {
            id: 'tech-graphene_vault',
            title: loc('tech_graphene_vault'),
            desc: loc('tech_graphene_vault'),
            category: 'banking',
            era: 'interstellar',
            reqs: { vault: 3, graphene: 1 },
            grant: ['vault',4],
            cost: {
                Money(){ return 3000000; },
                Knowledge(){ return 750000; },
                Graphene(){ return 400000; }
            },
            effect: loc('tech_graphene_vault_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        home_safe: {
            id: 'tech-home_safe',
            title: loc('tech_home_safe'),
            desc: loc('tech_home_safe'),
            category: 'banking',
            era: 'discovery',
            reqs: { banking: 5 },
            grant: ['home_safe',1],
            cost: {
                Money(){ return 42000; },
                Knowledge(){ return 8000; },
                Steel(){ return 4500; }
            },
            effect: loc('tech_home_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fire_proof_safe: {
            id: 'tech-fire_proof_safe',
            title: loc('tech_fire_proof_safe'),
            desc: loc('tech_fire_proof_safe'),
            category: 'banking',
            era: 'early_space',
            reqs: { home_safe: 1, space: 3 },
            grant: ['home_safe',2],
            cost: {
                Money(){ return 250000; },
                Knowledge(){ return 120000; },
                Iridium(){ return 1000; }
            },
            effect: loc('tech_fire_proof_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tamper_proof_safe: {
            id: 'tech-tamper_proof_safe',
            title: loc('tech_tamper_proof_safe'),
            desc: loc('tech_tamper_proof_safe'),
            category: 'banking',
            era: 'interstellar',
            reqs: { home_safe: 2, infernite: 1 },
            grant: ['home_safe',3],
            cost: {
                Money(){ return 2500000; },
                Knowledge(){ return 600000; },
                Infernite(){ return 800; }
            },
            effect: loc('tech_tamper_proof_safe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        monument: {
            id: 'tech-monument',
            title: loc('tech_monument'),
            desc: loc('tech_monument'),
            category: 'arpa',
            era: 'globalized',
            reqs: { high_tech: 6 },
            grant: ['monument',1],
            cost: {
                Knowledge(){ return 120000; }
            },
            effect: loc('tech_monument_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa['m_type'] = arpa('Monument');
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        tourism: {
            id: 'tech-tourism',
            title: loc('tech_tourism'),
            desc: loc('tech_tourism'),
            category: 'banking',
            era: 'early_space',
            reqs: { monuments: 2 },
            not_trait: ['cataclysm'],
            grant: ['monument',2],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: loc('tech_tourism_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['tourist_center'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        xeno_tourism: {
            id: 'tech-xeno_tourism',
            title: loc('tech_xeno_tourism'),
            desc: loc('tech_xeno_tourism'),
            category: 'banking',
            era: 'intergalactic',
            reqs: { monuments: 2, xeno: 10 },
            not_trait: ['cataclysm'],
            grant: ['monument',3],
            cost: {
                Knowledge(){ return 8000000; }
            },
            effect: loc('tech_xeno_tourism_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        science: {
            id: 'tech-science',
            title: loc('tech_science'),
            desc: loc('tech_science_desc'),
            category: 'science',
            era: 'civilized',
            reqs: { housing: 1 },
            grant: ['science',1],
            cost: {
                Knowledge(){ return 65; }
            },
            effect: loc('tech_science_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['university'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        library: {
            id: 'tech-library',
            title: loc('tech_library'),
            desc: loc('tech_library_desc'),
            category: 'science',
            era: 'civilized',
            reqs: { science: 1, cement: 1 },
            grant: ['science',2],
            cost: {
                Knowledge(){ return 720; }
            },
            effect: loc('tech_library_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['library'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        thesis: {
            id: 'tech-thesis',
            title: loc('tech_thesis'),
            desc: loc('tech_thesis_desc'),
            category: 'science',
            era: 'civilized',
            reqs: { science: 2 },
            grant: ['science',3],
            cost: {
                Knowledge(){ return 1125; }
            },
            effect: loc('tech_thesis_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        research_grant: {
            id: 'tech-research_grant',
            title: loc('tech_research_grant'),
            desc: loc('tech_research_grant_desc'),
            category: 'science',
            era: 'civilized',
            reqs: { science: 3 },
            grant: ['science',4],
            cost: {
                Knowledge(){ return 3240; }
            },
            effect: loc('tech_research_grant_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        scientific_journal: {
            id: 'tech-scientific_journal',
            title: loc('tech_scientific_journal'),
            desc: loc('tech_scientific_journal_desc'),
            category: 'science',
            era: 'industrialized',
            reqs: { science: 4, high_tech: 3 },
            grant: ['science',5],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: loc('tech_scientific_journal_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adjunct_professor: {
            id: 'tech-adjunct_professor',
            title: loc('tech_adjunct_professor'),
            desc: loc('tech_adjunct_professor'),
            category: 'science',
            era: 'industrialized',
            reqs: { science: 5 },
            grant: ['science',6],
            cost: {
                Knowledge(){ return 36000; }
            },
            effect(){ return loc('tech_adjunct_professor_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tesla_coil: {
            id: 'tech-tesla_coil',
            title: loc('tech_tesla_coil'),
            desc: loc('tech_tesla_coil_desc'),
            category: 'science',
            era: 'industrialized',
            reqs: { science: 6, high_tech: 3 },
            grant: ['science',7],
            cost: {
                Knowledge(){ return 51750; }
            },
            effect(){ return loc('tech_tesla_coil_effect',[global.race['evil'] ? loc('city_babel') : loc('city_wardenclyffe')]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        internet: {
            id: 'tech-internet',
            title: loc('tech_internet'),
            desc: loc('tech_internet'),
            category: 'science',
            era: 'globalized',
            reqs: { science: 7, high_tech: 4 },
            grant: ['science',8],
            cost: {
                Knowledge(){ return 61200; }
            },
            effect: loc('tech_internet_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['toxic'] && global.race.species === 'troll'){
                        unlockAchieve('godwin');
                    }
                    return true;
                }
                return false;
            }
        },
        observatory: {
            id: 'tech-observatory',
            title: loc('tech_observatory'),
            desc: loc('tech_observatory'),
            category: 'science',
            era: 'early_space',
            reqs: { science: 8, space: 3, luna: 1 },
            grant: ['science',9],
            cost: {
                Knowledge(){ return 148000; }
            },
            effect: loc('tech_observatory_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['observatory'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        world_collider: {
            id: 'tech-world_collider',
            title: loc('tech_world_collider'),
            desc: loc('tech_world_collider'),
            category: 'science',
            era: 'deep_space',
            reqs: { science: 9, elerium: 2 },
            grant: ['science',10],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect(){ return loc('tech_world_collider_effect',[races[global.race.species].solar.dwarf]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['world_collider'] = {
                        count: 0
                    };
                    global.space['world_controller'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            },
            flair: `<div>${loc('tech_world_collider_flair1')}</div><div>${loc('tech_world_collider_flair2')}</div>`
        },
        laboratory: {
            id: 'tech-laboratory',
            title: loc('tech_laboratory'),
            desc: loc('tech_laboratory_desc'),
            category: 'science',
            era: 'interstellar',
            reqs: { science: 11, alpha: 2 },
            grant: ['science',12],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect(){ return loc('tech_laboratory_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['laboratory'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            },
            flair: loc('tech_laboratory_flair')
        },
        virtual_assistant: {
            id: 'tech-virtual_assistant',
            title: loc('tech_virtual_assistant'),
            desc: loc('tech_virtual_assistant'),
            category: 'science',
            era: 'interstellar',
            reqs: { science: 12, high_tech: 12 },
            grant: ['science',13],
            cost: {
                Knowledge(){ return 635000; }
            },
            effect(){ return loc('tech_virtual_assistant_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dimensional_readings: {
            id: 'tech-dimensional_readings',
            title: loc('tech_dimensional_readings'),
            desc: loc('tech_dimensional_readings'),
            category: 'science',
            era: 'interstellar',
            reqs: { science: 13, infernite: 2 },
            grant: ['science',14],
            cost: {
                Knowledge(){ return 750000; }
            },
            effect(){ return loc('tech_dimensional_readings_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_entanglement: {
            id: 'tech-quantum_entanglement',
            title: loc('tech_quantum_entanglement'),
            desc: loc('tech_quantum_entanglement'),
            category: 'science',
            era: 'interstellar',
            reqs: { science: 14, neutron: 1 },
            grant: ['science',15],
            cost: {
                Knowledge(){ return 850000; },
                Neutronium(){ return 7500; },
                Soul_Gem(){ return 2; }
            },
            effect(){ return loc('tech_quantum_entanglement_effect',[2]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        expedition: {
            id: 'tech-expedition',
            title: loc('tech_expedition'),
            desc: loc('tech_expedition'),
            category: 'science',
            era: 'intergalactic',
            reqs: { science: 15, xeno: 4 },
            grant: ['science',16],
            cost: {
                Knowledge(){ return 5350000; }
            },
            effect(){ return loc('tech_expedition_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        subspace_sensors: {
            id: 'tech-subspace_sensors',
            title: loc('tech_subspace_sensors'),
            desc: loc('tech_subspace_sensors'),
            category: 'science',
            era: 'intergalactic',
            reqs: { science: 16, high_tech: 16 },
            grant: ['science',17],
            cost: {
                Knowledge(){ return 6000000; }
            },
            effect(){ return loc('tech_subspace_sensors_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alien_database: {
            id: 'tech-alien_database',
            title: loc('tech_alien_database'),
            desc: loc('tech_alien_database'),
            category: 'progress',
            era: 'intergalactic',
            reqs: { science: 17, conflict: 5 },
            grant: ['science',18],
            cost: {
                Knowledge(){ return 8250000; }
            },
            effect(){ return loc('tech_alien_database_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        orichalcum_capacitor: {
            id: 'tech-orichalcum_capacitor',
            title: loc('tech_orichalcum_capacitor'),
            desc: loc('tech_orichalcum_capacitor'),
            category: 'science',
            era: 'intergalactic',
            reqs: { science: 18, high_tech: 17 },
            grant: ['science',19],
            cost: {
                Knowledge(){ return 12500000; },
                Orichalcum(){ return 250000; }
            },
            effect(){ return loc('tech_orichalcum_capacitor_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bioscience: {
            id: 'tech-bioscience',
            title: loc('tech_bioscience'),
            desc: loc('tech_bioscience_desc'),
            category: 'science',
            era: 'globalized',
            reqs: { science: 8 },
            grant: ['genetics',1],
            cost: {
                Knowledge(){ return 67500; }
            },
            effect: loc('tech_bioscience_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['biolab'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genetics: {
            id: 'tech-genetics',
            title: loc('tech_genetics'),
            desc: loc('tech_genetics'),
            category: 'arpa',
            era: 'globalized',
            reqs: { genetics: 1, high_tech: 6 },
            grant: ['genetics',2],
            cost: {
                Knowledge(){ return 108000; }
            },
            effect: loc('tech_genetics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.settings.arpa.genetics = true;
                    if (global.race['cataclysm']){
                        global.arpa.sequence.on = false;
                    }
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        crispr: {
            id: 'tech-crispr',
            title: loc('tech_crispr'),
            desc: loc('tech_crispr'),
            category: 'genes',
            era: 'globalized',
            reqs: { genetics: 3 },
            grant: ['genetics',4],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_crispr_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.settings.arpa.crispr = true;
                    global.settings.arpa.arpaTabs = 2;
                    arpa('Genetics');
                    arpa('Crispr');
                    return true;
                }
                return false;
            }
        },
        shotgun_sequencing: {
            id: 'tech-shotgun_sequencing',
            title: loc('tech_shotgun_sequencing'),
            desc: loc('tech_shotgun_sequencing_desc'),
            category: 'genes',
            era: 'early_space',
            reqs: { genetics: 4 },
            grant: ['genetics',5],
            cost: {
                Knowledge(){ return 165000; }
            },
            effect: loc('tech_shotgun_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa.sequence.boost = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        de_novo_sequencing: {
            id: 'tech-de_novo_sequencing',
            title: loc('tech_de_novo_sequencing'),
            desc: loc('tech_de_novo_sequencing'),
            category: 'genes',
            era: 'early_space',
            reqs: { genetics: 5 },
            grant: ['genetics',6],
            cost: {
                Knowledge(){ return 220000; }
            },
            effect: loc('tech_de_novo_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Genes.display = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        dna_sequencer: {
            id: 'tech-dna_sequencer',
            title: loc('tech_dna_sequencer'),
            desc: loc('tech_dna_sequencer'),
            category: 'genes',
            era: 'deep_space',
            reqs: { genetics: 6 },
            grant: ['genetics',7],
            cost: {
                Knowledge(){ return 300000; }
            },
            effect: loc('tech_dna_sequencer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.arpa.sequence.auto = true;
                    arpa('Genetics');
                    return true;
                }
                return false;
            }
        },
        rapid_sequencing: {
            id: 'tech-rapid_sequencing',
            title: loc('tech_rapid_sequencing'),
            desc: loc('tech_rapid_sequencing'),
            category: 'genes',
            era: 'interstellar',
            reqs: { genetics: 7, high_tech: 12 },
            grant: ['genetics',8],
            cost: {
                Knowledge(){ return 800000; }
            },
            effect: loc('tech_rapid_sequencing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mad_science: {
            id: 'tech-mad_science',
            title: loc('tech_mad_science'),
            desc: loc('tech_mad_science'),
            category: 'science',
            era: 'discovery',
            reqs: { science: 2, smelting: 2 },
            grant: ['high_tech',1],
            cost: {
                Money(){ return 10000; },
                Knowledge(){ return 6750; },
                Aluminium(){ return 1000; }
            },
            effect: loc('tech_mad_science_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['terrifying']){
                        global.civic['taxes'].display = true;
                    }
                    global.city['wardenclyffe'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        electricity: {
            id: 'tech-electricity',
            title: loc('tech_electricity'),
            desc: loc('tech_electricity'),
            category: 'power_generation',
            era: 'discovery',
            reqs: { high_tech: 1 },
            grant: ['high_tech',2],
            cost: {
                Knowledge(){ return 13500; },
                Copper(){ return 1000; }
            },
            effect: loc('tech_electricity_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_electricity_msg'),'info');
                    global.city['power'] = 0;
                    global.city['powered'] = true;
                    global.city['coal_power'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        industrialization: {
            id: 'tech-industrialization',
            title: loc('tech_industrialization'),
            desc: loc('tech_industrialization'),
            category: 'progress',
            era: 'industrialized',
            reqs: { high_tech: 2, cement: 2, steel_container: 1 },
            grant: ['high_tech',3],
            cost: {
                Knowledge(){ return 25200; }
            },
            effect: loc('tech_industrialization_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Titanium.display = true;
                    global.city['factory'] = {
                        count: 0,
                        on: 0,
                        Lux: 0,
                        Furs: 0,
                        Alloy: 0,
                        Polymer: 0,
                        Nano: 0,
                        Stanene: 0
                    };
                    return true;
                }
                return false;
            }
        },
        electronics: {
            id: 'tech-electronics',
            title: loc('tech_electronics'),
            desc: loc('tech_electronics'),
            category: 'progress',
            era: 'industrialized',
            reqs: { high_tech: 3, titanium: 1 },
            grant: ['high_tech',4],
            cost: {
                Knowledge(){ return 50000; }
            },
            effect: loc('tech_electronics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['terrifying']){
                        global.tech['gambling'] = 1;
                        global.city['casino'] = { count: 0, on: 0 };
                        global.space['spc_casino'] = { count: 0, on: 0 };
                    }
                    return true;
                }
                return false;
            }
        },
        fission: {
            id: 'tech-fission',
            title: loc('tech_fission'),
            desc: loc('tech_fission'),
            category: 'progress',
            era: 'globalized',
            reqs: { high_tech: 4, uranium: 1 },
            grant: ['high_tech',5],
            cost: {
                Knowledge(){ return 77400; },
                Uranium(){ return 10; }
            },
            effect: loc('tech_fission_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_fission_msg'),'info');
                    global.city['fission_power'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        arpa: {
            id: 'tech-arpa',
            title: loc('tech_arpa'),
            desc: loc('tech_arpa_desc'),
            category: 'arpa',
            era: 'globalized',
            reqs: { high_tech: 5 },
            grant: ['high_tech',6],
            cost: {
                Knowledge(){ return 90000; }
            },
            effect: loc('tech_arpa_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showGenetics = true;
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        rocketry: {
            id: 'tech-rocketry',
            title: loc('tech_rocketry'),
            desc: loc('tech_rocketry'),
            category: 'arpa',
            era: 'globalized',
            reqs: { high_tech: 6 },
            grant: ['high_tech',7],
            cost: {
                Knowledge(){ return 112500; },
                Oil(){ return global.city.ptrait === 'dense' ? 8000 : 6800; }
            },
            effect: loc('tech_rocketry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    arpa('Physics');
                    return true;
                }
                return false;
            }
        },
        robotics: {
            id: 'tech-robotics',
            title: loc('tech_robotics'),
            desc: loc('tech_robotics'),
            category: 'progress',
            era: 'globalized',
            reqs: { high_tech: 7 },
            grant: ['high_tech',8],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_robotics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        lasers: {
            id: 'tech-lasers',
            title: loc('tech_lasers'),
            desc: loc('tech_lasers_desc'),
            category: 'progress',
            era: 'deep_space',
            reqs: { high_tech: 8, space: 3, supercollider: 1, elerium: 1 },
            grant: ['high_tech',9],
            cost: {
                Knowledge(){ return 280000; },
                Elerium(){ return 100; }
            },
            effect: loc('tech_lasers_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.race['cataclysm']){
                        unlockAchieve('iron_will',false,3);
                    }
                    return true;
                }
                return false;
            }
        },
        artifical_intelligence: {
            id: 'tech-artifical_intelligence',
            title: loc('tech_artificial_intelligence'),
            desc: loc('tech_artificial_intelligence'),
            category: 'progress',
            era: 'deep_space',
            reqs: { high_tech: 9 },
            grant: ['high_tech',10],
            cost: {
                Knowledge(){ return 325000; }
            },
            effect: loc('tech_artificial_intelligence_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_artificial_intelligence_flair');
            }
        },
        quantum_computing: {
            id: 'tech-quantum_computing',
            title: loc('tech_quantum_computing'),
            desc: loc('tech_quantum_computing'),
            category: 'progress',
            era: 'deep_space',
            reqs: { high_tech: 10, nano: 1 },
            grant: ['high_tech',11],
            cost: {
                Knowledge(){ return 435000; },
                Elerium(){ return 250 },
                Nano_Tube(){ return 100000 }
            },
            effect: loc('tech_quantum_computing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_quantum_computing_flair');
            }
        },
        virtual_reality: {
            id: 'tech-virtual_reality',
            title: loc('tech_virtual_reality'),
            desc: loc('tech_virtual_reality'),
            category: 'progress',
            era: 'interstellar',
            reqs: { high_tech: 11, alpha: 2, infernite: 1, stanene: 1 },
            grant: ['high_tech',12],
            cost: {
                Knowledge(){ return 600000; },
                Stanene(){ return 1250 },
                Soul_Gem(){ return 1 }
            },
            effect: loc('tech_virtual_reality_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_virtual_reality_flair');
            }
        },
        plasma: {
            id: 'tech-plasma',
            title: loc('tech_plasma'),
            desc: loc('tech_plasma'),
            category: 'progress',
            era: 'interstellar',
            reqs: { high_tech: 12 },
            grant: ['high_tech',13],
            cost: {
                Knowledge(){ return 755000; },
                Infernite(){ return 1000; },
                Stanene(){ return 250000 }
            },
            effect: loc('tech_plasma_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        shields: {
            id: 'tech-shields',
            title: loc('tech_shields'),
            desc: loc('tech_shields'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { high_tech: 13 },
            grant: ['high_tech',14],
            cost: {
                Knowledge(){ return 850000; },
            },
            effect: loc('tech_shields_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.neutron = true;
                    global.settings.space.blackhole = true;
                    return true;
                }
                return false;
            }
        },
        ai_core: {
            id: 'tech-ai_core',
            title: loc('tech_ai_core'),
            desc: loc('tech_ai_core'),
            category: 'ai_core',
            era: 'interstellar',
            reqs: { high_tech: 14, science: 15, blackhole: 3 },
            grant: ['high_tech',15],
            cost: {
                Knowledge(){ return 1500000; },
            },
            effect: loc('tech_ai_core_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['citadel'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        metaphysics: {
            id: 'tech-metaphysics',
            title: loc('tech_metaphysics'),
            desc: loc('tech_metaphysics'),
            category: 'progress',
            era: 'intergalactic',
            reqs: { high_tech: 15, xeno: 5 },
            grant: ['high_tech',16],
            cost: {
                Knowledge(){ return 5000000; },
                Vitreloy(){ return 10000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return loc('tech_metaphysics_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        orichalcum_analysis: {
            id: 'tech-orichalcum_analysis',
            title: loc('tech_orichalcum_analysis'),
            desc: loc('tech_orichalcum_analysis'),
            category: 'progress',
            era: 'intergalactic',
            reqs: { high_tech: 16, chthonian: 3 },
            grant: ['high_tech',17],
            cost: {
                Knowledge(){ return 12200000; },
                Orichalcum(){ return 100000; }
            },
            effect(){ return loc('tech_orichalcum_analysis_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_orichalcum_analysis_result'),'info');
                    return true;
                }
                return false;
            }
        },
        incorporeal: {
            id: 'tech-incorporeal',
            title: loc('tech_incorporeal'),
            desc: loc('tech_incorporeal'),
            category: 'special',
            era: 'intergalactic',
            reqs: { science: 19 },
            grant: ['ascension',1],
            cost: {
                Knowledge(){ return 17500000; },
                Phage(){ return 25; }
            },
            effect(){ return loc('tech_incorporeal_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tech_ascension: {
            id: 'tech-tech_ascension',
            title: loc('tech_ascension'),
            desc: loc('tech_ascension'),
            category: 'special',
            era: 'intergalactic',
            reqs: { ascension: 1 },
            grant: ['ascension',2],
            cost: {
                Knowledge(){ return 18500000; },
                Plasmid(){ return 100; }
            },
            effect(){ return loc('tech_ascension_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.sirius = true;
                    return true;
                }
                return false;
            }
        },
        cement_processing: {
            id: 'tech-cement_processing',
            title: loc('tech_cement_processing'),
            desc: loc('tech_cement_processing'),
            category: 'ai_core',
            era: 'interstellar',
            reqs: { high_tech: 15 },
            grant: ['ai_core',1],
            cost: {
                Knowledge(){ return 1750000; },
            },
            effect: loc('tech_cement_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_processing: {
            id: 'tech-adamantite_processing',
            title: loc('tech_adamantite_processing'),
            desc: loc('tech_adamantite_processing'),
            category: 'ai_core',
            era: 'interstellar',
            reqs: { ai_core: 1 },
            grant: ['ai_core',2],
            cost: {
                Knowledge(){ return 2000000; },
            },
            effect: loc('tech_adamantite_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        graphene_processing: {
            id: 'tech-graphene_processing',
            title: loc('tech_graphene_processing'),
            desc: loc('tech_graphene_processing'),
            category: 'ai_core',
            era: 'intergalactic',
            reqs: { ai_core: 2 },
            grant: ['ai_core',3],
            cost: {
                Knowledge(){ return 2500000; },
            },
            effect: loc('tech_graphene_processing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fusion_power: {
            id: 'tech-fusion_power',
            title: loc('tech_fusion_power'),
            desc: loc('tech_fusion_power'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { ram_scoop: 1 },
            grant: ['fusion',1],
            cost: {
                Knowledge(){ return 640000; }
            },
            effect: loc('tech_fusion_power_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['fusion'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        thermomechanics: {
            id: 'tech-thermomechanics',
            title: loc('tech_thermomechanics'),
            desc: loc('tech_thermomechanics_desc'),
            category: 'crafting',
            era: 'industrialized',
            reqs: { high_tech: 4 },
            grant: ['alloy',1],
            cost: {
                Knowledge(){ return 60000; },
            },
            effect(){ return loc('tech_thermomechanics_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_manufacturing: {
            id: 'tech-quantum_manufacturing',
            title: loc('tech_quantum_manufacturing'),
            desc: loc('tech_quantum_manufacturing'),
            category: 'crafting',
            era: 'deep_space',
            reqs: { high_tech: 11 },
            grant: ['q_factory',1],
            cost: {
                Knowledge(){ return 465000; }
            },
            effect: loc('tech_quantum_manufacturing_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        worker_drone: {
            id: 'tech-worker_drone',
            title: loc('tech_worker_drone'),
            desc: loc('tech_worker_drone'),
            category: 'mining',
            era: 'deep_space',
            reqs: { nano: 1 },
            grant: ['drone',1],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect(){ return loc('tech_worker_drone_effect',[races[global.race.species].solar.gas_moon]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['drone'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        uranium: {
            id: 'tech-uranium',
            title: loc('tech_uranium'),
            desc: loc('tech_uranium'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { high_tech: 4 },
            grant: ['uranium',1],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: loc('tech_uranium_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Uranium.display = true;
                    return true;
                }
                return false;
            }
        },
        uranium_storage: {
            id: 'tech-uranium_storage',
            title: loc('tech_uranium_storage'),
            desc: loc('tech_uranium_storage'),
            category: 'storage',
            era: 'globalized',
            reqs: { uranium: 1 },
            grant: ['uranium',2],
            cost: {
                Knowledge(){ return 75600; },
                Alloy(){ return 2500; }
            },
            effect: loc('tech_uranium_storage_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        uranium_ash: {
            id: 'tech-uranium_ash',
            title: loc('tech_uranium_ash'),
            desc: loc('tech_uranium_ash'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { uranium: 2 },
            grant: ['uranium',3],
            cost: {
                Knowledge(){ return 122000; }
            },
            effect: loc('tech_uranium_ash_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        breeder_reactor: {
            id: 'tech-breeder_reactor',
            title: loc('tech_breeder_reactor'),
            desc: loc('tech_breeder_reactor'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { high_tech: 5, uranium: 3, space: 3 },
            grant: ['uranium',4],
            cost: {
                Knowledge(){ return 160000; },
                Uranium(){ return 250; },
                Iridium(){ return 1000; }
            },
            effect: loc('tech_breeder_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mine_conveyor: {
            id: 'tech-mine_conveyor',
            title: loc('tech_mine_conveyor'),
            desc: loc('tech_mine_conveyor'),
            category: 'mining',
            era: 'discovery',
            reqs: { high_tech: 2 },
            grant: ['mine_conveyor',1],
            cost: {
                Knowledge(){ return 16200; },
                Copper(){ return 2250; },
                Steel(){ return 1750; }
            },
            effect: loc('tech_mine_conveyor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        oil_well: {
            id: 'tech-oil_well',
            title: loc('tech_oil_well'),
            desc: loc('tech_oil_well'),
            category: 'power_generation',
            era: 'industrialized',
            reqs: { high_tech: 3 },
            grant: ['oil',1],
            cost: {
                Knowledge(){ return 27000; }
            },
            effect: loc('tech_oil_well_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_well'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_depot: {
            id: 'tech-oil_depot',
            title: loc('tech_oil_depot'),
            desc: loc('tech_oil_depot'),
            category: 'storage',
            era: 'industrialized',
            reqs: { oil: 1 },
            grant: ['oil',2],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_oil_depot_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        oil_power: {
            id: 'tech-oil_power',
            title(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
            },
            desc(){
                return global.race['environmentalist'] ? loc('city_wind_power') : loc('tech_oil_power');
            },
            category: 'power_generation',
            era: 'industrialized',
            reqs: { oil: 2 },
            grant: ['oil',3],
            cost: {
                Knowledge(){ return 44000; }
            },
            effect(){
                return global.race['environmentalist'] ? loc('tech_wind_power_effect') : loc('tech_oil_power_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['oil_power'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        titanium_drills: {
            id: 'tech-titanium_drills',
            title: loc('tech_titanium_drills'),
            desc: loc('tech_titanium_drills'),
            category: 'power_generation',
            era: 'industrialized',
            reqs: { oil: 3 },
            grant: ['oil',4],
            cost: {
                Knowledge(){ return 54000; },
                Titanium(){ return 3500; }
            },
            effect: loc('tech_titanium_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_drills: {
            id: 'tech-alloy_drills',
            title: loc('tech_alloy_drills'),
            desc: loc('tech_alloy_drills'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { oil: 4 },
            grant: ['oil',5],
            cost: {
                Knowledge(){ return 77000; },
                Alloy(){ return 1000; }
            },
            effect: loc('tech_alloy_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fracking: {
            id: 'tech-fracking',
            title: loc('tech_fracking'),
            desc: loc('tech_fracking'),
            category: 'power_generation',
            era: 'globalized',
            reqs: { oil: 5, high_tech: 6 },
            grant: ['oil',6],
            cost: {
                Knowledge(){ return 132000; }
            },
            effect: loc('tech_fracking_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_drills: {
            id: 'tech-mythril_drills',
            title: loc('tech_mythril_drills'),
            desc: loc('tech_mythril_drills'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { oil: 6, space: 3 },
            grant: ['oil',7],
            cost: {
                Knowledge(){ return 165000; },
                Mythril(){ return 100; }
            },
            effect: loc('tech_mythril_drills_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mass_driver: {
            id: 'tech-mass_driver',
            title: loc('tech_mass_driver'),
            desc: loc('tech_mass_driver'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { oil: 6, space: 3 },
            grant: ['mass',1],
            cost: {
                Knowledge(){ return 160000; }
            },
            effect: loc('tech_mass_driver_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['mass_driver'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        orichalcum_driver: {
            id: 'tech-orichalcum_driver',
            title: loc('tech_orichalcum_driver'),
            desc: loc('tech_orichalcum_driver'),
            category: 'science',
            era: 'intergalactic',
            reqs: { mass: 1, science: 19 },
            grant: ['mass',2],
            cost: {
                Knowledge(){ return 14000000; },
                Orichalcum(){ return 400000; }
            },
            effect(){ return loc('tech_orichalcum_driver_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        polymer: {
            id: 'tech-polymer',
            title: loc('tech_polymer'),
            desc: loc('tech_polymer'),
            category: 'crafting',
            era: 'globalized',
            reqs: { genetics: 1 },
            grant: ['polymer',1],
            cost: {
                Knowledge(){ return 80000; },
                Oil(){ return 5000; },
                Alloy(){ return 450; }
            },
            effect: loc('tech_polymer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Polymer.display = true;
                    messageQueue(loc('tech_polymer_avail'),'info');
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        fluidized_bed_reactor: {
            id: 'tech-fluidized_bed_reactor',
            title: loc('tech_fluidized_bed_reactor'),
            desc: loc('tech_fluidized_bed_reactor'),
            category: 'crafting',
            era: 'globalized',
            reqs: { polymer: 1, high_tech: 6 },
            grant: ['polymer',2],
            cost: {
                Knowledge(){ return 99000; }
            },
            effect: loc('tech_fluidized_bed_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        synthetic_fur: {
            id: 'tech-synthetic_fur',
            title(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
            desc(){ return global.race['evil'] ? loc('tech_faux_leather') : loc('tech_synthetic_fur'); },
            category: 'crafting',
            era: 'globalized',
            reqs: { polymer: 1 },
            grant: ['synthetic_fur',1],
            cost: {
                Knowledge(){ return 100000; },
                Polymer(){ return 2500; }
            },
            effect(){ return global.race['evil'] ? loc('tech_faux_leather_effect') : loc('tech_synthetic_fur_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        nanoweave: {
            id: 'tech-nanoweave',
            title: loc('tech_nanoweave'),
            desc: loc('tech_nanoweave'),
            category: 'crafting',
            era: 'intergalactic',
            reqs: { science: 18 },
            grant: ['nanoweave',1],
            cost: {
                Knowledge(){ return 8500000; },
                Nano_Tube(){ return 5000000; },
                Vitreloy(){ return 250000; },
            },
            effect: loc('tech_nanoweave_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Nanoweave.display = true;
                    messageQueue(loc('tech_nanoweave_avail'),'info');
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        stanene: {
            id: 'tech-stanene',
            title: loc('tech_stanene'),
            desc: loc('tech_stanene'),
            category: 'crafting',
            era: 'interstellar',
            reqs: { infernite: 1 },
            grant: ['stanene',1],
            cost: {
                Knowledge(){ return 590000; },
                Aluminium(){ return 500000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_stanene_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Stanene.display = true;
                    messageQueue(loc('tech_stanene_avail'),'info');
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        nano_tubes: {
            id: 'tech-nano_tubes',
            title: loc('tech_nano_tubes'),
            desc: loc('tech_nano_tubes'),
            category: 'crafting',
            era: 'deep_space',
            reqs: { high_tech: 10 },
            grant: ['nano',1],
            cost: {
                Knowledge(){ return 375000; },
                Coal(){ return 100000; },
                Neutronium(){ return 1000; }
            },
            effect: loc('tech_nano_tubes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.resource.Nano_Tube.display = true;
                    global.city.factory['Nano'] = 0;
                    messageQueue(loc('tech_nano_tubes_msg'),'info');
                    defineIndustry();
                    return true;
                }
                return false;
            }
        },
        reclaimer: {
            id: 'tech-reclaimer',
            title: loc('tech_reclaimer'),
            desc: loc('tech_reclaimer_desc'),
            category: 'reclaimer',
            era: 'civilized',
            reqs: { primitive: 3 },
            grant: ['reclaimer',1],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 45; },
                Lumber(){ return 20; },
                Stone(){ return 20; }
            },
            effect: loc('tech_reclaimer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.lumberjack.name = loc('job_reclaimer');
                    global.civic.lumberjack.display = true;
                    global.city['graveyard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        shovel: {
            id: 'tech-shovel',
            title: loc('tech_shovel'),
            desc: loc('tech_shovel'),
            category: 'reclaimer',
            era: 'civilized',
            reqs: { reclaimer: 1, mining: 2 },
            grant: ['reclaimer',2],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_shovel: {
            id: 'tech-iron_shovel',
            title: loc('tech_iron_shovel'),
            desc: loc('tech_iron_shovel'),
            category: 'reclaimer',
            era: 'civilized',
            reqs: { reclaimer: 2, mining: 3 },
            grant: ['reclaimer',3],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_shovel: {
            id: 'tech-steel_shovel',
            title: loc('tech_steel_shovel'),
            desc: loc('tech_steel_shovel'),
            category: 'reclaimer',
            era: 'discovery',
            reqs: { reclaimer: 3, smelting: 2 },
            grant: ['reclaimer',4],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_shovel: {
            id: 'tech-titanium_shovel',
            title: loc('tech_titanium_shovel'),
            desc: loc('tech_titanium_shovel'),
            category: 'reclaimer',
            era: 'industrialized',
            reqs: { reclaimer: 4, high_tech: 3 },
            grant: ['reclaimer',5],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 38000; },
                Titanium(){ return 350; }
            },
            effect: loc('tech_titanium_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        alloy_shovel: {
            id: 'tech-alloy_shovel',
            title: loc('tech_alloy_shovel'),
            desc: loc('tech_alloy_shovel'),
            category: 'reclaimer',
            era: 'globalized',
            reqs: { reclaimer: 5, high_tech: 4 },
            grant: ['reclaimer',6],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 67500; },
                Alloy(){ return 750; }
            },
            effect: loc('tech_alloy_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mythril_shovel: {
            id: 'tech-mythril_shovel',
            title: loc('tech_mythril_shovel'),
            desc: loc('tech_mythril_shovel'),
            category: 'reclaimer',
            era: 'early_space',
            reqs: { reclaimer: 6, space: 3 },
            grant: ['reclaimer',7],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 160000; },
                Mythril(){ return 880; }
            },
            effect: loc('tech_mythril_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_shovel: {
            id: 'tech-adamantite_shovel',
            title: loc('tech_adamantite_shovel'),
            desc: loc('tech_adamantite_shovel'),
            category: 'reclaimer',
            era: 'interstellar',
            reqs: { reclaimer: 7, alpha: 2 },
            grant: ['reclaimer',8],
            trait: ['evil'],
            condition(){
                return global.race.species === 'wendigo' ? true : global.race['kindling_kindred'] || global.race['soul_eater'] ? false : true;
            },
            cost: {
                Knowledge(){ return 525000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_adamantite_shovel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        stone_axe: {
            id: 'tech-stone_axe',
            title: loc('tech_stone_axe'),
            desc: loc('tech_stone_axe_desc'),
            category: 'lumber_gathering',
            reqs: { primitive: 3 },
            era: 'civilized',
            grant: ['axe',1],
            not_trait: ['kindling_kindred','evil','cataclysm'],
            cost: {
                Knowledge(){ return 45; },
                Lumber(){ return 20; },
                Stone(){ return 20; }
            },
            effect(){ return global.race['sappy'] ? loc('tech_amber_axe_effect') : loc('tech_stone_axe_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.lumberjack.display = true;
                    global.city['lumber_yard'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        copper_axes: {
            id: 'tech-copper_axes',
            title: loc('tech_copper_axes'),
            desc: loc('tech_copper_axes_desc'),
            category: 'lumber_gathering',
            era: 'civilized',
            reqs: { axe: 1, mining: 2 },
            grant: ['axe',2],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_saw: {
            id: 'tech-iron_saw',
            title: loc('tech_iron_saw'),
            desc: loc('tech_iron_saw_desc'),
            category: 'lumber_gathering',
            era: 'civilized',
            reqs: { axe: 1, mining: 3 },
            grant: ['saw',1],
            cost: {
                Knowledge(){ return 3375; },
                Iron(){ return 400; }
            },
            effect: loc('tech_iron_saw_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['sawmill'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        steel_saw: {
            id: 'tech-steel_saw',
            title: loc('tech_steel_saw'),
            desc: loc('tech_steel_saw_desc'),
            category: 'lumber_gathering',
            era: 'discovery',
            reqs: { smelting: 2, saw: 1 },
            grant: ['saw',2],
            cost: {
                Knowledge(){ return 10800; },
                Steel(){ return 400; }
            },
            effect: loc('tech_steel_saw_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_axes: {
            id: 'tech-iron_axes',
            title: loc('tech_iron_axes'),
            desc: loc('tech_iron_axes_desc'),
            category: 'lumber_gathering',
            era: 'civilized',
            reqs: { axe: 2, mining: 3 },
            grant: ['axe',3],
            cost: {
                Knowledge(){ return global.city.ptrait === 'unstable' ? 1350 : 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_axes: {
            id: 'tech-steel_axes',
            title: loc('tech_steel_axes'),
            desc: loc('tech_steel_axes_desc'),
            category: 'lumber_gathering',
            era: 'discovery',
            reqs: { axe: 3, smelting: 2 },
            grant: ['axe',4],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_axes: {
            id: 'tech-titanium_axes',
            title: loc('tech_titanium_axes'),
            desc: loc('tech_titanium_axes_desc'),
            category: 'lumber_gathering',
            era: 'industrialized',
            reqs: { axe: 4, high_tech: 3 },
            grant: ['axe',5],
            cost: {
                Knowledge(){ return 38000; },
                Titanium(){ return 350; }
            },
            effect: loc('tech_titanium_axes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        chainsaws: {
            id: 'tech-chainsaws',
            title: loc('tech_chainsaws'),
            desc: loc('tech_chainsaws_desc'),
            category: 'lumber_gathering',
            era: 'interstellar',
            reqs: { axe: 5, alpha: 2 },
            grant: ['axe',6],
            cost: {
                Knowledge(){ return 560000; },
                Oil(){ return 10000; },
                Adamantite(){ return 2000; },
            },
            effect: loc('tech_chainsaws_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            },
            flair(){ return `<div>${loc('tech_chainsaws_flair1')}</div><div>${loc('tech_chainsaws_flair2')}</div>`; }
        },
        copper_sledgehammer: {
            id: 'tech-copper_sledgehammer',
            title: loc('tech_copper_sledgehammer'),
            desc: loc('tech_copper_sledgehammer_desc'),
            category: 'stone_gathering',
            era: 'civilized',
            reqs: { mining: 2 },
            not_trait: ['cataclysm','sappy'],
            grant: ['hammer',1],
            cost: {
                Knowledge(){ return 540; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_sledgehammer: {
            id: 'tech-iron_sledgehammer',
            title: loc('tech_iron_sledgehammer'),
            desc: loc('tech_iron_sledgehammer_desc'),
            category: 'stone_gathering',
            era: 'civilized',
            reqs: { hammer: 1, mining: 3 },
            not_trait: ['cataclysm','sappy'],
            grant: ['hammer',2],
            cost: {
                Knowledge(){ return global.city.ptrait === 'unstable' ? 1350 : 2700; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_sledgehammer: {
            id: 'tech-steel_sledgehammer',
            title: loc('tech_steel_sledgehammer'),
            desc: loc('tech_steel_sledgehammer_desc'),
            category: 'stone_gathering',
            era: 'discovery',
            reqs: { hammer: 2, smelting: 2 },
            not_trait: ['cataclysm','sappy'],
            grant: ['hammer',3],
            cost: {
                Knowledge(){ return 7200; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_sledgehammer: {
            id: 'tech-titanium_sledgehammer',
            title: loc('tech_titanium_sledgehammer'),
            desc: loc('tech_titanium_sledgehammer_desc'),
            category: 'stone_gathering',
            era: 'industrialized',
            reqs: { hammer: 3, high_tech: 3 },
            not_trait: ['cataclysm','sappy'],
            grant: ['hammer',4],
            cost: {
                Knowledge(){ return 40000; },
                Titanium(){ return 400; }
            },
            effect: loc('tech_titanium_sledgehammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        copper_pickaxe: {
            id: 'tech-copper_pickaxe',
            title: loc('tech_copper_pickaxe'),
            desc: loc('tech_copper_pickaxe_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { mining: 2 },
            not_trait: ['cataclysm'],
            grant: ['pickaxe',1],
            cost: {
                Knowledge(){ return 675; },
                Copper(){ return 25; }
            },
            effect: loc('tech_copper_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_pickaxe: {
            id: 'tech-iron_pickaxe',
            title: loc('tech_iron_pickaxe'),
            desc: loc('tech_iron_pickaxe_desc'),
            category: 'mining',
            era: 'civilized',
            reqs: { pickaxe: 1, mining: 3 },
            not_trait: ['cataclysm'],
            grant: ['pickaxe',2],
            cost: {
                Knowledge(){ return global.city.ptrait === 'unstable' ? 1600 : 3200; },
                Iron(){ return 250; }
            },
            effect: loc('tech_iron_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_pickaxe: {
            id: 'tech-steel_pickaxe',
            title: loc('tech_steel_pickaxe'),
            desc: loc('tech_steel_pickaxe_desc'),
            category: 'mining',
            era: 'discovery',
            reqs: { pickaxe: 2, smelting: 2},
            grant: ['pickaxe',3],
            cost: {
                Knowledge(){ return 9000; },
                Steel(){ return 250; }
            },
            effect: loc('tech_steel_pickaxe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer: {
            id: 'tech-jackhammer',
            title: loc('tech_jackhammer'),
            desc: loc('tech_jackhammer_desc'),
            category: 'mining',
            era: 'discovery',
            reqs: { pickaxe: 3, high_tech: 2},
            grant: ['pickaxe',4],
            cost: {
                Knowledge(){ return 22500; },
                Copper(){ return 5000; }
            },
            effect: loc('tech_jackhammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        jackhammer_mk2: {
            id: 'tech-jackhammer_mk2',
            title: loc('tech_jackhammer_mk2'),
            desc: loc('tech_jackhammer_mk2'),
            category: 'mining',
            era: 'globalized',
            reqs: { pickaxe: 4, high_tech: 4},
            grant: ['pickaxe',5],
            cost: {
                Knowledge(){ return 67500; },
                Titanium(){ return 2000; },
                Alloy(){ return 500; }
            },
            effect: loc('tech_jackhammer_mk2_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_hammer: {
            id: 'tech-adamantite_hammer',
            title: loc('tech_adamantite_hammer'),
            desc: loc('tech_adamantite_hammer'),
            category: 'mining',
            era: 'interstellar',
            reqs: { pickaxe: 5, alpha: 2},
            grant: ['pickaxe',6],
            cost: {
                Knowledge(){ return 535000; },
                Adamantite(){ return 12500; }
            },
            effect: loc('tech_adamantite_hammer_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        copper_hoe: {
            id: 'tech-copper_hoe',
            title: loc('tech_copper_hoe'),
            desc: loc('tech_copper_hoe_desc'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { mining: 2, agriculture: 1 },
            not_trait: ['cataclysm'],
            grant: ['hoe',1],
            cost: {
                Knowledge(){ return 720; },
                Copper(){ return 50; }
            },
            effect: loc('tech_copper_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        iron_hoe: {
            id: 'tech-iron_hoe',
            title: loc('tech_iron_hoe'),
            desc: loc('tech_iron_hoe_desc'),
            category: 'agriculture',
            era: 'civilized',
            reqs: { hoe: 1, mining: 3, agriculture: 1 },
            grant: ['hoe',2],
            cost: {
                Knowledge(){ return global.city.ptrait === 'unstable' ? 1800 : 3600; },
                Iron(){ return 500; }
            },
            effect: loc('tech_iron_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_hoe: {
            id: 'tech-steel_hoe',
            title: loc('tech_steel_hoe'),
            desc: loc('tech_steel_hoe_desc'),
            category: 'agriculture',
            era: 'discovery',
            reqs: { hoe: 2, smelting: 2, agriculture: 1 },
            grant: ['hoe',3],
            cost: {
                Knowledge(){ return 12600; },
                Steel(){ return 500; }
            },
            effect: loc('tech_steel_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        titanium_hoe: {
            id: 'tech-titanium_hoe',
            title: loc('tech_titanium_hoe'),
            desc: loc('tech_titanium_hoe_desc'),
            category: 'agriculture',
            era: 'industrialized',
            reqs: { hoe: 3, high_tech: 3, agriculture: 1 },
            grant: ['hoe',4],
            cost: {
                Knowledge(){ return 44000; },
                Titanium(){ return 500; }
            },
            effect: loc('tech_titanium_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_hoe: {
            id: 'tech-adamantite_hoe',
            title: loc('tech_adamantite_hoe'),
            desc: loc('tech_adamantite_hoe_desc'),
            category: 'agriculture',
            era: 'interstellar',
            reqs: { hoe: 4, alpha: 2 },
            grant: ['hoe',5],
            cost: {
                Knowledge(){ return 530000; },
                Adamantite(){ return 1000; }
            },
            effect: loc('tech_adamantite_hoe_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        slave_pens: {
            id: 'tech-slave_pens',
            title: loc('tech_slave_pens'),
            desc: loc('tech_slave_pens'),
            category: 'slaves',
            era: 'civilized',
            reqs: { military: 1, mining: 1 },
            not_trait: ['cataclysm'],
            grant: ['slaves',1],
            trait: ['slaver'],
            cost: {
                Knowledge(){ return 150; }
            },
            effect: loc('tech_slave_pens_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['slave_pen'] = { count: 0, slaves: 0 };
                    return true;
                }
                return false;
            }
        },
        slave_market: {
            id: 'tech-slave_market',
            title: loc('tech_slave_market'),
            desc: loc('tech_slave_market'),
            category: 'slaves',
            era: 'discovery',
            reqs: { slaves: 1, high_tech: 1 },
            grant: ['slaves',2],
            trait: ['slaver'],
            cost: {
                Knowledge(){ return 8000; }
            },
            effect: loc('tech_slave_market_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ceremonial_dagger: {
            id: 'tech-ceremonial_dagger',
            title: loc('tech_ceremonial_dagger'),
            desc: loc('tech_ceremonial_dagger'),
            category: 'sacrifice',
            era: 'civilized',
            reqs: { mining: 1 },
            grant: ['sacrifice',1],
            trait: ['cannibalize'],
            not_trait: ['cataclysm'],
            cost: {
                Knowledge(){ return 60; }
            },
            effect: loc('tech_ceremonial_dagger_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        last_rites: {
            id: 'tech-last_rites',
            title: loc('tech_last_rites'),
            desc: loc('tech_last_rites'),
            category: 'sacrifice',
            era: 'civilized',
            reqs: { sacrifice: 1, theology: 2 },
            grant: ['sacrifice',2],
            trait: ['cannibalize'],
            cost: {
                Knowledge(){ return 1000; }
            },
            effect: loc('tech_last_rites_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ancient_infusion: {
            id: 'tech-ancient_infusion',
            title: loc('tech_ancient_infusion'),
            desc: loc('tech_ancient_infusion'),
            category: 'sacrifice',
            era: 'early_space',
            reqs: { sacrifice: 2, theology: 4 },
            grant: ['sacrifice',3],
            trait: ['cannibalize'],
            cost: {
                Knowledge(){ return 182000; }
            },
            effect: loc('tech_ancient_infusion_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        garrison: {
            id: 'tech-garrison',
            title: loc('tech_garrison'),
            desc: loc('tech_garrison_desc'),
            category: 'military',
            era: 'civilized',
            reqs: { science: 1, housing: 1 },
            grant: ['military',1],
            cost: {
                Knowledge(){ return 70; }
            },
            effect: loc('tech_garrison_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['garrison'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        mercs: {
            id: 'tech-mercs',
            title: loc('tech_mercs'),
            desc: loc('tech_mercs_desc'),
            category: 'military',
            era: 'civilized',
            reqs: { military: 1 },
            grant: ['mercs',1],
            cost: {
                Money(){ return 10000 },
                Knowledge(){ return 4500; }
            },
            effect: loc('tech_mercs_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.civic.garrison['mercs'] = true;
                    return true;
                }
                return false;
            }
        },
        signing_bonus: {
            id: 'tech-signing_bonus',
            title: loc('tech_signing_bonus'),
            desc: loc('tech_signing_bonus_desc'),
            category: 'military',
            era: 'industrialized',
            reqs: { mercs: 1, high_tech: 3 },
            grant: ['mercs',2],
            cost: {
                Money(){ return 50000 },
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_signing_bonus_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hospital: {
            id: 'tech-hospital',
            title: loc('tech_hospital'),
            desc: loc('tech_hospital'),
            category: 'military',
            era: 'civilized',
            reqs: { military: 1, alumina: 1 },
            grant: ['medic',1],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_hospital_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['hospital'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        bac_tanks: {
            id: 'tech-bac_tanks',
            title: loc('tech_bac_tanks'),
            desc: loc('tech_bac_tanks_desc'),
            category: 'military',
            era: 'interstellar',
            reqs: { medic: 1, infernite: 1 },
            grant: ['medic',2],
            cost: {
                Knowledge(){ return 600000; },
                Infernite(){ return 250; }
            },
            effect: loc('tech_bac_tanks_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        boot_camp: {
            id: 'tech-boot_camp',
            title: loc('tech_boot_camp'),
            desc: loc('tech_boot_camp_desc'),
            category: 'military',
            era: 'discovery',
            reqs: { high_tech: 1 },
            grant: ['boot_camp',1],
            cost: {
                Knowledge(){ return 8000; }
            },
            effect: loc('tech_boot_camp_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['boot_camp'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        vr_training: {
            id: 'tech-vr_training',
            title: loc('tech_vr_training'),
            desc: loc('tech_vr_training'),
            category: 'military',
            era: 'interstellar',
            reqs: { boot_camp: 1, high_tech: 12 },
            not_trait: ['cataclysm'],
            grant: ['boot_camp',2],
            cost: {
                Knowledge(){ return 625000; }
            },
            effect(){ return loc('tech_vr_training_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        bows: {
            id: 'tech-bows',
            title: loc('tech_bows'),
            desc: loc('tech_bows_desc'),
            category: 'military',
            era: 'civilized',
            reqs: { military: 1 },
            grant: ['military',2],
            cost: {
                Knowledge(){ return 225; },
                Lumber(){ return 250; }
            },
            effect: loc('tech_bows_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        flintlock_rifle: {
            id: 'tech-flintlock_rifle',
            title: loc('tech_flintlock_rifle'),
            desc: loc('tech_flintlock_rifle'),
            category: 'military',
            era: 'civilized',
            reqs: { military: 2, explosives: 1 },
            grant: ['military',3],
            cost: {
                Knowledge(){ return 5400; },
                Coal(){ return 750; }
            },
            effect: loc('tech_flintlock_rifle_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        machine_gun: {
            id: 'tech-machine_gun',
            title: loc('tech_machine_gun'),
            desc: loc('tech_machine_gun'),
            category: 'military',
            era: 'industrialized',
            reqs: { military: 3, oil: 1 },
            grant: ['military',4],
            cost: {
                Knowledge(){ return 33750; },
                Oil(){ return 1500; }
            },
            effect: loc('tech_machine_gun_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        bunk_beds: {
            id: 'tech-bunk_beds',
            title: loc('tech_bunk_beds'),
            desc: loc('tech_bunk_beds'),
            category: 'military',
            era: 'globalized',
            reqs: { military: 4, high_tech: 4 },
            grant: ['military',5],
            cost: {
                Knowledge(){ return 76500; },
                Furs(){ return 25000; },
                Alloy(){ return 3000; }
            },
            effect: loc('tech_bunk_beds_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        rail_guns: {
            id: 'tech-rail_guns',
            title: loc('tech_rail_guns'),
            desc: loc('tech_rail_guns'),
            category: 'military',
            era: 'early_space',
            reqs: { military: 5, mass: 1 },
            grant: ['military',6],
            cost: {
                Knowledge(){ return 200000; },
                Iridium(){ return 2500; }
            },
            effect: loc('tech_rail_guns_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        laser_rifles: {
            id: 'tech-laser_rifles',
            title: loc('tech_laser_rifles'),
            desc: loc('tech_laser_rifles'),
            category: 'military',
            era: 'deep_space',
            reqs: { military: 6, high_tech: 9, elerium: 1 },
            grant: ['military',7],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 250; }
            },
            effect: loc('tech_laser_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    if (global.race.species === 'sharkin'){
                        unlockAchieve('laser_shark');
                    }
                    return true;
                }
                return false;
            }
        },
        plasma_rifles: {
            id: 'tech-plasma_rifles',
            title: loc('tech_plasma_rifles'),
            desc: loc('tech_plasma_rifles'),
            category: 'military',
            era: 'interstellar',
            reqs: { military: 7, high_tech: 13 },
            grant: ['military',8],
            cost: {
                Knowledge(){ return 780000; },
                Elerium(){ return 500; }
            },
            effect: loc('tech_plasma_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        disruptor_rifles: {
            id: 'tech-disruptor_rifles',
            title: loc('tech_disruptor_rifles'),
            desc: loc('tech_disruptor_rifles'),
            category: 'military',
            era: 'interstellar',
            reqs: { military: 8, high_tech: 14, science: 15, infernite: 1 },
            grant: ['military',9],
            cost: {
                Knowledge(){ return 1000000; },
                Infernite(){ return 1000; }
            },
            effect: loc('tech_disruptor_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        gauss_rifles: {
            id: 'tech-gauss_rifles',
            title: loc('tech_gauss_rifles'),
            desc: loc('tech_gauss_rifles'),
            category: 'military',
            era: 'intergalactic',
            reqs: { military: 9, science: 18 },
            grant: ['military',10],
            cost: {
                Knowledge(){ return 9500000; },
                Bolognium(){ return 100000; }
            },
            effect: loc('tech_gauss_rifles_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#garrison`},'update');
                    vBind({el: `#c_garrison`},'update');
                    return true;
                }
                return false;
            }
        },
        space_marines: {
            id: 'tech-space_marines',
            title: loc('tech_space_marines'),
            desc: loc('tech_space_marines_desc'),
            category: 'military',
            era: 'early_space',
            reqs: { space: 3, mars: 2 },
            grant: ['marines',1],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect(){ return `<div>${loc('tech_space_marines_effect',[races[global.race.species].solar.red])}</div>` },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['space_barracks'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            },
            flair: loc('tech_space_marines_flair')
        },
        hammocks: {
            id: 'tech-hammocks',
            title: loc('tech_hammocks'),
            desc: loc('tech_hammocks'),
            category: 'military',
            era: 'intergalactic',
            reqs: { marines: 1, nanoweave: 1 },
            grant: ['marines',2],
            cost: {
                Knowledge(){ return 8900000; },
                Nanoweave(){ return 30000; },
            },
            effect(){ return loc('tech_hammocks_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cruiser: {
            id: 'tech-cruiser',
            title: loc('tech_cruiser'),
            desc: loc('tech_cruiser'),
            category: 'military',
            era: 'interstellar',
            reqs: { high_tech: 14, proxima: 2, aerogel: 1 },
            grant: ['cruiser',1],
            cost: {
                Knowledge(){ return 860000; },
            },
            effect: loc('tech_cruiser_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['cruiser'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        armor: {
            id: 'tech-armor',
            title: loc('tech_armor'),
            desc: loc('tech_armor_desc'),
            category: 'military',
            era: 'civilized',
            reqs: { military: 1 },
            not_trait: ['apex_predator'],
            grant: ['armor',1],
            cost: {
                Money(){ return 250; },
                Knowledge(){ return 225; },
                Furs(){ return 250; }
            },
            effect: loc('tech_armor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        plate_armor: {
            id: 'tech-plate_armor',
            title: loc('tech_plate_armor'),
            desc: loc('tech_plate_armor_desc'),
            category: 'military',
            era: 'civilized',
            reqs: { armor: 1, mining: 3 },
            grant: ['armor',2],
            cost: {
                Knowledge(){ return 3400; },
                Iron(){ return 600; },
            },
            effect: loc('tech_plate_armor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        kevlar: {
            id: 'tech-kevlar',
            title: loc('tech_kevlar'),
            desc: loc('tech_kevlar_desc'),
            category: 'military',
            era: 'globalized',
            reqs: { armor: 2, polymer: 1 },
            grant: ['armor',3],
            cost: {
                Knowledge(){ return 86000; },
                Polymer(){ return 750; },
            },
            effect: loc('tech_kevlar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        nanoweave_vest: {
            id: 'tech-nanoweave_vest',
            title: loc('tech_nanoweave_vest'),
            desc: loc('tech_nanoweave_vest'),
            category: 'military',
            era: 'intergalactic',
            reqs: { armor: 3, nanoweave: 1 },
            grant: ['armor',4],
            cost: {
                Knowledge(){ return 9250000; },
                Nanoweave(){ return 75000; },
            },
            effect: loc('tech_nanoweave_vest_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        laser_turret: {
            id: 'tech-laser_turret',
            title: loc('tech_laser_turret'),
            desc: loc('tech_laser_turret'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { high_tech: 9, portal: 2 },
            grant: ['turret',1],
            cost: {
                Knowledge(){ return 600000; },
                Elerium(){ return 100; }
            },
            effect(){ return `<div>${loc('tech_laser_turret_effect1')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#fort`},'update');
                    return true;
                }
                return false;
            }
        },
        plasma_turret: {
            id: 'tech-plasma_turret',
            title: loc('tech_plasma_turret'),
            desc: loc('tech_plasma_turret'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { high_tech: 13, turret: 1 },
            grant: ['turret',2],
            cost: {
                Knowledge(){ return 760000; },
                Elerium(){ return 350; }
            },
            effect(){ return `<div>${loc('tech_plasma_turret_effect')}</div><div class="has-text-special">${loc('tech_laser_turret_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    vBind({el: `#fort`},'update');
                    return true;
                }
                return false;
            }
        },
        black_powder: {
            id: 'tech-black_powder',
            title: loc('tech_black_powder'),
            desc: loc('tech_black_powder_desc'),
            category: 'progress',
            era: 'civilized',
            reqs: { mining: 4 },
            grant: ['explosives',1],
            cost: {
                Knowledge(){ return 4500; },
                Coal(){ return 500; }
            },
            effect: loc('tech_black_powder_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dynamite: {
            id: 'tech-dynamite',
            title: loc('tech_dynamite'),
            desc: loc('tech_dynamite'),
            category: 'mining',
            era: 'civilized',
            reqs: { explosives: 1 },
            grant: ['explosives',2],
            cost: {
                Knowledge(){ return 4800; },
                Coal(){ return 750; }
            },
            effect: loc('tech_dynamite_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        anfo: {
            id: 'tech-anfo',
            title: loc('tech_anfo'),
            desc: loc('tech_anfo'),
            category: 'mining',
            era: 'industrialized',
            reqs: { explosives: 2, oil: 1 },
            grant: ['explosives',3],
            cost: {
                Knowledge(){ return 42000; },
                Oil(){ return 2500; }
            },
            effect: loc('tech_anfo_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        mad: {
            id: 'tech-mad',
            title: loc('tech_mad'),
            desc: loc('tech_mad_desc'),
            category: 'special',
            era: 'globalized',
            reqs: { uranium: 1, explosives: 3, high_tech: 7 },
            not_trait: ['cataclysm'],
            grant: ['mad',1],
            cost: {
                Knowledge(){ return 120000; },
                Oil(){ return global.city.ptrait === 'dense' ? 10000 : 8500; },
                Uranium(){ return 1250; }
            },
            effect: loc('tech_mad_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    messageQueue(loc('tech_mad_info'),'info');
                    global.civic.mad.display = true;
                    return true;
                }
                return false;
            }
        },
        cement: {
            id: 'tech-cement',
            title: loc('tech_cement'),
            desc: loc('tech_cement_desc'),
            category: 'cement',
            era: 'civilized',
            reqs: { mining: 1, storage: 1, science: 1 },
            grant: ['cement',1],
            cost: {
                Knowledge(){ return 500; }
            },
            effect: loc('tech_cement_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['cement_plant'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        rebar: {
            id: 'tech-rebar',
            title: loc('tech_rebar'),
            desc: loc('tech_rebar'),
            category: 'cement',
            era: 'civilized',
            reqs: { mining: 3, cement: 1 },
            grant: ['cement',2],
            cost: {
                Knowledge(){ return 3200; },
                Iron(){ return 750; }
            },
            effect: loc('tech_rebar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        steel_rebar: {
            id: 'tech-steel_rebar',
            title: loc('tech_steel_rebar'),
            desc: loc('tech_steel_rebar'),
            category: 'cement',
            era: 'civilized',
            reqs: { smelting: 2, cement: 2 },
            grant: ['cement',3],
            cost: {
                Knowledge(){ return 6750; },
                Steel(){ return 750; }
            },
            effect: loc('tech_steel_rebar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        portland_cement: {
            id: 'tech-portland_cement',
            title: loc('tech_portland_cement'),
            desc: loc('tech_portland_cement'),
            category: 'cement',
            era: 'industrialized',
            reqs: { cement: 3, high_tech: 3 },
            grant: ['cement',4],
            cost: {
                Knowledge(){ return 32000; }
            },
            effect: loc('tech_portland_cement_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        screw_conveyor: {
            id: 'tech-screw_conveyor',
            title: loc('tech_screw_conveyor'),
            desc: loc('tech_screw_conveyor'),
            category: 'cement',
            era: 'globalized',
            reqs: { cement: 4, high_tech: 4 },
            grant: ['cement',5],
            cost: {
                Knowledge(){ return 72000; }
            },
            effect: loc('tech_screw_conveyor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        adamantite_screws: {
            id: 'tech-adamantite_screws',
            title: loc('tech_adamantite_screws'),
            desc: loc('tech_adamantite_screws'),
            category: 'cement',
            era: 'interstellar',
            reqs: { cement: 5, alpha: 2 },
            not_trait: ['cataclysm'],
            grant: ['cement',6],
            cost: {
                Knowledge(){ return 500000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_adamantite_screws_effect',[3]),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        hunter_process: {
            id: 'tech-hunter_process',
            title: loc('tech_hunter_process'),
            desc: loc('tech_hunter_process'),
            category: 'mining',
            era: 'industrialized',
            reqs: { high_tech: 3, smelting: 2 },
            grant: ['titanium',1],
            cost: {
                Knowledge(){ return 45000; },
                Titanium(){ return 1000; }
            },
            effect: loc('tech_hunter_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Titanium.value = resource_values['Titanium'];
                    return true;
                }
                return false;
            }
        },
        kroll_process: {
            id: 'tech-kroll_process',
            title: loc('tech_kroll_process'),
            desc: loc('tech_kroll_process'),
            category: 'mining',
            era: 'globalized',
            reqs: { titanium: 1, high_tech: 4 },
            grant: ['titanium',2],
            cost: {
                Knowledge(){ return 78000; },
                Titanium(){ return 10000; }
            },
            effect: loc('tech_kroll_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        cambridge_process: {
            id: 'tech-cambridge_process',
            title: loc('tech_cambridge_process'),
            desc: loc('tech_cambridge_process'),
            category: 'mining',
            era: 'early_space',
            reqs: { titanium: 2, supercollider: 1 },
            grant: ['titanium',3],
            cost: {
                Knowledge(){ return 135000; },
                Titanium(){ return 17500; }
            },
            effect: loc('tech_cambridge_process_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        pynn_partical: {
            id: 'tech-pynn_partical',
            title: loc('tech_pynn_partical'),
            desc: loc('tech_pynn_partical'),
            category: 'progress',
            era: 'early_space',
            reqs: { supercollider: 1 },
            grant: ['particles',1],
            cost: {
                Knowledge(){ return 100000; }
            },
            effect: loc('tech_pynn_partical_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        matter_compression: {
            id: 'tech-matter_compression',
            title: loc('tech_matter_compression'),
            desc: loc('tech_matter_compression'),
            category: 'storage',
            era: 'early_space',
            reqs: { particles: 1 },
            grant: ['particles',2],
            cost: {
                Knowledge(){ return 112500; }
            },
            effect: loc('tech_matter_compression_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        higgs_boson: {
            id: 'tech-higgs_boson',
            title: loc('tech_higgs_boson'),
            desc: loc('tech_higgs_boson'),
            category: 'science',
            era: 'early_space',
            reqs: { particles: 2, supercollider: 2 },
            grant: ['particles',3],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_higgs_boson_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dimensional_compression: {
            id: 'tech-dimensional_compression',
            title: loc('tech_dimensional_compression'),
            desc: loc('tech_dimensional_compression'),
            category: 'storage',
            era: 'interstellar',
            reqs: { particles: 3, science: 11, supercollider: 3 },
            grant: ['particles',4],
            cost: {
                Knowledge(){ return 425000; }
            },
            effect: loc('tech_dimensional_compression_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        theology: {
            id: 'tech-theology',
            title: loc('tech_theology'),
            desc: loc('tech_theology'),
            category: 'religion',
            era: 'civilized',
            reqs: { theology: 1, housing: 1, cement: 1 },
            grant: ['theology',2],
            cost: {
                Knowledge(){ return 900; }
            },
            effect: loc('tech_theology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.city['temple'] = { count: 0 };
                    if (global.race['magnificent']){
                        global.city['shrine'] = {
                            count: 0,
                            morale: 0,
                            metal: 0,
                            know: 0,
                            tax: 0
                        };
                    }
                    return true;
                }
                return false;
            }
        },
        fanaticism: {
            id: 'tech-fanaticism',
            title: loc('tech_fanaticism'),
            desc: loc('tech_fanaticism'),
            category: 'religion',
            era: 'civilized',
            wiki: global.genes['transcendence'] ? false : true,
            reqs: { theology: 2 },
            grant: ['theology',3],
            not_gene: ['transcendence'],
            no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-anthropology') ? true : false; },
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_fanaticism_effect')}</div><div class="has-text-special">${loc('tech_fanaticism_warning')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['fanaticism'] = 1;
                    if (global.race.gods === global.race.species){
                        unlockAchieve(`second_evolution`);
                    }
                    fanaticism(global.race.gods);
                    return true;
                }
                return false;
            }
        },
        alt_fanaticism: {
            id: 'tech-alt_fanaticism',
            title: loc('tech_fanaticism'),
            desc: loc('tech_fanaticism'),
            category: 'religion',
            era: 'civilized',
            wiki: global.genes['transcendence'] ? true : false,
            reqs: { theology: 2 },
            grant: ['fanaticism',1],
            gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_fanaticism_effect')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['theology'] === 2){
                        global.tech['theology'] = 3;
                    }
                    if (global.race.gods === global.race.species){
                        unlockAchieve(`second_evolution`);
                    }
                    fanaticism(global.race.gods);
                    return true;
                }
                return false;
            }
        },
        ancient_theology: {
            id: 'tech-ancient_theology',
            title: loc('tech_ancient_theology'),
            desc: loc('tech_ancient_theology'),
            category: 'religion',
            era: 'early_space',
            reqs: { theology: 3, mars: 2 },
            grant: ['theology',4],
            cost: {
                Knowledge(){ return 180000; }
            },
            effect(){
                let entityA = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
                let entityB = global.race.gods !== 'none' ? races[global.race.gods.toLowerCase()].entity : races[global.race.species].entity;
                return loc('tech_ancient_theology_effect',[entityA,entityB]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['ziggurat'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        study: {
            id: 'tech-study',
            title: loc('tech_study'),
            desc: loc('tech_study_desc'),
            category: 'religion',
            era: 'early_space',
            reqs: { theology: 4 },
            grant: ['theology',5],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){
                let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
                return `<div>${loc('tech_study_effect',[entity])}</div><div class="has-text-special">${loc('tech_study_warning')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['ancient_study'] = 1;
                    return true;
                }
                return false;
            }
        },
        encoding: {
            id: 'tech-encoding',
            title: loc('tech_encoding'),
            desc: loc('tech_encoding_desc'),
            category: 'religion',
            era: 'deep_space',
            reqs: { ancient_study: 1, mars: 5 },
            grant: ['ancient_study',2],
            cost: {
                Knowledge(){ return 268000; }
            },
            effect(){ return `<div>${loc('tech_encoding_effect')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        deify: {
            id: 'tech-deify',
            title: loc('tech_deify'),
            desc: loc('tech_deify_desc'),
            category: 'religion',
            era: 'early_space',
            reqs: { theology: 4 },
            grant: ['theology',5],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){
                let entity = global.race.old_gods !== 'none' ? races[global.race.old_gods.toLowerCase()].entity : races[global.race.species].entity;
                return `<div>${loc('tech_deify_effect',[entity])}</div><div class="has-text-special">${loc('tech_deify_warning')}</div>`;
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['ancient_deify'] = 1;
                    fanaticism(global.race.old_gods);
                    return true;
                }
                return false;
            }
        },
        infusion: {
            id: 'tech-infusion',
            title: loc('tech_infusion'),
            desc: loc('tech_infusion_desc'),
            category: 'religion',
            era: 'deep_space',
            reqs: { ancient_deify: 1, mars: 5 },
            grant: ['ancient_deify',2],
            cost: {
                Knowledge(){ return 268000; }
            },
            effect(){ return `<div>${loc('tech_infusion_effect')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        indoctrination: {
            id: 'tech-indoctrination',
            title: loc('tech_indoctrination'),
            desc: loc('tech_indoctrination'),
            category: 'religion',
            era: 'civilized',
            reqs: { fanaticism: 1 },
            grant: ['fanaticism',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_indoctrination_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        missionary: {
            id: 'tech-missionary',
            title: loc('tech_missionary'),
            desc: loc('tech_missionary'),
            category: 'religion',
            era: 'discovery',
            reqs: { fanaticism: 2 },
            grant: ['fanaticism',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_missionary_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        zealotry: {
            id: 'tech-zealotry',
            title: loc('tech_zealotry'),
            desc: loc('tech_zealotry'),
            category: 'religion',
            era: 'discovery',
            reqs: { fanaticism: 3 },
            grant: ['fanaticism',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: loc('tech_zealotry_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        anthropology: {
            id: 'tech-anthropology',
            title: loc('tech_anthropology'),
            desc: loc('tech_anthropology'),
            category: 'religion',
            era: 'civilized',
            wiki: global.genes['transcendence'] ? false : true,
            reqs: { theology: 2 },
            grant: ['theology',3],
            not_gene: ['transcendence'],
            no_queue(){ return global.r_queue.queue.some(item => item.id === 'tech-fanaticism') ? true : false; },
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_anthropology_effect')}</div><div class="has-text-special">${loc('tech_anthropology_warning')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['anthropology'] = 1;
                    return true;
                }
                return false;
            }
        },
        alt_anthropology: {
            id: 'tech-alt_anthropology',
            title: loc('tech_anthropology'),
            desc: loc('tech_anthropology'),
            category: 'religion',
            era: 'civilized',
            wiki: global.genes['transcendence'] ? true : false,
            reqs: { theology: 2 },
            grant: ['anthropology',1],
            gene: ['transcendence'],
            cost: {
                Knowledge(){ return 2500; }
            },
            effect: `<div>${loc('tech_anthropology_effect')}</div>`,
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['theology'] === 2){
                        global.tech['theology'] = 3;
                    }
                    return true;
                }
                return false;
            }
        },
        mythology: {
            id: 'tech-mythology',
            title: loc('tech_mythology'),
            desc: loc('tech_mythology'),
            category: 'religion',
            era: 'civilized',
            reqs: { anthropology: 1 },
            grant: ['anthropology',2],
            cost: {
                Knowledge(){ return 5000; }
            },
            effect: loc('tech_mythology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        archaeology: {
            id: 'tech-archaeology',
            title: loc('tech_archaeology'),
            desc: loc('tech_archaeology'),
            category: 'science',
            era: 'discovery',
            reqs: { anthropology: 2 },
            grant: ['anthropology',3],
            cost: {
                Knowledge(){ return 10000; }
            },
            effect: loc('tech_archaeology_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        merchandising: {
            id: 'tech-merchandising',
            title: loc('tech_merchandising'),
            desc: loc('tech_merchandising'),
            category: 'banking',
            era: 'discovery',
            reqs: { anthropology: 3 },
            grant: ['anthropology',4],
            cost: {
                Knowledge(){ return 25000; }
            },
            effect: loc('tech_merchandising_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        astrophysics: {
            id: 'tech-astrophysics',
            title: loc('tech_astrophysics'),
            desc: loc('tech_astrophysics_desc'),
            category: 'storage',
            era: 'early_space',
            reqs: { space: 2 },
            grant: ['space_explore',1],
            cost: {
                Knowledge(){ return 125000; }
            },
            effect: loc('tech_astrophysics_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['propellant_depot'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        rover: {
            id: 'tech-rover',
            title: loc('tech_rover'),
            desc: loc('tech_rover'),
            category: 'space_exploration',
            era: 'early_space',
            reqs: { space_explore: 1 },
            grant: ['space_explore',2],
            cost: {
                Knowledge(){ return 135000; },
                Alloy(){ return 22000 },
                Polymer(){ return 18000 },
                Uranium(){ return 750 }
            },
            effect: loc('tech_rover_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.moon = true;
                    global.space['moon_base'] = {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    };
                    return true;
                }
                return false;
            }
        },
        probes: {
            id: 'tech-probes',
            title: loc('tech_probes'),
            desc: loc('tech_probes'),
            category: 'space_exploration',
            era: 'early_space',
            reqs: { space_explore: 2 },
            grant: ['space_explore',3],
            cost: {
                Knowledge(){ return 168000; },
                Steel(){ return 100000 },
                Iridium(){ return 5000 },
                Uranium(){ return 2250 },
                Helium_3(){ return 3500 }
            },
            effect: loc('tech_probes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.red = true;
                    global.settings.space.hell = true;
                    global.space['spaceport'] = {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    };
                    return true;
                }
                return false;
            }
        },
        starcharts: {
            id: 'tech-starcharts',
            title: loc('tech_starcharts'),
            desc: loc('tech_starcharts'),
            category: 'space_exploration',
            era: 'early_space',
            reqs: { space_explore: 3, science: 9 },
            grant: ['space_explore',4],
            cost: {
                Knowledge(){ return 185000; }
            },
            effect: loc('tech_starcharts_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space.gas = true;
                    global.settings.space.sun = true;
                    global.space['swarm_control'] = { count: 0, support: 0, s_max: 0 };
                    return true;
                }
                return false;
            }
        },
        colonization: {
            id: 'tech-colonization',
            title: loc('tech_colonization'),
            desc(){ return loc('tech_colonization_desc',[races[global.race.species].solar.red]); },
            category: 'agriculture',
            era: 'early_space',
            reqs: { space: 4, mars: 1 },
            grant: ['mars',2],
            cost: {
                Knowledge(){ return 172000; }
            },
            effect(){ return loc('tech_colonization_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['biodome'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        red_tower: {
            id: 'tech-red_tower',
            title(){ return loc('tech_red_tower',[races[global.race.species].solar.red]); },
            desc(){ return loc('tech_red_tower',[races[global.race.species].solar.red]); },
            category: 'space_exploration',
            era: 'early_space',
            reqs: { mars: 2 },
            grant: ['mars',3],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect(){ return loc('tech_red_tower_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['red_tower'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        space_manufacturing: {
            id: 'tech-space_manufacturing',
            title: loc('tech_space_manufacturing'),
            desc: loc('tech_space_manufacturing_desc'),
            category: 'crafting',
            era: 'early_space',
            reqs: { mars: 3 },
            grant: ['mars',4],
            cost: {
                Knowledge(){ return 220000; }
            },
            effect(){ return loc('tech_space_manufacturing_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['red_factory'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        exotic_lab: {
            id: 'tech-exotic_lab',
            title: loc('tech_exotic_lab'),
            desc: loc('tech_exotic_lab_desc'),
            category: 'science',
            era: 'deep_space',
            reqs: { mars: 4, asteroid: 5 },
            grant: ['mars',5],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect: loc('tech_exotic_lab_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['exotic_lab'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        hydroponics: {
            id: 'tech-hydroponics',
            title: loc('tech_hydroponics'),
            desc(){ return loc('tech_hydroponics'); },
            category: 'agriculture',
            era: 'intergalactic',
            reqs: { mars: 5, gateway: 3 },
            grant: ['mars',6],
            cost: {
                Knowledge(){ return 3000000; },
                Bolognium(){ return 500000; }
            },
            effect(){ return loc('tech_hydroponics_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_sphere: {
            id: 'tech-dyson_sphere',
            title: loc('tech_dyson_sphere'),
            desc: loc('tech_dyson_sphere'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { solar: 1 },
            grant: ['solar',2],
            cost: {
                Knowledge(){ return 195000; }
            },
            effect: loc('tech_dyson_sphere_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_swarm: {
            id: 'tech-dyson_swarm',
            title: loc('tech_dyson_swarm'),
            desc: loc('tech_dyson_swarm'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { solar: 2 },
            grant: ['solar',3],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: loc('tech_dyson_swarm_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['swarm_satellite'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        swarm_plant: {
            id: 'tech-swarm_plant',
            title: loc('tech_swarm_plant'),
            desc: loc('tech_swarm_plant'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { solar: 3, hell: 1, gas_moon: 1 },
            grant: ['solar',4],
            cost: {
                Knowledge(){ return 250000; }
            },
            effect(){ return loc('tech_swarm_plant_effect',[races[global.race.species].home,races[global.race.species].solar.hell]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['swarm_plant'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        space_sourced: {
            id: 'tech-space_sourced',
            title: loc('tech_space_sourced'),
            desc: loc('tech_space_sourced_desc'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { solar: 4, asteroid: 3 },
            grant: ['solar',5],
            cost: {
                Knowledge(){ return 300000; }
            },
            effect: loc('tech_space_sourced_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_plant_ai: {
            id: 'tech-swarm_plant_ai',
            title: loc('tech_swarm_plant_ai'),
            desc: loc('tech_swarm_plant_ai'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { solar: 4, high_tech: 10 },
            grant: ['swarm',1],
            cost: {
                Knowledge(){ return 335000; }
            },
            effect: loc('tech_swarm_plant_ai_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_control_ai: {
            id: 'tech-swarm_control_ai',
            title: loc('tech_swarm_control_ai'),
            desc: loc('tech_swarm_control_ai'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { swarm: 1 },
            grant: ['swarm',2],
            cost: {
                Knowledge(){ return 360000; }
            },
            effect: loc('tech_swarm_control_ai_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        quantum_swarm: {
            id: 'tech-quantum_swarm',
            title: loc('tech_quantum_swarm'),
            desc: loc('tech_quantum_swarm'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { swarm: 2, high_tech: 11 },
            grant: ['swarm',3],
            cost: {
                Knowledge(){ return 450000; }
            },
            effect: loc('tech_quantum_swarm_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        perovskite_cell: {
            id: 'tech-perovskite_cell',
            title: loc('tech_perovskite_cell'),
            desc: loc('tech_perovskite_cell'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { swarm: 3 },
            grant: ['swarm',4],
            cost: {
                Knowledge(){ return 525000; },
                Titanium(){ return 100000; }
            },
            effect: loc('tech_perovskite_cell_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        swarm_convection: {
            id: 'tech-swarm_convection',
            title: loc('tech_swarm_convection'),
            desc: loc('tech_swarm_convection'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { swarm: 4, stanene: 1 },
            grant: ['swarm',5],
            cost: {
                Knowledge(){ return 725000; },
                Stanene(){ return 100000; }
            },
            effect: loc('tech_swarm_convection_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        orichalcum_panels: {
            id: 'tech-orichalcum_panels',
            title: loc('tech_orichalcum_panels'),
            desc: loc('tech_orichalcum_panels'),
            category: 'power_generation',
            era: 'intergalactic',
            reqs: { high_tech: 17, swarm: 5 },
            grant: ['swarm',6],
            cost: {
                Knowledge(){ return 14000000; },
                Orichalcum(){ return 125000; }
            },
            effect(){ return loc('tech_orichalcum_panels_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dyson_net: {
            id: 'tech-dyson_net',
            title: loc('tech_dyson_net'),
            desc: loc('tech_dyson_net'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { solar: 3, proxima: 2, stanene: 1 },
            grant: ['proxima',3],
            cost: {
                Knowledge(){ return 800000; }
            },
            effect: loc('tech_dyson_net_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['dyson'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        dyson_sphere2: {
            id: 'tech-dyson_sphere2',
            title: loc('tech_dyson_sphere'),
            desc: loc('tech_dyson_sphere'),
            category: 'power_generation',
            era: 'intergalactic',
            reqs: { proxima: 3, piracy: 1 },
            grant: ['dyson',1],
            cost: {
                Knowledge(){ return 5000000; }
            },
            effect: loc('tech_dyson_sphere2_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['dyson_sphere'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        orichalcum_sphere: {
            id: 'tech-orichalcum_sphere',
            title: loc('tech_orichalcum_sphere'),
            desc: loc('tech_orichalcum_sphere'),
            category: 'power_generation',
            era: 'intergalactic',
            reqs: { dyson: 1, science: 19 },
            condition(){
                return global.interstellar['dyson_sphere'] && global.interstellar.dyson_sphere.count >= 100 ? true : false;
            },
            grant: ['dyson',2],
            cost: {
                Knowledge(){ return 17500000; },
                Orichalcum(){ return 250000; }
            },
            effect: loc('tech_orichalcum_sphere_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['orichalcum_sphere'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        gps: {
            id: 'tech-gps',
            title: loc('tech_gps'),
            desc: loc('tech_gps'),
            category: 'market',
            era: 'early_space',
            reqs: { space_explore: 1 },
            not_trait: ['terrifying'],
            grant: ['satellite',1],
            cost: {
                Knowledge(){ return 150000; }
            },
            effect: loc('tech_gps_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['gps'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        nav_beacon: {
            id: 'tech-nav_beacon',
            title: loc('tech_nav_beacon'),
            desc: loc('tech_nav_beacon'),
            category: 'space_exploration',
            era: 'early_space',
            reqs: { luna: 1 },
            grant: ['luna',2],
            cost: {
                Knowledge(){ return 180000; }
            },
            effect: loc('tech_nav_beacon_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['nav_beacon'] = {
                        count: 0,
                        on: 0
                    };
                    return true;
                }
                return false;
            }
        },
        subspace_signal: {
            id: 'tech-subspace_signal',
            title: loc('tech_subspace_signal'),
            desc: loc('tech_subspace_signal'),
            category: 'space_exploration',
            era: 'interstellar',
            reqs: { science: 13, luna: 2, stanene: 1 },
            grant: ['luna',3],
            cost: {
                Knowledge(){ return 700000; },
                Stanene(){ return 125000; }
            },
            effect(){ return loc('tech_subspace_signal_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        atmospheric_mining: {
            id: 'tech-atmospheric_mining',
            title: loc('tech_atmospheric_mining'),
            desc: loc('tech_atmospheric_mining'),
            category: 'power_generation',
            era: 'early_space',
            reqs: { space: 5 },
            grant: ['gas_giant',1],
            cost: {
                Knowledge(){ return 190000; }
            },
            effect: loc('tech_atmospheric_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['gas_mining'] = { count: 0, on: 0 };
                    global.space['gas_storage'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        helium_attractor: {
            id: 'tech-helium_attractor',
            title: loc('tech_helium_attractor'),
            desc: loc('tech_helium_attractor'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { gas_giant: 1, elerium: 1 },
            grant: ['helium',1],
            cost: {
                Knowledge(){ return 290000; },
                Elerium(){ return 250; }
            },
            effect(){ return loc('tech_helium_attractor_effect',[races[global.race.species].solar.gas]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        ram_scoops: {
            id: 'tech-ram_scoops',
            title: loc('tech_ram_scoops'),
            desc: loc('tech_ram_scoops'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { nebula: 2 },
            grant: ['ram_scoop',1],
            cost: {
                Knowledge(){ return 580000; }
            },
            effect(){ return loc('tech_ram_scoops_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_prospecting: {
            id: 'tech-elerium_prospecting',
            title: loc('tech_elerium_prospecting'),
            desc: loc('tech_elerium_prospecting'),
            category: 'space_mining',
            era: 'interstellar',
            reqs: { nebula: 2 },
            grant: ['nebula',3],
            cost: {
                Knowledge(){ return 610000; }
            },
            effect(){ return loc('tech_elerium_prospecting_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['elerium_prospector'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        zero_g_mining: {
            id: 'tech-zero_g_mining',
            title: loc('tech_zero_g_mining'),
            desc: loc('tech_zero_g_mining'),
            category: 'space_mining',
            era: 'early_space',
            reqs: { asteroid: 1, high_tech: 8 },
            grant: ['asteroid',2],
            cost: {
                Knowledge(){ return 210000; }
            },
            effect: loc('tech_zero_g_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['space_station'] = { count: 0, on: 0, support: 0, s_max: 0 };
                    global.space['iridium_ship'] = { count: 0, on: 0 };
                    global.space['iron_ship'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        elerium_mining: {
            id: 'tech-elerium_mining',
            title: loc('tech_elerium_mining'),
            desc: loc('tech_elerium_mining'),
            category: 'space_mining',
            era: 'deep_space',
            reqs: { asteroid: 4 },
            grant: ['asteroid',5],
            cost: {
                Knowledge(){ return 235000; },
                Elerium(){ return 1; }
            },
            effect: loc('tech_elerium_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['elerium_ship'] = { count: 0, on: 0 };
                    if (global.race['cataclysm']){
                        unlockAchieve('iron_will',false,2);
                    }
                    return true;
                }
                return false;
            }
        },
        laser_mining: {
            id: 'tech-laser_mining',
            title: loc('tech_laser_mining'),
            desc: loc('tech_laser_mining'),
            category: 'space_mining',
            era: 'deep_space',
            reqs: { asteroid: 5, elerium: 1, high_tech: 9 },
            grant: ['asteroid',6],
            cost: {
                Knowledge(){ return 350000; },
            },
            effect: loc('tech_laser_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        plasma_mining: {
            id: 'tech-plasma_mining',
            title: loc('tech_plasma_mining'),
            desc: loc('tech_plasma_mining'),
            category: 'space_mining',
            era: 'interstellar',
            reqs: { asteroid: 6, high_tech: 13 },
            grant: ['asteroid',7],
            cost: {
                Knowledge(){ return 825000; },
            },
            effect: loc('tech_plasma_mining_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_tech: {
            id: 'tech-elerium_tech',
            title: loc('tech_elerium_tech'),
            desc: loc('tech_elerium_tech'),
            category: 'space_mining',
            era: 'deep_space',
            reqs: { asteroid: 5 },
            grant: ['elerium',1],
            cost: {
                Knowledge(){ return 275000; },
                Elerium(){ return 20; }
            },
            effect: loc('tech_elerium_tech_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        elerium_reactor: {
            id: 'tech-elerium_reactor',
            title: loc('tech_elerium_reactor'),
            desc: loc('tech_elerium_reactor'),
            category: 'power_generation',
            era: 'deep_space',
            reqs: { dwarf: 1, elerium: 1 },
            grant: ['elerium',2],
            cost: {
                Knowledge(){ return 325000; },
                Elerium(){ return 180; }
            },
            effect: loc('tech_elerium_reactor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['e_reactor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        neutronium_housing: {
            id: 'tech-neutronium_housing',
            title: loc('tech_neutronium_housing'),
            desc: loc('tech_neutronium_housing'),
            category: 'housing',
            era: 'deep_space',
            reqs: { gas_moon: 1 },
            grant: ['space_housing',1],
            cost: {
                Knowledge(){ return 275000; },
                Neutronium(){ return 350; }
            },
            effect(){ return loc('tech_neutronium_housing_effect',[races[global.race.species].solar.red]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        unification: {
            id: 'tech-unification',
            title: loc('tech_unification'),
            desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
            category: 'special',
            era: 'early_space',
            reqs: { mars: 2 },
            grant: ['unify',1],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect: loc('tech_unification_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        unification2: {
            id: 'tech-unification2',
            title: loc('tech_unification'),
            desc(){ return loc('tech_unification_desc',[races[global.race.species].home]); },
            category: 'special',
            era: 'early_space',
            reqs: { unify: 1 },
            grant: ['unify',2],
            cost: {
                Bool(){
                    let owned = 0;
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign[`gov${i}`].occ || global.civic.foreign[`gov${i}`].buy || global.civic.foreign[`gov${i}`].anx){
                            owned++;
                        }
                    }
                    return owned === 3 ? true : false;
                }
            },
            effect(){ return `<div>${loc('tech_unification_effect2')}</div><div class="has-text-special">${loc('tech_unification_warning')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.tech['world_control'] = 1;
                    clearElement($('#garrison'));
                    clearElement($('#c_garrison'));
                    buildGarrison($('#garrison'),true);
                    buildGarrison($('#c_garrison'),false);
                    if (global.civic.foreign.gov0.occ && global.civic.foreign.gov1.occ && global.civic.foreign.gov2.occ){
                        unlockAchieve(`world_domination`);
                    }
                    if (global.civic.foreign.gov0.anx && global.civic.foreign.gov1.anx && global.civic.foreign.gov2.anx){
                        unlockAchieve(`illuminati`);
                    }
                    if (global.civic.foreign.gov0.buy && global.civic.foreign.gov1.buy && global.civic.foreign.gov2.buy){
                        unlockAchieve(`syndicate`);
                    }
                    if (global.stats.attacks === 0){
                        unlockAchieve(`pacifist`);
                    }
                    for (let i=0; i<3; i++){
                        if (global.civic.foreign[`gov${i}`].occ){
                            let occ_amount = global.civic.govern.type === 'federation' ? 15 : 20;
                            global.civic['garrison'].max += occ_amount;
                            global.civic['garrison'].workers += occ_amount;
                            global.civic.foreign[`gov${i}`].occ = false;
                        }
                        global.civic.foreign[`gov${i}`].buy = false;
                        global.civic.foreign[`gov${i}`].anx = false;
                        global.civic.foreign[`gov${i}`].sab = 0;
                        global.civic.foreign[`gov${i}`].act = 'none';
                    }
                    return true;
                }
                return false;
            }
        },
        genesis: {
            id: 'tech-genesis',
            title: loc('tech_genesis'),
            desc: loc('tech_genesis'),
            category: 'special',
            era: 'deep_space',
            reqs: { high_tech: 10, genesis: 1 },
            grant: ['genesis',2],
            cost: {
                Knowledge(){ return 350000; }
            },
            effect: loc('tech_genesis_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        star_dock: {
            id: 'tech-star_dock',
            title: loc('tech_star_dock'),
            desc: loc('tech_star_dock'),
            category: 'special',
            era: 'deep_space',
            reqs: { genesis: 2, space: 5, high_tech: 10 },
            grant: ['genesis',3],
            cost: {
                Knowledge(){ return 380000; },
            },
            effect: loc('tech_star_dock_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.space['star_dock'] = {
                        count: 0,
                        ship: 0,
                        probe: 0,
                        template: global.race.species
                    };
                    return true;
                }
                return false;
            }
        },
        interstellar: {
            id: 'tech-interstellar',
            title: loc('tech_interstellar'),
            desc: loc('tech_interstellar'),
            category: 'space_exploration',
            era: 'deep_space',
            reqs: { genesis: 3 },
            grant: ['genesis',4],
            cost: {
                Knowledge(){ return 400000; },
            },
            effect: loc('tech_interstellar_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.starDock['probes'] = { count: 0 };
                    return true;
                }
                return false;
            }
        },
        genesis_ship: {
            id: 'tech-genesis_ship',
            title(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
            desc(){ return global.race['cataclysm'] ? loc('tech_generational_ship') : loc('tech_genesis_ship'); },
            category: 'special',
            era: 'deep_space',
            reqs: { genesis: 4 },
            grant: ['genesis',5],
            cost: {
                Knowledge(){ return 425000; },
            },
            effect(){ return global.race['cataclysm'] ? loc('tech_generational_effect') : loc('tech_genesis_ship_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.starDock['seeder'] = { count: 0 };
                    if (global.race['cataclysm']){
                        unlockAchieve('iron_will',false,4);
                    }
                    return true;
                }
                return false;
            }
        },
        genetic_decay: {
            id: 'tech-genetic_decay',
            title: loc('tech_genetic_decay'),
            desc: loc('tech_genetic_decay'),
            category: 'genes',
            era: 'early_space',
            reqs: { decay: 1 },
            grant: ['decay',2],
            cost: {
                Knowledge(){ return 200000; }
            },
            effect: loc('tech_genetic_decay_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        tachyon: {
            id: 'tech-tachyon',
            title: loc('tech_tachyon'),
            desc: loc('tech_tachyon'),
            category: 'progress',
            era: 'interstellar',
            reqs: { wsc: 1 },
            grant: ['ftl',1],
            cost: {
                Knowledge(){ return 435000; }
            },
            effect: loc('tech_tachyon_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        warp_drive: {
            id: 'tech-warp_drive',
            title: loc('tech_warp_drive'),
            desc: loc('tech_warp_drive'),
            category: 'space_exploration',
            era: 'interstellar',
            reqs: { ftl: 1 },
            grant: ['ftl',2],
            cost: {
                Knowledge(){ return 450000; }
            },
            effect: loc('tech_warp_drive_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showDeep = true;
                    global.settings.space.alpha = true;
                    global.interstellar['starport'] = {
                        count: 0,
                        on: 0,
                        support: 0,
                        s_max: 0
                    };
                    return true;
                }
                return false;
            }
        },
        habitat: {
            id: 'tech-habitat',
            title: loc('tech_habitat'),
            desc: loc('tech_habitat_desc'),
            category: 'housing',
            era: 'interstellar',
            reqs: { alpha: 2, droids: 1 },
            grant: ['alpha',3],
            cost: {
                Knowledge(){ return 480000; }
            },
            effect: loc('tech_habitat_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['habitat'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        graphene: {
            id: 'tech-graphene',
            title: loc('tech_graphene'),
            desc: loc('tech_graphene'),
            category: 'crafting',
            era: 'interstellar',
            reqs: { alpha: 3, infernite: 1 },
            grant: ['graphene',1],
            cost: {
                Knowledge(){ return 540000; },
                Adamantite(){ return 10000; }
            },
            effect: loc('tech_graphene_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['g_factory'] = { count: 0, on: 0, Lumber: 0, Coal: 0, Oil: 0 };
                    return true;
                }
                return false;
            }
        },
        aerogel: {
            id: 'tech-aerogel',
            title: loc('tech_aerogel'),
            desc: loc('tech_aerogel'),
            category: 'crafting',
            era: 'interstellar',
            reqs: { graphene: 1, science: 13 },
            grant: ['aerogel',1],
            cost: {
                Knowledge(){ return 750000; },
                Graphene(){ return 50000; },
                Infernite(){ return 500; }
            },
            effect: loc('tech_aerogel_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Aerogel.display = true;
                    loadFoundry();
                    return true;
                }
                return false;
            }
        },
        mega_manufacturing: {
            id: 'tech-mega_manufacturing',
            title: loc('tech_mega_manufacturing'),
            desc: loc('tech_mega_manufacturing'),
            category: 'crafting',
            era: 'intergalactic',
            reqs: { high_tech: 16, alpha: 3 },
            grant: ['alpha',4],
            cost: {
                Knowledge(){ return 5650000; }
            },
            effect(){ return loc('tech_mega_manufacturing_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['int_factory'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        luxury_condo: {
            id: 'tech-luxury_condo',
            title: loc('tech_luxury_condo'),
            desc: loc('tech_luxury_condo'),
            category: 'housing',
            era: 'intergalactic',
            reqs: { high_tech: 17, alpha: 4 },
            grant: ['alpha',5],
            cost: {
                Knowledge(){ return 15000000; }
            },
            effect(){ return loc('tech_luxury_condo_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['luxury_condo'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        stellar_engine: {
            id: 'tech-stellar_engine',
            title: loc('tech_stellar_engine'),
            desc: loc('tech_stellar_engine'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { blackhole: 2 },
            grant: ['blackhole',3],
            cost: {
                Knowledge(){ return 1000000; }
            },
            effect: loc('tech_stellar_engine_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['stellar_engine'] = { count: 0, mass: 8, exotic: 0 };
                    return true;
                }
                return false;
            }
        },
        mass_ejector: {
            id: 'tech-mass_ejector',
            title: loc('tech_mass_ejector'),
            desc: loc('tech_mass_ejector'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { blackhole: 4 },
            grant: ['blackhole',5],
            cost: {
                Knowledge(){ return 1100000; }
            },
            effect: loc('tech_mass_ejector_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar['mass_ejector'] = {
                        count: 0, on: 0, total: 0, mass: 0,
                        Food: 0, Lumber: 0,
                        Stone: 0, Furs: 0,
                        Copper: 0, Iron: 0,
                        Aluminium: 0, Cement: 0,
                        Coal: 0, Oil: 0,
                        Uranium: 0, Steel: 0,
                        Titanium: 0, Alloy: 0,
                        Polymer: 0, Iridium: 0,
                        Helium_3: 0, Deuterium: 0,
                        Neutronium: 0, Adamantite: 0,
                        Infernite: 0, Elerium: 0,
                        Nano_Tube: 0, Graphene: 0,
                        Stanene: 0, Bolognium: 0,
                        Vitreloy: 0, Orichalcum: 0,
                        Plywood: 0, Brick: 0,
                        Wrought_Iron: 0, Sheet_Metal: 0,
                        Mythril: 0, Aerogel: 0,
                        Nanoweave: 0
                    };
                    return true;
                }
                return false;
            }
        },
        exotic_infusion: {
            id: 'tech-exotic_infusion',
            title: loc('tech_exotic_infusion'),
            desc: loc('tech_exotic_infusion'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { whitehole: 1 },
            grant: ['whitehole',2],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_exotic_infusion_effect',[global.resource.Soul_Gem.name])}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Soul_Gem.amount += 10;
                    global.resource.Knowledge.amount += 1500000;
                    return true;
                }
                return false;
            },
            flair(){ return loc('tech_exotic_infusion_flair'); }
        },
        infusion_check: {
            id: 'tech-infusion_check',
            title: loc('tech_infusion_check'),
            desc: loc('tech_infusion_check'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { whitehole: 2 },
            grant: ['whitehole',3],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_infusion_check_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Soul_Gem.amount += 10;
                    global.resource.Knowledge.amount += 1500000;
                    return true;
                }
                return false;
            },
            flair(){ return loc('tech_infusion_check_flair'); }
        },
        infusion_confirm: {
            id: 'tech-infusion_confirm',
            title: loc('tech_infusion_confirm'),
            desc: loc('tech_infusion_confirm'),
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { whitehole: 3 },
            grant: ['whitehole',4],
            cost: {
                Knowledge(){ return 1500000; },
                Soul_Gem(){ return 10; }
            },
            effect(){ return `<div>${loc('tech_infusion_confirm_effect')}</div><div class="has-text-danger">${loc('tech_exotic_infusion_effect2')}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    if (global.tech['whitehole'] >= 4){
                        return;
                    }
                    global.tech['whitehole'] = 4;
                    let bang = $('<div class="bigbang"></div>');
                    $('body').append(bang);
                    setTimeout(function(){
                        bang.addClass('burn');
                    }, 125);
                    setTimeout(function(){
                        bang.addClass('b');
                    }, 150);
                    setTimeout(function(){
                        bang.addClass('c');
                    }, 2000);
                    setTimeout(function(){
                        big_bang();
                    }, 4000);
                    return false;
                }
                return false;
            },
            flair(){ return loc('tech_infusion_confirm_flair'); }
        },
        stabilize_blackhole: {
            id: 'tech-stabilize_blackhole',
            title: loc('tech_stabilize_blackhole'),
            desc(){ return `<div>${loc('tech_stabilize_blackhole')}</div><div class="has-text-danger">${loc('tech_stabilize_blackhole2')}</div>`; },
            category: 'stellar_engine',
            era: 'interstellar',
            reqs: { whitehole: 1 },
            grant: ['stablized',1],
            cost: {
                Knowledge(){ return 1500000; },
                Neutronium(){ return 20000; }
            },
            effect: loc('tech_stabilize_blackhole_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.interstellar.stellar_engine.mass += (atomic_mass.Neutronium * 20000 / 10000000000);
                    global.interstellar.stellar_engine.mass += global.interstellar.stellar_engine.exotic * 40;
                    global.interstellar.stellar_engine.exotic = 0;
                    delete global.tech['whitehole'];
                    return true;
                }
                return false;
            }
        },
        gravitational_waves: {
            id: 'tech-gravitational_waves',
            title: loc('tech_gravitational_waves'),
            desc: loc('tech_gravitational_waves'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { blackhole: 4 },
            grant: ['gravity',1],
            cost: {
                Knowledge(){ return 1250000; }
            },
            effect: loc('tech_gravitational_waves_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        gravity_convection: {
            id: 'tech-gravity_convection',
            title: loc('tech_gravity_convection'),
            desc: loc('tech_gravity_convection'),
            category: 'power_generation',
            era: 'interstellar',
            reqs: { gravity: 1 },
            grant: ['gravity',2],
            cost: {
                Knowledge(){ return 1350000; }
            },
            effect: loc('tech_gravity_convection_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        wormholes: {
            id: 'tech-wormholes',
            title: loc('tech_wormholes'),
            desc: loc('tech_wormholes'),
            category: 'space_exploration',
            era: 'intergalactic',
            reqs: { gravity: 1, science: 15 },
            grant: ['stargate',1],
            cost: {
                Knowledge(){ return 2250000; }
            },
            effect: loc('tech_wormholes_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        portal: {
            id: 'tech-portal',
            title: loc('tech_portal'),
            desc: loc('tech_portal_desc'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { wsc: 1 },
            grant: ['portal',1],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect: loc('tech_portal_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        fortifications: {
            id: 'tech-fortifications',
            title: loc('tech_fort'),
            desc: loc('tech_fort_desc'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 1 },
            grant: ['portal',2],
            cost: {
                Knowledge(){ return 550000; },
                Stone(){ return 1000000; }
            },
            effect: loc('tech_fort_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.showPortal = true;
                    global.settings.portal.fortress = true;
                    let tech = $(this)[0].grant[0];
                    global.tech[tech] = $(this)[0].grant[1];
                    global.portal['fortress'] = {
                        threat: 10000,
                        garrison: 0,
                        walls: 100,
                        repair: 0,
                        patrols: 0,
                        patrol_size: 10,
                        siege: 999,
                        notify: 'Yes',
                        s_ntfy: 'Yes',
                    };
                    global.portal['turret'] = { count: 0, on: 0 };
                    global.portal['carport'] = { count: 0, damaged: 0, repair: 0 };
                    if (races[global.race.species].type === 'demonic'){
                        unlockAchieve('blood_war');
                    }
                    else {
                        unlockAchieve('pandemonium');
                    }
                    return true;
                }
                return false;
            }
        },
        war_drones: {
            id: 'tech-war_drones',
            title: loc('tech_war_drones'),
            desc: loc('tech_war_drones'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 2, graphene: 1 },
            grant: ['portal',3],
            cost: {
                Knowledge(){ return 700000; },
            },
            effect: loc('tech_war_drones_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.portal.badlands = true;
                    global.portal['war_drone'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        demon_attractor: {
            id: 'tech-demon_attractor',
            title: loc('tech_demon_attractor'),
            desc: loc('tech_demon_attractor'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 3, stanene: 1 },
            grant: ['portal',4],
            cost: {
                Knowledge(){ return 745000; },
            },
            effect: loc('tech_demon_attractor_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['attractor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        combat_droids: {
            id: 'tech-combat_droids',
            title: loc('tech_combat_droids'),
            desc: loc('tech_combat_droids'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 4 },
            grant: ['portal',5],
            cost: {
                Knowledge(){ return 762000; },
                Soul_Gem(){ return 1; }
            },
            effect: loc('tech_combat_droids_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['war_droid'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            },
            flair(){
                return loc('tech_combat_droids_flair');
            }
        },
        repair_droids: {
            id: 'tech-repair_droids',
            title: loc('tech_repair_droids'),
            desc: loc('tech_repair_droids'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 5 },
            grant: ['portal',6],
            cost: {
                Knowledge(){ return 794000; },
                Soul_Gem(){ return 1; }
            },
            effect: loc('tech_repair_droids_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['repair_droid'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        advanced_predators: {
            id: 'tech-advanced_predators',
            title: loc('tech_advanced_predators'),
            desc: loc('tech_advanced_predators'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { portal: 6, xeno: 4 },
            grant: ['portal',7],
            cost: {
                Knowledge(){ return 5000000; },
                Bolognium(){ return 500000; },
                Vitreloy(){ return 250000; }
            },
            effect: loc('tech_advanced_predators_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        enhanced_droids: {
            id: 'tech-enhanced_droids',
            title: loc('tech_enhanced_droids'),
            desc: loc('tech_enhanced_droids'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 5, military: 9 },
            grant: ['hdroid',1],
            cost: {
                Knowledge(){ return 1050000; },
            },
            effect: loc('tech_enhanced_droids_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        sensor_drone: {
            id: 'tech-sensor_drone',
            title: loc('tech_sensor_drone'),
            desc: loc('tech_sensor_drone'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { portal: 3, infernite: 1, stanene: 1, graphene: 1 },
            grant: ['infernite',2],
            cost: {
                Knowledge(){ return 725000; },
            },
            effect: loc('tech_sensor_drone_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['sensor_drone'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        map_terrain: {
            id: 'tech-map_terrain',
            title: loc('tech_map_terrain'),
            desc: loc('tech_map_terrain'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { infernite: 2 },
            grant: ['infernite',3],
            cost: {
                Knowledge(){ return 948000; },
            },
            effect(){ return loc('tech_map_terrain_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        calibrated_sensors: {
            id: 'tech-calibrated_sensors',
            title: loc('tech_calibrated_sensors'),
            desc: loc('tech_calibrated_sensors'),
            category: 'hell_dimension',
            era: 'interstellar',
            reqs: { infernite: 3 },
            grant: ['infernite',4],
            cost: {
                Knowledge(){ return 1125000; },
                Infernite(){ return 3500; }
            },
            effect(){ return loc('tech_calibrated_sensors_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        shield_generator: {
            id: 'tech-shield_generator',
            title: loc('tech_shield_generator'),
            desc: loc('tech_shield_generator'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { high_tech: 14, gateway: 3, infernite: 4 },
            grant: ['infernite',5],
            cost: {
                Knowledge(){ return 2680000; },
                Bolognium(){ return 75000; }
            },
            effect(){ return loc('tech_shield_generator_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        enhanced_sensors: {
            id: 'tech-enhanced_sensors',
            title: loc('tech_enhanced_sensors'),
            desc: loc('tech_enhanced_sensors'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { infernite: 5, xeno: 4 },
            grant: ['infernite',6],
            cost: {
                Knowledge(){ return 4750000; },
                Vitreloy(){ return 25000; }
            },
            effect(){ return loc('tech_enhanced_sensors_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        xeno_linguistics: {
            id: 'tech-xeno_linguistics',
            title: loc('tech_xeno_linguistics'),
            desc: loc('tech_xeno_linguistics'),
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { xeno: 1 },
            grant: ['xeno',2],
            cost: {
                Knowledge(){ return 3000000; }
            },
            effect(){ return loc('tech_xeno_linguistics_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.settings.space['gorddon'] = true;
                    return true;
                }
                return false;
            }
        },
        xeno_culture: {
            id: 'tech-xeno_culture',
            title: loc('tech_xeno_culture'),
            desc: loc('tech_xeno_culture'),
            category: 'progress',
            era: 'intergalactic',
            reqs: { xeno: 3 },
            grant: ['xeno',4],
            cost: {
                Knowledge(){ return 3400000; }
            },
            effect(){
                let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
                let s1desc = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].entity;
                return loc('tech_xeno_culture_effect',[s1name,s1desc]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['embassy'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        cultural_exchange: {
            id: 'tech-cultural_exchange',
            title: loc('tech_cultural_exchange'),
            desc: loc('tech_cultural_exchange'),
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { xeno: 5 },
            grant: ['xeno',6],
            cost: {
                Knowledge(){ return 3550000; }
            },
            effect(){
                let s1name = races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name;
                return loc('tech_cultural_exchange_effect',[s1name]);
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['symposium'] = { count: 0, on: 0 };
                    global.galaxy['dormitory'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        shore_leave: {
            id: 'tech-shore_leave',
            title: loc('tech_shore_leave'),
            desc: loc('tech_shore_leave'),
            category: 'science',
            era: 'intergalactic',
            reqs: { andromeda: 3, xeno: 6 },
            grant: ['xeno',7],
            cost: {
                Knowledge(){ return 4600000; }
            },
            effect(){ return loc('tech_shore_leave_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        xeno_gift: {
            id: 'tech-xeno_gift',
            title: loc('tech_xeno_gift'),
            desc: loc('tech_xeno_gift'),
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { high_tech: 16, xeno: 7 },
            grant: ['xeno',8],
            cost: {
                Knowledge(){ return 6500000; },
                Infernite(){ return 125000; }
            },
            effect(){ return loc('tech_xeno_gift_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['consulate'] = { count: 0 };
                    global.settings.space.alien1 = true;
                    messageQueue(loc('tech_xeno_gift_msg',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]),'info');
                    return true;
                }
                return false;
            }
        },
        industrial_partnership: {
            id: 'tech-industrial_partnership',
            title: loc('tech_industrial_partnership'),
            desc(){ return loc('tech_industrial_partnership'); },
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { xeno: 9 },
            grant: ['xeno',10],
            cost: {
                Knowledge(){ return 7250000; }
            },
            effect(){ return loc('tech_industrial_partnership_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['vitreloy_plant'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        embassy_housing: {
            id: 'tech-embassy_housing',
            title: loc('tech_embassy_housing'),
            desc(){ return loc('tech_embassy_housing'); },
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { xeno: 10, science: 18 },
            grant: ['xeno',11],
            cost: {
                Knowledge(){ return 10750000; }
            },
            effect(){ return loc('tech_embassy_housing_effect',[races[global.galaxy.hasOwnProperty('alien1') ? global.galaxy.alien1.id : global.race.species].name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        advanced_telemetry: {
            id: 'tech-advanced_telemetry',
            title: loc('tech_advanced_telemetry'),
            desc: loc('tech_advanced_telemetry'),
            category: 'science',
            era: 'intergalactic',
            reqs: { xeno: 5 },
            grant: ['telemetry',1],
            cost: {
                Knowledge(){ return 4200000; },
                Vitreloy(){ return 10000; }
            },
            effect(){
                return loc('tech_advanced_telemetry_effect');
            },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        defense_platform: {
            id: 'tech-defense_platform',
            title: loc('galaxy_defense_platform'),
            desc: loc('galaxy_defense_platform'),
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { stargate: 5, piracy: 1 },
            grant: ['stargate',6],
            cost: {
                Knowledge(){ return 4850000; }
            },
            effect: loc('tech_defense_platform_effect'),
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['defense_platform'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        scout_ship: {
            id: 'tech-scout_ship',
            title: loc('galaxy_scout_ship'),
            desc: loc('galaxy_scout_ship'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { gateway: 3 },
            grant: ['andromeda',1],
            cost: {
                Knowledge(){ return 2600000; }
            },
            effect(){ return loc('tech_scout_ship_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['scout_ship'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    return true;
                }
                return false;
            }
        },
        corvette_ship: {
            id: 'tech-corvette_ship',
            title: loc('galaxy_corvette_ship'),
            desc: loc('galaxy_corvette_ship'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { andromeda: 1, xeno: 1 },
            grant: ['andromeda',2],
            cost: {
                Knowledge(){ return 3200000; }
            },
            effect(){ return loc('tech_corvette_ship_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['corvette_ship'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    return true;
                }
                return false;
            }
        },
        frigate_ship: {
            id: 'tech-frigate_ship',
            title: loc('galaxy_frigate_ship'),
            desc: loc('galaxy_frigate_ship'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { andromeda: 2, xeno: 6 },
            grant: ['andromeda',3],
            cost: {
                Knowledge(){ return 4000000; }
            },
            effect(){ return loc('tech_frigate_ship_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['frigate_ship'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    renderSpace();
                    return true;
                }
                return false;
            }
        },
        cruiser_ship: {
            id: 'tech-cruiser_ship',
            title: loc('galaxy_cruiser_ship'),
            desc: loc('galaxy_cruiser_ship'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { andromeda: 3, xeno: 10 },
            grant: ['andromeda',4],
            cost: {
                Knowledge(){ return 7500000; }
            },
            effect(){ return loc('tech_cruiser_ship_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['cruiser_ship'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    global.galaxy['foothold'] = { count: 0, on: 0, support: 0, s_max: 0 };
                    global.settings.space.alien2 = true;
                    renderSpace();
                    return true;
                }
                return false;
            }
        },
        dreadnought: {
            id: 'tech-dreadnought',
            title: loc('galaxy_dreadnought'),
            desc: loc('galaxy_dreadnought'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { andromeda: 4, science: 18 },
            grant: ['andromeda',5],
            cost: {
                Knowledge(){ return 10000000; }
            },
            effect(){ return loc('tech_dreadnought_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['dreadnought'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    renderSpace();
                    return true;
                }
                return false;
            }
        },
        ship_dock: {
            id: 'tech-ship_dock',
            title: loc('galaxy_ship_dock'),
            desc: loc('galaxy_ship_dock'),
            category: 'andromeda_ships',
            era: 'intergalactic',
            reqs: { gateway: 3, xeno: 6 },
            grant: ['gateway',4],
            cost: {
                Knowledge(){ return 3900000; }
            },
            effect(){ return loc('tech_ship_dock_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['ship_dock'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        ore_processor: {
            id: 'tech-ore_processor',
            title: loc('galaxy_ore_processor'),
            desc: loc('galaxy_ore_processor'),
            category: 'space_mining',
            era: 'intergalactic',
            reqs: { conflict: 2 },
            grant: ['conflict',3],
            cost: {
                Knowledge(){ return 7500000; }
            },
            effect(){ return loc('tech_ore_processor_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['ore_processor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        scavenger: {
            id: 'tech-scavenger',
            title: loc('galaxy_scavenger'),
            desc: loc('galaxy_scavenger'),
            category: 'science',
            era: 'intergalactic',
            reqs: { conflict: 3 },
            grant: ['conflict',4],
            cost: {
                Knowledge(){ return 8000000; }
            },
            effect(){ return loc('tech_scavenger_effect',[races[global.galaxy.hasOwnProperty('alien2') ? global.galaxy.alien2.id : global.race.species].name]); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['scavenger'] = { count: 0, on: 0, crew: 0 };
                    return true;
                }
                return false;
            }
        },
        coordinates: {
            id: 'tech-coordinates',
            title: loc('tech_coordinates'),
            desc: loc('tech_coordinates'),
            category: 'andromeda',
            era: 'intergalactic',
            reqs: { science: 18, conflict: 5 },
            grant: ['chthonian',1],
            cost: {
                Knowledge(){ return 10000000; }
            },
            effect(){ return loc('tech_coordinates_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['minelayer'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    global.settings.space.chthonian = true;
                    return true;
                }
                return false;
            }
        },
        chthonian_survey : {
            id: 'tech-chthonian_survey',
            title: loc('tech_chthonian_survey'),
            desc: loc('tech_chthonian_survey'),
            category: 'space_mining',
            era: 'intergalactic',
            reqs: { chthonian: 2 },
            grant: ['chthonian',3],
            cost: {
                Knowledge(){ return 11800000; }
            },
            effect(){ return loc('tech_chthonian_survey_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.resource.Orichalcum.display = true;
                    global.galaxy['excavator'] = { count: 0, on: 0 };
                    global.galaxy['raider'] = { count: 0, on: 0, crew: 0, mil: 0 };
                    messageQueue(loc('tech_chthonian_survey_result'),'info');
                    return true;
                }
                return false;
            }
        },
        gateway_depot: {
            id: 'tech-gateway_depot',
            title: loc('galaxy_gateway_depot'),
            desc: loc('galaxy_gateway_depot'),
            category: 'storage',
            era: 'intergalactic',
            reqs: { gateway: 4 },
            grant: ['gateway',5],
            cost: {
                Knowledge(){ return 4350000; }
            },
            effect(){ return loc('tech_gateway_depot_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.galaxy['gateway_depot'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_forge: {
            id: 'tech-soul_forge',
            title: loc('portal_soul_forge_title'),
            desc: loc('portal_soul_forge_title'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_pit: 3 },
            grant: ['hell_pit',4],
            cost: {
                Knowledge(){ return 2750000; }
            },
            effect(){ return loc('tech_soul_forge_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['soul_forge'] = { count: 0, on: 0, kills: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_attractor: {
            id: 'tech-soul_attractor',
            title: loc('portal_soul_attractor_title'),
            desc: loc('portal_soul_attractor_title'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_pit: 4, high_tech: 16 },
            grant: ['hell_pit',5],
            cost: {
                Knowledge(){ return 5500000; }
            },
            effect(){ return loc('tech_soul_attractor_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['soul_attractor'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        soul_absorption: {
            id: 'tech-soul_absorption',
            title: loc('tech_soul_absorption'),
            desc: loc('tech_soul_absorption'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_pit: 5 },
            grant: ['hell_pit',6],
            cost: {
                Knowledge(){ return 6000000; },
                Infernite(){ return 250000; }
            },
            effect(){ return loc('tech_soul_absorption_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        soul_link: {
            id: 'tech-soul_link',
            title: loc('tech_soul_link'),
            desc: loc('tech_soul_link'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_pit: 6 },
            grant: ['hell_pit',7],
            cost: {
                Knowledge(){ return 7500000; },
                Vitreloy(){ return 250000; }
            },
            effect(){ return loc('tech_soul_link_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        gun_emplacement: {
            id: 'tech-gun_emplacement',
            title: loc('portal_gun_emplacement_title'),
            desc: loc('portal_gun_emplacement_title'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_pit: 4 },
            grant: ['hell_gun',1],
            cost: {
                Knowledge(){ return 3000000; }
            },
            effect(){ return loc('tech_gun_emplacement_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    global.portal['gun_emplacement'] = { count: 0, on: 0 };
                    return true;
                }
                return false;
            }
        },
        advanced_emplacement: {
            id: 'tech-advanced_emplacement',
            title: loc('tech_advanced_emplacement'),
            desc: loc('tech_advanced_emplacement'),
            category: 'hell_dimension',
            era: 'intergalactic',
            reqs: { hell_gun: 1, high_tech: 17 },
            grant: ['hell_gun',2],
            cost: {
                Knowledge(){ return 12500000; },
                Orichalcum(){ return 180000; }
            },
            effect(){ return loc('tech_advanced_emplacement_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        },
        dial_it_to_11: {
            id: 'tech-dial_it_to_11',
            title: loc('tech_dial_it_to_11'),
            desc: loc('tech_dial_it_to_11'),
            category: 'science',
            wiki: false,
            era: 'deep_space',
            reqs: { quaked: 1 },
            grant: ['quaked',2],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect(){
                let gains = calcPrestige('bioseed');
                let plasmidType = global.race.universe === 'antimatter' ? loc('resource_AntiPlasmid_plural_name') : loc('resource_Plasmid_plural_name');
                return `<div>${loc('tech_dial_it_to_11_effect',[races[global.race.species].solar.dwarf,global.race['cataclysm'] ? races[global.race.species].solar.red : races[global.race.species].home])}</div><div class="has-text-danger">${loc('tech_dial_it_to_11_effect2')}</div><div class="has-text-special">${loc('star_dock_genesis_effect2',[gains.plasmid,plasmidType])}</div><div class="has-text-special">${loc('star_dock_genesis_effect3',[gains.phage])}</div>`; },
            action(){
                if (payCosts($(this)[0].cost)){
                    $('#main').addClass('earthquake');
                    setTimeout(function(){
                        $('#main').removeClass('earthquake');
                        cataclysm_end();
                    }, 4000);
                    return true;
                }
                return false;
            },
            flair(){ return loc('tech_dial_it_to_11_flair'); }
        },
        limit_collider: {
            id: 'tech-limit_collider',
            title: loc('tech_limit_collider'),
            desc: loc('tech_limit_collider'),
            category: 'science',
            wiki: false,
            era: 'deep_space',
            reqs: { quaked: 1 },
            grant: ['quaked',2],
            cost: {
                Knowledge(){ return 500000; }
            },
            effect(){ return loc('tech_limit_collider_effect'); },
            action(){
                if (payCosts($(this)[0].cost)){
                    return true;
                }
                return false;
            }
        }
    },
    genes: arpa('GeneTech'),
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
    if (global.race.universe === 'antimatter'){
        let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 0.8 : 0.5;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            faith += global.civic.professor.workers * 0.02;
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.015 : (global.genes['ancients'] >= 3 ? 0.0125 : 0.01);
            faith += priest_bonus * global.civic.priest.workers;
        }
        if (global.race['spiritual']){
            faith *= 1 + (traits.spiritual.vars[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            faith *= 1.12;
        }
        faith = +(faith).toFixed(3);
        let temple = 6;
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest = global.genes['ancients'] >= 4 ? 0.12 : 0.08;
            temple += priest * global.civic.priest.workers;
        }
        desc = `<div>${loc('city_temple_effect1',[faith])}</div><div>${loc('city_temple_effect5',[temple])}</div>`;
    }
    else if (global.race['no_plasmid']){
        let faith = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 1.6 : 1;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            faith += +(global.civic.professor.workers * 0.04).toFixed(2);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.015 : (global.genes['ancients'] >= 3 ? 0.0125 : 0.01);
            faith += priest_bonus * global.civic.priest.workers;
        }
        if (global.race['spiritual']){
            faith *= 1 + (traits.spiritual.vars[0] / 100);
        }
        if (global.civic.govern.type === 'theocracy'){
            faith *= 1.12;
        }
        faith = +(faith).toFixed(3);
        desc = `<div>${loc('city_temple_effect1',[faith])}</div>`;
    }
    else {
        let plasmid = global.tech['anthropology'] && global.tech['anthropology'] >= 1 ? 8 : 5;
        if (global.tech['fanaticism'] && global.tech['fanaticism'] >= 2){
            plasmid += +(global.civic.professor.workers * 0.2).toFixed(1);
        }
        if (global.genes['ancients'] && global.genes['ancients'] >= 2 && global.civic.priest.display){
            let priest_bonus = global.genes['ancients'] >= 5 ? 0.015 : (global.genes['ancients'] >= 3 ? 0.0125 : 0.01);
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
    money = '$'+money;
    let joy = global.race['joyless'] ? '' : `<div>${loc('city_max_entertainer',[1])}</div>`;
    let desc = `<div>${loc('plus_max_resource',[money,loc('resource_Money_name')])}</div>${joy}<div>${loc('city_max_morale')}</div>`;
    let cash = Math.log2(global.resource[global.race.species].amount) * (global.race['gambler'] ? 2.5 + (global.race['gambler'] / 10) : 2.5);
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

function checkPowerRequirements(c_action){
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
    var id = c_action.id;
    removeAction(id);
    var parent = c_action['highlight'] && c_action.highlight() ? $(`<div id="${id}" class="action hl"></div>`) : $(`<div id="${id}" class="action"></div>`);
    if (!checkAffordable(c_action)){
        parent.addClass('cna');
    }
    if (!checkAffordable(c_action,true)){
        parent.addClass('cnam');
    }
    if (old){
        var element = $('<span class="oldTech is-dark"><span class="aTitle">{{ title }}</span></span>');
        parent.append(element);
    }
    else {
        let cst = '';
        let data = '';
        if (c_action['cost']){
            var costs = adjustCosts(c_action.cost);
            Object.keys(costs).forEach(function (res){
                let cost = costs[res]();
                if (cost > 0){
                    cst = cst + ` res-${res}`;
                    data = data + ` data-${res}="${cost}"`;
                }
            });
        }

        var element = $(`<a class="button is-dark${cst}"${data} v-on:click="action"><span class="aTitle">{{ title }}</span></a><a v-on:click="describe" class="is-sr-only">{{ title }} description</a>`);
        parent.append(element);
    }

    if (c_action['special'] && (type !== 'geothermal' || global.race['cataclysm'])){
        var special = $(`<div class="special" role="button" title="${type} options" @click="trigModal"><svg version="1.1" x="0px" y="0px" width="12px" height="12px" viewBox="340 140 280 279.416" enable-background="new 340 140 280 279.416" xml:space="preserve">
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
        var powerOn = $(`<span role="button" :aria-label="on_label()" class="on" @click="power_on" title="ON" v-html="$options.filters.p_on(act.on,'${c_action.id}')"></span>`);
        var powerOff = $(`<span role="button" :aria-label="off_label()" class="off" @click="power_off" title="OFF" v-html="$options.filters.p_off(act.on,'${c_action.id}')"></span>`);
        parent.append(powerOn);
        parent.append(powerOff);
    }
    if (action !== 'tech' && global[action] && global[action][type] && global[action][type].count >= 0){
        element.append($('<span class="count">{{ act.count }}</span>'));
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

    var modal = {
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
                            if (c_action.action()){
                                gainGene(type);
                                if (c_action['post']){
                                    setTimeout(function(){
                                        c_action.post();
                                    }, 250);
                                }
                            }
                            break;
                        default:
                            if (keyMap.d && 1 === 2){
                                if (global[action][type]['count'] && global[action][type]['count'] > 0){
                                    global[action][type]['count']--;
                                    if (global[action][type]['on'] && global[action][type]['on'] > global[action][type]['count']){
                                        global[action][type]['on']--;
                                    }
                                    if (global[action][type]['count'] === 0){
                                        drawCity();
                                        renderSpace();
                                        var id = c_action.id;
                                        $(`#pop${id}`).hide();
                                        if (poppers[id]){
                                            poppers[id].destroy();
                                        }
                                        clearElement($(`#pop${id}`),true);
                                    }
                                    else {
                                        updateDesc(c_action,action,type);
                                    }
                                }
                                break;
                            }
                            else {
                                let keyMult = keyMultiplier();
                                if (c_action['grant']){
                                    keyMult = 1;
                                }
                                let grant = false;
                                let add_queue = false;
                                let no_queue = action === 'evolution' || (c_action['no_queue'] && c_action['no_queue']()) ? true : false;
                                for (var i=0; i<keyMult; i++){
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
                                            for (var j=0; j<global.queue.queue.length; j++){
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
                this.$buefy.modal.open({
                    parent: this,
                    component: modal
                });

                var checkExist = setInterval(function() {
                   if ($('#modalBox').length > 0) {
                      clearInterval(checkExist);
                      drawModal(c_action,type);
                   }
                }, 50);
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
        var costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res){
            if (res === 'Structs'){
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
            else if (res === 'Plasmid' || res === 'Phage'){
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

    if (c_action['category'] && c_action.id.substring(0,4) === 'tech' && !old){
        parent.append($(`<div class="has-text-flair">${loc('tech_dist_category')}: ${loc(`tech_dist_${c_action.category}`)}</div>`));
    }

    let tc = timeCheck(c_action,false,true);
    if (c_action.cost && !old){
        var cost = $('<div></div>');

        var costs = adjustCosts(c_action.cost);
        Object.keys(costs).forEach(function (res){
            if (res === 'Structs'){
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
                        cost.append($(`<div class="${color}">${label}: ${res_cost}</div>`));
                    });
                });
            }
            else if (res === 'Plasmid' || res === 'Phage'){
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
                        cost.append($(`<div class="${color}" data-${res}="${res_cost}">${label}${display_cost}</div>`));
                    }
                }
            }
        });
        parent.append(cost);
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
    if (!old && !checkAffordable(c_action) && checkAffordable(c_action,true)){
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
            if (res === 'Plasmid' || res === 'Phage'){
                let cost = costs[res]();
                if (res === 'Plasmid' && global.race.universe === 'antimatter'){
                    global.race.Plasmid.anti -= cost;
                }
                else {
                    global.race[res].count -= cost;
                }
            }
            else if (res !== 'Morale' && res !== 'Army' && res !== 'HellArmy' && res !== 'Structs' && res !== 'Bool'){
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
        if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage'){
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

function checkCosts(costs){
    var test = true;
    Object.keys(costs).forEach(function (res){
        if (res === 'Structs'){
            if (!checkStructs(costs[res]())){
                test = false;
                return;
            }
        }
        else if (res === 'Plasmid' || res === 'Phage'){
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

export function evoProgress(){
    clearElement($('#evolution .evolving'),true);
    let progress = $(`<div class="evolving"><progress class="progress" value="${global.evolution.final}" max="100">${global.evolution.final}%</progress></div>`);
    $('#evolution').append(progress);
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

function sentience(){
    if (global.resource.hasOwnProperty('RNA')){
        global.resource.RNA.display = false;
    }
    if (global.resource.hasOwnProperty('DNA')){
        global.resource.DNA.display = false;
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
    if (global.race.species === 'elven' && date.getMonth() === 11 && date.getDate() >= 17){
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
        global.city['lumber'] = 1;
    }
    else {
        global.resource.Stone.display = true;
        global.city['stone'] = 1;
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
            let universes = ['h','a','e','m'];
            for (let i=0; i<universes.length; i++){
                if (global.stats.achieve.technophobe[universes[i]] && global.stats.achieve.technophobe[universes[i]] >= 5){
                    gems++;
                }
            }
            global.resource.Soul_Gem.amount = gems;
        }
    }

    if (global.race['cataclysm']){
        cataclysm();
    }

    if (global.race['slow'] || global.race['hyper']){
        save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
        if (webWorker.w){
            webWorker.w.terminate();
        }
        window.location.reload();
    }

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
        global.city['foundry'] = { count: 0, crafting: 0, Plywood: 0, Brick: 0, Bronze: 0, Wrought_Iron: 0, Sheet_Metal: 0, Mythril: 0, Aerogel: 0, Nanoweave: 0 };
        global.city['smelter'] = { count: 0, cap: 2, Wood: 0, Coal: 0, Oil: 2, Iron: 1, Steel: 1 };
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

function fanaticism(god){
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

export function resDragQueue(){
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

function cataclysm_end(){
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

        global['race'] = {
            species : global.race.species,
            gods: global.race.gods,
            old_gods: global.race.old_gods,
            rapid_mutation: 1,
            ancient_ruins: 1,
            Plasmid: { count: plasmid, anti: antiplasmid },
            Phage: { count: phage },
            Dark: { count: global.race.Dark.count },
            Harmony: { count: global.race.Harmony.count },
            universe: global.race.universe,
            seeded: false,
            ascended: global.race.hasOwnProperty('ascended') ? global.race.ascended : false,
        };
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

function big_bang(){
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
        default:
            unlockAchieve(`whitehole`);
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
    global.stats.universes++;
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
        ascended: false,
    };
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
