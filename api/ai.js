export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const key=process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({error:"Naël AI n’est pas encore configuré sur le serveur."});
  try{
    const body=req.body||{};
    const lang=body.language||"fr";
    const ctx=body.context||{};
    const child=ctx.child?JSON.stringify(ctx.child):"Aucun profil enfant";
    const recent={
      events:Array.isArray(ctx.events)?ctx.events.slice(-20):[],
      growth:Array.isArray(ctx.growth)?ctx.growth.slice(-8):[],
      appointments:Array.isArray(ctx.appointments)?ctx.appointments.slice(-8):[],
      vaccines:Array.isArray(ctx.vaccines)?ctx.vaccines.slice(-8):[],
      reminders:Array.isArray(ctx.reminders)?ctx.reminders.slice(-8):[]
    };
    const system="Tu es Naël AI, assistant parental bienveillant et pratique. Réponds dans la langue demandée ("+lang+"). Utilise seulement les données utilisateur fournies comme contexte personnel. N’invente pas de données médicales personnelles. Pour les symptômes urgents ou situations potentiellement graves, conseille de contacter rapidement un professionnel de santé ou les urgences locales. Ne remplace jamais un diagnostic médical.";
    const input=system+"\n\nProfil enfant: "+child+"\nSuivi récent: "+JSON.stringify(recent)+"\n\nQuestion: "+String(body.message||"");
    const r=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},
      body:JSON.stringify({model:"gpt-5.6-luna",input,max_output_tokens:700})
    });
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||"Erreur Naël AI"});
    let answer=data.output_text;
    if(!answer && Array.isArray(data.output)){
      answer=data.output.flatMap(x=>Array.isArray(x.content)?x.content:[]).map(x=>x.text||x.output_text||"").filter(Boolean).join("\n");
    }
    return res.status(200).json({answer:answer||"Je n’ai pas pu générer de réponse."});
  }catch(e){
    return res.status(500).json({error:"Naël AI est momentanément indisponible."});
  }
}