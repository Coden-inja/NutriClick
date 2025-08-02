import { serve } from "https://deno.land/std@0.204.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image');

    if (!image) {
      throw new Error('Image is required')
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);

    // Make request to ImgBB API
    const imgbbApiKey = Deno.env.get('IMGBB_API_KEY')
    
    if (!imgbbApiKey) {
      throw new Error('IMGBB_API_KEY not configured')
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    })

    const data = await response.json()

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})
