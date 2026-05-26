import { FastResponse } from "srvx";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

// FastResponse 优化（srvx 的优化 Response 实现）
globalThis.Response = FastResponse;

// SSR 服务入口
export default createServerEntry({
  fetch(request) {
    return handler.fetch(request);
  },
});
