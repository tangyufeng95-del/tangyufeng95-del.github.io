/**
 * Utility functions for sending email notifications via Google Gmail Send API
 */

const utf8_to_b64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

/**
 * Encodes an email draft to the raw layout required by Gmail REST API
 */
export const createRawEmail = (to: string, subject: string, bodyHtml: string): string => {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${utf8_to_b64(subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyHtml
  ];
  
  const emailStr = emailLines.join('\r\n');
  return utf8_to_b64(emailStr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Triggers Gmail Send API message delivery using the current user's access token
 */
export const sendGmailMessage = async (accessToken: string, rawBase64: string): Promise<any> => {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64 })
  });

  if (!response.ok) {
    const errMsg = await response.text();
    throw new Error(`Gmail Send API responded with code ${response.status}: ${errMsg}`);
  }

  return response.json();
};
