export async function onRequestPost({request,env}) {
  if (!env.OPENROUTER_API_KEY) return Response.json({error:"Server is missing OPENROUTER_API_KEY."},{status:503});
  try {
    const body=await request.json();
    const message=String(body.message||"").trim();
    if(!message) return Response.json({error:"Message is required."},{status:400});
    if(message.length>12000) return Response.json({error:"Message is too long (12,000 character limit)."},{status:413});
    const model=String(body.model||"");
    if(!model) return Response.json({error:"No model selected."},{status:400});

    // Keep Cloudflare fallback behavior aligned with the Vercel API.
    const suppliedHistory=Array.isArray(body.history)?body.history:[];
    let remainingChars=24000;
    const history=suppliedHistory.slice(-12).reverse().flatMap(item=>{
      if(!item||!["user","assistant"].includes(item.role)||typeof item.content!=="string") return [];
      const content=item.content.trim().slice(0,6000);
      if(!content||remainingChars<=0) return [];
      const bounded=content.slice(0,remainingChars);
      remainingChars-=bounded.length;
      return bounded?[{role:item.role,content:bounded}]:[];
    }).reverse();

    const upstream=await fetch("https://openrouter.ai/api/v1/chat/completions",{
      method:"POST",
      headers:{"Authorization":"Bearer "+env.OPENROUTER_API_KEY,"Content-Type":"application/json","HTTP-Referer":env.SITE_URL||"https://sniper-vvv.pages.dev","X-Title":"Sniper-$VVV"},
      body:JSON.stringify({
        model,
        messages:[
          {role:"system",content:String(body.system||"You are Sniper-$VVV, a helpful AI assistant.").slice(0,3000)},
          ...history,
          {role:"user",content:message}
        ],
        temperature:0.7
      })
    });
    const data=await upstream.json();
    if(!upstream.ok) return Response.json({error:data.error?.message||"AI provider request failed."},{status:upstream.status});
    return Response.json({reply:data.choices?.[0]?.message?.content||"",model:data.model||model});
  } catch { return Response.json({error:"Invalid request or upstream service unavailable."},{status:502}); }
}
