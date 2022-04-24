import {
  window,
  ExtensionContext,
  commands,
  QuickPickItem,
  QuickPickOptions,
  workspace,
} from "vscode";

import {
  camelCase,
  paramCase,
  pascalCase,
  snakeCase,
  constantCase,
  capitalCase,
  dotCase,
  headerCase,
  noCase,
  pathCase,
} from "change-case";
const baiduTranslateApi = require("./lib/baiduapi.js");
const freeApi = require("./lib/freeApi.js");
const {
  isChinese,
  speakText,
  englishClearSelectionText,
} = require("./lib/common.js");

enum EengineType {
  googleFree = "googleFree",
  youdaoFree = "youdaoFree",
  baidu = "baidu",
}
interface IWordResult {
  engine: EengineType;
  srcText: string;
  result: string;
}
/**翻译的内容缓存防止多次请求 */
const translateCacheWords: IWordResult[] = [];
const changeCaseMap = [
  { name: "camelCase", handle: camelCase, description: "camelCase 驼峰(小)" },
  {
    name: "pascalCase",
    handle: pascalCase,
    description: "pascalCase 驼峰(大)",
  },
  { name: "snakeCase", handle: snakeCase, description: "snakeCase 下划线" },
  { name: "paramCase", handle: paramCase, description: "paramCase 中划线(小)" },
  {
    name: "headerCase",
    handle: headerCase,
    description: "headerCase 中划线(大)",
  },
  { name: "noCase", handle: noCase, description: "noCase 分词(小)" },
  {
    name: "capitalCase",
    handle: capitalCase,
    description: "capitalCase 分词(大)",
  },
  { name: "dotCase", handle: dotCase, description: "dotCase 对象属性" },
  { name: "pathCase", handle: pathCase, description: "pathCase 文件路径" },
  {
    name: "constantCase",
    handle: constantCase,
    description: "constantCase 常量",
  },
];

export function activate(context: ExtensionContext) {
  const translation = commands.registerCommand(
    "extension.varTranslation",
    main
  );
  context.subscriptions.push(translation);
  changeCaseMap.forEach((item) => {
    context.subscriptions.push(
      commands.registerCommand(`extension.varTranslation.${item.name}`, () =>
        typeTranslation(item.name)
      )
    );
  });
}
export function deactivate() {}
/**
 * 用户选择选择转换形式
 * @param word 需要转换的单词
 * @return  用户选择
 */
async function vscodeSelect(word: string): Promise<string | undefined> {
  const list: QuickPickItem[] = changeCaseMap.map((item) => ({
    label: item.handle(word),
    description: item.description,
  }));
  const items: QuickPickItem[] = [...list];
  if (englishTranslationItem) {
    items.unshift(englishTranslationItem);
  }
  const opts: QuickPickOptions = {
    matchOnDescription: true,
    placeHolder: "choose replace 选择替换",
  };
  const selections: any = await window.showQuickPick(items, opts);
  if (!selections) {
    return;
  }
  if (selections.outText) {
    let editor: any = window.activeTextEditor;
    let newText = selections.outText;
    editor.edit((editBuilder: string) => {
      editBuilder.replace(editor.selection, newText);
    });
    return;
  }
  return selections.label;
}

/**
 * 获取翻译引起
 */
//英文翻译中文及朗读
var englishTranslationItem: any = null;

function englishTranslation(srcText: string, dst: string) {
  let label = `英译中结果:【 ${srcText} 】=>【 ${dst} 】`;
  englishTranslationItem = {
    label: label,
    description: "",
    dst: dst,
    outText: dst,
  };
}
//中文翻译及朗读
async function getTranslateResult(srcText: string) {
  englishTranslationItem = null;
  var engine: EengineType =
    workspace.getConfiguration("varTranslation").translationEngine;
  const cache = translateCacheWords.find(
    (item: any) => item.engine === engine && item.srcText === srcText
  );
  if (cache) {
    console.log("使用缓存翻译", cache);
    return Promise.resolve(cache.result);
  }

  // 正则快速判断英文
  if (/^[a-zA-Z\d\s\/\-\._]+$/.test(srcText)) {
    const res = await getTranslate(srcText, engine, "en", "zh");
    let { results } = res;
      let outDst = "";
      results.forEach((item: any, index: number) => {
        let dst = decodeURIComponent(item.dst);
        outDst = dst;
      });
      let result = outDst;
    if(result&&result.length <= workspace.getConfiguration("varTranslation").wordMaxLength){
      const sourceResult = englishClearSelectionText(srcText);
      speakText(sourceResult);
      englishTranslation(srcText, result);
    }

    return srcText;
  }
  try {
    window.showQuickPick([{ label: "网络翻译中..." }]);
    console.log(`使用${engine}翻译内容:${srcText}`);
    const res = await getTranslate(srcText, engine);
    let { results } = res;
    let outDst = "";
    results.forEach((item: any, index: number) => {
      let dst = decodeURIComponent(item.dst);
      outDst = dst;
    });

    let result = outDst;
    if(result&&result.length <= workspace.getConfiguration("varTranslation").wordMaxLength){
      // 朗读 翻译的英文
      if (!isChinese(result)) {
        result = englishClearSelectionText(result);
        speakText(result);
      }
      result = result.slice(0,workspace.getConfiguration("varTranslation").wordMaxLength-4)+'...';
    }
    if (result) {
      translateCacheWords.push({ engine, srcText, result });
    }
    return result;
  } catch (error) {
    console.error(error);
    window.showInformationMessage(
      `${engine}翻译异常,请检查网络或稍后重试 ${JSON.stringify(error)}`
    );
    return null;
  }
}
async function main() {
  // 获取编辑器
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  // 获取选中文字
  for (const selection of editor.selections) {
    const selected = editor.document.getText(selection);
    // 获取翻译结果
    const translated = await getTranslateResult(selected);
    if (!translated) {
      return;
    }
    // 组装选项
    const userSelected = await vscodeSelect(translated);
    // 用户选中
    if (!userSelected) {
      return;
    }
    // 替换文案
    editor.edit((builder) => builder.replace(selection, userSelected));
  }
}
const typeTranslation = async (type: string) => {
  const changeCase = changeCaseMap.find((item) => item.name === type);
  if (!changeCase) {
    return;
  }
  // 获取编辑器
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  // 获取选中文字
  for (const selection of editor.selections) {
    const selected = editor.document.getText(selection);
    // 获取翻译结果
    const translated = await getTranslateResult(selected);
    if (!translated) {
      return;
    }
    // 替换文案
    editor.edit((builder) =>
      builder.replace(selection, changeCase.handle(translated))
    );
  }
};

// 显示信息框
function showInformationMessage(message: string, code?: number): any {
  return window
    .showInformationMessage(message, { title: "知道了", code })
    .then((res) => {
      // 点击信息框知道了按钮
    });
}

// 执行翻译
function getTranslate(
  text: string = "",
  engine: EengineType,
  from: string = "zh",
  to: string = "en"
): any {
  return new Promise((resolve: Function, reject: Function) => {
    let apiType =
    workspace.getConfiguration("varTranslation").get("translationEngine")||engine;
    let appid = workspace.getConfiguration("varTranslation").get("appId");
    let password = workspace.getConfiguration("varTranslation").get("password");
    if (apiType === "youdaoFree") {
      // 有道免费接口
      freeApi
        .youdaoFreeApi({ text, from, to, appid, password })
        .then((res: never) => {
          console.log('youdaoFreeApi结果：'+res);
          let data = JSON.parse(res);
          let results: any[] = [];
          data.translateResult.forEach((row: any[]) => {
            for (let i in row) {
              results.push({
                dst: row[i].tgt,
              });
            }
          });
          let params = { text, from, to, results: results || res };
          resolve(params);
        })
        .catch((res: any) => {
          showInformationMessage(res.message || JSON.stringify(res.response));
        });
    } else if (apiType === "googleFree") {
      // 谷歌免费接口
      freeApi
        .googleFreeApi({ text, from, to, appid, password })
        .then((res: any) => {
          console.log('googleFreeApi结果：'+res);

          let data = JSON.parse(res);
          let results: any[] = [];
          data.sentences.forEach((row: any) => {
            results.push({
              dst: row.trans,
            });
          });
          let params = { text, from, to, results: results || res };
          resolve(params);
        })
        .catch((res: any) => {
          showInformationMessage(res.message || JSON.stringify(res.response));
        });
    } else {
      // 以下是注册接口，需要配置id和密钥
      if (!appid || !password) {
        return showInformationMessage(
          "插件参数错误，没有配置appId和password",
          100
        );
      }
      if (apiType === "baidu") {
        // 百度注册接口
        baiduTranslateApi({ text, from, to, appid, password })
          .then((res: any) => {
            console.log('baiduTranslateApi结果：'+res);
            let data = JSON.parse(res);
            let params = { text, from, to, results: data.trans_result || data };
            resolve(params);
          })
          .catch((res: any) => {
            showInformationMessage(res.message || JSON.stringify(res.response));
          });
      }
    }
  });
}
