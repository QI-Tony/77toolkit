import test from "node:test";
import assert from "node:assert/strict";
import { simulateColor, figureResolution, randomizeSamples, inspectCsv, cleanReferences } from "../apps/browser-tools/shared/research-data.mjs";

test("palette simulation validates input and converts grayscale in linear light", () => {
  assert.equal(simulateColor("#ff0000","Grayscale"),"#7f7f7f");
  assert.equal(simulateColor("#000000","Tritanopia"),"#000000");
  assert.notEqual(simulateColor("#ff0000","Protanopia"),"#ff0000");
  assert.throws(()=>simulateColor("red","Original"),/HEX/);
});

test("effective resolution uses placed width and rounds the minimum pixel count up", () => {
  const result = figureResolution(1800,150,"mm",300);
  assert.ok(Math.abs(result.effective-304.8)<1e-8);
  assert.equal(result.required,1772);
  assert.equal(figureResolution(1800,6,"in",300).effective,300);
  assert.throws(()=>figureResolution(1800,0,"mm",300));
});

test("seeded allocation preserves every ID and requested group sizes", () => {
  const ids = ["A","B","C","D","E"];
  const groups = [["Control",2],["Test",3]];
  const assigned = randomizeSamples(ids,groups,"test seed");
  assert.deepEqual(assigned,randomizeSamples(ids,groups,"test seed"));
  assert.deepEqual(assigned.map(([id])=>id).sort(),ids);
  assert.equal(assigned.filter(([,group])=>group==="Test").length,3);
  assert.throws(()=>randomizeSamples([...ids,"A"],groups,"test seed"),/unique/);
});

test("CSV report identifies duplicates, malformed records, missing data and invalid numerics", () => {
  const result = inspectCsv([["id","group","value"],["A","C","1.5e-4"],["A","C","NA"],["B","T","Infinity","extra"]],{id:"id",group:"group",numeric:["value"]});
  assert.deepEqual([...result.counts],[["C",2],["T",1]]);
  assert.equal(result.issues.length,4);
  assert.match(result.issues.join(" "),/Record 3: duplicate ID/);
});

test("bibliography review preserves input and optionally deduplicates normalized DOI", () => {
  const bib = '@article{one, title={A {nested} title}, doi={10.1234/Test}, year={2020}}\n@article{one, doi="https://doi.org/10.1234/test"}';
  assert.equal(cleanReferences(bib,"bib",false).text,bib);
  const result = cleanReferences(bib,"bib",true);
  assert.equal(result.removed,1);
  assert.equal(result.issues.length,3);
  assert.match(result.text,/A \{nested\} title/);
  const ris = "TY  - JOUR\r\nDO  - 10.1234/Test\r\nPY  - 2020\r\nER  -\r\n\r\nTY  - JOUR\r\nDO  - doi:10.1234/test\r\nER  -";
  assert.equal(cleanReferences(ris,"ris",true).removed,1);
  assert.throws(()=>cleanReferences("@article{bad, title={A}","bib",false),/not closed/);
});
