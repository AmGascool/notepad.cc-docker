# 使用较小的基础镜像进行依赖安装和构建
FROM node:14-alpine as builder

# 创建应用目录
WORKDIR /app

# 仅复制构建配置文件
COPY package*.json yarn.lock ./

# 复制应用代码到工作目录
COPY . .

# 先执行 yarn 然后构建
RUN yarn && yarn run build

# 使用一个新的轻量级基础镜像进行运行
FROM node:14-alpine

# 安装仅运行时所需的 PM2
RUN yarn global add pm2

# 从构建阶段复制构建好的文件和运行时必要文件
WORKDIR /app
COPY --from=builder /app .

# 暴露端口
EXPOSE 3000

# 使用pm2启动应用
CMD ["pm2-runtime", "start", "pm2_prod.json"]