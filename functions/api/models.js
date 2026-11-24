export async function onRequestGet({env}) {
  if (!env.OPENROUTER_API_KEY) return Response.json({error:"OPENROUTER_API_KEY is not configured",models:[]},{status:503});
  try {
    const upstream=await fetch("https://openrouter.ai/api/v1/models",{headers:{Authorization:"Bearer "+env.OPENROUTER_API_KEY}});
    if(!upstream.ok) return Response.json({error:"Model provider returned "+upstream.status},{status:upstream.status});
    const body=await upstream.json();
    const blockedModel=/inclusion\s*ai|inclusionai|ling[-\s._]*3[.]?2[-\s._]*flash/i;
    const models=(body.data||[])
      .filter(m=>(m.id?.endsWith(":free") || (Number(m.pricing?.prompt)===0 && Number(m.pricing?.completion)===0)))
      .filter(m=>!blockedModel.test(String(m.id||"")+" "+String(m.name||"")))
      .map(m=>({id:m.id,name:m.name||m.id}))
      .slice(0,100);
    return Response.json({models},{headers:{"Cache-Control":"public, max-age=300"}});
  } catch { return Response.json({error:"Unable to load model directory"},{status:502}); }
}