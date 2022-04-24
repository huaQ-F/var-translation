const vscode = require("vscode");
const say = require("say");


// 检测是否中文
function isChinese(text) {
    return /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(text);
}


// 语音播报
function speakText(text) {
    if (vscode.workspace.getConfiguration('varTranslation').get('enableSpeak')) {
        say.stop();
        setTimeout(() => {
            say.speak(text);
        }, 10);
    }
}

// 选中的英文文本清洗干净
function englishClearSelectionText(text) {
    if (/[a-z]/.test(text)) {
        // 有小写字母的组合，全大写的不处理
        // 驼峰替换成空格
        text = text.replace(/([A-Z])/g, " $1");
    }
    // 下划线，连接线，小数点自动替换成空格
    text = text.replace(/_|-|\./g, ' ');
    return text;
}



module.exports = {
    isChinese,
    speakText,
    englishClearSelectionText
};

