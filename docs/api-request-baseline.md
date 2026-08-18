# API 请求迁移基线

本文档定义接入或迁移业务模块时必须遵循的 API 请求、开发代理和本地 Mock 目标契约。它是项目级补充；通用的请求实例、OpenAPI/SDK、数据契约、错误处理和 Query 规则继续遵循目标仓库的工程约定与现有源码契约。

本文件定义迁移完成后的唯一允许形态。当前仍可能存在不符合本文的旧代码、环境变量和测试；它们是待迁移的错误历史，不构成例外、兼容承诺或验收基线。

## 统一浏览器 API 根路径

所有环境中的浏览器请求统一使用：

```text
/dysec/api/<micro-service-name>/<endpoint>
```

浏览器 API 根由 `apps/web/src/constants/api.ts` 的 `API_BASE_PATH` 唯一拥有；其当前 wire-level 值为 `/dysec/api`。业务 Service 只提供以 `/` 开头的相对路径，并由自身追加微服务名和端点；例如 `/<micro-service-name>/<endpoint>`。Service 不得重复拼接 API 根，也不得直接使用网关或服务端绝对地址。

| 职责         | 唯一入口                                           | 目标约束                                                                                                                                                           |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API 根路径   | `apps/web/src/constants/api.ts` 的 `API_BASE_PATH` | 当前值为 `/dysec/api`；请求、Mock 和开发代理都复用常量，不各自维护根路径。                                                                                         |
| 请求实例配置 | `apps/web/src/configs/request.ts`                  | `baseURL` 复用 `API_BASE_PATH`；实例名由 `API_REQUEST_INSTANCE_NAME` 统一维护，不绑定任何业务域；错误回调直接使用请求包公开的 `normalizeError`，不额外包装、解析。 |
| 请求实例导出 | `apps/web/src/services/request.ts` 的 `apiRequest` | 由 `configureRequest()` 初始化；全部业务 Service 复用它，不创建第二个实例或 Axios 客户端。                                                                         |
| 初始化时机   | `apps/web/src/main.tsx`                            | 在应用渲染与业务请求之前调用 `configureRequest()`。                                                                                                                |

请求基础设施继续由 `@dayu-sec/bizlib-request` 的根入口提供。业务模块不得从其底层实现、构建目录或 `@seed-fe/request` 深层导入，也不得绕过 `apiRequest` 直接用 Axios 发起业务 API 请求。

## 所有环境的单一边界与非兼容迁移

无论是本地 Mock、Vite 开发代理、集成环境还是生产网关，浏览器侧唯一的 API 边界都是 `API_BASE_PATH`。微服务名和端点只存在于这个边界之后；模块不得保留或新增独立浏览器基址或独立请求实例。

迁移以当前基线为准，不兼容历史实现：

- 原有按业务域配置的 `baseURL`、独立 `VITE_*` API 地址、独立 Axios 或 `HttpRequest` 实例，均为待删除或替换的历史实现。
- 业务代码、环境变量或第二请求实例中原有按微服务匹配、重写路径或指定上游的代理规则，均为待删除或替换的历史实现。
- 本地联调的唯一路由例外是 `apps/web/proxy.local.jsonc` 中遵循 `proxy.schema.json` 的 `server.proxy.api`；它由 `getProxyConfig()` 统一装配，不改变浏览器 API 根、业务 Service 或请求实例。
- 断言旧路径、业务专属代理或独立请求实例的测试，均为待迁移的错误历史；迁移后应改写为当前浏览器边界和本地代理配置契约的测试。
- 旧实现和遗留测试只用于定位迁移范围，不能作为兼容性要求、回归基线或验收条件。新实现不得通过双写请求、fallback 路径、兼容开关或第二套基础设施让它们继续成立。

开发期浏览器路径和业务 Service 调用方式始终一致。`getProxyConfig()` 先装配 `proxy.local.jsonc` 的本地规则；未被本地规则接管的请求，才由 `API_BASE_PATH` 派生的网关规则处理。未配置本地规则和网关时，当前 Vite 进程可进入 Mock-only 模式。

## 业务模块迁移规则

1. 先确认每个端点的 OpenAPI 文档或已安装 SDK/API 物料；同一端点只保留一个调用真源。
2. 将调用放在 `apps/web/src/services/<domain>/` 的明确业务文件中。页面、组件和 TanStack Query 的 query function 不直接拼 HTTP 路径。
3. 调用 `apiRequest` 时只提供 `/<micro-service-name>/<endpoint>`。不要加入 `API_BASE_PATH` 的当前值、`/api`、`/api/v1`、`VITE_APP_BASE`，也不要自行处理重复斜杠。
4. 沿用已有请求实例的认证、语言、超时、拦截器、错误标准化与认证失败处理；模块不得重新注册同名实例、拦截器或全局错误提示。
5. 需要 SDK 适配时，将当前的 live `apiRequest` 作为 SDK 的 `HttpClient` 薄适配来源；不要新增第二套请求配置或 SDK 全局 client 所有权。

如发现已有模块不符合本节路径，先确认其实际契约和迁移范围，再删除或改写旧实现与其测试；不要通过保留旧根路径、双写请求、fallback 路径、兼容开关或业务专属代理制造兼容分支。

## Vite 开发代理与多微服务本地联调

开发代理的唯一实现是 `apps/web/proxy.ts` 中的 `getProxyConfig()`：

- 开发者本地联调统一在 Git 忽略的 `apps/web/proxy.local.jsonc` 的 `"server.proxy.api"` 中声明浏览器路径 key 和 target；字段契约以 `proxy.schema.json` 为准。源码兼容读取 `proxy.local.json`，但它不是开发者主配置入口。
- `getProxyConfig()` 按路径 key 的字符串长度从长到短装配本地规则；相同长度保留声明顺序。开发者可以配置包括 `API_BASE_PATH` 当前值在内的任意路径，其覆盖范围由配置者负责。
- 大多数本地服务只配置路径 key 和 `target`，完整请求路径会原样转发；只有本地后端不接收完整浏览器路径时才配置 `{ "pattern": string, "replacement": string }` 正则 `rewrite`，v1 不支持正则 flags。
- `getProxyConfig()` 在没有本地 API 根规则时，才使用非空 `DEV_API_URL` 创建 `${API_BASE_PATH}/` 网关兜底规则；`DEV_API_TOKEN` 仅作用于该规则。两者均是 Vite 进程内部配置，不是业务 Service 或本地服务配置入口。
- 未配置本地代理文件和网关时，返回空代理配置，Mock-only 开发模式不能形成自代理。删除或注释本地规则后，未命中的请求会继续按当前网关/Mock 配置处理。
- 本地配置文件变化后 Vite 自动重启并重新读取规则。开发服务器按实际匹配顺序输出全部 API 代理的路径 key 与脱敏 target origin，不区分本地、线上或兜底用途；没有任何代理规则时提示未配置 API 网关。HTTP 响应使用 `X-Dev-Proxy-Target` 和 `X-Dev-Proxy-Rule` 标明命中规则，不向浏览器暴露完整 target、Token 或请求头。
- `DEV_API_URL` 与可选的 `DEV_API_TOKEN` 都是仅供 Vite 进程读取的开发变量；后者仅在去除首尾空白后以 `Bearer` 请求头转发至网关。两者不得改为 `VITE_*`，不得在浏览器代码中读取，也不得提交真实地址或凭据。

## 本地 Mock

- Vite 中 `mockDevServerPlugin` 的 `prefix` 必须复用 `API_BASE_PATH`，且始终注册，不按 `DEV_API_URL` 是否配置整体开关；它与 `server.proxy`（本地规则或网关兜底规则）共存。
- Mock 端点使用 `apps/web/mock/defineMock.ts` 导出的 `defineMock`。它负责补齐 API 根路径；入口中的 `url` 只写 `/<micro-service-name>/<endpoint>`，不得再次写 `/dysec/api`。
- 单个端点是否被 Mock 拦截由该条 `defineMock` 记录自身的 `enabled` 字段决定（默认 `true`）；后端就绪后把对应端点显式设置 `enabled: false`，请求会自动透传给当前 `server.proxy`，不需要改动 Vite 配置或删除 mock 文件。没有匹配到任何已启用 mock 记录的请求同样会自动透传。
- Mock 只在开发服务器侧匹配并返回 wire-level 响应；它不初始化请求实例、不调用业务 Service 或 SDK，也不替代业务 Service 的错误和状态处理。
- 每次新增或迁移 Mock，都要用实际业务 Service 调用验证完整 URL、method、query、body 和响应命中，而不只验证手工构造的 HTTP 请求。

## 变更验证

按实际影响范围运行已有命令：

```text
pnpm check
pnpm lint
pnpm format-check
pnpm test
pnpm build
```

修改 `apps/web/proxy.ts` 或本地配置监听时，同时覆盖并通过目标应用的代理合同测试：双文件优先级、最长前缀、可选正则重写、常量派生网关、认证隔离、代理概要、响应标识和真实 Vite 本地转发。修改 Vite Mock 配置、`apps/web/mock/defineMock.ts` 或 Mock 端点时，还应启动开发服务器，验证至少一条真实业务 Service 请求能命中预期 Mock。

完成迁移后，定向检查变更范围不得重新引入 `/api/v1`、旧 `/api/` 代理匹配、业务专属代理、独立浏览器基址、独立请求实例、`/api/api`、重复 `/dysec` 或 API 根路径的重复斜杠。删除或改写断言这些历史行为的遗留测试，并以当前统一网关路径替代它们。
