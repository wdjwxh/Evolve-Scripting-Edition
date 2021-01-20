import { keyMultiplier, keyMap, global, breakdown } from './vars.js';
import { deepClone, adjustCosts, messageQueue } from './functions.js';
import { traits, races } from './races.js';
import { craftingRatio, craftCost, tradeRatio, atomic_mass, tradeBuyPrice, tradeSellPrice } from './resources.js';
import { checkOldTech, actions, checkTechRequirements, checkAffordable } from './actions.js';
import { fuel_adjust, int_fuel_adjust } from './space.js';
import { f_rate } from './industry.js';
import { armyRating } from './civics.js';
import { alevel } from './achieve.js';
import { loc } from './locale.js';
import { arpaAdjustCosts, arpaProjects } from './arpa.js';

export function enableDebug(){
    //if (global.settings.expose){
        window.evolve = {
            // actions: deepClone(actions),
            // races: deepClone(races),
            // tradeRatio: JSON.parse(JSON.stringify(tradeRatio)),
            // craftCost: JSON.parse(JSON.stringify(craftCost())),
            // atomic_mass: JSON.parse(JSON.stringify(atomic_mass)),
            // f_rate: JSON.parse(JSON.stringify(f_rate)),
            // checkTechRequirements: deepClone(checkTechRequirements),
            // checkAffordable: deepClone(checkAffordable),
            // adjustCosts: deepClone(adjustCosts),
            // armyRating: deepClone(armyRating),
            // tradeBuyPrice: deepClone(tradeBuyPrice),
            // tradeSellPrice: deepClone(tradeSellPrice),
            // fuel_adjust: deepClone(fuel_adjust),
            // int_fuel_adjust: deepClone(int_fuel_adjust),
            // alevel: deepClone(alevel),
            // messageQueue: deepClone(messageQueue),
            // loc: deepClone(loc),
            // updateDebugData: deepClone(updateDebugData),
            // global: {},
            // breakdown: {},

            actions: actions,
            races: races,
            tradeRatio: tradeRatio,
            craftCost: craftCost,
            atomic_mass: atomic_mass,
            checkTechRequirements: checkTechRequirements,
            global: global,
            breakdown: breakdown,
    
            craftingRatio: craftingRatio,
            armyRating: armyRating,
            keyMultiplier: keyMultiplier,
            checkAffordable: checkAffordable,
            checkOldTech: checkOldTech,
            f_rate: f_rate,
            adjustCosts: adjustCosts,
            arpaAdjustCosts: arpaAdjustCosts,
            arpaProjects: arpaProjects,
            loc: loc,
            updateDebugData: updateDebugData,
            messageQueue: messageQueue,
            tradeSellPrice: tradeSellPrice,
            tradeBuyPrice: tradeBuyPrice,
            keyMap: keyMap,
            traits: traits,

            fuel_adjust: fuel_adjust,
            int_fuel_adjust: int_fuel_adjust,
            alevel: alevel,
    
            document: document,
        };
    //}
}

export function updateDebugData(){
    //if (global.settings.expose){
        window.evolve.global = JSON.parse(JSON.stringify(global));
        window.evolve.craftCost = JSON.parse(JSON.stringify(craftCost())),
        window.evolve.breakdown = JSON.parse(JSON.stringify(breakdown));
    //}
}
