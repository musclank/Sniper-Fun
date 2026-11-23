export async function onRequestPost({request,env}) {
  if (!env.OPENROUTER_API_KEY) return Response.json({error:"Server is missing OPENROUTER_API_KEY."},{status:503});
  try {
    const body=await request.json();
    const message=String(body.message||"").trim();
    if(!message) return Response.json({error:"Message is required."},{status:400});
    if(message.length>12000) return Response.json({error:"Message is too long (12,000 character limit)."}, {status:413});
    const requested=String(body.model||"");
    const model=requested==="openrouter/free" ? requested : requested;
    const upstream=await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{"Authorization":"Bearer "+env.OPENROUTER_API_KEY,"Content-Type":"application/json","HTTP-Referer":env.SITE_URL||"https://sniper-vvv.pages.dev","X-Title":"Sniper-$VVV"},
      body:JSON.stringify({model,messages:[{role:"system",content:String(body.system||"You are Sniper-$VVV, a helpful AI assistant.").slice(0,3000)},{role:"user",content:message}],temperature:0.7})
    });
    const data=await upstream.json();
    if(!upstream.ok) return Response.json({error:data.error?.message||"AI provider request failed."},{status:upstream.status});
    return Response.json({reply:data.choices?.[0]?.message?.content||"",model:data.model||model});
  } catch { return Response.json({error:"Invalid request or upstream service unavailable."},{status:502}); }
}