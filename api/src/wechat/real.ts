// 同舟 · 微信公众号网页授权 真实适配器
//
// 流程(微信文档"公众号网页授权"):
//   1. 用户跳转到 open.weixin.qq.com/connect/oauth2/authorize?...#wechat_redirect
//   2. 同意后微信回跳到 redirect_uri?code=&state=
//   3. 用 code 调 api.weixin.qq.com/sns/oauth2/access_token → access_token + openid
//   4. snsapi_userinfo 时再调 api.weixin.qq.com/sns/userinfo → nickname + headimgurl
//
// 错误处理:微信成功 errcode 不出现,失败时 body 有 errcode/errmsg。

import type { WechatProvider, WechatUser } from "./index.js";

const AUTHORIZE = "https://open.weixin.qq.com/connect/oauth2/authorize";
const ACCESS_TOKEN = "https://api.weixin.qq.com/sns/oauth2/access_token";
const USERINFO = "https://api.weixin.qq.com/sns/userinfo";

type TokenResp = {
  access_token?: string;
  openid?: string;
  unionid?: string;
  scope?: string;
  errcode?: number;
  errmsg?: string;
};

type UserInfoResp = {
  openid?: string;
  unionid?: string;
  nickname?: string;
  headimgurl?: string;
  errcode?: number;
  errmsg?: string;
};

export function createRealWechat(opts: {
  appId: string;
  appSecret: string;
}): WechatProvider {
  return {
    driver: "real",

    buildAuthorizeUrl({ redirectUri, state, scope = "snsapi_userinfo" }) {
      const params = new URLSearchParams({
        appid: opts.appId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope,
        state,
      });
      // 微信要求 #wechat_redirect 锚点放在末尾
      return `${AUTHORIZE}?${params.toString()}#wechat_redirect`;
    },

    async exchangeCode(code): Promise<WechatUser> {
      const tokenUrl = new URL(ACCESS_TOKEN);
      tokenUrl.searchParams.set("appid", opts.appId);
      tokenUrl.searchParams.set("secret", opts.appSecret);
      tokenUrl.searchParams.set("code", code);
      tokenUrl.searchParams.set("grant_type", "authorization_code");

      const tokenJson = await fetchJson<TokenResp>(tokenUrl.toString());
      if (tokenJson.errcode || !tokenJson.openid || !tokenJson.access_token) {
        throw new Error(
          `[wechat/real] access_token failed: ${tokenJson.errcode ?? "unknown"} ${
            tokenJson.errmsg ?? ""
          }`,
        );
      }

      const base: WechatUser = {
        openid: tokenJson.openid,
        unionid: tokenJson.unionid,
      };

      // snsapi_base 时 scope 字段为 "snsapi_base",不再拉 userinfo
      if (tokenJson.scope?.includes("snsapi_userinfo")) {
        const infoUrl = new URL(USERINFO);
        infoUrl.searchParams.set("access_token", tokenJson.access_token);
        infoUrl.searchParams.set("openid", tokenJson.openid);
        infoUrl.searchParams.set("lang", "zh_CN");
        const info = await fetchJson<UserInfoResp>(infoUrl.toString());
        if (info.errcode) {
          // 拉 userinfo 失败不影响登录,只是少了昵称头像
          return base;
        }
        return {
          openid: info.openid ?? base.openid,
          unionid: info.unionid ?? base.unionid,
          nickname: info.nickname,
          headimgurl: info.headimgurl,
        };
      }

      return base;
    },
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`[wechat/real] HTTP ${res.status} ${url}`);
  }
  return (await res.json()) as T;
}
