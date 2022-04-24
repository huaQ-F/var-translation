# var-translation
Translate and replace with hump variables, speek English 

[有问题直接报issue](https://github.com/huaQ-F/var-translation/issues) 
```
本插件修改原创 https://github.com/SvenZhao/var-translation
```
## 0.14.39 本插件新增功能
- 添加右键 "选择翻译"
- 添加 youdaoApi (免费)
- 添加 baiduApi (需要申请百度翻译的开发者账号)
- 添加 英文翻译中文显示
- 添加英文朗读
- 添加结果字符串长度控制

### 新增的设置选项
- 在setting.json配置百度api 和 关闭朗读
  "varTranslation.appId": "百度翻译开发者申请的appId",
  "varTranslation.password": "百度翻译开发者申请的password",
  "varTranslation.wordMaxLength":34,  # 翻译结果字符串超出34个字符串则不朗读和省略结果
  "varTranslation.enableSpeak": true,  # true开启朗读(默认)，false关闭朗读

 ## 0.13.37 原作者插件功能 
 ### 指定转换类型命令 
![image2.png](https://s2.loli.net/2022/04/12/JOEYamiZAPMdfcg.png)
### 转换类型命令 设置快捷键
![image.png](https://s2.loli.net/2022/04/12/MvIZTaCiPpr35kA.png)


---
 ## 英文不好 写代起变量时候 你是否一直这样干?
 - 打开翻软件
 - 输入中文
 - 复制翻译结果
 - 粘贴英文修改成相应的命名格式
---

 ## 现在你只需要按动图这样来就可以了
 - 选中输入文案 一键得到翻译结果(悄悄告诉你 直接选中英文还可以跳过翻译哦 快速改变命名格式)
 - 选择响应的命名格式
![feature X](images/vscode1.gif)


 ## 快捷键  
    win: "Alt+shift+t" 
    mac": "cmd+shift+t"
    
 ## 支持的翻译引擎
    谷歌中国 有道 百度
 


## 三个修改的插件
- 扩展选区插件  
[expand-region-vue](https://marketplace.visualstudio.com/items?itemName=huaQ-F.expand-region-vue)

- 用模板右键创建 html、js、vue2、python文件  
[Vue Py Template](https://marketplace.visualstudio.com/items?itemName=huaQ-F.vue2-html-python-template)

- translation 中文翻译转换变量  
[translation 中文翻译转换变量](https://marketplace.visualstudio.com/items?itemName=huaQ-F.translation2var)
