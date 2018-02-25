module.exports ={
    log(){
      console.log('элогированиеэ');
    },
    debug(obj={}) {
        return JSON.stringify(obj,null,4);
    },
    getId(msg) {
        return msg.chat.id;
    }
};
