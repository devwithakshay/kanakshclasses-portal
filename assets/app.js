const CFG=window.KC_CONFIG||{},API=(CFG.API_URL||"").trim(),LOGO=new URL("assets/logo.jpg",location.href).href,KEY="kc_students_v2",YR=new Date().getFullYear();
const brandLogo=()=>(CFG.LOGO_URL||"").trim()||LOGO,IG=(CFG.INSTAGRAM||"https://www.instagram.com/kanakshclasses").trim(),REVIEW=(CFG.GOOGLE_REVIEW||"https://g.page/r/CUa3eeMUZIwwEAE/review").trim();
const SUBJ=["Maths","Science","English","Hindi","Social Science","EVS","Computer"];
const FSTAT=["Paid","Partial","Pending","Overdue","New"];
const N=["Aarav Sharma","Diya Verma","Kabir Singh","Anaya Gupta","Vihaan Mehta","Isha Patel","Reyansh Jain","Myra Kapoor","Arjun Nair","Saanvi Rao","Advait Joshi","Kiara Malhotra"];
const base0=N.map((n,i)=>{const fee=i%3?1500:2000,paid=i%3===0?fee:i%3===1?Math.round(fee*.4):0,due=Math.max(0,fee-paid);const st=paid>=fee?"Paid":paid?"Partial":i%5===0?"Overdue":"Pending";
return{id:`KC-${YR}-${String(i+1).padStart(4,"0")}`,name:n,cls:String(i%8+1),board:i%3?"CBSE":"ICSE",guardian:n.split(" ")[1]+" (Parent)",rel:"Parent",mobile:String(9870000000+i*12345).slice(0,10),alt:"",fee,paid,due,status:st,att:78+(i*7)%22,subs:["Maths","Science"],seed:1}});
const base=API?[]:base0;
let added=[];if(!API){try{added=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){}}
const all=()=>[...added,...base],inr=v=>"₹"+Number(v||0).toLocaleString("en-IN"),$=id=>document.getElementById(id);
const pill=f=>`<span class="pill ${f}">${f}</span>`,ini=n=>n.split(" ").map(x=>x[0]).slice(0,2).join("");
const monthLbl=()=>new Date().toLocaleString("en-IN",{month:"long",year:"numeric"});
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
function norm(s){s.fee=Number(s.fee)||0;s.paid=Number(s.paid)||0;s.due=Number(s.due);if(isNaN(s.due))s.due=Math.max(0,s.fee-s.paid);s.att=Number(s.att)||100;return s}
function findRef(id){let i=added.findIndex(x=>x.id===id);if(i>=0)return{arr:added,i};i=base.findIndex(x=>x.id===id);return i>=0?{arr:base,i}:null}
function persist(s){const r=findRef(s.id);if(!r)return Promise.reject(new Error("Student not found"));if(r.arr===base&&!API){toast("Sample students are read-only – use real admissions to save fees");return Promise.resolve()}r.arr[r.i]=norm({...r.arr[r.i],...s});if(!API){try{localStorage.setItem(KEY,JSON.stringify(added))}catch(e){}}return API?api("updateFee",{id:s.id,fee:s.fee,due:s.due,paid:s.paid,status:s.status}):Promise.resolve()}
function nextId(){return `KC-${YR}-${String(base.length+added.length+1).padStart(4,"0")}`}
function init(){$("sid").value=nextId();$("subs").innerHTML=SUBJ.map(s=>`<label><input type="checkbox" value="${s}">${s}</label>`).join("");document.querySelector('[name=adm]').valueAsDate=new Date();document.querySelectorAll(".err").forEach(e=>e.textContent="")}
function feeSummary(){const D=all().map(norm),due=D.reduce((a,s)=>a+(s.due||0),0),col=D.reduce((a,s)=>a+(s.paid||0),0),od=D.filter(s=>s.status==="Overdue"||(s.due>0&&s.status!=="Paid")).length;
return{due,col,od,pending:D.filter(s=>s.due>0).length}}
function render(){const D=all().map(norm),S=feeSummary();
$("stats").innerHTML=[["Total students",D.length,"👨‍🎓","#26354A"],["New admissions",added.length,"✨","#F09D59"],["Total due",inr(S.due),"⏳","#AA261B"],["Collected (listed)",inr(S.col),"📈","#1f9d57"]].map(([l,v,i,c])=>`<div class="card stat"><div class="ic" style="background:${c}">${i}</div><div><span>${l}</span><b>${v}</b></div></div>`).join("");
$("rec").innerHTML="<tr><th>Student</th><th>Class</th><th>ID</th></tr>"+D.slice(0,6).map(s=>row3(s)).join("");
stu();fees();chartUp(S)}
const row3=s=>`<tr class="cl" onclick="show('${s.id}')"><td><span class="av">${ini(s.name)}</span>${s.name}</td><td>${s.cls}</td><td>${s.id}</td></tr>`;
function stu(){const q=$("q").value.toLowerCase(),b=$("b").value;
$("st").innerHTML="<tr><th>Student</th><th>ID</th><th>Class</th><th>Board</th><th>Guardian</th><th>Mobile</th><th>Fee status</th></tr>"+all().map(norm).filter(s=>(s.name+s.id+s.mobile).toLowerCase().includes(q)&&(!b||s.board==b)).map(s=>`<tr class="cl" onclick="show('${s.id}')"><td><span class="av">${ini(s.name)}</span>${s.name}</td><td>${s.id}</td><td>${s.cls}</td><td>${s.board}</td><td>${s.guardian}</td><td>${s.mobile}</td><td>${s.isNew?'<span class="pill New">New admission</span>':pill(s.status)}</td></tr>`).join("")}
$("q").oninput=stu;$("b").onchange=stu;
function fees(){const q=($("fq")&&$("fq").value||"").toLowerCase(),st=$("fs")&&$("fs").value,S=feeSummary();
if($("feeStats"))$("feeStats").innerHTML=[["Total due",inr(S.due),"⏳","#AA261B"],["Paid (on record)",inr(S.col),"✓","#1f9d57"],["Students with balance",S.pending,"👨‍🎓","#26354A"]].map(([l,v,i,c])=>`<div class="card stat"><div class="ic" style="background:${c}">${i}</div><div><span>${l}</span><b>${v}</b></div></div>`).join("");
const rows=all().map(norm).filter(s=>(s.name+s.id+s.mobile).toLowerCase().includes(q)&&(!st||s.status===st)).sort((a,b)=>(b.due||0)-(a.due||0));
$("fe").innerHTML="<tr><th>Student</th><th>Class</th><th>Monthly fee</th><th>Paid</th><th>Due</th><th>Status</th><th>Mobile</th><th></th></tr>"+rows.map(s=>`<tr><td><span class="av">${ini(s.name)}</span>${s.name}</td><td>${s.cls} · ${s.board}</td><td>${inr(s.fee)}</td><td>${inr(s.paid)}</td><td><b>${inr(s.due)}</b></td><td>${pill(s.status)}</td><td>${s.mobile}</td><td><button class="btn o" type="button" onclick="event.stopPropagation();openFee('${s.id}')">Manage</button> <button class="btn g" type="button" onclick="event.stopPropagation();waFee('${s.id}')" title="WhatsApp reminder">WhatsApp</button></td></tr>`).join("")}
function go(v){document.querySelectorAll("aside a").forEach(x=>x.classList.toggle("on",x.dataset.v==v&&(v!="soon")));["dash","add","stu","fee","soon"].forEach(i=>$(i).hidden=i!=v);scrollTo(0,0);if(v==="fee")fees()}
document.querySelectorAll("aside a").forEach(a=>a.onclick=()=>{go(a.dataset.v);if(a.dataset.v=="soon")a.classList.add("on")});
function feeReminderMsg(s){const m=monthLbl();return `*Kanaksh Classes – Fee Reminder*\n\nDear ${s.guardian||"Parent"},\n\nStudent: *${s.name}* (${s.id})\nClass: ${s.cls} (${s.board})\nMonth: ${m}\n\nMonthly fee: ${inr(s.fee)}\nPaid so far: ${inr(s.paid)}\n*Amount due: ${inr(s.due)}*\nStatus: ${s.status}\n\nPlease pay at the earliest to avoid interruption in classes.\nFor queries, reply on this chat.\n\nBright Minds, Brighter Futures!\n@kanakshclasses`}
function waPhone(s){const p=String(s.mobile||"").replace(/\D/g,"");return p.length===10?"91"+p:""}
function waFee(id){const s=all().map(norm).find(x=>x.id===id);if(!s)return;const ph=waPhone(s);if(ph.length<12){toast("Invalid mobile number");return}window.open(`https://wa.me/${ph}?text=${encodeURIComponent(feeReminderMsg(s))}`,"_blank")}
function remindAllDue(){const list=all().map(norm).filter(s=>s.due>0);if(!list.length){toast("No pending dues");return}list.forEach((s,i)=>setTimeout(()=>waFee(s.id),i*800));toast(`Opening WhatsApp for ${list.length} parent(s)…`)}
if($("remAll"))$("remAll").onclick=remindAllDue;
function suggestStatus(s){if(s.due<=0)return"Paid";if(s.paid>0&&s.due>0)return"Partial";return s.status==="Overdue"?"Overdue":"Pending"}
function openFee(id){const s=norm({...all().find(x=>x.id===id)});if(!s.id)return;
$("host").innerHTML=`<div class="ov" onclick="if(event.target===this)this.remove()"><div class="modal" style="max-width:520px"><div class="pvh" style="background:linear-gradient(120deg,var(--navy),#1f9d57)"><img src="${LOGO}"><div class="id">Fee management<b>${s.id}</b></div></div>
<div style="padding:20px 22px"><h2 style="margin:0 0 4px">${s.name}</h2><p style="margin:0 0 14px;color:var(--mut);font-size:13px">Class ${s.cls} · ${s.board} · ${monthLbl()}</p>
<div class="fee-grid"><div class="fee-box"><span>Monthly fee</span><b>${inr(s.fee)}</b></div><div class="fee-box paid"><span>Paid amount</span><b id="fvPaid">${inr(s.paid)}</b></div><div class="fee-box due"><span>Due amount</span><b id="fvDue">${inr(s.due)}</b></div></div>
<div class="fee-admin"><label>Status (admin)</label><select id="fSt">${FSTAT.map(x=>`<option${x===s.status?" selected":""}>${x}</option>`).join("")}</select>
<label>Monthly fee (₹)</label><input type="number" id="fFee" min="0" step="1" value="${s.fee||0}">
<label>Due amount (₹) — edit if needed</label><input type="number" id="fDue" min="0" step="1" value="${s.due||0}">
<label>Record payment (₹)</label><input type="number" id="fPay" min="0" step="1" placeholder="Amount received"></div>
<div class="fee-acts"><button class="btn" type="button" id="fRec">Record payment</button><button class="btn g" type="button" id="fWa">Send WhatsApp reminder</button><button class="btn o" type="button" id="fSave">Save status &amp; amounts</button><button class="btn o" style="margin-left:auto" onclick="$('host').innerHTML=''">Close</button></div>
<p style="font-size:12px;color:var(--mut);margin:12px 0 0">Reminders go to parent mobile <b>${s.mobile}</b>${s.alt?` or alternate <b>${s.alt}</b>`:""} via WhatsApp.</p></div></div></div>`;
const syncView=(x)=>{$("fvPaid").textContent=inr(x.paid);$("fvDue").textContent=inr(x.due);$("fDue").value=x.due;$("fSt").value=x.status};
$("fRec").onclick=async()=>{const amt=Number($("fPay").value);if(!amt||amt<=0){toast("Enter payment amount");return}s.paid+=amt;s.due=Math.max(0,s.due-amt);if(s.due<=0){s.due=0;s.status="Paid"}else s.status=suggestStatus(s);$("fPay").value="";try{await persist(s);syncView(s);render();toast("Payment recorded")}catch(e){toast(e.message)}};
$("fSave").onclick=async()=>{s.fee=Number($("fFee").value)||0;s.due=Math.max(0,Number($("fDue").value)||0);s.status=$("fSt").value;try{await persist(s);syncView(s);render();toast("Fee details saved")}catch(e){toast(e.message)}};
$("fWa").onclick=()=>waFee(s.id)}
function card(s){const v=x=>x||"—";return `<div class="pv"><div class="pvh"><img src="${LOGO}"><div class="id">Student ID<b>${s.id}</b></div></div>
<div class="pvb"><div class="full"><span>Admission form</span><b style="font-size:20px">${s.name}</b></div>
<div><span>Class / Board</span><b>Class ${s.cls} · ${s.board}</b></div><div><span>Date of birth</span><b>${v(s.dob)}</b></div><div><span>Gender</span><b>${v(s.gender)}</b></div><div><span>School</span><b>${v(s.school)}</b></div>
<div class="full"><span>Subjects</span><b>${(s.subs||[]).join(", ")||"—"}</b></div>
<div><span>${s.rel||"Guardian"}</span><b>${s.guardian}</b></div><div><span>Mobile</span><b>${s.mobile}</b></div><div><span>Alternate mobile</span><b>${v(s.alt)}</b></div><div><span>Email</span><b>${v(s.email)}</b></div>
<div><span>Monthly fee</span><b>${s.fee?inr(s.fee):"—"}</b></div><div><span>Paid / Due</span><b>${inr(s.paid||0)} / ${inr(s.due||0)}</b></div><div><span>Fee status</span><b>${s.status||"—"}</b></div><div><span>Admission date</span><b>${v(s.adm)}</b></div><div class="full"><span>Address</span><b>${v(s.addr)}</b></div>${s.notes?`<div class="full"><span>Notes</span><b>${s.notes}</b></div>`:""}</div>
<div class="pvf">Kanaksh Classes · Bright Minds, Brighter Futures!<br><a href="${IG}" target="_blank" rel="noopener">Instagram @kanakshclasses</a> · <a href="${REVIEW}" target="_blank" rel="noopener">Google review</a></div></div>`}
function msgPlain(s){const v=k=>s[k]||"—",subs=(s.subs||[]).length?(s.subs||[]).join(", "):"—";return `Kanaksh Classes – Admission Confirmation\n\nDear ${s.guardian||"Parent"},\n\nStudent: ${s.name}\nStudent ID: ${s.id}\n\n— Student details —\nDate of birth: ${v("dob")}\nGender: ${v("gender")}\nSchool: ${v("school")}\nClass / Board: Class ${s.cls} · ${s.board}\nSubjects: ${subs}\nAdmission date: ${v("adm")}\n\n— Parent / guardian —\n${s.rel||"Guardian"}: ${s.guardian}\nMobile: ${s.mobile}${s.alt?"\nAlternate mobile: "+s.alt:""}${s.email?"\nEmail: "+s.email:""}\nAddress: ${v("addr")}\n\n— Fee —\nMonthly fee: ${s.fee?inr(s.fee):"—"}\nPaid: ${inr(s.paid||0)}\nDue: ${inr(s.due||0)}\nStatus: ${s.status||"New"}${s.notes?"\n\nNotes: "+s.notes:""}\n\n— Connect —\nLogo: ${brandLogo()}\nInstagram: ${IG}\nGoogle review: ${REVIEW}\n\nBright Minds, Brighter Futures!\n@kanakshclasses`}
function waMsg(s){const lines=msgPlain(s).split("\n");return "*"+lines[0]+"*\n\n"+lines.slice(2).join("\n").replace(/— Student details —/g,"*Student details*").replace(/— Parent \/ guardian —/g,"*Parent / guardian*").replace(/— Fee —/g,"*Fee*").replace(/— Connect —/g,"*Connect with us*").replace(`Student: ${s.name}`,`Student: *${s.name}*`).replace(`Student ID: ${s.id}`,`Student ID: *${s.id}*`)}
async function sendAdmEmail(id){if(!API){toast("Email requires Google Apps Script backend");return}try{await api("sendAdmissionEmail",{id,logoUrl:brandLogo()});toast("Admission email sent")}catch(e){toast("Email failed: "+e.message)}}
function show(id,fresh,emailNote){const s=norm({...all().find(x=>x.id==id)});if(!s.id)return;
$("host").innerHTML=`<div class="ov" onclick="if(event.target==this)this.remove()"><div class="modal">${fresh?`<div class="ok"><i>✓</i><h2 style="margin:10px 0 2px">Admission saved</h2><p style="color:var(--mut);margin:0 0 12px;font-size:14px">Preview below. Download, WhatsApp, or email the parent.${emailNote?" "+emailNote:""}</p></div>`:""}<div id="pvc">${card(s)}</div>
<div class="acts"><button class="btn n" id="dl">⬇ Download</button><button class="btn g" id="wa">WhatsApp</button>${s.email?'<button class="btn" id="em" type="button">✉ Email</button>':""}<button class="btn" id="feeBtn">₹ Fees</button><button class="btn" id="sh">Share</button><button class="btn o" id="cp">Copy</button><button class="btn o" style="margin-left:auto" onclick="$('host').innerHTML=''">Close</button></div></div></div>`;
$("dl").onclick=async()=>{try{const css=await fetch("assets/style.css").then(r=>r.text()),h=`<!DOCTYPE html><meta charset=utf-8><title>${s.id}</title><meta name=viewport content="width=device-width,initial-scale=1"><style>${css}body{padding:16px}.pv{max-width:620px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e8e4dc}</style><body>${card(s)}</body>`,a=document.createElement("a");a.href=URL.createObjectURL(new Blob([h],{type:"text/html"}));a.download=`Admission-${s.id}.html`;a.click();toast("Downloading…")}catch(e){toast("Download blocked in this preview")}};
$("wa").onclick=()=>{const p=waPhone(s);window.open(`https://wa.me/${p}?text=${encodeURIComponent(waMsg(s))}`,"_blank")};
if(s.email&&$("em"))$("em").onclick=()=>sendAdmEmail(s.id);
$("feeBtn").onclick=()=>{openFee(s.id)};
$("sh").onclick=async()=>{try{await navigator.share({title:"Kanaksh Classes Admission",text:msgPlain(s)})}catch(e){toast("Share not available here – use WhatsApp or Copy")}};
$("cp").onclick=async()=>{try{await navigator.clipboard.writeText(msgPlain(s));toast("Copied")}catch(e){toast("Copy blocked")}}}
$("form").onsubmit=async e=>{e.preventDefault();const f=e.target,g=n=>f.elements[n].value.trim(),bad=(n,t)=>{f.elements[n].parentElement.querySelector(".err").textContent=t;return 1};let n=0;
document.querySelectorAll(".err").forEach(x=>x.textContent="");
["name","dob","gender","cls","board","guardian"].forEach(k=>{if(!g(k))n+=bad(k,"Required")});
if(!/^\d{10}$/.test(g("mobile")))n+=bad("mobile","Enter a 10-digit number");
if(g("alt")&&!/^\d{10}$/.test(g("alt")))n+=bad("alt","Enter a 10-digit number");else if(g("alt")&&g("alt")==g("mobile"))n+=bad("alt","Must differ from mobile");
if(g("email")&&!/^\S+@\S+\.\S+$/.test(g("email")))n+=bad("email","Invalid email");
if(n){toast("Please fix the highlighted fields");return}
const mf=Number(g("fee"))||0;
const s={id:$("sid").value,name:g("name"),dob:g("dob"),gender:g("gender"),school:g("school"),cls:g("cls"),board:g("board"),adm:g("adm"),guardian:g("guardian"),rel:g("rel"),email:g("email"),mobile:g("mobile"),alt:g("alt"),fee:mf,addr:g("addr"),notes:g("notes"),subs:[...document.querySelectorAll("#subs input:checked")].map(x=>x.value),status:"New",paid:0,due:mf,att:100,isNew:1,created:new Date().toISOString()};
const btn=f.querySelector("button[type=submit]");btn.disabled=true;btn.textContent="Saving…";
try{let emailNote="";if(API){const res=await api("add",{student:s,logoUrl:brandLogo()});Object.assign(s,norm(res.student));if(s.email){emailNote=res.emailSent?"Confirmation email sent to "+s.email+".":res.emailError?"Email could not be sent: "+res.emailError:""}}else{try{localStorage.setItem(KEY,JSON.stringify([s,...added]))}catch(x){}if(s.email)emailNote="(Email sends when API is connected.)"}
added.unshift(norm(s));f.reset();init();render();show(s.id,1,emailNote)}catch(err){toast("Could not save: "+err.message)}finally{btn.disabled=false;btn.textContent="Submit admission"}};
async function api(action,p={}){const r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({key:CFG.API_KEY,action,...p})});const j=await r.json();if(!j.ok)throw new Error(j.error||"Server error");return j}
async function load(){try{const r=await fetch(`${API}?action=list&key=${encodeURIComponent(CFG.API_KEY)}`),j=await r.json();if(!j.ok)throw new Error(j.error);
added=j.students.reverse().map(s=>norm({...s,subs:String(s.subs||"").split(", ").filter(Boolean),isNew:s.status=="New"}));$("sid").value=nextId();render()}catch(e){toast("Could not load data: "+e.message)}}
let feeChart;
function chartUp(S){const M=["May","Jun","Jul","Aug","Sep","Oct"],col=S.col||42000,pnd=S.due||15000;
if(!feeChart){feeChart=new Chart($("c1"),{type:"line",data:{labels:M,datasets:[{label:"Collected",data:M.map((_,i)=>col*(.7+i*.05)),borderColor:"#26354A",backgroundColor:"rgba(38,53,74,.1)",fill:true,tension:.4},{label:"Pending",data:M.map((_,i)=>pnd*(1.1-i*.08)),borderColor:"#AA261B",tension:.4},{label:"Target",data:M.map(()=>Math.max(col+pnd,60000)),borderColor:"#F09D59",borderDash:[5,5],pointRadius:0}]},options:{maintainAspectRatio:false}});
}else{feeChart.data.datasets[0].data=M.map((_,i)=>col*(.7+i*.05));feeChart.data.datasets[1].data=M.map((_,i)=>pnd*(1.1-i*.08));feeChart.data.datasets[2].data=M.map(()=>Math.max(col+pnd,60000));feeChart.update()}}
if($("fq")){$("fq").oninput=fees;$("fs").onchange=fees}
init();render();if(API)load();else chartUp(feeSummary());
