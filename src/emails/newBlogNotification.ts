import { renderEmailLayout } from "./layout";
import { escapeHtml } from "../utils/escapeHtml";

export function newBlogNotificationEmail(params: {
  title: string;
  excerpt: string;
  url: string;
  coverImage?: string | null;
}): { subject: string; html: string } {
  const subject = `New on Aramway: ${params.title}`;
  const title = escapeHtml(params.title);
  const excerpt = escapeHtml(params.excerpt);

  const coverImageHtml = params.coverImage
    ? `
      <tr>
        <td style="padding: 0 0 20px;">
          <img src="${params.coverImage}" alt="${title}" width="100%"
               style="display: block; width: 100%; max-width: 528px; border-radius: 12px;" />
        </td>
      </tr>`
    : "";

  const html = renderEmailLayout({
    preheader: `${params.title} — new on the Aramway blog.`,
    heading: "There's a new post on Aramway 📰",
    bodyHtml: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${coverImageHtml}
        <tr>
          <td>
            <p style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #0c0903;">${title}</p>
            <p style="margin: 0;">${excerpt}</p>
          </td>
        </tr>
      </table>
    `,
    ctaLabel: "Read the Full Article",
    ctaUrl: params.url,
  });

  return { subject, html };
}
