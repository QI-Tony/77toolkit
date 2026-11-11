import { simulateColor, figureResolution, randomizeSamples, inspectCsv, cleanReferences } from "./research-data.mjs";

const lines = (value) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const field = (label, id, attrs = "") => `<label class="field"><span>${label}</span><input id="${id}" ${attrs}></label>`;
const area = (label, id, attrs = "") => `<label class="field"><span>${label}</span><textarea id="${id}" ${attrs}></textarea></label>`;
const select = (label,id,options) => `<label class="field"><span>${label}</span><select id="${id}">${options.map(([value,text]) => `<option value="${value}">${text}</option>`).join("")}</select></label>`;
const button = (id,label) => `<button type="button" class="button" id="${id}">${label}</button>`;

export function renderResearch(slug, { root, setStatus, copyText, downloadBlob, parseCsv }) {
  const get = (id) => root.querySelector("#" + id);
  const val = (id) => get(id).value;
  const mount = (title, intro, html) => {
    root.innerHTML = `<section class="tool-panel"><div class="panel-heading"><div><h2>${title}</h2><p>${intro}</p></div></div>${html}<p id="tool-status" class="status-message" role="status"></p></section>`;
  };
  const on = (id, event, action, reset) => get(id).addEventListener(event, async () => {
    try { await action(); } catch (error) { reset?.(); setStatus(error.message,"error"); }
  });
  const output = area("Result","research-output","readonly");
  const save = (text, name) => downloadBlob(new Blob([text], {type:"text/plain;charset=utf-8"}),name);

  if (slug === "scientific-palette") {
    const shapes = ["circle","square","triangle","diamond","cross","plus","star","hexagon"];
    const schemes = {
      Categorical: ["#0072b2","#e69f00","#009e73","#cc79a7","#d55e00","#56b4e9","#000000","#f0e442"],
      Sequential: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
      Diverging: ["#2166ac","#4393c3","#92c5de","#d1e5f0","#fddbc7","#f4a582","#d6604d","#b2182b"],
    };
    const alternatives = {
      Categorical: ["#152e48","#c45719","#50863c","#9d5396","#a77d00","#5697a9","#8a3032","#707070"],
      Sequential: ["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#990000"],
      Diverging: ["#762a83","#9970ab","#c2a5cf","#e7d4e8","#d9f0d3","#a6dba0","#5aae61","#1b7837"],
    };
    const rgb = (hex) => hex.slice(1).match(/../g).map((value) => parseInt(value,16));
    const distance = (a,b) => Math.hypot(...rgb(a).map((value,k)=>value-rgb(b)[k]));
    const modes = ["Protanopia","Deuteranopia","Tritanopia"];
    mount("Build a figure palette","Choose a scheme or paste HEX values. Simulation approximates color vision. Confirm physical print with a proof.",
      `<div class="control-grid">${select("Data type","scheme",Object.keys(schemes).map(x=>[x,x]))}${field("Number of colors","count",'type="number" min="2" max="8" value="4"')}${select("Preview","view",["Original","Protanopia","Deuteranopia","Tritanopia","Grayscale"].map(x=>[x,x]))}${select("Chart","chart",[["line","Line"],["scatter","Scatter"],["heat","Heatmap"]])}</div>
       <div class="toolbar">
       ${select("Preset filter","filter",[["all","All presets"],["cvd","Color vision screening"],["print","White paper screening"],["gray","Grayscale screening"]])}
       ${select("Matching preset","preset",[])}
       <label><input id="lock" type="checkbox"> Keep the first group color</label>
       </div>
       ${area("HEX colors, separated by spaces or commas","colors",'spellcheck="false" rows="2"')}
       ${field("Group labels, separated by commas (optional)","labels")}
       <div class="toolbar"><label><input id="markers" type="checkbox" checked> Use distinct markers and line styles</label><label><input id="print" type="checkbox"> Print preview (white background)</label>${button("apply","Update preview")}</div>
       <canvas id="figure" class="research-canvas" width="800" height="320" role="img" aria-label="Sample chart with selected palette"></canvas><p id="palette-review"></p>
       <div class="toolbar">${select("Export","export",[["hex","HEX"],["python","Python / Matplotlib"],["r","R / ggplot2"]])}${button("copy","Copy palette")}</div>${output}`);
    const preset = () => {
      const count = Number(val("count"));
      if (!Number.isInteger(count) || count < 2 || count > 8) throw new Error("Choose 2–8 colors.");
      const type = val("scheme");
      const fixed = val("colors").trim().split(/[\s,]+/)[0];
      const candidates = [["Standard", schemes[type]],["Alternate", alternatives[type]]].map(([label, source]) => {
        const colors = Array.from({length:count}, (_,i) => source[type==="Categorical" ? i : Math.round(i*7/(count-1))]);
        if (get("lock").checked && /^#[\da-f]{6}$/i.test(fixed)) colors[0] = fixed;
        return [label, colors];
      }).filter(([,colors]) => {
        const filter = val("filter");
        if (filter === "all") return true;
        if (filter === "print") return colors.every((color) => distance(simulateColor(color,"Grayscale"),"#ffffff") >= 55);
        const views = filter === "gray" ? ["Grayscale"] : modes;
        return views.every(mode => {
          const view = colors.map(color => simulateColor(color,mode));
          return view.every((a,i)=>view.slice(i+1).every(b=>distance(a,b)>=55));
        });
      });
      const previous = val("preset");
      get("preset").replaceChildren(...candidates.map(([name]) => new Option(name,name)));
      if (!candidates.length) {
        get("preset").add(new Option("No matching preset",""));
        throw new Error("No preset passes this preview screen. Try fewer colors, another filter, or distinct markers.");
      }
      const selected = candidates.find(([name])=>name===previous) || candidates[0];
      get("preset").value = selected[0];
      get("colors").value = selected[1].join(" ");
    };
    const run = () => {
      get("research-output").value = "";
      get("palette-review").textContent = "";
      const canvas = get("figure"), ctx = canvas.getContext("2d");
      ctx.clearRect(0,0,800,320);
      const colors = val("colors").trim().split(/[\s,]+/);
      if (colors.length < 2 || colors.length > 8) throw new Error("Provide 2–8 six-digit HEX colors.");
      const mode = val("view");
      const rendered = colors.map((c) => simulateColor(c, mode));
      const labels = colors.map((_,i) => val("labels").split(",")[i]?.trim() || `Group ${i+1}`);
      if (new Set(labels).size !== labels.length) throw new Error("Group labels must be unique.");
      const marked = get("markers").checked;
      const dashes = [[],[8,4],[2,4],[9,3,2,3],[12,4],[4,3],[14,3,3,3],[6,2,2,2]];
      ctx.fillStyle = get("print").checked ? "#fff" : "#f5f8fa";
      ctx.fillRect(0,0,800,320);
      ctx.strokeStyle = "#465564"; ctx.strokeRect(35,20,545,265);
      rendered.forEach((color,i) => {
        ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = get("print").checked ? 2 : 3;
        if (val("chart") === "heat") {
          for (let j=0;j<6;j++) {
            ctx.fillStyle = rendered[(i+j)%colors.length];
            ctx.fillRect(36+j*90,21+i*(264/colors.length),89,264/colors.length-1);
          }
        } else {
          const points = Array.from({length:8},(_,j) => [60+j*70, 244-i*19-j*6+Math.sin(i+j)*22]);
          if (val("chart") === "line") {
            ctx.setLineDash(marked ? dashes[i] : []); ctx.beginPath();
            points.forEach(([x,y],j) => j ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
            ctx.stroke(); ctx.setLineDash([]);
          }
          points.forEach(([x,y]) => {
            const sides = [20,4,3,4,5,6,7,8][marked ? i : 0];
            ctx.beginPath();
            for (let k=0;k<sides;k++) {
              const angle = k * 2 * Math.PI / sides + (i===1 && marked ? Math.PI/4 : -Math.PI/2);
              ctx.lineTo(x+5*Math.cos(angle),y+5*Math.sin(angle));
            }
            ctx.closePath(); ctx.fill();
          });
        }
        ctx.fillStyle = color; ctx.fillRect(605,30+i*33,20,13);
        ctx.font = "15px system-ui"; ctx.fillStyle = "#17212b"; ctx.fillText(labels[i],635,42+i*33,145);
      });
      const close = [];
      rendered.forEach((a,i)=>rendered.slice(i+1).forEach((b,j)=>{
        const other = i+j+1;
        if (distance(a,b) < 55) close.push(`${labels[i]} / ${labels[other]}`);
      }));
      get("palette-review").textContent = close.length
        ? `Similar in this preview: ${close.join("; ")}. Try distinct markers, dashes, or direct labels.`
        : "No near matches flagged by the preview heuristic. Review the final figure at its intended size.";
      const map = (items) => Object.fromEntries(labels.map((label,i)=>[label,items[i]]));
      const py = JSON.stringify(map(colors),null,2);
      const r = (items) => `c(${labels.map((label,i)=>`${JSON.stringify(label)} = ${JSON.stringify(items[i])}`).join(", ")})`;
      const markers = ["o","s","^","D","P","X","*","h"];
      const dashNames = ["solid","dashed","dotted","dashdot"];
      const pyDashes = labels.map((label,i)=>`${JSON.stringify(label)}: ${dashes[i].length ? `(0, (${dashes[i].join(", ")}))` : '"solid"'}`);
      get("research-output").value = val("export")==="python"
        ? `colors = ${py}\nmarkers = ${JSON.stringify(map(marked ? markers : colors.map(()=>"o")))}\nlinestyles = {${pyDashes.map((entry,i)=>marked ? entry : `${JSON.stringify(labels[i])}: "solid"`).join(", ")}}\n# Pass color=colors[group], marker=markers[group], linestyle=linestyles[group] to ax.plot().`
        : val("export")==="r" ? `colors <- ${r(colors)}\nshapes <- ${r(marked ? [16,15,17,18,3,4,8,7] : colors.map(()=>16))}\nlinetypes <- ${r(colors.map((_,i)=>marked ? [...dashNames,"longdash","twodash","1343","73"][i] : "solid"))}\n# Use scale_color_manual(values = colors), scale_shape_manual(values = shapes), and scale_linetype_manual(values = linetypes).`
        : labels.map((label,i)=>`${label}: ${colors[i]}${marked ? " · "+shapes[i] : ""}`).join("\n");
      setStatus(`${colors.length} colors · ${mode} preview. Exports use original colors.`,"success");
    };
    for (const id of ["scheme","count","filter","preset","lock"]) on(id,"change",()=>{preset();run();});
    for (const id of ["view","chart","markers","print","export","colors","labels"]) on(id,"change",run);
    on("apply","click",run);
    on("copy","click",()=>{ if (val("research-output")) return copyText(val("research-output")); });
    preset(); run(); return;
  }

  if (slug === "figure-dpi") {
    mount("Check effective print resolution","Use a raster image or enter its dimensions manually. Effective DPI depends on the placed size.",
      `${field("Optional image","file",'type="file" accept="image/*"')}<div class="control-grid">${field("Image width (px)","pixels",'type="number" min="1" value="1800"')}${field("Placed width","width",'type="number" min="0.01" step="any" value="150"')}${select("Unit","unit",[["mm","mm"],["in","inches"]])}${field("Target DPI","dpi",'type="number" min="1" value="300"')}</div>${button("run","Check resolution")}${output}`);
    const run = () => {
      get("research-output").value = "";
      const result = figureResolution(Number(val("pixels")),Number(val("width")),val("unit"),Number(val("dpi")));
      get("research-output").value = `Effective DPI: ${result.effective.toFixed(2)}\nRequired width: ${result.required} px\n${result.effective >= Number(val("dpi")) ? "Meets the specified resolution target." : "Below target. Re-export from the original at a larger pixel width or reduce placed width."}`;
    };
    let revision = 0;
    on("file","change",async()=>{
      const current = ++revision, file = get("file").files[0];
      if (!file) return;
      const bitmap = await createImageBitmap(file);
      try { if (current === revision) { get("pixels").value = bitmap.width; run(); } }
      finally { bitmap.close(); }
    });
    on("run","click",run);
    for (const id of ["pixels","width","unit","dpi"]) on(id,"change",run);
    run(); return;
  }

  if (slug === "figure-panels") {
    mount("Assemble a multi-panel figure","Select up to 12 raster images in panel order. Each panel is fitted without cropping.",
      `${field("Panel images","files",'type="file" multiple accept="image/png,image/jpeg,image/webp"')}<div class="control-grid">${field("Columns","columns",'type="number" min="1" max="6" value="2"')}${field("Panel width (px)","width",'type="number" min="160" max="1600" value="600"')}${field("Gap (px)","gap",'type="number" min="0" max="100" value="20"')}</div>
      ${field("Panel labels, comma separated (optional)","labels")}
      <div class="toolbar">${button("run","Compose figure")}${button("save","Download PNG")}</div><canvas id="figure" class="research-canvas" hidden aria-label="Composed figure preview"></canvas>`);
    const canvas = get("figure");
    let revision = 0;
    const invalidate = () => { revision++; canvas.hidden = true; get("save").disabled = true; };
    invalidate();
    for (const id of ["files","columns","width","gap","labels"]) on(id,"input",invalidate);
    on("run","click",async()=>{
      invalidate(); const current = revision;
      const files = [...get("files").files];
      const cols = Number(val("columns")), width = Number(val("width")), gap = Number(val("gap"));
      if (!files.length || files.length > 12 || files.some(f=>f.size>30_000_000 || !/^image\/(png|jpeg|webp)$/.test(f.type))) throw new Error("Select 1–12 PNG, JPEG, or WebP files, up to 30 MB each.");
      if (![cols,width,gap].every(Number.isInteger) || cols<1 || cols>6 || width<160 || width>1600 || gap<0 || gap>100) throw new Error("Enter valid integer layout dimensions.");
      const columns = Math.min(cols,files.length), height = Math.round(width*.75), rows = Math.ceil(files.length/columns);
      const w = columns*width+(columns+1)*gap, h = rows*height+(rows+1)*gap;
      if (w*h>16_000_000 || Math.max(w,h)>8192) throw new Error("Reduce the panel width to keep the output within 16 megapixels and 8192 px per side.");
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
      const labels=val("labels").split(",");
      for (const [i,file] of files.entries()) {
        const bitmap=await createImageBitmap(file);
        try {
          if (current!==revision) return;
          const x=gap+(i%columns)*(width+gap), y=gap+Math.floor(i/columns)*(height+gap);
          const labelSize=Math.max(18,Math.round(width*.045)), band=labelSize+12;
          const ratio=Math.min(1,width/bitmap.width,(height-band)/bitmap.height);
          const iw=bitmap.width*ratio, ih=bitmap.height*ratio;
          ctx.drawImage(bitmap,x+(width-iw)/2,y+band+(height-band-ih)/2,iw,ih);
          ctx.font=`bold ${labelSize}px system-ui`;ctx.fillStyle="#111";
          ctx.fillText(labels[i]?.trim()||String.fromCharCode(65+i),x+4,y+labelSize,width-8);
        } finally {bitmap.close();}
      }
      canvas.hidden=false;get("save").disabled=false;setStatus(`Figure ready · ${w} × ${h} px.`,"success");
    },invalidate);
    on("save","click",()=>{
      const current=revision;
      canvas.toBlob((blob)=>{if (blob && current===revision) downloadBlob(blob,"research-panels.png");},"image/png");
    });
    return;
  }

  if (slug === "research-csv") {
    mount("Inspect a research table","Record numbers include the header. Blank cells, NA, N/A and NULL are flagged as missing.",
      `${area("CSV data","input",'spellcheck="false" maxlength="1000000"')}<div class="control-grid">${select("Delimiter","delimiter",[[",","Comma"],[";","Semicolon"],["tab","Tab"]])}${field("ID column (optional)","id")}${field("Group column (optional)","group")}${field("Numeric columns (comma-separated)","numeric")}</div>
      <div class="toolbar">${button("example","Load example")}${button("run","Check table")}${button("save","Download report")}</div>${output}`);
    const run = () => {
      get("research-output").value="";
      const rows=parseCsv(val("input").replace(/^\uFEFF/,""),val("delimiter")==="tab"?"\t":val("delimiter"));
      const report=inspectCsv(rows,{id:val("id").trim(),group:val("group").trim(),numeric:val("numeric").split(",").map(s=>s.trim()).filter(Boolean)});
      const counts=[...report.counts].map(([name,n])=>`${name}: ${n}`);
      const uneven=new Set(report.counts.values()).size>1;
      get("research-output").value=[`${report.records} data records; ${report.issues.length} flags.`,...(counts.length?["",`Group counts${uneven?" (unequal counts)":""}:`,...counts]:[]),"",...report.issues].join("\n");
    };
    on("example","click",()=>{get("input").value="id,group,value\nS01,Control,2.4\nS02,Treatment,NA\nS01,Control,unknown";get("id").value="id";get("group").value="group";get("numeric").value="value";run();});
    on("run","click",run);
    on("save","click",()=>{if (val("research-output")) save(val("research-output"),"research-csv-report.txt");});
    return;
  }

  if (slug === "sample-randomizer") {
    mount("Randomly assign samples","The same ordered inputs and seed reproduce the allocation. This tool assigns groups without stratification.",
      `${area("Sample IDs, one per line","ids",'maxlength="300000" placeholder="S01&#10;S02&#10;S03&#10;S04"')}${area("Groups, one Name: count per line","groups",'placeholder="Control: 2&#10;Treatment: 2" maxlength="10000"')}${field("Seed","seed",'value="experiment-1" maxlength="200"')}
      <div class="toolbar">${button("seed-new","Generate seed")}${button("run","Randomize")}${button("save","Download CSV")}</div>${output}`);
    let csv="";
    on("seed-new","click",()=>{get("seed").value=crypto.randomUUID();csv="";get("research-output").value="";});
    for (const id of ["seed","ids","groups"]) on(id,"input",()=>{csv="";get("research-output").value="";});
    on("run","click",()=>{
      csv="";get("research-output").value="";
      const groups=lines(val("groups")).map(line=>{
        const match=/^(.*):\s*(\d+)$/.exec(line);
        if (!match) throw new Error("Each group must use Name: count.");
        return [match[1].trim(),Number(match[2])];
      });
      const seed=val("seed");
      const assignment=randomizeSamples(lines(val("ids")),groups,seed);
      const cell=(value)=>`"${(/^[\s]*[=+\-@]/.test(value) ? "'"+value : value).replaceAll('"','""')}"`;
      csv=["sample_id,group,seed,algorithm",...assignment.map(row=>[...row,seed,"mulberry32-fisher-yates-v1"].map(cell).join(","))].join("\r\n");
      get("research-output").value=csv;
      setStatus(`Assigned ${assignment.length} samples. Spreadsheet formula-like values are prefixed with an apostrophe in the CSV.`,"success");
    });
    on("save","click",()=>{if (csv) save(csv,"sample-assignments.csv");});
    return;
  }

  mount("Check and clean references","Review duplicate DOIs, citation-key conflicts and missing years. Optional deduplication keeps the first occurrence.",
    `${select("Format","format",[["bib","BibTeX"],["ris","RIS"]])}${area("Bibliography","input",'spellcheck="false" maxlength="500000"')}
    <label><input type="checkbox" id="deduplicate"> Remove later entries with the same DOI</label>
    <div class="toolbar">${button("run","Review references")}${button("save","Download result")}</div>${area("Findings","findings","readonly")}${output}`);
  let format = "bib";
  on("run","click",()=>{
    get("research-output").value="";get("findings").value="";
    format=val("format");
    const result=cleanReferences(val("input"),format,get("deduplicate").checked);
    get("findings").value=[`${result.issues.length} flags; ${result.removed} entries removed.`,...result.issues].join("\n");
    get("research-output").value=result.text;
  });
  on("save","click",()=>{if (val("research-output")) save(val("research-output"),`references.${format}`);});
}
