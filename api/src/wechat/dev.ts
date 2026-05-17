// 同舟 · 微信 Dev 适配器
//
// buildAuthorizeUrl() 返回本地 stub /api/wechat/_dev/authorize?redirect_uri=&state=
//   该路由由 student-auth/routes.ts 在 dev 模式下注册,渲染一个表单让人手填 openid。
//
// exchangeCode("DEV:<openid>:<nickname>:<avatar>") 直接解析返回。无任何网络调用。
//
// Prod 三重护栏的「第二重」:initWechat() 在 prod 已经拒了 dev driver,这里保险起见
// driver 字段也明显标 "dev" 让所有路径都能识别。

import type { WechatProvider, WechatUser } from "./index.js";

const DEV_CODE_PREFIX = "DEV:";

export function createDevWechat(opts: { oauthRedirectBase: string }): WechatProvider {
  return {
    driver: "dev",

    buildAuthorizeUrl({ redirectUri, state }) {
      const u = new URL(`${opts.oauthRedirectBase}/api/wechat/_dev/authorize`);
      u.searchParams.set("redirect_uri", redirectUri);
      u.searchParams.set("state", state);
      return u.toString();
    },

    async exchangeCode(code): Promise<WechatUser> {
      if (!code.startsWith(DEV_CODE_PREFIX)) {
        throw new Error(`[wechat/dev] code must start with ${DEV_CODE_PREFIX}`);
      }
      const [openid, nickname = "", avatar = ""] = code
        .slice(DEV_CODE_PREFIX.length)
        .split(":");
      if (!openid) throw new Error("[wechat/dev] code missing openid");
      return {
        openid,
        nickname: nickname || undefined,
        headimgurl: avatar || undefined,
      };
    },
  };
}

export function devEncodeCode(parts: {
  openid: string;
  nickname?: string;
  avatar?: string;
}): string {
  return `${DEV_CODE_PREFIX}${parts.openid}:${parts.nickname ?? ""}:${
    parts.avatar ?? ""
  }`;
}
