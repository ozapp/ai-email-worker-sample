import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import PostalMime from 'postal-mime';
import { parse } from 'node-html-parser'

async function streamToArrayBuffer(stream, streamSize) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}


export default {
  async email(message, env, ctx) {
    const allowList = ["ai@ipfsweb.win"];
    const { from, to } = message
    if (!allowList.includes(to)) {
      message.setReject("Address not allowed");
      return;
    }

    const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
    const parser = new PostalMime();
    const parsedEmail = await parser.parse(rawEmail);
    console.log("Mail subject: ", parsedEmail.subject);
    console.log("Mail message ID", parsedEmail.messageId);
    console.log("HTML version of Email: ", parsedEmail.html);
    console.log("Text version of Email: ", parsedEmail.text);
    const html = parse(parsedEmail.html)
    const body = html.querySelector('body').text
    const msg = createMimeMessage();
    msg.setHeader("In-Reply-To", message.headers.get("Message-ID"));
    msg.setSender({ name: "Thank you for you contact", addr: to });
    msg.setRecipient(message.from);
    msg.setSubject("Email Routing Auto-reply");
    msg.addMessage({
      contentType: 'text/plain',
      data: `We got your message, your ticket number is ${body}`
    });

    const replyMessage = new EmailMessage(
      to,
      from,
      msg.asRaw()
    );

    await message.reply(replyMessage);
  }
}