import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: 'Service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const resend = new Resend(apiKey);

  try {
    const data = await request.formData();
    const name     = (data.get('name')     ?? '').toString().trim();
    const company  = (data.get('company')  ?? '').toString().trim();
    const email    = (data.get('email')    ?? '').toString().trim();
    const platform = (data.get('platform') ?? '').toString().trim();
    const workflow = (data.get('workflow') ?? '').toString().trim();

    if (!name || !email || !workflow) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await resend.emails.send({
      from: 'prototypes.design <noreply@prototypes.design>',
      to: 'prototypenow@prototypes.design',
      replyTo: email,
      subject: `New enquiry from ${name}${company ? ` at ${company}` : ''}`,
      text: [
        `Name: ${name}`,
        `Company: ${company || '—'}`,
        `Email: ${email}`,
        `Platform: ${platform || '—'}`,
        '',
        'Workflow:',
        workflow
      ].join('\n')
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Send failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
