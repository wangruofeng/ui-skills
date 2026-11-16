(() => {
  const zh = !/^\/en(?:\/|$)/.test(location.pathname);
  const words = {
    'Log in to UI Skills':'登录 UI Skills',
    'Continue with GitHub':'使用 GitHub 登录',
    'Sign in | UI Skills':'登录 | UI Skills',
    'My favorites | UI Skills':'我的收藏 | UI Skills',
    'My favorites':'我的收藏',
    'Sign out':'退出登录',
    'Account':'账号',
    'Signing in…':'正在登录…',
    'Sign in to save skills across devices.':'登录后即可跨设备保存与同步技能收藏。',
    'GitHub sign-in is not available yet.':'GitHub 登录暂未配置完成。',
    'Unable to check sign-in. Reload to retry.':'无法检查登录状态，请刷新重试。',
    'Sign-in was not completed. Please try again.':'登录未完成，请重试。',
    'Unable to start sign-in. Please try again.':'无法发起登录，请重试。',
    'Loading favorites…':'正在加载收藏…',
    'Sign in to view your favorites.':'登录后查看你的收藏。',
    'Star a skill to save it here.':'在技能详情点击星标，即可收藏到这里。',
    'Add to favorites':'收藏技能',
    'Remove from favorites':'取消收藏',
    'Remove':'移除',
    'Retry':'重试',
    'Unable to load favorites. Please try again.':'无法加载收藏，请重试。',
    'Unable to update favorites. Please try again.':'无法更新收藏，请重试。',
    'Sign-out failed. Please try again.':'退出登录失败，请重试。',
    'The upstream skill source is currently unavailable. Only the catalog description is shown below.':'上游技能原文目前无法获取，下方仅展示目录简介。',
    'View the original repository':'查看原始仓库','Home':'首页','This link does not exist anymore or was moved.':'此链接已失效或已移动。','Page Not Found | UI Skills':'页面不存在 | UI Skills','Copy to clipboard':'复制到剪贴板',
    'Loading full catalog…':'正在加载完整目录…','Search catalog could not load. Retry':'搜索目录加载失败，点击重试','results':'条结果',
    'Curated skills for design engineering':'为设计工程精选的技能',
    'Skip to main content':'跳到主要内容','Sign in':'登录','Search':'搜索',
    'Search skills and playbook':'搜索技能与实践指南','Search skills and playbook...':'搜索技能与实践指南…',
    'Skills':'技能','New skills':'最新技能','Topics':'主题','Collections':'专题合集','Authors':'作者',
    'Discover':'发现','Resources':'资源','Components':'组件','Design systems':'设计系统','Icons':'图标',
    'Design.md':'Design.md','Learn':'学习','Playbook':'实践指南','Community':'社区','Developers':'开发者',
    'Agents':'编程智能体','Jobs':'原站招聘','Post a job':'原站发布职位','Sponsor':'赞助原站',
    'All topics':'所有主题','All collections':'所有合集','All agents':'所有智能体','All skills':'所有技能','All guides':'所有指南',
    'Popular skills':'热门技能','Run the UI Skills CLI from your terminal.':'在终端运行 UI Skills 命令行工具。',
    'Connect your agent to the UI Skills catalog.':'将你的智能体连接到 UI Skills 技能目录。',
    'Curated skills, guides, and resources for building better interfaces with agents.':'精选技能、指南与资源，帮助你与智能体一起构建更好的界面。',
    'Looking for your next role?':'正在寻找下一份工作？','Browse design + design engineering jobs':'浏览原站的设计与设计工程职位',
    'Stay in the loop':'关注最新动态','Get new UI skills, tools and resources updates':'获取最新 UI 技能、工具与资源动态',
    'Subscribe on the original site':'前往原站订阅','Install':'安装','Copy':'复制','Copied':'已复制','Copy command':'复制命令',
    'Copy skill':'复制技能','Copy markdown':'复制 Markdown','Copied!':'已复制！','Explore':'探索','Overview':'概览',
    'Related skills':'相关技能','Related topics':'相关主题','Related collections':'相关合集','More':'更多',
    'Accessibility':'无障碍','Motion':'动效','Systems':'系统','Visual':'视觉','Interaction':'交互','Performance':'性能',
    'Architecture':'架构','Code quality':'代码质量','Color':'色彩','Debugging':'调试','Frameworks':'框架',
    'Frontend':'前端','Testing':'测试','Tooling':'工具','Typography':'排版','Video':'视频',
    'Previous skill':'上一个技能','Next skill':'下一个技能','Previous skill unavailable':'没有上一个技能','Next skill unavailable':'没有下一个技能',
    'Browse skills':'浏览技能','Browse all skills':'浏览全部技能','View all':'查看全部','View on GitHub':'在 GitHub 查看',
    'Source':'来源','Registry':'注册表','Original':'原文','Back to skills':'返回技能目录',
    'No skills or playbook entries found.':'没有找到相关技能或实践指南。',
    'move':'移动','open':'打开','close':'关闭','Skills for Design Engineers.':'面向设计工程师的精选技能。',
    'UI Skills for Design Engineers | UI Skills':'设计工程技能库 | UI Skills',
    'UI Skills - Skills for Design Engineers':'UI Skills - 设计工程技能库',
    'UI Skills is a collection of design-engineering skills for accessibility, motion, frontend craft, and interface quality.':'UI Skills 精选无障碍、动效、前端开发与界面质量相关的设计工程技能。',
    'Prevent layout shifts':'避免布局偏移','Balance headings':'平衡标题排版','Tabular numbers':'等宽数字','Large touch targets':'足够大的触控区域','Visible focus rings':'清晰的焦点提示','Label form fields':'为表单字段添加标签',
    'Mobile App Design':'移动应用设计','Website Layout':'网站布局','Visual Hierarchy':'视觉层级','Design Principles':'设计原则','Landing Page Design':'落地页设计','Button Design':'按钮设计',
    'Open CLI installation guide':'打开 CLI 安装指南','Open MCP installation guide':'打开 MCP 安装指南','Supported agents':'支持的智能体',
    'Page not found':'页面不存在','Back to home':'返回首页','Go home':'返回首页',
    'Independent open-source mirror by':'独立开源镜像，维护者：','Based on':'基于',
    'Skill content remains in its original language.':'技能正文保留原文。'
  };
  const translate = (text) => {
    const trimmed = text.trim();
    const value = words[trimmed] ?? (/^\d+ results$/.test(trimmed) ? trimmed.replace(' results',' 条结果') : undefined);
    return value ? text.replace(trimmed,value) : text;
  };
  const services = /^\/(?:jobs|sponsor|oauth)(?:\/|$)|^\/mcp(?:\/rpc)?$/;
  function link(value) {
    if (!value?.startsWith('/') || value.startsWith('//')) return value;
    if (services.test(value)) return 'https://www.ui-skills.com' + value;
    if (!zh && !/^\/en(?:\/|$)/.test(value) && !/\.[a-z0-9]+(?:[#?]|$)/i.test(value) && !value.startsWith('/.well-known')) return '/en' + value;
    return value;
  }
  const accountIslands = ['LoginPanel', 'SaveSkillButton', 'SavedSkills', 'AccountMenu'].map(name => `astro-island[component-export="${name}"]`).join(',');
  function visit(root) {
    const element = root.nodeType === 1 ? root : root.parentElement;
    if (element?.closest(accountIslands)) return;
    if(root.nodeType === 3){if(zh && !root.parentElement?.closest('[data-original-content], pre, code, script, style, astro-island[ssr]')) {const value=translate(root.nodeValue);if(value!==root.nodeValue)root.nodeValue=value;}return;}
    if(root.nodeType!==1 && root!==document)return;
    if(root.nodeType===1){
      if(root.matches('[data-language-switch]')) {root.href=(zh?'/en':'')+(location.pathname.replace(/^\/en(?=\/|$)/,'')||'/')+location.search+location.hash;root.textContent=zh?'EN':'中文';root.setAttribute('aria-label',zh?'Switch to English':'切换到中文');return;}
      for(const name of ['href','data-card-href']){if(root.hasAttribute(name)){let v=link(root.getAttribute(name));if(v!==root.getAttribute(name))root.setAttribute(name,v);}}
      if(zh)for(const name of ['aria-label','placeholder','title']){if(root.hasAttribute(name)){let v=translate(root.getAttribute(name));if(v!==root.getAttribute(name))root.setAttribute(name,v);}}
      if(root.matches('script,style,pre,code,[data-original-content]'))return;
    }
    if(root.nodeType===1 && root.matches('astro-island[ssr]'))return;
    [...root.childNodes].forEach(visit);
  }
  if(typeof window==='undefined')return;
  visit(document);
  document.addEventListener("astro:hydrate", e=>visit(e.target),true);
  new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')visit(r.target);else r.addedNodes.forEach(visit);}}).observe(document.body,{subtree:true,childList:true,characterData:true});
  window.__uiSkillsI18n={words,translate};
})();
