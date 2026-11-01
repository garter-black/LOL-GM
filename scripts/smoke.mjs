import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ENGINE_MODULES } from './artifact-modules.mjs';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const artifact = resolve(root, 'src', 'artifact');
const modules = ENGINE_MODULES;
const smokeMode=process.env.SMOKE_MODE||'full';
if(!['full','core','patch-system'].includes(smokeMode))
  throw new Error('SMOKE_MODE must be full, core, or patch-system');
const resultPath=process.env.SMOKE_RESULT_FILE;
let result;
const canonical=value=>JSON.stringify(value, (key,item)=>{
  if(key==='saveId')return undefined;
  return item&&typeof item==='object'&&!Array.isArray(item)
    ?Object.fromEntries(Object.keys(item).sort().map(k=>[k,item[k]])):item;
});
const fingerprint=value=>createHash('sha256').update(canonical(value)).digest('hex');

let source = '';
for (const file of modules) source += `${await readFile(resolve(artifact, file), 'utf8')}\n`;
source += `\n(()=>{
  const __SMOKE_MODE=${JSON.stringify(smokeMode)};
  const __smokeStarted=performance.now(),__smokeTimings=[];let __smokeMarkAt=__smokeStarted;
  const __smokeMark=name=>{const now=performance.now();__smokeTimings.push({name,ms:Math.round((now-__smokeMarkAt)*10)/10});__smokeMarkAt=now};
  const db=buildWorld();
  if(Object.values(CHAMPION_SOURCE_SNAPSHOT.champions).length!==173||Object.values(CHAMPION_SOURCE_SNAPSHOT.champions).some(c=>!c.nameKo)||Object.values(CHAMPION_SOURCE_SNAPSHOT.champions).filter(c=>c.passive?.nameKo&&c.spells?.length===4).length!==173||db.patch.championSource.matched<170||db.patch.championSource.matched!==db.patch.championSource.total)throw new Error('Authoritative champion baseline coverage incomplete: '+JSON.stringify(db.patch.championSource));
  if(!db||db.version!==15) throw new Error('Unexpected save schema');
  if(!db.worldDate||!db.worldConfig.universalLanguage) throw new Error('World bootstrap settings failed');
  const intl=Object.fromEntries(db.worldConfig.internationals.map(x=>[x.id,x]));
  const expectedIntl=['FIRST_STAND','MID_SEASON_INVITATIONAL','EASTERN_CUP','WESTERN_CUP','WORLD_CHAMPIONSHIP','MASTERS','OPEN'];
  if(expectedIntl.some(id=>!intl[id]))throw new Error('Canonical international ecosystem missing');
  if(intl.FIRST_STAND.teams!==12||intl.FIRST_STAND.baseSlots!==2||intl.FIRST_STAND.groupBo!==3||intl.FIRST_STAND.knockoutBo!==5)throw new Error('First Stand spec drift');
  if(intl.MID_SEASON_INVITATIONAL.teams!==16||intl.MID_SEASON_INVITATIONAL.baseSlots!==2||intl.MID_SEASON_INVITATIONAL.extraSlots!==4||intl.MID_SEASON_INVITATIONAL.knockoutBo!==5)throw new Error('MSI spec drift');
  if(intl.EASTERN_CUP.teams!==8||intl.WESTERN_CUP.teams!==8)throw new Error('Regional Cup spec drift');
  if(intl.WORLD_CHAMPIONSHIP.teams!==24||intl.WORLD_CHAMPIONSHIP.baseSlots!==4||intl.WORLD_CHAMPIONSHIP.maxSlots!==4||intl.WORLD_CHAMPIONSHIP.pots!==3||intl.WORLD_CHAMPIONSHIP.potSize!==8||intl.WORLD_CHAMPIONSHIP.leagueMatches!==6||intl.WORLD_CHAMPIONSHIP.leagueBo!==3||intl.WORLD_CHAMPIONSHIP.knockoutTake!==16)throw new Error('Worlds spec drift');
  if(intl.MASTERS.teams!==16||intl.MASTERS.baseSlots!==2||intl.MASTERS.maxSlots!==3||intl.MASTERS.extraSlots!==4)throw new Error('Masters slot spec drift');
  if(intl.OPEN.teams!==12||intl.OPEN.baseSlots!==2||intl.OPEN.maxSlots!==2)throw new Error('Open slot spec drift');

  const active=activeTeams(db);
  if(active.length<2||active.some(t=>t.roster.length!==0)) throw new Error('First-season teams are not blank');
  for(const R of Object.values(db.regions)){const first=activeTeams(db,R.id,1);if(first.length<10||first.length!==R.teams)throw new Error('Top-league size invariant failed: '+R.id+' '+first.length+'/'+R.teams)}
  const players=Object.values(db.players);
  if(players.length<10||players.some(p=>p.team||p.contract)) throw new Error('Initial player pool is not fully FA');
  for(const R of Object.values(db.regions)){
    if(R.policyMode!=='engine'||!R.policyBasis||R.policyBasis.source!=='engine')throw new Error('Region policy is not engine-owned: '+R.id);
    if(R.payScale==null||R.importLimit==null||R.importRecruitMinGap==null||!R.rosterRuleProfile||!R.marketProfile||!R.office||R.spendingRule==null)throw new Error('Policy engine left unresolved output: '+R.id);
    if(R.importLimit!==FIRST_TEAM_NON_LOCAL_LIMIT||R.importLimit!==2)throw new Error('First-team non-local cap drifted: '+R.id+' '+R.importLimit);
    if(R.reserveImportLimit==null)throw new Error('Reserve non-local policy missing: '+R.id);
  }
  const eligibilityProbe={id:'ELIGIBILITY_PROBE',region:'ORIGIN',nationality:'ORIGIN',contractedMoves:[]};
  ensurePlayerEligibility(eligibilityProbe);
  if(eligibilityProbe.originRegion!=='ORIGIN'||eligibilityProbe.activeLocalRegion!=='ORIGIN'||!isLocalPlayer(eligibilityProbe,'ORIGIN'))throw new Error('Player local identity initialization failed');
  eligibilityProbe.activeLocalRegion='ACTIVE';
  if(!isLocalPlayer(eligibilityProbe,'ACTIVE')||isLocalPlayer(eligibilityProbe,'ORIGIN')||eligibilityProbe.region!=='ORIGIN')throw new Error('Active local was not separated from origin identity');
  eligibilityProbe.contractedMoves=[{season:db.year,kind:'permanent',counts:true},{season:db.year,kind:'loan',counts:true}];
  if(!contractedMoveError(db,eligibilityProbe)||contractedMoveCount(db,eligibilityProbe)!==2)throw new Error('Season transfer cap failed');
  const regR=Object.values(db.regions)[0],foreignR=Object.values(db.regions).find(x=>x.id!==regR.id);
  if(foreignR){
    const ids=['REG_NL_1','REG_NL_2','REG_NL_3'],fakeTeam={id:'REG_PROBE_TEAM',region:regR.id,division:1,roster:ids.slice(0,2)};
    for(const id of ids)db.players[id]={id,region:foreignR.id,originRegion:foreignR.id,originLocalRegion:foreignR.id,activeLocalRegion:foreignR.id,localEligibility:{origin:foreignR.id,active:foreignR.id,qualifications:{}},contractedMoves:[]};
    if(teamNonLocalCount(db,fakeTeam)!==2||nonLocalLimitForTeam(db,fakeTeam)!==2||!localRegistrationError(db,fakeTeam,db.players[ids[2]]))throw new Error('First-team non-local registration guard failed');
    for(const id of ids)delete db.players[id];
  }
  if(Object.values(OFFICE_STYLES).some(x=>Object.prototype.hasOwnProperty.call(x.w,'fearless')))throw new Error('Fearless leaked back into office policy');
  const namedPolicies=['KR','CN','EU','NA','AP','BR'].map(id=>db.regions[id]).filter(Boolean);
  if(namedPolicies.some(R=>R.sfrMode==='kr_progressive'||R.sfrMode==='lec_50_100'))throw new Error('Named-region hand policy leaked into engine world');
  if(typeof PAY_SCALE!=='undefined'||namedPolicies.some(R=>psOf(db,R.id)!==R.payScale))throw new Error('Legacy pay-scale table remains or regional finance policies no longer supply pay rates');
  const rookieR=db.regions[Object.keys(db.regions)[0]],rp=rookieIntakeProfile(db,rookieR),rc=generateRookieClass(db,rookieR,new RNG('rookie-smoke','class')),ri=rookieR.rookieIntake.slice(-1)[0];
  if(rc.length!==ri.profile.count||rc.some(p=>p.age<17||p.age>19||!p.rookieTier||p.entryYear!==db.year))throw new Error('Engine rookie class generation failed');
  if(rp.freeBuffer<rp.teams*.75)throw new Error('Rookie market liquidity buffer is too small');
  if(ri.profile.count<Math.max(ri.profile.totalGap,Math.max(5,Math.round(ri.profile.first*.55))))throw new Error('Rookie cohort volume broke labor-market floor');
  if(!(rp.ecosystem>0)||!ri.profile.classWave||!ri.label||!ri.profile.roleWaves)throw new Error('Rookie cohort engine state missing');
  if(!['흉작','약한 세대','평년','풍년','황금세대'].includes(ri.label))throw new Error('Rookie class label invalid');
  if(typeof generateEmergencyRookie!=='undefined')throw new Error('Per-team emergency rookie generation still exists');
  const supplyCheck=talentSupplyErrors(db);if(supplyCheck.length)throw new Error('Talent supply invariant failed: '+supplyCheck.slice(0,5).join(' | '));
  const waves=[],labels=new Set();for(let i=0;i<320;i++){const tmp={...rp},tr=new RNG('elite-wave-'+i,'tier');waves.push(rookieTier(tr,tmp,2.1));labels.add(rookieClassLabel(clamp(Math.exp(tr.normal(0,.34)),.48,1.85)))}if(!waves.includes('elite'))throw new Error('Elite rookie probability collapsed under strong class wave');if(!labels.has('흉작')||!labels.has('풍년'))throw new Error('Rookie year variance collapsed');
  if(ROLES.reduce((n,r)=>n+rc.filter(p=>p.role===r).length,0)!==rc.length)throw new Error('Rookie role supply failed');
  const custom=buildWorld({regions:[regionCfg('ZZ',{id:'ZZ',name:'테스트',leagueName:'ZZL',short:'ZZL',teams:10,strength:66,div2:true,system:'franchise',payScale:.7})],internationals:[],subs:1,changes:'normal',startYear:2027,manage:'manual',universalLanguage:true});
  if(Object.values(custom.regions).some(r=>r.teams<10)) throw new Error('Top-league minimum team count failed');
  for(const n of [18,20]){
    const large=buildWorld({regions:[regionCfg('LG'+n,{id:'LG'+n,name:'대형 테스트 '+n,leagueName:'L'+n,short:'L'+n,teams:n,strength:66,div2:false,system:'franchise',payScale:.7})],internationals:[],subs:1,changes:'normal',startYear:2027,manage:'manual',universalLanguage:true});
    const lr=large.regions['LG'+n],lt=activeTeams(large,'LG'+n,1);
    if(lr.teams!==n||lt.length!==n)throw new Error('Expanded top league failed at '+n+' teams');
    const stages=leagueStages(lr,lt.length,1),rr=stages.find(x=>x.id==='regular');
    if(!rr||roundRobin(lt.map(t=>t.id),rr.legs||1).length!==(n-1)*(rr.legs||1))throw new Error('Expanded league schedule failed at '+n+' teams');
  }
  const z=custom.regions.ZZ;if(!z.policyBasis||z.policyBasis.source!=='engine'||!z.rosterRuleProfile||z.importLimit==null||!z.marketProfile||z.spendingRule==null)throw new Error('Policy engine did not resolve custom-region rules');
  if(z.rosterRuleProfile!=='ENGINE_OWNED_RESERVE')throw new Error('Policy engine ignored owned-reserve structure');
  if((db.patches.cadence||14)!==14)throw new Error('Patch cadence should begin on Riot-style 14-day baseline');const champDetail=Object.values(db.patch.champions);if(champDetail.some(c=>!c.skills||['P','Q','W','E','R'].some(k=>!c.skills[k])||!Number.isFinite(c.base.mr)||!Number.isFinite(c.base.mrg)||!Number.isFinite(c.base.asg)||c.base.resource===undefined))throw new Error('Champion detail schema incomplete');if(champDetail.some(c=>!['curated','generated_fallback','riot_ddragon','hybrid_ddragon'].includes(c.detailSource)))throw new Error('Champion detail provenance missing');if(Object.values(CHAMPION_SOURCE_SNAPSHOT.champions).some(c=>!c.passive?.descriptionKo||c.spells?.length!==4||c.spells.some(s=>!s.descriptionKo)))throw new Error('Embedded champion localization incomplete');if(db.patch.championSource?.localized!==champDetail.length||champDetail.some(c=>['P','Q','W','E','R'].some(k=>!c.skills[k]?.sourceDescription)))throw new Error('Localized champion descriptions not consumed');const probeBase=buildPatch(),probeChamp=Object.values(probeBase.champions)[0],probeAlias=probeChamp.name.replace(/[^a-z0-9]/gi,'');const probeSnap={version:CHAMPION_SOURCE_PATCH,champions:{probe:{riotKey:999999,alias:probeAlias,nameKo:'검증',base:{hp:777,hpg:99,ad:66,adg:3,arm:35,armg:4,mr:31,mrg:1.5,as:.7,asg:2.5,range:500,ms:340,resource:400,resourceg:20,resourceRegen:8},passive:{nameKo:'패시브',nameEn:'Passive',descriptionKo:'<b>패시브 설명</b>'},spells:['Q','W','E','R'].map(slot=>({slot,nameKo:slot+'스킬',nameEn:slot+' Spell',descriptionKo:'<b>'+slot+' 설명</b>',cooldown:[9]}))}}};const sourced=buildPatch(probeSnap),sc=sourced.champions[probeChamp.id];if(sc.detailSource!=='riot_ddragon'||sc.base.hp!==777||sc.skills.Q.cooldown!==9||sc.skills.Q.sourceDescription!=='Q 설명'||sc.skills.P.sourceDescription!=='패시브 설명'||sourced.championSource.matched!==1||sourced.championSource.localized!==1)throw new Error('Champion source merge failed');if(championLabel({patch:sourced},sc.id)!=='검증'||championDisplayName(sc)!=='검증')throw new Error('Champion Korean display-name preference failed');const structuredRaw={slot:'Q',nameKo:'구조화Q',descriptionKo:'<b>구조화 설명</b>',cooldown:[8],cost:[40],range:[900],numeric:{baseDamage:[80,120,160,200,240],ratios:{ap:.7},cc:{type:'slow',duration:1.5},recast:true},provider:'CommunityDragon'};const normalized=normalizeSourceSkill('Q',structuredRaw,sc.skills.Q),structuredChamp={...sc,skills:{...sc.skills,Q:normalized}},sp0=championSkillProfile(sc),sp1=championSkillProfile(structuredChamp);if(normalized.baseDamage[4]!==240||normalized.ratios.ap!==.7||!normalized.recast||normalized.sourceDescription!=='구조화 설명'||sp1.structured<=sp0.structured||sp1.power<=sp0.power)throw new Error('Structured champion skill data not consumed');const metaFilterProbe={...db,metaHistory:[]};recordMeta(metaFilterProbe,{date:'2026-01-02',patch:db.patch.id,comp:'FILTER_TEST',winner:0,sides:[{team:{region:'LCK'},ps:[{champ:sc}]},{team:{region:'LPL'},ps:[{champ:probeChamp}]}],draft:{bans:[[sc.id],[]]}});const filtered=metaTableFiltered(metaFilterProbe,{region:'LCK',comp:'FILTER_TEST',from:'2026-01-01',to:'2026-01-03'}).find(x=>x.c.id===sc.id);if(!filtered||filtered.p!==1||filtered.w!==1||filtered.b!==1)throw new Error('Filtered champion meta history failed');const richMeta={...db,metaHistory:[]},richA={id:'META_A',region:'LCK'},richB={id:'META_B',region:'LPL'},oppChamp=Object.values(db.patch.champions).find(x=>x.id!==sc.id);recordMeta(richMeta,{date:'2026-06-02',patch:db.patch.id,comp:'META_COMP',metaContext:{season:'season_2026_META',year:2026,split:2,stage:'playoffs',league:'LCK',international:false},winner:0,sides:[{team:richA,ps:[{champ:sc,role:'MID',p:{id:'P_META_A'}}]},{team:richB,ps:[{champ:oppChamp,role:'MID',p:{id:'P_META_B'}}]}],draft:{bans:[[oppChamp.id],[]]}});const richRow=metaTableFiltered(richMeta,{season:'season_2026_META',year:2026,split:2,league:'LCK',scope:'DOM',position:'MID'}).find(x=>x.c.id===sc.id),richIns=championMetaInsights(richMeta,sc.id,{season:'season_2026_META',split:2,league:'LCK',scope:'DOM',position:'MID'});if(!richRow||richRow.p!==1||richIns.players[0]?.[0]!=='P_META_A'||richIns.teams[0]?.[0]!=='META_A'||richIns.matchups[0]?.[0]!==oppChamp.id||richIns.recent.length!==1)throw new Error('Champion meta dimensions/insights failed');const cp=championSkillProfile(champDetail[0]);if(!Number.isFinite(cp.power)||!Number.isFinite(cp.uptime))throw new Error('Champion skill profile failed');
  const metaProbe=buildWorld(),mc=Object.values(metaProbe.patch.champions)[0];mc.proEligibleDate='2027-02-01';metaProbe.worldDate='2027-01-20';if(championProEligible(metaProbe,mc))throw new Error('Global pro ban failed before eligibility date');metaProbe.worldDate='2027-02-01';if(!championProEligible(metaProbe,mc))throw new Error('Champion did not unlock on pro eligibility date');const lockProbe=buildWorld(),lc=Object.values(lockProbe.patch.champions)[0];lc.proEligibleDate='2027-02-01';lockProbe.worldDate='2027-01-20';const lockTeams=activeTeams(lockProbe).slice(0,2).map(t=>t.id),lockComp={id:'LOCK',teams:lockTeams,stages:[{id:'rr',name:'RR',type:'round_robin',legs:1,bo:1}]};lockProbe.competitions={LOCK:lockComp};newSeason(lockProbe,'LOCK',2027,'lock','2027-01-20');if(lockComp.championPool.includes(lc.id))throw new Error('Tournament pool included globally banned champion');lockProbe.worldDate='2027-02-05';if(!championProEligible(lockProbe,lc)||lockComp.championPool.includes(lc.id))throw new Error('Tournament pool did not remain locked after global unlock');lockProbe.worldDate='2027-01-20';if(!championAvailableForContext(lockProbe,lc,{practice:true})||championAvailableForContext(lockProbe,lc,{championPool:lockComp.championPool}))throw new Error('Practice/global-ban champion availability rules failed');
  const mA=activeTeams(metaProbe)[0],mB=activeTeams(metaProbe).find(t=>t.region!==mA.region);if(mA&&mB){const fake={winner:0,sides:[{team:mA,ps:[{champ:mc}]},{team:mB,ps:[{champ:mc}]}],draft:{bans:[[mc.id],[]]}};recordMeta(metaProbe,fake);if(!metaProbe.regionMetaStats[mA.region]?.[mc.id]||!metaProbe.regionMetaStats[mB.region]?.[mc.id])throw new Error('Regional meta tracking failed');if(metaTable(metaProbe,mA.region)[0].sample<1)throw new Error('Regional meta sample missing');const before=metaTable(metaProbe,mA.region).find(x=>x.c.id===mc.id);if(!before||before.p<1||before.b<1)throw new Error('Regional meta detail counts missing')}
  const patchDates=['2027-01-01','2027-01-15','2027-01-29'];const pDb=buildWorld();const prng=new RNG('patch-realism','p');seasonPatch(pDb,patchDates[0],prng);const p0=pDb.patches.list.length;patchTick(pDb,patchDates[1],prng);patchTick(pDb,patchDates[2],prng);if(pDb.patches.list.length<p0+1)throw new Error('Biweekly patch cadence failed');
  __smokeMark('bootstrap-policy-rookie');\n  const __patchBoundary=__smokeObserve?__smokeFingerprint(db):null;
  if(__SMOKE_MODE!=='core'){
  // Patch engine: complete 26.19 item/rune source coverage and real build/rune-tree consumption.
  const sourceItems=Object.keys(SYSTEM_SOURCE_SNAPSHOT.items||{}),sourceRunes=Object.keys(SYSTEM_SOURCE_SNAPSHOT.runes||{}),sourceStyles=SYSTEM_SOURCE_SNAPSHOT.runeStyles||[];
  if(SYSTEM_SOURCE_SNAPSHOT.version!=='16.19.1'||sourceItems.length!==254||sourceRunes.length!==62||sourceStyles.length!==5)throw new Error('Pinned 26.19 item/rune source coverage drift: '+sourceItems.length+'/'+sourceRunes.length+'/'+sourceStyles.length);
  if(db.patch.systemSource?.itemCount!==254||db.patch.systemSource?.runeCount!==62||db.patch.systemSource?.runeStyleCount!==5)throw new Error('Runtime system source coverage mismatch');
  if(Object.keys(db.patch.itemDefs||{}).length!==254||Object.keys(db.patch.runeDefs||{}).length!==62)throw new Error('Full item/rune definitions were not consumed');
  if(Object.values(db.patch.items||{}).flat().some(id=>!db.patch.itemDefs[id]))throw new Error('Item class pools are not stable-ID backed');
  if(Object.values(db.patch.runes||{}).some(style=>!Array.isArray(style.slots)||style.slots.length!==4||style.slots.flat().some(id=>!db.patch.runeDefs[id])))throw new Error('Rune trees are not stable-ID backed');
  const systemPatch=buildPatch(),systemChamp=Object.values(systemPatch.champions).find(x=>x.name==='Ahri')||Object.values(systemPatch.champions)[0],systemPlayer=players[0];
  const itemBuild=selectItemBuild(systemPatch,systemChamp,systemPlayer,systemChamp.roles[0]),starterItem=selectStarterItem(systemPatch,systemChamp,systemPlayer,systemChamp.roles[0]),runePage=selectRunePage(systemPatch,systemChamp,systemPlayer,systemChamp.roles[0]);
  if(itemBuild.length<4||!starterItem||runePage.length!==6||new Set(runePage).size!==6||itemBuild.some(id=>!systemPatch.itemDefs[id])||runePage.some(id=>!systemPatch.runeDefs[id]))throw new Error('Live full-pool item/rune selection failed');
  // Item/rune selection is engine-owned; system patches must move champion meta/draft value without player micromanagement.
  const tierPatch=buildPatch(),tierChamp=Object.values(tierPatch.champions).find(x=>x.name==='Ahri')||Object.values(tierPatch.champions)[0],tierBefore=champStrength(tierChamp,tierPatch),tierItems=selectItemBuild(tierPatch,tierChamp,{id:'tier-probe'},tierChamp.roles[0]),tierRunes=selectRunePage(tierPatch,tierChamp,{id:'tier-probe'},tierChamp.roles[0]);
  const tierItem=tierPatch.itemDefs[tierItems[0]],tierRune=tierPatch.runeDefs[tierRunes[0]];if(!tierItem||!tierRune)throw new Error('Automatic meta system probe selection failed');
  const itemField=Object.keys(tierItem.effects||{}).sort((a,b)=>(tierItem.effects[b]||0)-(tierItem.effects[a]||0))[0]||'offense',runeField=Object.keys(tierRune.effects||{}).sort((a,b)=>(tierRune.effects[b]||0)-(tierRune.effects[a]||0))[0]||'utility';
  applyNote(tierPatch,{type:'item',id:tierItem.id,field:itemField,old:tierItem.effects?.[itemField]||0,new:(tierItem.effects?.[itemField]||0)+.06,dir:1});applyNote(tierPatch,{type:'rune',id:tierRune.id,field:runeField,old:tierRune.effects?.[runeField]||0,new:(tierRune.effects?.[runeField]||0)+.04,dir:1});
  const tierAfter=champStrength(tierChamp,tierPatch);if(!(tierAfter>tierBefore))throw new Error('Item/rune patch did not move champion meta strength');
  const primaryRunes=runePage.slice(0,4).map(id=>systemPatch.runeDefs[id]),secondaryRunes=runePage.slice(4).map(id=>systemPatch.runeDefs[id]);if(new Set(primaryRunes.map(x=>x.styleId)).size!==1||primaryRunes.map(x=>x.slot).sort().join(',')!=='0,1,2,3'||new Set(secondaryRunes.map(x=>x.styleId)).size!==1||secondaryRunes[0].styleId===primaryRunes[0].styleId||new Set(secondaryRunes.map(x=>x.slot)).size!==2||secondaryRunes.some(x=>x.slot===0))throw new Error('Full rune-page legality failed');
  const craft0=itemPurchasePlan(systemPatch,itemBuild,starterItem),firstItem=itemBuild[0],oldItemCost=systemPatch.itemDefs[firstItem].cost,oldRecipe=systemPatch.itemDefs[firstItem].recipeCost;
  if(!craft0.length||!craft0.some(a=>(systemPatch.itemDefs[a.id]?.tier)==='component')||!craft0.some(a=>a.id===firstItem))throw new Error('Component recipe purchase plan missing');
  applyNote(systemPatch,{type:'item',id:firstItem,field:'cost',old:oldItemCost,new:oldItemCost+200,dir:-1});const craft1=itemPurchasePlan(systemPatch,itemBuild,starterItem);
  if(!(systemPatch.itemDefs[firstItem].recipeCost>oldRecipe)||!(craft1.at(-1).threshold>craft0.at(-1).threshold))throw new Error('Item cost patch did not change recipe purchase timing');
  const style0=Object.values(systemPatch.runes)[0],newItem={id:'item_smoke_new',name:'검증의 장비',nameKo:'검증의 장비',cost:3000,recipeCost:3000,tier:'final',shopActive:true,from:[],into:[],effects:{offense:.03,utility:.02},classes:[systemChamp.cls],active:true},newRune={id:'rune_smoke_new',name:'검증의 룬',nameKo:'검증의 룬',key:'SmokeRune',kind:'minor',styleId:String(style0.id),styleKey:style0.key,styleNameKo:style0.nameKo,slot:1,effects:{haste:.02},active:true};
  applyNote(systemPatch,{type:'item_new',def:newItem});applyNote(systemPatch,{type:'rune_new',def:newRune});if(!systemPatch.itemDefs[newItem.id]||!systemPatch.items[systemChamp.cls].includes(newItem.id)||!systemPatch.runeDefs[newRune.id]||!systemPatch.runes[String(style0.id)].slots[1].includes(newRune.id))throw new Error('Item/rune creation patch failed');
  applyNote(systemPatch,{type:'item_remove',id:newItem.id});applyNote(systemPatch,{type:'rune_remove',id:newRune.id});if(systemPatch.itemDefs[newItem.id].active!==false||systemPatch.runeDefs[newRune.id].active!==false)throw new Error('Item/rune removal patch failed');
  // Skill reach/resource changes must be real simulation inputs, not patch-note-only text.
  const skillPatch=buildPatch(),skillChamp=Object.values(skillPatch.champions).find(x=>x.name==='Ahri')||Object.values(skillPatch.champions).find(x=>(x.skills?.Q?.range||[]).some(v=>v>100&&v<3000)&&(x.skills?.Q?.cost||[]).some(v=>v>0));
  if(!skillChamp)throw new Error('No skill range/cost patch probe champion');
  const beforeSkill=championSkillProfile(skillChamp),oldRange=skillChamp.skills.Q.range.slice(),oldCost=skillChamp.skills.Q.cost.slice(),newRange=oldRange.map(v=>v>0&&v<3000?v+100:v),newCost=oldCost.map(v=>v>0?Math.max(0,v-10):v);
  applyNote(skillPatch,{type:'skill',c:skillChamp.id,slot:'Q',field:'range',old:oldRange,new:newRange,dir:1});applyNote(skillPatch,{type:'skill',c:skillChamp.id,slot:'Q',field:'cost',old:oldCost,new:newCost,dir:1});
  const afterSkill=championSkillProfile(skillChamp);if(afterSkill.reach<beforeSkill.reach||afterSkill.economy<beforeSkill.economy)throw new Error('Skill range/resource patch did not affect simulation profile');
  // Evidence diagnosis uses sample, presence, win rate, trend, flex and concentration instead of win rate alone.
  const diagDb=buildWorld(),diagChamp=Object.values(diagDb.patch.champions)[0],diagOpp=Object.values(diagDb.patch.champions)[1],diagTeams=activeTeams(diagDb).slice(0,2),diagRows=[];
  for(let i=0;i<24;i++){const picked=i<20,win=i<15,role=i%3===0?'TOP':i%3===1?'MID':'JGL';diagRows.push({date:'2027-02-'+String(i+1).padStart(2,'0'),patch:diagDb.patch.id,international:i%4===0,regions:[diagTeams[0].region,diagTeams[1].region],sides:[{team:diagTeams[0].id,region:diagTeams[0].region,win,picks:picked?[{champ:diagChamp.id,role,player:'PX'+(i%4),items:[itemBuild[0]],runes:[runePage[0]]}]:[]},{team:diagTeams[1].id,region:diagTeams[1].region,win:!win,picks:[{champ:diagOpp.id,role,player:'OP'+i,items:[],runes:[]}]}],bans:picked?[]:[diagChamp.id]})}
  diagDb.metaHistory=diagRows;const diagnosis=diagnosePatchMeta(diagDb,false),de=diagnosis.champions.find(x=>x.cid===diagChamp.id);if(diagnosis.sampleGames!==24||!de||de.dir!==-1||de.flex<2||!(de.confidence>0)||!Number.isFinite(de.playerConc)||!Number.isFinite(de.teamConc))throw new Error('Evidence-driven champion patch diagnosis failed');
  // Consecutive opposite reaction produces a partial rollback instead of another full swing.
  const rollbackDb=buildWorld(),rbChamp=Object.values(rollbackDb.patch.champions)[0],rbOld=rbChamp.base.hp,rbN={type:'base',c:rbChamp.id,key:'hp',old:rbOld,new:rbOld-40,dir:-1,size:'medium',why:'smoke'};
  applyNote(rollbackDb.patch,rbN);rollbackDb.patches.history.push({id:'RB.1',date:'2027-03-01',major:false,notes:[rbN]});const rb=partialChampionRollback(rollbackDb,{cid:rbChamp.id,c:rbChamp,dir:1,why:'반대 신호'},new RNG('rollback-smoke','patch'));
  if(!rb||rb.category!=='rollback'||!(rb.new>rb.old&&rb.new<=rbOld))throw new Error('Partial patch rollback failed');
  // Reworks keep champion identity, while their actual mechanical changes remain normal numeric notes.
  const forceRng={chance:()=>true,pick:a=>a[0],next:()=>.1,range:(a,b)=>(a+b)/2,int:(a)=>a};
  const rwDb=buildWorld(),rwChamp=Object.values(rwDb.patch.champions)[0],rwNotes=maybeChampionRework(rwDb,'2027-04-01',true,forceRng,{champions:[{c:rwChamp,cid:rwChamp.id,pres:0,wr:.4,confidence:.5,flex:1,diagnosis:'검증',why:'검증'}]});
  if(!rwNotes.length||rwNotes[0].type!=='rework'||rwNotes[0].stableId!==rwChamp.id||rwNotes.slice(1).some(n=>n.c!==rwChamp.id))throw new Error('Stable-ID champion rework failed');
  const lifeDb=buildWorld(),lifeNotes=maybeSystemLifecycle(lifeDb,'2027-04-01',true,forceRng,{sampleGames:0,rows:[]});if(!lifeNotes.some(n=>n.type==='item_new')||!lifeNotes.some(n=>n.type==='rune_new'))throw new Error('Major patch did not support new item/rune creation');
  if(![2,3].includes(releaseTarget(lifeDb,2027,new RNG('release-target','patch'))))throw new Error('Annual champion release target escaped 2-3 range');
  // Full patch history reconstructs old specs even after later patches exist.
  const histDb=buildWorld(),histChamp=Object.values(histDb.patch.champions)[0],h0=histChamp.base.hp,a0=histChamp.base.ad,h1={type:'base',c:histChamp.id,key:'hp',old:h0,new:h0-10,dir:-1},h2={type:'base',c:histChamp.id,key:'ad',old:a0,new:a0+2,dir:1};
  applyNote(histDb.patch,h1);histDb.patch.id='SMOKE.1';histDb.patches.history.push({id:'SMOKE.1',date:'2027-05-01',major:false,notes:[h1]});applyNote(histDb.patch,h2);histDb.patch.id='SMOKE.2';histDb.patches.history.push({id:'SMOKE.2',date:'2027-05-15',major:false,notes:[h2]});
  const oldPatch=getPatch(histDb,'SMOKE.1');if(oldPatch.champions[histChamp.id].base.hp!==h0-10||oldPatch.champions[histChamp.id].base.ad!==a0)throw new Error('Historical patch reconstruction failed');
  // Refactor invariants: one immutable baseline, per-world patch cache, revision-aware hot-path caches.
  if('base' in db.patches||'initialBase' in db.patches)throw new Error('Serialized patch baseline returned after refactor');
  const isoA=buildWorld(),isoB=buildWorld(),isoCid=Object.keys(isoA.patch.champions)[0],isoHp=isoA.patch.champions[isoCid].base.hp;
  const isoNA={type:'base',c:isoCid,key:'hp',old:isoHp,new:isoHp-11,dir:-1},isoNB={type:'base',c:isoCid,key:'hp',old:isoHp,new:isoHp+17,dir:1};
  isoA.patches.history.push({id:'ISO.1',date:'2027-06-01',major:false,notes:[isoNA]});isoB.patches.history.push({id:'ISO.1',date:'2027-06-01',major:false,notes:[isoNB]});
  const isoPA=getPatch(isoA,'ISO.1'),isoPB=getPatch(isoB,'ISO.1');if(isoPA===isoPB||isoPA.champions[isoCid].base.hp===isoPB.champions[isoCid].base.hp)throw new Error('Patch cache leaked across worlds');
  const cacheDb=buildWorld(),cacheChamp=Object.values(cacheDb.patch.champions).find(x=>(cacheDb.patch.items?.[x.cls]||[]).length)||Object.values(cacheDb.patch.champions)[0],sysProfile0=championSystemMetaProfile(cacheDb.patch,cacheChamp),sysProfile1=championSystemMetaProfile(cacheDb.patch,cacheChamp);
  if(sysProfile0!==sysProfile1)throw new Error('Champion system-meta cache missed identical revision');
  const oldBurst=cacheChamp.kit.burst;applyNote(cacheDb.patch,{type:'kit',c:cacheChamp.id,key:'burst',old:oldBurst,new:clamp(oldBurst+.5,1,10),dir:1});const sysProfileKit=championSystemMetaProfile(cacheDb.patch,cacheChamp);if(sysProfileKit===sysProfile1)throw new Error('Champion system-meta cache ignored champion revision');
  if(typeof NEWCHAMP_A!=='undefined'||typeof NEW_ITEM_A!=='undefined'||typeof NEW_RUNE_A!=='undefined')throw new Error('Legacy combinatorial naming pools remain');
  if(!contentNameTooSimilar('Aatroxx',['Aatrox'])||contentNameTooSimilar('Completely Different',['Aatrox']))throw new Error('Content naming similarity guard failed');
  const namingDb={patch:{champions:{official_a:{name:'Aatrox',nameKo:'아트록스'}},itemDefs:{official_i:{name:'Infinity Edge',nameKo:'무한의 대검'}},runeDefs:{official_r:{name:'Electrocute',nameKo:'감전'}}}},nr=new RNG('content-naming-smoke','names'),champNames=new Set(),itemNames=new Set(),runeNames=new Set();
  const arches=['juggernaut','assassin','burst','marksman','enchanter','vanguard'],roles=['TOP','JGL','MID','ADC','SUP'];
  for(let i=0;i<14;i++){const role=roles[i%roles.length],arch=arches[i%arches.length],dmg=['burst','enchanter'].includes(arch)?'AP':'AD',nm=generateChampionContentName(namingDb,nr,{role,arch,dmg});
    if(nm.name===nm.nameKo||champNames.has(nm.name)||contentNameTooSimilar(nm.name,[...champNames]))throw new Error('Champion naming engine produced duplicate/near-duplicate name');
    champNames.add(nm.name);namingDb.patch.champions['name_probe_'+i]={name:nm.name,nameKo:nm.nameKo,naming:nm.naming};
  }
  for(let i=0;i<10;i++){const effects={[['offense','defense','sustain','mobility','haste','utility','scaling','early'][i%8]]:.04},nm=generateItemContentName(namingDb,nr,{cls:i%3===0?'tank':i%3===1?'marksman':'mage',effects});
    if(nm.name===nm.nameKo||itemNames.has(nm.name)||!nm.naming?.theme)throw new Error('Item semantic naming failed');
    itemNames.add(nm.name);namingDb.patch.itemDefs['item_name_probe_'+i]={name:nm.name,nameKo:nm.nameKo,naming:nm.naming};
  }
  const styles=[{key:'Precision'},{key:'Domination'},{key:'Sorcery'},{key:'Resolve'},{key:'Inspiration'}];
  for(let i=0;i<10;i++){const style=styles[i%styles.length],effects={[['offense','defense','sustain','mobility','haste','utility','scaling','early'][i%8]]:.03},nm=generateRuneContentName(namingDb,nr,{style,kind:i%4===0?'keystone':'minor',effects});
    if(nm.name===nm.nameKo||runeNames.has(nm.name)||!nm.naming?.effect)throw new Error('Rune semantic naming failed');
    runeNames.add(nm.name);namingDb.patch.runeDefs['rune_name_probe_'+i]={name:nm.name,nameKo:nm.nameKo,naming:nm.naming};
  }
  if(champNames.size!==14||itemNames.size!==10||runeNames.size!==10)throw new Error('Content naming engine diversity collapsed');
  const visualA=generatedChampionVisual({id:'champ_visual_probe',name:'Visual Probe',arch:'assassin',dmg:'AP'}),visualB=generatedChampionVisual({id:'champ_visual_probe',name:'Visual Probe',arch:'assassin',dmg:'AP'});
  if(JSON.stringify(visualA)!==JSON.stringify(visualB)||visualA.version!==CHAMPION_VISUAL_VERSION||!visualA.theme||!visualA.silhouette||!visualA.weapon)throw new Error('Generated champion visual profile is not deterministic');
  const visualPatch=buildWorld().patch,visualDef={id:'champ_visual_new',name:'Visual New',roles:['MID'],arch:'burst',dmg:'AP',releaseDate:'2027-01-01',proEligibleDate:'2027-01-15',visual:visualA};applyNote(visualPatch,{type:'new',def:visualDef,c:visualDef.id});const visualChamp=visualPatch.champions[visualDef.id];
  if(!visualChamp||JSON.stringify(visualChamp.visual)!==JSON.stringify(visualA))throw new Error('New champion visual identity was not applied');
  applyNote(visualPatch,{type:'rework',c:visualDef.id,scope:'major'});if(visualChamp.visual.revision!==visualA.revision+1)throw new Error('Major rework did not advance generated portrait revision');
  const draftCacheDb=buildWorld(),draftGate=Object.values(draftCacheDb.patch.champions)[0];draftCacheDb.worldDate='2027-01-01';draftGate.proEligibleDate='2027-01-02';const draftPool0=draftPoolSnapshot(draftCacheDb,{}),draftPool1=draftPoolSnapshot(draftCacheDb,{});if(draftPool0!==draftPool1||draftPool0.champs.some(c=>c.id===draftGate.id))throw new Error('Draft pool cache failed same-day eligibility snapshot');draftCacheDb.worldDate='2027-01-02';const draftPool2=draftPoolSnapshot(draftCacheDb,{});if(draftPool2===draftPool1||!draftPool2.champs.some(c=>c.id===draftGate.id))throw new Error('Draft pool cache did not invalidate on eligibility date');
  const metaCached0=metaRowsFiltered(diagDb,{patch:diagDb.patch.id}),metaCached1=metaRowsFiltered(diagDb,{patch:diagDb.patch.id});if(metaCached0!==metaCached1)throw new Error('Meta-history filtered query cache missed identical query');diagDb.metaHistory.push({...diagDb.metaHistory[0],date:'2027-03-01'});const metaCached2=metaRowsFiltered(diagDb,{patch:diagDb.patch.id});if(metaCached2===metaCached1||metaCached2.length!==metaCached1.length+1)throw new Error('Meta-history query cache did not invalidate after append');
  const snapCtx={used:['A'],byTeam:{T1:{won:['W'],lost:[]},T2:{won:[],lost:['L']}},fearless:true,mods:{T1:.01,T2:-.02},practice:false,championPool:['A','B']},snapCopy=seriesDraftSnapshot(snapCtx);snapCopy.used.push('B');snapCopy.byTeam.T1.won.push('X');snapCopy.mods.T1=.5;if(snapCtx.used.length!==1||snapCtx.byTeam.T1.won.length!==1||snapCtx.mods.T1!==.01)throw new Error('Series draft snapshot shares mutable context state');
  const cacheItem=(sysProfile0.roles[cacheChamp.roles[0]]?.items||[])[0];if(cacheItem){const d=cacheDb.patch.itemDefs[cacheItem],old=d.cost;applyNote(cacheDb.patch,{type:'item',id:cacheItem,field:'cost',old,new:old+100,dir:-1});const sysProfile2=championSystemMetaProfile(cacheDb.patch,cacheChamp);if(sysProfile2===sysProfile1)throw new Error('System-meta cache did not invalidate after item patch')}
  const strength0=champStrength(cacheChamp,cacheDb.patch),oldHp=cacheChamp.base.hp;applyNote(cacheDb.patch,{type:'base',c:cacheChamp.id,key:'hp',old:oldHp,new:oldHp+25,dir:1});const strength1=champStrength(cacheChamp,cacheDb.patch);if(!(strength1>strength0))throw new Error('Champion strength cache did not invalidate after champion patch');
  }
  if(__SMOKE_MODE!=='core'){
    __smokeMark('patch-system-cache');
    if(__smokeObserve&&__smokeFingerprint(db)!==__patchBoundary)
      throw new Error('Patch/system probes mutated the shared smoke DB');
  }
  if(__SMOKE_MODE==='patch-system'){
    __smokePublish({mode:__SMOKE_MODE,phases:__smokeTimings});
    console.log('SMOKE_SHARD_OK patch-system');
    return;
  }
  if(players.some(p=>!p.nationality||!p.development||p.reputation===undefined||!Array.isArray(p.careerEvents)||Object.prototype.hasOwnProperty.call(p,'secondaryRoles')||Object.prototype.hasOwnProperty.call(p,'roleFamiliarity'))) throw new Error('Player identity/position schema failed');
  const sample=players[0];pState(sample);
  for(const key of ['form','condition','fatigue','morale','sharpness','teamAdaptation','tacticalAdaptation']) if(sample[key]===undefined) throw new Error('Player state missing: '+key);
  if(playerMod(sample)<-.111||playerMod(sample)>.091) throw new Error('Player state modifier escaped bounded range');
  const synthetic={id:'synthetic',role:'JGL',attrs:Object.fromEntries(ALL_ATTRS.map(a=>[a,50]))};
  synthetic.attrs.smite_execution=99;synthetic.attrs.objective_setup=99;synthetic.attrs.map_awareness=92;synthetic.attrs.crossmap_decision=92;
  if(playerRoleRating(synthetic,'JGL')<=playerRoleRating(synthetic,'ADC')) throw new Error('Position-specific player rating failed');
  const roleProbeTeam={id:'ROLE_PROBE_TEAM',roster:ROLES.map((r,i)=>'ROLE_PROBE_'+i),depthChart:{}};
  ROLES.forEach((r,i)=>{db.players['ROLE_PROBE_'+i]={...synthetic,id:'ROLE_PROBE_'+i,role:i===0?'MID':r,team:roleProbeTeam.id,name:'Probe '+i,careerEvents:[]}});
  db.teams[roleProbeTeam.id]=roleProbeTeam;initializeDepthChart(db,roleProbeTeam,true);
  const offRole=db.players.ROLE_PROBE_0;if(!setDepthStarter(db,roleProbeTeam,'TOP',offRole,'test',true).ok)throw new Error('Registered player could not be assigned off natural role');
  const duplicate=ROLES.filter(r=>roleProbeTeam.depthChart[r]===offRole.id);if(duplicate.length!==1)throw new Error('One player occupied multiple lineup slots');
  initializeDepthChart(db,roleProbeTeam,false);if(!validateStartingLineup(db,roleProbeTeam).ok)throw new Error('Free-position lineup could not restore five unique starters');
  if(roleProbeTeam.roster.map(id=>db.players[id]).some(p=>p.role==='TOP'))throw new Error('Free-position probe unexpectedly retained natural TOP coverage');
  const convPlayer=db.players.ROLE_PROBE_0;convPlayer.age=20;convPlayer.personality={professionalism:99,ambition:55};convPlayer.attrs.adaptability=99;convPlayer.managerTrust=99;convPlayer.managerRelationship=99;convPlayer.roleProposalCount=0;const convStart=proposeRoleConversion(db,convPlayer.id,'TOP','test');if(!convStart.ok||!convStart.accepted||convPlayer.roleConversion?.targetRole!=='TOP')throw new Error('Role conversion acceptance/start failed');
  // Completion-writer unit boundary; actual scrim receipts are tested by training-allocation and UI role acceptance.\n  const beforeConvRole=convPlayer.role;convPlayer.roleConversion.progress=98;recordRoleConversionUsage(db,[{pid:convPlayer.id,role:'TOP'},{pid:convPlayer.id,role:'TOP'}],'official');if(convPlayer.role!=='TOP'||convPlayer.role===beforeConvRole||convPlayer.roleConversion)throw new Error('Role conversion did not complete into primary-role identity');if(!(convPlayer.roleHistory||[]).some(x=>x.to==='TOP'))throw new Error('Role conversion history missing');
  const rejectPlayer=db.players.ROLE_PROBE_1;rejectPlayer.age=31;rejectPlayer.personality={professionalism:25,ambition:50};rejectPlayer.attrs.adaptability=20;rejectPlayer.managerTrust=10;rejectPlayer.managerRelationship=15;rejectPlayer.roleProposalCount=6;const rejectRole=rejectPlayer.role==='ADC'?'MID':'ADC',oldRejectRole=rejectPlayer.role,reject=proposeRoleConversion(db,rejectPlayer.id,rejectRole,'test');if(!reject.ok||reject.accepted||rejectPlayer.role!==oldRejectRole||rejectPlayer.roleConversion)throw new Error('Role conversion refusal failed');
  const usagePlayer=db.players.ROLE_PROBE_2;usagePlayer.age=21;usagePlayer.personality={professionalism:95,ambition:55};usagePlayer.attrs.adaptability=95;usagePlayer.managerTrust=95;usagePlayer.managerRelationship=95;const usageTarget=usagePlayer.role==='TOP'?'MID':'TOP',usageStart=proposeRoleConversion(db,usagePlayer.id,usageTarget,'test');if(!usageStart.accepted)throw new Error('Role conversion usage fixture did not start');const beforeUsage=usagePlayer.roleConversion.progress;recordRoleConversionUsage(db,[{pid:usagePlayer.id,role:usageTarget},{pid:usagePlayer.id,role:usageTarget}],'official');if(!(usagePlayer.roleConversion.progress>beforeUsage)||usagePlayer.roleConversion.officialGames!==2)throw new Error('Official role usage did not accelerate conversion');
  delete db.teams[roleProbeTeam.id];for(let i=0;i<ROLES.length;i++)delete db.players['ROLE_PROBE_'+i];
  const poolEntry=Object.keys(sample.pool)[0],practiceBefore=(sample.pool[poolEntry].trainingExperience||0);practiceChampion(db,sample,poolEntry,'training',3);
  if((sample.pool[poolEntry].trainingExperience||0)<=practiceBefore) throw new Error('Champion training experience failed');
  const recoveryProbe={id:'RECOVERY_PROBE',roster:['RECOVERY_PROBE_PLAYER']},recoveryDb={...db,players:{...db.players,RECOVERY_PROBE_PLAYER:{fatigue:55,condition:78}}},rr=trainingRecommendation(recoveryDb,recoveryProbe);if(Object.hasOwn(rr,'intensity')||rr.scrim!==false||rr.fat!==55||rr.cond!==78)throw new Error('Activity/recovery recommendation invalid');if(typeof defaultTraining!=='undefined'||typeof aiManageTraining!=='undefined')throw new Error('Retired training controls reintroduced');\n  const scrimReady=t=>ROLES.every(role=>starterFor(db,t,role)),scrimA=active.find(scrimReady),scrimB=active.find(t=>t.id!==scrimA?.id&&scrimReady(t));if(scrimA&&scrimB){const v0=scrimValue(db,scrimA.id,scrimB.id);scrimA.scrimLog=[{date:db.worldDate,games:1,opponent:scrimB.id},{date:db.worldDate,games:1,opponent:scrimB.id},{date:db.worldDate,games:1,opponent:scrimB.id}];const v1=scrimValue(db,scrimA.id,scrimB.id);if(!(v1<v0))throw new Error('Repeated scrim partner did not lose practice value');scrimA.scrimLog=[]}
  __smokeMark('player-role-training');\n  const managedOfficialDraft=(xdb,setup,managedId,tag)=>{
    const state=createDraftSession(xdb,[setup.blue,setup.red],new RNG(setup.gseed,'draft'),setup.draftCtx),playerSide=[setup.blue,setup.red].indexOf(managedId);if(playerSide<0)throw new Error('Managed draft acceptance lost player side');
    let playerTurns=0,aiTurns=0;
    while(draftTurn(state)){
      const turn=draftTurn(state);let choice;
      if(turn.side===playerSide){
        const legal=draftLegalChampions(state);if(!legal.length){draftSkipTurn(state);continue}
        const pick=legal[hashStr(tag+'|'+turn.index)%legal.length];choice={champ:pick.id,side:turn.side,source:'player'};playerTurns++;
      }else{choice=draftAiChoice(state);aiTurns++}
      if(!choice){draftSkipTurn(state);continue}
      const pCheck=draftValidateChoice(state,{...choice,source:'player'}),aCheck=draftValidateChoice(state,{...choice,source:'ai'});
      if(pCheck.ok!==aCheck.ok||pCheck.reason!==aCheck.reason)throw new Error('Player/AI draft validation diverged');
      if(!pCheck.ok)throw new Error('Managed acceptance produced illegal draft choice: '+pCheck.reason);
      draftApplyChoice(state,choice);
    }
    const result=draftResult(state);if(!playerTurns||!aiTurns||ROLES.some(r=>!result.picks[0][r]||!result.picks[1][r]))throw new Error('Managed interactive draft acceptance incomplete');
    return {result,playerTurns,aiTurns};
  };
  if(scrimA&&scrimB){
    const draftCtx=()=>({used:[],byTeam:{[scrimA.id]:{won:[],lost:[]},[scrimB.id]:{won:[],lost:[]}},fearless:true,firstPick:0,practice:true});
    const state=createDraftSession(db,[scrimA.id,scrimB.id],new RNG('draft-session-smoke','draft'),draftCtx());
    let turns=0;while(draftTurn(state)){const choice=draftAiChoice(state);if(choice){const legal=draftValidateChoice(state,choice);if(!legal.ok)throw new Error('AI draft choice rejected by shared validator: '+legal.reason);draftApplyChoice(state,choice)}else draftSkipTurn(state);turns++}
    if('picks' in state)throw new Error('Live draft state leaked fixed role assignments');
    const staged=draftResult(state),auto=runDraft(db,[scrimA.id,scrimB.id],new RNG('draft-session-smoke','draft'),draftCtx());
    const stagedPicks=[...Object.values(staged.picks[0]),...Object.values(staged.picks[1])],stagedBans=[...staged.bans[0],...staged.bans[1]],allDraft=[...stagedPicks,...stagedBans];
    if(turns!==DRAFT_ORDER.length||stagedPicks.length!==10||stagedBans.length!==10||new Set(allDraft).size!==allDraft.length||staged.pickOrder.some(x=>x.length!==5))throw new Error('Staged draft state machine produced illegal LoL draft');
    if(ROLES.some(r=>!staged.picks[0][r]||!staged.picks[1][r]))throw new Error('Final draft role assignment incomplete');
    if(JSON.stringify(staged)!==JSON.stringify(auto))throw new Error('Staged draft API changed deterministic automatic draft result');
    const manual=createDraftSession(db,[scrimA.id,scrimB.id],new RNG('draft-manual-smoke','draft'),draftCtx()),first=draftTurn(manual),legalChamp=draftLegalChampions(manual)[0];
    if(!first||first.kind!=='B'||!legalChamp)throw new Error('Draft session did not expose first ban turn');
    const banAnalysis=draftCandidateAnalysis(manual,first.side,legalChamp.id);if(!banAnalysis||banAnalysis.kind!=='B'||!Number.isFinite(banAnalysis.meta)||!banAnalysis.roles.length||Object.prototype.hasOwnProperty.call(banAnalysis,'intentRole'))throw new Error('Draft ban candidate analysis leaked hidden intent or missing data');
    if(!banAnalysis.metaEvidence||!banAnalysis.metaEvidence.sources.length||!Number.isFinite(banAnalysis.metaEvidence.confidence)||!Array.isArray(banAnalysis.opponentPool)||banAnalysis.opponentPool.some(x=>!Array.isArray(x.selectedRange)||x.selectedRange.length!==2||!x.sources?.length||Object.prototype.hasOwnProperty.call(x,'actualMastery')))throw new Error('Draft ban evidence did not expose bounded scouting provenance');
    const banAdvice=draftStaffAdvice(manual,first.side),banAdvice2=draftStaffAdvice(manual,first.side);if(!banAdvice?.available||banAdvice.kind!=='B'||!banAdvice.suggestions.length||JSON.stringify(banAdvice)!==JSON.stringify(banAdvice2)||banAdvice.suggestions.some(x=>Object.prototype.hasOwnProperty.call(x,'intentRole')||!draftLegalChampions(manual).some(c=>c.id===x.champ)))throw new Error('Draft staff ban advice invalid or leaked hidden intent');
    draftApplyChoice(manual,{champ:legalChamp.id,side:first.side,source:'player'});
    const oppBanChoice=draftAiChoice(manual);if(!oppBanChoice||oppBanChoice.side===first.side)throw new Error('Opponent ban intent fixture unavailable');draftApplyChoice(manual,oppBanChoice);
    const observedBan=draftOpponentIntent(manual,first.side,1)[0];if(!observedBan||observedBan.kind!=='B'||observedBan.champ!==oppBanChoice.champ||!Number.isFinite(observedBan.confidence)||!observedBan.reasons.length||['intentRole','player','mastery'].some(k=>Object.prototype.hasOwnProperty.call(observedBan,k)))throw new Error('Opponent ban intent explanation leaked private draft state');
    const dupPlayer=draftValidateChoice(manual,{champ:legalChamp.id,side:draftTurn(manual).side,source:'player'}),dupAi=draftValidateChoice(manual,{champ:legalChamp.id,side:draftTurn(manual).side,source:'ai'});if(dupPlayer.ok||dupAi.ok||dupPlayer.reason!=='champion_taken'||dupAi.reason!==dupPlayer.reason)throw new Error('Player/AI validator parity failed for duplicate champion');
    const wrongPlayer=draftValidateChoice(manual,{champ:draftLegalChampions(manual)[0]?.id,side:1-draftTurn(manual).side,source:'player'}),wrongAi=draftValidateChoice(manual,{champ:draftLegalChampions(manual)[0]?.id,side:1-draftTurn(manual).side,source:'ai'});if(wrongPlayer.ok||wrongAi.ok||wrongPlayer.reason!=='wrong_side'||wrongAi.reason!==wrongPlayer.reason)throw new Error('Player/AI validator parity failed for wrong side');
    const flexState=createDraftSession(db,[scrimA.id,scrimB.id],new RNG('draft-flex-smoke','draft'),draftCtx());
    while(draftTurn(flexState)?.kind==='B'){const c=draftAiChoice(flexState);if(c)draftApplyChoice(flexState,c);else draftSkipTurn(flexState)}
    const flexTurn=draftTurn(flexState),flexChamp=draftLegalChampions(flexState).find(c=>(c.roles||[]).length>1);
    if(!flexTurn||flexTurn.kind!=='P'||!flexChamp)throw new Error('Flex draft fixture unavailable');
    const possibleBefore=draftFeasibleRoles(flexState,flexTurn.side,flexChamp.id);if(possibleBefore.length<2)throw new Error('Flex champion lost multi-role ambiguity before lock');
    const pickAnalysis=draftCandidateAnalysis(flexState,flexTurn.side,flexChamp.id);if(!pickAnalysis||pickAnalysis.kind!=='P'||pickAnalysis.roles.length<2||pickAnalysis.roleFits.length<2||!Number.isFinite(pickAnalysis.mastery)||Object.prototype.hasOwnProperty.call(pickAnalysis,'intentRole'))throw new Error('Draft pick candidate analysis broke flex ambiguity');
    if(!pickAnalysis.metaEvidence?.sources?.length||!pickAnalysis.compositionEvidence?.reasons?.length||pickAnalysis.roleFits.some(x=>!x.pool||x.pool.confidence!==100||!Array.isArray(x.matchups)))throw new Error('Draft pick evidence missing champion-pool/meta/matchup/composition provenance');
    const pickAdvice=draftStaffAdvice(flexState,flexTurn.side);if(!pickAdvice?.available||pickAdvice.kind!=='P'||!pickAdvice.suggestions.length||pickAdvice.suggestions.some(x=>Object.prototype.hasOwnProperty.call(x,'intentRole')||Object.prototype.hasOwnProperty.call(x,'role')||Object.prototype.hasOwnProperty.call(x,'player')))throw new Error('Draft staff pick advice exposed a hidden role assignment');
    draftApplyChoice(flexState,{champ:flexChamp.id,side:flexTurn.side,source:'player'});
    const possibleAfter=ROLES.filter(r=>draftRolePossibilities(flexState,flexTurn.side,r).includes(flexChamp.id));
    if(possibleAfter.length<2||flexState.log.at(-1).role!==null)throw new Error('Live draft exposed a hidden flex position');
    const oppPickChoice=draftAiChoice(flexState);if(!oppPickChoice||oppPickChoice.side===flexTurn.side||oppPickChoice.kind!=='P')throw new Error('Opponent pick intent fixture unavailable');draftApplyChoice(flexState,oppPickChoice);
    const observedPick=draftOpponentIntent(flexState,flexTurn.side,1)[0],publicRoles=flexState.db.patch.champions[oppPickChoice.champ].roles.filter(r=>ROLES.includes(r));if(!observedPick||observedPick.kind!=='P'||observedPick.champ!==oppPickChoice.champ||JSON.stringify(observedPick.roles)!==JSON.stringify(publicRoles)||!observedPick.reasons.length||['intentRole','player','mastery'].some(k=>Object.prototype.hasOwnProperty.call(observedPick,k)))throw new Error('Opponent pick intent explanation exposed hidden role assignment');
    const oppRole=draftFeasibleRoles(flexState,1-flexTurn.side,oppPickChoice.champ)[0],oppPlayer=oppRole&&flexState.roster[1-flexTurn.side][oppRole],masteryObs=oppPlayer&&draftMasteryObservation(flexState,flexTurn.side,1-flexTurn.side,oppPlayer,oppPickChoice.champ);if(!masteryObs||masteryObs.confidence>=100||!masteryObs.sources.length)throw new Error('Opponent mastery observation became omniscient');
    const secondOpp=draftAiChoice(flexState);if(secondOpp&&secondOpp.side===1-flexTurn.side)draftApplyChoice(flexState,secondOpp);
    if(draftTurn(flexState)?.side===flexTurn.side){const evidenceChamp=draftLegalChampions(flexState)[0],evidence=draftCandidateAnalysis(flexState,flexTurn.side,evidenceChamp.id),publicOpp=new Set(flexState.pickList[1-flexTurn.side]);if(evidence.roleFits.some(x=>(x.matchups||[]).some(m=>!publicOpp.has(m.champ))))throw new Error('Matchup evidence used a non-public opponent champion')}
  }
  if(scrimA&&scrimB){
    const pdb=JSON.parse(JSON.stringify(db)),pa=pdb.teams[scrimA.id],pb=pdb.teams[scrimB.id],pcid='PENDING_SMOKE',pkey='__pending_smoke',psid='season_pending_smoke',pdate='2027-07-01',pool=Object.values(pdb.patch.champions).filter(c=>championProEligible(pdb,c,pdate)).map(c=>c.id);
    setManagedTeam(pdb,pa.id);pdb.world.phase='season';pdb.worldDate='2027-06-28';
    pdb.competitions[pcid]={id:pcid,name:'Pending Smoke League',short:'PSL',region:pa.region,teams:[pa.id,pb.id],rules:{fearless:true},championPool:pool,stages:[{id:'regular',name:'정규',type:'round_robin',bestOf:3,dayGap:[3]}]};
    const homeOpt=scheduledSeriesOptions(pdb,{comp:pcid,id:'x',year:2027,split:1},{stage:'regular'},{id:'regular',type:'round_robin'});if(homeOpt.firstChoice!=='home')throw new Error('Domestic regular season did not assign home First Selection');
    const neutralOpt=scheduledSeriesOptions(pdb,{comp:pcid,id:'x',year:2027,split:1},{stage:'ko'},{id:'ko',type:'single_elim'});if(neutralOpt.firstChoice!=='coin')throw new Error('Neutral single elimination did not use coin First Selection');
    const seededOpt=scheduledSeriesOptions(pdb,{comp:pcid,id:'x',year:2027,split:1},{stage:'po'},{id:'po',type:'single_elim',firstChoice:'seed'});if(seededOpt.firstChoice!=='seed')throw new Error('Explicit seeded First Selection override failed');
    pdb.competitions[pcid].international=true;
    const intlSingle=scheduledSeriesOptions(pdb,{comp:pcid,id:'x',year:2027},{stage:'ko'},{id:'ko',type:'single_elim',firstChoice:'seed'}),intlDouble=scheduledSeriesOptions(pdb,{comp:pcid,id:'x',year:2027},{stage:'bracket'},{id:'bracket',type:'double_elim',firstChoice:'seed'});
    if(intlSingle.firstChoice!=='coin'||intlDouble.firstChoice!=='coin')throw new Error('International knockout improperly carried seed into First Selection');
    pdb.competitions[pcid].international=false;
    const ps={id:psid,comp:pcid,year:2027,seed:'pending-smoke',days:[
      {date:pdate,stage:'regular',label:'정규 1라운드',matches:[{id:'pending_match',a:pa.id,b:pb.id,bo:3,res:null}]},
      {date:'2027-07-04',stage:'regular',label:'정규 2라운드',matches:[{id:'pending_match_2',a:pb.id,b:pa.id,bo:3,res:null}]}
    ],cur:0,stage:0,stageData:{regular:{type:'round_robin',teams:[pa.id,pb.id],groups:null}},pstats:{},done:false,champion:null,runnerUp:null};
    pdb.world.seasons={[pkey]:ps};const pd=playDay(pdb,ps,{deferTeam:pa.id});
    if(pd.finalized||pd.pending.length!==1||ps.cur!==0||ps.days[0].matches[0].res)throw new Error('Managed official match was not deferred');
    pdb.world.pendingOfficial={date:pdate,queue:[{seasonKey:pkey,matchId:'pending_match',date:pdate}]};
    const beforeDate=pdb.worldDate,hold=playWorldDay(pdb);if(!hold?.pending||pdb.worldDate!==beforeDate)throw new Error('Pending official day reran world effects');
    let selection=pendingOfficialSelectionSetup(pdb);if(!selection||selection.game!==1||selection.prompt.mode!=='first'||selection.prompt.chooser!==pa.id)throw new Error('Home team did not receive game-one First Selection');
    applyPendingOfficialSelection(pdb,{kind:'order',value:'first'});
    let setup=pendingOfficialDraftSetup(pdb);if(!setup||setup.game!==1||setup.fearlessUsed.length||setup.fpTeam!==pa.id)throw new Error('Managed First Selection did not reach opening draft');
    const firstDraft=managedOfficialDraft(pdb,setup,pa.id,'bo3-g1').result,firstPicks=[...Object.values(firstDraft.picks[0]),...Object.values(firstDraft.picks[1])],first=resolvePendingOfficialMatch(pdb,firstDraft);
    if(first.done||!pdb.world.pendingOfficial||first.score.reduce((a,b)=>a+b,0)!==1)throw new Error('Bo3 official session ended after one game');
    selection=pendingOfficialSelectionSetup(pdb);if(!selection||selection.game!==2)throw new Error('Game two First Selection prompt missing');
    const loser=first.game.winner===0?first.game.sides[1].team.id:first.game.sides[0].team.id;if(selection.prompt.chooser!==loser)throw new Error('Previous game loser did not receive next First Selection');
    if(selection.prompt.mode==='first')applyPendingOfficialSelection(pdb,{kind:'side',value:'blue'});else applyPendingOfficialSelection(pdb,{kind:selection.prompt.remaining,value:selection.prompt.remaining==='side'?'blue':'first'});
    setup=pendingOfficialDraftSetup(pdb);
    if(setup.game!==2||setup.fearlessUsed.length!==10||firstPicks.some(c=>!setup.fearlessUsed.includes(c)))throw new Error('Fearless picks were not carried into game two');
    const secondDraft=managedOfficialDraft(pdb,setup,pa.id,'bo3-g2').result,secondPicks=[...Object.values(secondDraft.picks[0]),...Object.values(secondDraft.picks[1])];
    if(secondPicks.some(c=>firstPicks.includes(c)))throw new Error('Fearless allowed a previous-game pick');
    let resolved=resolvePendingOfficialMatch(pdb,secondDraft),guard=0;
    while(!resolved.done&&guard++<3){selection=pendingOfficialSelectionSetup(pdb);if(selection)applyPendingOfficialSelection(pdb,{kind:selection.prompt.mode==='first'?'order':selection.prompt.remaining,value:selection.prompt.mode==='first'?'first':selection.prompt.remaining==='side'?'blue':'first'});setup=pendingOfficialDraftSetup(pdb);const d=managedOfficialDraft(pdb,setup,pa.id,'bo3-g'+setup.game).result;resolved=resolvePendingOfficialMatch(pdb,d)}
    if(!resolved.done||!resolved.rec||ps.cur!==1||!ps.days[0].matches[0].res||pdb.world.pendingOfficial)throw new Error('Bo3 pending official series did not resolve and resume');
    const games=resolved.rec.games;if(games.length<2||games.length>3||resolved.rec.score.reduce((a,b)=>a+b,0)!==games.length)throw new Error('Official staged series score/game count invalid');
    let duplicateBlocked=false;try{commitScheduledSeries(pdb,ps,ps.days[0].matches[0],{rec:resolved.rec,lines:resolved.lines})}catch(e){duplicateBlocked=true}if(!duplicateBlocked)throw new Error('Official result committed twice');
  }
  if(scrimA&&scrimB){
    let bdb=JSON.parse(JSON.stringify(db));const aId=scrimA.id,bId=scrimB.id,bcid='PENDING_BO5_ACCEPT',bkey='__pending_bo5_accept',bsid='season_pending_bo5_accept',bdate='2027-08-01',bpool=Object.values(bdb.patch.champions).filter(c=>championProEligible(bdb,c,bdate)).map(c=>c.id);
    setManagedTeam(bdb,aId);bdb.world.phase='season';bdb.world.pendingOfficial=null;bdb.worldDate='2027-07-30';
    bdb.competitions[bcid]={id:bcid,name:'Bo5 Acceptance International',short:'B5A',region:'INTL',teams:[aId,bId],rules:{fearless:true},championPool:bpool,international:true,stages:[{id:'groups',name:'그룹',type:'round_robin',bestOf:5,dayGap:[3]}]};
    const bs={id:bsid,comp:bcid,year:2027,seed:'pending-bo5-accept',days:[
      {date:bdate,stage:'groups',label:'그룹 1라운드',matches:[{id:'bo5_accept',a:aId,b:bId,bo:5,res:null}]},
      {date:'2027-08-04',stage:'groups',label:'그룹 2라운드',matches:[{id:'bo5_accept_2',a:bId,b:aId,bo:5,res:null}]}
    ],cur:0,stage:0,stageData:{groups:{type:'round_robin',teams:[aId,bId],groups:null}},pstats:{},done:false,champion:null,runnerUp:null};
    bdb.world.seasons={[bkey]:bs};
    const restBefore=playWorldDay(bdb);if(restBefore.date!=='2027-07-31'||restBefore.pending)throw new Error('Calendar skipped the rest day before the Bo5 opener');
    const opened=playWorldDay(bdb);if(!opened?.pending||!bdb.world.pendingOfficial||bdb.world.pendingOfficial.queue[0]?.matchId!=='bo5_accept'||opened.date!==bdate)throw new Error('Bo5 official match did not pause at managed draft boundary');
    const allSeriesPicks=new Set();let finished=null,gameCount=0,savedMidSeries=false;
    while(bdb.world.pendingOfficial&&gameCount<5){
      const selection=pendingOfficialSelectionSetup(bdb);if(!selection)throw new Error('Bo5 First Selection prompt missing');
      if(gameCount>0){const last=selection.lastGame,expectedLoser=last.winner===last.blue?last.red:last.blue;if(selection.prompt.chooser!==expectedLoser)throw new Error('Bo5 next-game First Selection did not go to previous loser')}
      const prompt=selection.prompt,choice=prompt.mode==='first'?{kind:gameCount%2?'side':'order',value:gameCount%2?'red':'first'}:{kind:prompt.remaining,value:prompt.remaining==='side'?'blue':'last'};
      applyPendingOfficialSelection(bdb,choice);
      const setup=pendingOfficialDraftSetup(bdb);if(!setup||setup.game!==gameCount+1||setup.fearlessUsed.length!==gameCount*10)throw new Error('Bo5 draft setup/Fearless accumulation invalid');
      const live=managedOfficialDraft(bdb,setup,aId,'bo5-g'+setup.game),picks=[...Object.values(live.result.picks[0]),...Object.values(live.result.picks[1])];
      if(picks.length!==10||picks.some(id=>allSeriesPicks.has(id)))throw new Error('Bo5 Fearless reused a prior-series pick');picks.forEach(id=>allSeriesPicks.add(id));
      finished=resolvePendingOfficialMatch(bdb,live.result);gameCount++;
      if(gameCount===1&&!finished.done){bdb=unpackDB(packDB(bdb));if(!bdb.world.pendingOfficial?.queue?.[0]?.session)throw new Error('Pending Bo5 session did not survive save round-trip');savedMidSeries=true}
      if(finished.done)break;
    }
    const finalSeason=bdb.world.seasons[bkey],finalMatch=finalSeason.days[0].matches[0],rec=finalMatch.res;
    if(!finished?.done||!savedMidSeries||bdb.world.pendingOfficial||!rec||gameCount<3||gameCount>5||rec.games.length!==gameCount||rec.score.reduce((x,y)=>x+y,0)!==gameCount||Math.max(...rec.score)!==3||allSeriesPicks.size!==gameCount*10||finalSeason.cur!==1)throw new Error('Bo5 managed official end-to-end acceptance failed');
  }
  if(scrimA&&scrimB){const scrimSeries=simulateSeries(db,scrimA.id,scrimB.id,1,'smoke-scrim',{fearless:true,firstChoice:'coin',replay:true}),scrimLine=scrimSeries.lines[0],scrimPlayer=db.players[scrimLine.pid],scrimProfile=ensureChampionProfile(db,scrimPlayer,scrimLine.champ),scrimBefore=scrimProfile.scrimExperience||0,fatigueBefore=scrimPlayer.fatigue||0;recordScrimPractice(db,scrimSeries.rec,scrimSeries.lines);if(scrimProfile.scrimExperience<=scrimBefore||scrimPlayer.fatigue<=fatigueBefore||!(db.teams[scrimLine.tid].scrimIntel>0))throw new Error('Scrim practice effects failed')}
  if(!(playerMarketValue(db,sample)>0)||!['신인','성장','전성기','쇠퇴'].includes(careerStage(sample))) throw new Error('Player value/lifecycle failed');
  const veteranStage=careerStage({...sample,age:27,proSeasons:0,development:{...sample.development,peakAge:25}});if(veteranStage==='신인')throw new Error('Veteran lifecycle incorrectly classified as rookie');
  ensureSatisfaction(sample);if(!SQUAD_ROLES.includes(recommendedRosterRole(db,sample,active[0]))||!CAREER_GOAL_KO[playerCareerGoal(sample)]) throw new Error('Player roster role/career goal failed');
  const core=playerCoreMetrics(sample),coreKeys=['laning','skirmish','teamfight','positioning','damage','survival','vision','objective','roaming','macro','sidelane','decision','stability','aggression','concentration','adaptability','volatility','championLearning','metaAdaptation'];
  if(coreKeys.some(k=>!Number.isFinite(core[k])||core[k]<0||core[k]>100)) throw new Error('Player core metric derivation failed');
  const patchProbe=JSON.parse(JSON.stringify(sample)),patchBefore=patchProbe.pool[poolEntry].mastery;
  patchProbe.attrs.meta_adaptation=20;adaptPlayerPoolsToPatch({players:{probe:patchProbe}},[{type:'kit',c:poolEntry}],true);
  if(patchProbe.pool[poolEntry].mastery>patchBefore) throw new Error('Patch re-adaptation failed');
  const growthProbe=JSON.parse(JSON.stringify(sample)),growthAge=growthProbe.age,growthExp=growthProbe.pool[poolEntry].experience;
  growthProbe.team=null;growthProbe.contract=null;growPlayer(db,growthProbe,new RNG('player-growth-smoke','growth'),12,{[poolEntry]:6});
  if(growthProbe.age!==growthAge+1||growthProbe.pool[poolEntry].experience<=growthExp) throw new Error('Player lifecycle/champion growth failed');
  recordPlayerEvent(growthProbe,'transfer',db.year,{from:'A',to:'B',fee:1});
  if(!growthProbe.careerEvents.some(e=>e.type==='transfer'&&e.to==='B')) throw new Error('Player career event persistence failed');
  const persisted=unpackDB(packDB(db)),persistedPlayer=persisted.players[sample.id];
  if(!persistedPlayer||persisted.version!==15||persistedPlayer.nationality!==sample.nationality||persistedPlayer.reputation!==sample.reputation||!persistedPlayer.development||Object.prototype.hasOwnProperty.call(persistedPlayer,'secondaryRoles')||Object.prototype.hasOwnProperty.call(persistedPlayer,'roleFamiliarity')||!persistedPlayer.pool[poolEntry]||persistedPlayer.pool[poolEntry].trainingExperience!==sample.pool[poolEntry].trainingExperience) throw new Error('Player save round-trip failed');
  const metaSave=buildWorld(),metaCid=Object.keys(metaSave.patch.champions)[0];metaSave.metaHistory=[{date:'2027-01-02',patch:'26.19',comp:'SAVE_META',season:'S1',year:2027,split:1,stage:'regular',league:'LCK',international:false,regions:['LCK'],sides:[{team:'A',region:'LCK',win:true,picks:[{champ:metaCid,role:'MID',player:'P1',items:['1001'],runes:['8005']}]}],bans:[metaCid]}];
  const rawMetaBytes=JSON.stringify(metaSave.metaHistory).length,metaPacked=packDB(metaSave),metaRaw=JSON.parse(metaPacked),packedMetaBytes=JSON.stringify(metaRaw.metaHistory).length;if(!Array.isArray(metaRaw.metaHistory?.[0])||metaRaw.patches?.base||metaRaw.patches?.initialBase||packedMetaBytes>=rawMetaBytes*.8)throw new Error('Save compaction did not materially reduce derived patch/meta overhead');
  const metaLoaded=unpackDB(metaPacked),metaRow=metaLoaded.metaHistory?.[0],metaPick=metaRow?.sides?.[0]?.picks?.[0];if(metaRow?.comp!=='SAVE_META'||metaRow?.league!=='LCK'||metaPick?.champ!==metaCid||metaPick?.items?.[0]!=='1001'||metaPick?.runes?.[0]!=='8005')throw new Error('Meta history save round-trip failed');
  const saveView=buildWorld();saveView.competitions.SAVE_COMP={id:'SAVE_COMP',international:true};saveView.world={year:2027,seed:'world-seed',manage:'manual',phase:'season',steps:[],step:0,lastDate:'2027-01-02',seasons:{SAVE_SEASON:{id:'SAVE_SEASON',comp:'SAVE_COMP',done:true,days:[{date:'2027-01-02',matches:[{id:'M1',res:{seed:'match-seed',firstChoice:'coin',games:[],tac:{A:{x:1}},score:[1,0],winner:'A'}}]}],pstats:{}}}};const savePacked=JSON.parse(packDB(saveView)),liveRes=saveView.world.seasons.SAVE_SEASON.days[0].matches[0].res,packedRes=savePacked.world.seasons.SAVE_SEASON.days[0].matches[0].res;if(liveRes.seed!=='match-seed'||liveRes.firstChoice!=='coin'||packedRes.seed!==undefined||packedRes.firstChoice!==undefined)throw new Error('Save compaction mutated runtime season state');

  __smokeMark('draft-match-save');\n  const selectable=managerSelectableTeams(db), independent=active.filter(t=>!t.parent);
  if(!selectable.length||selectable.some(t=>t.active===false)) throw new Error('Manager-selectable team filter failed');
  if(selectable.length!==active.length) throw new Error('Active first/reserve club selection coverage failed');

  const ownedReserveFixture=active.find(t=>t.parent);
  if(ownedReserveFixture){
    const originalParent=ownedReserveFixture.parent;
    ownedReserveFixture.parent=null;
    const div2Selectable=managerSelectableTeams(db,ownedReserveFixture.region,2);
    if(!isManagerSelectableTeam(db,ownedReserveFixture)||!div2Selectable.some(t=>t.id===ownedReserveFixture.id)) throw new Error('Independent second-division club selection failed');
    const fixtureRules=rosterRulesForTeam(db,ownedReserveFixture),fixtureLimits=initialSquadLimits(db,ownedReserveFixture);
    if(fixtureLimits.min!==fixtureRules.firstTeamMin||fixtureLimits.max!==fixtureRules.firstTeamMax) throw new Error('Independent second-division club did not use first-team roster limits');
    ownedReserveFixture.parent=originalParent;
    if(!isManagerSelectableTeam(db,ownedReserveFixture)) throw new Error('Owned reserve coach selection failed');
  }

  const careerTeam=selectable.find(t=>!t.parent&&reserveTeamsOf(db,t).length===1)||selectable.find(t=>!t.parent&&reserveTeamsOf(db,t).length)||selectable[0];
  startCareer(db,careerTeam.id,'smoke-world');
  if(db.world.phase!=='initial_roster'||db.manager.startMode!=='blank_roster') throw new Error('Initial roster phase did not start');
  // The initial auction must not revoke salaries it just allowed because a
  // signing bonus lowers liquidity in the dynamic annual budget.
  for(const t of activeTeams(db)){
    const startCeiling=initialSalaryCeiling(db,t),cash=t.finance.cash;
    if((t.initialPayrollBudget||0)+.001<salaryBudget(db,t))
      throw new Error('Initial wage ceiling did not capture the board budget');
    t.finance.cash=0;
    if(initialSalaryCeiling(db,t)+.001<startCeiling)
      throw new Error('Pay envelope shrank after signing-bonus cash outflow');
    t.finance.cash=cash;
  }

  const mine=setupTeamsForManager(db);
  if(!mine.length) throw new Error('Managed organization has no setup squads');
  const userRng=new RNG('smoke-user-roster','user');
  const managedRoot=parentTeamOf(db,careerTeam)||careerTeam,ownedReserves=reserveTeamsOf(db,managedRoot);

  // 첫 시즌도 즉시계약이 아니라 관심 → 관찰 → 내부평가 → 공식 협상을 실제로 거친다.
  const contractCapProbe=normalizeContractTerms(db,Object.values(db.players)[0],managedRoot,1,9,{});if(contractCapProbe.years!==3)throw new Error('Contract duration exceeded confirmed three-year maximum');
  for(const rule of Object.values(ROSTER_RULE_PROFILES))if(rule.firstTeamMin!==5||rule.firstTeamMax!==10)throw new Error('Regional roster profile overrode global 5-10 first-team registration');
  for(const id of ['ENGINE_OWNED_RESERVE','OWNED_RESERVE_LCK_STYLE_2026'])if(ROSTER_RULE_PROFILES[id].integratedMin!==11)throw new Error('Owned-reserve organization lost the 11-player emergency-callup buffer');
  const targetTeams=activeTeams(db),targetProbe=targetTeams.map(t=>initialRosterTarget(db,t));if(targetProbe.some((n,i)=>{const lim=initialSquadLimits(db,targetTeams[i]);return n<lim.min||n>lim.max}))throw new Error('Initial roster target escaped roster limits');
  const contenders=targetTeams.filter(t=>!t.parent&&['title','final'].includes(t.setupGoal));if(contenders.some(t=>initialRosterTarget(db,t)>6))throw new Error('Contender roster target stopped using five-player core baseline');
  const lottery=targetTeams.filter(t=>!t.parent&&['survive','develop','promotion'].includes(t.setupGoal));if(lottery.length&&!lottery.some(t=>initialRosterTarget(db,t)>5))throw new Error('Lower-table lottery roster behavior disappeared');
    const initialFa=Object.values(db.players).filter(p=>!p.retired&&!p.team).find(p=>initialSignCheck(db,p,managedRoot).ok);
  if(!initialFa)throw new Error('No affordable initial-roster FA target');
  if(!setRecruitmentPriority(db,initialFa.id,'A').ok)throw new Error('Initial recruitment interest failed');
  observePlayer(db,initialFa,90,{comp:'initial-market-smoke',games:4});syncRecruitmentObservation(db,initialFa.id);
  const initialEval=recruitmentEvaluation(db,initialFa.id,managedRoot.id);if(!initialEval.ok||initialEval.target.evaluation?.teamId!==managedRoot.id)throw new Error('Initial internal evaluation failed');
  const initialNeg=startNegotiation(db,initialFa.id,'initial',{teamId:managedRoot.id});if(!initialNeg.ok||initialNeg.neg.kind!=='initial')throw new Error('Initial formal negotiation failed to start');
  const initialDemand=initialNeg.neg.demand,initialOffer={...initialDemand,salary:Math.min(initialDemand.salary,Math.max(.1,initialSalaryCeiling(db,managedRoot)-payroll(db,managedRoot)))};
  const initialResult=submitNegotiationOffer(db,initialNeg.neg.id,initialOffer);
  if(initialFa.contract){
    if(!initialResult.ok||recruitmentTarget(db,initialFa.id)?.result!=='signed')throw new Error('Accepted initial negotiation did not finalize signing');
  }else{
    if(initialResult.ok&&!initialResult.counter)throw new Error('Initial negotiation returned success without signing or counter');
    if(initialNeg.neg.status==='open')cancelNegotiation(db,initialNeg.neg.id);
  }
  if(ownedReserves.length){
    autoBuildInitialSquad(db,managedRoot,userRng,5);
    autoBuildInitialSquad(db,ownedReserves[0],userRng,6);
    for(const t of ownedReserves.slice(1)) autoBuildInitialSquad(db,t,userRng,5);
    if(managedRoot.roster.length!==5||ownedReserves[0].roster.length!==6) throw new Error('5+6 owned-reserve boundary roster setup failed');
  } else autoBuildInitialSquad(db,managedRoot,userRng,initialRosterTarget(db,managedRoot));
  const myErrors=initialOrganizationErrors(db,careerTeam);
  if(myErrors.length) throw new Error('Managed initial roster invalid: '+myErrors.join(' | '));

  finalizeInitialRosters(db);
  if(db.world.phase!=='season'||!db.manager.careerStartedAt) throw new Error('Season did not start after roster finalization');
  const aiInitialTeams=activeTeams(db).filter(t=>!setupTeamsForManager(db).some(x=>x.id===t.id));if(aiInitialTeams.some(t=>{const lim=initialSquadLimits(db,t);return t.roster.length<lim.min||t.roster.length>lim.max||t.roster.length>t.initialRosterTarget}))throw new Error('AI initial market violated legal/planned roster depth');
  if(new Set(aiInitialTeams.map(t=>t.initialRosterTarget)).size<2)throw new Error('AI initial roster targets collapsed to one fixed size');
  const scoutTarget=Object.values(db.players).find(p=>p.team&&p.team!==managedTeamId(db)&&!(db.teams[p.team]&&db.teams[p.team].parent===managedTeamId(db))&&knowledge(db,p)<90);
  if(!scoutTarget)throw new Error('No unobserved scouting target');
  const k0=knowledge(db,scoutTarget);observePlayer(db,scoutTarget,20,{comp:'test',games:3});const k1=knowledge(db,scoutTarget),sr=scoutReport(db,scoutTarget);
  if(k1<=k0||!sr||sr.observations<1||sr.knowledge!==k1)throw new Error('Scouting observation did not increase report knowledge');
  const y0=db.year;db.year++;ageScoutReports(db);if(knowledge(db,scoutTarget)>=k1)throw new Error('Stale scouting report did not decay');db.year=y0;
  const krTeam=activeTeams(db,'KR',1)[0];if(regulatedPayroll(db,krTeam)>payroll(db,krTeam)+.001)throw new Error('SFR payroll exceeds total payroll');
  if(db.regions.KR.spendingRule==='sfr_top5'&&regulatedPayroll(db,krTeam)!==krTeam.roster.map(id=>db.players[id].contract.salary).sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0))throw new Error('SFR is not based on top five salaries');
  for(const t of activeTeams(db)){initializeDepthChart(db,t,false);for(const role of ROLES)if(!starterFor(db,t,role))throw new Error('Depth chart missing starter: '+t.id+' '+role);for(const id of t.roster){const p=db.players[id];ensureSatisfaction(p);if(!SQUAD_ROLES.includes(p.rosterRole)||p.satisfaction<0||p.satisfaction>100)throw new Error('Initial player role/satisfaction failed')}}
  const satTeam=managedRoot,satP=db.players[satTeam.roster[0]],originalSatRole=satP.rosterRole;setRosterRole(db,satP,'core','manager',false);const su=usageFor(satP,db.year);su.teamGames=32;su.games=3;su.series=20;su.teamWins=9;satP.satisfaction=14;satP.concernStreak=9;ensureSatisfaction(satP);satP.managerRelationship=55;satP.managerTrust=55;const rel0=satP.managerRelationship,trust0=satP.managerTrust;applySatisfaction(db,satP);
  if(satP.wantsOut||!satP.satisfactionReasons.includes('playing_time')||satP.managerRelationship>=rel0||satP.managerTrust>=trust0||renewalDisposition(satP)>=.55)throw new Error('Dissatisfaction did not primarily damage relationship/renewal intent');
  const offIssues=satisfactionIssues(db,satP,{offseason:true,year:db.year});if(!offIssues.some(x=>x.code==='playing_time'))throw new Error('Offseason satisfaction ignored completed-season usage');
  const exitProbe={...satP,id:'exit-probe',usage:{...su},satisfaction:5,concernStreak:18,managerRelationship:20,managerTrust:15,wantsOut:false,wantsOutReason:null,personality:{...satP.personality,ambition:90}};applySatisfaction(db,exitProbe);if(!exitProbe.wantsOut)throw new Error('Severe sustained relationship breakdown never escalated to transfer wish');
  satP.wantsOut=true;satP.wantsOutReason='playing_time';su.games=28;su.teamWins=20;satP.satisfaction=55;satP.managerTrust=55;applySatisfaction(db,satP);if(satP.wantsOut)throw new Error('Transfer wish withdrawal failed');
  const relationBefore=playerRelationship(db,satTeam.roster[0],satTeam.roster[1]);adjustPlayerRelationship(db,satTeam.roster[0],satTeam.roster[1],3);if(playerRelationship(db,satTeam.roster[0],satTeam.roster[1])<=relationBefore)throw new Error('Player-pair relationship state failed');
  const benchProbe={...satP,id:'bench-probe',rosterRole:'backup',
    contract:{...satP.contract,promisedRole:'backup'},
    satisfaction:70,satisfactionReasons:[],concernStreak:0,wantsOut:false,wantsOutReason:null,usage:{year:db.year,teamGames:30,games:0,series:15,wins:0,teamWins:15,intlGames:0,teamIntlGames:0,firstTeamGames:0,reserveGames:0}};if(satisfactionIssues(db,benchProbe).some(x=>x.code==='playing_time'))throw new Error('Backup player complained about normal bench usage');
  const dupTeam=activeTeams(db).find(t=>ROLES.some(r=>t.roster.filter(id=>db.players[id]&&db.players[id].role===r).length>=2));
  if(dupTeam){const role=ROLES.find(r=>dupTeam.roster.filter(id=>db.players[id]&&db.players[id].role===r).length>=2),pair=dupTeam.roster.map(id=>db.players[id]).filter(p=>p.role===role),fixed=pair[0],other=pair[1];setDepthStarter(db,dupTeam,role,fixed,'test',true);const before=starterFor(db,dupTeam,role);if(before!==fixed)throw new Error('Manual depth chart starter was not respected');for(const a of Object.keys(other.attrs))other.attrs[a]=Math.min(99,other.attrs[a]+2);if(starterFor(db,dupTeam,role)!==fixed)throw new Error('Small OVR change incorrectly auto-swapped fixed starter');setDepthStarter(db,dupTeam,role,other,'test',true);if(starterFor(db,dupTeam,role)!==other)throw new Error('Explicit starter change failed');}
  setRosterRole(db,satP,originalSatRole||recommendedRosterRole(db,satP,satTeam),'manager',true);satP.usage={year:db.year,teamGames:0,games:0,series:0,wins:0,teamWins:0,intlGames:0,teamIntlGames:0,firstTeamGames:0,reserveGames:0};
  for(const t of activeTeams(db)){
    const e=initialSquadErrors(db,t);
    if(e.length) throw new Error('Final initial roster invalid: '+t.id+' '+e.join(' | '));
  }

  __smokeMark('initial-roster');\n  if(Object.values(db.teams).some(t=>Object.prototype.hasOwnProperty.call(t,'coach')))throw new Error('New world still creates generic team.coach');
  if(Object.prototype.hasOwnProperty.call(db,'coachPool'))throw new Error('New world still creates generic coachPool');

  const staffTeam=managedRoot;ensureTeamStaff(db,staffTeam,new RNG('staff-smoke','staff'));genStaffPool(db,new RNG('staff-pool-smoke','staff'));
  const profile0=staffProfile(staffTeam),cost0=staffCost(db,staffTeam);
  staffTeam.coach={id:'LEGACY_PROBE',name:'Legacy',draft:99,analysis:99,development:99};
  const legacyProfile=staffProfile(staffTeam),legacyCost=staffCost(db,staffTeam);
  if(JSON.stringify(legacyProfile)!==JSON.stringify(profile0)||Math.abs(legacyCost-cost0)>.0001)throw new Error('Legacy team.coach still affects runtime');
  delete staffTeam.coach;
  if(Object.prototype.hasOwnProperty.call(staffTeam,'coach'))throw new Error('Legacy coach probe cleanup failed');

  const staffCandidate=(db.staffPool||[]).find(x=>x.role==='analyst');if(!staffCandidate)throw new Error('Staff market missing analyst');
  staffCandidate.rating=95;hireStaff(db,staffTeam,staffCandidate);if(staffProfile(staffTeam).analysis<=profile0.analysis)throw new Error('Additional analyst did not improve analysis with diminishing returns');if(staffDeptCount(staffTeam,'analyst')<2)throw new Error('Multiple analysts are not supported');
  const fac=ensureFacilities(staffTeam),oldTrain=fac.training,oldCash=staffTeam.finance.cash;staffTeam.finance.cash=Math.max(oldCash,facilityCost(db,staffTeam,'training')*2);if(oldTrain<5){const mul0=facilityMul(staffTeam);upgradeFacility(db,staffTeam,'training');if(facilityMul(staffTeam)<=mul0)throw new Error('Training facility upgrade had no development effect')}
  if(!Number.isFinite(staffCost(db,staffTeam))||staffCost(db,staffTeam)<=0)throw new Error('Full staff cost invalid');
  if(STAFF_DEPT_LIMITS.coach!==9||STAFF_DEPT_LIMITS.analyst!==4||STAFF_DEPT_LIMITS.scout!==6)throw new Error('Staff department caps drifted');
  if(!Object.values({TOP:'topCoach',JGL:'jglCoach',MID:'midCoach',ADC:'adcCoach',SUP:'supCoach'}).every(r=>STAFF_ROLES[r]))throw new Error('Positional coaching roles missing');
  if(!STAFF_ROLES.scout||staffProfile(staffTeam).scouting<=0)throw new Error('Scouting department profile missing');
  staffTeam.finance.cash=oldCash;

  const aiStaffTeam=activeTeams(db,null,1).find(t=>t.id!==managedTeamId(db));if(!aiStaffTeam)throw new Error('AI staff test team missing');
  ensureTeamStaff(db,aiStaffTeam,new RNG('ai-staff','staff'));genStaffPool(db,new RNG('ai-staff-pool','staff'));aiStaffTeam.finance.cash=Math.max(aiStaffTeam.finance.cash,500*psOf(db,aiStaffTeam.region));
  const role='analyst',beforeStaff=teamStaffMembers(aiStaffTeam).filter(x=>x.role===role).sort((a,b)=>b.rating-a.rating)[0];if(!beforeStaff)throw new Error('AI analyst baseline missing');
  const elite=genStaffMember(new RNG('elite-ai-staff','staff'),role,95);elite.rating=95;db.staffPool.push(elite);aiManageStaff(db,aiStaffTeam,new RNG('ai-staff-manage','staff'));
  const afterStaff=teamStaffMembers(aiStaffTeam).filter(x=>x.role===role).sort((a,b)=>b.rating-a.rating)[0];if(!afterStaff||afterStaff.rating<beforeStaff.rating)throw new Error('AI staff management downgraded role');
  const ageProbe=teamStaffMembers(aiStaffTeam).find(x=>x.id===afterStaff.id)||afterStaff,staffAge=ageProbe.age;ageStaff(db,new RNG('staff-age','staff'));
  const agedProbe=teamStaffMembers(aiStaffTeam).find(x=>x.id===ageProbe.id);if(!agedProbe||agedProbe.age<staffAge)throw new Error('Staff lifecycle age regressed');

  const staffControlDb=JSON.parse(JSON.stringify(db)),managedStaffProbe=staffControlDb.teams[managedTeamId(staffControlDb)];ensureTeamStaff(staffControlDb,managedStaffProbe,new RNG('managed-staff-control','staff'));
  const retiringAnalyst=teamStaffMembers(managedStaffProbe).find(x=>x.role==='analyst');if(!retiringAnalyst)throw new Error('Managed analyst retirement probe missing');
  // The copied world has already reviewed staff this year. A second annual
  // lifecycle must advance the year; keep the vacancy/no-auto-hire assertion.
  staffControlDb.year++;retiringAnalyst.age=100;const managedAnalystsBefore=staffDeptCount(managedStaffProbe,'analyst');ageStaff(staffControlDb,new RNG('managed-staff-retire','staff'));
  if(teamStaffMembers(managedStaffProbe).some(x=>x.id===retiringAnalyst.id)||staffDeptCount(managedStaffProbe,'analyst')!==managedAnalystsBefore-1)throw new Error('Managed staff retirement auto-replaced a strategic appointment');

  const legacySave=JSON.parse(JSON.stringify(db)),legacySaveTeam=legacySave.teams[staffTeam.id],legacyRoster=(legacySaveTeam.staffRoster||[]).slice(),legacyMap={};
  for(const member of legacyRoster)if(!legacyMap[member.role])legacyMap[member.role]=member;
  legacySaveTeam.staff=legacyMap;delete legacySaveTeam.staffRoster;legacySaveTeam.coach={id:'OLD_COACH',name:'Legacy',draft:80,analysis:81,development:79};legacySave.coachPool=[legacySaveTeam.coach];
  const migratedLegacy=unpackDB(JSON.stringify(legacySave)),migratedTeam=migratedLegacy.teams[staffTeam.id];
  if(Object.prototype.hasOwnProperty.call(migratedTeam,'coach')||Object.prototype.hasOwnProperty.call(migratedLegacy,'coachPool')||Object.prototype.hasOwnProperty.call(migratedTeam,'staff')||!Array.isArray(migratedTeam.staffRoster)||!migratedTeam.staffRoster.length)throw new Error('Legacy staff save migration failed');

  const optProbe=staffTeam.roster.map(id=>db.players[id]).find(Boolean),optContract=optProbe&&optProbe.contract?JSON.parse(JSON.stringify(optProbe.contract)):null;
  if(optProbe){optProbe.contract=optProbe.contract||{salary:1,until:db.year-1,years:1,bonuses:{},promisedRole:optProbe.rosterRole};optProbe.contract.until=db.year-1;optProbe.contract.option={type:'team',year:db.year,salary:optProbe.contract.salary};if(shouldAutoExerciseOption(db,optProbe,staffTeam,staffTeam.id))throw new Error('Managed team option was marked for automatic exercise');const exercised=mExerciseTeamOption(db,optProbe.id);if(!/팀 옵션 행사/.test(exercised)||optProbe.contract.until!==db.year||optProbe.contract.option)throw new Error('Manual team option exercise failed');optProbe.contract=optContract}
  const staffRoundTrip=unpackDB(packDB(db)),rt=staffRoundTrip.teams[staffTeam.id];if(!Array.isArray(rt.staffRoster)||!rt.staffRoster.some(x=>x.role==='analyst')||Object.prototype.hasOwnProperty.call(rt,'coach')||Object.prototype.hasOwnProperty.call(staffRoundTrip,'coachPool')||!rt.facilities||!['training','analysis','recovery','youth'].every(k=>Number.isFinite(rt.facilities[k])))throw new Error('Staff/facility save round-trip failed');
  const poorTeam=activeTeams(db,null,1).find(t=>t.id!==staffTeam.id&&t.id!==aiStaffTeam.id);if(poorTeam){ensureFacilities(poorTeam);poorTeam.finance.cash=0;const before=JSON.stringify(poorTeam.facilities);for(const k of ['training','analysis','recovery','youth']){try{upgradeFacility(db,poorTeam,k)}catch(e){}}if(JSON.stringify(poorTeam.facilities)!==before)throw new Error('Facility upgraded without funds')}

  const reserveParents=activeTeams(db).filter(t=>!t.parent&&reserveTeamsOf(db,t).length);
  if(reserveParents.length){
    const parent=reserveParents[0],reserve=reserveTeamsOf(db,parent)[0],up=db.players[reserve.roster[0]],down=db.players[parent.roster[0]];
    const plan=rosterPlanState(db,parent),beforeParent=parent.roster.slice(),beforeReserve=reserve.roster.slice();
    plan.assignments[up.id]=parent.id;plan.assignments[down.id]=reserve.id;
    const valid=validateRosterPlan(db,parent,plan);if(!valid.ok)throw new Error('Valid batch roster swap rejected: '+valid.errors.join(' | '));
    const applied=applyRosterPlan(db,parent,plan);if(applied.moves.length!==2||up.team!==parent.id||down.team!==reserve.id)throw new Error('Atomic roster swap failed');
    const bad=rosterPlanState(db,parent);for(const pid of reserve.roster.slice())bad.assignments[pid]=parent.id;
    const snapP=parent.roster.slice(),snapR=reserve.roster.slice(),invalid=validateRosterPlan(db,parent,bad);if(invalid.ok)throw new Error('Invalid roster plan accepted');
    try{applyRosterPlan(db,parent,bad);throw new Error('Invalid roster plan mutated state')}catch(e){}
    if(parent.roster.join(',')!==snapP.join(',')||reserve.roster.join(',')!==snapR.join(','))throw new Error('Invalid roster plan had side effects');
    const restore=rosterPlanState(db,parent);restore.assignments[up.id]=reserve.id;restore.assignments[down.id]=parent.id;applyRosterPlan(db,parent,restore);
    if(parent.roster.length!==beforeParent.length||reserve.roster.length!==beforeReserve.length)throw new Error('Roster swap changed organization size');
  }
  const aiReserveParent=activeTeams(db,null,1).find(t=>t.id!==managedTeamId(db)&&reserveTeamsOf(db,t).length);
  if(aiReserveParent){
    const reserve=reserveTeamsOf(db,aiReserveParent)[0],rules=rosterRulesForTeam(db,aiReserveParent);
    const role=ROLES.find(r=>(aiReserveParent.roster||[]).some(id=>db.players[id]?.role===r)&&(reserve.roster||[]).some(id=>db.players[id]?.role===r));
    if(role){
      const first=(aiReserveParent.roster||[]).map(id=>db.players[id]).filter(p=>p&&p.role===role).sort((a,b)=>playerOvr(b)-playerOvr(a));
      const second=(reserve.roster||[]).map(id=>db.players[id]).filter(p=>p&&p.role===role).sort((a,b)=>playerOvr(b)-playerOvr(a));
      if(first.length&&second.length&&aiReserveParent.roster.length<rules.firstTeamMax&&reserve.roster.length>rules.reserveTeamMin){
        for(const a of Object.keys(second[0].attrs))second[0].attrs[a]=Math.max(second[0].attrs[a],Math.min(99,(first[0].attrs[a]||50)+8));
        const pid=second[0].id,legal=rosterMoveCheck(db,second[0],aiReserveParent);
        if(legal.ok){
          const moves=aiManageOwnedReserve(db,aiReserveParent);
          if(!moves.some(m=>m.pid===pid&&m.kind==='callup')||db.players[pid].team!==aiReserveParent.id)throw new Error('AI failed to call up clearly superior reserve player');
        }
      }
    }
  }
  const rosterErrorsAfterAi=rosterIntegrityErrors(db);
  if(rosterErrorsAfterAi.length) throw new Error('AI reserve management broke roster integrity: '+rosterErrorsAfterAi.slice(0,5).join(' | '));


  __smokeMark('staff-roster');\n  const mixedRegion=Object.values(db.regions).find(r=>r.system==='mixed');
  if(mixedRegion){
    if(!mixedRegion.div2)createDiv2(db,new RNG('smoke-mixed-tier2'),mixedRegion);
    const tier2=activeTeams(db,mixedRegion.id,2),owned=tier2.filter(t=>t.parent),independent=tier2.filter(t=>!t.parent);
    if(!owned.length||!independent.length)throw new Error('Mixed Tier-2 ecosystem must contain owned reserves and independent clubs');
    if(owned.some(t=>promotionEligible(db,t)))throw new Error('Owned reserve incorrectly became promotion eligible');
    if(independent.some(t=>!promotionEligible(db,t)))throw new Error('Independent Tier-2 club incorrectly blocked from promotion');
    const parent=db.teams[owned[0].parent];
    if(reserveRequirement(db,parent)!=='required')throw new Error('Certified mixed-system club lost mandatory reserve requirement');
    const ownedId=owned[0].id,parentId=owned[0].parent,foldedPlayers=owned[0].roster.map(id=>db.players[id]).filter(Boolean),foldedClaim=foldedPlayers.reduce((sum,p)=>sum+contractReleaseSettlement(db,p,'club_closure').amount,0);
    db.teams[parentId].division=2;
    reconcileTier2Structure(db,new RNG('smoke-tier2-reconcile'),mixedRegion);
    if(db.teams[ownedId]&&db.teams[ownedId].active!==false)throw new Error('Reserve survived after parent lost first-division eligibility');
    if(foldedPlayers.some(p=>p.team!==null||p.faYears!==0))throw new Error('Folded reserve players did not become clean free agents');
    if(foldedPlayers.some(p=>p.contract!==null||p.careerEvents.at(-1)?.type!=='club_closure'))throw new Error('Folded reserve kept a live contract or lost closure history');
    const closedFinance=db.teams[ownedId].finance,closedSettlement=closedFinance.closureSettlement;
    if(!closedSettlement||closedSettlement.amount+1e-8<foldedClaim||
      Math.abs(closedSettlement.paidAmount+closedSettlement.unpaidAmount-closedSettlement.amount)>1e-8||
      Math.abs(closedFinance.buyout-closedSettlement.unpaidAmount)>1e-8)
      throw new Error('Folded reserve lost player claim settlement');
    db.teams[parentId].division=1;db.teams[parentId].franchised=true;
    reconcileTier2Structure(db,new RNG('smoke-tier2-recreate'),mixedRegion);
    if(!reserveTeamsOf(db,parentId).length)throw new Error('Required reserve was not restored after first-division certification');
    inferRegionPolicy(db,mixedRegion);
    if(mixedRegion.rosterRuleProfile!=='ENGINE_OWNED_RESERVE'||!mixedRegion.policyBasis?.reserveOwned)throw new Error('Mixed-system owned reserves were ignored by policy engine');
  }


  const lifecycle=unpackDB(packDB(db)),lrng=new RNG('tier2-lifecycle-long','world');
  for(let i=0;i<5;i++){
    for(const R of Object.values(lifecycle.regions))if(R.div2)reconcileTier2Structure(lifecycle,lrng,R);
    const errs=rosterIntegrityErrors(lifecycle);if(errs.length)throw new Error('Tier-2 lifecycle integrity failed in year '+i+': '+errs.slice(0,4).join(' | '));
    for(const R of Object.values(lifecycle.regions))if(R.div2&&['franchise','mixed'].includes(R.system)){
      for(const t of activeTeams(lifecycle,R.id,1))if(reserveRequirement(lifecycle,t)==='required'&&reserveTeamsOf(lifecycle,t).length!==1)throw new Error('Required reserve count drifted in '+R.id);
      if(activeTeams(lifecycle,R.id,2).some(t=>t.parent&&promotionEligible(lifecycle,t)))throw new Error('Owned reserve became promotion eligible in '+R.id);
    }
    lifecycle.year++;if(lifecycle.world)lifecycle.world.year=lifecycle.year;
  }

  const promoDb=unpackDB(packDB(db)),promoR=Object.values(promoDb.regions).find(R=>R.div2&&['mixed','relegation'].includes(R.system));
  if(promoR){
    const prng2=new RNG('promotion-pressure','world'),events=[];
    const fakeSeason=(id,comp,region,div,teams,winner,loser)=>{const matches=[];for(let i=0;i<teams.length;i++)for(let j=i+1;j<teams.length;j++){const a=teams[i].id,b=teams[j].id,aw=a===winner||b===loser||(a!==loser&&b!==winner&&i<j),w=aw?a:b;matches.push({id:id+'-'+i+'-'+j,a,b,res:{winner:w,score:w===a?[1,0]:[0,1]}})}return {id,comp,region,div,split:99,done:true,champion:winner,runnerUp:null,stageData:{regular:{teams:teams.map(t=>t.id)}},days:[{stage:'regular',matches}]};};
    for(let cycle=0;cycle<5;cycle++){
      const first=activeTeams(promoDb,promoR.id,1),second=activeTeams(promoDb,promoR.id,2),eligible=second.filter(t=>promotionEligible(promoDb,t));
      if(first.length>=2&&eligible.length){
        const down=first.find(t=>!(promoR.system==='mixed'&&t.franchised))||first[0],up=eligible[cycle%eligible.length];
        promoDb.world.seasons['pressure-1']=fakeSeason('pressure-1','PRESSURE1',promoR.id,1,first,first.find(t=>t.id!==down.id).id,down.id);
        promoDb.world.seasons['pressure-2']=fakeSeason('pressure-2','PRESSURE2',promoR.id,2,second,up.id,second.find(t=>t.id!==up.id)?.id);
        promoDb.competitions.PRESSURE1={id:'PRESSURE1',stages:[{id:'regular'}]};promoDb.competitions.PRESSURE2={id:'PRESSURE2',stages:[{id:'regular'}]};
        const ownedIds=new Set(second.filter(t=>t.parent).map(t=>t.id));
        if(ownedIds.has(up.id))throw new Error('Pressure fixture selected owned reserve as promotion candidate');
        promotionRelegation(promoDb,promoDb.world,prng2,x=>events.push(x));
        if((promoDb.teams[up.id].division||1)!==1)throw new Error('Eligible independent Tier-2 club failed to promote');
        if(activeTeams(promoDb,promoR.id,1).some(t=>t.parent))throw new Error('Owned reserve entered first division after promotion cycle');
        for(const t of activeTeams(promoDb,promoR.id,1))if(reserveRequirement(promoDb,t)==='required'&&reserveTeamsOf(promoDb,t).length!==1)throw new Error('Promotion cycle broke required reserve ownership');
        const pe=rosterIntegrityErrors(promoDb);if(pe.length)throw new Error('Promotion cycle roster integrity failed: '+pe.slice(0,4).join(' | '));
        promoDb.year++;promoDb.world.year=promoDb.year;
      }
    }
    if(!events.length)throw new Error('Promotion pressure test did not execute');
  }

  __smokeMark('tier2-promotion');\n  const champions=Object.entries(db.patch.champions);
  if(champions.length<100||champions.some(([id,c])=>c.id!==id||!c.name)) throw new Error('Champion ID invariant failed');

  const teams=activeTeams(db).filter(t=>t.roster.length>=5);
  const series=simulateSeries(db,teams[0].id,teams[1].id,1,'smoke-series',{fearless:true,firstChoice:'seed'});
  if(!series.rec||series.rec.games.length!==1||!series.lines.length) throw new Error('Series smoke simulation failed');
  if(series.lines.some(l=>!(l.rating>=3&&l.rating<=10)||!(l.gold>0)||l.kp<0||['csDiff','goldDiff','dmgTaken','vision','objectives','laneAdv','teamfightDmg','teamfights','teamfightWins','teamfightShare'].some(k=>!Number.isFinite(l[k])))) throw new Error('Player game rating/stat line failed');
  if(!series.lines.some(l=>l.vision>0)||!series.lines.some(l=>l.objectives>0)) throw new Error('Player vision/objective tracking failed');
  const game=series.rec.games[0];
  for(const cid of [...game.picks[0],...game.picks[1],...(game.bans[0]||[]),...(game.bans[1]||[])]) if(cid&&!db.patch.champions[cid]) throw new Error('Draft champion ID missing: '+cid);

  const seasons=Object.values(db.world.seasons);
  if(!seasons.length) throw new Error('World season bootstrap failed');
  const seasonIds=seasons.map(s=>s.id);
  if(new Set(seasonIds).size!==seasonIds.length) throw new Error('Season IDs are not unique');
  const matchIds=seasons.flatMap(s=>s.days.flatMap(d=>d.matches.map(m=>m.id)));
  if(!matchIds.length||new Set(matchIds).size!==matchIds.length) throw new Error('Match IDs are not unique');

  // Drive an actual compact season to completion before annual settlement.
  const marketCfg=defaultWorldConfig();marketCfg.regions=[regionCfg('NA',{teams:4,splits:1,legs:1,regularBo:1,playoffBo:1,playoffTake:2,format:'rr_po',div2:false,system:'franchise'})];marketCfg.internationals=[];
  const marketDb=buildWorld(marketCfg),marketOwner=activeTeams(marketDb)[0];
  startCareer(marketDb,marketOwner.id,'smoke-market-season');autoBuildInitialSquad(marketDb,marketOwner,new RNG('smoke-market-roster'));finalizeInitialRosters(marketDb);marketDb.world.manage='ai';
  let marketDays=0;while(marketDb.world.phase==='season'&&marketDays++<500)playWorldDay(marketDb);
  if(marketDb.world.phase!=='offseason')throw new Error('Market smoke season did not finish');
  marketDb.world.manage='manual';runOffseason(marketDb);
  if(marketDb.world.phase!=='market')throw new Error('Offseason did not open transfer market');
  const preMarketSupply=talentSupplyErrors(marketDb);if(preMarketSupply.length)throw new Error('Pre-market labor supply failed: '+preMarketSupply.slice(0,5).join(' | '));
  if(!marketDb.world.report.rookieGlobal||!marketDb.world.report.rookies.every(x=>x.label&&x.tiers))throw new Error('Offseason rookie cohort report missing');

  // 계약/이적시장: 관심 → 관찰 → 내부평가 → 공식 협상, 다회 역제안, A/B/C 후보 상태를 검증한다.
  const marketTeam=managedTeam(marketDb),faTarget=Object.values(marketDb.players).find(p=>!p.retired&&!p.team);
  if(!marketTeam||!faTarget)throw new Error('No FA target for contract-market smoke');
  const interest=setRecruitmentPriority(marketDb,faTarget.id,'A');if(!interest.ok||recruitmentTarget(marketDb,faTarget.id).priority!=='A')throw new Error('Recruitment shortlist priority failed');
  if(startNegotiation(marketDb,faTarget.id,'fa').ok)throw new Error('Official negotiation started before internal evaluation');
  observePlayer(marketDb,faTarget,80,{comp:'market-smoke',games:4});syncRecruitmentObservation(marketDb,faTarget.id);
  const evaluation=recruitmentEvaluation(marketDb,faTarget.id);if(!evaluation.ok||evaluation.target.stage!=='evaluated'||!evaluation.target.evaluation)throw new Error('Recruitment internal evaluation failed');
  const started=startNegotiation(marketDb,faTarget.id,'fa');if(!started.ok||started.neg.status!=='open'||started.neg.stage!=='player')throw new Error('FA negotiation did not start');
  const low={...started.neg.demand,salary:Math.max(.1,started.neg.demand.salary*.78),signingBonus:0,bonuses:{performance:0,title:0,international:0},option:null,buyout:null};
  const counter=negotiationCounter(marketDb,started.neg,normalizeContractTerms(marketDb,faTarget,marketTeam,low.salary,low.years,low));
  if(!(counter.salary>low.salary)||!SQUAD_ROLES.includes(counter.promisedRole))throw new Error('Negotiation counter-offer failed');
  cancelNegotiation(marketDb,started.neg.id);if(recruitmentTarget(marketDb,faTarget.id).stage!=='evaluated')throw new Error('Cancelled negotiation did not restore evaluated target');
  const clauseProbe=normalizeContractTerms(marketDb,faTarget,marketTeam,asking(marketDb,faTarget,marketTeam.region),2,{signingBonus:.5,bonuses:{performance:.2,title:.3,international:.1},buyout:5,option:{type:'player'},promisedRole:'competition'});
  if(clauseProbe.signingBonus!==.5||clauseProbe.bonuses.title!==.3||clauseProbe.buyout?.amount!==5||clauseProbe.buyout?.type!=='negotiation'||clauseProbe.option?.type!=='player'||clauseProbe.promisedRole!=='competition')throw new Error('Contract clause normalization failed');
  const marketRoundTrip=unpackDB(packDB(marketDb));if(!marketRoundTrip.world.recruitment?.targets?.[faTarget.id]||!marketRoundTrip.world.negotiations?.[started.neg.id])throw new Error('Recruitment/negotiation save round-trip failed');
  const transferTarget=Object.values(marketDb.players).find(p=>p.team&&p.team!==marketTeam.id&&p.contract?.until>marketDb.year&&sellerTransferAsk(marketDb,p,marketDb.teams[p.team])<=marketTeam.finance.cash*.7);
  if(!transferTarget)throw new Error('Missing affordable multi-year transfer fixture');
  if(!globalTransferMarketState(marketDb.worldDate).open){
    const before=packDB(marketDb),message=mTransferBid(marketDb,transferTarget.id,1);
    if(!message.includes('마감')||packDB(marketDb)!==before)throw new Error('Settlement phase reopened closed global market');
  }
  // Annual settlement still reaches January 6, after the real market closes.
  // Exercise the positive transfer path on an isolated future opening with a
  // still-valid multi-year contract, preserving the real closing world's time.
  const transferDb=unpackDB(packDB(marketDb)),tp=transferDb.players[transferTarget.id];
  transferDb.worldDate=globalPlayerFAOpenDate(transferDb.year);
  setRecruitmentPriority(transferDb,tp.id,'B');observePlayer(transferDb,tp,80,{comp:'transfer-smoke',games:4});
  syncRecruitmentObservation(transferDb,tp.id);
  if(!recruitmentEvaluation(transferDb,tp.id).ok)throw new Error('Transfer target evaluation failed');
  const ask=sellerTransferAsk(transferDb,tp,transferDb.teams[tp.team]);mTransferBid(transferDb,tp.id,ask*1.2);
  const tn=negotiationStore(transferDb)[negotiationId(transferDb,tp.id,'transfer')];
  if(!tn||tn.status!=='open'||tn.stage!=='player'||!(tn.fee>0))throw new Error('Club transfer-fee negotiation failed');
  cancelNegotiation(transferDb,tn.id);
  closeMarket(marketDb);
  const targetSize=5+(marketDb.worldConfig.subs||0);
  for(const t of activeTeams(marketDb)){
    if(t.roster.length<targetSize)throw new Error('Market closed with short roster: '+t.id+' '+t.roster.length+'/'+targetSize);
    for(const role of ROLES)if(!starterFor(marketDb,t,role))throw new Error('Market closed without '+role+' starter: '+t.id);
  }
  if(Object.values(marketDb.players).some(p=>p.entryPath==='emergency'))throw new Error('Emergency-generated player exists after market');

  __smokeMark('series-offseason-market');
  __smokePublish({mode:__SMOKE_MODE,phases:__smokeTimings},
    __smokeObserve?{db,marketDb,series,persistedDB:JSON.parse(packDB(db)),persistedMarket:JSON.parse(packDB(marketDb))}:null);
  console.log('World smoke test: OK — blank rosters, global FA, roster rules, engine-owned regional policy, workforce-backed rookie intake/scouting reports, no emergency roster generation, offseason market closure, player identity/role ratings/state/value/development/champion learning/full match metrics/fixed depth charts/roster roles/satisfaction, season bootstrap and Bo1 simulation');
})()`;

const context = {
  console, Date, Math, JSON, Set, Map, Object, Array, String, Number,
  Boolean, RegExp, Error, Intl, performance, crypto,
  __smokeObserve:!!resultPath,
  __smokeFingerprint:fingerprint,
  __smokePublish:(timing,state)=>{
    result={...timing,totalMs:Math.round(timing.phases.reduce((n,p)=>n+p.ms,0)*10)/10};
    if(state)result.state=Object.fromEntries(Object.entries(state).map(([key,value])=>[key,fingerprint(value)]));
    console.log('SMOKE_PHASE_TIMINGS '+JSON.stringify(result));
  },
};

// Functional E2E is intentionally broader than the dedicated performance probe.
// Keep enough headroom to avoid runner-noise flakes; scripts/perf.mjs remains the performance gate.
vm.runInNewContext(source, context, { timeout: 35000 });

if(resultPath)await writeFile(resultPath,JSON.stringify(result,null,2)+"\n");
