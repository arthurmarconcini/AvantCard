import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function buildResetEmailHtml(name: string, resetLink: string): string {
  const firstName = name.split(" ")[0];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:24px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:rgba(57,255,20,0.1);border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;margin-bottom:16px;">
                <span style="font-size:24px;">🔑</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Redefinir Senha
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#a1a1aa;">
                Olá <strong style="color:#ffffff;">${firstName}</strong>,
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#a1a1aa;">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color:#39FF14;">ThinkCard</strong>. Clique no botão abaixo para criar uma nova senha:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 28px;">
                    <a href="${resetLink}" 
                       target="_blank"
                       style="display:inline-block;background-color:#39FF14;color:#09090b;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiration Warning -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
                  ⏳ Este link expira em <strong style="color:#a1a1aa;">1 hora</strong>. Após esse período, será necessário solicitar um novo link.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin:0;font-size:12px;color:#39FF14;word-break:break-all;">
                ${resetLink}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid rgba(255,255,255,0.05);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 8px;font-size:12px;color:#52525b;line-height:1.5;">
                Se você não solicitou esta redefinição, ignore este email — sua senha permanecerá a mesma.
              </p>
              <p style="margin:0;font-size:12px;color:#3f3f46;">
                © ${new Date().getFullYear()} ThinkCard — Avantech
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string
): Promise<void> {
  const html = buildResetEmailHtml(name, resetLink);

  await transporter.sendMail({
    from: `"ThinkCard" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Redefinição de senha — ThinkCard",
    html,
  });
}
