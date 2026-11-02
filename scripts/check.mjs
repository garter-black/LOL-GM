import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { ARTIFACT_MODULES, ENGINE_MODULES } from './artifact-modules.mjs';
import { assertMutationOwnership } from './mutation-ownership.mjs';
await import('./ai-market-read-cost-acceptance.mjs');
await import('./audit-champion-source-acceptance.mjs');
await import('./verify-champion-source-bundle-acceptance.mjs');
await import('./match-core-foundation-acceptance.mjs');
await import('./match-core-input-acceptance.mjs');
await import('./codex-impact-map-acceptance.mjs');
await import('./codex-context-acceptance.mjs');
await import('./no-inworld-technical-incident-acceptance.mjs');
await import('./observer-information-acceptance.mjs');
await import('./historical-identity-acceptance.mjs');
await import('./worlds-identity-acceptance.mjs');
await import('./ui-projection-acceptance.mjs');

const root = resolve(import.meta.dirname, '..');
const artifact = resolve(root, 'src', 'artifact');
const modules = ARTIFACT_MODULES;
const artifactSources = new Map(await Promise.all([...modules, 'shell.html'].map(async file => {
  const path = resolve(artifact, file);
  return [path, await readFile(path, 'utf8')];
})));
const sourceOf = file => {
  const path = resolve(artifact, file);
  const source = artifactSources.get(path);
  if (source === undefined) throw new Error(`Artifact source was not preloaded: ${file}`);
  return source;
};

let failed = false;
assertMutationOwnership(new Map(modules.map(file=>[file,sourceOf(file)])));
for(const marker of ['function setWorldCalendarDate(','function nextCalendarDate(',
  'function applyCalendarPatchEvents(','function applyWorldDailyEffects(']) {
  if(!sourceOf('calendar.js').includes(marker)) {
    failed=true;console.error('Calendar-domain helper missing: '+marker);
  }
  for(const file of ['season.js','contract-window.js','offseason.js'])
    if(sourceOf(file).includes(marker)) {
      failed=true;console.error('Calendar responsibility leaked into '+file+': '+marker);
    }
}
if(!sourceOf('roster.js').includes('function aiMarketReserveCallups(')||
  !sourceOf('state-transaction.js').includes("'roster.market-callup':")||
  !sourceOf('state-rollback.js').includes("command.type==='roster.market-callup'")||
  !sourceOf('contracts.js').includes('aiMarketReserveCallups(db,rep)')) {
  failed=true;console.error('AI market roster callup must use the shared action journal and roster owner');
}
for(const name of ['payroll','topFivePayroll','regulatedPayroll','spendingTaxForPayroll',
  'recordContractReleaseObligation']) {
  if(!sourceOf('finance.js').includes('function '+name+'(')||
    sourceOf('contracts.js').includes('function '+name+'(')) {
    failed=true;console.error('Finance source of truth missing or duplicated: '+name);
  }
}
for(const file of ['state-player-actions.js','ui-market.js']) {
  if(!sourceOf(file).includes('contractReleaseCost(')) {
    failed=true;console.error('Release cost must consume the contract source of truth: '+file);
  }
}
for(const file of ENGINE_MODULES) {
  const hit=sourceOf(file).match(/\b(?:DB|document|localStorage|indexedDB|UI_[A-Z_]+)\b/);
  if(hit){failed=true;console.error('Engine must not own UI/storage globals: '+file+' '+hit[0]);}
}
for(const file of ['ui-overlay.js','ui-state.js']) {
  if(/typeof (?:uiEnhanceScrollRegions|UI_OVERLAY)/.test(sourceOf(file))) {
    failed=true;console.error('Required UI dependencies must not use optional fallback: '+file);
  }
}
for(const file of modules)for(const name of ['mulberry32','monteCarlo','ensureChampionVisual',
  'seriesOpeningDraft','spendingTax','potLabel']) {
  if(new RegExp('\\b'+name+'\\b').test(sourceOf(file))) {
    failed=true;console.error('R06 removed unused API returned: '+file+' '+name);
  }
}
const globalSymbols = new Map();
for (const file of modules) {
  const path = resolve(artifact, file);
  const source = sourceOf(file);
  try {
    // Artifact modules are concatenated global scripts at runtime. Parse them
    // with Script grammar in-process instead of starting a Node --check
    // subprocess for every file.
    new vm.Script(source, { filename: path, displayErrors: true });
  } catch (error) {
    failed = true;
    console.error(`Syntax check failed: ${file}`);
    console.error(error?.stack || error);
  }
  const symbols = [
    ...[...source.matchAll(/(?:^|\n)function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]),
    ...[...source.matchAll(/(?:^|\n)(?:const|let|class)\s+([A-Za-z_$][\w$]*)/g)].map(m=>m[1]),
  ];
  for (const name of symbols) {
    if (globalSymbols.has(name)) {
      failed = true;
      console.error(`Duplicate global symbol ${name}: ${globalSymbols.get(name)} and ${file}`);
    } else globalSymbols.set(name, file);
  }
}

const maintainabilityBudgets = {
  'match-core-queue.js': 2500,
  'match-core-state.js': 6000,
  'match-core-restore.js': 11000,
  'match-core-kernel.js': 9000,
  'match-core-input.js': 5000,
  'initial-offer-impact.js': 6000,
  'initial-comparison-model.js': 7000,
  'shortlist-comparison-model.js': 4000,
  'initial-candidate-query.js': 9000,
  'app.js': 22000,
  'ui-startup.js': 7000,
  'ui-startup-storage.js': 5500,
  'ui-theme.js': 1500,
  'ui-club-actions.js': 6500,
  'ui-initial-squad.js': 6500,
  'ui-transfer-page.js': 6500,
  'ui-initial-filters.js': 6500,
  'ui-initial-table.js': 6500,
  'ui-club-briefing.js': 8500,
  'ui-club-home.js': 2500,
  'ui-club-eligibility.js': 7500,
  'ui-official-edit.js': 6500,
  'ui-club-finance.js': 8500,
  'ui-club-staff.js': 8500,
  'ui-club-medical.js': 7500,
  'ui-club-contracts.js': 8000,
  'ui-club-practice.js': 10500,
  'ui-club-scrim.js': 9000,
  'ui-club-recruitment.js': 12000,
  'ui-shortlist-comparison.js': 7000,
  'ui-squad-controls.js': 3000,
  'ui-staff-controls.js': 4000,
  'ui-state.js': 6500,
  'ui-overlay.js': 6500,
  'random.js': 5000,
  'match-adjudication.js': 2000,
  'engine.js': 34000,
  'champion-data.js': 14000,
  'system-data.js': 14000,
  'data.js': 20000,
  'systems.js': 11000,
  'item-purchases.js': 4500,
  'draft.js': 21000,
  'content-naming.js': 16000,
  'meta.js': 14000,
  'meta-side.js': 5000,
  'meta-composition.js': 6500,
  'meta-draft-order.js': 7000,
  'meta-tactics.js': 6500,
  'meta-practice.js': 8500,
  'meta-analyst.js': 9000,
  'meta-opponent.js': 9000,
  'meta-opponent-draft.js': 10000,
  'ui-opponent-report.js': 8500,
  'ui-opponent-draft.js': 8500,
  'patch.js': 9000,
  'patch-balance.js': 22000,
  'patch-content.js': 12500,
  'series.js': 18000,
  'first-selection.js': 8500,
  'competition.js': 18000,
  'league-aggregation.js': 12000,
  'player.js': 25000,
  'development.js': 14000,
  'player-relations.js': 16000,
  'player-representation.js': 8000,
  'world.js': 28000,
  'season.js': 24000,
  'calendar.js': 5000,
  'offseason.js': 16000,
  'save.js': 10000,
  'save-migration.js': 8000,
  'roster.js': 22000,
  'lineup.js': 12000,
  'state-transaction.js': 9000,
  'state-rollback.js': 8000,
  'squad-preparation.js': 8000,
  'state-player-actions.js': 17000,
  'finance.js': 18000,
  'club-ownership.js': 4500,
  'club-license.js': 4500,
  'region-continuity.js': 4500,
  'contracts.js': 26000,
  'contract-market-pricing.js': 5500,
  'contract-market-behavior.js': 5000,
  'contract-transfer-market.js': 6500,
  'scouting.js': 14000,
  'scouting-ai.js': 10000,
  'scouting-champions.js': 5500,
  'scouting-ai-ops.js': 7000,
  'scouting-ai-reassessment.js': 5000,
  'transfer.js': 26000,
  'contract-negotiation.js': 21000,
  'contract-market-offers.js': 9000,
  'contract-window.js': 11000,
  'contract-contact-ai.js': 6000,
  'contract-agreement.js': 8000,
  'staff.js': 18000,
  'scrim.js': 10000,
  'features.js': 14000,
  'role-conversion.js': 14000,
  'draft-analysis.js': 18000,
  'draft-preparation.js': 5000,
  'draft-history.js': 9000,
  'match-history.js': 7500,
  'ui-match-history.js': 8000,
  'ui-draft-history.js': 6500,
  'ui-draft-preparation.js': 6000,
  'ui-draft-analysis.js': 9000,
  'ui-patch.js': 30000,
  'ui-analysis.js': 6500,
  'analysis-tiers.js': 6500,
  'ui-analysis-tiers.js': 6500,
  'ui-analysis-comparison.js': 6500,
  'ui-market.js': 17000,
  'ui-observed-radar.js': 3000,
  'ui-initial-comparison.js': 8000,
  'ui-initial-candidates.js': 9500,
  'ui-market-initial.js': 15000,
  'ui-initial-offer-preview.js': 7000,
  'ui-negotiations.js': 9500,
  'ui-market-staff.js': 8500,
  'office-international.js': 18000,
  'office.js': 17000,
  'ui-setup.js': 16000,
  'ui-match.js': 22000,
  'ui-manager.js': 16000,
  'ui-save-library.js': 6500,
  'ui-save-recovery-store.js': 3500,
  'ui-save-protection.js': 4000,
  'ui-save-recovery.js': 6500,
  'ui-stove.js': 6500,
  'ui-stove-fa.js': 2500,
  'ui-data.js': 12000,
  'ui-champion.js': 18000,
  'ui-player.js': 18000,
  'ui-player-champions.js': 5500,
  'ui-scouting-regions.js': 3000,
  'ui-player-commitments.js': 5000,
  'player-loans.js': 14000,
  'player-loan-market.js': 6000,
  'transfer-payments.js': 11000,
  'finance-estate.js': 6000,
  'transfer-market-rules.js': 3000,
  'loan-purchase.js': 10000,
  'local-service.js': 11000,
  'registration.js': 14000,
  'registration-match.js': 8500,
  'ui-registration.js': 6500,
  'ui-player-loans.js': 6000,
  'ui-transfer-terms.js': 10000,
  'ui-local-service.js': 4500,
  'ui-squad-status.js': 6500,
  'ui-squad-table.js': 6500,
  'ui-roster.js': 18000,
  'ui-squad-preparation.js': 8000,
  'ui-official-context.js': 6500,
  'ui-draft.js': 22000,
  'ui-season.js': 30000,
};
for (const [file, maxBytes] of Object.entries(maintainabilityBudgets)) {
  const source = sourceOf(file);
  if (source.length > maxBytes) {
    failed = true;
    console.error(`Maintainability budget exceeded: ${file} > ${maxBytes} characters; split the domain UI instead of growing the monolith`);
  }
}


const stage2Ownership = [
  ['random.js','engine.js','function makeStreams('],
  ['champion-data.js','data.js','function applyChampionSource('],
  ['system-data.js','data.js','function buildRuneSystems('],
  ['systems.js','draft.js','function selectRunePage('],
  ['systems.js','draft.js','function championSystemMetaProfile('],
  ['patch-balance.js','patch.js','function diagnosePatchMeta('],
  ['patch-content.js','patch.js','function maybeNewChampion('],
  ['office-international.js','office.js','function globalOffice('],
  ['ui-market-initial.js','ui-market.js','function renderInitialRosterMarket('],
  ['ui-negotiations.js','ui-market.js','function renderNegotiations('],
  ['ui-market-staff.js','ui-market.js','function coachBlock('],
];
for (const [owner,former,marker] of stage2Ownership) {
  const ownerSource = sourceOf(owner);
  const formerSource = sourceOf(former);
  if (!ownerSource.includes(marker) || formerSource.includes(marker)) {
    failed=true;
    console.error('Stage 11.5/2 domain boundary violated: '+marker+' must belong to '+owner);
  }
}

const transactionSource = sourceOf('state-transaction.js');
for (const marker of ['function validateWorldAction(','function previewWorldAction(','function applyWorldAction(','roster.plan']) {
  if (!transactionSource.includes(marker)) {
    failed = true;
    console.error('Shared world transaction capability missing: '+marker);
  }
}
const rosterSourceForTransactions = sourceOf('roster.js');
const rosterUiForTransactions = sourceOf('ui-roster.js');
for(const [owner,marker] of [[rosterSourceForTransactions,"actor:'ai'"],[rosterUiForTransactions,"actor:'manager'"]]){
  if(!owner.includes('previewWorldAction(')||!owner.includes('applyWorldAction(')||!owner.includes(marker)){
    failed = true;
    console.error('Shared roster transaction path must be used by AI and manager');
  }
}

const rollbackSource=sourceOf('state-rollback.js');
for(const marker of ['function captureWorldActionJournal(','function worldActionScopeErrors(',
  'function actionJournalRestoreObject(','function actionJournalRestoreTeam(']){
  if(!rollbackSource.includes(marker)){
    failed=true;console.error('11.5/3-4 rollback journal helper missing: '+marker);
  }
}
if(!transactionSource.includes('journal=captureWorldActionJournal(')||
   !transactionSource.includes('journal.rollback()')||
   !transactionSource.includes('worldActionScopeErrors(')||
   !transactionSource.includes('saveId:db.saveId||null')){
  failed=true;console.error('11.5/3-4 guarded commit/rollback or save ownership marker missing');
}

const playerActionSource = sourceOf('state-player-actions.js');
for(const marker of ['function validatePlayerSignAction(','function validatePlayerTransferAction(',
  'function validatePlayerReleaseAction(','function validatePlayerOptionAction(',
  'function playerActionSnapshot(','function applyPlayerSignAction(','function applyPlayerTransferAction(',
  'function applyPlayerReleaseAction(','function applyPlayerOptionAction(',
  "'player.sign'","'player.transfer'","'player.release'","'player.option'"]){
  if(!playerActionSource.includes(marker)){
    failed=true;console.error('Stage 11.5/3-2 player transaction handler missing: '+marker);
  }
}
for(const file of ['contracts.js','contract-negotiation.js','transfer.js','career.js']){
  const owner=sourceOf(file);
  if(!owner.includes('commitWorldAction(')){
    failed=true;console.error('Stage 11.5/3-2 missing command-gateway client: '+file);
  }
}
if(!transactionSource.includes('function commitWorldAction(')){
  failed=true;console.error('Single-step world transaction gateway missing');
}

// 11.5/3-3: a separately versioned save-encoding migration and non-destructive restore.
const saveMigrationSource=sourceOf('save-migration.js');
const saveSerializationSource=sourceOf('save.js');
const appSaveSource=sourceOf('app.js');
const rosterIntegritySource=sourceOf('roster.js');
for(const marker of ['const SAVE_FORMAT_VERSION=2','function validateSaveEnvelope(',
  'function normalizeRestoredSave(','function migrateSaveState(',
  'function unpackPlayerSaveFields(']){
  if(!saveMigrationSource.includes(marker)){failed=true;console.error('11.5/3-3 migration gate missing: '+marker)}
}
if(!saveSerializationSource.includes('return migrateSaveState(JSON.parse(str))')||
   !saveSerializationSource.includes('saveFormat:SAVE_FORMAT_VERSION')){
  failed=true;console.error('Save encoding must use explicit version and migration path');
}
if(appSaveSource.includes('purgeLegacySaves(')||
   !appSaveSource.includes('if(invalid.length)')||
   !appSaveSource.includes('const db=DB,slot=SLOT,key=STORE')){
  failed=true;console.error('Storage must preserve invalid/old saves and capture writes by slot');
}
if(rosterIntegritySource.includes('if(db.metaHistoryPacked)')){
  failed=true;console.error('Roster integrity check must be pure: save restoration belongs to save-migration');
}

const draftUiSource = sourceOf('ui-draft.js')+'\n'+sourceOf('ui-draft-analysis.js');
const draftShellMarkers = ['du-series-meta','du-fearless','du-last-card','du-ban-img','du-pick-img','du-mobile-tabs','safe-area-inset-bottom'];
const draftUiMarkers = ['officialLastGameCard','draftUiSeriesMeta','draftUiFearlessStrip','draftUiAnalysisPanel','draftUiStaffAdvice','draftUiOpponentIntent','draftUiEvidenceSources','draftUiPoolTop','data-du-info','du-info-panel',"reason:'Fearless'"];
for (const marker of draftUiMarkers) if (!draftUiSource.includes(marker)) {
  failed = true;
  console.error(`Interactive draft UI contract missing marker: ${marker}`);
}
const shellSource = sourceOf('shell.html');
for (const marker of draftShellMarkers) if (!shellSource.includes(marker)) {
  failed = true;
  console.error(`Interactive draft shell contract missing marker: ${marker}`);
}

const setupUiSource = sourceOf('ui-season.js');
for (const obsoleteId of ['addreg','addintl']) {
  if (setupUiSource.includes(`#${obsoleteId}`)) {
    failed = true;
    console.error(`Removed setup control #${obsoleteId} is still referenced by bindSetup`);
  }
}

for (const file of modules.filter(file => !['save.js','save-migration.js'].includes(file))) {
  const source = sourceOf(file);
  for (const marker of ['secondaryRoles','roleFamiliarity','trainSecondaryRole','officialRoleEligible']) if (source.includes(marker)) {
    failed = true;
    console.error(`Deprecated secondary-role model leaked into ${file}: ${marker}`);
  }
}
const uiSetupSource = sourceOf('ui-setup.js');
const uiMatchSource = sourceOf('ui-match.js');
const uiManagerSource = sourceOf('ui-manager.js');
const uiDataSource = sourceOf('ui-data.js');
const appSource = sourceOf('app.js');
const playerSource = sourceOf('player.js');
const developmentSource = sourceOf('development.js');
const seasonSource = sourceOf('season.js');
const offseasonSource = sourceOf('offseason.js');
const saveSource = sourceOf('save.js');
const worldSource = sourceOf('world.js');
const rosterSource = sourceOf('roster.js');
const metaSource = sourceOf('meta.js');
const patchSource = sourceOf('patch.js');
const draftSource = sourceOf('draft.js');
const seriesSource = sourceOf('series.js');
const competitionSource = sourceOf('competition.js');
const financeSource = sourceOf('finance.js');
const contractsSource = sourceOf('contracts.js');
const scoutingSource = sourceOf('scouting.js');
const transferSource = sourceOf('transfer.js');
const negotiationSource = sourceOf('contract-negotiation.js');
const staffSource = sourceOf('staff.js');
const relationsSource = sourceOf('player-relations.js');
const scrimSource = sourceOf('scrim.js')+'\n'+sourceOf('practice-resources.js');
const featuresSource = sourceOf('features.js');
const draftAnalysisSource = sourceOf('draft-analysis.js');
const legacySaveLines = saveSource.split('\n').filter(line => /secondaryRoles|roleFamiliarity/.test(line));
for (const line of legacySaveLines) if (!/delete\s+[^;]*(secondaryRoles|roleFamiliarity)/.test(line)) {
  failed = true;
  console.error('Deprecated secondary-role field is used by save.js outside deletion/migration cleanup: '+line.trim());
}

if (!draftSource.includes('function draftCandidateAnalysis(')) {
  failed = true;
  console.error('Draft candidate analysis domain helper is missing');
}
if (!draftSource.includes('function draftStaffAdvice(')) {
  failed = true;
  console.error('Draft staff advice domain helper is missing');
}
if (!draftAnalysisSource.includes('function draftOpponentIntent(')) {
  failed = true;
  console.error('Opponent draft intent analysis helper is missing');
}
for (const marker of ['function draftMasteryObservation(','function draftCandidateEvidence(','function draftMetaEvidence(']) if (!draftAnalysisSource.includes(marker)) {
  failed = true;
  console.error('Draft evidence/provenance helper is missing: '+marker);
}
for (const marker of ['function draftMasteryObservation(','function draftOpponentIntent(','function draftCandidateEvidence(']) if (featuresSource.includes(marker)) {
  failed = true;
  console.error('Draft-analysis responsibility leaked back into features.js: '+marker);
}
for (const marker of ['function validateRosterPlan(','function applyRosterPlan(','function rosterIntegrityErrors(','function localRegistrationError(']) {
  if (!rosterSource.includes(marker)) {
    failed = true;
    console.error('Roster domain helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Roster-domain responsibility leaked back into world.js: '+marker);
  }
}
for (const marker of ['function genPlayer(','function generateRookieClass(','function playerRoleRating(']) {
  if (!playerSource.includes(marker)) {
    failed = true;
    console.error('Player lifecycle helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Player lifecycle responsibility leaked back into world.js: '+marker);
  }
}
for (const marker of ['function growPlayer(','function growthCap(','function ensureFacilities(']) {
  if (!developmentSource.includes(marker)) {
    failed = true;
    console.error('Development helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Development responsibility leaked back into world.js: '+marker);
  }
}

// Retired manual attribute sliders and intensity cannot silently reappear.
for(const marker of ['const TRAIN_POINTS=','function defaultTraining(','function normalizeTraining(',
  'function setTrainingAllocation(','function trainingIntensity(','function aiManageTraining(']){
  if(developmentSource.includes(marker)){
    failed=true;console.error('Retired manual training helper reintroduced: '+marker);
  }
}
for (const marker of ['function startWorldSeason(','function playWorldDay(','function startInternational(']) {
  if (!seasonSource.includes(marker)) {
    failed = true;
    console.error('Season orchestration helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Season responsibility leaked back into world.js: '+marker);
  }
}
for (const marker of ['function runOffseason(','function closeMarket(','function promotionRelegation(']) {
  if (!offseasonSource.includes(marker)) {
    failed = true;
    console.error('Offseason helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Offseason responsibility leaked back into world.js: '+marker);
  }
}
for (const marker of ['function packDB(','function unpackDB(','function worldForSave(']) {
  if (!saveSource.includes(marker)) {
    failed = true;
    console.error('Save serialization helper is missing: '+marker);
  }
  if (worldSource.includes(marker)) {
    failed = true;
    console.error('Save responsibility leaked back into world.js: '+marker);
  }
}
for (const marker of ['function normalizeContractTerms(','function signContract(','function contractMarket(']) {
  if (!contractsSource.includes(marker)) { failed=true; console.error('Contract-domain helper missing: '+marker); }
  if (financeSource.includes(marker)) { failed=true; console.error('Contract responsibility leaked into finance.js: '+marker); }
}
for (const marker of ['function recruitmentStore(','function sellerTransferAsk(','function mTransferBid(','function doTransfer(']) {
  if (!transferSource.includes(marker)) { failed=true; console.error('Transfer-domain helper missing: '+marker); }
  if (financeSource.includes(marker)||contractsSource.includes(marker)) { failed=true; console.error('Transfer responsibility leaked into finance/contract domain: '+marker); }
}
for (const marker of ['function negotiationStore(','function negotiationId(',
  'function startNegotiation(','function submitNegotiationOffer(',
  'function finalizeNegotiation(','function cancelNegotiation(']) {
  if (!negotiationSource.includes(marker)) { failed=true; console.error('Player negotiation helper missing: '+marker); }
  if (transferSource.includes(marker)||contractsSource.includes(marker)||financeSource.includes(marker)) {
    failed=true; console.error('Player negotiation responsibility leaked out of contract-negotiation.js: '+marker);
  }
}
for (const marker of ['function ensureScoutReport(','function scoutReport(','function observePlayer(']) {
  if (!scoutingSource.includes(marker)) { failed=true; console.error('Scouting-domain helper missing: '+marker); }
  if (financeSource.includes(marker)) { failed=true; console.error('Scouting responsibility leaked into finance.js: '+marker); }
}
for (const marker of ['function ensureSatisfaction(','function updatePlayerUsage(','function afterSeries(']) {
  if (!relationsSource.includes(marker)) { failed=true; console.error('Player-relations helper missing: '+marker); }
  if (featuresSource.includes(marker)) { failed=true; console.error('Player-relations responsibility leaked into features.js: '+marker); }
}
for (const marker of ['function staffProfile(','function ensureStaffRoster(','function aiManageStaff(']) {
  if (!staffSource.includes(marker)) { failed=true; console.error('Staff-domain helper missing: '+marker); }
  if (featuresSource.includes(marker)) { failed=true; console.error('Staff responsibility leaked into features.js: '+marker); }
}
for (const marker of ['function scrimReadiness(','function aiRunScrims(','function recordScrimPractice(']) {
  if (!scrimSource.includes(marker)) { failed=true; console.error('Scrim-domain helper missing: '+marker); }
  if (featuresSource.includes(marker)) { failed=true; console.error('Scrim responsibility leaked into features.js: '+marker); }
}
if (!developmentSource.includes('function dailyRecovery(') || featuresSource.includes('function dailyRecovery(')) {
  failed=true; console.error('Daily recovery must be owned by development/training domain');
}
for (const marker of ['function createSeriesSession(','function playSeriesSessionGame(','function simulateSeries(']) {
  if (!seriesSource.includes(marker)) { failed=true; console.error('Series-domain helper missing: '+marker); }
  if (competitionSource.includes(marker)) { failed=true; console.error('Series responsibility leaked into competition.js: '+marker); }
}
for (const marker of ['function newSeason(','function standings(','function playDay(']) {
  if (!competitionSource.includes(marker)) { failed=true; console.error('Competition helper missing: '+marker); }
}
for (const marker of ['function metaHistoryIndex(','function recordMeta(','function metaTableFiltered(']) {
  if (!metaSource.includes(marker)) { failed=true; console.error('Meta-domain helper missing: '+marker); }
  if (patchSource.includes(marker)) { failed=true; console.error('Meta responsibility leaked into patch.js: '+marker); }
}
for (const marker of ['function applyNote(','function getPatch(','function patchTick(']) {
  if (!patchSource.includes(marker)) { failed=true; console.error('Patch-domain helper missing: '+marker); }
}
for (const marker of ['function viewMatch(','function renderResult(','function renderSeries(']) {
  if (!uiMatchSource.includes(marker)) { failed=true; console.error('Match UI helper missing: '+marker); }
  if (appSource.includes(marker)) { failed=true; console.error('Match UI leaked back into app.js: '+marker); }
}
for (const marker of ['function managerTeamPicker(','function seasonSetup(']) {
  if (!uiSetupSource.includes(marker)) { failed=true; console.error('Setup UI helper missing: '+marker); }
  if (appSource.includes(marker)) { failed=true; console.error('Setup UI leaked back into app.js: '+marker); }
}
for (const marker of ['function viewData(','function bindData(']) {
  if (!uiDataSource.includes(marker)) { failed=true; console.error('Data UI helper missing: '+marker); }
  if (appSource.includes(marker)) { failed=true; console.error('Data UI leaked back into app.js: '+marker); }
}
const saveVersion = Number(appSource.match(/const SAVE_VERSION=(\d+)/)?.[1]);
const worldVersion = Number(worldSource.match(/version:(\d+),saveId:/)?.[1]);
if (!Number.isInteger(saveVersion) || !Number.isInteger(worldVersion) || saveVersion !== worldVersion) {
  failed = true;
  console.error(`Save schema mismatch: app SAVE_VERSION=${saveVersion}, buildWorld version=${worldVersion}`);
}

// 11.5/4: keep long-career indexes bounded, incremental, and non-persistent.
const balanceIndexSource=sourceOf('patch-balance.js');
const patchUiIndexSource=sourceOf('ui-patch.js');
const perfIndexSource=await readFile(resolve(root,'scripts','perf.mjs'),'utf8');
for(const [source,marker] of [
  [metaSource,'const META_FILTER_CACHE_LIMIT=64'],
  [metaSource,'const META_HISTORY_CACHE=new WeakMap()'],
  [metaSource,'function metaHistoryFacets('],
  [metaSource,'function metaIndexAddRow('],
  [metaSource,'function historicPatchCacheHit('],
  [patchSource,'rememberHistoricPatch(db,id,P)'],
  [balanceIndexSource,'function patchSystemUsageIndex('],
  [balanceIndexSource,'const SYSTEM_USAGE_INDEX_CACHE=new WeakMap()'],
  [patchUiIndexSource,'metaHistoryFacets(DB)'],
  [perfIndexSource,'meta_incremental_append'],
  [perfIndexSource,'system_usage_reference_scan']
]){
  if(!source.includes(marker)){
    failed=true;console.error('11.5/4 index or performance gate missing: '+marker);
  }
}

// 11.5/5: one canonical regional/transfer-registration rule path, no dead wrappers.
const stage5Finance=sourceOf('finance.js');
const stage5Transfer=sourceOf('transfer.js');
const stage5Contracts=sourceOf('contracts.js');
const stage5Roster=sourceOf('roster.js');
const stage5Smoke=await readFile(resolve(root,'scripts','smoke.mjs'),'utf8');
for(const marker of ['function detachPlayerFromRosters(',
  'function localRegistrationError(','function contractedMoveError(',
  'function playerActiveLocalRegion(']){
  if(!stage5Roster.includes(marker)){
    failed=true;console.error('11.5/5 canonical roster helper missing: '+marker);
  }
}
for(const marker of ['localRegistrationError(db,','contractedMoveError(db,','teamNonLocalCount(db,']){
  if(!playerActionSource.includes(marker)){
    failed=true;console.error('11.5/5 player transactions no longer call canonical rules: '+marker);
  }
}
if(playerActionSource.includes('playerActionLocal')||
   playerActionSource.includes('playerActionMoveError')||
   stage5Contracts.includes('playerActionLocalError')||
   stage5Finance.includes('PAY_SCALE')||
   stage5Transfer.includes('function mResign(')||
   !stage5Smoke.includes("typeof PAY_SCALE!=='undefined'")){
  failed=true;console.error('11.5/5 deprecated registration, finance or renewal aliases returned');
}
if(stage5Roster.includes('function contractedMoveCount(db,p){ensurePlayerEligibility')||
   !stage5Roster.includes('Array.isArray(p?.contractedMoves)')||
   !stage5Roster.includes('detachPlayerFromRosters(db,player.id,team.id);')){
  failed=true;console.error('11.5/5 read-only move check or shared roster detachment changed');
}

// 11.5/5-2: Engine module manifest always supplies these domain APIs.
// Remove optional fallbacks: a missing dependency should fail loudly rather
// than quietly skipping contract, staff, draft or player-state rules.
const stage52Hooks=[
  ['system-data.js','const SYSTEM_EFFECT_KEYS='],
  ['player.js','function adaptPlayerPoolsToPatch('],
  ['player-relations.js','function ensureSatisfaction('],
  ['player-relations.js','function onSquadMoveSatisfaction('],
  ['player-relations.js','function pState('],
  ['role-conversion.js','function recordRoleConversionUsage('],
  ['staff.js','function staffProfile('],
  ['staff.js','function migrateLegacyStaffState('],
  ['career.js','function initialSalaryBudget('],
  ['career.js','function initialOfferCheck('],
  ['career.js','function setupTeamsForManager(']
];
for(const [file,marker] of stage52Hooks){
  const s=sourceOf(file);
  if(!s.includes(marker)){failed=true;console.error('11.5/5-2 required engine API missing: '+file+' '+marker)}
}
const obsoleteDomainGuards=/typeof\s+(?:SYSTEM_EFFECT_KEYS|adaptPlayerPoolsToPatch|playerOvr|ensureSatisfaction|staffProfile|resetRoleConversionSeasonLoad|recordRoleConversionUsage|onSquadMoveSatisfaction|pState|migrateLegacyStaffState|initialSalaryBudget|setupTeamsForManager|initialOfferCheck)\s*(?:===|!==)\s*['"](?:function|undefined)['"]/;
for(const file of modules.filter(f=>!['app.js','shell.html'].includes(f))){
  const s=sourceOf(file);
  if(obsoleteDomainGuards.test(s)||s.includes('resetRoleConversionSeasonLoad(')){
    failed=true;console.error('11.5/5-2 obsolete optional hook fallback: '+file);
  }
}

// 11.5/5-3: these obsolete wrappers have no runtime, markup or test caller.
// A search across all 55 canonical engine/UI source modules and the smoke suite
// found zero non-declaration uses. Keep the actual supported entrypoints.
const stage53Removed=[
  'initialSignPlayer','normalizeInitialSalaryFloor','nextMid',
  'scheduledOpeningDraft','movePlayerBetweenSquads','mOffer'
];
for(const file of modules){
  const src=sourceOf(file);
  for(const name of stage53Removed)
    if(new RegExp('\\b'+name+'\\b').test(src)){
      failed=true;console.error('11.5/5-3 obsolete/unreachable API returned in '+file+': '+name);
    }
}
for(const [file,marker] of [
  ['career.js','function initialStartNegotiation('],
  ['career.js','function autoBuildInitialSquad('],
  ['competition.js','function scheduledSeriesSession('],
  ['roster.js','function rosterMoveCheck('],
  ['state-transaction.js','function previewWorldAction('],
  ['contract-negotiation.js','function startNegotiation(']
]){
  const src=sourceOf(file);
  if(!src.includes(marker)){
    failed=true;console.error('11.5/5-3 actively used entrypoint missing in '+file+': '+marker);
  }
}
for(const marker of ['autoBuildInitialSquad(db,','rosterMoveCheck(db,'])
  if(!stage5Smoke.includes(marker)){
    failed=true;console.error('11.5/5-3 smoke acceptance lost active caller: '+marker);
  }

const regressionSource = await readFile(resolve(root, 'scripts', 'regression.mjs'), 'utf8');
for (const marker of ['01-world-bootstrap','05-contracts','06-owned-reserve-roster','06c-player-sign-transaction','06d-player-transfer-transaction','06e-ai-transfer-and-move-limit','06f-release-and-option-transaction','06g-save-format-and-cache-isolation','06h-legacy-v15-save-restoration','06i-invalid-and-forward-saves','06j-transaction-transfer-rollback','06k-transaction-roster-rollback','06l-transaction-release-option-rollback','06m-transaction-actor-parity-and-membership-guard','09-patch-baseline','11-draft-series-save','11a-meta-index-incremental-and-bounded','11b-historic-patch-cache-limit','11c-system-usage-index-parity','11d-shared-registration-rule-and-pure-preview','11e-roster-detach-is-single-owner','11f-dead-api-pruned-without-market-breakage','11g-required-domain-hooks-have-real-effects','11h-initial-market-must-use-real-budget-and-team-policy','11i-unreachable-wrappers-removed-and-supported-routes-retained','11j-initial-manager-negotiation-path-after-legacy-removal','11k-scheduled-series-session-after-unused-opener-removal','11l-reserve-preflight-and-transaction-after-legacy-removal','11m-new-procedural-regional-league-and-save-restore','mid-Bo5 session did not survive save/load']) {
  if (!regressionSource.includes(marker)) {
    failed = true;
    console.error('11.5 regression baseline missing marker: '+marker);
  }
}
const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
if (!String(packageJson.scripts?.check||'').includes('scripts/regression.mjs')) {
  failed = true;
  console.error('Regression baseline is not wired into npm run check');
}
// 11.5/5-4: multi-year games, current/legacy save restore and consecutive
// rookie/market cycles must be a required check, not an optional smoke run.
// Newly founded professional leagues may come from speculative markets,
// not solely from fixed historical-region labels.
const officeWorldSource=sourceOf('office-international.js');
for(const text of ['FUTURE_LEAGUE_MARKETS','newLeagueIdentity(','futureLeagueCandidates(db)',
  'historic.length&&future.length','db.global.foundedLeagueNames']){
  if(!officeWorldSource.includes(text)){
    failed=true;console.error('Speculative league expansion missing: '+text);
  }
}
const careerAcceptanceSource=await readFile(resolve(root,'scripts','career-acceptance.mjs'),'utf8');
for(const marker of ['for(let cycle=0;cycle<2;cycle++)','playDay(db,s)',
  'runOffseason(db)','closeMarket(db)','startWorldSeason(db,teamId,',
  'unpackDB(JSON.stringify(data))','packDB(db)','rosterIntegrityErrors(db)',
  'talentSupplyErrors(db)','CAREER_ACCEPTANCE']){
  if(!careerAcceptanceSource.includes(marker)){
    failed=true;console.error('11.5/5-4 multi-year acceptance missing: '+marker);
  }
}
if(!String(packageJson.scripts?.check||'').includes('scripts/career-acceptance.mjs')||
  !String(packageJson.scripts?.['career:acceptance']||'').includes('scripts/career-acceptance.mjs')){
  failed=true;console.error('11.5/5-4 career acceptance is not wired into npm run check');
}


const shell = sourceOf('shell.html');
if (!shell.includes('<meta name="viewport"')) {
  failed = true;
  console.error('Missing mobile viewport meta tag');
}
if (!shell.includes('/*CODE*/')) {
  failed = true;
  console.error('Missing /*CODE*/ build placeholder');
}
if (!shell.includes('LOL <span>GM</span>')) {
  failed = true;
  console.error('LOL GM branding is missing from shell');
}

const forbiddenBranding = [
  ['legacy Latin product name', /ROLLFM/i],
  ['legacy Korean product name', /롤FM/i],
  ['legacy storage/product token', /\blolfm\b/i],
];
const docFiles = (await readdir(resolve(root, 'docs'))).filter(file => file.endsWith('.md')).map(file => resolve(root, 'docs', file));
const brandTargets = [
  ...modules.map(file => resolve(artifact, file)),
  resolve(artifact, 'shell.html'),
  resolve(root, 'README.md'),
  resolve(root, 'MIGRATION_REPORT.md'),
  ...docFiles,
];
for (const path of brandTargets) {
  const source = artifactSources.get(path) ?? await readFile(path, 'utf8');
  for (const [label, pattern] of forbiddenBranding) {
    if (pattern.test(source)) {
      failed = true;
      console.error(`Forbidden ${label} remains in ${path.slice(root.length + 1)}`);
    }
  }
}

if (failed) process.exit(1);
console.log(`Checked ${modules.length} JavaScript modules and Artifact shell: OK`);
