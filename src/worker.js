export default {
  async email(message, env, ctx) {
    const allowList = ["ai@ipfsweb.win"];
    if (!allowList.includes(message.to)) {
      message.setReject("Address not allowed");  
      return;
    }
    await message.forward("ipfs@ozapp.mobi");
  }
}