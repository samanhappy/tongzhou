// 同舟 · 微信公众号网页授权 适配器门面
//
// 学员侧唯一登录入口。两份实现：
//   - real  接 open.weixin.qq.com / api.weixin.qq.com 真实公众号网页授权
//   - dev   本地 stub:authorize URL 指向我们自己注册的 _dev/wechat 路由,渲染
//           一个 HTML 表单让人手填 openid / nickname / avatar,提交后 302 回 callback。
//           code 形如 "DEV:<openid>:<nickname>:<avatar>",exchangeCode 直接解析。
//
// 选择 V0 走 dev、V0.5 上 real 时,业务/前端无感知。

export type WechatUser = {
  openid: string;
  unionid?: string;
  nickname?: string;
  headimgurl?: string;
};

export interface WechatProvider {
  driver: "dev" | "real";

  /** 浏览器要 302 去的微信 authorize URL */
  buildAuthorizeUrl(args: {
    /** 完整的回调 URL（含 origin） */
    redirectUri: string;
    /** 我们自己的 state（含 csrf + 后续要 redirect 的 next 等） */
    state: string;
    /** snsapi_userinfo 拿昵称头像；snsapi_base 只拿 openid（用于静默重登） */
    scope?: "snsapi_base" | "snsapi_userinfo";
  }): string;

  /** code → openid (+ unionid/nickname/avatar 如果 scope=userinfo) */
  exchangeCode(code: string): Promise<WechatUser>;
}

let _wechat: WechatProvider | null = null;

export function setWechat(w: WechatProvider) {
  _wechat = w;
}

export function getWechat(): WechatProvider {
  if (!_wechat) throw new Error("[wechat] not initialized.");
  return _wechat;
}

export async function initWechat(): Promise<WechatProvider> {
  const { config } = await import("../env.js");
  if (process.env.NODE_ENV === "production" && config.wechat.driver === "dev") {
    throw new Error(
      "[wechat] WECHAT_DRIVER=dev is forbidden in production. Set WECHAT_DRIVER=real and configure WECHAT_APP_ID / WECHAT_APP_SECRET.",
    );
  }
  if (config.wechat.driver === "dev") {
    const { createDevWechat } = await import("./dev.js");
    const w = createDevWechat({
      oauthRedirectBase: config.wechat.oauthRedirectBase,
    });
    setWechat(w);
    return w;
  }
  if (config.wechat.driver === "real") {
    if (!config.wechat.appId || !config.wechat.appSecret) {
      throw new Error(
        "[wechat] WECHAT_DRIVER=real requires WECHAT_APP_ID and WECHAT_APP_SECRET.",
      );
    }
    if (
      process.env.NODE_ENV === "production" &&
      !config.wechat.oauthRedirectBase.startsWith("https://")
    ) {
      throw new Error(
        "[wechat] WECHAT_OAUTH_REDIRECT_BASE must be https:// in production.",
      );
    }
    const { createRealWechat } = await import("./real.js");
    const w = createRealWechat({
      appId: config.wechat.appId,
      appSecret: config.wechat.appSecret,
    });
    setWechat(w);
    return w;
  }
  throw new Error(`[wechat] unknown driver: ${config.wechat.driver}`);
}
