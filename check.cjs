const assert=require('node:assert/strict');
const E=require('./dist/engine.js');
function isolate(s){E.isolate(s,'power');E.isolate(s,'water')}
function test(s,id){const r=E.runTool(s,id);assert.equal(r.ok,true,r.message);return r.evidence.id}
function diagnose(s,fault,ids){const r=E.diagnose(s,{fault,evidenceIds:ids,reason:'The selected observations support this explanation and exclude the competing upstream or signal explanation.',confidence:80});assert.equal(r.ok,true,r.message);return r}
for(const fault of Object.keys(E.FAULTS)){
 const s=E.createSession({fault,name:'Synthetic test trainee'}),ids=[];
 for(const id of E.FAULTS[fault].key){const tool=E.TOOLS.find(t=>t.id===id);if(tool.safety&&!s.powerIsolated)isolate(s);if(tool.powered&&s.powerIsolated)isolate(s);ids.push(test(s,id));}
 assert.equal(diagnose(s,fault,ids).correct,true);
 if(!s.powerIsolated)isolate(s);assert.equal(E.repair(s,fault).ok,true);isolate(s);assert.equal(E.verify(s).passed,true);assert.equal(E.finish(s).ok,true);assert.equal(E.score(s).total,100);assert.equal(E.validSession(s),true);
}
let s=E.createSession({fault:'filter'});assert.equal(E.runTool(s,'filter').ok,false);assert.equal(s.safetyBlocks,1);assert.equal(s.cost,0);assert.equal(s.evidence.length,0);assert.equal(E.finish(s).ok,false);isolate(s);let e1=test(s,'pressure'),e2=test(s,'filter');diagnose(s,'valve',[e1,e2]);assert.equal(E.repair(s,'hose').ok,true);assert.equal(s.repaired,false);assert.equal(s.cost,8);isolate(s);assert.equal(E.verify(s).passed,false);assert.equal(E.score(s).diagnosis,0);
s=E.createSession({fault:'valve',budget:10});isolate(s);assert.equal(E.repair(s,'valve').ok,false);assert.equal(s.cost,0);assert.equal(s.repaired,false);
s=E.createSession({fault:'supply'});let one=test(s,'tap');assert.equal(E.diagnose(s,{fault:'supply',evidenceIds:[one,one],reason:'This is a sufficiently long but unsupported explanation.'}).ok,false);
s=E.createSession({fault:'sensor',mode:'exam'});assert.match(E.coach(s),/disabled/);assert.match(E.customer(s,'When did it start?'),/display/);assert.match(E.customer(s,'unrelated question'),/can describe/);
const json=JSON.stringify(s);assert.equal(E.validSession(JSON.parse(json)),true);assert.equal(E.validSession({...s,fault:'unknown'}),false);assert.equal(E.validSession({...s,evidence:[{id:1}]}),false);assert.equal(E.validSession({...s,minutes:Infinity}),false);
assert.equal(E.finish(s,true).ok,true);assert.equal(E.runTool(s,'history').ok,false);assert.equal(E.repair(s,'sensor').ok,false);assert.equal(E.verify(s).ok,false);
console.log('PASS: all 5 case paths score 100 with supporting evidence, correct repair and verification; isolation gates, wrong diagnosis/repair, failed verification, budget limits, evidence validation, exam coaching, customer fallback, persistence validation and completed-session locks.');
