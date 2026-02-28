const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

async function getTransporter() {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return null
  }
  try {
    const nodemailer = await import("nodemailer")
    return nodemailer.default.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  } catch {
    return null
  }
}

export async function sendGuideApprovalEmail(to: string, name: string) {
  const from = process.env.EMAIL_FROM || smtpUser || "no-reply@visitsecure.ci"
  const subject = "Votre compte guide a été approuvé"
  const text = [
    `Bonjour ${name},`,
    "",
    "Votre demande pour devenir guide certifié sur VisitSecure CI a été approuvée par l'administrateur.",
    "",
    "Vous pouvez maintenant vous connecter avec votre adresse e-mail et votre mot de passe, accéder à votre tableau de bord guide, proposer des visites et suivre vos réservations.",
    "",
    "Merci de contribuer à la mise en valeur du patrimoine culturel ivoirien.",
    "",
    "L'équipe VisitSecure CI",
  ].join("\n")

  const html = text
    .split("\n")
    .map((line) => (line === "" ? "<br />" : `<p>${line}</p>`))
    .join("")

  const tx = await getTransporter()

  if (!tx) {
    console.log("[EMAIL:GUIDE_APPROVAL]", { to, from, subject, text })
    return
  }

  await tx.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}

