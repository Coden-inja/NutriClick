import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      throw new Error('Image URL is required')
    }

    console.log('Analyzing image:', imageUrl)

    // Make request to Groq API with environment variable
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured')
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and return nutritional information in this exact JSON format: {items:[{item_name:string, total_calories:number, total_protien:number, toal_carbs:number, toal_fats:number},...]}. Be accurate with the nutritional values based on typical serving sizes.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        model: 'llama-3.2-90b-vision-preview',
        temperature: 0.1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: {
          type: 'json_object',
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Groq API error:', errorData)
      throw new Error(`Groq API failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const parsedResult = JSON.parse(content)

    console.log('Analysis successful:', parsedResult)

    return new Response(
      JSON.stringify(parsedResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in analyze-food function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Food analysis failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})