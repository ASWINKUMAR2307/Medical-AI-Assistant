import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    console.log('Content-Type:', contentType)
    const body = await request.text()
    console.log('Raw body:', body)
    const { message, history } = JSON.parse(body)

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are MEDIASSIST AI, a clinical decision support assistant for healthcare professionals. 
    
Guidelines:
- Provide evidence-based, accurate medical information
- Always include appropriate disclaimers
- Never provide definitive diagnoses - only suggestions for consideration
- Reference current clinical guidelines when applicable
- Encourage consultation with specialists when appropriate
- Maintain professional, clinical tone
- Be concise but thorough
- Do not prescribe medications or dosages
- Highlight red flags and urgent considerations

Current conversation context:
${history?.slice(-6).map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'Clinician' : 'Assistant'}: ${msg.content}`).join('\n') || 'New conversation'}

Clinician: ${message}

Assistant:`

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: message }] },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate response', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}