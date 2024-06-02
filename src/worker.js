import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export default {
  async email(message, env, ctx) {
    const allowList = ["ai@ipfsweb.win"];
    const { from, to } = message
    if (!allowList.includes(to)) {
      message.setReject("Address not allowed");
      return;
    }
    // await message.forward("ipfs@ozapp.mobi");

    const msg = createMimeMessage();
    msg.setHeader("In-Reply-To", message.headers.get("Message-ID"));
    msg.setSender({ name: "Thank you for you contact", addr: to });
    msg.setRecipient(message.from);
    msg.setSubject("Email Routing Auto-reply");
    msg.addMessage({
      contentType: 'text/plain',
      data: `We got your message, your ticket number is ${'2342343'}`
    });

    const replyMessage = new EmailMessage(
      to,
      from,
      msg.asRaw()
    );

    await message.reply(replyMessage);
  }
}