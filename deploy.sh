#!/usr/bin/env bash
# 同舟 · Ubuntu 一键部署脚本
#
# 用法：
#   ./deploy.sh                 # 用 latest 拉镜像并 up -d
#   ./deploy.sh <sha>           # 用指定 git sha 标签
#   ./deploy.sh --logs          # 部署后跟随日志
#   ./deploy.sh --down          # 停服（保留数据卷）
#   ./deploy.sh --nuke          # 停服 + 删数据卷（危险）
#
# 首次部署：
#   1. 把本仓库 clone 到服务器（或只拷贝 docker-compose.yml / deploy.sh / api/.env.example）
#   2. cp api/.env.example api/.env，按需修改
#   3. 如果 GHCR 镜像是 private：
#        export GHCR_USER=<github 用户名>
#        export GHCR_TOKEN=<具有 read:packages 权限的 PAT>
#        ./deploy.sh
#      镜像设为 public 后则无需登录。

set -euo pipefail

cd "$(dirname "$0")"

IMAGE_TAG="latest"
FOLLOW_LOGS=0
ACTION="up"

for arg in "$@"; do
  case "$arg" in
    --logs) FOLLOW_LOGS=1 ;;
    --down) ACTION="down" ;;
    --nuke) ACTION="nuke" ;;
    --help|-h)
      sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    -*)
      echo "未知参数: $arg" >&2
      exit 1
      ;;
    *)
      IMAGE_TAG="$arg"
      ;;
  esac
done

log() { printf '\033[1;32m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[deploy]\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31m[deploy]\033[0m %s\n' "$*" >&2; exit 1; }

# ─── 0. 前置检查 ─────────────────────────────────────────────
command -v docker >/dev/null || die "未检测到 docker，请先安装：https://docs.docker.com/engine/install/ubuntu/"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  die "未检测到 docker compose 插件，请安装 docker-compose-plugin"
fi

[ -f docker-compose.yml ] || die "当前目录缺少 docker-compose.yml"

# ─── 1. 处理 down / nuke ─────────────────────────────────────
if [ "$ACTION" = "down" ]; then
  log "停止服务（保留数据卷）"
  $COMPOSE down
  exit 0
fi

if [ "$ACTION" = "nuke" ]; then
  warn "即将停止服务并删除数据卷（数据库、上传文件会丢失）"
  read -r -p "确认输入 yes 继续: " ans
  [ "$ans" = "yes" ] || die "已取消"
  $COMPOSE down -v
  exit 0
fi

# ─── 2. .env 检查 ────────────────────────────────────────────
if [ ! -f api/.env ]; then
  if [ -f api/.env.example ]; then
    warn "api/.env 不存在，正在从 api/.env.example 复制；请部署前编辑该文件！"
    cp api/.env.example api/.env
    warn "已生成 api/.env —— 修改完再重新执行 ./deploy.sh"
    exit 1
  else
    die "缺少 api/.env，且未找到 api/.env.example 模板"
  fi
fi

# ─── 3. GHCR 登录（私有镜像才需要） ──────────────────────────
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  log "登录 ghcr.io as $GHCR_USER"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
fi

# ─── 4. 拉镜像 + 启动 ─────────────────────────────────────────
export IMAGE_TAG
log "拉取镜像 (IMAGE_TAG=$IMAGE_TAG)"
$COMPOSE pull

log "启动 / 滚动更新"
$COMPOSE up -d

# ─── 5. 健康检查 ─────────────────────────────────────────────
log "等待服务起来..."
sleep 3
$COMPOSE ps

# 清理悬挂镜像，避免磁盘累积
log "清理 dangling 镜像"
docker image prune -f >/dev/null || true

log "部署完成 ✅"
echo "  app:  http://<server>:3000"
echo "  api:  http://<server>:4100"

if [ "$FOLLOW_LOGS" = "1" ]; then
  log "跟随日志（Ctrl-C 退出）"
  $COMPOSE logs -f --tail=100
fi
