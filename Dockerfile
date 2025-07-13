FROM OVEN/BUN:1.1

WORKDIR /APP

COPY . .

RUN bun install

RUN bunx prisma generate || true

CMD ["bun", "run", "start"]