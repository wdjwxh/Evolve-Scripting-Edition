import { global, tmp_vars, save, webWorker } from './vars.js';
import { loc, locales } from './locale.js';
import { setupStats } from './achieve.js';
import { vBind, clearElement, gameLoop, powerGrid, easterEgg, trickOrTreat } from './functions.js';
import { races } from './races.js';
import { tradeRatio, atomic_mass, supplyValue, marketItem, containerItem, loadEjector, loadSupply, loadAlchemy, initResourceTabs, tradeSummery } from './resources.js';
import { defineJobs, } from './jobs.js';
import { setPowerGrid, gridDefs, clearGrids } from './industry.js';
import { defineGovernment, defineIndustry, defineGarrison, buildGarrison, commisionGarrison, foreignGov } from './civics.js';
import { drawCity, drawTech, resQueue, clearResDrag } from './actions.js';
import { renderSpace } from './space.js';
import { renderFortress, buildFortress, drawMechLab } from './portal.js';
import { arpa } from './arpa.js';
import { playFabStats } from './playfab.js';

export function mainVue(){
    vBind({
        el: '#mainColumn div:first-child',
        data: {
            s: global.settings,
            rq: global.r_queue,
            playFabStats: playFabStats,
        },
        methods: {
            swapTab(tab){
                if (!global.settings.tabLoad){
                    loadTab(tab);
                }
                return tab;
            },
            saveImport(){
                if ($('#importExport').val().length > 0){
                    importGame($('#importExport').val());
                }
            },
            saveExport(){
                $('#importExport').val(exportGame());
                $('#importExport').select();
                document.execCommand('copy');
            },
            restoreGame(){
                let restore_data = save.getItem('evolveBak') || false;
                if (restore_data){
                    importGame(restore_data,true);
                }
            },
            lChange(locale){
                global.settings.locale = locale;
                global.queue.rename = true;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            setTheme(theme){
                global.settings.theme = theme;
                $('html').removeClass();
                $('html').addClass(theme);
            },
            numNotation(notation){
                global.settings.affix = notation;
            },
            icon(icon){
                global.settings.icon = icon;
                save.setItem('evolved',LZString.compressToUTF16(JSON.stringify(global)));
                if (webWorker.w){
                    webWorker.w.terminate();
                }
                window.location.reload();
            },
            locString(s){
                return loc(s);
            },
            remove(index){
                global.r_queue.queue.splice(index,1);
            },
            font(f){
                global.settings.font = f;
                $(`html`).removeClass('standard');
                $(`html`).removeClass('large_log');
                $(`html`).removeClass('large_all');
                $('html').addClass(f);
            },
            toggleTabLoad(){
                initTabs();
            },
            unpause(){
                $(`#pausegame`).removeClass('play');
                $(`#pausegame`).removeClass('pause');
                if (global.settings.pause){
                    $(`#pausegame`).addClass('pause');
                }
                else {
                    $(`#pausegame`).addClass('play');
                }
                if (!global.settings.pause && !webWorker.s){
                    gameLoop('start');
                }
            }
        },
        filters: {
            namecase(name){
                return name.replace(/(?:^|\s)\w/g, function(match) {
                    return match.toUpperCase();
                });
            },
            label(lbl){
                return tabLabel(lbl);
            },
            notation(n){
                switch (n){
                    case 'si':
                        return loc(`metric`);
                    case 'sci':
                        return loc(`scientific`);
                    case 'sln':
                        return loc(`sln`);
                }
            }
        }
    });
}

function tabLabel(lbl){
    switch (lbl){
        case 'city':
            if (global.resource[global.race.species]){
                if (global.resource[global.race.species].amount <= 5){
                    return loc('tab_city1');
                }
                else if (global.resource[global.race.species].amount <= 20){
                    return loc('tab_city2');
                }
                else if (global.resource[global.race.species].amount <= 75){
                    return loc('tab_city3');
                }
                else if (global.resource[global.race.species].amount <= 250){
                    return loc('tab_city4');
                }
                else if (global.resource[global.race.species].amount <= 600){
                    return loc('tab_city5');
                }
                else if (global.resource[global.race.species].amount <= 1200){
                    return loc('tab_city6');
                }
                else if (global.resource[global.race.species].amount <= 2500){
                    return loc('tab_city7');
                }
                else {
                    return loc('tab_city8');
                }
            }
            else {
                return loc('tab_city1');
            }
        case 'local_space':
            return loc('sol_system',[races[global.race.species].name]);
        case 'old':
            return loc('tab_old_res');
        case 'new':
            return loc('tab_new_res');
        case 'old_sr':
            return loc('tab_old_sr_res');
        case 'new_sr':
            return loc('tab_new_sr_res');
        default:
            return loc(lbl);
    }
}

export function initTabs(){
    // Scripting requires preloaded tab data
    global.settings.tabLoad = true;
    if (global.settings.tabLoad){
        loadTab(`mTabCivil`);
        loadTab(`mTabCivic`);
        loadTab(`mTabResearch`);
        loadTab(`mTabResource`);
        loadTab(`mTabArpa`);
        loadTab(`mTabStats`);
    }
    else {
        loadTab(global.settings.civTabs);
    }
}

export function loadTab(tab){
    if (!global.settings.tabLoad){
        clearResDrag();
        clearGrids();
        clearElement($(`#mTabCivil`));
        clearElement($(`#mTabCivic`));
        clearElement($(`#mTabResearch`));
        clearElement($(`#mTabResource`));
        clearElement($(`#mTabArpa`));
        clearElement($(`#mTabStats`));
    }
    switch (tab){
        case 1:
        case 'mTabCivil':
            {
                $(`#mTabCivil`).append(`<b-tabs class="resTabs" v-model="s.spaceTabs" :animated="s.animated" @input="swapTab">
                    <b-tab-item id="city" :visible="s.showCity">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'city' | label }}</h2>
                            <span aria-hidden="true">{{ 'city' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="space" :visible="s.showSpace">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'local_space' | label }}</h2>
                            <span aria-hidden="true">{{ 'local_space' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="interstellar" :visible="s.showDeep">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_interstellar' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_interstellar' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="galaxy" :visible="s.showGalactic">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_galactic' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_galactic' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="portal" :visible="s.showPortal">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_portal' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_portal' | label }}</span>
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivil`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearElement($(`#city`));
                                clearElement($(`#space`));
                                clearElement($(`#interstellar`));
                                clearElement($(`#galaxy`));
                                clearElement($(`#portal`));
                                switch (tab){
                                    case 0:
                                        drawCity();
                                        break;
                                    case 1:
                                    case 2:
                                    case 3:
                                        renderSpace();
                                        break;
                                    case 4:
                                        renderFortress();
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                if (global.race.species !== 'protoplasm'){
                    drawCity();
                    renderSpace();
                    renderFortress();
                }
            }
            break;
        case 2:
        case 'mTabCivic':
            {
                $(`#mTabCivic`).append(`<b-tabs class="resTabs" v-model="s.govTabs" :animated="s.animated" @input="swapTab">
                    <b-tab-item id="civic">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_gov' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_gov' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="industry" class="industryTab" :visible="s.showIndustry">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_industry' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_industry' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="powerGrid" class="powerGridTab" :visible="s.showPowerGrid">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_power_grid' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_power_grid' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="military" class="militaryTab" :visible="s.showMil">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_military' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_military' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="mechLab" class="mechTab" :visible="s.showMechLab">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'tab_mech' | label }}</h2>
                            <span aria-hidden="true">{{ 'tab_mech' | label }}</span>
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabCivic`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearGrids();
                                clearElement($(`#civic`));
                                clearElement($(`#industry`));
                                clearElement($(`#powerGrid`));
                                clearElement($(`#military`));
                                clearElement($(`#mechLab`));
                                switch (tab){
                                    case 0:
                                        {
                                            $('#civic').append($('<div id="civics" class="tile is-parent"></div>'));
                                            defineJobs();
                                            $('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent civics"></div>'));
                                            defineGovernment();
                                            if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                                commisionGarrison();
                                                buildGarrison($('#c_garrison'),false);
                                                foreignGov();
                                            }
                                        }
                                        break;
                                    case 1:
                                        defineIndustry();
                                        break;
                                    case 2:
                                        {
                                            Object.keys(gridDefs()).forEach(function(gridtype){
                                                powerGrid(gridtype);
                                            });
                                            setPowerGrid();
                                        }
                                        break;
                                    case 3:
                                        if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            defineGarrison();
                                            buildFortress($('#fortress'),false);
                                        }
                                        break;
                                    case 4:
                                        if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                                            drawMechLab();
                                        }
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });

                Object.keys(gridDefs()).forEach(function(gridtype){
                    powerGrid(gridtype);
                });
                setPowerGrid();

                $('#civic').append($('<div id="civics" class="tile is-parent"></div>'));
                defineJobs();
                $('#civics').append($('<div id="r_civics" class="tile is-vertical is-parent civics"></div>'));
                defineGovernment();
                if (global.race.species !== 'protoplasm' && !global.race['start_cataclysm']){
                    defineGarrison();
                    buildGarrison($('#c_garrison'),false);
                    buildFortress($('#fortress'),false);
                    foreignGov();
                    drawMechLab();
                }
                defineIndustry();
            }
            break;
        case 3:
        case 'mTabResearch':
            {
                $(`#mTabResearch`).append(`<div id="resQueue" class="resQueue" v-show="rq.display"></div>
                <b-tabs class="resTabs" v-model="s.resTabs" :animated="s.animated">
                    <b-tab-item id="tech">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'new_sr' | label }}</h2>
                            <span aria-hidden="true">{{ 'new' | label }}</span>
                        </template>
                    </b-tab-item>
                    <b-tab-item id="oldTech">
                        <template slot="header">
                            <h2 class="is-sr-only">{{ 'old_sr' | label }}</h2>
                            <span aria-hidden="true">{{ 'old' | label }}</span>
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabResearch`,
                    data: {
                        s: global.settings,
                        rq: global.r_queue
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                resQueue();
                if (global.race.species !== 'protoplasm'){
                    drawTech();
                }
            }
            break;
        case 4:
        case 'mTabResource':
            {
                $(`#mTabResource`).append(`<b-tabs class="resTabs" v-model="s.marketTabs" :animated="s.animated" @input="swapTab">
                    <b-tab-item id="market" :visible="s.showMarket">
                        <template slot="header">
                            {{ 'tab_market' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="resStorage" :visible="s.showStorage">
                        <template slot="header">
                            {{ 'tab_storage' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="resEjector" :visible="s.showEjector">
                        <template slot="header">
                            {{ 'tab_ejector' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="resCargo" :visible="s.showCargo">
                        <template slot="header">
                            {{ 'tab_cargo' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="resAlchemy" :visible="s.showAlchemy">
                        <template slot="header">
                            {{ 'tab_alchemy' | label }}
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabResource`,
                    data: {
                        s: global.settings
                    },
                    methods: {
                        swapTab(tab){
                            if (!global.settings.tabLoad){
                                clearElement($(`#market`));
                                clearElement($(`#resStorage`));
                                clearElement($(`#resEjector`));
                                clearElement($(`#resCargo`));
                                clearElement($(`#resAlchemy`));
                                switch (tab){
                                    case 0:
                                        {
                                            initResourceTabs('market');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let tradable = tmp_vars.resource[name].tradable;
                                                    if (tradable){
                                                        var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                                                        $('#market').append(market_item);
                                                        marketItem(`#market-${name}`,market_item,name,color,true);
                                                    }
                                                });
                                            }
                                            tradeSummery();
                                        }
                                        break;
                                    case 1:
                                        {
                                            initResourceTabs('storage');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let stackable = tmp_vars.resource[name].stackable;
                                                    if (stackable){
                                                        var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                                                        $('#resStorage').append(market_item);
                                                        containerItem(`#stack-${name}`,market_item,name,color,true);
                                                    }
                                                });
                                            }
                                            tradeSummery();
                                        }
                                        break;
                                    case 2:
                                        {
                                            initResourceTabs('ejector');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    if (atomic_mass[name]){
                                                        loadEjector(name,color);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case 3:
                                        {
                                            initResourceTabs('supply');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    if (supplyValue[name]){
                                                        loadSupply(name,color);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                    case 4:
                                        {
                                            initResourceTabs('alchemy');
                                            if (tmp_vars.hasOwnProperty('resource')){
                                                Object.keys(tmp_vars.resource).forEach(function(name){
                                                    let color = tmp_vars.resource[name].color;
                                                    let tradable = tmp_vars.resource[name].tradable;
                                                    if (tradeRatio[name] && global.race.universe === 'magic'){
                                                        global['resource'][name]['basic'] = tradable;
                                                        loadAlchemy(name,color,tradable);
                                                    }
                                                });
                                            }
                                        }
                                        break;
                                }
                            }
                            return tab;
                        }
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });

                initResourceTabs();
                if (tmp_vars.hasOwnProperty('resource')){
                    Object.keys(tmp_vars.resource).forEach(function(name){
                        let color = tmp_vars.resource[name].color;
                        let tradable = tmp_vars.resource[name].tradable;
                        let stackable = tmp_vars.resource[name].stackable;

                        if (stackable){
                            var market_item = $(`<div id="stack-${name}" class="market-item" v-show="display"></div>`);
                            $('#resStorage').append(market_item);
                            containerItem(`#stack-${name}`,market_item,name,color,true);
                        }

                        if (tradable){
                            var market_item = $(`<div id="market-${name}" class="market-item" v-show="r.display"></div>`);
                            $('#market').append(market_item);
                            marketItem(`#market-${name}`,market_item,name,color,true);
                        }
                    
                        if (atomic_mass[name]){
                            loadEjector(name,color);
                        }
                    
                        if (supplyValue[name]){
                            loadSupply(name,color);
                        }
                    
                        if (tradeRatio[name] && global.race.universe === 'magic'){
                            global['resource'][name]['basic'] = tradable;
                            loadAlchemy(name,color,tradable);
                        }
                    });
                }
                tradeSummery();
            }
            break;
        case 5:
        case 'mTabArpa':
            {
                $(`#mTabArpa`).append(`<div id="apra" class="arpa">
                    <b-tabs class="resTabs" v-model="s.arpa.arpaTabs" :animated="s.animated">
                        <b-tab-item id="arpaPhysics" :visible="s.arpa.physics" label="${loc('tab_arpa_projects')}"></b-tab-item>
                        <b-tab-item id="arpaGenetics" :visible="s.arpa.genetics" label="${loc('tab_arpa_genetics')}"></b-tab-item>
                        <b-tab-item id="arpaCrispr" :visible="s.arpa.crispr" label="${loc('tab_arpa_crispr')}"></b-tab-item>
                        <b-tab-item id="arpaBlood" :visible="s.arpa.blood" label="${loc('tab_arpa_blood')}"></b-tab-item>
                    </b-tabs>
                </div>`);
                vBind({
                    el: `#mTabArpa`,
                    data: {
                        s: global.settings
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                arpa('Physics');
                arpa('Genetics');
                arpa('Crispr');
                arpa('Blood');
            }
            break;
        case 6:
        case 'mTabStats':
            {
                $(`#mTabStats`).append(`<b-tabs class="resTabs" v-model="s.statsTabs" :animated="s.animated">
                    <b-tab-item id="stats">
                        <template slot="header">
                            {{ 'tab_stats' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="achieve">
                        <template slot="header">
                            {{ 'tab_achieve' | label }}
                        </template>
                    </b-tab-item>
                    <b-tab-item id="perks">
                        <template slot="header">
                            {{ 'tab_perks' | label }}
                        </template>
                    </b-tab-item>
                </b-tabs>`);
                vBind({
                    el: `#mTabStats`,
                    data: {
                        s: global.settings
                    },
                    filters: {
                        label(lbl){
                            return tabLabel(lbl);
                        }
                    }
                });
                setupStats();
            }
            break;
    }
}


export function index(){
    clearElement($('body'));

    $('html').addClass(global.settings.font);

    // Top Bar
    $('body').append(`<div id="topBar" class="topBar">
        <h2 class="is-sr-only">Top Bar</h2>
        <span class="planetWrap"><span class="planet">{{ race.species | planet }}</span><span class="universe" v-show="showUniverse()">{{ race.universe | universe }}</span></span>
        <span class="calendar">
            <span v-show="city.calendar.day">
                <b-tooltip :label="moon()" :aria-label="moon()" position="is-bottom" size="is-small" multilined animated><i id="moon" class="moon wi"></i></b-tooltip>
                <span class="year">${loc('year')} <span class="has-text-warning">{{ city.calendar.year }}</span></span>
                <span class="day">${loc('day')} <span class="has-text-warning">{{ city.calendar.day }}</span></span>
                <b-tooltip :label="weather()" :aria-label="weather()" position="is-bottom" size="is-small" multilined animated><i id="weather" class="weather wi"></i></b-tooltip>
                <b-tooltip :label="temp()" :aria-label="temp()" position="is-bottom" size="is-small" multilined animated><i id="temp" class="temp wi"></i></b-tooltip>
                <b-tooltip :label="atRemain()" v-show="s.at" :aria-label="atRemain()" position="is-bottom" size="is-small" multilined animated><span class="atime has-text-caution">{{ s.at | remain }}</span></b-tooltip>
                <span id="pausegame" class="atime" role="button" @click="pause" :aria-label="pausedesc()"></span>
            </span>
        </span>
        <span class="version" id="versionLog"><a href="wiki.html#changelog" target="_blank"></a></span>
        <span class="right has-text-warning"><a href="https://github.com/wdjwxh/Evolve-Scripting-Edition/blob/master/README.md" target="_blank">Why scripting edition?</a></span>
    </div>`);

    let main = $(`<div id="main" class="main"></div>`);
    let columns = $(`<div class="columns is-gapless"></div>`);
    $('body').append(main);
    main.append(columns);

    // Left Column
    columns.append(`<div class="column is-one-quarter leftColumn">
        <div id="race" class="race columns is-mobile is-gapless">
            <h2 class="is-sr-only">Race Info</h2>
            <div class="column is-one-quarter name">{{ name() }}</div>
            <div class="column is-half morale-contain"><span id="morale" v-show="city.morale.current" class="morale">${loc('morale')} <span class="has-text-warning">{{ city.morale.current | mRound }}%</span></div>
            <div class="column is-one-quarter power"><span id="powerStatus" class="has-text-warning" v-show="city.powered"><span>MW</span> <span id="powerMeter" class="meter">{{ city.power | approx }}</span></span></div>
        </div>
        <div id="sideQueue">
            <div id="buildQueue" class="bldQueue has-text-info" v-show="display"></div>
            <h2 class="is-sr-only">Message Queue</h2>
            <div id="msgQueue" class="msgQueue sticky has-text-info" aria-live="polite"></div>
        </div>
        <div id="resources" class="resources sticky"><h2 class="is-sr-only">${loc('tab_resources')}</h2></div>
    </div>`);

    // Center Column
    let mainColumn = $(`<div id="mainColumn" class="column is-three-quarters"></div>`);
    columns.append(mainColumn);
    let content = $(`<div class="content"></div>`);
    mainColumn.append(content);

    content.append(`<h2 class="is-sr-only">Tab Navigation</h2>`);
    let tabs = $(`<b-tabs v-model="s.civTabs" :animated="s.animated" @input="swapTab"></b-tabs>`);
    content.append(tabs);

    // Evolution Tab
    let evolution = $(`<b-tab-item id="evolution" :visible="s.showEvolve">
        <template slot="header">
            {{ 'tab_evolve' | label }}
        </template>
    </b-tab-item>`);
    tabs.append(evolution);

    // City Tab
    let city = $(`<b-tab-item :visible="s.showCiv">
        <template slot="header">
            {{ 'tab_civil' | label }}
        </template>
        <div id="mTabCivil"></div>
    </b-tab-item>`);
    tabs.append(city);

    // Civics Tab
    let civic = $(`<b-tab-item :visible="s.showCivic">
        <template slot="header">
            {{ 'tab_civics' | label }}
        </template>
        <div id="mTabCivic"></div>
    </b-tab-item>`);
    tabs.append(civic);

    // Research Tab
    let research = $(`<b-tab-item :visible="s.showResearch">
        <template slot="header">
            {{ 'tab_research' | label }}
        </template>
        <div id="mTabResearch"></div>
    </b-tab-item>`);
    tabs.append(research);

    // Resources Tab
    let resources = $(`<b-tab-item :visible="s.showResources">
        <template slot="header">
            {{ 'tab_resources' | label }}
        </template>
        <div id="mTabResource"></div>
    </b-tab-item>`);
    tabs.append(resources);

    // ARPA Tab
    let arpa = $(`<b-tab-item :visible="s.showGenetics">
        <template slot="header">
            {{ 'tech_arpa' | label }}
        </template>
        <div id="mTabArpa"></div>
    </b-tab-item>`);
    tabs.append(arpa);

    // Stats Tab
    let stats = $(`<b-tab-item :visible="s.showAchieve">
        <template slot="header">
            {{ 'tab_stats' | label }}
        </template>
        <div id="mTabStats"></div>
    </b-tab-item>`);
    tabs.append(stats);

    let iconlist = '';
    let icons = [
        {i: 'nuclear',      f: 'steelem',       r: 2 },
        {i: 'zombie',       f: 'the_misery',    r: 2 },
        {i: 'fire',         f: 'ill_advised',   r: 2 },
        {i: 'mask',         f: 'friday',        r: 1 },
        {i: 'skull',        f: 'demon_slayer',  r: 2 },
        {i: 'taijitu',      f: 'equilibrium',   r: 2 },
        {i: 'martini',      f: 'utopia',        r: 2 },
        {i: 'lightbulb',    f: 'energetic',     r: 2 },
        {i: 'trash',        f: 'garbage_pie',   r: 2 },
        {i: 'turtle',       f: 'finish_line',   r: 2 },
        {i: 'heart',        f: 'valentine',     r: 1 },
        {i: 'clover',       f: 'leprechaun',    r: 1 },
        {i: 'bunny',        f: 'easter',        r: 1 },
        {i: 'egg',          f: 'egghunt',       r: 1 },
        {i: 'ghost',        f: 'halloween',     r: 1 },
        {i: 'candy',        f: 'trickortreat',  r: 1 },
        {i: 'turkey',       f: 'thanksgiving',  r: 1 },
        {i: 'present',      f: 'xmas',          r: 1 }
    ];

    for (let i=0; i<icons.length; i++){
        if (global.stats.feat[icons[i].f] && global.stats.feat[icons[i].f] >= icons[i].r){
            iconlist = iconlist + `<b-dropdown-item v-on:click="icon('${icons[i].i}')">{{ '${icons[i].i}' | label }}</b-dropdown-item>`;
        }
        else if (global.settings.icon === icons[i].i){
            global.settings.icon = 'star';
        }
    }

    let egg = easterEgg(9,14);
    let hideEgg = '';
    if (egg.length > 0){
        hideEgg = `<b-dropdown-item>${egg}</b-dropdown-item>`;
    }

    let trick = trickOrTreat(11,12);
    let hideTreat = '';
    if (trick.length > 0){
        hideTreat = `<b-dropdown-item>${trick}</b-dropdown-item>`;
    }

    let localelist = '';
    let current_locale = '';
    if (Object.keys(locales).length > 1){
        Object.keys(locales).forEach(function (locale){
          let selected = global.settings.locale;
            if (selected === locale) {
              current_locale = locales[locale];
            }
            localelist = localelist + `<b-dropdown-item v-on:click="lChange('${locale}')">${locales[locale]}</b-dropdown-item>`;
        });
    }

    // Settings Tab
    let settings = $(`<b-tab-item class="settings sticky">
        <template slot="header">
            {{ 'tab_settings' | label }}
        </template>
        <div class="theme">
            <span>{{ 'theme' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ 'theme_' + s.theme | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="setTheme('dark')">{{ 'theme_dark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('light')">{{ 'theme_light' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('night')">{{ 'theme_night' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('darkNight')">{{ 'theme_darkNight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('redgreen')">{{ 'theme_redgreen' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxLight')">{{ 'theme_gruvboxLight' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('gruvboxDark')">{{ 'theme_gruvboxDark' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="setTheme('orangeSoda')">{{ 'theme_orangeSoda' | label }}</b-dropdown-item>
                ${hideEgg}
            </b-dropdown>
            <span>{{ 'units' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.affix | notation }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="numNotation('si')">{{ 'metric' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sci')">{{ 'scientific' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="numNotation('sln')">{{ 'sln' | label }}</b-dropdown-item>
                ${hideTreat}
            </b-dropdown>

            <span>{{ 'icons' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.icon | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="icon('star')">{{ 'star' | label }}</b-dropdown-item>
                ${iconlist}
            </b-dropdown>
        </div>
        <div id="localization" class="localization">
            <span>{{ 'locale' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>${current_locale}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                ${localelist}
            </b-dropdown>

            <span>{{ 'font' | label }} </span>
            <b-dropdown hoverable>
                <button class="button is-primary" slot="trigger">
                    <span>{{ s.font | label }}</span>
                    <i class="fas fa-sort-down"></i>
                </button>
                <b-dropdown-item v-on:click="font('standard')">{{ 'standard' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_log')">{{ 'large_log' | label }}</b-dropdown-item>
                <b-dropdown-item v-on:click="font('large_all')">{{ 'large_all' | label }}</b-dropdown-item>
            </b-dropdown>
        </div>
        <b-switch class="setting" v-model="s.pause" @input="unpause"><b-tooltip :label="locString('settings12')" position="is-bottom" size="is-small" multilined animated>{{ 'pause' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.mKeys"><b-tooltip :label="locString('settings1')" position="is-bottom" size="is-small" multilined animated>{{ 'm_keys' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.cLabels"><b-tooltip :label="locString('settings5')" position="is-bottom" size="is-small" multilined animated>{{ 'c_cat' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qKey"><b-tooltip :label="locString('settings6')" position="is-bottom" size="is-small" multilined animated>{{ 'q_key' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.qAny"><b-tooltip :label="locString('settings7')" position="is-bottom" size="is-small" multilined animated>{{ 'q_any' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.expose"><b-tooltip :label="locString('settings8')" position="is-bottom" size="is-small" multilined animated>{{ 'expose' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.tabLoad" @input="toggleTabLoad"><b-tooltip :label="locString('settings11')" position="is-bottom" size="is-small" multilined animated>{{ 'tabLoad' | label }}</b-tooltip></b-switch>
        <b-switch class="setting" v-model="s.boring"><b-tooltip :label="locString('settings10')" position="is-bottom" size="is-small" multilined animated>{{ 'boring' | label }}</b-tooltip></b-switch>
        <div>
            <div>${loc('key_mappings')}</div>
            <div class="keyMap"><span>${loc('multiplier',[10])}</span> <b-input v-model="s.keyMap.x10" id="x10Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[25])}</span> <b-input class="keyMap" v-model="s.keyMap.x25" id="x25Key"></b-input></div>
            <div class="keyMap"><span>${loc('multiplier',[100])}</span> <b-input class="keyMap" v-model="s.keyMap.x100" id="x100Key"></b-input></div>
            <div class="keyMap"><span>${loc('q_key')}</span> <b-input class="keyMap" v-model="s.keyMap.q" id="queueKey"></b-input></div>
        </div>
        <div class="importExport">
            <div>${loc('tab_mappings')}</div>
            <div class="keyMap"><span>${loc('tab_city5')}</span> <b-input v-model="s.keyMap.showCiv" id="showCivKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_civics')}</span> <b-input v-model="s.keyMap.showCivic" id="showCivicKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_research')}</span> <b-input v-model="s.keyMap.showResearch" id="showResearchKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_resources')}</span> <b-input v-model="s.keyMap.showResources" id="showResourcesKey"></b-input></div>
            <div class="keyMap"><span>${loc('tech_arpa')}</span> <b-input v-model="s.keyMap.showGenetics" id="showGeneticsKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_stats')}</span> <b-input v-model="s.keyMap.showAchieve" id="showAchieveKey"></b-input></div>
            <div class="keyMap"><span>${loc('tab_settings')}</span> <b-input v-model="s.keyMap.settings" id="settingshKey"></b-input></div>
        </div>
        <div class="importExport">
            <b-field label="${loc('import_export')}">
                <b-input id="importExport" type="textarea"></b-input>
            </b-field>
            <button class="button" @click="saveImport">{{ 'import' | label }}</button>
            <button class="button" @click="saveExport">{{ 'export' | label }}</button>
            <button class="button right" @click="restoreGame"><b-tooltip :label="locString('settings9')" position="is-top" size="is-large" multilined animated>{{ 'restore' | label }}</b-tooltip></button>
        </div>
        <div class="online-save">
            <b-collapse :open="s.onlineSave">
                <b-switch v-model="s.onlineSave" slot="trigger">{{ 'enable_online_save' | label }}</b-switch>
                <div class="content">
                    <div class="login-content">
                    <b-tabs>
                        <b-tab-item label="登录">
                            <div class="login-form">
                                <div class="error" id="playfab-error"></div>
                                <b-field label="用户名(英文数字)">
                                    <b-input id="playfab-username"></b-input>
                                </b-field>
                                <b-field label="密码(6-30位)">
                                    <b-input id="playfab-password" type="password"></b-input>
                                </b-field>
                                <button class="button" :disabled="false" @click="loginPlayFab()">登录</button>
                            </div>
                        </b-tab-item>
                        <b-tab-item label="注册">
                            <div class="login-form">
                                <div class="error" id="playfab-reg-error"></div>
                                <b-field label="用户名(英文数字)">
                                    <b-input id="playfab-reg-username"></b-input>
                                </b-field>
                                <b-field label="密码(6-30位)">
                                    <b-input id="playfab-reg-password" type="password"></b-input>
                                </b-field>
                                <b-field label="确认密码">
                                    <b-input id="playfab-reg-confirm-password" type="password"></b-input>
                                </b-field>
                                <button class="button" :disabled="false" @click="registerPlayFabUser()">注册账号</button>
                            </div>
                        </b-tab-item>
                    </b-tabs>
                    </div>
                    <div class="login-tips">
                        <p id="login-tip">
                            登录状态: {{ playFabStats.loginStat }} <br>
                            上次保存时间: {{ playFabStats.lastSaveTime | dateFormat}} <br>
                            云端存档时间: {{ playFabStats.playFabSaveTime | dateFormat}} <br>
                            <button class="button" :disabled="false" @click="importFromPlayFab()">从云端导入存档(注意提前备份本地存档)</button>
                            <button class="button" :disabled="false" @click="syncNow()">立即备份到云端</button>
                            <br>
                            请注意: 30天不活动的存档会被清理. <br>
                            为避免错误覆盖,程序不会自动从云端拉取存档,请在登录账号后点击从云端导入即可。注意在30分钟内操作，否则到30分钟时，新的本地存档会覆盖云端存档。<br>

                        </p>
                    </div>
                </div>
            </b-collapse>
        </div>
        <div class="reset">
            <b-collapse :open="false">
                <b-switch v-model="s.disableReset" slot="trigger">{{ 'enable_reset' | label }}</b-switch>
                <div class="notification">
                    <div class="content">
                        <h4 class="has-text-danger">
                            {{ 'reset_warn' | label }}
                        </h4>
                        <p>
                            <button class="button" :disabled="!s.disableReset" @click="soft_reset()"><b-tooltip :label="locString('settings4')" position="is-top" size="is-large" multilined animated>{{ 'reset_soft' | label }}</b-tooltip></button>
                            <button class="button right" :disabled="!s.disableReset" @click="reset()"><b-tooltip :label="locString('settings3')" position="is-top" size="is-small" multilined animated>{{ 'reset_hard' | label }}</b-tooltip></button>
                        </p>
                    </div>
                </div>
            </b-collapse>
        </div>
    </b-tab-item>`);

    tabs.append(settings);

    // Right Column
    columns.append(`<div id="queueColumn" class="queueCol column"></div>`);

    // Bottom Bar
    $('body').append(`<div class="promoBar"><span class="left"><a href="https://github.com/wdjwxh/Evolve-Scripting-Edition/blob/master/README.md" target="_blank"><h1>Unsupported Scripting Edition</h1></span></a><span class="right"><h2 class="is-sr-only">External Links</h2><a href="https://shimo.im/sheets/tg6VPQgCKhrYW9QG/" target="_blank" style="color: green;">最全中文Wiki</a>|<a href="wiki.html" target="_blank">Wiki</a> | <a href="https://pmotschmann.github.io/Evolve/" target="_blank">Original Evolve Idle Game</a> | <a href="https://github.com/pmotschmann/Evolve" target="_blank">Demagorddon GitHub</a> | <a href="https://www.patreon.com/demagorddon" target="_blank">Demagorddon Patreon</a> | <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PTRJZBW9J662C&currency_code=USD&source=url" target="_blank">Donate to Demagorddon</a></span></div>`);
}
